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

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.DontBind;
import net.sourceforge.stripes.action.DontValidate;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.HandlesEvent;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.security.User;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
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
    private static final String JSP = "/WEB-INF/jsp/user/user.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/user/edituser.jsp";
    
    private static final String DETAIL_NAME = "naam";
    private static final String DETAIL_ORGANIZATION = "organisatie";
    private static final String DETAIL_FUNCTION = "functie";
    private static final String DETAIL_ADDRESS = "adres";
    private static final String DETAIL_CITY = "plaats";
    private static final String DETAIL_EMAIL = "email";
    private static final String DETAIL_PHONE = "telefoon";
    
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
    private String name;
    @Validate
    private String organization;
    @Validate
    private String function;
    @Validate
    private String address;
    @Validate
    private String city;
    @Validate
    private String email;
    @Validate
    private String phone;
    
    @Validate
    @ValidateNestedProperties({
                @Validate(field="username", required=true, maxlength=255),
                @Validate(field="password", maxlength=255),
    })
    private User user;
    
    private List groupsList;
    
    @Validate
    private List groups;

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

    public String getFunction() {
        return function;
    }

    public void setFunction(String function) {
        this.function = function;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List getGroupsList() {
        return groupsList;
    }

    public void setGroupsList(List groupsList) {
        this.groupsList = groupsList;
    }

    public List getGroups() {
        return groups;
    }

    public void setGroups(List groups) {
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
    //</editor-fold>
    
    @DefaultHandler
    @HandlesEvent("default")
    @DontValidate
    public Resolution defaultResolution() throws JSONException {
        return new ForwardResolution(JSP);
    }

    @DontValidate
    public Resolution edit() throws JSONException {
        if(user != null){
            Map details = user.getDetails();
            if(details.containsKey(DETAIL_NAME)){
                name = details.get(DETAIL_NAME).toString();
            }
            if(details.containsKey(DETAIL_ORGANIZATION)){
                organization = details.get(DETAIL_ORGANIZATION).toString();
            }
            if(details.containsKey(DETAIL_FUNCTION)){
                function = details.get(DETAIL_FUNCTION).toString();
            }
            if(details.containsKey(DETAIL_ADDRESS)){
                address = details.get(DETAIL_ADDRESS).toString();
            }
            if(details.containsKey(DETAIL_CITY)){
                city = details.get(DETAIL_CITY).toString();
            }
            if(details.containsKey(DETAIL_EMAIL)){
                email = details.get(DETAIL_EMAIL).toString();
            }
            if(details.containsKey(DETAIL_PHONE)){
                phone = details.get(DETAIL_PHONE).toString();
            }
        }
        groupsList = Stripersist.getEntityManager().createQuery("from Group").getResultList();
        return new ForwardResolution(EDITJSP);
    }

    @DontBind
    public Resolution cancel() throws JSONException {        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution save() throws JSONException {  
        Map details = user.getDetails();
        if(name != null){
            details.put(DETAIL_NAME, name);
        }
        if(organization != null){
            details.put(DETAIL_ORGANIZATION, organization);
        }
        if(function != null){
            details.put(DETAIL_FUNCTION, function);
        }
        if(address != null){
            details.put(DETAIL_ADDRESS, address);
        }
        if(city != null){
            details.put(DETAIL_CITY, city);
        }
        if(email != null){
            details.put(DETAIL_EMAIL, email);
        }
        if(phone != null){
            details.put(DETAIL_PHONE, phone);
        }
        //org.apache.catalina.realm.RealmBase.Digest(password, "SHA-1", "UTF-8");
        
        if(groups != null){
            Set groupset = new HashSet();
            for(Iterator it = groups.iterator(); it.hasNext();){
                String groupName = it.next().toString();
                Group gr = Stripersist.getEntityManager().find(Group.class, groupName);
                groupset.add(gr);
            }
            user.setGroups(groupset);
        }
        
        Stripersist.getEntityManager().persist(user);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Gebruikersgroep is opgeslagen"));
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution delete() throws JSONException {
        //Stripersist.getEntityManager().remove(user);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Gebruikersgroep is verwijderd"));
        
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
        j.put("organization", details.get(DETAIL_ORGANIZATION));
        j.put("function", details.get(DETAIL_FUNCTION));
        return j;
    }
    
}
