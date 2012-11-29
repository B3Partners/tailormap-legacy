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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.security.RolesAllowed;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.*;
import org.json.*;
import org.stripesstuff.plugin.waitpage.WaitPage;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/geoservice/{service}")
@RolesAllowed({Group.ADMIN, Group.REGISTRY_ADMIN})
public class GeoServiceActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(GeoServiceActionBean.class);
    private static final String JSP = "/WEB-INF/jsp/services/geoservice.jsp";
    private ActionBeanContext context;
    @Validate(on = {"add"}, required = true)
    private Category category;
    @Validate(on = {"edit"}, required = true)
    private GeoService service;
    @Validate(on = "add", required = true)
    private String url;
    @Validate(on = "add", required = true)
    private String protocol;
    /**
     * Whether the service was succesfully deleted. Use in view JSP to update
     * tree.
     */
    private boolean serviceDeleted;
    @Validate
    private String name;
    @Validate
    private String username;
    @Validate
    private String password;
    @Validate
    private boolean overrideUrl;
    @Validate
    private String serviceName;
    @Validate
    private Integer tileSize;
    @Validate
    private String tilingProtocol;
    @Validate
    private String resolutions;
    @Validate
    private String serviceBbox;
    @Validate
    private String imageExtension;
    @Validate
    private String crs;
    private WaitPageStatus status;
    private JSONObject newService;
    private JSONObject updatedService;
    
    private boolean updatable;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public JSONObject getNewService() {
        return newService;
    }

    public void setNewService(JSONObject newService) {
        this.newService = newService;
    }

    public JSONObject getUpdatedService() {
        return updatedService;
    }

    public void setUpdatedService(JSONObject updatedService) {
        this.updatedService = updatedService;
    }

    public boolean isServiceDeleted() {
        return serviceDeleted;
    }

    public void setServiceDeleted(boolean serviceDeleted) {
        this.serviceDeleted = serviceDeleted;
    }

    public Integer getTileSize() {
        return tileSize;
    }

    public void setTileSize(Integer tileSize) {
        this.tileSize = tileSize;
    }

    public String getTilingProtocol() {
        return tilingProtocol;
    }

    public void setTilingProtocol(String tilingProtocol) {
        this.tilingProtocol = tilingProtocol;
    }

    public String getResolutions() {
        return resolutions;
    }

    public void setResolutions(String resolutions) {
        this.resolutions = resolutions;
    }

    public String getServiceBbox() {
        return serviceBbox;
    }

    public void setServiceBbox(String serviceBbox) {
        this.serviceBbox = serviceBbox;
    }

    public String getImageExtension() {
        return imageExtension;
    }

    public void setImageExtension(String imageExtension) {
        this.imageExtension = imageExtension;
    }

    public String getCrs() {
        return crs;
    }

    public void setCrs(String crs) {
        this.crs = crs;
    }

    public boolean isUpdatable() {
        return updatable;
    }

    public void setUpdatable(boolean updatable) {
        this.updatable = updatable;
    }
    //</editor-fold>
   
    
    @DefaultHandler
    public Resolution edit() {
        if (service != null) {
            protocol = service.getProtocol();
            url = service.getUrl();
            if (protocol.equals(ArcIMSService.PROTOCOL)) {
                ArcIMSService ser = (ArcIMSService) service;
                serviceName = ser.getServiceName();
            } else if (protocol.equals(TileService.PROTOCOL)) {
                TileService ser = (TileService) service;
                tilingProtocol = ser.getTilingProtocol();

                //tiling service has 1 layer with that has the settings.                
                Layer layer = ser.getTilingLayer();
                //set the resolutions

                TileSet tileSet = layer.getTileset();

                if (tileSet != null) {
                    String res = "";
                    for (Double resolution : tileSet.getResolutions()) {
                        if (res.length() > 0) {
                            res += ",";
                        }
                        res += resolution.toString();
                    }
                    resolutions = res;

                    //set the tilesize
                    tileSize = tileSet.getHeight();
                }

                //set the service Bbox               
                if (layer.getBoundingBoxes().size() == 1) {
                    BoundingBox bb = layer.getBoundingBoxes().values().iterator().next();
                    serviceBbox = "" + bb.getMinx() + ","
                            + bb.getMiny() + ","
                            + bb.getMaxx() + ","
                            + bb.getMaxy();
                    crs = bb.getCrs().getName();
                }
                serviceName = layer.getName();

                if (layer.getDetails().containsKey("image_extension")) {
                    ClobElement ce = layer.getDetails().get("image_extension");
                    imageExtension = ce != null ? ce.getValue() : null;
                }

            }
            name = service.getName();
            username = service.getUsername();
            password = service.getPassword();
        }
        return new ForwardResolution(JSP);
    }

    public Resolution save() {
        if (name != null) {
            service.setName(name);
        }
        if (service instanceof TileService) {
            TileService ser = (TileService) service;
            if (tilingProtocol != null) {
                ((TileService) service).setTilingProtocol(tilingProtocol);
            }
            if (url!=null){
                ((TileService) service).setUrl(url);
            }
            Layer l = ser.getTilingLayer();
            if (tileSize != null) {
                l.getTileset().setWidth(tileSize);
                l.getTileset().setHeight(tileSize);
            }
            if (resolutions != null) {
                l.getTileset().setResolutions(resolutions);
            }
            if (crs != null && serviceBbox != null) {
                BoundingBox bb = new BoundingBox();
                bb.setBounds(serviceBbox);
                bb.setCrs(new CoordinateReferenceSystem(crs));
                l.getBoundingBoxes().clear();
                l.getBoundingBoxes().put(bb.getCrs(), bb);
            }
            if (imageExtension != null) {
                l.getDetails().put("image_extension", new ClobElement(imageExtension));
            }

        }

        service.setUsername(username);
        service.setPassword(password);

        Stripersist.getEntityManager().persist(service);
        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage("De service is opgeslagen"));

        return edit();
    }

    public Resolution delete() {
        /*
         * XXX Als een service layers heeft die toegevoegd zijn aan een
         * applicatie mag de service niet verwijderd worden
         */
        List<ApplicationLayer> applicationLayers = Stripersist.getEntityManager().createQuery("from ApplicationLayer where service = :service").setParameter("service", service).getResultList();
        if (applicationLayers.size() > 0) {
            serviceDeleted = false;

            getContext().getValidationErrors().addGlobalError(new SimpleError("Fout bij het verwijderen van de service. De service heeft kaartlagen geconfigureerd in {2} applicaties.", applicationLayers.size()));

            return edit();
        } else {
            Category c = service.getCategory();
            c.getServices().remove(service);

            List<FeatureSource> linkedSources = Stripersist.getEntityManager().createQuery(
                    "from FeatureSource where linkedService = :service").setParameter("service", service).getResultList();
            for (FeatureSource fs : linkedSources) {
                fs.setLinkedService(null);
                getContext().getMessages().add(
                        new SimpleMessage("De bij deze service automatisch aangemaakte attribuutbron \"{0}\" moet apart worden verwijderd", fs.getName()));

            }
            if (TileService.PROTOCOL.equals(service.getProtocol())) {
                if (service.getTopLayer() != null && service.getTopLayer().getTileset() != null) {
                    TileSet ts = service.getTopLayer().getTileset();
                    Stripersist.getEntityManager().remove(ts);
                }
            }

            Stripersist.getEntityManager().remove(service);
            Stripersist.getEntityManager().getTransaction().commit();

            serviceDeleted = true;

            getContext().getMessages().add(new SimpleMessage("De service is verwijderd"));
            return new ForwardResolution(JSP);
        }
    }
    
    @Before
    public void setUpdatable() {
        updatable = service instanceof Updatable;
    }
    
    public Resolution update() throws JSONException {
        if(!isUpdatable()) {
            getContext().getMessages().add(new SimpleMessage("Services van protocol {0} kunnen niet worden geupdate",
                    service.getProtocol()));
            return new ForwardResolution(JSP);
        }
        UpdateResult result = ((Updatable)service).update();
        
        if(result.getStatus() == UpdateResult.Status.FAILED) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(result.getMessage()));
            return new ForwardResolution(JSP);
        }
        
        Map<UpdateResult.Status,List<String>> byStatus = result.getLayerNamesByStatus();
        
        log.info(String.format("Update layer stats: unmodified %d, updated %d, new %d, missing %d",
                byStatus.get(UpdateResult.Status.UNMODIFIED).size(),
                byStatus.get(UpdateResult.Status.UPDATED).size(),
                byStatus.get(UpdateResult.Status.NEW).size(),
                byStatus.get(UpdateResult.Status.MISSING).size()
        ));
        log.info("Unmodified layers: " + byStatus.get(UpdateResult.Status.UNMODIFIED));
        log.info("Updated layers: " + byStatus.get(UpdateResult.Status.UPDATED));
        log.info("New layers: " + byStatus.get(UpdateResult.Status.NEW));
        log.info("Missing layers: " + byStatus.get(UpdateResult.Status.MISSING));
                
        Stripersist.getEntityManager().getTransaction().commit();
        
        updatedService = new JSONObject();
        updatedService.put("id", "s" + service.getId());
        updatedService.put("name", service.getName());
        updatedService.put("type", "service");
        updatedService.put("isLeaf", service.getTopLayer() == null);
        updatedService.put("status", "ok");//Math.random() > 0.5 ? "ok" : "error");
        updatedService.put("parentid", "c" + category.getId());
        
        getContext().getMessages().add(new SimpleMessage("De service is geupdate"));
        
        return new ForwardResolution(JSP);
    }

    @ValidationMethod(on = "add")
    public void validateParams(ValidationErrors errors) {
        if (protocol.equals(ArcIMSService.PROTOCOL) || protocol.equals(TileService.PROTOCOL)) {
            if (serviceName == null) {
                errors.add("serviceName", new LocalizableError("validation.required.valueNotPresent"));
            }
            if (protocol.equals(TileService.PROTOCOL)) {
                if (resolutions == null) {
                    errors.add("resolutions", new LocalizableError("validation.required.valueNotPresent"));
                }
                if (serviceBbox == null) {
                    errors.add("serviceBbox", new LocalizableError("validation.required.valueNotPresent"));
                }
                if (crs == null) {
                    errors.add("crs", new LocalizableError("validation.required.valueNotPresent"));
                }
                if (tileSize == null) {
                    errors.add("tileSize", new LocalizableError("validation.required.valueNotPresent"));
                }
            }
        }


    }

    public Resolution addForm() {
        return new ForwardResolution(JSP);
    }

    @WaitPage(path = "/WEB-INF/jsp/waitpage.jsp", delay = 2000, refresh = 1000, ajax = "/WEB-INF/jsp/waitpageajax.jsp")
    public Resolution add() throws JSONException {

        status = new WaitPageStatus();

        Map params = new HashMap();

        try {
            if (protocol.equals(WMSService.PROTOCOL)) {
                params.put(WMSService.PARAM_OVERRIDE_URL, overrideUrl);
                params.put(WMSService.PARAM_USERNAME, username);
                params.put(WMSService.PARAM_PASSWORD, password);
                service = new WMSService().loadFromUrl(url, params, status);
            } else if (protocol.equals(ArcGISService.PROTOCOL)) {
                params.put(ArcGISService.PARAM_USERNAME, username);
                params.put(ArcGISService.PARAM_PASSWORD, password);
                service = new ArcGISService().loadFromUrl(url, params, status);
            } else if (protocol.equals(ArcIMSService.PROTOCOL)) {
                params.put(ArcIMSService.PARAM_SERVICENAME, serviceName);
                params.put(ArcIMSService.PARAM_USERNAME, username);
                params.put(ArcIMSService.PARAM_PASSWORD, password);
                service = new ArcIMSService().loadFromUrl(url, params, status);
            } else if (protocol.equals(TileService.PROTOCOL)) {
                params.put(TileService.PARAM_SERVICENAME, serviceName);
                params.put(TileService.PARAM_RESOLUTIONS, resolutions);
                params.put(TileService.PARAM_SERVICEBBOX, serviceBbox);
                params.put(TileService.PARAM_CRS, crs);
                params.put(TileService.PARAM_IMAGEEXTENSION, imageExtension);
                params.put(TileService.PARAM_TILESIZE, tileSize);
                params.put(TileService.PARAM_TILINGPROTOCOL, tilingProtocol);
                service = new TileService().loadFromUrl(url, params, status);
            } else {
                getContext().getValidationErrors().add("protocol", new SimpleError("Ongeldig"));
            }
        } catch (Exception e) {
            log.error("Exception loading " + protocol + " service from url " + url, e);
            String s = e.toString();
            if (e.getCause() != null) {
                s += "; cause: " + e.getCause().toString();
            }
            getContext().getValidationErrors().addGlobalError(new SimpleError("Fout bij het laden van de service: {2}", s));
            return new ForwardResolution(JSP);
        }

        if (name != null) {
            service.setName(name);
        }
        if (username != null) {
            service.setUsername(username);
        }
        if (password != null) {
            service.setPassword(password);
        }
        category = Stripersist.getEntityManager().find(Category.class, category.getId());
        service.setCategory(category);
        category.getServices().add(service);

        Stripersist.getEntityManager().persist(service);
        Stripersist.getEntityManager().getTransaction().commit();

        newService = new JSONObject();
        newService.put("id", "s" + service.getId());
        newService.put("name", service.getName());
        newService.put("type", "service");
        newService.put("isLeaf", service.getTopLayer() == null);
        newService.put("status", "ok");//Math.random() > 0.5 ? "ok" : "error");
        newService.put("parentid", "c" + category.getId());

        getContext().getMessages().add(new SimpleMessage("Service is ingeladen"));

        return edit();
    }
}
