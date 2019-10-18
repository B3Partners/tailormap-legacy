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
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletResponse;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.validation.*;
import nl.b3p.i18n.LocalizableActionBean;
import nl.b3p.viewer.config.security.Group;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.solr.SolrInitializer;
import nl.b3p.web.WaitPageStatus;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.solr.client.solrj.SolrServer;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.hibernate.*;
import org.hibernate.criterion.*;
import org.json.*;
import org.stripesstuff.plugin.waitpage.WaitPage;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/attributesource/{$event}")
@StrictBinding
@RolesAllowed({Group.ADMIN, Group.REGISTRY_ADMIN})
public class AttributeSourceActionBean extends LocalizableActionBean {

    private static final Log log = LogFactory.getLog(AttributeSourceActionBean.class);
    private ActionBeanContext context;
            
    private static final String JSP = "/WEB-INF/jsp/services/attributesource.jsp";
    private static final String EDITJSP = "/WEB-INF/jsp/services/editattributesource.jsp";
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
    @Validate(on = {"save", "saveEdit"}, required = true, label="Naam")
    private String name;
    @Validate
    private String url;
    @Validate(on = "save", required = true)
    private String protocol = "jdbc";
    @Validate
    private String username;
    @Validate
    private String password;
    @Validate(on = "save")
    private String host;
    @Validate(on = "save")
    private String port;
    @Validate(on = "save")
    private String dbtype;
    @Validate(on = "save")
    private String database;
    @Validate(on = "save")
    private String schema;
    private WaitPageStatus status = new WaitPageStatus();
    @Validate
    private FeatureSource featureSource;

    private boolean updatable;
    
    //for updatable reporting
    @Validate
    private Map<UpdateResult.Status,List<SimpleFeatureType>> changedFeatureTypes;
    @Validate
    private Long changedFeatureSourceId;
        
    @DefaultHandler
    public Resolution view() {
        return new ForwardResolution(JSP);
    }

    public Resolution edit() {
        if (featureSource != null) {
            protocol = featureSource.getProtocol();
            name = featureSource.getName();
            url = featureSource.getUrl();
            username = featureSource.getUsername();
            password = featureSource.getPassword();
        }
        return new ForwardResolution(EDITJSP);
    }

    public Resolution newAttributeSource() {
        return new ForwardResolution(EDITJSP);
    }

    public Resolution cancel() {
        return new ForwardResolution(EDITJSP);
    }

    public Resolution delete() {
        EntityManager em = Stripersist.getEntityManager();

        deleteFeatureSource(em, SolrInitializer.getServerInstance());
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributesourceactionbean.asremoved")));
        return new ForwardResolution(EDITJSP);
    }

    protected void deleteFeatureSource(EntityManager em, SolrServer server){
        if (!featureSource.getFeatureTypes().isEmpty()) {
            em.createQuery("update Layer set featureType = null where featureType in :fts").setParameter("fts", featureSource.getFeatureTypes()).executeUpdate();
            em.createQuery("update ConfiguredAttribute set featureType=null where featureType in :fts").setParameter("fts",featureSource.getFeatureTypes()).executeUpdate();
            em.createQuery("update ConfiguredAttribute set valueListFeatureType=null where valueListFeatureType in :fts").setParameter("fts",featureSource.getFeatureTypes()).executeUpdate();

            List<SolrConf> confs = em.createQuery("FROM SolrConf where simpleFeatureType in :fts", SolrConf.class).setParameter("fts",featureSource.getFeatureTypes()).getResultList();
            for (SolrConf conf : confs) {
                ConfigureSolrActionBean.deleteSolrConfiguration(em, conf, server);
            }
        }

        em.createQuery("update ConfiguredAttribute set valueListFeatureSource=null, valueListLabelName=null,valueListValueName=null where valueListFeatureSource in :fs").setParameter("fs",featureSource).executeUpdate();

        em.remove(featureSource);

        em.getTransaction().commit();
    }

    @WaitPage(path = "/WEB-INF/jsp/waitpage.jsp", delay = 2000, refresh = 1000, ajax = "/WEB-INF/jsp/waitpageajax.jsp")
    public Resolution save() throws JSONException, Exception {
        

        try {
            addService(Stripersist.getEntityManager());
        } catch (Exception e) {
            log.error("Error loading new feauture source", e);
            String s = e.toString();
            if (e.getCause() != null) {
                s += "; cause: " + e.getCause().toString();
            }
            getContext().getValidationErrors().addGlobalError(new SimpleError(getBundle().getString("viewer_admin.attributesourceactionbean.errorload"), s));
        }

        return new ForwardResolution(EDITJSP);
    }

