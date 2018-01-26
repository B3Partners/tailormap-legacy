/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.security;

import java.util.*;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.servlet.http.HttpServletRequest;
import nl.b3p.viewer.config.services.*;
import nl.b3p.viewer.config.app.*;
import nl.b3p.viewer.util.DB;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 * Utility class for authorization checking. Because of the inheritence of 
 * authorizations in tree structures, caches are used for efficient 
 * authorization checks.
 * <p>
 * There are authorizations on these objects:
 * <p>
 * <b>Geo services registry:</b>
 * <ul>
 * <li>Categories: currently disabled, not accessible via user interface</li>
 * <li>Layers of GeoServices: with inheritence, read/write authorizations</li>
 * </ul>
 * <p>
 * <b>Application:</b>
 * <ul>
 * <li>Levels: with inheritence, read authorization only</li>
 * <li>ApplicationLayers of Levels: inherits from Level <i>and</i> the referenced Layer, read/write authorizations</li>
 * <li>ConfiguredComponents</li>
 * </ul>
 * <p>
 * Authorizations are based on role names which are Group names.
 * <p>
 * <b>Inheritence and authorization rules:</b>
 * <ol>
 * <li>The empty set of authorized role names (EVERYBODY) means
 * everybody is authorized.</li>
 * <li>A non-empty set which is not equal to NOBODY means only users who
 * are members of the named Groups in the set are authorized</li>
 * <li>NOBODY is the set containing a single value which is null.</li>
 * <li>Inheritence processing starts at the root with everybody authorized.</li>
 * <li>When inheriting authorizations, the set of authorized roles can only be
 * reduced and not expanded. When a parent is authorized for roles A and B and
 * the set of authorized roles for a child is B and C, only B is authorized. When
 * the child is only authorized for role C, nobody will be authorized for the child.</li>
 * <li>Because of the default access for everybody, denying editing for example is done
 * by only authorizing write access to a group which has no members.</li>
 * </ol>
 * <b>Caching</b>
 * <ul>
 * <li>Layer authorizations are cached and invalidated when authorizations are 
 * changed for a GeoService by updating the GeoService.authorizationsModified timestamp.</li>
 * <li>Level and ApplicationLayer authorizations are cached and invalidated when
 * authorizations on a Level or ApplicationLayer are changed by updating the 
 * Application.authorizationsModified timestamp.</li>
 * <li>Because ApplicationLayer authorizations inherit from Layer authorizations,
 * Application caches are invalidated when any authorization on a Layer changes. 
 * </ul>
 * Although when authorizations are changed for an object only the cached object
 * and its inheriting objects could be refreshed in the cache, the entire set of
 * cached Layers of a GeoService or cached Levels and ApplicationLayers of an 
 * Application are invalidated because:
 * <ol>
 * <li>The viewer-admin webapp is isolated from the viewer webapp so it cannot 
 * access its application-scope cache without extra cross-webapp communication.</li>
 * <li>The viewer-admin webapp communicates with the viewer webapp to refresh
 * its cache by updating the above mentioned authorizationChanged database columns.</li>
 * <li>The cache for an Application is invalidated when the maximum authorization 
 * changed date (for all GeoServices) column is later than the Application authorization 
 * changed date.</li>
 * <li>These database columns are the simplest method to refresh the cache, and no
 * partial updates are required to maintain performance because authorizations are
 * modified infrequently.</li>
 * <li>Applying inherited authorizations is optimized by loading a tree in a single
 * query using hierarchical queries.</li>
 * </ol>
 * <p>
 * Group membership for a User is not cached and read from the database for
 * the first authorization check in a Transaction. So authorization changes by
 * an administrator should always be directly applied except authorization checks
 * which use HttpServletRequest.isUserInRole(), which is cached by the servlet
 * container. Currently only viewer-admin checks roles this way.
 * @author Matthijs Laan
 */
