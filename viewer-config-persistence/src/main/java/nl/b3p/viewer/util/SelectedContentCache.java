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
import java.util.List;
import java.util.Map;
import java.util.Set;
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
            
            Authorizations.ReadWrite auths = appCache.getProtectedAppLayers().get(al.getId());
            p.put("authorizations", auths != null ? auths.toJSON() : new JSONObject());
            
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
                Authorizations.Read auths = appCache.getProtectedLevels().get(child.getId());
                String childId = child.getId().toString();
                if (validXmlTags) {
                    childId = "level_" + childId;
                }
                childObject.put("child", childId);
                childObject.put("authorizations", auths != null ? auths.toJSON() : new JSONObject());
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
    
}
