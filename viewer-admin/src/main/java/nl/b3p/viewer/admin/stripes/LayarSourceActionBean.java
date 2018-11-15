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

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.validation.LocalizableError;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import net.sourceforge.stripes.validation.ValidationErrors;
import net.sourceforge.stripes.validation.ValidationMethod;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.LayarService;
import nl.b3p.viewer.config.services.LayarSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
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
 * @author Roy Braam
 */
@StrictBinding
@UrlBinding("/action/layarsource/{$event}")
@RolesAllowed({Group.ADMIN,Group.REGISTRY_ADMIN})
public class LayarSourceActionBean implements ActionBean {
    private static final String JSP = "/WEB-INF/jsp/services/layarsource.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editlayarsource.jsp";

    private ActionBeanContext context;
    private ResourceBundle bundle;
    
    private List<LayarService> layarServices;
    
    private List<SimpleFeatureType> featureTypes;
    
    private List<FeatureSource> featureSources;
    
    @Validate
    private Long layarServiceId;
    
    @Validate
    private JSONArray filter;
    
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
    private Map<String, ClobElement> details = new HashMap<String, ClobElement>();
    
    @Validate
    @ValidateNestedProperties({
        @Validate(field="featureType"),
        @Validate(field="layarService")
    })
    private LayarSource layarSource = null;
    //for list of attributes
    @Validate
    private Long featureTypeId;
    
    @Before
    protected void initBundle() {
        setBundle(ResourceBundle.getBundle("ViewerResources", context.getRequest().getLocale()));
    }
        
   @DefaultHandler
    public Resolution view() {
        layarServices = Stripersist.getEntityManager().createQuery("from LayarService").getResultList();
        return new ForwardResolution(JSP);
    }
    
