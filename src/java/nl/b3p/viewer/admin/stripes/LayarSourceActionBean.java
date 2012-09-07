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
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.Before;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.DontBind;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.SimpleMessage;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.EmailTypeConverter;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.AttributeDescriptor;
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
    
    private List<LayarService> layarServices;
    
    private List<SimpleFeatureType> featureTypes;
    
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
    @ValidateNestedProperties({
        @Validate(field="featureType"),
        @Validate(field="details"),
        @Validate(field="layarService")
    })
    private LayarSource layarSource = null;
    
    @DefaultHandler
    public Resolution view() {
        layarServices = Stripersist.getEntityManager().createQuery("from LayarService").getResultList();
        return new ForwardResolution(JSP);
    }
    
    public Resolution save(){        
        Stripersist.getEntityManager().persist(layarSource);
        Stripersist.getEntityManager().getTransaction().commit();
        
        getContext().getMessages().add(new SimpleMessage("Layarsource is opgeslagen"));
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution edit() {
        layarServices = Stripersist.getEntityManager().createQuery("from LayarService").getResultList();
        featureTypes = Stripersist.getEntityManager().createQuery("from SimpleFeatureType").getResultList();        
        Stripersist.getEntityManager().getTransaction().commit();
        return new ForwardResolution(EDITJSP);
    }
        
    public Resolution cancel() {        
        return new ForwardResolution(EDITJSP);
    }
    
    public Resolution delete() {
        Stripersist.getEntityManager().remove(layarSource);
        Stripersist.getEntityManager().getTransaction().commit();
        getContext().getMessages().add(new SimpleMessage("Layar bron is verwijderd"));
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
                    if(property.equals("layerService")) {
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
            Criterion attrCrit = Restrictions.eq("layarService", layarServiceId);
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
    //<editor-fold defaultstate="collapsed" desc="Getters/setters">
    @Override
    public void setContext(ActionBeanContext context) {
        this.context= context;
    }
    
    @Override
    public ActionBeanContext getContext() {
        return this.context;
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
    
    //</editor-fold>
}
