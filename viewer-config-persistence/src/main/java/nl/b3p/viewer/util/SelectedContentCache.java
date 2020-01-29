/*
 * Copyright (C) 2013-2017 B3Partners B.V.
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
package nl.b3p.viewer.util;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import nl.b3p.viewer.config.ClobElement;
import nl.b3p.viewer.config.app.Application;
import nl.b3p.viewer.config.app.ApplicationLayer;
import nl.b3p.viewer.config.app.Level;
import nl.b3p.viewer.config.app.StartLayer;
import nl.b3p.viewer.config.app.StartLevel;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.services.GeoService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Meine Toonen
 */
public class SelectedContentCache {

    private static final Log log = LogFactory.getLog(SelectedContentCache.class);
    public static final String AUTHORIZATIONS_KEY = "authorizations";
    public static final String DETAIL_CACHED_SELECTED_CONTENT = "cachedSelectedContent";
    public static final String DETAIL_CACHED_SELECTED_CONTENT_DIRTY = "cachedSelectedContentDirty";
    public static final String DETAIL_CACHED_EXPANDED_SELECTED_CONTENT = "cachedExpandedSelectedContent";
    public static final String DETAIL_CACHED_EXPANDED_SELECTED_CONTENT_DIRTY = "cachedExpandedSelectedContentDirty";

    
    public JSONObject getSelectedContent(HttpServletRequest request, Application app, boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations, 
            EntityManager em) throws JSONException {
        return getSelectedContent(request, app, validXmlTags, includeAppLayerAttributes, includeRelations, em, true);
    }
    
    public JSONObject getSelectedContent(HttpServletRequest request, Application app, boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations, 
            EntityManager em, boolean shouldProcessCache) throws JSONException {

        // Don't use cache when any of these parameters is true, cache only
        // the JSON variant used when starting up the viewer
        boolean useExpanded = includeAppLayerAttributes || includeRelations;

        JSONObject cached = null;
        if (mustCreateNewCache(app, validXmlTags, useExpanded)) {
            cached = createSelectedContent(app, validXmlTags, includeAppLayerAttributes, includeRelations,em);
            if (!validXmlTags) {
                ClobElement el = new ClobElement(cached.toString());
                app.getDetails().put(useExpanded ? DETAIL_CACHED_EXPANDED_SELECTED_CONTENT : DETAIL_CACHED_SELECTED_CONTENT, el);
                setApplicationCacheDirty(app, false, useExpanded,em);
                em.getTransaction().commit();
            }
        } else {
            ClobElement el = app.getDetails().get(useExpanded ? DETAIL_CACHED_EXPANDED_SELECTED_CONTENT : DETAIL_CACHED_SELECTED_CONTENT);
            cached = new JSONObject(el.getValue());
        }
        if (shouldProcessCache) {
            JSONObject selectedContent = processCache(request, cached, em);
            return selectedContent;
        } else {
            return cached;
        }
    }

