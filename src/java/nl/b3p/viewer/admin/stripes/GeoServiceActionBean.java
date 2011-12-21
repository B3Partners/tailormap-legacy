/*
 * Copyright (C) 2011 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.GeoService;
import org.json.JSONException;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
public class GeoServiceActionBean implements ActionBean{
    private ActionBeanContext context;
    
    @Validate
    private String serviceId;
    @Validate
    private String parentId;
    
    @Validate
    GeoService service;
    
    private String[] serviceTypes = {"wms", "arcgis", "arcims"};

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public GeoService getService() {
        return service;
    }

    public void setService(GeoService service) {
        this.service = service;
    }

    public String[] getServiceTypes() {
        return serviceTypes;
    }

    public void setServiceTypes(String[] serviceTypes) {
        this.serviceTypes = serviceTypes;
    }
    
    public String getServiceId() {
        return serviceId;
    }
    
    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    //</editor-fold>
    
    @DefaultHandler
    public Resolution editGeoService() throws JSONException {
        EntityManager em = Stripersist.getEntityManager();
        
        if(serviceId != null){
            Long idLong = Long.parseLong(serviceId.substring(1)); 
            service = em.find(GeoService.class, idLong);
        }
        
        Stripersist.getEntityManager().getTransaction().commit();
        
        return new ForwardResolution("/WEB-INF/jsp/geoservice.jsp");
    }
    
    public Resolution saveGeoService() throws JSONException {
        String blaa = "blaa";
        
        Stripersist.getEntityManager().getTransaction().commit();
        
        return new ForwardResolution("/WEB-INF/jsp/geoservice.jsp");
    }
    
}
