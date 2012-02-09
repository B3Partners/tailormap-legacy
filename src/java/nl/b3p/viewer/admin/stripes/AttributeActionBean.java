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
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.*;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
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
    private String featureSourceId;
    @Validate
    private String simpleFeatureTypeId;
    
    private List featureSources;
    private JSONArray simpleFeatureTypes;
    
    @Validate
    private AttributeDescriptor attribute;
    
    @Validate
    private String alias;

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

    public List getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List featureSources) {
        this.featureSources = featureSources;
    }

    public String getSimpleFeatureTypeId() {
        return simpleFeatureTypeId;
    }

    public void setSimpleFeatureTypeId(String simpleFeatureTypeId) {
        this.simpleFeatureTypeId = simpleFeatureTypeId;
    }

    public JSONArray getSimpleFeatureTypes() {
        return simpleFeatureTypes;
    }

    public void setSimpleFeatureTypes(JSONArray simpleFeatureTypes) {
        this.simpleFeatureTypes = simpleFeatureTypes;
    }

    public String getFeatureSourceId() {
        return featureSourceId;
    }

    public void setFeatureSourceId(String featureSourceId) {
        this.featureSourceId = featureSourceId;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
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
    
    public Resolution save() {
        attribute.setAlias(alias);
        Stripersist.getEntityManager().persist(attribute);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Attribuut is opgeslagen"));
        return new ForwardResolution(EDITJSP);
    }
    
    @Before(stages=LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
    }
    
    public Resolution selectBron() throws JSONException {
        return new ForwardResolution(JSP);
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