    public Resolution save(){                        
        layarSource.getDetails().clear();
        layarSource.getDetails().putAll(details);
        
        Stripersist.getEntityManager().persist(layarSource);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.layarsourceactionbean.lssaved")));
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution edit() {
        if (layarSource != null) {
            details = layarSource.getDetails();
        }
        layarServices = Stripersist.getEntityManager().createQuery("from LayarService").getResultList();
        featureTypes = Stripersist.getEntityManager().createQuery("from SimpleFeatureType").getResultList();        
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
        Stripersist.getEntityManager().getTransaction().commit();
        return new ForwardResolution(EDITJSP);
    }
        
    public Resolution cancel() {        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution delete() {
        Stripersist.getEntityManager().remove(layarSource);
        Stripersist.getEntityManager().getTransaction().commit();
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.layarsourceactionbean.lsrem")));
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution getGridData() throws JSONException { 
        JSONArray jsonData = new JSONArray();
        
        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(LayarSource.class);
        
        /* 
         * FILTERING: filter is delivered by frontend as JSON array [{property, value}]
         * for demo purposes the value is now returned, ofcourse here should the DB
         * query be built to filter the right records
         */
        c.createAlias("featureType", "f");
        c.createAlias("layarService", "l");
        if(this.getFilter() != null) {
            for(int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if (value!=null && value.length() > 0){
                    if(property.equals("featureType")) {                        
                        c.add(Restrictions.ilike("f.typeName",value,MatchMode.ANYWHERE));
                    }
                    if(property.equals("layarService")) {
                        c.add(Restrictions.ilike("l.name",value,MatchMode.ANYWHERE));
                    }
                }
            }
        }
        
        /* Sorting is delivered by the frontend
         * as two variables: sort which holds the column name and dir which
         * holds the direction (ASC, DESC).
         */
        if(getSort() != null && getDir() != null){            
            Order order = null;
            if (getSort().equals("featureType")){
                setSort("f.typeName");
            }else if (getSort().equals("layarService")){
               setSort("l.name");
            }    
            if(getDir().equals("ASC")){
                order = Order.asc(getSort());
            }else{
                order = Order.desc(getSort());
            }
            order.ignoreCase();
            c.addOrder(order); 
        }
        if(layarServiceId != null && layarServiceId != -1){
            Criterion attrCrit = Restrictions.eq("l.id", layarServiceId);
            c.add(attrCrit);
        }
        List sources = c.list();
        
        int rowCount = sources.size();
        
        c.setMaxResults(getLimit());
        c.setFirstResult(getStart());
        
        for(Iterator it = sources.iterator(); it.hasNext();){
            LayarSource source = (LayarSource)it.next();
            
            JSONObject j = new JSONObject();
            j.put("id", source.getId());
            j.put("featureType", source.getFeatureType().getTypeName());
            j.put("layarService",source.getLayarService().getName());
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
     * @return A JSON object formated as: <pre>
     *  Object {
     *      attributes ['attributeName','attributeName',...],
     *      error
     *  }
     * </pre>
     */
    public Resolution getAttributes () throws JSONException{
        final JSONObject json = new JSONObject();
        boolean success=false;
        SimpleFeatureType featureType = Stripersist.getEntityManager().find(SimpleFeatureType.class, featureTypeId);
        if (featureType!=null){                        
            JSONArray array = new JSONArray();
            List<AttributeDescriptor> attributes=featureType.getAttributes();
            for (AttributeDescriptor attr : attributes){
                if (!AttributeDescriptor.GEOMETRY_TYPES.contains(attr.getType())){
                    array.put(attr.getName());
                }
                json.put("attributes", array);
            }
            success=true;
        }else{
            json.put("error", "No featureType found");
        }
        json.put("success", success);
        return new StreamingResolution("application/json") {
           @Override
           public void stream(HttpServletResponse response) throws Exception {
               response.getWriter().print(json.toString());
           }
        };
    }
    
    @ValidationMethod(on = "save")
    public void validateParams(ValidationErrors errors) {        
        if (layarSource == null||layarSource.getLayarService() == null){
            errors.add("layarService", new LocalizableError("validation.required.valueNotPresent"));
        }if (layarSource == null||layarSource.getFeatureType() == null){
            errors.add("featureType", new LocalizableError("validation.required.valueNotPresent"));
        }
    }
    //<editor-fold defaultstate="collapsed" desc="Getters/setters">
    @Override
    public void setContext(ActionBeanContext context) {
        this.context= context;
    }
    
    @Override
    public ActionBeanContext getContext() {
        return this.context;
    }
    
    /**
     * @return the bundle
     */
    public ResourceBundle getBundle() {
        if (bundle==null) {
            bundle = ResourceBundle.getBundle("ViewerResources");
        }
        return bundle;
    }

    /**
     * @param bundle the bundle to set
     */
    public void setBundle(ResourceBundle bundle) {
        this.bundle = bundle;
    }

    public List<LayarService> getLayarServices() {
        return layarServices;
    }
    
    public void setLayarServices(List<LayarService> layarServices) {
        this.layarServices = layarServices;
    }
    
    public Long getLayarServiceId() {
        return layarServiceId;
    }
    
    public void setLayarServiceId(Long layarServiceId) {
        this.layarServiceId = layarServiceId;
    }
    
    public JSONArray getFilter() {
        return filter;
    }
    
    public void setFilter(JSONArray filter) {
        this.filter = filter;
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
    
    public LayarSource getLayarSource() {
        return layarSource;
    }
    
    public void setLayarSource(LayarSource layarSource) {
        this.layarSource = layarSource;
    }
    
    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }
    
    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
    }

    public Map<String, ClobElement> getDetails() {
        return details;
    }

    public void setDetails(Map<String, ClobElement> details) {
        this.details = details;
    }

    public Long getFeatureType() {
        return featureTypeId;
    }

    public void setFeatureTypeId(Long featureTypeId) {
        this.featureTypeId = featureTypeId;
    }

    public List<FeatureSource> getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List<FeatureSource> featureSources) {
        this.featureSources = featureSources;
    }
    //</editor-fold>
}
    
