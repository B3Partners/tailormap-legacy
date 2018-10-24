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
package nl.b3p.viewer.admin.stripes;

import java.text.MessageFormat;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredComponent;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.*;
import nl.b3p.viewer.config.security.Authorizations.ApplicationCache;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.config.services.Layer;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/user/{$event}")
@RolesAllowed({Group.ADMIN, Group.USER_ADMIN})
public class UserActionBean implements ActionBean {

    private static final String JSP = "/WEB-INF/jsp/security/user.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/security/edituser.jsp";
    private ActionBeanContext context;
    private ResourceBundle bundle;
    @Validate
    private int page;
    @Validate
    private int start;
    @Validate
    private int limit;
    @Validate
    private String sort;
    @Validate
    private String dir;
    @Validate
    private JSONArray filter;
    @Validate
    private User user;
    @Validate
    private String username;
    @Validate
    private String password;
    private List<Group> allGroups;
    @Validate
    private List<String> groups = new ArrayList<String>();
    @Validate
    private List<String> ips = new ArrayList<String>();
    
    private JSONArray ipJSON = new JSONArray();
    
    @Validate
    private Map<String, String> details = new HashMap<String, String>();

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }

    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<Group> getAllGroups() {
        return allGroups;
    }

    public void setAllGroups(List<Group> allGroups) {
        this.allGroups = allGroups;
    }

    public List<String> getGroups() {
        return groups;
    }

    public void setGroups(List<String> groups) {
        this.groups = groups;
    }

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public JSONArray getFilter() {
        return filter;
    }

    public void setFilter(JSONArray filter) {
        this.filter = filter;
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

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public List<String> getIps() {
        return ips;
    }

    public void setIps(List<String> ips) {
        this.ips = ips;
    }

    public JSONArray getIpJSON() {
        return ipJSON;
    }

    public void setIpJSON(JSONArray ipJSON) {
        this.ipJSON = ipJSON;
    }
    //</editor-fold>

    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }
        
    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution defaultResolution() {
        return new ForwardResolution(JSP);
    }

    @Before(stages = LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        allGroups = Stripersist.getEntityManager().createQuery("from Group order by name").getResultList();
    }

    @DontValidate
    public Resolution edit() {

        if (user != null) {
            for (Group g : user.getGroups()) {
                groups.add(g.getName());
            }
            details = user.getDetails();
            username = user.getUsername();
            
            for (String ip : user.getIps()) {
                ipJSON.put(ip);
            }
        }

        return new ForwardResolution(EDITJSP);
    }

    @DontBind
    public Resolution cancel() {
        return new ForwardResolution(EDITJSP);
    }

    @ValidationMethod(on = "save")
    public void validate(ValidationErrors errors) throws Exception {
        // If user already persistent username cannot be changed
        if (user == null) {

            if (username == null) {
                errors.add("username", new SimpleError(getBundle().getString("viewer_admin.useractionbean.nameobl")));
                return;
            }

            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from User where username = :username").setMaxResults(1).setParameter("username", username).getSingleResult();

                errors.add("username", new SimpleError(getBundle().getString("viewer_admin.useractionbean.namedup")));
                return;

            } catch (NoResultException nre) {
                // username is unique
            }
        }

        if (user == null) {
            if (password == null) {
                errors.add("password", new SimpleError(getBundle().getString("viewer_admin.useractionbean.pwobl")));
                return;
            }
        }

        if (password != null) {
            if (password.length() < User.MIN_PASSWORD_LENGTH) {
                errors.add("password", new SimpleError( MessageFormat.format(getBundle().getString("viewer_admin.useractionbean.pwshort"), User.MIN_PASSWORD_LENGTH)));
                return;
            }
        }
    }

    public Resolution save() throws Exception {

        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.changePassword(password);
        } else {
            if (password != null) {
                user.changePassword(password);
            }
        }

        user.getDetails().clear();
        user.getDetails().putAll(details);

        user.getGroups().clear();
        for (String groupName : groups) {
            user.getGroups().add(Stripersist.getEntityManager().find(Group.class, groupName));
        }
        
        user.getIps().clear();
        user.getIps().addAll(ips);

        Stripersist.getEntityManager().persist(user);
        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.useractionbean.usaved")));
        return new ForwardResolution(EDITJSP);
    }

    @DontValidate
    public Resolution delete() {
        boolean inUse = false;
        String currentUser = context.getRequest().getUserPrincipal().getName();
        if (currentUser.equals(user.getUsername())) {
            inUse = true;
            getContext().getMessages().add(new SimpleError(getBundle().getString("viewer_admin.useractionbean.unorem")));
        }
        List applications = Stripersist.getEntityManager().createQuery("from Application where owner = :owner").setParameter("owner", user).getResultList();
        if (applications != null && applications.size() > 0) {
            inUse = true;
            getContext().getMessages().add(new SimpleError(getBundle().getString("viewer_admin.useractionbean.uinuse")));
        }

        if (!inUse) {
            Stripersist.getEntityManager().remove(user);
            Stripersist.getEntityManager().getTransaction().commit();
            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.useractionbean.urem")));
        }

        return new ForwardResolution(EDITJSP);
    }

    @DontValidate
    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();

        String filterName = "";
        String filterOrganization = "";
        String filterPosition = "";
        //String filterDescription = "";
        /*
         * FILTERING: filter is delivered by frontend as JSON array [{property,
         * value}] for demo purposes the value is now returned, ofcourse here
         * should the DB query be built to filter the right records
         */
        if (this.getFilter() != null) {
            for (int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if (property.equals("username")) {
                    filterName = value;
                }
                if (property.equals("organization")) {
                    filterOrganization = value;
                }
                if (property.equals("position")) {
                    filterPosition = value;
                }
            }
        }

        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(User.class);

        /*
         * Sorting is delivered by the frontend as two variables: sort which
         * holds the column name and dir which holds the direction (ASC, DESC).
         */
        if (sort != null && dir != null && sort.equals("username")) {
            Order order = null;
            if (dir.equals("ASC")) {
                order = Order.asc(sort);
            } else {
                order = Order.desc(sort);
            }
            order.ignoreCase();
            c.addOrder(order);
        }

        if (filterName != null && filterName.length() > 0) {
            Criterion nameCrit = Restrictions.ilike("username", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        List<String> usersToSelect = new ArrayList<String>();
        if (filterOrganization != null && filterOrganization.length() > 0) {
            Criteria detailsCrit = sess.createCriteria(User.class);
            List<User> users = detailsCrit.list();
            for (User us : users) {
                Map<String,String> map = us.getDetails();
                if(map.containsKey("organization") ){
                    String org = map.get("organization").toLowerCase();
                    if(org.indexOf(filterOrganization.toLowerCase())!=-1){
                        usersToSelect.add(us.getUsername());
                    }
                    
                }
            }
            c.add(Restrictions.in("username", usersToSelect));
        }
        
        if (filterPosition != null && filterPosition.length() > 0) {
            Criteria posCrit = sess.createCriteria(User.class);
            List<User> users = posCrit.list();
            for (User us : users) {
                Map<String,String> map = us.getDetails();
                if(map.containsKey("position") ){
                    String org = map.get("position").toLowerCase();
                    if(org.indexOf(filterOrganization.toLowerCase())!=-1){
                        usersToSelect.add(us.getUsername());
                    }
                    
                }
            }
            c.add(Restrictions.in("username", usersToSelect));
        }

        int rowCount = c.list().size();

        c.setMaxResults(limit);
        c.setFirstResult(start);

        List users = c.list();
        for (Iterator it = users.iterator(); it.hasNext();) {
            User us = (User) it.next();
            JSONObject j = this.getGridRow(us.getUsername(), us.getDetails());
            jsonData.put(j);
        }

        final JSONObject grid = new JSONObject();
        grid.put("totalCount", rowCount);
        grid.put("gridrows", jsonData);

        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(grid.toString());
            }
        };
    }

    private JSONObject getGridRow(String username, Map details) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", username);
        j.put("username", username);
        j.put("organization", details.get("organization"));
        j.put("position", details.get("position"));
        return j;
    }
    @Validate
    Application application;
    List<Application> applications;
    Set<Layer> authorizedLayers = Collections.EMPTY_SET;
    Set<Layer> authorizedEditableLayers = Collections.EMPTY_SET;
    Authorizations.ApplicationCache applicationCache;
    Set<Level> authorizedLevels = Collections.EMPTY_SET;
    Set<ApplicationLayer> authorizedAppLayers = Collections.EMPTY_SET;
    Set<ApplicationLayer> authorizedEditableAppLayers = Collections.EMPTY_SET;
    
    Set<ConfiguredComponent> authorizedComponents = Collections.EMPTY_SET;

    //<editor-fold defaultstate="collapsed" desc="getters and setters for authorization collections">
    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public List<Application> getApplications() {
        return applications;
    }

    public Set<ApplicationLayer> getAuthorizedAppLayers() {
        return authorizedAppLayers;
    }

    public Set<ApplicationLayer> getAuthorizedEditableAppLayers() {
        return authorizedEditableAppLayers;
    }

    public Set<Layer> getAuthorizedEditableLayers() {
        return authorizedEditableLayers;
    }

    public Set<Layer> getAuthorizedLayers() {
        return authorizedLayers;
    }

    public Set<Level> getAuthorizedLevels() {
        return authorizedLevels;
    }

    public ApplicationCache getApplicationCache() {
        return applicationCache;
    }

    public Set<ConfiguredComponent> getAuthorizedComponents() {
        return authorizedComponents;
    }

    public void setAuthorizedComponents(Set<ConfiguredComponent> authorizedComponents) {
        this.authorizedComponents = authorizedComponents;
    }
    //</editor-fold>

    public Resolution authorizations() {
        EntityManager em = Stripersist.getEntityManager();

        List<GeoService> services = em.createQuery("from GeoService").getResultList();
        for (GeoService service : services) {
            Authorizations.getLayerAuthorizations(service.getTopLayer(),em);
        }

        Set<String> roles = new HashSet<String>();
        if (user != null) {
            for (Group g : user.getGroups()) {
                if (g != null) {
                    roles.add(g.getName());
                }
            }
        }

        if (!roles.isEmpty()) {

            authorizedLayers = new HashSet<Layer>();
            authorizedEditableLayers = new HashSet<Layer>();

            for (Map.Entry<Long, Authorizations.GeoServiceCache> e : Authorizations.serviceCache.entrySet()) {

                for (Map.Entry<Long, Authorizations.ReadWrite> e2 : e.getValue().getProtectedLayers().entrySet()) {
                    Layer l = Stripersist.getEntityManager().find(Layer.class, e2.getKey());
                    Set<String> readers = e2.getValue().getReaders();
                    Set<String> writers = e2.getValue().getWriters();

                    if (readers.equals(Authorizations.EVERYBODY) || !Collections.disjoint(readers, roles)) {
                        authorizedLayers.add(l);
                    }
                    if (writers.equals(Authorizations.EVERYBODY) || !Collections.disjoint(writers, roles)) {
                        authorizedEditableLayers.add(l);
                    }
                }
            }
        }

        applications = em.createQuery("from Application order by name, version").getResultList();
        if (application != null) {

            applicationCache = Authorizations.getApplicationCache(application,em);

            if (!roles.isEmpty()) {
                authorizedLevels = new HashSet<Level>();

                for (Map.Entry<Long, Authorizations.Read> e : applicationCache.getProtectedLevels().entrySet()) {
                    Level l = Stripersist.getEntityManager().find(Level.class, e.getKey());
                    Set<String> readers = e.getValue().getReaders();
                    if (readers.equals(Authorizations.EVERYBODY) || !Collections.disjoint(readers, roles)) {
                        authorizedLevels.add(l);
                    }
                }
                authorizedAppLayers = new HashSet<ApplicationLayer>();
                authorizedEditableAppLayers = new HashSet<ApplicationLayer>();

                for (Map.Entry<Long, Authorizations.ReadWrite> e : applicationCache.getProtectedAppLayers().entrySet()) {
                    ApplicationLayer al = Stripersist.getEntityManager().find(ApplicationLayer.class, e.getKey());

                    Set<String> readers = e.getValue().getReaders();
                    Set<String> writers = e.getValue().getWriters();

                    if (readers.equals(Authorizations.EVERYBODY) || !Collections.disjoint(readers, roles)) {
                        authorizedAppLayers.add(al);
                    }
                    if (writers.equals(Authorizations.EVERYBODY) || !Collections.disjoint(writers, roles)) {
                        authorizedEditableAppLayers.add(al);
                    }
                }
                
                authorizedComponents = new HashSet();
                for(ConfiguredComponent cc: application.getComponents()) {
                    if(cc.getReaders().equals(Authorizations.EVERYBODY) || !Collections.disjoint(cc.getReaders(), roles)) {
                        authorizedComponents.add(cc);
                    }                    
                }
            }            
        }

        return new ForwardResolution("/WEB-INF/jsp/security/authorizations.jsp");
    }
}
