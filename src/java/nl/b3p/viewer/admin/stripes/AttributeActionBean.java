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
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.viewer.config.services.AttributeDescriptor;
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
@UrlBinding("/action/attribute/{$event}")
@StrictBinding
public class AttributeActionBean implements ActionBean {
    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/services/attribute.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editattribute.jsp";
    
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
    private String attribuutbron;
    
    @Validate
    private String attribuutLijst;
    
    @Validate
    private AttributeDescriptor attribute;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public AttributeDescriptor getAttribute() {
        return attribute;
    }

    public void setAttribute(AttributeDescriptor attribute) {
        this.attribute = attribute;
    }

    public String getAttribuutLijst() {
        return attribuutLijst;
    }

    public void setAttribuutLijst(String attribuutLijst) {
        this.attribuutLijst = attribuutLijst;
    }

    public String getAttribuutbron() {
        return attribuutbron;
    }

    public void setAttribuutbron(String attribuutbron) {
        this.attribuutbron = attribuutbron;
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
    
    public Resolution edit() {
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution cancel() {
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterAlias = "";
        String filterAttribuut = "";
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
                if(property.equals("alias")) {
                    filterAlias = value;
                }
                if(property.equals("attribute")) {
                    filterAttribuut = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(AttributeDescriptor.class);
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
        
        if(filterAlias != null && filterAlias.length() > 0){
            Criterion aliasCrit = Restrictions.ilike("alias", filterAlias, MatchMode.ANYWHERE);
            c.add(aliasCrit);
        }
        if(filterAttribuut != null && filterAttribuut.length() > 0){
            Criterion attribuutCrit = Restrictions.ilike("name", filterAttribuut, MatchMode.ANYWHERE);
            c.add(attribuutCrit);
        }
        
        List attributes = c.list();

        for(Iterator it = attributes.iterator(); it.hasNext();){
            AttributeDescriptor attr = (AttributeDescriptor)it.next();
            
            JSONObject j = this.getGridRow(attr.getId().intValue(), attr.getAlias(), attr.getName());
            jsonData.put(j);
        }
        
        int rowCount;
        if(!hasFilter){
            rowCount = Stripersist.getEntityManager().createQuery("from AttributeDescriptor").getResultList().size();
        }else{
            rowCount = attributes.size();
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
    
    private JSONObject getGridRow(int i, String alias, String attribute) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("alias", alias);
        j.put("attribute", attribute);
        return j;
    }
}
