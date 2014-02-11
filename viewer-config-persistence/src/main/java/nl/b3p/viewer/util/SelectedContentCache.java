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
package nl.b3p.viewer.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.GeoService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Meine Toonen
 */
public class SelectedContentCache {
    
    public static final String AUTHORIZATIONS_KEY = "authorizations";
    public static final String DETAIL_CACHED_SELECTED_CONTENT = "cachedSelectedContent";
    public static final String DETAIL_CACHED_SELECTED_CONTENT_DIRTY = "cachedSelectedContentDirty";
    
    public JSONObject getSelectedContent(HttpServletRequest request, Application app, boolean validXmlTags) throws JSONException {
        
        // Don't use cache when validXmlTags parameters is true, cache only
        // the JSON variant used when starting up the viewer
        if(validXmlTags) {
            return processCache(request,createSelectedContent(app, validXmlTags));
        }
        
        JSONObject cached = null;
        if(mustCreateNewCache(app)){
            cached = createSelectedContent(app, validXmlTags);
            ClobElement el = new ClobElement(cached.toString());
            app.getDetails().put(DETAIL_CACHED_SELECTED_CONTENT, el);
            setApplicationCacheDirty(app, false);
            Stripersist.getEntityManager().getTransaction().commit();
        }else{
            ClobElement el = app.getDetails().get(DETAIL_CACHED_SELECTED_CONTENT);
            cached = new JSONObject(el.getValue());
        }
        
        JSONObject selectedContent = processCache(request, cached);
        return selectedContent;
    }
    
    private JSONObject processCache( HttpServletRequest request, JSONObject cached) throws JSONException{
         Set<String> roles = Authorizations.getRoles(request);
        
        JSONObject levels = cached.getJSONObject("levels");
        JSONObject appLayers = cached.getJSONObject("appLayers");
        JSONArray selectedContent = cached.getJSONArray("selectedContent");
         
        for (Iterator<String> it = appLayers.sortedKeys(); it.hasNext();) {
            String key = it.next();
            JSONObject appLayer = appLayers.getJSONObject(key);
            boolean allowed = isAppLayerAllowed(appLayer, roles);
            if(!allowed){
                appLayers.remove(key);
            }
        }
        
        for (Iterator it = levels.sortedKeys(); it.hasNext();) {
             String key = (String )it.next();
             JSONObject level = levels.getJSONObject(key);
             boolean allowed = isLevelAllowed(level, roles);
             if(!allowed){
                 levels.remove(key);
             }
             JSONArray newLayers = new JSONArray();
             if(level.has("layers")){
                 JSONArray layers = level.getJSONArray("layers");
                 for (int i = 0; i < layers.length(); i++) {
                     String layerId = layers.getString(i);
                     if(appLayers.has(layerId)){
                         newLayers.put(layerId);
                     }
                 }
                 level.put("layers", newLayers);
             }
        }
   
        
        JSONArray newSelectedContent = new JSONArray();
        for (int i = 0; i < selectedContent.length(); i++) {
            JSONObject obj = selectedContent.getJSONObject(i);
            String type = obj.getString("type");
            String id = obj.getString("id");
            if(type.equalsIgnoreCase("level")){
                if(isLevelAllowed(id, levels)){
                   newSelectedContent.put(obj);
                }
            }
        }
        
        cached.put("selectedContent", newSelectedContent);
        return cached;
    }
    
    private boolean isLevelAllowed(String id, JSONObject levels){
        return levels.has(id);
    }
    
    
    private boolean isLevelAllowed(JSONObject level, Set<String> roles) throws JSONException{
        boolean allowed = isAuthorized(level, roles, false);
        if(!allowed){
            return false;
        }
        
        if(level.has("children")){
            JSONArray children = level.getJSONArray("children");
            JSONArray newChildren = new JSONArray();
            for (int i = 0; i < children.length(); i++) {
                JSONObject child = children.getJSONObject(i);
                if(isLevelAllowed(child, roles)){
                    newChildren.put(child.getString("child"));
                }
            }
            level.put("children", newChildren);
        }
        return true;
    }
        
    private boolean isAppLayerAllowed(JSONObject appLayer, Set<String> roles) throws JSONException{
        boolean allowed = isAuthorized(appLayer, roles, false);
        if(!allowed){
            return false;
        }
        
        boolean editAuthorized = isAuthorized(appLayer, roles, true, "editAuthorizations");
        appLayer.put("editAuthorized", editAuthorized);
        
        return true;
    }
    
