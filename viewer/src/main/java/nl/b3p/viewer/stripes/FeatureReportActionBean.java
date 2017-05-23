/*
 * Copyright (C) 2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.stripes;

import com.vividsolutions.jts.geom.Geometry;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ErrorResolution;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.util.FeatureToJson;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.identity.FeatureIdImpl;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.json.JSONArray;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.geometry.BoundingBox;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Mark Prins
 */
@UrlBinding("/action/featurereport")
@StrictBinding
public class FeatureReportActionBean implements ActionBean {

    private static final Log LOG = LogFactory.getLog(FeatureReportActionBean.class);

    public static final String FID = FeatureInfoActionBean.FID;

    private static final String DEFAULT_REPORT_TEMPLATE = "FeatureReport.xsl";

    private static final int TIMEOUT = 5000;

    private ActionBeanContext context;

    @Validate
    private ApplicationLayer appLayer;

//    /**
//     * WKT of point clicked for featureinfo.
//     */
//    @Validate
//    private String wktClicked;
    /**
     * feature id for report.
     */
    @Validate
    private String fid;

//    /**
//     * xsl template.
//     */
//    @Validate
//    private String template;
//    /**
//     * overview json object.
//     */
//    @Validate
//    private String overview;
//    /**
//     * view json object.
//     */
//    @Validate
//    private String view;
//    /**
//     * legends json
//     */
//    @Validate
//    private String legends;
    /**
     * printparams json
     */
    @Validate
    private String printparams;

    private boolean unauthorized;
    private Layer layer = null;

    @Before(stages = LifecycleStage.EventHandling)
    public void checkAuthorization() {
        if (appLayer == null
                || !Authorizations.isLayerReadAuthorized(layer, context.getRequest(), Stripersist.getEntityManager())) {
            unauthorized = true;
        }
    }

