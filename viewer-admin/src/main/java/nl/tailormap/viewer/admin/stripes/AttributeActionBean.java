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
package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.tailormap.i18n.LocalizableActionBean;
import nl.tailormap.viewer.config.security.Group;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

/**
 *
 * @author Jytte Schaeffer
 */
@UrlBinding("/action/attribute/{$event}")
@StrictBinding
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class AttributeActionBean extends LocalizableActionBean {
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
    private Long featureSourceId;
    @Validate
    private Long simpleFeatureTypeId;
    
    private List featureSources;
    
    @Validate
    @ValidateNestedProperties({
                @Validate(field="alias", maxlength=255, label="Alias")
    })
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

    public List getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List featureSources) {
        this.featureSources = featureSources;
    }

    public Long getSimpleFeatureTypeId() {
        return simpleFeatureTypeId;
    }

    public void setSimpleFeatureTypeId(Long simpleFeatureTypeId) {
        this.simpleFeatureTypeId = simpleFeatureTypeId;
    }
    
    public Long getFeatureSourceId() {
        return featureSourceId;
    }

    public void setFeatureSourceId(Long featureSourceId) {
        this.featureSourceId = featureSourceId;
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
        Stripersist.getEntityManager().persist(attribute);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributeactionbean.attsaved")));
        return new ForwardResolution(EDITJSP);
    }
    
    @Before(stages=LifecycleStage.BindingAndValidation)
    @SuppressWarnings("unchecked")
    public void load() {
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
    }
    
    public Resolution getFeatureTypes() throws JSONException {
        final JSONArray simpleFeatureTypes = new JSONArray();
        
        if(featureSourceId != null){
            FeatureSource fc = (FeatureSource)Stripersist.getEntityManager().find(FeatureSource.class, featureSourceId);
            
            List<SimpleFeatureType> sftList = fc.getFeatureTypes();
            for(Iterator it = sftList.iterator(); it.hasNext();){
                SimpleFeatureType sft = (SimpleFeatureType)it.next();
                
                JSONObject j = new JSONObject();
                j.put("id", sft.getId());
                String name = sft.getTypeName();
                if(!StringUtils.isBlank(sft.getDescription())) {
                    name += " (" + sft.getDescription() + ")";
                }
                j.put("name", name);
                simpleFeatureTypes.put(j);
            }
        }
        
        return new StreamingResolution("application/json") {

            @Override
            public void stream(HttpServletResponse response) throws Exception {
                response.getWriter().print(simpleFeatureTypes.toString());
            }
        };
    }
    
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
                
        List<SimpleFeatureType> featureTypes= new ArrayList();
        if(simpleFeatureTypeId != null && simpleFeatureTypeId != -1){
            SimpleFeatureType sft = (SimpleFeatureType)Stripersist.getEntityManager().find(SimpleFeatureType.class, simpleFeatureTypeId);
            if (sft!=null){
                featureTypes.add(sft);
            }
        }else if(featureSourceId != null && featureSourceId != -1){
            FeatureSource fc = (FeatureSource)Stripersist.getEntityManager().find(FeatureSource.class, featureSourceId);            
            featureTypes = fc.getFeatureTypes();
        }
        
        String filterAlias = "";
        String filterAttribuut = "";
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
                if(property.equals("alias")) {
                    filterAlias = value;
                }
                if(property.equals("attribute")) {
                    filterAttribuut = value;
                }
                if(property.equals("type")) {
                    filterType = value;
                }
            }
        }
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(AttributeDescriptor.class);
        
        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if(sort != null && dir != null){
            Order order = null;
            if(sort.equals("attribute")){
                sort = "name";
            }
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
        if(filterType != null && filterType.length() > 0){
            Criterion typeCrit = Restrictions.ilike("type", filterType, MatchMode.ANYWHERE);
            c.add(typeCrit);
        }
        
        if(featureTypes != null && featureTypes.size() > 0){
            /* Criteria for the all attribute descriptor ids of the feature types 
             * in featureTypes
             */
            DetachedCriteria c2 = DetachedCriteria.forClass(SimpleFeatureType.class);
            Collection ftIds = new ArrayList<Long>();
            for(SimpleFeatureType sft: featureTypes) {
                ftIds.add(sft.getId());
            }
            c2.add(Restrictions.in("id", ftIds));
            c2.createAlias("attributes", "attr");
            c2.setProjection(Projections.property("attr.id"));

            c.add(org.hibernate.criterion.Property.forName("id").in(c2));
        }
        int rowCount = c.list().size();
        
        if(limit > 0){
            c.setMaxResults(limit);
        }
        c.setFirstResult(start);
        
        List attributes = c.list();

        for(Iterator it = attributes.iterator(); it.hasNext();){
            AttributeDescriptor attr = (AttributeDescriptor)it.next();
            
            JSONObject j = this.getGridRow(attr.getId().intValue(), attr.getAlias(), attr.getName(), attr.getType());
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
    
    private JSONObject getGridRow(int i, String alias, String attribute, String type) throws JSONException {       
        JSONObject j = new JSONObject();
        j.put("id", i);
        j.put("alias", alias);
        j.put("attribute", attribute);
        j.put("type", type);
        return j;
    }
}
