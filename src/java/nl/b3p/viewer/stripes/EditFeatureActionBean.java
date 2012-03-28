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

import net.sourceforge.stripes.action.ActionBean;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureSource;
import org.geotools.data.Transaction;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.filter.identity.FeatureIdImpl;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/feature/edit")
@StrictBinding
public class EditFeatureActionBean  implements ActionBean {
    private static final Log log = LogFactory.getLog(EditFeatureActionBean.class);
    
    private static final String FID = FeatureInfoActionBean.FID;
    
    private ActionBeanContext context;
    
    @Validate
    private String feature;

    @Validate
    private ApplicationLayer appLayer;
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getFeature() {
        return feature;
    }
    
    public void setFeature(String feature) {
        this.feature = feature;
    }
    
    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
    }
    //</editor-fold>

    public Resolution edit() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;
    
        try {
            do {
                if(appLayer == null) {
                    error = "App layer or service not found";
                    break;
                }
                Layer l = appLayer.getService().getLayer(appLayer.getLayerName());

                if(l == null) {
                    error = "Layer not found";
                    break;
                }

                if(l.getFeatureType() == null) {
                    error ="No feature type";
                    break;
                }

                JSONObject jf = new JSONObject(feature);
                // TODO new feature if no FID
                String fid = jf.getString(FID);
                
                FeatureSource fs = l.getFeatureType().openGeoToolsFeatureSource();
                
                if(!(fs instanceof SimpleFeatureStore)) {
                    error = "Feature source does not support editing";
                    break;
                }
                SimpleFeatureStore fstore = (SimpleFeatureStore)fs;
                
                Transaction transaction = new DefaultTransaction("edit");
                fstore.setTransaction(transaction);
        
                FilterFactory2 ff = CommonFactoryFinder.getFilterFactory2();
                Filter filter = ff.id(new FeatureIdImpl(fid));
                
                List<String> attributes = new ArrayList<String>();
                List values = new ArrayList();
                for(Iterator<String> it = jf.keys(); it.hasNext();) {
                    String attribute = it.next();
                    if(!FID.equals(attribute)) {
                        attributes.add(attribute);
                        // TODO: if value is geometry parse WKT
                        values.add(jf.get(attribute));
                    }
                }
                
                log.debug(String.format("Modifying feature source #%d fid=%s, attributes=%s, values=%s",
                        l.getFeatureType().getId(),
                        fid,
                        attributes.toString(),
                        values.toString()));

                try {
                    fstore.modifyFeatures(attributes.toArray(new String[] {}), values.toArray(), filter);

                    transaction.commit();
                } catch (Exception e) {
                    transaction.rollback();
                    throw e;
                } finally {
                    transaction.close();
                }                

                json.put("success", Boolean.TRUE);
            } while(false);
        } catch(Exception e) {
            log.error(String.format("Exception editing feature", e));
            
            error = e.toString();
            if(e.getCause() != null) {
                error += "; cause: " + e.getCause().toString();
            }
        }
                
        if(error != null) {
            json.put("error", error);
            log.error("Returned error message editing feature: " + error);
        }      
        
        return new StreamingResolution("application/json", new StringReader(json.toString(4)));            
    }
}
