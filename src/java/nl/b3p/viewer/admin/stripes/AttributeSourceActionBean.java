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

import java.util.*;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.services.*;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/attributesource/{$event}")
@StrictBinding
public class AttributeSourceActionBean implements ActionBean {

    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/services/attributesource.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editattributesource.jsp";
    
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
    
    @Validate(on={"save","saveEdit"}, required=true)
    private String name;
    @Validate(on="save", required=true)
    private String url;
    @Validate(on="save", required=true)
    private String protocol;
    @Validate
    private String username;
    @Validate
    private String password;
    
    @Validate
    private FeatureSource featureSource;
    
    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }
    
    public Resolution edit() {
        protocol = featureSource.getProtocol();
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution cancel() {
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution delete() {
        EntityManager em = Stripersist.getEntityManager();

        em.createQuery("update Layer set featureType = null where featureType in :fts")
            .setParameter("fts", featureSource.getFeatureTypes())
            .executeUpdate();

        em.remove(featureSource);

        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Attribuutbron is verwijderd"));
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution save() {
        
        try {
            if(protocol.equals("wfs")) {
                featureSource = new WFSFeatureSource();
            } else if(protocol.equals("arcgis")) {
                featureSource = new ArcGISFeatureSource();
            } else if(protocol.equals("arcxml")) {
                featureSource = new ArcXMLFeatureSource();
            } else if(protocol.equals("jdbc")) {
                featureSource = new JDBCFeatureSource();
            } else {
                getContext().getValidationErrors().add("protocol", new SimpleError("Ongeldig"));
            }
        } catch(Exception e) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(e.getClass().getName() + ": " + e.getMessage()));
            return new ForwardResolution(EDITJSP);
        }
        
        featureSource.setName(name);
        featureSource.setUrl(url);
        featureSource.setUsername(username);
        featureSource.setPassword(password);
        
        Stripersist.getEntityManager().persist(featureSource);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Attribuutbron is ingeladen"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution saveEdit() {
        featureSource.setName(name);
        featureSource.setUsername(username);
        featureSource.setPassword(password);
        
        Stripersist.getEntityManager().persist(featureSource);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Attribuutbron is ingeladen"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    @ValidationMethod(on={"save","saveEdit"})
    public void validate(ValidationErrors errors) throws Exception {
        if(name == null) {
            errors.add("name", new LocalizableError("validation.required.valueNotPresent"));
            return;
        }
        
        if(featureSource == null){
            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from FeatureSource where name = :name")
                        .setMaxResults(1)
                        .setParameter("name", name)
                        .getSingleResult();

                errors.add("name", new SimpleError("Naam bestaat al. Kies een unieke naam."));
                return;

            } catch(NoResultException nre) {
                // name is unique
            }
        }else{
            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from FeatureSource where name = :name "
                        + "and id != :id")
                        .setMaxResults(1)
                        .setParameter("name", name)
                        .setParameter("id", featureSource.getId())
                        .getSingleResult();

                errors.add("name", new SimpleError("Naam bestaat al. Kies een unieke naam."));
                return;

            } catch(NoResultException nre) {
                // name is unique
            }
        }
    }
    
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        String filterUrl = "";
        String filterType = "";
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
                if(property.equals("url")) {
                    filterUrl = value;
                }
                if(property.equals("protocol")) {
                    filterType = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(FeatureSource.class);
        
        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if(sort != null && dir != null){
            /* Sorteren op protocol en status nog niet mogelijk */
            if(!dir.equals("status") && dir.equals("protocol")){
                Order order = null;
                if(dir.equals("ASC")){
                   order = Order.asc(sort);
                }else{
                    order = Order.desc(sort);
                }
                order.ignoreCase();
                c.addOrder(order); 
            }
        }
        
        if(filterName != null && filterName.length() > 0){
            Criterion nameCrit = Restrictions.ilike("name", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        if(filterUrl != null && filterUrl.length() > 0){
            Criterion urlCrit = Restrictions.ilike("url", filterUrl, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }
        if(filterType != null && filterType.length() > 0){
            Criterion protocolCrit = Restrictions.sqlRestriction("protocol like '%"+filterType+"%'");
            c.add(protocolCrit);
        }
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
        List sources = c.list();

        for(Iterator it = sources.iterator(); it.hasNext();){
            FeatureSource source = (FeatureSource)it.next();
            String protocolType = "";
            if(source instanceof WFSFeatureSource){
                protocolType = "WFS";
            } else if(source instanceof JDBCFeatureSource){
                protocolType = "JDBC";
            } else if(source instanceof ArcGISFeatureSource){
                protocolType = "ArcGIS";
            } else if(source instanceof ArcXMLFeatureSource){
                protocolType = "ArcXML";
            }
            JSONObject j = this.getGridRow(source.getId().intValue(), source.getName(), source.getUrl(), protocolType);
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
    
    private JSONObject getGridRow(int i, String name, String url, String type) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("status", Math.random() > 0.5 ? "ok" : "error");
        j.put("name", name);
        j.put("url", url);
        j.put("protocol", type);
        return j;
    }

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
    
    public ActionBeanContext getContext() {
        return this.context;
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
    
    public int getStart() {
        return start;
    }
    
    public void setStart(int start) {
        this.start = start;
    }
    
    public String getDir() {
        return dir;
    }
    
    public void setDir(String dir) {
        this.dir = dir;
    }
    
    public String getSort() {
        return sort;
    }
    
    public void setSort(String sort) {
        this.sort = sort;
    }
    
    public JSONArray getFilter() {
        return filter;
    }
    
    public void setFilter(JSONArray filter) {
        this.filter = filter;
    }

    public FeatureSource getFeatureSource() {
        return featureSource;
    }

    public void setFeatureSource(FeatureSource featureSource) {
        this.featureSource = featureSource;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
 //</editor-fold>
}