    private JSONObject processCache(HttpServletRequest request, JSONObject cached, EntityManager em) throws JSONException {
        Set<String> roles = Authorizations.getRoles(request, em);

        JSONObject levels = cached.getJSONObject("levels");
        JSONObject appLayers = cached.getJSONObject("appLayers");
        JSONArray selectedContent = cached.getJSONArray("selectedContent");
        JSONObject services = cached.has("services") ? cached.getJSONObject("services") : new JSONObject();

        // sortedKeys() was removed form the api in https://github.com/stleary/JSON-java/commit/9a0471d5a100f6cfb253db52353a2595f5866582
        // not sure if sorting is relevant here, but it was doing 
        // TreeSet keySet = new TreeSet(appLayers.keySet());
        // so if sorting is required we can do
        // for (Iterator<String> it = new TreeSet(appLayers.keySet()).iterator(); it.hasNext();) {
        for (Iterator<String> it = appLayers.keys(); it.hasNext();) {
            String key = it.next();
            JSONObject appLayer = appLayers.getJSONObject(key);
            boolean allowed = isAppLayerAllowed(appLayer, roles);
            if (!allowed) {
                it.remove();
            }
        }

        for (Iterator it = levels.keys(); it.hasNext();) {
            String key = (String) it.next();
            JSONObject level = levels.getJSONObject(key);
            boolean allowed = isLevelAllowed(level, roles);
            if (!allowed) {
                it.remove();
            }
            JSONArray newLayers = new JSONArray();
            if (level.has("layers")) {
                JSONArray layers = level.getJSONArray("layers");
                for (int i = 0; i < layers.length(); i++) {
                    String layerId = layers.getString(i);
                    if (appLayers.has(layerId)) {
                        newLayers.put(layerId);
                    }
                }
                level.put("layers", newLayers);
            }
        }

        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();
        StringBuilder url = new StringBuilder();
        String servletPath = "/action/proxy/wms";
        url.append(scheme).append("://").append(serverName);

        if ((serverPort != 80) && (serverPort != 443)) {
            url.append(":").append(serverPort);
        }

        url.append(contextPath).append(servletPath);
        final String proxyUrl = url.toString();
        for (Iterator<String> it = services.keys(); it.hasNext();) {

            String key = it.next();
            JSONObject service = services.getJSONObject(key);
            if (service.has(GeoService.DETAIL_USE_PROXY) && service.getBoolean(GeoService.DETAIL_USE_PROXY)) {
                try {
                    String actualURL = service.getString("url");
                    String param = URLEncoder.encode(actualURL, "UTF-8");
                    StringBuilder newUrl = new StringBuilder(proxyUrl);
                    newUrl.append("?url=");
                    newUrl.append(param);
                    if (service.has(GeoService.PARAM_MUST_LOGIN) && service.getBoolean(GeoService.PARAM_MUST_LOGIN)) {
                        newUrl.append("&mustLogin=true&serviceId=");
                        newUrl.append(service.get("id"));
                    }
                    service.put("url", newUrl);
                } catch (UnsupportedEncodingException ex) {
                    log.error("Cannot add proxy url for service: ", ex);
                }
            }
        }

        JSONArray newSelectedContent = new JSONArray();
        for (int i = 0; i < selectedContent.length(); i++) {
            JSONObject obj = selectedContent.getJSONObject(i);
            String type = obj.getString("type");
            String id = obj.getString("id");
            if (type.equalsIgnoreCase("level")) {
                if (isLevelAllowed(id, levels)) {
                    newSelectedContent.put(obj);
                }
            }
        }

        cached.put("selectedContent", newSelectedContent);
        return cached;
    }

    private boolean isLevelAllowed(String id, JSONObject levels) {
        return levels.has(id);
    }

    private boolean isLevelAllowed(JSONObject level, Set<String> roles) throws JSONException {
        boolean allowed = isAuthorized(level, roles, false);
        if (!allowed) {
            return false;
        }

        if (level.has("children")) {
            JSONArray children = level.getJSONArray("children");
            JSONArray newChildren = new JSONArray();
            for (int i = 0; i < children.length(); i++) {
                JSONObject child = children.getJSONObject(i);
                if (isLevelAllowed(child, roles)) {
                    newChildren.put(child.getString("child"));
                }
            }
            level.put("children", newChildren);
        }
        return true;
    }

    private boolean isAppLayerAllowed(JSONObject appLayer, Set<String> roles) throws JSONException {
        boolean allowed = isAuthorized(appLayer, roles, false);
        if (!allowed) {
            return false;
        }

        boolean editAuthorized = isAuthorized(appLayer, roles, true, "editAuthorizations");
        appLayer.put("editAuthorized", editAuthorized);

        return true;
    }

    private boolean isAuthorized(JSONObject obj, Set<String> roles, boolean alsoWriters) throws JSONException {
        return isAuthorized(obj, roles, alsoWriters, AUTHORIZATIONS_KEY);
    }

