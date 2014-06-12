/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.filter.visitor.RemoveDistanceUnit;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.WFSFeatureSource;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/downloadfeatures")
@StrictBinding
public class DownloadFeaturesActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(DownloadFeaturesActionBean.class);

    private ActionBeanContext context;

    private boolean unauthorized;
      
    @Validate
    private Application application;
    
    @Validate
    private ApplicationLayer appLayer;
    
    @Validate
    private SimpleFeatureType featureType;
    
    private Layer layer = null;
    
    @Validate
    private int limit;
    
    @Validate
    private String filter;
    
    @Validate
    private boolean debug;
    @Validate
    private boolean noCache;
    
    
     //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public void setContext(ActionBeanContext abc) {
        this.context = abc;
    }

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    public boolean isUnauthorized() {
        return unauthorized;
    }

    public void setUnauthorized(boolean unauthorized) {
        this.unauthorized = unauthorized;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }

    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }

    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public boolean isNoCache() {
        return noCache;
    }

    public void setNoCache(boolean noCache) {
        this.noCache = noCache;
    }

    // </editor-fold>
    
    @Before(stages=LifecycleStage.EventHandling)
    public void checkAuthorization() {
        
        if(application == null || appLayer == null 
                || !Authorizations.isAppLayerReadAuthorized(application, appLayer, context.getRequest())) {
            unauthorized = true;
        }
    }
    public Resolution download() throws JSONException {
        JSONObject json = new JSONObject();
        
        if(unauthorized) {
            json.put("success", false);
            json.put("message", "Not authorized");
            return new StreamingResolution("application/json", new StringReader(json.toString(4)));    
        }
        
        try {
            if(featureType!=null || (layer != null && layer.getFeatureType() != null)) {
                FeatureSource fs;
                SimpleFeatureType ft = featureType;
                if (ft==null){
                    ft=layer.getFeatureType();
                }
                if(isDebug() && ft.getFeatureSource() instanceof WFSFeatureSource) {
                    Map extraDataStoreParams = new HashMap();
                    extraDataStoreParams.put(WFSDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                    fs = ((WFSFeatureSource)ft.getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
                } else {
                    
                    fs = ft.openGeoToolsFeatureSource();
                }
                
                final Query q = new Query(fs.getName().toString());
                //List<String> propertyNames = FeatureToJson.setPropertyNames(appLayer,q,ft,false);

                setFilter(q,ft);
                
                q.setMaxFeatures(Math.min(limit,FeatureToJson.MAX_FEATURES));
                
                json.put("success", true);
            }
        } catch(Exception e) {
            log.error("Error loading features", e);
            
            json.put("success", false);
            
            String message = "Fout bij ophalen features: " + e.toString();
            Throwable cause = e.getCause();
            while(cause != null) {
                message += "; " + cause.toString();
                cause = cause.getCause();
            }
            json.put("message", message);
        }

        return new StreamingResolution("");
    }

    private void setFilter(Query q,SimpleFeatureType ft) throws Exception {
        if(filter != null && filter.trim().length() > 0) {
            Filter f = CQL.toFilter(filter);
            f = (Filter)f.accept(new RemoveDistanceUnit(), null);
            f = (Filter)f.accept(new ChangeMatchCase(false), null);
            f = FeatureToJson.reformatFilter(f,ft);
            q.setFilter(f);
        }
    }
    
}
