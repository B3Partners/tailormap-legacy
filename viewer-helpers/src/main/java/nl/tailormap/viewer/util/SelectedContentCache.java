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
package nl.tailormap.viewer.util;

import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.Level;
import nl.tailormap.viewer.config.app.StartLayer;
import nl.tailormap.viewer.config.app.StartLevel;
import nl.tailormap.viewer.config.services.ArcGISService;
import nl.tailormap.viewer.config.services.GeoService;
import nl.tailormap.viewer.config.services.TileService;
import nl.tailormap.viewer.helpers.AuthorizationsHelper;
import nl.tailormap.viewer.helpers.app.ApplicationLayerHelper;
import nl.tailormap.viewer.helpers.app.LevelHelper;
import nl.tailormap.viewer.helpers.services.ArcGISServiceHelper;
import nl.tailormap.viewer.helpers.services.GeoServiceHelper;
import nl.tailormap.viewer.helpers.services.TilingServiceHelper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static nl.tailormap.viewer.config.security.Authorizations.AUTHORIZATIONS_KEY;

/**
 * @author Meine Toonen
 */
public class SelectedContentCache {

    public static final String DETAIL_CACHED_SELECTED_CONTENT = "cachedSelectedContent";
    public static final String DETAIL_CACHED_SELECTED_CONTENT_DIRTY = "cachedSelectedContentDirty";
    public static final String DETAIL_CACHED_EXPANDED_SELECTED_CONTENT = "cachedExpandedSelectedContent";
    public static final String DETAIL_CACHED_EXPANDED_SELECTED_CONTENT_DIRTY = "cachedExpandedSelectedContentDirty";


    public static void setApplicationCacheDirty(Application app, Boolean dirty, Boolean expanded, EntityManager em) {
        setApplicationCacheDirty(app, dirty, expanded, false, em);
    }

    @Deprecated(forRemoval = true, since = "5.9.9")
    public JSONObject getSelectedContent(HttpServletRequest request, Application app, boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations,
                                         EntityManager em, boolean shouldProcessCache) throws JSONException {
        return getSelectedContent(
                AuthorizationsHelper.getRoles(request, em),
                URI.create(request.getRequestURI()),
                request.getServletContext().getInitParameter("proxy"),
                app,
                validXmlTags,
                includeAppLayerAttributes,
                includeRelations,
                em,
                shouldProcessCache
        );
    }