    private boolean isAuthorized(JSONObject obj, Set<String> roles, boolean alsoWriters) throws JSONException{
        return isAuthorized(obj, roles, alsoWriters, AUTHORIZATIONS_KEY);
    }
    
    private boolean isAuthorized(JSONObject obj, Set<String> roles, boolean alsoWriters, String authString) throws JSONException{

         if(obj.has(authString) && obj.getJSONObject(authString).length() != 0){
            // Levels only have readers
            JSONArray readers = obj.getJSONObject(authString).getJSONArray("readers");
            if(readers.length() > 0){
                Set<String> allowedRoles = new HashSet();
                for(int i = 0 ; i < readers.length();i++){
                    String reader = readers.getString(i);
                    allowedRoles.add(reader);
                }
                
                if( Collections.disjoint(roles, allowedRoles)){
                    return false;
                }
            }

            if (alsoWriters) {
                JSONArray writers = obj.getJSONObject(authString).getJSONArray("writers");
                if (writers.length() > 0) {
                    Set<String> allowedRoles = new HashSet();
                    for (int i = 0; i < writers.length(); i++) {
                        String writer = writers.getString(i);
                        allowedRoles.add(writer);
                    }

                    if (Collections.disjoint(roles, allowedRoles)) {
                        return false;
                    }
                }
            }
        }
        obj.remove(authString);
        return true;
    }
    
    public JSONObject createSelectedContent(Application app, boolean validXmlTags) throws JSONException {
        Level root = app.getRoot();
        JSONObject o = new JSONObject();
        if (root != null) {
            o.put("rootLevel", root.getId().toString());

            Application.TreeCache treeCache = app.loadTreeCache();
            Authorizations.ApplicationCache appCache = Authorizations.getApplicationCache(app);

            // Prevent n+1 queries for each level            
            Stripersist.getEntityManager().createQuery("from Level l "
                    + "left join fetch l.documents "
                    + "where l in (:levels) ")
                    .setParameter("levels", treeCache.getLevels())
                    .getResultList();

            if (!treeCache.getApplicationLayers().isEmpty()) {
                // Prevent n+1 queries for each ApplicationLayer            
                Stripersist.getEntityManager().createQuery("from ApplicationLayer al "
                        + "left join fetch al.details "
                        + "where al in (:alayers) ")
                        .setParameter("alayers", treeCache.getApplicationLayers())
                        .getResultList();
            }

            JSONObject levels = new JSONObject();
            o.put("levels", levels);
            JSONObject appLayers = new JSONObject();
            o.put("appLayers", appLayers);
            JSONArray selectedContent = new JSONArray();
            o.put("selectedContent", selectedContent);

            List selectedObjects = new ArrayList();
            walkAppTreeForJSON(levels, appLayers, selectedObjects, root, false, validXmlTags, app, treeCache, appCache);

            Collections.sort(selectedObjects, new Comparator() {
                @Override
                public int compare(Object lhs, Object rhs) {
                    Integer lhsIndex, rhsIndex;
                    if (lhs instanceof Level) {
                        lhsIndex = ((Level) lhs).getSelectedIndex();
                    } else {
                        lhsIndex = ((ApplicationLayer) lhs).getSelectedIndex();
                    }
                    if (rhs instanceof Level) {
                        rhsIndex = ((Level) rhs).getSelectedIndex();
                    } else {
                        rhsIndex = ((ApplicationLayer) rhs).getSelectedIndex();
                    }
                    return lhsIndex.compareTo(rhsIndex);
                }
            });
            for (Object obj : selectedObjects) {
                JSONObject j = new JSONObject();
                if (obj instanceof Level) {
                    j.put("type", "level");
                    j.put("id", ((Level) obj).getId().toString());
                } else {
                    j.put("type", "appLayer");
                    j.put("id", ((ApplicationLayer) obj).getId().toString());
                }
                selectedContent.put(j);
            }

            Map<GeoService, Set<String>> usedLayersByService = new HashMap<GeoService, Set<String>>();
            visitLevelForUsedServicesLayers(root, usedLayersByService, app, treeCache);

            if (!usedLayersByService.isEmpty()) {
                JSONObject services = new JSONObject();
                o.put("services", services);
                for (Map.Entry<GeoService, Set<String>> entry : usedLayersByService.entrySet()) {
                    GeoService gs = entry.getKey();
                    Set<String> usedLayers = entry.getValue();
                    String serviceId = gs.getId().toString();
                    if (validXmlTags) {
                        serviceId = "service_" + serviceId;
                    }
                    services.put(serviceId, gs.toJSONObject(false, usedLayers, validXmlTags, true));
                }
            }
        }
        return o;
    }
    
