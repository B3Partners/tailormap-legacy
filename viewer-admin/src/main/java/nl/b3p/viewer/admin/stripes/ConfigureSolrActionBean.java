/*
 * Copyright (C) 2013 B3Partners B.V.
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

import java.util.ArrayList;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import net.sourceforge.stripes.action.ActionBean;
import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.AttributeDescriptor;
import nl.b3p.viewer.config.services.FeatureSource;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import nl.b3p.viewer.config.services.SolrConfiguration;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/configuresolr")
@StrictBinding
@RolesAllowed({Group.ADMIN, Group.REGISTRY_ADMIN})
public class ConfigureSolrActionBean implements ActionBean {

    private static final String JSP = "/WEB-INF/jsp/services/solrconfig.jsp";
    private static final String EDIT_JSP = "/WEB-INF/jsp/services/editsolrsource.jsp";
    
    private List<FeatureSource> featureSources = new ArrayList();
    private List<SimpleFeatureType> featureTypes = new ArrayList();
    private ActionBeanContext context;
    
    @Validate
    @ValidateNestedProperties({
            @Validate(field= "simpleFeatureType"),
            @Validate(field= "name")
    })
    private SolrConfiguration solrConfiguration;
    
    
    
    @Validate
    private Long[] attributes;
    
    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public SolrConfiguration getSolrConfiguration() {
        return solrConfiguration;
    }

    public void setSolrConfiguration(SolrConfiguration solrConfiguration) {
        this.solrConfiguration = solrConfiguration;
    }

    public List<FeatureSource> getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List<FeatureSource> featureSources) {
        this.featureSources = featureSources;
    }

    public Long[] getAttributes() {
        return attributes;
    }

    public void setAttributes(Long[] attributes) {
        this.attributes = attributes;
    }

    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }

    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
    }
    
    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    public Resolution edit() {
        return new ForwardResolution(EDIT_JSP);
    }

    public Resolution cancel() {
        return new ForwardResolution(EDIT_JSP);
    }

    public Resolution save() {
        EntityManager em =Stripersist.getEntityManager();
        solrConfiguration.getAttributes().clear();
        for (int i = 0; i < attributes.length; i++) {
            Long attributeId = attributes[i];
            AttributeDescriptor attribute = em.find(AttributeDescriptor.class, attributeId);
            solrConfiguration.getAttributes().add(attribute);
        }
        em.persist(solrConfiguration);
        em.getTransaction().commit();
        
        return new ForwardResolution(EDIT_JSP);
    }

    public Resolution newSearchConfig() {
        solrConfiguration = new SolrConfiguration();
        return new ForwardResolution(EDIT_JSP);
    }
    
    @After(on = {"edit", "save", "newSearchConfig"}, stages = LifecycleStage.BindingAndValidation)
    public void loadLists(){
        
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
        if(solrConfiguration != null && solrConfiguration.getSimpleFeatureType() != null){
            featureTypes = solrConfiguration.getSimpleFeatureType().getFeatureSource().getFeatureTypes();
        }
    }

    public Resolution delete() {
        return new ForwardResolution(JSP);
    }

    public Resolution getGridData() throws JSONException {
        EntityManager em =Stripersist.getEntityManager();
        List<SolrConfiguration> configs = em.createQuery("FROM SolrConfiguration").getResultList();
        JSONArray gridRows = new JSONArray();
        for (SolrConfiguration solrConfig : configs) {
            JSONObject config= solrConfig.toJSON();
            config.put("lastprocessed", "1-2-2012");
            gridRows.put(config);
        }
        
        JSONObject json = new JSONObject();
        json.put("totalCount", configs.size());
        json.put("gridrows", gridRows);
        return new StreamingResolution("application/json", json.toString(4));
    }
}