public class Authorizations {
    /** Humongous lock for everything, but should be locked for only short times */
    private static final Object LOCK = new Object();
    
    private static final String ROLES_ATTRIBUTE = Authorizations.class.getName() + ".roles";
    
    /**
     * The set of role names which mean nobody has access; a set which only contains
     * null.
     */
    public static final Set<String> NOBODY = new HashSet<String>(Arrays.asList(new String[] { null }));
    
    /**
     * The empty set of role names which mean everybody has access.
     */
    public static final Set<String> EVERYBODY = Collections.EMPTY_SET;    
    
    public static class GeoServiceCache {
        Date modified;
        Map<Long, ReadWrite> protectedLayers;

        public Map<Long, ReadWrite> getProtectedLayers() {
            return protectedLayers;
        }

        public Date getModified() {
            return modified;
        }
    }
    
    public static class ApplicationCache {
        Date modified;
        Map<Long, Read> protectedLevels;
        Map<Long, ReadWrite> protectedAppLayers;

        public Date getModified() {
            return modified;
        }

        public Map<Long, ReadWrite> getProtectedAppLayers() {
            return protectedAppLayers;
        }

        public Map<Long, Read> getProtectedLevels() {
            return protectedLevels;
        }
    }

    public static class AppConfiguredComponentsReadersCache {
        Date modified;
        
        Map<Long,Set<String>> readersByConfiguredComponentId;
    }
    
    public static class Read {
        Set<String> readers;       
        
        public Read(Set<String> readers) {
            this.readers = readers;
        }

        public Set<String> getReaders() {
            return readers;
        }
        
        public JSONObject toJSON() throws JSONException{
            JSONObject obj = new JSONObject();
            JSONArray jReaders = new JSONArray(readers);
            obj.put("readers", jReaders);
            return obj;
        }
    }

    public static class ReadWrite extends Read {
        Set<String> writers;       
        
        public ReadWrite(Set<String> readers, Set<String> writers) {
            super(readers);
            this.writers = writers;
        }

        public Set<String> getWriters() {
            return writers;
        }
       
        public JSONObject toJSON() throws JSONException{
            JSONObject obj = new JSONObject();
            JSONArray jWriters = new JSONArray(writers);
            JSONArray jReaders = new JSONArray(readers);
            obj.put("readers", jReaders);
            obj.put("writers", jWriters);
            return obj;
        }
    }
    
    /**
     * Map of protected Layers per GeoService. Only public for UserAction to 
     * display all authorizations.
     */
    public static final Map<Long, GeoServiceCache> serviceCache = new HashMap();
    
    /**
     * Map of protected Levels and ApplicationLayers per Application
     */
    private static final Map<Long, ApplicationCache> applicationCache = new HashMap();
    
    /**
     * Map of reader role names per ConfiguredComponent per Application
     */
    private static final Map<Long, AppConfiguredComponentsReadersCache> appConfiguredComponentsReadersCache = new HashMap();
    
    public static Set<String> getRoles(HttpServletRequest request, EntityManager em) {

        if(request.getRemoteUser() == null) {
            return Collections.EMPTY_SET;
        }
        
        Set<String> roles = (Set<String>)request.getAttribute(ROLES_ATTRIBUTE);
        
        if(roles == null) {
            roles = new HashSet<String>();
            List<String> groups = em.createQuery("select name FROM Group").getResultList();
            for (String group : groups) {
                if(request.isUserInRole(group)){
                    roles.add(group);
                }
            }
            
            request.setAttribute(ROLES_ATTRIBUTE, roles);
        }
        return roles;
    }
    
    private static boolean isReadAuthorized(HttpServletRequest request, Read auths, EntityManager em) {
       
        if(auths == null  || auths.readers.equals(EVERYBODY)) {
            return true;
        }
        
        if(auths.readers.equals(NOBODY)) {
            return false;
        }
        
        Set<String> roles = getRoles(request,em);
        
        if(roles.isEmpty()) {
            return false;
        }
        
        return !Collections.disjoint(auths.readers, roles);
    }
    
