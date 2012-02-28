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
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.Layer;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/appInfo")
@StrictBinding
public class AppInfoActionBean implements ActionBean {
    
    private ActionBeanContext context;
    
    @Validate
    private ApplicationLayer appLayer;
    
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
    //</editor-fold>

    public Resolution appLayerInfo() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if(appLayer == null) {
            error = "Invalid parameters";
        } else {
            // TODO check if user has rights to appLayer
            
            JSONObject info = new JSONObject();
            
            JSONObject details = new JSONObject();
            for(Map.Entry<String,String> e: appLayer.getDetails().entrySet()) {
                details.put(e.getKey(), e.getValue());
            }
            info.put("details", details);
            
            Layer l = null;
            try {
                l = (Layer)Stripersist.getEntityManager().createQuery("from Layer where service = :service and name = :n order by virtual desc")
                        .setParameter("service", appLayer.getService())
                        .setParameter("n", appLayer.getLayerName())
                        .setMaxResults(1)
                        .getSingleResult();
            } catch(NoResultException nre) {
            }
            Map<String,AttributeDescriptor> ftAttributes = new HashMap<String,AttributeDescriptor>();
            if(l != null) {
                SimpleFeatureType ft = l.getFeatureType();
                if(ft != null) {
                    for(AttributeDescriptor ad: ft.getAttributes()) {
                        ftAttributes.put(ad.getName(), ad);
                    }
                }
            }
            
            JSONArray attributes = new JSONArray();
            for(ConfiguredAttribute ca: appLayer.getAttributes()) {
                JSONObject j = ca.toJSONObject();
                
                AttributeDescriptor ad = ftAttributes.get(ca.getAttributeName());
                if(ad != null) {
                    j.put("alias", ad.getAlias());
                    j.put("type", ad.getType());
                }
                attributes.put(j);
            }        
            info.put("attributes", attributes);
                       
            json.put("info", info);
            json.put("success", Boolean.TRUE);
        }
        
        if(error != null) {
            json.put("error", error);
        }      
        
        return new StreamingResolution("application/json", new StringReader(json.toString()));    
    }
}
