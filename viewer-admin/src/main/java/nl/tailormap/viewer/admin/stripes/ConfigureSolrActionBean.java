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
package nl.tailormap.viewer.admin.stripes;

import net.sourceforge.stripes.action.ActionBeanContext;
import net.sourceforge.stripes.action.After;
import net.sourceforge.stripes.action.DefaultHandler;
import net.sourceforge.stripes.action.ForwardResolution;
import net.sourceforge.stripes.action.Resolution;
import net.sourceforge.stripes.action.StreamingResolution;
import net.sourceforge.stripes.action.StrictBinding;
import net.sourceforge.stripes.action.UrlBinding;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.SimpleError;
import net.sourceforge.stripes.validation.Validate;
import net.sourceforge.stripes.validation.ValidateNestedProperties;
import nl.tailormap.i18n.LocalizableActionBean;
import nl.tailormap.viewer.config.security.Group;
import nl.tailormap.viewer.config.services.AttributeDescriptor;
import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import nl.tailormap.viewer.config.services.SolrConf;
import nl.tailormap.viewer.solr.SolrInitializer;
import nl.tailormap.viewer.solr.SolrUpdateJob;
import nl.tailormap.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.SolrPingResponse;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.plugin.waitpage.WaitPage;
import org.stripesstuff.stripersist.Stripersist;

import javax.annotation.security.RolesAllowed;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

/**
 *
 * @author Meine Toonen
 */
@UrlBinding("/action/configuresolr")
@StrictBinding
@RolesAllowed({Group.ADMIN, Group.REGISTRY_ADMIN})
public class ConfigureSolrActionBean extends LocalizableActionBean {
    private static final Log log = LogFactory.getLog(ConfigureSolrActionBean.class);

    private static final String JSP = "/WEB-INF/jsp/services/solrconfig.jsp";
    private static final String EDIT_JSP = "/WEB-INF/jsp/services/editsolrsource.jsp";

    private static final String PROTOTYPE_JSP = "/WEB-INF/jsp/services/searchPrototype.jsp";

    private List<FeatureSource> featureSources = new ArrayList();
    private List<SimpleFeatureType> featureTypes = new ArrayList();
    private ActionBeanContext context;

    @Validate
    @ValidateNestedProperties({
            @Validate(field= "simpleFeatureType"),
            @Validate(field= "name",required = true, on = "save")
    })
    private SolrConf solrConfiguration;

    @Validate
    private Long simpleFeatureTypeId;

    @Validate
    private Long[] indexAttributes;

    @Validate
    private Long[] resultAttributes;

    private WaitPageStatus status;

    @Validate
    private String term;

    @Validate
    private Integer page;

    @Validate
    private Integer start;

    @Validate
    private Integer limit;

    @Validate
    private JSONArray filter;

    private Boolean solrInitialized = true;

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public SolrConf getSolrConfiguration() {
        return solrConfiguration;
    }

    public void setSolrConfiguration(SolrConf solrConfiguration) {
        this.solrConfiguration = solrConfiguration;
    }

    public List<FeatureSource> getFeatureSources() {
        return featureSources;
    }

    public void setFeatureSources(List<FeatureSource> featureSources) {
        this.featureSources = featureSources;
    }

    public Long[] getIndexAttributes() {
        return indexAttributes;
    }

    public void setIndexAttributes(Long[] indexAttributes) {
        this.indexAttributes = indexAttributes;
    }

    public Long[] getResultAttributes() {
        return resultAttributes;
    }