    private static boolean isWriteAuthorized(HttpServletRequest request, ReadWrite auths, EntityManager em) {
        if(!isReadAuthorized(request, auths,em)) {
            return false;
        }
        if(auths == null || auths.writers.equals(EVERYBODY)) {
            return true;
        }
        if(auths.writers.equals(NOBODY)) {
            return false;
        }
        Set<String> roles = getRoles(request,em);
        
        if(roles.isEmpty()) {
            return false;
        }
        
        return !Collections.disjoint(auths.writers, roles);
    }
    
    private static String unauthMsg(HttpServletRequest request, boolean write) {
        return "User " + request.getRemoteUser() == null ? "(none)" : request.getRemoteUser() + " not authorized to " + (write ? "edit ": "access ");
    }
    
    public static boolean isLayerReadAuthorized(Layer l, HttpServletRequest request, EntityManager em) {
        return isReadAuthorized(request, getLayerAuthorizations(l,em),em);
    }
    
    public static void checkLayerReadAuthorized(Layer l, HttpServletRequest request, EntityManager em) throws Exception {
        if(!isLayerReadAuthorized(l, request,em)) {
            throw new Exception(unauthMsg(request,false) + " layer #" + l.getId());
        }
    }
    
    public static boolean isLayerWriteAuthorized(Layer l, HttpServletRequest request, EntityManager em) {
        return isWriteAuthorized(request, getLayerAuthorizations(l,em),em);
    }
    
    public static void checkLayerWriteAuthorized(Layer l, HttpServletRequest request, EntityManager em) throws Exception {
        if(!isLayerWriteAuthorized(l, request,em)) {
            throw new Exception(unauthMsg(request,true) + " layer #" + l.getId());
        }
    }

    /**
     * See if a user can edit geometry attribute of a layer in addition to
     * regular writing. Calling this will also call
     * {@link #isAppLayerWriteAuthorized(nl.b3p.viewer.config.app.Application, nl.b3p.viewer.config.app.ApplicationLayer, javax.servlet.http.HttpServletRequest, javax.persistence.EntityManager)}
     *
     * @param l the layer
     * @param request the servlet request that has the user credential
     * @param em the entity manager to use
     * @return {@code true} if the user is allowed to edit the geometry
     * attribute of the layer (the user is not in any of the groups that prevent
     * editing geometry).
     */
    public static boolean isLayerGeomWriteAuthorized(Layer l, HttpServletRequest request, EntityManager em) {
        if (isLayerWriteAuthorized(l, request,em)) {
            Set<String> preventEditGeomGroup = l.getPreventGeomEditors();
            for (String group : preventEditGeomGroup) {
                if (request.isUserInRole(group)) {
                    return false;
                }
            }
        }
        return true;
    }

    private static final String REQUEST_APP_CACHE = Authorizations.class.getName() + ".REQUEST_APP_CACHE";
    
    public static ApplicationCache getApplicationCacheFromRequest(Application app, HttpServletRequest request, EntityManager em) {
        
        // Cache applicationCache instances per request so the 
        // allServicesAuthLastChanged date is not requested multiple times
        // for a single request
        
        // It is requested once per request, so the applicationCache is still
        // immediately refreshed once authorizations change for new requests
        
        Map<Long,ApplicationCache> requestCache = (Map)request.getAttribute(REQUEST_APP_CACHE);
        if(requestCache == null) {
            requestCache = new HashMap();
            request.setAttribute(REQUEST_APP_CACHE, requestCache);
        }
        ApplicationCache appCache = requestCache.get(app.getId());
        if(appCache == null) {
            appCache = getApplicationCache(app,em);
            requestCache.put(app.getId(),appCache);
        }
        return appCache;
    }

    public static boolean isApplicationReadAuthorized(Application app, HttpServletRequest request, EntityManager em) {
        Read auths = new Read(app.getReaders());

        return isReadAuthorized(request, auths,em);
    }
    
