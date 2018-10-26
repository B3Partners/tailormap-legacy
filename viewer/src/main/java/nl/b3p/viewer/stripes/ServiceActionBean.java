/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.ArcGISService;
import nl.b3p.viewer.config.services.ArcIMSService;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.WMSService;
import nl.b3p.web.stripes.ErrorMessageResolution;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/service/info")
@StrictBinding
public class ServiceActionBean implements ActionBean {
    
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
    
    @Validate
    private String protocol;
    @Validate
    private String url;
    @Validate
    private String serviceName;
    
    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public String getProtocol() {
        return protocol;
    }
    
    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }
    
    public String getServiceName() {
        return serviceName;
    }
    
    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    //</editor-fold>
    
    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }
    public Resolution info() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;
        GeoService service = null;
        EntityManager em = Stripersist.getEntityManager();
        
        if(protocol == null || url == null) {
            error = getBundle().getString("viewer.serviceactionbean.1");
        } else {
            
            Map params = new HashMap();
            
            try {
                if(protocol.equals(WMSService.PROTOCOL)) {
                    //params.put(WMSService.PARAM_OVERRIDE_URL, overrideUrl);
                    service = new WMSService().loadFromUrl(url, params, em);
                } else if(protocol.equals(ArcGISService.PROTOCOL)) {
                    service = new ArcGISService().loadFromUrl(url, params, em);
                } else if(protocol.equals(ArcIMSService.PROTOCOL)) {
                    params.put(ArcIMSService.PARAM_SERVICENAME, serviceName);
                    service = new ArcIMSService().loadFromUrl(url, params, em);
                } else {
                    error = getBundle().getString("viewer.serviceactionbean.2");
                }            
            } catch(Exception e) {
                
                error = "Error loading service " + e.toString();
                if(e.getCause() != null) {
                    error += "; cause: " + e.getCause().toString();
                }
            }
        }
        
        if(service != null) {
            json.put("success", Boolean.TRUE);
            json.put("service", service.toJSONObject(true, em));
        } else {
            json.put("success", Boolean.FALSE);
            json.put("error", error);
        }      
        
        return new StreamingResolution("application/json", new StringReader(json.toString()));        
    }
}
