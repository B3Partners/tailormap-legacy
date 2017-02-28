/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

import java.util.*;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.Document;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Jytte Schaeffer
 */
@StrictBinding
@UrlBinding("/action/document/{$event}/{service}")
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class DocumentActionBean implements ActionBean {
    private static final String JSP = "/WEB-INF/jsp/services/document.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editdocument.jsp";
    
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
                @Validate(field="name", required=true, maxlength=255, label="Naam"),
                @Validate(field="category", maxlength=255, label="Category"),
                @Validate(field="url", required=true, maxlength=255, label="URL")
    })
    private Document document;

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

    @DontValidate
    public Resolution delete() {
        EntityManager em = Stripersist.getEntityManager();
        if(documentInUse()){
            String message="Het document kan niet worden verwijderd omdat deze nog in gebruik is.<br> "
                    + "Dit document is nog geconfigureerd in:<ul> ";
            List<Level> levels = em.createQuery(
                "from Level l where :doc member of l.documents")
                .setParameter("doc", document)
                .getResultList();
        
            for (Level level: levels){
                for(Application app: level.findApplications(em)) {
                    message+="<li>Level: \""+ level.getPath() +"\" in de Applicatie \""+app.getNameWithVersion()+"\".</li>";
                }
            }
            message+="</ul>";
            getContext().getValidationErrors().add("document", new SimpleError(message));
            return new ForwardResolution(EDITJSP);
        }        
        em.remove(document);
        em.getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Document is verwijderd"));
        
        return new ForwardResolution(EDITJSP);
    }
    /**
     * Checks if the document is in use
     * @return true/false
     */
    private boolean documentInUse(){
        return !Stripersist.getEntityManager().createQuery("select 1 from Level l where :doc member of l.documents")
                .setParameter("doc", document)
                .getResultList().isEmpty();
    }
    
    public Resolution save() {   
        Stripersist.getEntityManager().persist(document);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Document is opgeslagen"));
        
        return new ForwardResolution(EDITJSP);
    }

    @DontValidate
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterName = "";
        String filterUrl = "";
        String filterCategory = "";
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
                if(property.equals("category")) {
                    filterCategory = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(Document.class);
        
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
        if(filterCategory != null && filterCategory.length() > 0){
            Criterion rubriekCrit = Restrictions.ilike("category", filterCategory, MatchMode.ANYWHERE);
            c.add(rubriekCrit);
        }
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
        List documenten = c.list();
        for(Iterator it = documenten.iterator(); it.hasNext();){
            Document doc = (Document)it.next();
            JSONObject j = this.getGridRow(doc.getId().intValue(), doc.getName(), doc.getUrl(), doc.getCategory());
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
    
    private JSONObject getGridRow(int i, String name, String url, String category) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("name", name);
        j.put("url", url);
        j.put("category", category);
        return j;
    }    
}
