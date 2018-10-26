/*
 * Copyright (C) 2016 B3Partners B.V.
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
import java.io.StringReader;
import java.util.ResourceBundle;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.util.FeatureToJson;
import nl.b3p.viewer.util.FlamingoCQL;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.visitor.BoundsVisitor;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.geometry.BoundingBox;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;

/**
 * Determines the extent of one or more features. Note that feaurure ids must be
 * consistent across requests; eg. geoserver will 'invent' feature ids on a per
 * request basis if no primary key or unique index was discovered in the feature
 * type, this can happen when using views.
 *
 * @author mprins
 */
@UrlBinding("/action/extent")
@StrictBinding
public class FeatureExtentActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(FeatureExtentActionBean.class);

    private ActionBeanContext context;
    private ResourceBundle bundle;
    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
    }

    /**
     * An ECQL filter to retrieve the features.
     */
    @Validate
    private String filter;

    /**
     * the application layer to get the features from.
     */
    @Validate
    private ApplicationLayer appLayer;

    /**
     * Buffer distance in mapping units.
     */
    @Validate
    private int buffer;

    private Layer layer;
    private boolean unauthorized;

    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }

    @After(stages = LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        this.layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(), Stripersist.getEntityManager());
    }

    @Before(stages = LifecycleStage.EventHandling)
    public void checkAuthorization() {
        if (appLayer == null
                || !Authorizations.isLayerReadAuthorized(layer, context.getRequest(), Stripersist.getEntityManager())) {
            unauthorized = true;
        }
    }

    /**
     * retrieve the extent of the selected features.
     *
     * @return the extent of the requested features
     * @throws JSONException if any
     */
    public Resolution extent() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);
        String error = null;

        if (appLayer == null || filter == null) {
            error = getBundle().getString("viewer.featureextentactionbean.1");
        } else if (unauthorized) {
            error = getBundle().getString("viewer.featureextentactionbean.2");
        } else {
            FeatureSource fs = null;
            try {
                fs = this.layer.getFeatureType().openGeoToolsFeatureSource();
                BoundingBox extent = this.getExtent(fs, Stripersist.getEntityManager());
                JSONObject e = new JSONObject();
                e.put("minx", extent.getMinX());
                e.put("miny", extent.getMinY());
                e.put("maxx", extent.getMaxX());
                e.put("maxy", extent.getMaxY());
                json.put("extent", e);
                json.put("success", Boolean.TRUE);
            } catch (CQLException c) {
                error = c.getLocalizedMessage();
                log.error(error, c);
            } catch (IOException io) {
                error = io.getLocalizedMessage();
                log.error(error, io);
            } catch (Exception ex) {
                error = ex.getLocalizedMessage();
                log.error(error, ex);
            } finally {
                if (fs != null) {
                    fs.getDataStore().dispose();
                }
            }
        }
        if (error != null) {
            json.put("error", error);
        }

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    private BoundingBox getExtent(FeatureSource fs, EntityManager em) throws CQLException, IOException {
        Filter f = FlamingoCQL.toFilter(this.filter, em);
        Query q = new Query(fs.getName().toString());
        q.setFilter(f);
        q.setHandle("extent-query");
        q.setMaxFeatures(FeatureToJson.MAX_FEATURES);
        q.setPropertyNames(new String[]{fs.getSchema().getGeometryDescriptor().getName().toString()});
        SimpleFeatureCollection feats = (SimpleFeatureCollection) fs.getFeatures(q);
        // HACK
        // we would like to use:
        //    BoundingBox extent = feats.getBounds();
        // but this fails for WFS because
        // org.geotools.data.wfs.v1_0_0.WFSFeatureStore actually returns the bounds of the
        // org.geotools.data.wfs.v1_0_0.FeatureSetDescription thus igoring the query
        // so use a visitor instead (GT-WFS-NG may handle this better than the deprecated GT-WFS)
        BoundsVisitor bounds = new BoundsVisitor();
        feats.accepts(bounds, null);
        BoundingBox extent = bounds.getBounds();
        log.debug("feature(s) extent " + extent);

        if (extent.getSpan(0) < 5 || extent.getSpan(1) < 5) {
            // enlarge the extent if smaller than the limit  of 5 (meter) eg. a single point or line
            Geometry geom = JTS.toGeometry(extent).buffer(5);
            extent = new ReferencedEnvelope(geom.getEnvelopeInternal(), extent.getCoordinateReferenceSystem());
            log.debug("enlarged extent" + extent);
        }

        if (buffer > 0) {
            log.debug("enlarging extent using buffer distance: " + buffer);
            Geometry geom = JTS.toGeometry(extent).buffer(buffer);
            extent = new ReferencedEnvelope(geom.getEnvelopeInternal(), extent.getCoordinateReferenceSystem());
            log.debug("buffered extent" + extent);
        }
        return extent;
    }

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public int getBuffer() {
        return buffer;
    }

    public void setBuffer(int buffer) {
        this.buffer = buffer;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    @Override
    public ActionBeanContext getContext() {
        return context;
    }
     //</editor-fold>
}