    private void walkAppTreeForJSON(JSONObject levels, JSONObject appLayers, List selectedContent, Level l, boolean parentIsBackground, boolean validXmlTags, Application app, Application.TreeCache treeCache, Authorizations.ApplicationCache appCache) throws JSONException {
        JSONObject o = l.toJSONObject(false, app, null);
        
        Authorizations.Read auths = appCache.getProtectedLevels().get(l.getId());
        o.put(AUTHORIZATIONS_KEY, auths != null ? auths.toJSON() : new JSONObject());
        o.put("background", l.isBackground() || parentIsBackground);
        String levelId= l.getId().toString();
        if (validXmlTags){
            levelId="level_"+levelId;
        }
        levels.put(levelId, o);
        
        if(l.getSelectedIndex() != null) {
            selectedContent.add(l);
        }
        
        for(ApplicationLayer al: l.getLayers()) {
            
            JSONObject p = al.toJSONObject();
            p.put("background", l.isBackground() || parentIsBackground);
            
            Authorizations.ReadWrite rw = appCache.getProtectedAppLayers().get(al.getId());
            p.put("editAuthorizations", rw != null ? rw.toJSON() : new JSONObject());
            String alId = al.getId().toString();
            if (validXmlTags){
                alId="appLayer_"+alId;
            }
            
            Authorizations.ReadWrite applayerAuths = appCache.getProtectedAppLayers().get(al.getId());
            p.put(AUTHORIZATIONS_KEY, applayerAuths != null ? applayerAuths.toJSON() : new JSONObject());
            
            appLayers.put(alId, p);
            
            if(al.getSelectedIndex() != null) {
                selectedContent.add(al);
            }
        }
        
        List<Level> children = treeCache.getChildrenByParent().get(l);
        if(children != null) {
            Collections.sort(children);
            JSONArray jsonChildren = new JSONArray();
            o.put("children", jsonChildren);
            for(Level child: children) {
                JSONObject childObject = new JSONObject();
                String childId = child.getId().toString();
                if (validXmlTags) {
                    childId = "level_" + childId;
                }
                childObject.put("child", childId);
                Authorizations.Read levelAuths = appCache.getProtectedLevels().get(child.getId());
                childObject.put(AUTHORIZATIONS_KEY, levelAuths != null ? levelAuths.toJSON() : new JSONObject());
                jsonChildren.put(childObject);
                walkAppTreeForJSON(levels, appLayers, selectedContent, child, l.isBackground(), validXmlTags, app, treeCache, appCache);
            }
        }
    }
        
    private void visitLevelForUsedServicesLayers(Level l, Map<GeoService,Set<String>> usedLayersByService,Application app, Application.TreeCache treeCache) {
        for(ApplicationLayer al: l.getLayers()) {
            GeoService gs = al.getService();
            
            Set<String> usedLayers = usedLayersByService.get(gs);
            if(usedLayers == null) {
                usedLayers = new HashSet<String>();
                usedLayersByService.put(gs, usedLayers);
            }
            usedLayers.add(al.getLayerName());
        }
        List<Level> children = treeCache.getChildrenByParent().get(l);
        if(children != null) {        
            for(Level child: children) {
                visitLevelForUsedServicesLayers(child, usedLayersByService, app, treeCache);
            }        
        }
    }
    
    private boolean mustCreateNewCache(Application app){
        ClobElement cache = app.getDetails().get(DETAIL_CACHED_SELECTED_CONTENT);
        if(cache == null){
            return true;
        }else{
            ClobElement dirtyClob = app.getDetails().get(DETAIL_CACHED_SELECTED_CONTENT_DIRTY);
            boolean dirty = Boolean.valueOf(dirtyClob.getValue());
            return dirty;
        }
    }
    
    public static void setApplicationCacheDirty(Application app, Boolean dirty){
        app.getDetails().put(DETAIL_CACHED_SELECTED_CONTENT_DIRTY, new ClobElement(dirty.toString()));
    }
}
