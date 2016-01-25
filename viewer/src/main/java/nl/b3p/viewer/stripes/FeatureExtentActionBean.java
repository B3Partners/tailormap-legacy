/*
 * Copyright (C) 2016 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package nl.b3p.viewer.stripes;

import com.vividsolutions.jts.geom.Geometry;
import java.io.IOException;
import java.io.StringReader;
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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.geometry.BoundingBox;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Determines the extent of one or more features. Note that feaurure ids must be
 * consistent across requests; eg. geoserver will invent feature ids on a per
 * request basisi if no primary key or unique index was discovered in the
 * feature type, this can happen when using views.
 *
 * @author mprins
 */
@UrlBinding("/action/extent")
@StrictBinding
public class FeatureExtentActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(FeatureExtentActionBean.class);

    private ActionBeanContext context;

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
     * minimum size in any axis direction of the returned extent.
     */
    @Validate
    private int minSize;

    private Layer layer;
    private boolean unauthorized;

    @After(stages = LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        this.layer = appLayer.getService().getSingleLayer(appLayer.getLayerName());
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
            error = "Invalid parameters";
        } else if (unauthorized) {
            error = "Not authorized";
        } else {
            FeatureSource fs = null;
            if (minSize <= 0) {
                minSize = 100;
            }
            try {
                fs = this.layer.getFeatureType().openGeoToolsFeatureSource();
                BoundingBox extent = this.getExtent(fs);
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

    private BoundingBox getExtent(FeatureSource fs) throws CQLException, IOException {
        Filter f = ECQL.toFilter(this.filter);
        Query q = new Query(fs.getName().toString());
        q.setFilter(f);
        q.setHandle("extent-query");
        q.setMaxFeatures(FeatureToJson.MAX_FEATURES);
        SimpleFeatureCollection feats = (SimpleFeatureCollection) fs.getFeatures(q);
        BoundingBox extent = feats.getBounds();

        if (extent.getSpan(0) < minSize || extent.getSpan(1) < minSize) {
            // buffer the extent if smaller than the limit eg. a single point or line
            log.debug("buffering extent by: " + minSize);
            try (SimpleFeatureIterator sfi = feats.features()) {
                if (sfi.hasNext()) {
                    SimpleFeature sf = sfi.next();
                    Geometry geom = (Geometry) sf.getDefaultGeometry();
                    if (geom != null) {
                        geom = geom.buffer(minSize);
                        extent = new ReferencedEnvelope(geom.getEnvelopeInternal(), extent.getCoordinateReferenceSystem());
                    }
                }
            }
        }
        return extent;
    }

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
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

    public int getMinSize() {
        return minSize;
    }

    public void setMinSize(int minSize) {
        this.minSize = minSize;
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