    private boolean isAuthorized(JSONObject obj, Set<String> roles, boolean alsoWriters, String authString) throws JSONException {

        if (obj.has(authString) && obj.getJSONObject(authString).length() != 0) {
            // Levels only have readers
            JSONArray readers = obj.getJSONObject(authString).getJSONArray("readers");
            if (readers.length() > 0) {
                Set<String> allowedRoles = new HashSet();
                for (int i = 0; i < readers.length(); i++) {
                    if(!readers.isNull(i)){
                        String reader = readers.getString(i);
                        allowedRoles.add(reader);
                    }
                }

                if (Collections.disjoint(roles, allowedRoles)) {
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

    public JSONObject createSelectedContent(Application app, boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations, EntityManager em) throws JSONException {
        Level root = app.getRoot();
        JSONObject o = new JSONObject();
        if (root != null) {
            o.put("rootLevel", root.getId().toString());

            Application.TreeCache treeCache = app.loadTreeCache(em);
            treeCache.initializeLevels("left join fetch l.documents",em);
            treeCache.initializeApplicationLayers("left join fetch al.details",em);
            Authorizations.ApplicationCache appCache = Authorizations.getApplicationCache(app, em);

            JSONObject levels = new JSONObject();
            o.put("levels", levels);
            JSONObject appLayers = new JSONObject();
            o.put("appLayers", appLayers);
            JSONArray selectedContent = new JSONArray();
            o.put("selectedContent", selectedContent);

            List selectedObjects = new ArrayList();
            walkAppTreeForJSON(levels, appLayers, selectedObjects, root, false, validXmlTags, includeAppLayerAttributes, includeRelations, app, treeCache, appCache, em, false);

            Collections.sort(selectedObjects, new Comparator() {
                @Override
                public int compare(Object lhs, Object rhs) {
                    Integer lhsIndex, rhsIndex;
                    if (lhs instanceof StartLevel) {
                        lhsIndex = ((StartLevel) lhs).getSelectedIndex();
                    } else {
                        lhsIndex = ((StartLayer) lhs).getSelectedIndex();
                    }
                    if (rhs instanceof StartLevel) {
                    rhsIndex = ((StartLevel) rhs).getSelectedIndex();
                    } else {
                        rhsIndex = ((StartLayer) rhs).getSelectedIndex();
                    }
                    return lhsIndex.compareTo(rhsIndex);
                }
            });
            for (Object obj : selectedObjects) {
                JSONObject j = new JSONObject();
                if (obj instanceof StartLevel) {
                    j.put("type", "level");
                    j.put("id", ((StartLevel) obj).getLevel().getId().toString());
                } else {
                    j.put("type", "appLayer");
                    j.put("id", ((StartLayer) obj).getApplicationLayer().getId().toString());
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
                    services.put(serviceId, gs.toJSONObject(false, usedLayers, validXmlTags, true,em));
                }
            }
        }
        return o;
    }

    private void walkAppTreeForJSON(JSONObject levels, JSONObject appLayers, List selectedContent, Level l, boolean parentIsBackground, 
            boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations, Application app, 
            Application.TreeCache treeCache, Authorizations.ApplicationCache appCache, EntityManager em, boolean previouslySelected) throws JSONException {
        
        StartLevel sl = l.getStartLevels().get(app);
        JSONObject o = l.toJSONObject(false, app, null, em);

        Authorizations.Read auths = appCache.getProtectedLevels().get(l.getId());
        o.put(AUTHORIZATIONS_KEY, auths != null ? auths.toJSON() : new JSONObject());
        o.put("background", l.isBackground() || parentIsBackground);
        o.put("removed", sl == null || sl.isRemoved());
        String levelId = l.getId().toString();
        if (validXmlTags) {
            levelId = "level_" + levelId;
        }
        levels.put(levelId, o);
        boolean selected = false || previouslySelected;

        if (sl != null && sl.getSelectedIndex() != null && !sl.isRemoved() && !previouslySelected) {
            selectedContent.add(sl);
            selected = true;
        }

        for (ApplicationLayer al : l.getLayers()) {
            StartLayer startLayer = al.getStartLayers().get(app);
            JSONObject p = al.toJSONObject(includeAppLayerAttributes, includeRelations, em, app);
            p.put("background", l.isBackground() || parentIsBackground);
            p.put("removed", startLayer == null ||startLayer.isRemoved());

            Authorizations.ReadWrite rw = appCache.getProtectedAppLayers().get(al.getId());
            p.put("editAuthorizations", rw != null ? rw.toJSON() : new JSONObject());
            String alId = al.getId().toString();
            if (validXmlTags) {
                alId = "appLayer_" + alId;
            }

            Authorizations.ReadWrite applayerAuths = appCache.getProtectedAppLayers().get(al.getId());
            p.put(AUTHORIZATIONS_KEY, applayerAuths != null ? applayerAuths.toJSON() : new JSONObject());

            appLayers.put(alId, p);

            if (startLayer != null && startLayer.getSelectedIndex() != null && !startLayer.isRemoved()) {
                selectedContent.add(startLayer);
            }
        }

        List<Level> children = treeCache.getChildrenByParent().get(l);
        if (children != null) {
            Collections.sort(children);
            JSONArray jsonChildren = new JSONArray();
            o.put("children", jsonChildren);
            for (Level child : children) {
                JSONObject childObject = new JSONObject();
                String childId = child.getId().toString();
                if (validXmlTags) {
                    childId = "level_" + childId;
                }
                childObject.put("child", childId);
                Authorizations.Read levelAuths = appCache.getProtectedLevels().get(child.getId());
                childObject.put(AUTHORIZATIONS_KEY, levelAuths != null ? levelAuths.toJSON() : new JSONObject());
                jsonChildren.put(childObject);
                walkAppTreeForJSON(levels, appLayers, selectedContent, child, l.isBackground(), validXmlTags, includeAppLayerAttributes, 
                        includeRelations, app, treeCache, appCache, em, selected);
            }
        }
    }

    private void visitLevelForUsedServicesLayers(Level l, Map<GeoService, Set<String>> usedLayersByService, Application app, Application.TreeCache treeCache) {
        for (ApplicationLayer al : l.getLayers()) {
            GeoService gs = al.getService();

            Set<String> usedLayers = usedLayersByService.get(gs);
            if (usedLayers == null) {
                usedLayers = new HashSet<String>();
                usedLayersByService.put(gs, usedLayers);
            }
            usedLayers.add(al.getLayerName());
        }
        List<Level> children = treeCache.getChildrenByParent().get(l);
        if (children != null) {
            for (Level child : children) {
                visitLevelForUsedServicesLayers(child, usedLayersByService, app, treeCache);
            }
        }
    }

    private boolean mustCreateNewCache(Application app, boolean validXmlTags, boolean expanded) {
        ClobElement cache = expanded ? app.getDetails().get(DETAIL_CACHED_EXPANDED_SELECTED_CONTENT) : app.getDetails().get(DETAIL_CACHED_SELECTED_CONTENT);
        if (cache == null || validXmlTags) {
            return true;
        } else {
            ClobElement dirtyClob = expanded ? app.getDetails().get(DETAIL_CACHED_EXPANDED_SELECTED_CONTENT_DIRTY) : app.getDetails().get(DETAIL_CACHED_SELECTED_CONTENT_DIRTY);
            boolean dirty = Boolean.valueOf(dirtyClob.getValue());
            return dirty;
        }
    }

    public static void setApplicationCacheDirty(Application app, Boolean dirty, Boolean expanded, EntityManager em) {
        setApplicationCacheDirty(app, dirty, expanded, false,em);
    }

    public static void setApplicationCacheDirty(Application app, Boolean dirty, Boolean expanded, Boolean onlyThisApplication, EntityManager em) {
        Set<Application> apps = new HashSet<Application>();
        if (dirty && !onlyThisApplication) {
            apps = app.getRoot().findApplications(em);
        } else {
            apps.add(app);
        }
        // Also invalidate possible mashups
        for (Application application : apps) {
            if (dirty) {
                application.getDetails().put(DETAIL_CACHED_SELECTED_CONTENT_DIRTY, new ClobElement(dirty.toString()));
                application.getDetails().put(DETAIL_CACHED_EXPANDED_SELECTED_CONTENT_DIRTY, new ClobElement(dirty.toString()));
            } else {
                application.getDetails().put(expanded ? DETAIL_CACHED_EXPANDED_SELECTED_CONTENT_DIRTY : DETAIL_CACHED_SELECTED_CONTENT_DIRTY, new ClobElement(dirty.toString()));
            }
        }
    }
}