    @After(stages = LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        this.layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(), Stripersist.getEntityManager());
    }

    /**
     * Create a PDF print for the given feature. This forwards to
     * {@link PrintActionBean} after modifying the params object.
     *
     * @throws URISyntaxException if getting the image fails in the
     * printgenerator
     * @throws IOException if saving the image fails in the printgenerator
     * @throws Exception when setting the InfoText on the PrintExtraInfo fails
     *
     * @return PDF as requested
     */
    @DefaultHandler
    public Resolution print() throws URISyntaxException, IOException, Exception {
        LOG.debug("start processing print request");
        if (appLayer == null) {
            return new ErrorResolution(500, "Invalid parameters");
        } else if (unauthorized) {
            return new ErrorResolution(403, "Not authorized");
        } else {
            JSONObject params = new JSONObject(printparams);

            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
            FeatureSource fs = layer.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
            String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();
            Filter fidFilter = ff.id(new FeatureIdImpl(this.fid));

            // set (buffered) bbox from feature
            BoundingBox b = this.getExtent(fs, fidFilter);
            params.put("bbox", b.getMinX() + "," + b.getMinY() + "," + b.getMaxX() + "," + b.getMaxY());

            // add highlighted feature geometry
            Geometry geom = this.getGeometry(fs, fidFilter);
            if (geom != null) {
                JSONObject wktGeom = new JSONObject();
                wktGeom.put("_wktgeom", geom.toText());
                wktGeom.put("color", "FF00FF");
                wktGeom.put("label", "Geselecteerd object: " + this.fid.replace(layer.getFeatureType().getTypeName() + ".", ""));
                wktGeom.put("strokeWidth", 8);
                params.getJSONArray("geometries").put(wktGeom);
            }

            List<Long> attributesToInclude = new ArrayList<>();
            // get feature data
            List<ConfiguredAttribute> attrs = appLayer.getAttributes(layer.getFeatureType(), true);
            attrs.forEach((attr) -> {
                attributesToInclude.add(attr.getId());
            });

            Query q = new Query(fs.getName().toString());
            q.setFilter(fidFilter);
            q.setMaxFeatures(1);
            q.setHandle("FeatureReportActionBean_attributes");

            FeatureToJson ftjson = new FeatureToJson(false, false, false, attributesToInclude);
            JSONArray features = ftjson.getJSONFeatures(appLayer, layer.getFeatureType(), fs, q, null, null);
            // remove __fid and geometry from json and add to extra data
            JSONObject jFeat = features.getJSONObject(0);
            jFeat.remove(FID);
            jFeat.remove(geomAttribute);

            JSONObject extra = new JSONObject();
            extra.put("className", "feature").put("componentName", "report").put("info", jFeat);
            params.getJSONArray("extra").put(extra);

            // related
            if (layer.getFeatureType().hasRelations()) {
                for (FeatureTypeRelation rel : layer.getFeatureType().getRelations()) {
                    SimpleFeatureType f = rel.getForeignFeatureType();
                    LOG.debug("related featuretype: " + f.getTypeName());
                    List<FeatureTypeRelationKey> keys = rel.getRelationKeys();
                    LOG.debug(keys);
                    JSONObject jRel = rel.toJSONObject();
                    LOG.debug(jRel);
                }
            }

            extra = new JSONObject();
            extra.put("className", "related").put("componentName", "report A" /*replace with related FT name*/).put("info", jFeat);
            params.getJSONArray("extra").put(extra);

            extra = new JSONObject();
            extra.put("className", "related").put("componentName", "report B" /*replace with related FT name*/).put("info", jFeat);
            params.getJSONArray("extra").put(extra);

            fs.getDataStore().dispose();

            LOG.debug("JSON params to be passed to printing: " + params);
            return new ForwardResolution(PrintActionBean.class, "print").addParameter("params", params.toString());
        }
    }

    /**
     * determine the extent to be printed based on a buffered version of the
     * feature.
     *
     * @param fs datasource
     * @param f filter to be used for retrieving the feature
     * @return a bbox to be set on the print request
     * @throws CQLException if the filter is invalid
     * @throws IOException if retrieving the data fails
     */
    private BoundingBox getExtent(FeatureSource fs, Filter f) throws CQLException, IOException {
        Query q = new Query(fs.getName().toString());
        q.setFilter(f);
        q.setHandle("FeatureReportActionBean_extent-query");
        q.setMaxFeatures(1);
        q.setPropertyNames(new String[]{fs.getSchema().getGeometryDescriptor().getName().toString()});

        // HACK
        // we would like to use:
        //    BoundingBox extent = feats.getBounds();
        // but this fails for WFS because
        // org.geotools.data.wfs.v1_0_0.WFSFeatureStore actually returns the bounds of the
        // org.geotools.data.wfs.v1_0_0.FeatureSetDescription thus igoring the query
        // so use a visitor instead (GT-WFS-NG may handle this better than the deprecated 
        // and no longer used GT-WFS that this code was written for initially)
        // SimpleFeatureCollection feats = (SimpleFeatureCollection) fs.getFeatures(q);
        // BoundsVisitor bounds = new BoundsVisitor();
        // feats.accepts(bounds, null);
        // BoundingBox extent = bounds.getBounds();
        BoundingBox extent = fs.getBounds(q);
        // from the API: It is possible that this method will return null if the calculation 
        // of bounds is judged to be too costly by the implementing class. In this case,
        // you might call getFeatures(query).getBounds() instead.
        LOG.debug("feature extent " + extent);

//        if (extent.getSpan(0) < 5 || extent.getSpan(1) < 5) {
//            // enlarge the extent if smaller than the limit of 5 (meter) eg. a single point or line
//            Geometry geom = JTS.toGeometry(extent).buffer(5);
//            extent = new ReferencedEnvelope(geom.getEnvelopeInternal(), extent.getCoordinateReferenceSystem());
//        }
        // buffer extent with 50m or 10% whatever is greatest
        double buffer = Math.max(50, 0.1 * Math.max(extent.getWidth(), extent.getHeight()));
        Geometry geom = JTS.toGeometry(extent).buffer(buffer);
        extent = new ReferencedEnvelope(geom.getEnvelopeInternal(), extent.getCoordinateReferenceSystem());
        LOG.debug("enlarged extent" + extent + "was buffered with: " + buffer);

        return extent;
    }

    /**
     * retrieve the feature geometry from the datasource.
     *
     * @param fs datasource
     * @param f filter to be used for retrieving the feature
     * @return the feature's (default) geometry or possibly null
     * @throws CQLException if the filter is invalid
     * @throws IOException if retrieving the data fails
     */
    private Geometry getGeometry(FeatureSource fs, Filter f) throws CQLException, IOException {
        Geometry geom = null;

        Query q = new Query(fs.getName().toString());
        q.setFilter(f);
        q.setHandle("FeatureReportActionBean_geom-query");
        q.setMaxFeatures(1);
        q.setPropertyNames(new String[]{fs.getSchema().getGeometryDescriptor().getName().toString()});

        SimpleFeatureCollection feats = (SimpleFeatureCollection) fs.getFeatures(q);
        while (feats.features().hasNext()) {
            geom = (Geometry) feats.features().next().getDefaultGeometry();
            // even if there are more than one, only return the first
            break;
        }
        return geom;
    }

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public String getFid() {
        return fid;
    }

    public void setFid(String fid) {
        this.fid = fid;
    }

    public String getPrintparams() {
        return printparams;
    }

    public void setPrintparams(String printparams) {
        this.printparams = printparams;
    }

//    public String getWktClicked() {
//        return wktClicked;
//    }
//
//    public void setWktClicked(String wktClicked) {
//        this.wktClicked = wktClicked;
//    }
//
//    public String getTemplate() {
//        return template;
//    }
//
//    public void setTemplate(String template) {
//        this.template = template;
//    }
//
//    public String getOverview() {
//        return overview;
//    }
//
//    public void setOverview(String overview) {
//        this.overview = overview;
//    }
//
//    public String getView() {
//        return view;
//    }
//
//    public void setView(String view) {
//        this.view = view;
//    }
//
//    public String getLegends() {
//        return legends;
//    }
//
//    public void setLegends(String legends) {
//        this.legends = legends;
//    }
    //</editor-fold>
}
