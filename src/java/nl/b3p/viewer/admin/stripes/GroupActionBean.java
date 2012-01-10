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

import java.util.Iterator;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.security.Group;
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
@UrlBinding("/action/group/{$event}/{service}")
public class GroupActionBean implements ActionBean{
    private static final String JSP = "/WEB-INF/jsp/user/group.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/user/editgroup.jsp";
    
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
    @ValidateNestedProperties({
                @Validate(field="name", required=true, maxlength=255),
                @Validate(field="description", maxlength=255)
    })
    private Group group;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
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
    public Resolution defaultResolution() {
        return new ForwardResolution(JSP);
    }

    @DontValidate
    public Resolution edit() {
        return new ForwardResolution(EDITJSP);
    }

    @DontBind
    public Resolution cancel() {        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution save() {  
        Stripersist.getEntityManager().persist(group);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Gebruikersgroep is opgeslagen"));
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution delete() {
        Stripersist.getEntityManager().remove(group);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Gebruikersgroep is verwijderd"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        String filterDescription = "";
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
                if(property.equals("name")) {
                    filterName = value;
                }
                if(property.equals("description")) {
                    filterDescription = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Group.class);
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
            Criterion nameCrit = Restrictions.ilike("name", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        if(filterDescription != null && filterDescription.length() > 0){
            Criterion urlCrit = Restrictions.ilike("description", filterDescription, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }
        
        List groups = c.list();
        for(Iterator it = groups.iterator(); it.hasNext();){
            Group gr = (Group)it.next();
            JSONObject j = this.getGridRow(gr.getName(), gr.getDescription());
            jsonData.put(j);
        }
        
        int rowCount;
        if(!hasFilter){
            rowCount = Stripersist.getEntityManager().createQuery("from Group").getResultList().size();
        }else{
            rowCount = groups.size();
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
    
    private JSONObject getGridRow(String name, String description) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", name);
        j.put("name", name);
        j.put("description", description);
        return j;
    }
}