    protected void addService(EntityManager em) throws Exception {
        Map params = new HashMap();
        if (protocol.equals("jdbc")) {
            params.put("dbtype", dbtype);
            params.put("host", host);
            params.put("port", port);
            params.put("database", database);
            params.put("schema", schema);
            params.put("user", username);
            params.put("passwd", password);

            JDBCFeatureSource fs = new JDBCFeatureSource(params);
            fs.setName(name);
            fs.loadFeatureTypes(status);

            em.persist(fs);
            em.getTransaction().commit();

            featureSource = fs;

            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributesourceactionbean.asloaded")));

        } else if (protocol.equals("wfs")) {
            params.put(WFSDataStoreFactory.URL.key, url);
            params.put(WFSDataStoreFactory.USERNAME.key, username);
            params.put(WFSDataStoreFactory.PASSWORD.key, password);
            WFSFeatureSource fs = new WFSFeatureSource(params);
            fs.setName(name);
            fs.loadFeatureTypes(status);
            em.persist(fs);
            em.getTransaction().commit();

            featureSource = fs;

            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributesourceactionbean.asloaded")));

        } else {
            getContext().getValidationErrors().add("protocol", new SimpleError(getBundle().getString("viewer_admin.attributesourceactionbean.invalid")));
        }
    }

    public Resolution saveEdit() {
        featureSource.setName(name);
        featureSource.setUsername(username);
        if (password != null) {
            featureSource.setPassword(password);
        }
        // When an user updates the service which formerly had a user/pass, but now it doesn't anymore -> remove the password (username already removed in L210
        if(username == null && password == null){ 
            featureSource.setPassword(password);
        }

        Stripersist.getEntityManager().persist(featureSource);
        Stripersist.getEntityManager().getTransaction().commit();

        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributesourceactionbean.asloaded")));

        return edit();
    }
    
