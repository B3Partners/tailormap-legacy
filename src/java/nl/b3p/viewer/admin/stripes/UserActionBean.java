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
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.security.User;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/user/{$event}/{service}")
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
        Stripersist.getEntityManager().remove(user);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Gebruiker is verwijderd"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        //String filterDescription = "";
        boolean hasFilter= false;
        /* 
         * FILTERING: filter is delivered by frontend as JSON array [{property, value}]
         * for demo purposes the value is now returned, ofcourse here should the DB
         * query be built to filter the right records
         */
        if(this.getFilter() != null) {
            hasFilter = true;
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
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
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
        
        List users = c.list();
        for(Iterator it = users.iterator(); it.hasNext();){
            User us = (User)it.next();
            JSONObject j = this.getGridRow(us.getUsername(), us.getDetails());
            jsonData.put(j);
        }
        
        int rowCount;
        if(!hasFilter){
            rowCount = Stripersist.getEntityManager().createQuery("from User").getResultList().size();
        }else{
            rowCount = users.size();
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
    
}
