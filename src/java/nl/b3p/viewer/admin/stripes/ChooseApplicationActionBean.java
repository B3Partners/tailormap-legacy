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
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Application;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/chooseapplication/{$event}")
@StrictBinding
@RolesAllowed("ApplicationAdmin")       
public class ChooseApplicationActionBean implements ActionBean {
    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/application/chooseApplication.jsp";
    
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
    private Application application;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
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
    public Resolution view() {
        return new ForwardResolution(JSP);
    }
    
    public Resolution deleteApplication() {
        Stripersist.getEntityManager().remove(application);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Applicatie is verwijderd"));
        return new ForwardResolution(JSP);
    }
    
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        String filterPublished = "";
        String filterOwner = "";
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
                if(property.equals("name")) {
                    filterName = value;
                }
                if(property.equals("published")) {
                    filterPublished = value;
                }
                if(property.equals("owner")) {
                    filterOwner = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Application.class);   
        
        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if(sort != null && dir != null){
            Order order = null;
            if(sort.equals("published")){
                sort = "version";
            }
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
        if(filterPublished != null && filterPublished.length() > 0){
            if(filterPublished.equalsIgnoreCase("nee")){
                Criterion publishedCrit = Restrictions.isNotNull("version");
                c.add(publishedCrit);
            }else if(filterPublished.equalsIgnoreCase("ja")){
                Criterion publishedCrit = Restrictions.isNull("version");
                c.add(publishedCrit);
            }
        }
        if(filterOwner != null && filterOwner.length() > 0){
            Criterion ownerCrit = Restrictions.ilike("owner.username", filterOwner, MatchMode.ANYWHERE);
            c.add(ownerCrit);
        }
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
        List applications = c.list();

        for(Iterator it = applications.iterator(); it.hasNext();){
            Application app = (Application)it.next();
            String appName = app.getName();
            if(app.getVersion() != null){
               appName += " v" + app.getVersion();
            }
            String ownername = "";
            if(app.getOwner() != null){
                ownername = app.getOwner().getUsername();
            }
            String published = "Nee";
            if(app.getVersion() == null){
                published = "Ja";
            }
            JSONObject j = this.getGridRow(app.getId().intValue(), appName, published ,ownername);
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
    
    private JSONObject getGridRow(int i, String name, String published, String owner) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("name", name);
        j.put("published", published);
        j.put("owner", owner);
        return j;
    }
    
}
