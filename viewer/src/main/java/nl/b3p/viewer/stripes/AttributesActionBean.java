/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpSession;
import net.sourceforge.stripes.action.*;
import net.sourceforge.stripes.controller.LifecycleStage;
import net.sourceforge.stripes.validation.Validate;
import nl.b3p.geotools.filter.visitor.RemoveDistanceUnit;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.ConfiguredAttribute;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.util.ChangeMatchCase;
import nl.b3p.viewer.util.FeatureToJson;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
//import org.codehaus.httpcache4j.cache.HTTPCache;
//import org.codehaus.httpcache4j.cache.MemoryCacheStorage;
//import org.codehaus.httpcache4j.client.HTTPClientResponseResolver;
import org.geotools.data.FeatureSource;
import org.geotools.data.Query;
import org.geotools.data.wfs.WFSDataStoreFactory;
import org.geotools.factory.CommonFactoryFinder;
import org.geotools.factory.GeoTools;
import org.geotools.filter.text.cql2.CQLException;
import org.geotools.filter.text.ecql.ECQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.filter.And;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/attributes")
@StrictBinding
public class AttributesActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(AttributesActionBean.class);

    private ActionBeanContext context;

    @Validate
    private Application application;

    @Validate
    private ApplicationLayer appLayer;

    @Validate
    private SimpleFeatureType featureType;

    private Layer layer = null;

    @Validate
    private int limit;
    @Validate
    private int page;
    @Validate
    private int start;
    @Validate
    private String dir;
    @Validate
    private String sort;
    @Validate
    private boolean arrays;
    @Validate
    private boolean edit=false;
    @Validate
    private String filter;

    @Validate
    private boolean debug;
    @Validate
    private boolean noCache;

    private boolean unauthorized;

    /**
     * This is retrieved from the layer and is false on a layer that would be
     * editable for the user except that the user has been added to the prevent
     * geometry editing group.
     *
     * @see nl.b3p.viewer.config.services.Layer#getPreventGeomEditors()
     * @see
     * nl.b3p.viewer.config.security.Authorizations#isLayerGeomWriteAuthorized(nl.b3p.viewer.config.services.Layer,
     * javax.servlet.http.HttpServletRequest)
     * 
     */
    private boolean userAllowedToEditGeom = true;

    @Validate
    private List<Long> attributesToInclude = new ArrayList();

    @Validate
    private List<Long> attributesNotNull = new ArrayList();

    /**
     * To force returning geometry set this to true in the request.
     */
    @Validate
    private boolean graph = false;

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ApplicationLayer getAppLayer() {
        return appLayer;
    }

    public void setAppLayer(ApplicationLayer appLayer) {
        this.appLayer = appLayer;
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

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(boolean debug) {
        this.debug = debug;
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

    public boolean isArrays() {
        return arrays;
    }

    public void setArrays(boolean arrays) {
        this.arrays = arrays;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public boolean isNoCache() {
        return noCache;
    }

    public void setNoCache(boolean noCache) {
        this.noCache = noCache;
    }

    public SimpleFeatureType getFeatureType(){
        return this.featureType;
    }

    public void setFeatureType(SimpleFeatureType ft){
        this.featureType=ft;
    }

    public boolean isEdit() {
        return edit;
    }

    public void setEdit(boolean edit) {
        this.edit = edit;
    }

    public List<Long> getAttributesToInclude() {
        return attributesToInclude;
    }

    public void setAttributesToInclude(List<Long> attributesToInclude) {
        this.attributesToInclude = attributesToInclude;
    }

    public boolean isGraph() {
        return graph;
    }

    public void setGraph(boolean graph) {
        this.graph = graph;
    }

    public List<Long> getAttributesNotNull() {
        return attributesNotNull;
    }

    public void setAttributesNotNull(List<Long> attributesNotNull) {
        this.attributesNotNull = attributesNotNull;
    }
    
    //</editor-fold>

    @After(stages=LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        layer = appLayer.getService().getSingleLayer(appLayer.getLayerName(), Stripersist.getEntityManager());
    }

    @Before(stages=LifecycleStage.EventHandling)
    public void checkAuthorization() {
        EntityManager em = Stripersist.getEntityManager();
        if(application == null || appLayer == null
                || !Authorizations.isApplicationReadAuthorized(application, context.getRequest(), em)
                || !Authorizations.isAppLayerReadAuthorized(application, appLayer, context.getRequest(), em)) {
            unauthorized = true;
        }
        userAllowedToEditGeom = Authorizations.isLayerGeomWriteAuthorized(layer, context.getRequest(),em);
     }

    public Resolution attributes() throws JSONException {
        JSONObject json = new JSONObject();

        json.put("success", Boolean.FALSE);
        String error = null;

        if(appLayer == null) {
            error = "Invalid parameters";
        } else if(unauthorized) {
            error = "Not authorized";
        } else {

            appLayer.addAttributesJSON(json, true, Stripersist.getEntityManager());
            if (!userAllowedToEditGeom) {
                // set editable to false on geometry attribute when editing of the
                //  geometry has been disabled on the layer fot the current user
                JSONArray attr = json.getJSONArray("attributes");
                if (json.has("geometryAttributeIndex")) {
                    JSONObject geomAttr = attr.getJSONObject(json.getInt("geometryAttributeIndex"));
                    geomAttr.put("userAllowedToEditGeom", userAllowedToEditGeom);
                }
            }
            json.put("success", Boolean.TRUE);
        }

        if(error != null) {
            json.put("error", error);
        }

        return new StreamingResolution("application/json", new StringReader(json.toString()));
    }

    private static final String CACHE_APPLAYER = "total_count_cache_applayer";
    private static final String CACHE_FILTER = "total_count_cache_filter";
    private static final String CACHE_TIME = "total_count_cache_time";
    private static final String CACHE_COUNT = "total_count_cache";

    private static final int CACHE_MAX_AGE = 600 * 1000;

    /**
     * Call this to clear the "total feature count" cached value when a new feature
     * is added to a feature source. Only clears the cache for the
     * current session.
     *
     * @param context the context that holds the session data
     */
    public static void clearTotalCountCache(ActionBeanContext context) {
        HttpSession sess = context.getRequest().getSession();
        sess.removeAttribute(CACHE_APPLAYER);
        sess.removeAttribute(CACHE_FILTER);
        sess.removeAttribute(CACHE_TIME);
        sess.removeAttribute(CACHE_COUNT);
    }

    private int lookupTotalCountCache(Callable<Integer> countProducer) throws Exception {
        HttpSession session = context.getRequest().getSession();

        Integer total = null;
        Long age = null;
        Long cacheAppLayerId = (Long)session.getAttribute(CACHE_APPLAYER);
        if(appLayer.getId().equals(cacheAppLayerId)) {
            if((filter == null && session.getAttribute(CACHE_FILTER) == null)
            || (filter != null && filter.equals(session.getAttribute(CACHE_FILTER)) )) {
                Long time = (Long)session.getAttribute(CACHE_TIME);
                if(time != null) {
                    age = System.currentTimeMillis() - time;
                    if(age <= CACHE_MAX_AGE) {
                        total = (Integer)session.getAttribute(CACHE_COUNT);
                    }
                }
            }
        }

        if(total != null) {
            log.debug(String.format("Returning cached total count value %d which was cached %s ms ago for app layer id %d",
                    total,
                    age,
                    appLayer.getId()));
            return total;
        } else {
            long startTime = System.currentTimeMillis();
            total = countProducer.call();
            log.debug(String.format("Caching total count value %d which took %d ms to get for app layer id %d",
                    total,
                    System.currentTimeMillis() - startTime,
                    appLayer.getId()));

            // Maybe only cache if getting total took longer than threshold?

            // Now a new feature is only counted for all users after CACHE_MAX_AGE
            // If clearTotalCountCache() is called then the new feature will be
            // counted for the current user/session).

            session.setAttribute(CACHE_APPLAYER, appLayer.getId());
            session.setAttribute(CACHE_FILTER, filter);
            session.setAttribute(CACHE_TIME, System.currentTimeMillis());
            session.setAttribute(CACHE_COUNT, total);

            return total;
        }
    }

    private void setFilter(Query q,SimpleFeatureType ft, ApplicationLayer al) throws Exception {
        if(filter != null && filter.trim().length() > 0) {
            Filter f = ECQL.toFilter(filter);
            f = (Filter)f.accept(new RemoveDistanceUnit(), null);
            f = (Filter)f.accept(new ChangeMatchCase(false), null);
            f = FeatureToJson.reformatFilter(f,ft);
            q.setFilter(f);
        }

        setAttributesNotNullFilters(q, al, ft);
    }

    private static final int MAX_CACHE_SIZE = 50;
/*
    private static HTTPCache cache;
    private static synchronized HTTPCache getHTTPCache() {

        if(cache != null) {
            if(cache.getStorage().size() > MAX_CACHE_SIZE) {
                log.debug("Clearing HTTP cache after reaching max size of " + MAX_CACHE_SIZE);
                // XXX No way to remove items according to strategy?
                cache.clear();
            } else {
                if(log.isDebugEnabled()) {
                    log.debug(String.format("Using HTTP cache; size=%d hits=%d misses=%d hit ratio=%f",
                            cache.getStorage().size(),
                            cache.getStatistics().getHits(),
                            cache.getStatistics().getMisses(),
                            cache.getStatistics().getHitRatio())
                    );
                }
            }
            return cache;
        }

        log.debug("Creating new HTTP cache");
        cache = new HTTPCache(
            new MemoryCacheStorage(), // XXX unchangeable capacity of 1000 is way too high
                                      // should cache based on body size...
                                      // So clear cache if size exceeds MAX_CACHE_SIZE
            HTTPClientResponseResolver.createMultithreadedInstance()
        );
        return cache;
    }
*/
    public Resolution store() throws JSONException, Exception {
        JSONObject json = new JSONObject();

        if(unauthorized) {
            json.put("success", false);
            json.put("message", "Not authorized");
            return new StreamingResolution("application/json", new StringReader(json.toString(4)));
        }

        try {
            int total = 0;

            if(featureType!=null || (layer != null && layer.getFeatureType() != null)) {
                FeatureSource fs;
                SimpleFeatureType ft = featureType;
                if (ft==null){
                    ft=layer.getFeatureType();
                }
                if(isDebug() && ft.getFeatureSource() instanceof WFSFeatureSource) {
                    Map extraDataStoreParams = new HashMap();
                    extraDataStoreParams.put(WFSDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                    fs = ((WFSFeatureSource)ft.getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
                } /*else if(ft.getFeatureSource() instanceof ArcGISFeatureSource) {
                    Map extraDataStoreParams = new HashMap();
                    if(isDebug()) {
                        extraDataStoreParams.put(ArcGISDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                    }
                    if(!isNoCache()) {
                        extraDataStoreParams.put(ArcGISDataStoreFactory.HTTP_CACHE.key, getHTTPCache());
                    }
                    fs = ((ArcGISFeatureSource)ft.getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
                }*/ else {

                    fs = ft.openGeoToolsFeatureSource();
                }

                boolean startIndexSupported = fs.getQueryCapabilities().isOffsetSupported();

                final Query q = new Query(fs.getName().toString());
                //List<String> propertyNames = FeatureToJson.setPropertyNames(appLayer,q,ft,false);

                setFilter(q,ft, appLayer);

                final FeatureSource fs2 = fs;
                total = lookupTotalCountCache(new Callable<Integer>() {
                    public Integer call() throws Exception {
                        return fs2.getCount(q);
                    }
                });

                if(total == -1) {
                    json.put("virtualtotal", true);
                    total = FeatureToJson.MAX_FEATURES;
                }

                q.setStartIndex(start);
                q.setMaxFeatures(Math.min(limit,FeatureToJson.MAX_FEATURES));

                FeatureToJson ftoj = new FeatureToJson(arrays, this.edit, graph, attributesToInclude);

                JSONArray features = ftoj.getJSONFeatures(appLayer,ft, fs, q, sort, dir);

                if (!startIndexSupported){
                    if (features.length() < limit){
                        //the end is reached..... Otherwise there would be a 'limit' number of features
                        total = start+features.length();
                    }
                }
                json.put("success", true);
                json.put("features", features);
            }
            json.put("total", total);
        } catch(Exception e) {
            log.error("Error loading features", e);

            json.put("success", false);

            String message = "Fout bij ophalen features: " + e.toString();
            Throwable cause = e.getCause();
            while(cause != null) {
                message += "; " + cause.toString();
                cause = cause.getCause();
            }
            json.put("message", message);
        }

        return new StreamingResolution("application/json", new StringReader(json.toString(4)));
    }
    
    private void setAttributesNotNullFilters(Query q, ApplicationLayer al, SimpleFeatureType ft) throws CQLException {
        FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());

        List<ConfiguredAttribute> attrs = al.getAttributes(ft);
        List<Filter> filters = new ArrayList<Filter>();
        for (ConfiguredAttribute attr : attrs) {
            if (attributesNotNull.contains(attr.getId())) {
                Filter f = ECQL.toFilter(attr.getAttributeName() + " is not null");
                filters.add(f);
            }
        }
        if (q.getFilter() != null) {
            filters.add(q.getFilter());
        }
        And and = ff2.and(filters);
        q.setFilter(and);
    }
}
