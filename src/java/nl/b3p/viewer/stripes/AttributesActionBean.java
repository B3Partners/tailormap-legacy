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
package nl.b3p.viewer.stripes;

import java.io.StringReader;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import javax.persistence.NoResultException;
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
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.text.cql2.CQL;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@UrlBinding("/action/attributes")
@StrictBinding
public class AttributesActionBean implements ActionBean {
    private static final Log log = LogFactory.getLog(AttributesActionBean.class);
    
    private static final int MAX_FEATURES = 1000;
    
    private ActionBeanContext context;
    
    @Validate
    private Application application;
    
    @Validate
    private ApplicationLayer appLayer;
    
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
    private String filter;
    
    @Validate
    private boolean debug;
    @Validate
    private boolean noCache;
    
    private boolean unauthorized;
    
    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public ActionBeanContext getContext() {
        return context;
    }
    
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
    //</editor-fold>
    
    @After(stages=LifecycleStage.BindingAndValidation)
    public void loadLayer() {
        layer = appLayer.getService().getSingleLayer(appLayer.getLayerName());
    }
    
    @Before(stages=LifecycleStage.EventHandling)
    public void checkAuthorization() {
        
        if(application == null || appLayer == null 
                || !Authorizations.isAppLayerReadAuthorized(application, appLayer, context.getRequest())) {
            unauthorized = true;
        }
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

            Map<String,AttributeDescriptor> featureTypeAttributes = new HashMap<String,AttributeDescriptor>();
            SimpleFeatureType ft = null;
            if(layer != null) {
                ft = layer.getFeatureType();
                if(ft != null) {
                    featureTypeAttributes = makeAttributeDescriptorList(ft);
                }
            } 
            
            Integer geometryAttributeIndex = null;
            JSONArray attributes = new JSONArray();
            for(ConfiguredAttribute ca: appLayer.getAttributes()) {
                JSONObject j = ca.toJSONObject();
                
                AttributeDescriptor ad = featureTypeAttributes.get(ca.getFullName());
                if(ad != null) {
                    j.put("alias", ad.getAlias());
                    j.put("type", ad.getType());

                    if(ft != null && ca.getAttributeName().equals(ft.getGeometryAttribute())) {
                        geometryAttributeIndex = attributes.length();
                    }
                }
                attributes.put(j);
            }
            
            if(ft != null) {
                json.put("geometryAttribute", ft.getGeometryAttribute());
            }
            if(geometryAttributeIndex != null) {
                json.put("geometryAttributeIndex", geometryAttributeIndex);
            }
            json.put("attributes", attributes);
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
    
    private static final int CACHE_MAX_AGE = 60 * 1000;
    
    /**
     * Call this to clear the "total feature count" cached value when a new feature 
     * is added to a feature source. Only clears the cache for the current session.
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
    /**
     * Get a list of visible propertynames from the appLayer where the ConfiguredAttribute
     * is from the given SimpleFeatureType. If one or more Attributes are configured 
     * to be not visible, add the list of visible propertynames to the query.
     */
    private List<String> setPropertyNames(Query q, SimpleFeatureType sft) {
        List<String> propertyNames = new ArrayList<String>();
        boolean haveInvisibleProperties = false;
        for(ConfiguredAttribute ca: appLayer.getAttributes(sft)) {
            if(ca.isVisible()) {
                propertyNames.add(ca.getAttributeName());
            } else {
                haveInvisibleProperties = true;
            }
        }
        if(haveInvisibleProperties) {
            // By default Query retrieves Query.ALL_NAMES
            // Query.NO_NAMES is an empty String array
            q.setPropertyNames(propertyNames);
        }
        return propertyNames;
    }
    
    private void setSortBy(Query q, List<String> propertyNames) {
        FilterFactory2 ff2 = CommonFactoryFinder.getFilterFactory2(GeoTools.getDefaultHints());                
        
        if(sort != null) {

            String sortAttribute = null;
            if(arrays) {
                int i = Integer.parseInt(sort.substring(1));

                int j = 0;
                for(String name: propertyNames) {
                    if(j == i) {
                        sortAttribute = name;
                    }
                    j++;
                }
            } else {
                sortAttribute = sort;
            }
            if(sortAttribute != null) {
                q.setSortBy(new SortBy[] {
                    ff2.sort(sortAttribute, "DESC".equals(dir) ? SortOrder.DESCENDING : SortOrder.ASCENDING)
                });
            }
        }                
    }
    
    private void setFilter(Query q) throws Exception {
        if(filter != null && filter.trim().length() > 0) {
            Filter f = CQL.toFilter(filter);
            f = (Filter)f.accept(new RemoveDistanceUnit(), null);
            q.setFilter(f);
        }
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
        
        JSONArray features = new JSONArray();
        json.put("features", features);
        
        try {
            int total = 0;
            
            if(layer != null && layer.getFeatureType() != null) {
                FeatureSource fs;

                if(isDebug() && layer.getFeatureType().getFeatureSource() instanceof WFSFeatureSource) {
                    Map extraDataStoreParams = new HashMap();
                    extraDataStoreParams.put(WFSDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                    fs = ((WFSFeatureSource)layer.getFeatureType().getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
                } /*else if(layer.getFeatureType().getFeatureSource() instanceof ArcGISFeatureSource) {
                    Map extraDataStoreParams = new HashMap();
                    if(isDebug()) {
                        extraDataStoreParams.put(ArcGISDataStoreFactory.TRY_GZIP.key, Boolean.FALSE);
                    }
                    if(!isNoCache()) {
                        extraDataStoreParams.put(ArcGISDataStoreFactory.HTTP_CACHE.key, getHTTPCache());
                    }
                    fs = ((ArcGISFeatureSource)layer.getFeatureType().getFeatureSource()).openGeoToolsFeatureSource(layer.getFeatureType(), extraDataStoreParams);
                }*/ else {
                    
                    fs = layer.getFeatureType().openGeoToolsFeatureSource();
                }
                
                boolean startIndexSupported = fs.getQueryCapabilities().isOffsetSupported();

                final Query q = new Query(fs.getName().toString());
                List<String> propertyNames = setPropertyNames(q,layer.getFeatureType());
                setSortBy(q, propertyNames);
                setFilter(q);
                
                final FeatureSource fs2 = fs;
                total = lookupTotalCountCache(new Callable<Integer>() {
                    public Integer call() throws Exception {
                        return fs2.getCount(q);
                    }
                });

                if(total == -1) {
                    total = MAX_FEATURES;
                }
                
                q.setStartIndex(start);
                q.setMaxFeatures(Math.min(limit + (startIndexSupported ? 0 : start),MAX_FEATURES));
                
                FeatureCollection fc = fs.getFeatures(q);

                FeatureIterator<SimpleFeature> it = fc.features();
                try {
                    while(it.hasNext()) {
                        SimpleFeature f = it.next();

                        if(!startIndexSupported && start > 0) {
                            start--;
                            continue;
                        }

                        if(arrays) {
                            JSONObject j = new JSONObject();
                            int idx = 0;
                            for(String name: propertyNames) {
                                Object value = f.getAttribute(name);
                                j.put("c" + idx++, formatValue(value));
                            }    
                            features.put(j);                                
                        } else {
                            JSONObject j = new JSONObject();
                            for(String name: propertyNames) {
                                j.put(name, formatValue(f.getAttribute(name)));
                            }                     
                            features.put(j);
                        }
                    }
                } finally {
                    it.close();
                    fs.getDataStore().dispose();
                }
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
    
    private DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
    
    private Object formatValue(Object value) {
        if(value instanceof Date) {
            // JSON has no date type so format the date as it is used for 
            // display, not calculation
            return dateFormat.format((Date)value);
        } else {
            return value;
        }
    }
    /**
     * Makes a list of al the attributeDescriptors of the given FeatureType and
     * all the child FeatureTypes (related by join/relate)
     */
    private Map<String, AttributeDescriptor> makeAttributeDescriptorList(SimpleFeatureType ft) {
        Map<String,AttributeDescriptor> featureTypeAttributes = new HashMap<String,AttributeDescriptor>();
        for(AttributeDescriptor ad: ft.getAttributes()) {
            String name=ft.getId()+":"+ad.getName();
            //stop when already added. Stop a infinite configurated loop
            if (featureTypeAttributes.containsKey(name)){
                return featureTypeAttributes;
            }
            featureTypeAttributes.put(name, ad);
        }
        if (ft.getRelations()!=null){
            for (FeatureTypeRelation rel : ft.getRelations()){
                featureTypeAttributes.putAll(makeAttributeDescriptorList(rel.getForeignFeatureType()));
            }
        }
        return featureTypeAttributes;
    }
}