    public void setResultAttributes(Long[] resultAttributes) {
        this.resultAttributes = resultAttributes;
    }

    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }

    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
    }

    public Long getSimpleFeatureTypeId() {
        return simpleFeatureTypeId;
    }

    public void setSimpleFeatureTypeId(Long simpleFeatureTypeId) {
        this.simpleFeatureTypeId = simpleFeatureTypeId;
    }

    public WaitPageStatus getStatus() {
        return status;
    }

    public void setStatus(WaitPageStatus status) {
        this.status = status;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public Boolean getSolrInitialized() {
        return solrInitialized;
    }

    public void setSolrInitialized(Boolean solrInitialized) {
        this.solrInitialized = solrInitialized;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public JSONArray getFilter() {
        return filter;
    }

    public void setFilter(JSONArray filter) {
        this.filter = filter;
    }
    //</editor-fold>

    @DefaultHandler
    public Resolution view() throws SolrServerException {
        SolrServer server = SolrInitializer.getServerInstance();
        try{
            SolrPingResponse resp = server.ping();
        }catch(Exception e){
            log.error("Solr ping exception", e);
            this.context.getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.configuresolractionbean.solrnoconfig")));
            solrInitialized = false;
        }
        return new ForwardResolution(JSP);
    }

    public Resolution edit() {
        return new ForwardResolution(EDIT_JSP);
    }

    @WaitPage(path = "/WEB-INF/jsp/waitpage.jsp", delay = 2000, refresh = 1000, ajax = "/WEB-INF/jsp/waitpageajax.jsp")
    public Resolution addToIndex() throws InterruptedException {
        removeFromIndex();
        status = new WaitPageStatus();
        EntityManager em = Stripersist.getEntityManager();
        SolrServer server = SolrInitializer.getServerInstance();
        solrConfiguration = em.find(SolrConf.class, solrConfiguration.getId());
        SolrUpdateJob.insertSolrConfigurationIntoIndex(solrConfiguration, em, status, server);
        em.getTransaction().commit();
        return new ForwardResolution(EDIT_JSP);
    }

    public Resolution removeFromIndex(){
        EntityManager em = Stripersist.getEntityManager();
        SolrServer server = SolrInitializer.getServerInstance();
        removeConfigurationFromIndex(em, solrConfiguration, server);
        em.getTransaction().commit();
        return new ForwardResolution(EDIT_JSP);
    }

    public static void removeConfigurationFromIndex(EntityManager em, SolrConf conf, SolrServer server){
        conf = em.find(SolrConf.class, conf.getId());
        SolrUpdateJob.removeSolrConfigurationFromIndex(conf, em, server);
    }

    public Resolution cancel() {
        return new ForwardResolution(EDIT_JSP);
    }

    public Resolution save() {
        EntityManager em =Stripersist.getEntityManager();
        solrConfiguration.getIndexAttributes().clear();
        solrConfiguration.getResultAttributes().clear();
        for (int i = 0; i < indexAttributes.length; i++) {
            Long attributeId = indexAttributes[i];
            AttributeDescriptor attribute = em.find(AttributeDescriptor.class, attributeId);
            solrConfiguration.getIndexAttributes().add(attribute.getName());
        }

        for (int i = 0; i < resultAttributes.length; i++) {
            Long attributeId = resultAttributes[i];
            AttributeDescriptor attribute = em.find(AttributeDescriptor.class, attributeId);
            solrConfiguration.getResultAttributes().add(attribute.getName());
        }
        em.persist(solrConfiguration);
        em.getTransaction().commit();

        return new ForwardResolution(EDIT_JSP);
    }

    public Resolution newSearchConfig() {
        solrConfiguration = new SolrConf();
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
        EntityManager em = Stripersist.getEntityManager();
        deleteSolrConfiguration(em, solrConfiguration, SolrInitializer.getServerInstance());
        em.getTransaction().commit();
        return new ForwardResolution(EDIT_JSP);
    }

    public static void deleteSolrConfiguration(EntityManager em, SolrConf conf, SolrServer server){
        removeConfigurationFromIndex(em, conf, server);
        em.remove(conf);
    }

    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();

        String filterName = "";
        String lastUpdated = "";

        if (this.getFilter() != null) {
            for (int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if (property.equals("name")) {
                    filterName = value;
                }
                if (property.equals("lastUpdated")) {
                    lastUpdated = value;
                }
            }
        }

        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(SolrConf.class);

        if (filterName != null && filterName.length() > 0) {
            Criterion nameCrit = Restrictions.ilike("name", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        if (lastUpdated != null && lastUpdated.length() > 0) {
            Criterion lastUpdatedCrit = Restrictions.ilike("lastUpdated", lastUpdated, MatchMode.ANYWHERE);
            c.add(lastUpdatedCrit);
        }

        int rowCount = c.list().size();

        c.setMaxResults(limit);
        c.setFirstResult(start);

        List sources = c.list();

        for (Iterator it = sources.iterator(); it.hasNext();) {
            SolrConf config = (SolrConf) it.next();

            JSONObject j = config.toJSON();
            jsonData.put(j);
        }

        final JSONObject grid = new JSONObject();
        grid.put("totalCount", rowCount);
        grid.put("gridrows", jsonData);

        return new StreamingResolution("application/json", grid.toString());
    }

    public Resolution getSearchconfigData() throws JSONException {
        EntityManager em =Stripersist.getEntityManager();
        List<SolrConf> configs = em.createQuery("FROM SolrConf").getResultList();
        JSONArray searchconfigs = new JSONArray();
        for (SolrConf solrConfig : configs) {
            JSONObject config = new JSONObject();
            config.put("id", solrConfig.getId());
            config.put("name", solrConfig.getName());
            searchconfigs.put(config);
        }
        return new StreamingResolution("application/json", searchconfigs.toString(4));
    }

    public Resolution getAttributesList() throws JSONException {
        JSONArray jsonData = new JSONArray();

        List<SimpleFeatureType> featureTypes= new ArrayList();
        if(simpleFeatureTypeId != null && simpleFeatureTypeId != -1){
            SimpleFeatureType sft = (SimpleFeatureType)Stripersist.getEntityManager().find(SimpleFeatureType.class, simpleFeatureTypeId);
            if (sft!=null){
                featureTypes.add(sft);
            }
        }else{
            throw new IllegalArgumentException ("No simpleFeatureType id provided");
        }

        Session sess = (Session)Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(AttributeDescriptor.class);


        /* Criteria for the all attribute descriptor ids of the feature types
         * in featureTypes
         */
        DetachedCriteria c2 = DetachedCriteria.forClass(SimpleFeatureType.class);
        Collection ftIds = new ArrayList<Long>();
        for (SimpleFeatureType sft : featureTypes) {
            ftIds.add(sft.getId());
        }
        c2.add(Restrictions.in("id", ftIds));
        c2.createAlias("attributes", "attr");
        c2.setProjection(Projections.property("attr.id"));

        c.add(org.hibernate.criterion.Property.forName("id").in(c2));
        int rowCount = c.list().size();


        List<AttributeDescriptor> attrs = c.list();

        for(Iterator<AttributeDescriptor> it = attrs.iterator(); it.hasNext();){
            AttributeDescriptor attr = it.next();
            boolean indexChecked = false;
            boolean resultChecked = false;
            if(solrConfiguration != null){
                for (String configAttribute : solrConfiguration.getIndexAttributes()) {
                    if(configAttribute.equals(attr.getName())){
                        indexChecked=  true;
                        break;
                    }
                }
                for (String resultAttribute : solrConfiguration.getResultAttributes()) {
                    if(resultAttribute.equals(attr.getName())){
                        resultChecked =  true;
                        break;
                    }
                }
            }
            JSONObject j = new JSONObject();
            j.put("id", attr.getId().intValue());
            j.put("alias", attr.getAlias());
            j.put("attribute", attr.getName());
            j.put("indexChecked", indexChecked);
            j.put("resultChecked", resultChecked);
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

}
