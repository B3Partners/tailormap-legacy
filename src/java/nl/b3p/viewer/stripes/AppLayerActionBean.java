/*
 * Copyright (C) 2012 B3Partners B.V.
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

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import javax.persistence.NoResultException;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.store.DataFeatureCollection;
import org.geotools.data.wfs.WFSDataStore;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/appLayer")
@StrictBinding
public class AppLayerActionBean implements ActionBean {
    private static final int MAX_FEATURES = 50;
    
    private ActionBeanContext context;
    
    @Validate
    private ApplicationLayer appLayer;
    
    private Layer layer = null;
    
    @Validate
    private int limit;
    @Validate
    private int page;
    @Validate
    private int start;    
    
    @Validate
    private boolean debug;
    
    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }
    //</editor-fold>

    @After(stages=LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        // TODO check if user has rights to appLayer

        try {
            layer = (Layer)Stripersist.getEntityManager().createQuery("from Layer where service = :service and name = :n order by virtual desc")
                    .setParameter("service", appLayer.getService())
                    .setParameter("n", appLayer.getLayerName())
                    .setMaxResults(1)
                    .getSingleResult();
            
        } catch(NoResultException nre) {
        }
    }
    
    public Resolution attributes() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if(appLayer == null) {
            error = "Invalid parameters";
        } else {

            Map<String,AttributeDescriptor> featureTypeAttributes = new HashMap<String,AttributeDescriptor>();

            if(layer != null) {
                SimpleFeatureType ft = layer.getFeatureType();
                if(ft != null) {
                    for(AttributeDescriptor ad: ft.getAttributes()) {
                        featureTypeAttributes.put(ad.getName(), ad);
                    }
                }
            } 
            
            JSONArray attributes = new JSONArray();
            for(ConfiguredAttribute ca: appLayer.getAttributes()) {
                JSONObject j = ca.toJSONObject();
                
                AttributeDescriptor ad = featureTypeAttributes.get(ca.getAttributeName());
                if(ad != null) {
                    j.put("alias", ad.getAlias());
                    j.put("type", ad.getType());
                }
                attributes.put(j);
            }        
                       
            json.put("attributes", attributes);
            json.put("success", Boolean.TRUE);
        }
        
        if(error != null) {
            json.put("error", error);
        }      
        
        return new StreamingResolution("application/json", new StringReader(json.toString()));    
    }
    
    public Resolution store() throws JSONException, Exception {
        JSONObject json = new JSONObject();
        JSONArray features = new JSONArray();
        
        int total = 0;
        
        if(layer != null && layer.getFeatureType() != null) {
            FeatureSource fs;
            
            if(isDebug() && layer.getFeatureType().getFeatureSource() instanceof WFSFeatureSource) {
                Map extraDataStoreParams = new HashMap();
                extraDataStoreParams.put(WFSDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                fs = ((WFSFeatureSource)layer.getFeatureType().getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
            } else {
                fs = layer.getFeatureType().openGeoToolsFeatureSource();
            }
            
            boolean startIndexSupported = fs.getQueryCapabilities().isOffsetSupported();
            
            Query q = new Query(fs.getName().toString());
            q.setMaxFeatures(Math.min(limit + (startIndexSupported ? 0 : start),MAX_FEATURES));
            q.setStartIndex(start);

            FeatureCollection fc = fs.getFeatures(q);

            if(!fc.isEmpty()) {
                if(fc instanceof DataFeatureCollection) {
                    total = ((DataFeatureCollection)fc).getCount();
                } else {
                    total = fc.size(); /* This method swallows exceptions */
                }     
                if(total == q.getMaxFeatures()) {
                    // we don't know if these are all the features or if there are more...
                    total = MAX_FEATURES;
                }
                if(total != MAX_FEATURES && !startIndexSupported) {
                    total -= start;
                }

                FeatureIterator<SimpleFeature> it = fc.features();
                try {
                    while(it.hasNext()) {
                        SimpleFeature f = it.next();

                        if(!startIndexSupported && start > 0) {
                            start--;
                            continue;
                        }

                        JSONObject j = new JSONObject();
                        for(ConfiguredAttribute ca: appLayer.getAttributes()) {

                            if(ca.isVisible()) {
                                j.put(ca.getAttributeName(), f.getAttribute(ca.getAttributeName()));
                            }
                        }                     
                        features.put(j);
                    }
                } finally {
                    it.close();
                }
            }
        }
                
        json.put("total", total);
        json.put("features", features);

        return new StreamingResolution("application/json", new StringReader(json.toString()));    
    }
}
