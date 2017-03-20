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

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.LayarService;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/layarservice/{$event}/{service}")
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class LayarServiceActionBean implements ActionBean {
    private static final String JSP = "/WEB-INF/jsp/services/layarservice.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editlayarservice.jsp";
    
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
    private LayarService layarservice;
    
    @Validate
    private String name;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
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
    
    public LayarService getLayarservice() {
        return layarservice;
    }
    
    public void setLayarservice(LayarService layarservice) {
        this.layarservice = layarservice;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
    
    private static final String LAYAR_ACTIONBEAN_URL = "/action/layar";
    private static final String VIEWER_URL_PARAM = "viewer.url";    
    
    public String getUrl() throws UnsupportedEncodingException, MalformedURLException {
        String url = getContext().getServletContext().getInitParameter(VIEWER_URL_PARAM) + LAYAR_ACTIONBEAN_URL;
        
        if(url.indexOf("://") == -1) {
            HttpServletRequest request = getContext().getRequest();
            boolean needPort = "http".equals(request.getScheme()) && request.getServerPort() != 80
                            || "https".equals(request.getScheme()) && request.getServerPort() != 443;            
            if(needPort) {
                url = new URL(request.getScheme(), request.getServerName(), request.getServerPort(), url).toString();
            } else {
                url = new URL(request.getScheme(), request.getServerName(), url).toString();
            }
        }
        return url;
    }
    
    @DontValidate
    public Resolution edit() {
        if(layarservice != null){
            name = layarservice.getName();
        }
        return new ForwardResolution(EDITJSP);
    }
    
    @DontBind
    public Resolution cancel() {        
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution delete() {
        Stripersist.getEntityManager().remove(layarservice);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Layar service is verwijderd"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution save() {
        if(layarservice == null){
            layarservice = new LayarService();
        }
        layarservice.setName(name);
        
        Stripersist.getEntityManager().persist(layarservice);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Layar service is opgeslagen"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    @ValidationMethod(on="save")
    public void validate(ValidationErrors errors) throws Exception {
        if(name == null) {
            errors.add("name", new SimpleError("Naam is verplicht"));
            return;
        }
        
        try{
            Long foundId = (Long)Stripersist.getEntityManager().createQuery("select id from LayarService where name = :name")
                    .setMaxResults(1)
                    .setParameter("name", name)
                    .getSingleResult();
            
            if(layarservice != null && layarservice.getId() != null){
                if(!foundId.equals(layarservice.getId())){
                    errors.add("name", new SimpleError("Naam moet uniek zijn"));
                }
            }else{
                errors.add("name", new SimpleError("Naam moet uniek zijn"));
            }
            
        } catch(NoResultException nre) {
            
        }
    }
    
    @DontValidate
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
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
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(LayarService.class);
        
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
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
        List layarservices = c.list();
        for(Iterator it = layarservices.iterator(); it.hasNext();){
            LayarService layar = (LayarService)it.next();
            JSONObject j = this.getGridRow(layar.getId().intValue(), layar.getName());
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
    
    private JSONObject getGridRow(int i, String name) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("name", name);
        return j;
    }
}