    public static boolean isLevelReadAuthorized(Application app, Level l, HttpServletRequest request, EntityManager em) {
        return isLevelReadAuthorized(app, l, request, getApplicationCacheFromRequest(app, request,em), em);
    }

    public static boolean isLevelReadAuthorized(Application app, Level l, HttpServletRequest request, ApplicationCache appCache, EntityManager em) {
        if(app.isAuthenticatedRequired() && request.getRemoteUser() == null) {
            return false;
        }
        
        if(appCache == null) {
            appCache = getApplicationCache(app, em);
        }
        Read auths = appCache.protectedLevels.get(l.getId());       
        return isReadAuthorized(request, auths,em);
    }

    public static void checkLevelReadAuthorized(Application app, Level l, HttpServletRequest request, EntityManager em) throws Exception {
        if(!isLevelReadAuthorized(app, l, request, em)) {
            throw new Exception(unauthMsg(request,false) + " level #" + l.getId());
        }
    }

    public static boolean isAppLayerReadAuthorized(Application app, ApplicationLayer al, HttpServletRequest request, EntityManager em) {
        return isAppLayerReadAuthorized(app, al, request, getApplicationCacheFromRequest(app, request,em), em);
    }
    
    public static boolean isAppLayerReadAuthorized(Application app, ApplicationLayer al, HttpServletRequest request, ApplicationCache appCache, EntityManager em) {
        if(app == null || app.isAuthenticatedRequired() && request.getRemoteUser() == null) {
            return false;
        }
        
        if(appCache == null) {
            appCache = getApplicationCache(app,em);
        }
        ReadWrite auths = appCache.protectedAppLayers.get(al.getId());
        return isReadAuthorized(request, auths,em);
    }
    
    public static void checkAppLayerReadAuthorized(Application app, ApplicationLayer al, HttpServletRequest request, EntityManager em) throws Exception {
        if(!isAppLayerReadAuthorized(app, al, request, em)) {
            throw new Exception(unauthMsg(request,false) + " application layer #" + al.getId());
        }
    }    
    
    public static boolean isAppLayerWriteAuthorized(Application app, ApplicationLayer al, HttpServletRequest request, EntityManager em) {
        return isAppLayerWriteAuthorized(app, al, request, getApplicationCacheFromRequest(app, request, em), em);
    }
    
    public static boolean isAppLayerWriteAuthorized(Application app, ApplicationLayer al, HttpServletRequest request, ApplicationCache appCache, EntityManager em) {
        if(app == null || app.isAuthenticatedRequired() && request.getRemoteUser() == null) {
            return false;
        }
        
        if(appCache == null) {
            appCache = getApplicationCache(app, em);
        }
        ReadWrite auths = appCache.protectedAppLayers.get(al.getId());
        return isWriteAuthorized(request, auths,em);
    }
    
    public static void checkAppLayerWriteAuthorized(Application app, ApplicationLayer al, HttpServletRequest request, EntityManager em) throws Exception {
        if(!isAppLayerWriteAuthorized(app, al, request, em)) {
            throw new Exception(unauthMsg(request,true) + " application layer #" + al.getId());
        }
    }   
        
