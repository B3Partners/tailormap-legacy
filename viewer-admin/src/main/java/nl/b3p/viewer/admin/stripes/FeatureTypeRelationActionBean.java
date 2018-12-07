/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.DontBind;
import net.sourceforge.stripes.action.DontValidate;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import net.sourceforge.stripes.validation.ValidationErrors;
import net.sourceforge.stripes.validation.ValidationMethod;
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.FeatureTypeRelation;
import nl.b3p.viewer.config.services.FeatureTypeRelationKey;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Roy Braam
 */
@UrlBinding("/action/featuretyperelation/{$event}")
public class FeatureTypeRelationActionBean extends LocalizableActionBean {
    private ActionBeanContext context;
    private static final String JSP = "/WEB-INF/jsp/services/featuretyperelation.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editfeaturetyperelation.jsp";

    private List<FeatureTypeRelation> relations = new ArrayList<FeatureTypeRelation>();
    private List<SimpleFeatureType> featureTypes = new ArrayList<SimpleFeatureType>();
    private List<SimpleFeatureType> foreignFeatureTypes = new ArrayList<SimpleFeatureType>();
    private List<FeatureSource> featureSources = new ArrayList<FeatureSource>();
    
    private Long featureSourceId;
    private Long featureTypeId;
    @Validate
    private Map<Integer,Long> leftSide = new HashMap<Integer, Long>();
    private Map<Integer,Long> rightSide = new HashMap<Integer, Long>();
    /**
     * For filling the grid
     */
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
        @Validate(field="featureType", required=true, on="save"),
        @Validate(field="foreignFeatureType", required=true, on="save"),
        @Validate(field="type", required=true, on="save")
    })
    private FeatureTypeRelation relation;
        
    @DefaultHandler
    public Resolution view() {
        //relations = Stripersist.getEntityManager().createQuery("from FeatureTypeRelation").getResultList();
        return new ForwardResolution(JSP);
    }
    
    public Resolution save(){                                        
        Iterator<Integer> it=leftSide.keySet().iterator();
        
        relation.getRelationKeys().clear();
        while (it.hasNext()){
            Integer i=it.next();
            Long leftId= leftSide.get(i);
            Long rightId= rightSide.get(i);
            if (leftId==null || rightId==null || leftId ==-1 || rightId ==-1){
                getContext().getMessages().add(new SimpleError(getBundle().getString("viewer_admin.featuretyperelationactionbean.relmissing")));
                return new ForwardResolution(EDITJSP);
            }
            AttributeDescriptor left = Stripersist.getEntityManager().find(AttributeDescriptor.class, leftId);
            AttributeDescriptor right  = Stripersist.getEntityManager().find(AttributeDescriptor.class, rightId);
            FeatureTypeRelationKey key = new FeatureTypeRelationKey(relation,left,right);
            relation.getRelationKeys().add(key);
        }
        Stripersist.getEntityManager().persist(relation);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.featuretyperelationactionbean.relsaved")));
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution edit() {
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
        if (relation!=null && relation.getFeatureType()!=null){
            featureTypes = Stripersist.getEntityManager().createQuery("from SimpleFeatureType s where s.featureSource = :f").setParameter("f", relation.getFeatureType().getFeatureSource()).getResultList();                         
        }
        if (relation!=null && relation.getForeignFeatureType()!=null){
            foreignFeatureTypes = Stripersist.getEntityManager().createQuery("from SimpleFeatureType s where s.featureSource = :f").setParameter("f", relation.getForeignFeatureType().getFeatureSource()).getResultList(); 
        }
        Stripersist.getEntityManager().getTransaction().commit();
        return new ForwardResolution(EDITJSP);
    }
    
    @DontBind
    public Resolution cancel() {        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution delete() {
        Stripersist.getEntityManager().remove(relation);
        Stripersist.getEntityManager().getTransaction().commit();
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.featuretyperelationactionbean.relrem")));
        return new ForwardResolution(EDITJSP);
    }
    
    @DontValidate
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        String filterFeaturetype = "";
        String filterForeignFeaturetype = "";
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(FeatureTypeRelation.class);
        
        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        c.createAlias("featureType", "f");
        c.createAlias("f.featureSource", "fs");
        c.createAlias("foreignFeatureType", "ff");
        c.createAlias("ff.featureSource", "ffs");
        if(sort != null && dir != null){
            Order order = null;
            if (sort.equals("featuretype") || sort.equals("foreignFeaturetype")){
                sort="f";
                if (sort.equals("foreignFeaturetype")){
                    sort="ff";
                }
                String sort1 = sort+"s.name";
                String sort2 = sort+".typeName";
                String sort3 = sort+".description";
                if(dir.equals("ASC")){
                    c.addOrder(Order.asc(sort1).ignoreCase());
                    c.addOrder(Order.asc(sort2).ignoreCase());
                    c.addOrder(Order.asc(sort3).ignoreCase());
                }else{
                    c.addOrder(Order.desc(sort1).ignoreCase());
                    c.addOrder(Order.desc(sort2).ignoreCase());
                    c.addOrder(Order.desc(sort3).ignoreCase());
                }
            }
            
        }
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
                if (property.equals("featuretype") ||property.equals("foreignFeaturetype")){
                    if(property.equals("featuretype")) {
                        property= "f";
                        //filterFeaturetype = value;
                    }else if(property.equals("foreignFeaturetype")){
                        property= "ff";                 
                    }
                    String filt1 = property+"s.name";
                    String filt2 = property+".typeName";
                    String filt3 = property+".description";
                    c.add(Restrictions.or(Restrictions.ilike(filt1,value,MatchMode.ANYWHERE),
                            Restrictions.or(Restrictions.ilike(filt2,value,MatchMode.ANYWHERE),
                            Restrictions.ilike(filt3, value,MatchMode.ANYWHERE))));
                }
            }
        }
        
        int rowCount = c.list().size();
        
        c.setMaxResults(limit);
        c.setFirstResult(start);
        
        List relations = c.list();
        for(Iterator it = relations.iterator(); it.hasNext();){
            FeatureTypeRelation relation = (FeatureTypeRelation)it.next();
            JSONObject j = this.getGridRow(relation.getId().intValue(), relation.getFeatureType(), relation.getForeignFeatureType());
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
    /**
     * Get the attribute names for the given FeatureType that are not of type Geometry
     * @return A JSON object formated as:
     *  Object {
     *      attributes [{id,name}{id,name}]
     *      error
     *  }
     */
    public Resolution getAttributesForFeaturetype () throws JSONException{
        final JSONObject json = new JSONObject();
        boolean success=false;
        SimpleFeatureType featureType = Stripersist.getEntityManager().find(SimpleFeatureType.class, featureTypeId);
        if (featureType!=null){                        
            JSONArray array = new JSONArray();
            List<AttributeDescriptor> attributes=featureType.getAttributes();
            for (AttributeDescriptor attr : attributes){
                if (!AttributeDescriptor.GEOMETRY_TYPES.contains(attr.getType())){
                    JSONObject ob = new JSONObject();
                    ob.put("id", attr.getId());
                    if (attr.getAlias()!=null){
                        ob.put("name",attr.getAlias());
                    }else{
                        ob.put("name",attr.getName());
                    }
                    array.put(ob);
                }
            }
            json.put("attributes", array);
            success=true;
        }else{
            json.put("error", getBundle().getString("viewer_admin.featuretyperelationactionbean.noftfound"));
        }
        json.put("success", success);
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(json.toString());
           }
        };
    }
    /**
     * Get the featuretypes of the given feature source id.
     * @return A JSON object formated as:
     *  Object {
     *      featuretypes [{id,name}{id,name}]
     *      error
     *  }
     */
    public Resolution getFeatureTypesForSource () throws JSONException{
        final JSONObject json = new JSONObject();
        boolean success=false;  
        if (featureSourceId==null){
            json.put("error", "No featureSourceId found");
        }else{
            FeatureSource featureSource = Stripersist.getEntityManager().find(FeatureSource.class, featureSourceId);
            if (featureSource!=null){                        
                JSONArray array = new JSONArray();
                List<SimpleFeatureType> featureTypes=featureSource.getFeatureTypes();
                for (SimpleFeatureType ft : featureTypes){
                    JSONObject ob = new JSONObject();
                    ob.put("id", ft.getId());
                    String name = ft.getTypeName();
                    if (!StringUtils.isBlank(ft.getDescription())){
                        name+=" ("+ft.getDescription()+")";
                    }
                    ob.put("name",name);                
                    array.put(ob);
                }
                json.put("featuretypes", array);            
                success=true;
            }else{
                json.put("error", getBundle().getString("viewer_admin.featuretyperelationactionbean.noftfound"));
            }
        }
        json.put("success", success);
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(json.toString());
           }
        };
    }
    
    private JSONObject getGridRow(int i, SimpleFeatureType featuretype, SimpleFeatureType foreignFeaturetype) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", i);
        String typeName= featuretype.getFeatureSource().getName()+": "+featuretype.getTypeName();
        if (featuretype.getDescription()!=null){
            typeName +=" ("+featuretype.getDescription()+")";
        }
        j.put("featuretype", typeName);        
        String foreignTypeName = foreignFeaturetype.getFeatureSource().getName()+": "+foreignFeaturetype.getTypeName();
        if (foreignFeaturetype.getDescription()!=null){
            foreignTypeName+= " ("+foreignFeaturetype.getDescription()+")";
        }
        j.put("foreignFeaturetype",foreignTypeName);
        return j;
    }
    
    @ValidationMethod(on="save")
    public void validate(ValidationErrors errors){
        if (relation!=null){
            if (leftSide.isEmpty() || rightSide.isEmpty()){
                getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.featuretyperelationactionbean.relmiss")));
                return;
            }
        }
    }
    
    //<editor-fold defaultstate="collapsed" desc="Getters/setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public List<FeatureTypeRelation> getRelations() {
        return relations;
    }

    public void setRelations(List<FeatureTypeRelation> relations) {
        this.relations = relations;
    }

    public FeatureTypeRelation getRelation() {
        return relation;
    }

    public void setRelation(FeatureTypeRelation relation) {
        this.relation = relation;
    }

    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
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

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
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

    public List<SimpleFeatureType> getForeignFeatureTypes() {
        return foreignFeatureTypes;
    }

    public void setForeignFeatureTypes(List<SimpleFeatureType> foreignFeatureTypes) {
        this.foreignFeatureTypes = foreignFeatureTypes;
    }

    public List<FeatureSource> getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List<FeatureSource> featureSources) {
        this.featureSources = featureSources;
    }

    public Long getFeatureSourceId() {
        return featureSourceId;
    }

    public void setFeatureSourceId(Long featureSourceId) {
        this.featureSourceId = featureSourceId;
    }

    public Long getFeatureTypeId() {
        return featureTypeId;
    }

    public void setFeatureTypeId(Long featureTypeId) {
        this.featureTypeId = featureTypeId;
    }

    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }

    public Map<Integer,Long> getLeftSide() {
        return leftSide;
    }

    public void setLeftSide(Map<Integer,Long> leftSide) {
        this.leftSide = leftSide;
    }

    public Map<Integer,Long> getRightSide() {
        return rightSide;
    }

    public void setRightSide(Map<Integer,Long> rightSide) {
        this.rightSide = rightSide;
    }
    //</editor-fold>
}
