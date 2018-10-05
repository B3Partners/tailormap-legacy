/*
 * Copyright (C) 2011-2016 B3Partners B.V.
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

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.security.Principal;
import java.util.*;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.criteria.*;
import javax.servlet.http.HttpServletRequest;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.util.HtmlUtil;
import net.sourceforge.stripes.util.StringUtil;
import net.sourceforge.stripes.validation.LocalizableError;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.components.ComponentRegistryInitializer;
import nl.b3p.viewer.config.ClobElement;
import org.stripesstuff.stripersist.Stripersist;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.metadata.Metadata;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.util.SelectedContentCache;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/app/{name}/v{version}")
@StrictBinding
public class ApplicationActionBean implements ActionBean {

    private ActionBeanContext context;

    @Validate
    private String name;

    @Validate
    private boolean unknown;

    @Validate
    private String version;

    @Validate
    private String bookmark;

    @Validate
    private boolean debug;

    @Validate(on = "retrieveAppConfigJSON")
    private Application application;

    private String componentSourceHTML;
    private String appConfigJSON;

    private String viewerType;

    private String title;

    private JSONObject user;

    private String loginUrl;
    private HashMap<String,Object> globalLayout;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return context;
    }

    public String getComponentSourceHTML() {
        return componentSourceHTML;
    }

    public void setComponentSourceHTML(String componentSourceHTML) {
        this.componentSourceHTML = componentSourceHTML;
    }

    public String getAppConfigJSON() {
        return appConfigJSON;
    }

    public void setAppConfigJSON(String appConfigJSON) {
        this.appConfigJSON = appConfigJSON;
    }

    public String getViewerType(){
        return viewerType;
    }

    public void setViewerType(String viewerType){
        this.viewerType = viewerType;
    }

    public String getTitle(){
        return title;
    }

    public void setTitle(String title){
        this.title = title;
    }

    public JSONObject getUser() {
        return user;
    }

    public void setUser(JSONObject user) {
        this.user = user;
    }

    public String getLoginUrl() {
        return loginUrl;
    }

    public void setLoginUrl(String loginUrl) {
        this.loginUrl = loginUrl;
    }

    public HashMap getGlobalLayout() {
        return globalLayout;
    }

    public void setGlobalLayout(HashMap globalLayout) {
        this.globalLayout = globalLayout;
    }

    public boolean isUnknown() {
        return unknown;
    }

    public void setUnknown(boolean unknown) {
        this.unknown = unknown;
    }

    public String getBookmark() {
        return bookmark;
    }

    public void setBookmark(String bookmark) {
        this.bookmark = bookmark;
    }
    //</editor-fold>

    static Application findApplication(String name, String version) {
        EntityManager em = Stripersist.getEntityManager();
        if(name != null) {
            CriteriaBuilder cb = em.getCriteriaBuilder();
            CriteriaQuery q = cb.createQuery(Application.class);
            Root<Application> root = q.from(Application.class);
            Predicate namePredicate = cb.equal(root.get("name"), name);
            Predicate versionPredicate = version != null
                    ? cb.equal(root.get("version"), version)
                    : cb.isNull(root.get("version"));
            q.where(cb.and(namePredicate, versionPredicate));
            try {
                return (Application) em.createQuery(q).getSingleResult();
            } catch(NoResultException nre) {
                String decodedName = StringUtil.urlDecode(name);
                if(!decodedName.equals(name)){
                    return findApplication(decodedName, version);
            }
        }
        }
        return null;
    }

    public Resolution saveCache() throws JSONException, IOException{
        Resolution view = view();

        EntityManager em = Stripersist.getEntityManager();
        Resolution r = checkRestriction(context, application, em);
        if (r != null) {
            return r;
        }
        SelectedContentCache cache = new SelectedContentCache();
        JSONObject sc = cache.createSelectedContent(application, false,false, false,em);
        application.getDetails().put("selected_content_cache", new ClobElement(sc.toString()));
        em.getTransaction().commit();
        return view;
    }

     public Resolution retrieveCache() throws JSONException, IOException{
        Resolution view = view();

        EntityManager em = Stripersist.getEntityManager();
        Resolution r = checkRestriction(context, application, em);
        if (r != null) {
            return r;
        }
        ClobElement el = application.getDetails().get("selected_content_cache");
        appConfigJSON = el.getValue();
        return view;
    }

    public Resolution retrieveAppConfigJSON(){
        EntityManager em = Stripersist.getEntityManager();
        JSONObject response = new JSONObject();
        response.put("success", false);
        appConfigJSON = application.toJSON(context.getRequest(),false, false,em);
        response.put("config", appConfigJSON);
        response.put("success", true);
        return new StreamingResolution("application/json", new StringReader(response.toString()));
    }

    @DefaultHandler
    public Resolution view() throws JSONException, IOException {
        if(unknown){
            getDefaultViewer();
            /* Redirected here from /index.jsp: further redirect to app with
             * name and version parameters of default app in URL and
             * unknown=false. This makes sure that links in URL always include
             * the app name. Required for compact bookmark links for default app
             * to work.
             */
            return new RedirectResolution(ApplicationActionBean.class)
                    .addParameter("name", name)
                    .addParameter("version", version)
                    .addParameter("debug", debug);

        }
        application = findApplication(name, version);

        if(application == null) {
            getContext().getValidationErrors().addGlobalError(new LocalizableError("app.notfound", name + (version != null ? " v" + version : "")));
            return new ForwardResolution("/WEB-INF/jsp/error.jsp");
        }

        RedirectResolution login = new RedirectResolution(ApplicationActionBean.class)
                .addParameter("name", name) // binded parameters not included ?
                .addParameter("version", version)
                .addParameter("debug", debug)
                .addParameter("uitloggen", true)
                .addParameter("bookmark", bookmark)
                .includeRequestParameters(true);

        if(bookmark != null){
            login.addParameter("bookmark", bookmark);
        }
        loginUrl = login.getUrl(context.getLocale());

        String username = context.getRequest().getRemoteUser();
        if(application.isAuthenticatedRequired() && username == null) {
            return login;
        }

        EntityManager em = Stripersist.getEntityManager();
        Resolution r = checkRestriction(context, application, em);
        if(r != null){
            return r;
        }

        if(username != null) {
            user = new JSONObject();
            user.put("name", username);
            JSONObject roles = new JSONObject();
            user.put("roles", roles);
            for(String role: Authorizations.getRoles(context.getRequest(),em)) {
                roles.put(role, Boolean.TRUE);
            }
        }

        buildComponentSourceHTML(em);

        appConfigJSON = application.toJSON(context.getRequest(),false, false,em);
        this.viewerType = retrieveViewerType();
        this.title = application.getTitle();
        if(title.isEmpty()) {
            this.title = application.getName();
        }

        //make hashmap for jsonobject.
        this.globalLayout = new HashMap<String,Object>();
        JSONObject layout = application.getGlobalLayout();
        Iterator<String> keys = layout.keys();
        while (keys.hasNext()){
            String key = keys.next();
            this.globalLayout.put(key, layout.get(key));
        }
        context.getResponse().addHeader("X-UA-Compatible", "IE=edge");
        return new ForwardResolution("/WEB-INF/jsp/app.jsp");
    }

    public static Resolution checkRestriction(ActionBeanContext context, Application application, EntityManager em){

        String username = context.getRequest().getRemoteUser();
        User u = null;
        if(username != null){
            Principal p = context.getRequest().getUserPrincipal();
            if( p instanceof User){
                u = (User)p;
            }else{
                u = em.find(User.class, p.getName());
            }
        }
        if (!Authorizations.isApplicationReadAuthorized(application, context.getRequest(), em) && (username == null || u != null && u.isAuthenticatedByIp())) {
            RedirectResolution login = new RedirectResolution(LoginActionBean.class)
                    .addParameter("name", application.getName()) // binded parameters not included ?
                    .addParameter("version", application.getVersion())
                    .includeRequestParameters(true);
            context.getRequest().getSession().invalidate();
            return login;
        } else if (!Authorizations.isApplicationReadAuthorized(application, context.getRequest(), em) && username != null) {
            context.getValidationErrors().addGlobalError(new SimpleError("Niet genoeg rechten"));
            context.getRequest().getSession().invalidate();
            return new ForwardResolution("/WEB-INF/jsp/error_retry.jsp");
        }
        return null;
    }

    /**
     * Build a hash key to make the single component source for all components
     * cacheable but updateable when the roles of the user change. This is not
     * meant to be a secure hash, the roles of a user are not secret.
     *
     * @param request servlet request with user credential
     * @param em the entitymanahger to use for database access
     * @return a key to use as a cache identifyer
     */
    public static int getRolesCachekey(HttpServletRequest request, EntityManager em) {
        Set<String> roles = Authorizations.getRoles(request, em);

        if(roles.isEmpty()) {
            return 0;
        }

        List<String> sorted = new ArrayList<String>(roles);
        Collections.sort(sorted);

        int hash = 0;
        for(String role: sorted) {
            hash = hash ^ role.hashCode();
        }
        return hash;
    }

    public Resolution uitloggen(){
        application = findApplication(name, version);

        context.getRequest().getSession().invalidate();

        if("true".equals(context.getRequest().getParameter("logout"))
        && "true".equals(context.getRequest().getParameter("returnAfterLogout"))) {
            RedirectResolution r = new RedirectResolution(ApplicationActionBean.class)
                    .addParameter("name", application.getName())
                    .addParameter("bookmark", bookmark)
                    .addParameter("version", application.getVersion());
            if(bookmark != null ){
                r.addParameter("bookmark", bookmark);
            }
            return r;
        } else {
            RedirectResolution r = new RedirectResolution(LoginActionBean.class)
                    .addParameter("name", application.getName())
                    .addParameter("bookmark", bookmark)
                    .addParameter("version", application.getVersion());
            if(bookmark != null){
                r.addParameter("bookmark", bookmark);
            }
            return r;
        }
    }

    private void buildComponentSourceHTML(EntityManager em) throws IOException {

        StringBuilder sb = new StringBuilder();

        // Sort components by classNames, so order is always the same for debugging
        ComponentRegistry cr = ComponentRegistryInitializer.getInstance();

        List<ConfiguredComponent> comps = new ArrayList<ConfiguredComponent>(application.getComponents());
        Collections.sort(comps);
        if(isDebug()) {

            Set<String> classNamesDone = new HashSet<String>();
            for(ConfiguredComponent cc: comps) {

                if(!Authorizations.isConfiguredComponentAuthorized(cc, context.getRequest(), em)) {
                    continue;
                }
                if(!classNamesDone.contains(cc.getClassName())) {
                    classNamesDone.add(cc.getClassName());

                    if(cc.getViewerComponent() != null && cc.getViewerComponent().getSources() != null) {
                        for(File f: cc.getViewerComponent().getSources()) {
                            String url = new ForwardResolution(ComponentActionBean.class, "source")
                                    .addParameter("app", name)
                                    .addParameter("version", version)
                                    .addParameter("className", cc.getClassName())
                                    .addParameter("file", f.getName())
                                    .getUrl(context.getLocale());

                            sb.append("        <script type=\"text/javascript\" src=\"");
                            sb.append(HtmlUtil.encode(context.getServletContext().getContextPath() + url));
                            sb.append("\"></script>\n");
                        }
                    }
                }
            }
        } else {
            // If not debugging, create a single script tag with all source
            // for all components for the application for a minimal number of HTTP requests

            // The ComponentActionBean supports conditional HTTP requests using
            // Last-Modified.
            // Create a hash value that will change when the classNames used
            // in the application change, so that a browser will not use a
            // previous version from cache with other contents.

            int hash = 0;
            Set<String> classNamesDone = new HashSet<String>();
            for (ConfiguredComponent cc : comps) {
                if (!Authorizations.isConfiguredComponentAuthorized(cc, context.getRequest(), em)) {
                    continue;
                }

                if(!classNamesDone.contains(cc.getClassName())) {
                    hash = hash ^ cc.getClassName().hashCode();
                } else {
                    classNamesDone.add(cc.getClassName());
                }
            }
            if(user != null) {
                // Update component sources when roles of user change
                hash = hash ^ getRolesCachekey(context.getRequest(), em);

                // Update component sources when roles of configured components
                // may have changed
                hash = hash ^ (int)application.getAuthorizationsModified().getTime();
            }

            String url = new ForwardResolution(ComponentActionBean.class, "source")
                    .addParameter("app", name)
                    .addParameter("version", version)
                    .addParameter("minified", true)
                    .addParameter("hash", hash)
                    .getUrl(context.getLocale());

            sb.append("        <script type=\"text/javascript\" src=\"");
            sb.append(HtmlUtil.encode(context.getServletContext().getContextPath() + url));
            sb.append("\"></script>\n");
        }

        componentSourceHTML = sb.toString();
    }

    private String retrieveViewerType (){
        String type = "FlamingoMap";
        String typePrefix = "viewer.mapcomponents";
        Set<ConfiguredComponent> components = application.getComponents();
        for (ConfiguredComponent component : components) {
            String className = component.getClassName();
            if(className.startsWith(typePrefix)){
                type = className.substring(typePrefix.length() +1).toLowerCase().replace("map", "");
                break;
            }
        }
        return type;
    }

    private void getDefaultViewer(){
        EntityManager em = Stripersist.getEntityManager();
        try {
            Metadata md = em.createQuery("from Metadata where configKey = :key", Metadata.class).setParameter("key", Metadata.DEFAULT_APPLICATION).getSingleResult();
            String appId = md.getConfigValue();
            Long id = Long.parseLong(appId);
            Application app = em.find(Application.class, id);
            name = app.getName();
            version = app.getVersion();
        } catch (NoResultException | NullPointerException e) {
            name = "default";
            version = null;
        }
    }
}