    public static boolean isConfiguredComponentAuthorized(ConfiguredComponent component, HttpServletRequest request, EntityManager em) {
        
        Application app = component.getApplication();
        Long appId = app.getId();
        
        Set<String> componentReaders;
        
        synchronized(appConfiguredComponentsReadersCache) {
            AppConfiguredComponentsReadersCache appCache = appConfiguredComponentsReadersCache.get(appId);
        
            if(appCache == null || appCache.modified.before(app.getAuthorizationsModified())) {

                appCache = new AppConfiguredComponentsReadersCache();
                appConfiguredComponentsReadersCache.put(appId, appCache);
                appCache.modified = component.getApplication().getAuthorizationsModified();
                appCache.readersByConfiguredComponentId = new HashMap();

                List<Object[]> readers = em.createQuery(
                          "select cc.id, r "
                        + "from ConfiguredComponent cc "
                        + "join cc.readers r "
                        + "where cc.application = :app")
                        .setParameter("app", component.getApplication())
                        .getResultList();
                for(Object[] row: readers) {
                    Long ccId = (Long)row[0];
                    String role = (String)row[1];
                    Set<String> roles = appCache.readersByConfiguredComponentId.get(ccId);
                    if(roles == null) {
                        roles = new HashSet<String>();
                        appCache.readersByConfiguredComponentId.put(ccId, roles);
                    }
                    roles.add(role);
                }
            }
            componentReaders = appCache.readersByConfiguredComponentId.get(component.getId());
        }
        
        if(componentReaders == null) {
            componentReaders = EVERYBODY;
        }
        
        return isReadAuthorized(request, new Read(componentReaders), em);
    }
    
    public static void checkConfiguredComponentAuthorized(ConfiguredComponent component, HttpServletRequest request, EntityManager em) throws Exception {
        if(!isReadAuthorized(request, new Read(component.getReaders()),em)) {
            throw new Exception(unauthMsg(request,true) + " configured component #" + component.getName() + " of app #" + component.getApplication().getId());
        }
    }    
        
    /**
     * Returns set of authorized readers and writers for this layer. If null is
     * returned, everyone is authorized for reading and writing. Note: even if 
     * not null, the "readers" and "writers" properties of the returned 
     * ReadWriteAuthorizations may be equal to EVERYONE.
     *
     * @param l the layer to check
     * @param em the entity manager to use
     * @return the authorizations
     */
    public static ReadWrite getLayerAuthorizations(Layer l, EntityManager em) {
        synchronized(LOCK) {
            GeoServiceCache cache = serviceCache.get(l.getService().getId());
          
            if(cache != null) {

                if(cache.modified.equals(l.getService().getAuthorizationsModified())) {
                    return cache.protectedLayers.get(l.getId());
                } 
            }

            cache = new GeoServiceCache();
            serviceCache.put(l.getService().getId(), cache);
            cache.modified = l.getService().getAuthorizationsModified();
            cache.protectedLayers = new HashMap();
            
            List<Layer> layers = l.getService().loadLayerTree(em);
            if(!layers.isEmpty()) {
                // Prevent n+1 queries
                int i = 0;
                do {
                    List<Layer> subList = layers.subList(i, Math.min(layers.size(), i+DB.MAX_LIST_EXPRESSIONS));
                    em.createQuery("from Layer l "
                            + "left join fetch l.readers "
                            + "left join fetch l.writers "
                            + "where l in (:layers)")
                            .setParameter("layers", subList)
                            .getResultList();
                    i += subList.size();
                } while(i < layers.size());
            }
            
            walkLayer(l.getService().getTopLayer(), EVERYBODY, EVERYBODY, cache.protectedLayers, em);
                         
            return cache.protectedLayers.get(l.getId());
        }
    }
    
    /**
     * Apply the security inheritence rules.
     */
    private static Set<String> inheritAuthorizations(Set<String> current, Set<String> _new) {
        
        if(_new.equals(EVERYBODY)) {
            // must be copied on write
            return current;
        } else {
            
            if(current.equals(EVERYBODY)) {
                return new HashSet<String>(_new);
            } else {
                HashSet<String> copy = new HashSet<String>(current);
                copy.retainAll(_new);
                if(copy.isEmpty()) {
                    return NOBODY;
                } else {
                    return copy;
                }                        
            }
        }
    }      
        
