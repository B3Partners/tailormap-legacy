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
package nl.b3p.viewer.admin.stripes;

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
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.*;
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
@RolesAllowed({"Admin","UserAdmin"})
public class UserActionBean implements ActionBean {
    private static final String JSP = "/WEB-INF/jsp/security/user.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/security/edituser.jsp";
      
    private ActionBeanContext context;
    
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
    private Map<String,String> details = new HashMap<String,String>();

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
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
    //</editor-fold>
    
    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution defaultResolution() {
        return new ForwardResolution(JSP);
    }

    @Before(stages=LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        allGroups = Stripersist.getEntityManager().createQuery("from Group").getResultList();
    }

    @DontValidate
    public Resolution edit() {

        if(user != null) {
            for(Group g: user.getGroups()) {
                groups.add(g.getName());
            }
            details = user.getDetails();
            username = user.getUsername();
        }
        
        return new ForwardResolution(EDITJSP);
    }

    @DontBind
    public Resolution cancel() {        
        return new ForwardResolution(EDITJSP);
    }

    @ValidationMethod(on="save")
    public void validate(ValidationErrors errors) throws Exception {
        // If user already persistent username cannot be changed
        if(user == null) {

            if(username == null) {
                errors.add("username", new LocalizableError("validation.required.valueNotPresent"));
                return;
            }

            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from User where username = :username")
                        .setMaxResults(1)
                        .setParameter("username", username)
                        .getSingleResult();

                errors.add("username", new SimpleError("Gebruikersnaam bestaat al"));
                return;

            } catch(NoResultException nre) {
                // username is unique
            }
        }

        if(user == null) {
            if(password == null) {
                errors.add("password", new LocalizableError("validation.required.valueNotPresent"));
                return;
            }
        }