    public JSONObject getSelectedContent(Set<String> roles, URI requestURI, String proxyPath, Application app, boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations,
                                         EntityManager em, boolean shouldProcessCache) throws JSONException {

        // Don't use cache when any of these parameters is true, cache only
        // the JSON variant used when starting up the viewer
        boolean useExpanded = includeAppLayerAttributes || includeRelations;

        JSONObject cached;
        if (mustCreateNewCache(app, validXmlTags, useExpanded)) {
            cached = createSelectedContent(app, validXmlTags, includeAppLayerAttributes, includeRelations, em);
            if (!validXmlTags) {
                ClobElement el = new ClobElement(cached.toString());
                app.getDetails().put(useExpanded ? DETAIL_CACHED_EXPANDED_SELECTED_CONTENT : DETAIL_CACHED_SELECTED_CONTENT, el);
                setApplicationCacheDirty(app, false, useExpanded, em);
                em.getTransaction().commit();
            }
        } else {
            ClobElement el = app.getDetails().get(useExpanded ? DETAIL_CACHED_EXPANDED_SELECTED_CONTENT : DETAIL_CACHED_SELECTED_CONTENT);
            cached = new JSONObject(el.getValue());
        }
        if (shouldProcessCache) {
            return processCache(roles, requestURI, proxyPath, cached);
        } else {
            return cached;
        }
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

    private JSONObject processCache(Set<String> roles, URI requestURI, String proxyPath, JSONObject cached) throws JSONException {
        JSONObject levels = cached.getJSONObject("levels");
        JSONObject appLayers = cached.getJSONObject("appLayers");
        JSONArray selectedContent = cached.getJSONArray("selectedContent");
        JSONObject services = cached.has("services") ? cached.getJSONObject("services") : new JSONObject();

        // sortedKeys() was removed form the api in https://github.com/stleary/JSON-java/commit/9a0471d5a100f6cfb253db52353a2595f5866582
        // not sure if sorting is relevant here, but it was doing
        // TreeSet keySet = new TreeSet(appLayers.keySet());
        // so if sorting is required we can do
        // for (Iterator<String> it = new TreeSet(appLayers.keySet()).iterator(); it.hasNext();) {
        for (Iterator<String> it = appLayers.keys(); it.hasNext(); ) {
            String key = it.next();
            JSONObject appLayer = appLayers.getJSONObject(key);
            boolean allowed = isAppLayerAllowed(appLayer, roles);
            if (!allowed) {
                it.remove();
            }
        }

        for (Iterator<String> it = levels.keys(); it.hasNext(); ) {
            String key = it.next();
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

        String scheme = requestURI.getScheme();
        String serverName = requestURI.getHost();
        int serverPort = requestURI.getPort();
        String contextPath = requestURI.getPath();
        StringBuilder url = new StringBuilder();
        String servletPath = proxyPath == null
                ? "/action/proxy/wms"
                : proxyPath;
        url.append(scheme).append("://").append(serverName);

        if ((serverPort != 80) && (serverPort != 443)) {
            url.append(":").append(serverPort);
        }

        url.append(contextPath).append(servletPath);
        final String proxyUrl = url.toString();
        for (Iterator<String> it = services.keys(); it.hasNext(); ) {

            String key = it.next();
            JSONObject service = services.getJSONObject(key);
            if (service.has(GeoService.DETAIL_USE_PROXY) && service.getBoolean(GeoService.DETAIL_USE_PROXY)) {
                String actualURL = service.getString("url");
                String param = URLEncoder.encode(actualURL, StandardCharsets.UTF_8);
                StringBuilder newUrl = new StringBuilder(proxyUrl);
                newUrl.append("?url=");
                newUrl.append(param);
                if (service.has(GeoService.PARAM_MUST_LOGIN) && service.getBoolean(GeoService.PARAM_MUST_LOGIN)) {
                    newUrl.append("&mustLogin=true&serviceId=");
                    newUrl.append(service.get("id"));
                }
                service.put("url", newUrl);
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

    private boolean isAuthorized(JSONObject obj, Set<String> roles, boolean alsoWriters, String authString) throws JSONException {

        if (obj.has(authString) && obj.getJSONObject(authString).length() != 0) {
            // Levels only have readers
            JSONArray readers = obj.getJSONObject(authString).getJSONArray("readers");
            if (readers.length() > 0) {
                Set<String> allowedRoles = new HashSet<>();
                for (int i = 0; i < readers.length(); i++) {
                    if (!readers.isNull(i)) {
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
                    Set<String> allowedRoles = new HashSet<>();
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
            treeCache.initializeLevels("left join fetch l.documents", em);
            treeCache.initializeApplicationLayers("left join fetch al.details", em);
            AuthorizationsHelper.ApplicationCache appCache = AuthorizationsHelper.getApplicationCache(app, em);

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

            Map<GeoService, Set<String>> usedLayersByService = new HashMap<>();
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
                    if (gs instanceof TileService){
                        services.put(serviceId, TilingServiceHelper.toJSONObject((TileService)gs, false, usedLayers, validXmlTags, true, em));
                    } else if (gs instanceof ArcGISService){
                        services.put(serviceId, ArcGISServiceHelper.toJSONObject((ArcGISService)gs, false, usedLayers, validXmlTags, true, em));
                    }
                    else {
                        services.put(serviceId, GeoServiceHelper.toJSONObject(gs,false, usedLayers, validXmlTags, true, em));
                    }
                }
            }
        }
        return o;
    }

    private void visitLevelForUsedServicesLayers(Level l, Map<GeoService, Set<String>> usedLayersByService, Application app, Application.TreeCache treeCache) {
        for (ApplicationLayer al : l.getLayers()) {
            GeoService gs = al.getService();

            Set<String> usedLayers = usedLayersByService.get(gs);
            if (usedLayers == null) {
                usedLayers = new HashSet<>();
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
            return Boolean.parseBoolean(dirtyClob.getValue());
        }
    }

    private void walkAppTreeForJSON(JSONObject levels, JSONObject appLayers, List selectedContent, Level l, boolean parentIsBackground,
                                    boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations, Application app,
                                    Application.TreeCache treeCache, AuthorizationsHelper.ApplicationCache appCache, EntityManager em, boolean previouslySelected) throws JSONException {

        StartLevel sl = l.getStartLevels().get(app);
        JSONObject o =  LevelHelper.toJSONObject( l, false, app, null, em);

        AuthorizationsHelper.Read auths = appCache.getProtectedLevels().get(l.getId());
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
            JSONObject p = ApplicationLayerHelper.toJSONObject(al, includeAppLayerAttributes, includeRelations, em, app);
            p.put("background", l.isBackground() || parentIsBackground);
            p.put("removed", startLayer == null || startLayer.isRemoved());

            AuthorizationsHelper.ReadWrite rw = appCache.getProtectedAppLayers().get(al.getId());
            p.put("editAuthorizations", rw != null ? rw.toJSON() : new JSONObject());
            String alId = al.getId().toString();
            if (validXmlTags) {
                alId = "appLayer_" + alId;
            }

            AuthorizationsHelper.ReadWrite applayerAuths = appCache.getProtectedAppLayers().get(al.getId());
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
                AuthorizationsHelper.Read levelAuths = appCache.getProtectedLevels().get(child.getId());
                childObject.put(AUTHORIZATIONS_KEY, levelAuths != null ? levelAuths.toJSON() : new JSONObject());
                jsonChildren.put(childObject);
                walkAppTreeForJSON(levels, appLayers, selectedContent, child, l.isBackground(), validXmlTags, includeAppLayerAttributes,
                        includeRelations, app, treeCache, appCache, em, selected);
            }
        }
    }

    public static void setApplicationCacheDirty(Application app, Boolean dirty, Boolean expanded, Boolean onlyThisApplication, EntityManager em) {
        Set<Application> apps = new HashSet<>();
        if (dirty && !onlyThisApplication) {
            apps = LevelHelper.findApplications(app.getRoot(), em);
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
