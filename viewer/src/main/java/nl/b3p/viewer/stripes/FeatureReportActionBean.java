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

import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.simplify.TopologyPreservingSimplifier;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.util.FeaturePropertiesArrayHelper;
import nl.b3p.viewer.util.FeatureToJson;
import nl.b3p.viewer.util.FlamingoCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.feature.visitor.BoundsVisitor;
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

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URISyntaxException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Mark Prins
 */
@UrlBinding("/action/featurereport")
@StrictBinding
public class FeatureReportActionBean extends LocalizableApplicationActionBean implements ActionBean {

    private static final Log LOG = LogFactory.getLog(FeatureReportActionBean.class);

    public static final String FID = FeatureInfoActionBean.FID;

    private static final int TIMEOUT = 5000;

    @Validate
    private ApplicationLayer appLayer;
    private Layer layer = null;
    private boolean unauthorized;
    private ActionBeanContext context;

    /**
     * feature id to report.
     */
    @Validate
    private String fid;

    @Validate
    private Application application;


    /**
     * max. number of related features to retrieve.
     */
    @Validate
    private int maxrelatedfeatures = 10;

    /**
     * printparams json.
     */
    @Validate
    private String printparams;

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
     * Create a PDF print for the given feature. This method forwards to
     * {@link PrintActionBean} after modifying the params object; modifications
     * include setting a proper bbox for the selected object, add a highlighted
     * version of the object as an overlay, add feature data and add releted
     * feature data.
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
        LOG.debug("Start processing feature report request voor FID: " + this.fid);
        if (appLayer == null) {
            return new ErrorResolution(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid parameters");
        } else if (unauthorized) {
            return new ErrorResolution(HttpServletResponse.SC_FORBIDDEN, "Not authorized");
        } else {
            JSONObject params = new JSONObject(printparams);

            FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
            FeatureSource fs = layer.getFeatureType().openGeoToolsFeatureSource(TIMEOUT);
            String geomAttribute = fs.getSchema().getGeometryDescriptor().getLocalName();
            Filter fidFilter = ff.id(new FeatureIdImpl(this.fid.substring(this.fid.indexOf(".")+1)));

            // set (buffered) bbox from feature
            BoundingBox b = this.getExtent(fs, fidFilter);
            params.put("bbox", b.getMinX() + "," + b.getMinY() + "," + b.getMaxX() + "," + b.getMaxY());

            // add highlighted feature geometry
            Geometry geom = this.getGeometry(fs, fidFilter);
            if (geom != null) {
                JSONObject wktGeom = new JSONObject();
                String geomTxt = geom.toText();
                Geometry bbox = geom.getEnvelope();
                int megabytes = (2097152/* 2MB is the default tomcat max post size */ - 100 * 1024);
                double simplify = 1.0;
                String geomModified = "";
                while (geomTxt.getBytes("UTF-8").length > megabytes && simplify < 9999) {
                    // start simplifying to reduce size, start of with 1 and
                    // each iteration multiply with 10, max 4 steps, so [1,10, 100, 1000]
                    // if geom still too large bail out and use bbox
                    LOG.debug("Simplify selected feature geometry with distance of: " + simplify);
                    geomModified = getBundle().getString("viewer.featurereportactionbean.modified");
                    geom = TopologyPreservingSimplifier.simplify(geom, simplify);
                    geomTxt = geom.toText();
                    simplify = 10 * simplify;
                }
                if (simplify > 9999) {
                    wktGeom.put("_wktgeom", bbox.toText());
                } else {
                    wktGeom.put("_wktgeom", geomTxt);
                }
                wktGeom.put("color", "FF00FF");
                wktGeom.put("label", 
                        MessageFormat.format(getBundle().getString("viewer.featurereportactionbean.mm"), 
                        this.fid.replace(layer.getFeatureType().getTypeName() + ".", ""), 
                        geomModified));
                wktGeom.put("strokeWidth", 8);
                params.getJSONArray("geometries").put(wktGeom);
            }

            // get feature data
            List<Long> attributesToInclude = new ArrayList<>();
            List<ConfiguredAttribute> attrs = appLayer.getAttributes(layer.getFeatureType(), true);
            attrs.forEach((attr) -> {
                attributesToInclude.add(attr.getId());
            });

            Query q = new Query(fs.getName().toString(), fidFilter);
            q.setMaxFeatures(1);
            q.setHandle("FeatureReportActionBean_attributes");

            EntityManager em  = Stripersist.getEntityManager();
            FeatureToJson ftjson = new FeatureToJson(false, false, false, true, false, attributesToInclude, true);
            JSONArray features = ftjson.getJSONFeatures(appLayer, layer.getFeatureType(), fs, q, em, application, context.getRequest());

            // if there are more than one something is very wrong in datamodel or datasource
            JSONArray jFeat = features.getJSONArray(0);
            // remove __fid, related_featuretypes and geometry nodes from json and add feature attrs to extra data
            FeaturePropertiesArrayHelper.removeKey(jFeat, FID);
            FeaturePropertiesArrayHelper.removeKey(jFeat, geomAttribute);
            FeaturePropertiesArrayHelper.removeKey(jFeat, "related_featuretypes");

            JSONObject extra = new JSONObject();
            extra.put("className", "feature").put("componentName", "report").put("info", jFeat);
            params.getJSONArray("extra").put(extra);
            fs.getDataStore().dispose();

            // get related features and add to extra data
            if (layer.getFeatureType().hasRelations()) {
                String label;
                ftjson = new FeatureToJson(false, false, false, true, true, attributesToInclude, true);
                for (FeatureTypeRelation rel : layer.getFeatureType().getRelations()) {
                    if (rel.getType().equals(FeatureTypeRelation.RELATE)) {
                        SimpleFeatureType fType = rel.getForeignFeatureType();
                        label = fType.getDescription() == null ? fType.getTypeName() : fType.getDescription();
                        LOG.debug("Processing related featuretype: " + label);

                        List<FeatureTypeRelationKey> keys = rel.getRelationKeys();
                        String leftSide = keys.get(0).getLeftSide().getName();
                        String rightSide = keys.get(0).getRightSide().getName();
                        
                        JSONObject info = new JSONObject();
                        if (FeaturePropertiesArrayHelper.containsKey(jFeat, leftSide) || FeaturePropertiesArrayHelper.containsKey(jFeat, keys.get(0).getLeftSide().getAlias())) {
                            if (!FeaturePropertiesArrayHelper.containsKey(jFeat, leftSide)) {
                                leftSide = keys.get(0).getLeftSide().getAlias();
                            }
                            String type = keys.get(0).getLeftSide().getExtJSType();
                            String query = rightSide + "=";
                            if (type.equalsIgnoreCase("string")
                                    || type.equalsIgnoreCase("date")
                                    || type.equalsIgnoreCase("auto")) {
                                query += "'" + FeaturePropertiesArrayHelper.getByKey(jFeat, leftSide) + "'";
                            } else {
                                query += FeaturePropertiesArrayHelper.getByKey(jFeat, leftSide);
                            }

                            // collect related feature attributes
                            q = new Query(fType.getTypeName(), FlamingoCQL.toFilter(query, em));
                            q.setMaxFeatures(this.maxrelatedfeatures + 1);
                            q.setHandle("FeatureReportActionBean_related_attributes");
                            LOG.debug("Related features query: " + q);

                            fs = fType.openGeoToolsFeatureSource(TIMEOUT);
                            features = ftjson.getJSONFeatures(appLayer, fType, fs, q, em, application, context.getRequest());

                            JSONArray jsonFeats = new JSONArray();
                            int featureCount;
                            int colCount = 0;
                            int numFeats = features.length();
                            int maxFeatures = Math.min(numFeats, this.maxrelatedfeatures);
                            for (featureCount = 0; featureCount < maxFeatures; featureCount++) {
                                // remove FID
                                JSONArray feat = features.getJSONArray(featureCount);
                                FeaturePropertiesArrayHelper.removeKey(feat, FID);//.remove(FID);
                                colCount = feat.length();
                                jsonFeats.put(feat);
                            }
                            info.put("features", jsonFeats);
                            info.putOnce("colCount", colCount);
                            info.putOnce("rowCount", featureCount);

                            if (numFeats > this.maxrelatedfeatures) {
                                String msg = MessageFormat.format(getBundle().getString("viewer.featurereportactionbean.moreitems"), this.maxrelatedfeatures);
                                info.putOnce("moreMessage", msg);
                            }
                        } else {
                            String msg = MessageFormat.format(getBundle().getString("viewer.featurereportactionbean.columnmissing"), leftSide);
                            info.putOnce("errorMessage", msg);
                        }
                        
                        extra = new JSONObject()
                                .put("className", "related")
                                .put("componentName", label)
                                .put("info", info);

                        params.getJSONArray("extra").put(extra);
                        LOG.debug("extra data: " + extra);

                        fs.getDataStore().dispose();
                    }
                }
            }

            LOG.debug("Forwarding feature report request to print using params: " + params);
            return new ForwardResolution(PrintActionBean.class, "print")
                    .addParameter("params", params.toString());
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
        Query q = new Query(fs.getName().toString(), f);
        q.setHandle("FeatureReportActionBean_extent-query");
        q.setMaxFeatures(1);
        q.setPropertyNames(new String[]{fs.getSchema().getGeometryDescriptor().getName().toString()});

        SimpleFeatureCollection feats = (SimpleFeatureCollection) fs.getFeatures(q);
        BoundsVisitor bounds = new BoundsVisitor();
        feats.accepts(bounds, null);
        BoundingBox extent = bounds.getBounds();
        LOG.debug("feature extent: " + extent);

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

        Query q = new Query(fs.getName().toString(), f);
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

    public int getMaxrelatedfeatures() {
        return maxrelatedfeatures;
    }

    public void setMaxrelatedfeatures(int maxrelatedfeatures) {
        this.maxrelatedfeatures = maxrelatedfeatures;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }
//</editor-fold>
}