    private static void walkLayer(Layer l, Set<String> currentReaders, Set<String> currentWriters, Map serviceProtectedLayers, EntityManager em) {
        
        currentReaders = inheritAuthorizations(currentReaders, l.getReaders());
        currentWriters = inheritAuthorizations(currentWriters, l.getWriters());

        if(!currentReaders.equals(EVERYBODY) || !currentWriters.equals(EVERYBODY)) {
            serviceProtectedLayers.put(l.getId(), new ReadWrite(currentReaders, currentWriters ));            
        }
        
        for(Layer child: l.getCachedChildren(em)) {
            walkLayer(child, currentReaders, currentWriters, serviceProtectedLayers, em);
        }
    }    
    
    public static ApplicationCache getApplicationCache(Application app, EntityManager em) {
        synchronized(LOCK) {        
            ApplicationCache cache = applicationCache.get(app.getId());
            Date allServicesAuthLastChanged = null;
            if(cache != null) {
                // Check if the data was not cached before the authorizations 
                // were modified
                if(!cache.modified.before(app.getAuthorizationsModified())) {
                    
                    try {
                        // Because the cached data is also stale when authorizations
                        // for a service used in the application change, check if
                        // the cache was made before a change to authorizations to
                        // a service (any service, not only those used in app - 
                        // checking only services used is not worth it because the
                        // authorizations for services should only change infrequently)
                        
                        allServicesAuthLastChanged = (Date)em.createQuery("select max(authorizationsModified) from GeoService").getSingleResult();
                        
                        if(allServicesAuthLastChanged != null && !cache.modified.before(allServicesAuthLastChanged)) {
                            return cache;
                        }
                    } catch(NoResultException nre) {
                        // no services apparently
                    }
                } 
            }

            cache = new ApplicationCache();
            applicationCache.put(app.getId(), cache);
            if(allServicesAuthLastChanged != null ){
                cache.modified = allServicesAuthLastChanged.after(app.getAuthorizationsModified() ) ? allServicesAuthLastChanged : app.getAuthorizationsModified();
            }else{
                cache.modified = app.getAuthorizationsModified();
            }
            cache.protectedLevels = new HashMap();
            cache.protectedAppLayers = new HashMap();
                        
            Application.TreeCache treeCache = app.loadTreeCache(em);
            treeCache.initializeLevels("left join fetch l.readers",em);
            treeCache.initializeApplicationLayers("left join fetch al.readers left join fetch al.writers",em);
            
            walkLevel(app.getRoot(), EVERYBODY, cache, treeCache, em);

            return cache;
        }
    }

    private static void walkLevel(Level l, Set<String> currentReaders, ApplicationCache cache, Application.TreeCache treeCache, EntityManager em) {
        currentReaders = inheritAuthorizations(currentReaders, l.getReaders());
        
        if(!currentReaders.equals(EVERYBODY)) {
            cache.protectedLevels.put(l.getId(), new Read(currentReaders));
        }                
        
        for(ApplicationLayer al: l.getLayers()) {
            if(al != null) {
                walkAppLayer(al, currentReaders, cache,em);
            }
        }        
                
        for(Level child: treeCache.getChildren(l)) {
            walkLevel(child, currentReaders, cache, treeCache, em);
        }
    }
    
    private static void walkAppLayer(ApplicationLayer al, Set<String> currentReaders, ApplicationCache cache, EntityManager em) {

        currentReaders = inheritAuthorizations(currentReaders, al.getReaders());
        
        // check the layer referenced by this appLayer    
        Layer l = al.getService().getLayer(al.getLayerName(),em);

        Set<String> currentWriters = al.getWriters();
        
        if(l != null) {
            ReadWrite layerAuth = getLayerAuthorizations(l,em);
            if(layerAuth != null) {
                currentReaders = inheritAuthorizations(currentReaders, layerAuth.readers);
                currentWriters = inheritAuthorizations(currentWriters, layerAuth.writers);
            }
        }
        
        if(!currentReaders.equals(EVERYBODY) || !currentWriters.equals(EVERYBODY)) {
            cache.protectedAppLayers.put(al.getId(), new ReadWrite(currentReaders, currentWriters));
        }
    }       
}
