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

import java.util.Iterator;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.HandlesEvent;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.app.Document;
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
@UrlBinding("/action/document/{$event}/{service}")
public class DocumentActionBean implements ActionBean {
    private static final String JSP = "/WEB-INF/jsp/document.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/editdocument.jsp";
    
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
    private Document document;
    
    @Validate(on="saveDocument", required=true)
    private String name;
    @Validate
    private String rubriek;
    @Validate(on="saveDocument", required=true)
    private String url;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRubriek() {
        return rubriek;
    }

    public void setRubriek(String rubriek) {
        this.rubriek = rubriek;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
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
    public Resolution defaultResolution() throws JSONException {
        return new ForwardResolution(JSP);
    }
    
    public Resolution editDocument() throws JSONException {
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution cancel() throws JSONException {
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution deleteDocument() throws JSONException {
        Stripersist.getEntityManager().remove(document);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Document is verwijderd"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution saveDocument() throws JSONException {
        if(document == null){
            document = new Document();
        } 
        
        document.setName(name);
        document.setUrl(url);
        if(rubriek != null){
            document.setRubriek(rubriek);
        }
        
        Stripersist.getEntityManager().persist(document);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Document is opgeslagen"));
        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        String filterUrl = "";
        String filterRubriek = "";
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
                if(property.equals("url")) {
                    filterUrl = value;
                }
                if(property.equals("rubriek")) {
                    filterRubriek = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Document.class);
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
        if(filterUrl != null && filterUrl.length() > 0){
            Criterion urlCrit = Restrictions.ilike("url", filterUrl, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }
        if(filterRubriek != null && filterRubriek.length() > 0){
            Criterion rubriekCrit = Restrictions.ilike("rubriek", filterRubriek, MatchMode.ANYWHERE);
            c.add(rubriekCrit);
        }
        
        List documenten = c.list();
        for(Iterator it = documenten.iterator(); it.hasNext();){
            Document doc = (Document)it.next();
            JSONObject j = this.getGridRow(doc.getId().intValue(), doc.getName(), doc.getUrl(), doc.getRubriek());
            jsonData.put(j);
        }
        
        int rowCount;
        if(!hasFilter){
            rowCount = Stripersist.getEntityManager().createQuery("from Document").getResultList().size();
        }else{
            rowCount = documenten.size();
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
    
    private JSONObject getGridRow(int i, String name, String url, String rubriek) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("name", name);
        j.put("url", url);
        j.put("rubriek", rubriek);
        return j;
    }
    
}
