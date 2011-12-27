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

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.ArcGISService;
import nl.b3p.viewer.config.services.ArcIMSService;
import nl.b3p.viewer.config.services.Category;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.WMSService;
import nl.b3p.web.WaitPageStatus;
import org.json.JSONException;
import org.stripesstuff.plugin.waitpage.WaitPage;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/geoservice/{$event}/{service}")
public class GeoServiceActionBean implements ActionBean{
    private static final String JSP = "/WEB-INF/jsp/geoservice.jsp";
    
    private ActionBeanContext context;
    
    @Validate(on={"addForm","add"},required=true)
    private Category category;
    
    @Validate(on="editGeoService",required=true)
    private GeoService service;

    @Validate(on="add", required=true)
    private String url;

    @Validate(on="add", required=true)
    private String protocol;

    @Validate
    private String name;

    @Validate
    private boolean overrideUrl;

    private WaitPageStatus status;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public WaitPageStatus getStatus() {
        return status;
    }

    public void setStatus(WaitPageStatus status) {
        this.status = status;
    }

    public boolean isOverrideUrl() {
        return overrideUrl;
    }

    public void setOverrideUrl(boolean overrideUrl) {
        this.overrideUrl = overrideUrl;
    }
    //</editor-fold>
    
    @DefaultHandler
    @HandlesEvent("default")
    public Resolution defaultResolution() throws JSONException {
        return new ForwardResolution(JSP);
    }
    
    public Resolution editGeoService() throws JSONException {
        return new ForwardResolution(JSP);
    }
    
    public Resolution saveGeoService() throws JSONException {
        Stripersist.getEntityManager().getTransaction().commit();
        return new ForwardResolution(JSP);
    }

    public Resolution addForm() {

        return new ForwardResolution(JSP);
    }

    @WaitPage(path="/WEB-INF/jsp/waitpage.jsp", delay=0, refresh=1000, ajax="/WEB-INF/jsp/waitpageajax.jsp")
    public Resolution add() {

        status = new WaitPageStatus();

        try {
            if(protocol.equals("wms")) {
                service = new WMSService().loadFromUrl(url, status, overrideUrl);
            } else if(protocol.equals("arcgis")) {
                service = new ArcGISService().loadFromUrl(url, status);
            } else if(protocol.equals("arcxml")) {
                service = new ArcIMSService().loadFromUrl(url, status);
            } else {
                getContext().getValidationErrors().add("protocol", new SimpleError("Ongeldig"));
            }
        } catch(Exception e) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(e.getClass().getName() + ": " + e.getMessage()));
            return new ForwardResolution(JSP);
        }

        if(name != null) {
            service.setName(name);
        }
        category = Stripersist.getEntityManager().find(Category.class, category.getId());
        service.setCategory(category);
        category.getServices().add(service);

        Stripersist.getEntityManager().persist(service);
        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage("Service is ingeladen"));

        return new RedirectResolution(GeoServiceActionBean.class).flash(this);
    }
}
