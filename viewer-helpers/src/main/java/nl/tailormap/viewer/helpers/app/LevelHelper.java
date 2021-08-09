package nl.tailormap.viewer.helpers.app;

import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.Level;
import nl.tailormap.viewer.config.services.Document;
import nl.tailormap.viewer.helpers.AuthorizationsHelper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.HashSet;
import java.util.Set;

public class LevelHelper {

    /**
     * Find the applications this level is used in. Because of mashups a level
     * can be used in more than one application.
     *
     * @param l  Level Level for which the applications must be found
     * @param em the entity manager to use
     * @return the applications this level is part of
     */
    public static Set<Application> findApplications(Level l, EntityManager em) {
        while (l.getParent() != null) {
            l = l.getParent();
        }

        Set<Application> apps = new HashSet();
        apps.addAll(em.createQuery("from Application where root = :level")
                .setParameter("level", l)
                .getResultList());
        return apps;
    }

    public static JSONObject toJSONObject(Level level, boolean includeChildrenIds, Application app, HttpServletRequest request, EntityManager em) throws JSONException {
        JSONObject o = new JSONObject();

        /* TODO check readers */

        o.put("id", level.getId());
        o.put("name", level.getName());
        o.put("background", level.isBackground());
        o.put("info", level.getInfo());
        o.put("url", level.getUrl());

        if (!level.getDocuments().isEmpty()) {
            JSONArray docs = new JSONArray();
            o.put("documents", docs);
            for (Document d : level.getDocuments()) {
                docs.put(d.toJSONObject());
            }
        }

        if (!level.getLayers().isEmpty()) {
            JSONArray ls = new JSONArray();
            o.put("layers", ls);
            for (ApplicationLayer applicationLayer : level.getLayers()) {
                if ((request == null || AuthorizationsHelper.isAppLayerReadAuthorized(app, applicationLayer, request, em)) && applicationLayer.getStartLayers().containsKey(app)) {
                    ls.put(applicationLayer.getId().toString());
                }
            }
        }

        if (includeChildrenIds) {
            if (!level.getChildren().isEmpty()) {
                JSONArray cs = new JSONArray();
                o.put("children", cs);
                for (Level childLevel : level.getChildren()) {
                    if (request == null || AuthorizationsHelper.isLevelReadAuthorized(app, childLevel, request, em)) {
                        cs.put(childLevel.getId().toString());
                    }
                }
            }
        }

        return o;
    }

}
