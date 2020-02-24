/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.b3p.viewer.admin.stripes;

import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.util.SelectedContentCache;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.geotools.xml.filter.FilterTransformer;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.Filter;
import org.stripesstuff.plugin.waitpage.WaitPage;
import org.stripesstuff.stripersist.Stripersist;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.InputSource;
import org.xml.sax.SAXParseException;

import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URL;
import java.util.*;
import nl.b3p.i18n.LocalizableActionBean;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/geoservice/{service}")
@RolesAllowed({Group.ADMIN, Group.REGISTRY_ADMIN})
public class GeoServiceActionBean extends LocalizableActionBean {

    private static final Log log = LogFactory.getLog(GeoServiceActionBean.class);
    private static final String JSP = "/WEB-INF/jsp/services/geoservice.jsp";
    private static final String JSP_EDIT_SLD = "/WEB-INF/jsp/services/editsld.jsp";

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
    private String agsVersion;
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
    @Validate
    private boolean useIntersect;
    @Validate
    private boolean useProxy;
    @Validate
    private WMSExceptionType exception_type;
    @Validate
    private boolean skipDiscoverWFS = false;

    private WaitPageStatus status;
    private JSONObject newService;
    private JSONObject updatedService;
    
    private List<Group> allGroups;
    
    @Validate
    private List<String> groupsRead = new ArrayList<String>();

    @Validate
    @ValidateNestedProperties({
            @Validate(on="saveSld",field="title", required=true),
            @Validate(on="saveSld",field="defaultStyle"),
            @Validate(on="saveSld",field="externalUrl"),
            @Validate(on="saveSld",field="sldBody"),
            @Validate(on="saveSld",field="extraLegendParameters")
    })
    private StyleLibrary sld;

    @Validate
    private String sldType = "external";

    @Validate(on="cqlToFilter")
    private String cql;

    private String generatedSld;

    private boolean updatable;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
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

    public String getAgsVersion() {
        return agsVersion;
    }