    public Resolution update() throws Exception{
        if(!isUpdatable()) {
            getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributesourceactionbean.noupdate"),
                    featureSource.getProtocol()));
            return new ForwardResolution(EDITJSP);
        }
        EntityManager em = Stripersist.getEntityManager();
        FeatureSourceUpdateResult result = ((UpdatableFeatureSource)featureSource).update(em);
        
        if(result.getStatus() == UpdateResult.Status.FAILED) {
            getContext().getValidationErrors().addGlobalError(new SimpleError(result.getMessage()));
            em.getTransaction().rollback();
            return new ForwardResolution(EDITJSP);
        }
        
        Map<UpdateResult.Status,List<String>> byStatus = result.getLayerNamesByStatus();        
        log.info(String.format("Update featuretypes stats: unmodified %d, updated %d, new %d, missing %d",
                byStatus.get(UpdateResult.Status.UNMODIFIED).size(),
                byStatus.get(UpdateResult.Status.UPDATED).size(),
                byStatus.get(UpdateResult.Status.NEW).size(),
                byStatus.get(UpdateResult.Status.MISSING).size()
        ));
        log.info("Unmodified featuretypes: " + byStatus.get(UpdateResult.Status.UNMODIFIED));
        log.info("Updated featuretypes: " + byStatus.get(UpdateResult.Status.UPDATED));
        log.info("New featuretypes: " + byStatus.get(UpdateResult.Status.NEW));
        log.info("Missing featuretypes: " + byStatus.get(UpdateResult.Status.MISSING));
        
        this.changedFeatureTypes = result.getFeatureTypeByStatus();
        this.changedFeatureSourceId = featureSource.getId();
        
        getContext().getMessages().add(new SimpleMessage(getBundle().getString("viewer_admin.attributesourceactionbean.aschanged"),
            byStatus.get(UpdateResult.Status.UPDATED).size(),
            byStatus.get(UpdateResult.Status.UNMODIFIED).size(),
            byStatus.get(UpdateResult.Status.NEW).size(),
            byStatus.get(UpdateResult.Status.MISSING).size()
        ));
        
        em.persist(featureSource);
        em.getTransaction().commit();
        
        return new ForwardResolution(EDITJSP);
    }

    @ValidationMethod(on = {"save", "saveEdit"})
    public void validate(ValidationErrors errors) throws Exception {
        if (name == null) {
            errors.add("name", new SimpleError(getBundle().getString("viewer_admin.attributesourceactionbean.nameobl")));
            return;
        }

        if (featureSource == null) {
            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from FeatureSource where name = :name").setMaxResults(1).setParameter("name", name).getSingleResult();

                errors.add("name", new SimpleError(getBundle().getString("viewer_admin.attributesourceactionbean.uniquename")));
                return;

            } catch (NoResultException nre) {
                // name is unique
            }
        } else {
            try {
                Object o = Stripersist.getEntityManager().createQuery("select 1 from FeatureSource where name = :name "
                        + "and id != :id").setMaxResults(1).setParameter("name", name).setParameter("id", featureSource.getId()).getSingleResult();

                errors.add("name", new SimpleError(getBundle().getString("viewer_admin.attributesourceactionbean.uniquename")));
                return;

            } catch (NoResultException nre) {
                // name is unique
            }
        }
    }

    public Resolution getGridData() throws JSONException {
        JSONArray jsonData = new JSONArray();

        String filterName = "";
        String filterUrl = "";
        String filterType = "";
        /*
         * FILTERING: filter is delivered by frontend as JSON array [{property,
         * value}] for demo purposes the value is now returned, ofcourse here
         * should the DB query be built to filter the right records
         */
        if (this.getFilter() != null) {
            for (int k = 0; k < this.getFilter().length(); k++) {
                JSONObject j = this.getFilter().getJSONObject(k);
                String property = j.getString("property");
                String value = j.getString("value");
                if (property.equals("name")) {
                    filterName = value;
                }
                if (property.equals("url")) {
                    filterUrl = value;
                }
                if (property.equals("protocol")) {
                    filterType = value;
                }
            }
        }

        Session sess = (Session) Stripersist.getEntityManager().getDelegate();
        Criteria c = sess.createCriteria(FeatureSource.class);

        /*
         * Sorting is delivered by the frontend as two variables: sort which
         * holds the column name and dir which holds the direction (ASC, DESC).
         */
        if (sort != null && dir != null) {
            /*
             * Sorteren op status nog niet mogelijk
             */
            if (!sort.equals("status") && !sort.equals("protocol")) {
                Order order = null;
                if (dir.equals("ASC")) {
                    order = Order.asc(sort);
                } else {
                    order = Order.desc(sort);
                }
                order.ignoreCase();
                c.addOrder(order);
            } else {
                if (sort.equals("protocol")) {
                    Order order = null;
                    if (dir.equals("ASC")) {
                        order = Order.asc("class");
                    } else {
                        order = Order.desc("class");
                    }
                    order.ignoreCase();
                    c.addOrder(order);
                }
            }
        }

        if (filterName != null && filterName.length() > 0) {
            Criterion nameCrit = Restrictions.ilike("name", filterName, MatchMode.ANYWHERE);
            c.add(nameCrit);
        }
        if (filterUrl != null && filterUrl.length() > 0) {
            Criterion urlCrit = Restrictions.ilike("url", filterUrl, MatchMode.ANYWHERE);
            c.add(urlCrit);
        }
        if (filterType != null && filterType.length() > 0) {
            Criterion protocolCrit = Restrictions.ilike("class", filterType, MatchMode.ANYWHERE);
            c.add(protocolCrit);
        }

        int rowCount = c.list().size();

        c.setMaxResults(limit);
        c.setFirstResult(start);

        List sources = c.list();

        for (Iterator it = sources.iterator(); it.hasNext();) {
            FeatureSource source = (FeatureSource) it.next();
            String protocolType = "";
            if (source instanceof WFSFeatureSource) {
                protocolType = "WFS";
            } else if (source instanceof JDBCFeatureSource) {
                protocolType = "JDBC";
            } else if (source instanceof ArcGISFeatureSource) {
                protocolType = "ArcGIS";
            }
            JSONObject j = this.getGridRow(source.getId().intValue(), source.getName(), source.getUrl(), protocolType);
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

    private JSONObject getGridRow(int id, String name, String url, String type) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("id", id);
        j.put("status", "ok");//Math.random() > 0.5 ? "ok" : "error");
        j.put("name", "#" + id + " " + name);
        j.put("url", url);
        j.put("protocol", type);
        return j;
    }
    
    @Before
    public void setUpdatable() {
        updatable = featureSource instanceof UpdatableFeatureSource;
    }       

    //<editor-fold defaultstate="collapsed" desc="getters & setters">
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public ActionBeanContext getContext() {
        return this.context;
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

    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public JSONArray getFilter() {
        return filter;
    }

    public void setFilter(JSONArray filter) {
        this.filter = filter;
    }

    public FeatureSource getFeatureSource() {
        return featureSource;
    }

    public void setFeatureSource(FeatureSource featureSource) {
        this.featureSource = featureSource;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getDbtype() {
        return dbtype;
    }

    public void setDbtype(String dbtype) {
        this.dbtype = dbtype;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getPort() {
        return port;
    }

    public void setPort(String port) {
        this.port = port;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public WaitPageStatus getStatus() {
        return status;
    }

    public void setStatus(WaitPageStatus status) {
        this.status = status;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    public boolean isUpdatable() {
        return updatable;
    }

    public void setUpdatable(boolean updatable) {
        this.updatable = updatable;
    }
    
    public Map<UpdateResult.Status,List<SimpleFeatureType>> getChangedFeatureTypes() {
        return changedFeatureTypes;
    }

    public void setChangedFeatureTypes(Map<UpdateResult.Status,List<SimpleFeatureType>> changedFeatureTypes) {
        this.changedFeatureTypes = changedFeatureTypes;
    }
    
    public Long getChangedFeatureSourceId() {
        return changedFeatureSourceId;
    }

    public void setChangedFeatureSourceId(Long changedFeatureSourceId) {
        this.changedFeatureSourceId = changedFeatureSourceId;
    }
    //</editor-fold>

}