        if(password != null) {
            if(password.length() < User.MIN_PASSWORD_LENGTH) {
                errors.add("password", new LocalizableError("validation.minlength.valueTooShort", User.MIN_PASSWORD_LENGTH));
                return;
            }
        }
    }

    public Resolution save() throws Exception {

        if(user == null) {
            user = new User();
            user.setUsername(username);
            user.changePassword(password);
        } else {
            if(password != null) {
                user.changePassword(password);
            }
        }

        user.getDetails().clear();
        user.getDetails().putAll(details);

        user.getGroups().clear();
        for(String groupName: groups) {
            user.getGroups().add(Stripersist.getEntityManager().find(Group.class, groupName));
        }

        Stripersist.getEntityManager().persist(user);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Gebruiker is opgeslagen"));
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution delete() {
        boolean inUse = false;
        String currentUser = context.getRequest().getUserPrincipal().getName();
        if(currentUser.equals(user.getUsername())){
            inUse = true;
            getContext().getMessages().add(new SimpleError("Het is niet mogelijk om de gebruiker waar u mee bent ingelogt te verwijderen."));
        }
        List applications = Stripersist.getEntityManager().createQuery("from Application where owner = :owner")
                .setParameter("owner", user).getResultList();
        if(applications != null && applications.size() > 0){
            inUse = true;
            getContext().getMessages().add(new SimpleError("Het is niet mogelijk om de gebruiker te verwijderen, omdat deze eigenaar is van een of meerdere applicaties."));
        }
                
        if(!inUse){
            Stripersist.getEntityManager().remove(user);
            Stripersist.getEntityManager().getTransaction().commit();
            getContext().getMessages().add(new SimpleMessage("Gebruiker is verwijderd"));
        }
        
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        //String filterDescription = "";
        /* 
         * FILTERING: filter is delivered by frontend as JSON array [{property, value}]
         * for demo purposes the value is now returned, ofcourse here should the DB
         * query be built to filter the right records
         */
        if(this.getFilter() != null) {
            for(int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if(property.equals("username")) {
                    filterName = value;
                }
                /*if(property.equals("description")) {
                    filterDescription = value;
                }*/
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(User.class);
        
        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if(sort != null && dir != null){
            Order order = null;
            if(dir.equals("ASC")){
               order = Order.asc(sort);
            }else{
                order = Order.desc(sort);
            }
            order.ignoreCase();
            c.addOrder(order);
        }
        
        if(filterName != null && filterName.length() > 0){
            Criterion nameCrit = Restrictions.ilike("username", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        /*if(filterDescription != null && filterDescription.length() > 0){
            Criterion urlCrit = Restrictions.ilike("description", filterDescription, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }*/
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
        List users = c.list();
        for(Iterator it = users.iterator(); it.hasNext();){
            User us = (User)it.next();
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

    Set<String> roles;
        
    Map<Layer,Set<String>[]> protectedLayers = new HashMap<Layer,Set<String>[]>();
    Set<Layer> authorizedLayers = Collections.EMPTY_SET;
    Set<Layer> authorizedEditableLayers = Collections.EMPTY_SET;    
    
    Map<Level,Set<String>> protectedLevels = new HashMap<Level,Set<String>>();
    Map<ApplicationLayer,Set<String>[]> protectedAppLayers = new HashMap<ApplicationLayer,Set<String>[]>();
    Set<Level> authorizedLevels = Collections.EMPTY_SET;
    Set<ApplicationLayer> authorizedAppLayers = Collections.EMPTY_SET;
    Set<ApplicationLayer> authorizedEditableAppLayers = Collections.EMPTY_SET;

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

    public void setApplications(List<Application> applications) {
        this.applications = applications;
    }

    public Set<ApplicationLayer> getAuthorizedAppLayers() {
        return authorizedAppLayers;
    }

    public void setAuthorizedAppLayers(Set<ApplicationLayer> authorizedAppLayers) {
        this.authorizedAppLayers = authorizedAppLayers;
    }

    public Set<ApplicationLayer> getAuthorizedEditableAppLayers() {
        return authorizedEditableAppLayers;
    }

    public void setAuthorizedEditableAppLayers(Set<ApplicationLayer> authorizedEditableAppLayers) {
        this.authorizedEditableAppLayers = authorizedEditableAppLayers;
    }

    public Set<Layer> getAuthorizedEditableLayers() {
        return authorizedEditableLayers;
    }

    public void setAuthorizedEditableLayers(Set<Layer> authorizedEditableLayers) {
        this.authorizedEditableLayers = authorizedEditableLayers;
    }

    public Set<Layer> getAuthorizedLayers() {
        return authorizedLayers;
    }

    public void setAuthorizedLayers(Set<Layer> authorizedLayers) {
        this.authorizedLayers = authorizedLayers;
    }

    public Set<Level> getAuthorizedLevels() {
        return authorizedLevels;
    }

    public void setAuthorizedLevels(Set<Level> authorizedLevels) {
        this.authorizedLevels = authorizedLevels;
    }

    public Map<Layer, Set<String>[]> getProtectedLayers() {
        return protectedLayers;
    }

    public void setProtectedLayers(Map<Layer, Set<String>[]> protectedLayers) {
        this.protectedLayers = protectedLayers;
    }

    public Map<Level, Set<String>> getProtectedLevels() {
        return protectedLevels;
    }

    public void setProtectedLevels(Map<Level, Set<String>> protectedLevels) {
        this.protectedLevels = protectedLevels;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public Map<ApplicationLayer, Set<String>[]> getProtectedAppLayers() {
        return protectedAppLayers;
    }

    public void setProtectedAppLayers(Map<ApplicationLayer, Set<String>[]> protectedAppLayers) {
        this.protectedAppLayers = protectedAppLayers;
    }
    //</editor-fold>
    
    public Resolution authorizations() {
        EntityManager em = Stripersist.getEntityManager();

        // We currently ignore protected categories - not accessible via user interface
        
        // Determine which layers are not authorized for everyone        
        List<Layer> rootLayers = em.createQuery("select distinct s.topLayer from GeoService s").getResultList();
        for(Layer rootLayer: rootLayers) {
            checkLayerAuthorizations(rootLayer, Group.EVERYBODY_AUTHORIZED, Group.EVERYBODY_AUTHORIZED);
        }
        
        roles = new HashSet<String>();
        for(Group g: user.getGroups()) {
            roles.add(g.getName());
        }
        if(!roles.isEmpty()) {
            
            authorizedLayers = new HashSet<Layer>();
            authorizedEditableLayers = new HashSet<Layer>();
            
            for(Map.Entry<Layer,Set<String>[]> e: protectedLayers.entrySet()) {
                
                Set<String> readers = e.getValue()[0];
                Set<String> writers = e.getValue()[1];
                
                if(readers.equals(Group.EVERYBODY_AUTHORIZED) || !Collections.disjoint(readers, roles)) {
                    authorizedLayers.add(e.getKey());
                }
                if(writers.equals(Group.EVERYBODY_AUTHORIZED) || !Collections.disjoint(writers, roles)) {
                    authorizedEditableLayers.add(e.getKey());
                }
            }
        }
        
        applications = em.createQuery("from Application order by name, version").getResultList();
        if(application != null) {
            
            // Determine which levels are not authorized for everyone
            checkLevelAuthorizations(application.getRoot(), Group.EVERYBODY_AUTHORIZED);
            
            if(!roles.isEmpty()) {
                authorizedLevels = new HashSet<Level>();
                
                for(Map.Entry<Level,Set<String>> e: protectedLevels.entrySet()) {
                    Set<String> readers = e.getValue();
                    if(readers.equals(Group.EVERYBODY_AUTHORIZED) || !Collections.disjoint(readers, roles)) {
                        authorizedLevels.add(e.getKey());
                    }
                }
                authorizedAppLayers = new HashSet<ApplicationLayer>();
                authorizedEditableAppLayers = new HashSet<ApplicationLayer>();
                
                for(Map.Entry<ApplicationLayer,Set<String>[]> e: protectedAppLayers.entrySet()) {

                    Set<String> readers = e.getValue()[0];
                    Set<String> writers = e.getValue()[1];

                    if(readers.equals(Group.EVERYBODY_AUTHORIZED) || !Collections.disjoint(readers, roles)) {
                        authorizedAppLayers.add(e.getKey());
                    }
                    if(writers.equals(Group.EVERYBODY_AUTHORIZED) || !Collections.disjoint(writers, roles)) {
                        authorizedEditableAppLayers.add(e.getKey());
                    }
                }
            }            
        }
        
        return new ForwardResolution("/WEB-INF/jsp/security/authorizations.jsp");
    }
    
    private static Set<String> inheritAuthorizations(Set<String> current, Set<String> _new) {
        
        if(_new.equals(Group.EVERYBODY_AUTHORIZED)) {
            // must be copied on write
            return current;
        } else {
            
            if(current.equals(Group.EVERYBODY_AUTHORIZED)) {
                return new HashSet<String>(_new);
            } else {
                HashSet<String> copy = new HashSet<String>(current);
                copy.retainAll(_new);
                if(copy.isEmpty()) {
                    return Group.NOBODY_AUTHORIZED;
                } else {
                    return copy;
                }                        
            }
        }
    }    
    
    private void checkLayerAuthorizations(Layer l, Set<String> currentReaders, Set<String> currentWriters) {
        
        currentReaders = inheritAuthorizations(currentReaders, l.getReaders());
        
        currentWriters = inheritAuthorizations(currentWriters, l.getWriters());

        if(!currentReaders.equals(Group.EVERYBODY_AUTHORIZED) || !currentWriters.equals(Group.EVERYBODY_AUTHORIZED)) {
            protectedLayers.put(l, new Set[] { currentReaders, currentWriters });            
        }
        
        for(Layer child: l.getChildren()) {
            checkLayerAuthorizations(child, currentReaders, currentWriters);
        }
    }
    
    private void checkLevelAuthorizations(Level l, Set<String> currentReaders) {
        currentReaders = inheritAuthorizations(currentReaders, l.getReaders());
        
        if(!currentReaders.equals(Group.EVERYBODY_AUTHORIZED)) {
            protectedLevels.put(l, currentReaders);
        }                
        
        for(ApplicationLayer al: l.getLayers()) {
            if(al != null) {
                checkAppLayerAuthorizations(al, currentReaders);
            }
        }        
                
        for(Level child: l.getChildren()) {
            checkLevelAuthorizations(child, currentReaders);
        }
    }
    
    private void checkAppLayerAuthorizations(ApplicationLayer al, Set<String> currentReaders) {

        currentReaders = inheritAuthorizations(currentReaders, al.getReaders());
        
        // check the layer referenced by this appLayer
        Layer l = al.getService().getLayer(al.getLayerName());

        Set<String> currentWriters = al.getWriters();
        
        if(l != null && protectedLayers.containsKey(l)) {
            Set<String>[] auths = protectedLayers.get(l);
            Set<String> layerReaders = auths[0];
            Set<String> layerWriters = auths[1];
            currentReaders = inheritAuthorizations(currentReaders, layerReaders);
            currentWriters = inheritAuthorizations(currentWriters, layerWriters);
        }
        
        if(!currentReaders.equals(Group.EVERYBODY_AUTHORIZED) || !currentWriters.equals(Group.EVERYBODY_AUTHORIZED)) {
            protectedAppLayers.put(al, new Set[] { currentReaders, currentWriters } );
        }
    }
}