    public void setAgsVersion(String agsVersion) {
        this.agsVersion = agsVersion;
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

    public StyleLibrary getSld() {
        return sld;
    }

    public void setSld(StyleLibrary sld) {
        this.sld = sld;
    }

    public String getSldType() {
        return sldType;
    }

    public void setSldType(String sldType) {
        this.sldType = sldType;
    }

    public String getGeneratedSld() {
        return generatedSld;
    }

    public void setGeneratedSld(String generatedSld) {
        this.generatedSld = generatedSld;
    }

    public String getCql() {
        return cql;
    }

    public void setCql(String cql) {
        this.cql = cql;
    }

    public boolean isUseIntersect() {
        return useIntersect;
    }

    public void setUseIntersect(boolean useIntersect) {
        this.useIntersect = useIntersect;
    }

    public WMSExceptionType getException_type() {
        return exception_type;
    }

    public void setException_type(WMSExceptionType exception_type) {
        this.exception_type = exception_type;
    }

    public boolean isUseProxy() {
        return useProxy;
    }

    public void setUseProxy(boolean useProxy) {
        this.useProxy = useProxy;
    }

    public JSONArray getLayersInApplications() {
        return layersInApplications;
    }

    public void setLayersInApplications(JSONArray layersInApplications) {
        this.layersInApplications = layersInApplications;
    }

    public List<Group> getAllGroups() {
        return allGroups;
    }

    public void setAllGroups(List<Group> allGroups) {
        this.allGroups = allGroups;
    }

    public List<String> getGroupsRead() {
        return groupsRead;
    }

    public void setGroupsRead(List<String> groupsRead) {
        this.groupsRead = groupsRead;
    }

    public boolean isSkipDiscoverWFS() {
        return skipDiscoverWFS;
    }

    public void setSkipDiscoverWFS(boolean skipDiscoverWFS) {
        this.skipDiscoverWFS = skipDiscoverWFS;
    }

    //</editor-fold>

    private JSONArray layersInApplications = new JSONArray();
  
    @DefaultHandler
    public Resolution edit() {
        if (service != null) {
            protocol = service.getProtocol();
            url = service.getUrl();
            if (protocol.equals(ArcGISService.PROTOCOL)) {
                ClobElement assumeVersion = service.getDetails().get(ArcGISService.DETAIL_ASSUME_VERSION);
                agsVersion = assumeVersion == null ? null : assumeVersion.getValue();
            } else if (protocol.equals(TileService.PROTOCOL)) {
                TileService ser = (TileService) service;
                tilingProtocol = ser.getTilingProtocol();

                //tiling service has 1 layer with that has the settings.
                Layer layer = ser.getTilingLayer();
                //set the resolutions
                if(layer != null) {
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

            }else if(protocol.equals(WMSService.PROTOCOL)){
                overrideUrl = ((WMSService)service).getOverrideUrl();
                exception_type = ((WMSService) service).getException_type();
                // default to false
                skipDiscoverWFS = ((WMSService) service).getSkipDiscoverWFS() == null ? false : ((WMSService) service).getSkipDiscoverWFS();
            }

            if(service.getDetails().containsKey(GeoService.DETAIL_USE_INTERSECT)){
                ClobElement ce =service.getDetails().get(GeoService.DETAIL_USE_INTERSECT);
                useIntersect = Boolean.parseBoolean(ce.getValue());
            }

            if(service.getDetails().containsKey(GeoService.DETAIL_USE_PROXY)){
                ClobElement ce =service.getDetails().get(GeoService.DETAIL_USE_PROXY);
                useProxy = Boolean.parseBoolean(ce.getValue());
            }
            name = service.getName();
            username = service.getUsername();
            password = service.getPassword();
            EntityManager em = Stripersist.getEntityManager();
            // haal alle lagen op
                // haal van elke laag de applayer op
                    // haal van elke appLayer het level op
                        // haal van het level de parents op
            
            List<Layer> layers = service.loadLayerTree(em);
            
            List<Application> applications = em.createQuery("from Application").getResultList();
            
            for (Layer layer : layers) {
                //Map<Application, List<Level>> applicationsMap = new HashMap<Application,List<Level>>();
                JSONArray applicationsArray = new JSONArray();
                List<ApplicationLayer> appLayers = layer.getApplicationLayers(em);
                for (ApplicationLayer appLayer : appLayers) {
                    for (Application application : applications) {
                        //List<Level> levelsInApplication = new ArrayList<Level>();
                        JSONArray levelsInApplication = new JSONArray();
                        JSONObject applicationObject = new JSONObject();
                        applicationObject.put("text", application.getNameWithVersion());
                        applicationObject.put("itemid", "a" + application.getId());
                        applicationObject.put("type", "application");
                        applicationObject.put("children", levelsInApplication);
                        applicationsArray.put(applicationObject);
                        Level l = application.getRoot().getParentInSubtree(appLayer);
                        if(l != null){
                            Level cur = l;
                            JSONObject prev = null;
                            while(cur.getParent() != null){
                                JSONObject level = new JSONObject();
                                level.put("text", cur.getName());
                                level.put("type", "level");
                                level.put("itemid", "v" + cur.getId());
                                level.put("leaf", prev == null);
                                if(prev != null){
                                    level.put("children", prev);
                                }
                                cur = cur.getParent();
                                prev = level;
                            }
                            levelsInApplication.put(prev);
                            
                            
                        }
                    }
                }
                if(applicationsArray.length() > 0){
                    JSONObject layerObject = new JSONObject();
                    layerObject.put("text", layer.getDisplayName());
                    layerObject.put("layername", layer.getName());
                    layerObject.put("itemid", "l" + layer.getId());
                    layerObject.put("type", "layer");
                    layerObject.put("children", applicationsArray);
                    layersInApplications.put(layerObject);
                }
            }
        }
        if (status != null) {
            status.setFinished(true);
            status.setProgress(100);

            List<String> logs = status.dequeueLog();
            for (String log: logs) {
                context.getValidationErrors().add("Errors",new SimpleError(getBundle().getString(log)));
            }
        }
        return new ForwardResolution(JSP);
    }

    public Resolution save() {
        if (name != null) {
            service.setName(name);
        }
        if (url != null) {
            service.setUrl(url);
        }
        if (service instanceof TileService) {
            TileService ser = (TileService) service;
            if (tilingProtocol != null) {
                ((TileService) service).setTilingProtocol(tilingProtocol);
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
            if (StringUtils.isNotBlank(imageExtension)) {
                l.getDetails().put("image_extension", new ClobElement(imageExtension));
            }else if (l.getDetails().containsKey("image_extension")){
                l.getDetails().remove("image_extension");
            }

        }

        if (service instanceof WMSService) {
            ((WMSService)service).setOverrideUrl(overrideUrl);
            ((WMSService) service).setException_type(exception_type);
            ((WMSService) service).setSkipDiscoverWFS(skipDiscoverWFS);
        }
        EntityManager em = Stripersist.getEntityManager();
        // Invalidate the cache of the applications using this service. Options like username/password, useProxy, etc. might have changed, which
        // affect the selectedContent
        List<Application> apps = findApplications();
        for (Application application : apps) {
            SelectedContentCache.setApplicationCacheDirty(application, true, false, em);
        }
        service.getDetails().put(GeoService.DETAIL_USE_INTERSECT, new ClobElement(""+useIntersect));
        service.getDetails().put(GeoService.DETAIL_USE_PROXY, new ClobElement(""+useProxy));

        service.setUsername(username);
        if (password != null) {
            service.setPassword(password);
        }
        // When an user updates the service which formerly had a user/pass, but now it doesn't anymore -> remove the password (username already removed in L210
        if (username == null && password == null) {
            service.setPassword(password);
        }

        service.getReaders().clear();
        
        service.getReaders().addAll(groupsRead);
        
        em.persist(service);
        em.getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.srvsaved")));

        return edit();
    }


    private List<Application> findApplications() {
        List<Application> apps = new ArrayList();

        List<ApplicationLayer> applicationLayers = Stripersist.getEntityManager().createQuery("from ApplicationLayer where service = :service")
                .setParameter("service", service).getResultList();
        for (ApplicationLayer appLayer : applicationLayers) {
            /*
            * The parent level of the applicationLayer is needed to find out in
            * which application the Layer is used. This solution is not good
            * when there are many levels.
            */
            List<Application> applications = Stripersist.getEntityManager().createQuery("from Application").getResultList();
            for (Application app : applications) {
                if (app.getRoot().containsLayerInSubtree(appLayer)) {
                    apps.add(app);
                }
            }
        }
        return apps;
    }

    public Resolution delete() {
        /*
         * XXX Als een service layers heeft die toegevoegd zijn aan een
         * applicatie mag de service niet verwijderd worden
         */
        List<ApplicationLayer> applicationLayers = Stripersist.getEntityManager().createQuery("from ApplicationLayer where service = :service").setParameter("service", service).getResultList();
        if (applicationLayers.size() > 0) {
            serviceDeleted = false;

            getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.geoserviceactionbean.srvinuse"), applicationLayers.size()));

            return edit();
        } else {
            Category c = service.getCategory();
            c.getServices().remove(service);

            List<FeatureSource> linkedSources = Stripersist.getEntityManager().createQuery(
                    "from FeatureSource where linkedService = :service").setParameter("service", service).getResultList();
            for (FeatureSource fs : linkedSources) {
                fs.setLinkedService(null);
                getContext().getMessages().add(
                        new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.sepdel"), fs.getName()));

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

            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.srvrem")));
            return new ForwardResolution(JSP);
        }
    }

    @Before
    public void setUpdatable() {
        EntityManager em = Stripersist.getEntityManager();
        updatable = service instanceof Updatable;
    }
    
    @After
    public void makeLists(){
        EntityManager em = Stripersist.getEntityManager();
        allGroups = em.createQuery("from Group").getResultList();
        if (service != null && em.contains(service)) {
            groupsRead = new ArrayList(service.getReaders());
        }
    }

    public Resolution update() throws JSONException {
        if(!isUpdatable()) {
            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.srvnotupd"),
                    service.getProtocol()));
            return new ForwardResolution(JSP);
        }
        EntityManager em = Stripersist.getEntityManager();
        UpdateResult result = ((Updatable)service).update(em);

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

        List<Application> apps = findApplications();
        for (Application application : apps) {
            SelectedContentCache.setApplicationCacheDirty(application, true, false,em);
        }

        em.getTransaction().commit();

        updatedService = new JSONObject();
        updatedService.put("id", "s" + service.getId());
        updatedService.put("name", service.getName());
        updatedService.put("type", "service");
        updatedService.put("isLeaf", service.getTopLayer() == null);
        updatedService.put("status", "ok");//Math.random() > 0.5 ? "ok" : "error");
        updatedService.put("parentid", "c" + category.getId());

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.srvupd")));

        return new ForwardResolution(JSP);
    }
    @ValidationMethod(on = "add")
    public void validateParams(ValidationErrors errors) {
        if (protocol.equals(TileService.PROTOCOL)) {
            if (serviceName == null && (protocol.equals(TileService.PROTOCOL) && !tilingProtocol.equalsIgnoreCase(TileService.TILING_PROTOCOL_WMTS))) {
                errors.add("serviceName", new LocalizableError("validation.required.valueNotPresent"));
            }
            if (protocol.equals(TileService.PROTOCOL) && !tilingProtocol.equalsIgnoreCase(TileService.TILING_PROTOCOL_WMTS)) {
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

        EntityManager em = Stripersist.getEntityManager();
        try {
            addService(em);
        } catch (Exception e) {
            log.error("Exception loading " + protocol + " service from url " + url, e);
            String s = e.toString();
            if (e.getCause() != null) {
                s += "; cause: " + e.getCause().toString();
            }
            getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.geoserviceactionbean.srvnotloaded"), s));
            return new ForwardResolution(JSP);
        }

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.srvloaded")));
        return edit();
    }

    protected void addService(EntityManager em) throws Exception{
        status = new WaitPageStatus();

        Map params = new HashMap();

        params.put(GeoService.PARAM_USERNAME, username);
        params.put(GeoService.PARAM_PASSWORD, password);
        if (protocol.equals(WMSService.PROTOCOL)) {
            params.put(WMSService.PARAM_OVERRIDE_URL, overrideUrl);
            params.put(WMSService.PARAM_SKIP_DISCOVER_WFS, skipDiscoverWFS);
            service = new WMSService().loadFromUrl(url, params, status, em);
            ((WMSService) service).setException_type(exception_type);
            service.getDetails().put(GeoService.DETAIL_USE_PROXY, new ClobElement("" + useProxy));
        } else if (protocol.equals(ArcGISService.PROTOCOL)) {
            params.put(ArcGISService.PARAM_ASSUME_VERSION, agsVersion);
            service = new ArcGISService().loadFromUrl(url, params, status, em);
        } else if (protocol.equals(TileService.PROTOCOL)) {
            params.put(TileService.PARAM_SERVICENAME, serviceName);
            params.put(TileService.PARAM_RESOLUTIONS, resolutions);
            params.put(TileService.PARAM_SERVICEBBOX, serviceBbox);
            params.put(TileService.PARAM_CRS, crs);
            params.put(TileService.PARAM_IMAGEEXTENSION, imageExtension);
            params.put(TileService.PARAM_TILESIZE, tileSize);
            params.put(TileService.PARAM_TILINGPROTOCOL, tilingProtocol);
            service = new TileService().loadFromUrl(url, params, status, em);
        } else {
            getContext().getValidationErrors().add("protocol", new SimpleError("Ongeldig"));
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

        service.getDetails().put(GeoService.DETAIL_USE_INTERSECT, new ClobElement(""+useIntersect));
        service.getReaders().addAll(groupsRead);

        category = em.find(Category.class, category.getId());
        service.setCategory(category);
        category.getServices().add(service);
        status.setCurrentAction("Service opslaan.");
        em.persist(service);
        em.getTransaction().commit();

        newService = new JSONObject();
        newService.put("id", "s" + service.getId());
        newService.put("name", service.getName());
        newService.put("type", "service");
        newService.put("isLeaf", service.getTopLayer() == null);
        newService.put("status", "ok");
        newService.put("parentid", "c" + category.getId());

    }

    @DontValidate
    public Resolution addSld() {
        return new ForwardResolution(JSP_EDIT_SLD);
    }

    @Before(on="editSld")
    public void setSldType() {
        if(sld != null) {
            sldType = sld.getExternalUrl() != null ? "external" : "body";
        }
    }

    public Resolution editSld() {
        if(sld != null) {
            return new ForwardResolution(JSP_EDIT_SLD);
        } else {
            return edit();
        }
    }

    public Resolution deleteSld() {
        if(sld != null) {
            service.getStyleLibraries().remove(sld);
            Stripersist.getEntityManager().remove(sld);
            Stripersist.getEntityManager().getTransaction().commit();
            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.sldrem")));
        }
        return edit();
    }

    @ValidationMethod(on="saveSld")
    public void validateSld() {
        if("external".equals(sldType) && StringUtils.isBlank(sld.getExternalUrl())) {
            getContext().getValidationErrors().add("sld.externalUrl", new LocalizableError("validation.required.valueNotPresent"));
            sld.setSldBody(null);
        }
        if("body".equals(sldType) && StringUtils.isBlank(sld.getSldBody())) {
            getContext().getValidationErrors().add("sld.sldBody", new LocalizableError("validation.required.valueNotPresent"));
            sld.setExternalUrl(null);
        }
    }

    private static final String NS_SLD = "http://www.opengis.net/sld";
    private static final String NS_OGC = "http://www.opengis.net/ogc";
    private static final String NS_GML = "http://www.opengis.net/gml";

    public Resolution generateSld() throws Exception {

        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(true);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document sldDoc = db.newDocument();

        Element sldEl = sldDoc.createElementNS(NS_SLD, "StyledLayerDescriptor");
        sldDoc.appendChild(sldEl);
        sldEl.setAttributeNS(NS_SLD, "version", "1.0.0");
        sldEl.setAttributeNS("http://www.w3.org/2001/XMLSchema-instance", "xsi:schemaLocation", "http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd");
        sldEl.setAttribute("xmlns:ogc", NS_OGC);
        sldEl.setAttribute("xmlns:gml", NS_GML);
        EntityManager em = Stripersist.getEntityManager();
        service.loadLayerTree(em);

        Queue<Layer> layerStack = new LinkedList();
        Layer l = service.getTopLayer();
        while(l != null) {
            layerStack.addAll(service.getLayerChildrenCache(l, em));

            if(l.getName() != null) {
                Element nlEl = sldDoc.createElementNS(NS_SLD, "NamedLayer");
                sldEl.appendChild(nlEl);
                String title = l.getTitleAlias() != null ? l.getTitleAlias() : l.getTitle();
                if(title != null) {
                    nlEl.appendChild(sldDoc.createComment(" Layer '" + title + "' "));
                }
                Element nEl = sldDoc.createElementNS(NS_SLD, "Name");
                nEl.setTextContent(l.getName());
                nlEl.appendChild(nEl);

                if(l.getFeatureType() != null) {
                    String protocol = "";
                    if(l.getFeatureType().getFeatureSource() != null) {
                        protocol = " (protocol " + l.getFeatureType().getFeatureSource().getProtocol() + ")";
                    }

                    String ftComment = " This layer has a feature type" + protocol + " you can use in a FeatureTypeConstraint element as follows:\n";
                    ftComment += "            <LayerFeatureConstraints>\n";
                    ftComment += "                <FeatureTypeConstraint>\n";
                    ftComment += "                    <FeatureTypeName>" + l.getFeatureType().getTypeName() + "</FeatureTypeName>\n";
                    ftComment += "                    Add ogc:Filter or Extent element here. ";
                    if(l.getFeatureType().getAttributes().isEmpty()) {
                        ftComment += " No feature type attributes are known.\n";
                    } else {
                        ftComment += " You can use the following feature type attributes in ogc:PropertyName elements:\n";
                        for(AttributeDescriptor ad: l.getFeatureType().getAttributes()) {
                            ftComment += "                    <ogc:PropertyName>" + ad.getName() + "</ogc:PropertyName>";
                            if(ad.getAlias() != null) {
                                ftComment += " (" + ad.getAlias() + ")";
                            }
                            if(ad.getType() != null) {
                                ftComment += " (type: " + ad.getType() + ")";
                            }
                            ftComment += "\n";
                        }
                    }
                    ftComment += "                </FeatureTypeConstraint>\n";
                    ftComment += "            </LayerFeatureConstraints>\n";
                    ftComment += "        ";
                    nlEl.appendChild(sldDoc.createComment(ftComment));
                }

                nlEl.appendChild(sldDoc.createComment(" Add a UserStyle or NamedStyle element here "));
                String styleComment = " (no server-side named styles are known other than 'default') ";
                ClobElement styleDetail = l.getDetails().get(Layer.DETAIL_WMS_STYLES);
                if(styleDetail != null) {
                    try {
                        JSONArray styles = new JSONArray(styleDetail.getValue());

                        if(styles.length() > 0) {
                            styleComment = " The following NamedStyles are available according to the capabilities: \n";

                            for(int i = 0; i < styles.length(); i++) {
                                JSONObject jStyle = styles.getJSONObject(i);

                                styleComment += "            <NamedStyle><Name>" + jStyle.getString("name") + "</Name></NamedStyle>";
                                if(jStyle.has("title")) {
                                    styleComment += " (" + jStyle.getString("title") + ")";
                                }
                                styleComment += "\n";
                            }
                        }

                    } catch(JSONException e) {
                    }
                    styleComment += "        ";
                }
                nlEl.appendChild(sldDoc.createComment(styleComment));
            }

            l = layerStack.poll();
        }

        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer t = tf.newTransformer();
        t.setOutputProperty(OutputKeys.INDENT, "yes");
        t.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4");
        t.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

        DOMSource source = new DOMSource(sldDoc);
        ByteArrayOutputStream bos =  new ByteArrayOutputStream();
        StreamResult result = new StreamResult(bos);
        t.transform(source, result);
        generatedSld = new String(bos.toByteArray(), "UTF-8");

        // indent doesn't add newline after XML declaration
        generatedSld = generatedSld.replaceFirst("\"\\?><StyledLayerDescriptor", "\"?>\n<StyledLayerDescriptor");
        return new ForwardResolution(JSP_EDIT_SLD);
    }

    @DontValidate
    public Resolution cqlToFilter() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("success", Boolean.FALSE);

        try {
            List<Filter> filters = CQL.toFilterList(cql);

            FilterTransformer filterTransformer = new FilterTransformer();
            filterTransformer.setIndentation(4);
            filterTransformer.setOmitXMLDeclaration(true);
            filterTransformer.setNamespaceDeclarationEnabled(false);
            StringWriter sw = new StringWriter();
            for(Filter filter: filters) {
                sw.append('\n');
                filterTransformer.transform(filter, sw);
            }

            json.put("filter", sw.toString());

            json.put("success", Boolean.TRUE);
        } catch(Exception e) {
            String error = ExceptionUtils.getMessage(e);
            if(e.getCause() != null) {
                error += "; cause: " + ExceptionUtils.getMessage(e.getCause());
            }
            json.put("error", error);
        }
        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    public Resolution validateSldXml() {
        Resolution jsp = new ForwardResolution(JSP_EDIT_SLD);
        Document sldXmlDoc = null;
        String stage = getBundle().getString("viewer_admin.geoserviceactionbean.noparsexml");
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();

            sldXmlDoc = db.parse(new ByteArrayInputStream(sld.getSldBody().getBytes("UTF-8")));

            stage = getBundle().getString("viewer_admin.geoserviceactionbean.slderror");

            Element root = sldXmlDoc.getDocumentElement();
            if(!"StyledLayerDescriptor".equals(root.getLocalName())) {
                throw new Exception(getBundle().getString("viewer_admin.geoserviceactionbean.wrongroot"));
            }
            String version = root.getAttribute("version");
            if(version == null || !("1.0.0".equals(version) || "1.1.0".equals(version))) {
                throw new Exception(getBundle().getString("viewer_admin.geoserviceactionbean.invalidsld"));
            }

            SchemaFactory sf = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            Schema s = sf.newSchema(new URL("http://schemas.opengis.net/sld/" + version + "/StyledLayerDescriptor.xsd"));
            s.newValidator().validate(new DOMSource(sldXmlDoc));

        } catch(Exception e) {
            String extra = "";
            if(e instanceof SAXParseException) {
                SAXParseException spe = (SAXParseException)e;
                if(spe.getLineNumber() != -1) {
                    extra = " (line " + spe.getLineNumber();
                    if(spe.getColumnNumber() != -1) {
                        extra += ", column " + spe.getColumnNumber();
                    }
                    extra += ")";
                }
            }
            getContext().getValidationErrors().addGlobalError(new SimpleError("{2}: {3}{4}",
                    stage,
                    ExceptionUtils.getMessage(e),
                    extra
            ));
            return jsp;
        }

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.validsld")));

        return jsp;
    }

    public Resolution saveSld() {

        if(sld.getId() == null) {
            service.getStyleLibraries().add(sld);
        }

        if(sld.isDefaultStyle()) {
            for(StyleLibrary otherSld: service.getStyleLibraries()) {
                if(otherSld.getId() != null && !otherSld.getId().equals(sld.getId())) {
                    otherSld.setDefaultStyle(false);
                }
            }
        }

        try {
            sld.setNamedLayerUserStylesJson(null);
            InputSource sldBody = null;

            if(sld.getExternalUrl() == null) {
                sldBody = new InputSource(new StringReader(sld.getSldBody()));
            } else {
                sldBody = new InputSource(new URL(sld.getExternalUrl()).openStream());
            }

            sld.setNamedLayerUserStylesJson(StyleLibrary.parseSLDNamedLayerUserStyles(sldBody).toString(4));
        } catch(Exception e) {
            log.error("Fout bij bepalen UserStyle namen van NamedLayers", e);
            getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.geoserviceactionbean.nostyles"), e.getClass().getName(), e.getLocalizedMessage()));
        }

        Stripersist.getEntityManager().getTransaction().commit();
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.geoserviceactionbean.sldsaved")));
        return edit();
    }

}
