/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
import net.sourceforge.stripes.action.Before;
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
import nl.b3p.viewer.config.services.SolrConfiguration;
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
    private ActionBeanContext context;
    @ValidateNestedProperties({
            @Validate(field= "simpleFeatureType")
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
    //</editor-fold>
    
    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    public Resolution edit() {
        solrConfiguration = new SolrConfiguration();
        solrConfiguration.setId(16L);
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
    
    @Before(on = {"edit", "save", "newSearchConfig"}, stages = LifecycleStage.BindingAndValidation)
    public void loadLists(){
        
        featureSources = Stripersist.getEntityManager().createQuery("from FeatureSource").getResultList();
    }

    public Resolution delete() {
        return new ForwardResolution(JSP);
    }

    public Resolution getGridData() throws JSONException {
        JSONObject json = new JSONObject("{\"totalCount\":3,\"gridrows\":[{\"id\":1, \"lastprocessed\": \"1-2-2012\"},{\"id\":2, \"lastprocessed\": \"1-2-2012\"},{\"id\":3, \"lastprocessed\": \"1-2-2012\"}]}");

        return new StreamingResolution("application/json", json.toString(4));
    }
}
