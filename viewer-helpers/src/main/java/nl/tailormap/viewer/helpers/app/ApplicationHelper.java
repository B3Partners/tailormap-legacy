package nl.tailormap.viewer.helpers.app;

import net.sourceforge.stripes.action.ActionBeanContext;
import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.app.Application;
import nl.tailormap.viewer.config.app.ApplicationLayer;
import nl.tailormap.viewer.config.app.Bookmark;
import nl.tailormap.viewer.config.app.ConfiguredComponent;
import nl.tailormap.viewer.config.app.Level;
import nl.tailormap.viewer.config.app.StartLayer;
import nl.tailormap.viewer.config.app.StartLevel;
import nl.tailormap.viewer.config.security.Authorizations;
import nl.tailormap.viewer.util.SelectedContentCache;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ApplicationHelper {
    private static final Log log = LogFactory.getLog(ApplicationHelper.class);


    // <editor-fold desc="workversion" default-state="collapsed">

    public static Application createWorkVersion(Application app, EntityManager em, String version, ActionBeanContext context) throws Exception {
        Application base = app;
        Application copy = deepCopyAllButLevels(false, app);
        copy.setVersion(version);
        copy.setRoot(null);
        // save application, so it will have an id
        em.persist(copy);
        em.getTransaction().commit();
        em.getTransaction().begin();

        copy.originalToCopy = new HashMap();
        if (app.getRoot() != null) {
            copy.setRoot(app.getRoot().deepCopy(null, copy.originalToCopy, copy, false));
            // reverse originalToCopy
            Map reverse = reverse(copy.originalToCopy);

            copy.originalToCopy = reverse;

            copy.getRoot().processForWorkversion(copy, base);
        }

        Set<Application> apps = LevelHelper.findApplications(base.getRoot(), em);
        for (Application application : apps) {
            em.detach(application);
        }
        // don't save changes to original app and it's mashups

        em.persist(copy);
        em.flush();
        Application prev = em.createQuery("FROM Application where id = :id", Application.class).setParameter("id", base.getId()).getSingleResult();
        processBookmarks(copy, prev, context, em);
        SelectedContentCache.setApplicationCacheDirty(copy, Boolean.TRUE, false, em);
        em.getTransaction().commit();
        return copy;
    }
    //</editor-fold>


    // <editor-fold desc="deepCopying" default-state="collapsed">
    public static Application deepCopy( Application app) throws Exception {
        Application copy = deepCopyAllButLevels(false, app);

        copy.originalToCopy = new HashMap();
        if (app.getRoot() != null) {
            copy.setRoot(app.getRoot().deepCopy(null, copy.originalToCopy, copy, true));
        }

        return copy;
    }

    private static Map reverse(Map orig) {
        Map reverse = new HashMap();
        Set<Map.Entry> entries = orig.entrySet();
        for (Map.Entry entry: entries) {
            reverse.put(entry.getValue(), entry.getKey());
        }
        return reverse;
    }

    private static Application deepCopyAllButLevels(boolean linkComponents, Application app) throws Exception {
        Application copy = (Application) BeanUtils.cloneBean(app);
        copy.setId(null);
        copy.setBookmarks(null);
        copy.setTreeCache(null);
        copy.setStartLayers(new ArrayList<>());
        copy.setStartLevels(new ArrayList<>());
        copy.setReaders(new HashSet<>());
        // user reference is not deep copied, of course

        copy.setDetails(new HashMap<>(app.getDetails()));
        if (app.getStartExtent() != null) {
            copy.setStartExtent(app.getStartExtent().clone());
        }
        if (app.getMaxExtent() != null) {
            copy.setMaxExtent(app.getMaxExtent().clone());
        }

        copy.setComponents(new HashSet<>());
        for (ConfiguredComponent cc : app.getComponents()) {
            ConfiguredComponent componentCopy = cc.deepCopy(copy);
            copy.getComponents().add(componentCopy);
            if (linkComponents) {
                componentCopy.setMotherComponent(cc);
                cc.getLinkedComponents().add(componentCopy);
            }
        }

        for (String reader : app.getReaders()) {
            copy.getReaders().add(reader);
        }
        return copy;
    }
    //</editor-fold>


    // <editor-fold desc="mashups" default-state="collapsed">
    public static Application createMashup(Application app, String mashupName, EntityManager em, boolean linkComponents) throws Exception {
         Application source = app;

        if (!em.contains(source)) {
            source = em.merge(source);
        }
        Application mashup = deepCopyAllButLevels(linkComponents, source);
        mashup.setName(mashup.getName() + "_" + mashupName);
        em.persist(mashup);
        if (mashup.getRoot() != null) {
            mashup.getRoot().processForMashup(mashup, source);
        }

        app.isMashup_cached = Boolean.TRUE;
        mashup.getDetails().put(Application.DETAIL_IS_MASHUP, new ClobElement(app.isMashup_cached + ""));
        return mashup;
    }


    public static List<Application> getMashups(Application app, EntityManager em) {
        return em.createQuery(
                "from Application where root = :level and id <> :oldId")
                .setParameter("level", app.getRoot()).setParameter("oldId", app.getId()).getResultList();
    }


    public static void processBookmarks(Application app, Application previousApplication, ActionBeanContext context, EntityManager em) {
        // bookmark krijgt een appId kolom
        // bij maken werkversie
        // check of bookmarkcomponent de configuratie: followsApplication
        // zo ja
        //haal alle bookmarks voor vorige applicatie op
        // maak clone
        // Zet referentie naar vorige bookmark
        // vervang layer ids
        // vervang level ids
        // vervang ids in selectedcontent
        // set id van nieuwe applicatie in bookmark
        // set id van oude applicatie als referentie in bookmark
        // persist bookmark
        // zo nee, doe niks
        // Bij ophalen bookmark
        // Gebruik ook applicatienaam en versienummer om bookmark op te halen

        List<ConfiguredComponent> bookmarkComponents = em.createQuery("FROM ConfiguredComponent where application.id = :app and className = :className", ConfiguredComponent.class)
                .setParameter("app", previousApplication.getId()).setParameter("className", "viewer.components.Bookmark").getResultList();

        for (ConfiguredComponent comp : bookmarkComponents) {
            String config = comp.getConfig();
            if (config != null && !config.isEmpty()) {
                try {
                    JSONObject conf = new JSONObject(config);
                    if (conf.optBoolean("copyBookmarkForWorkversion", false)) {
                        List<Bookmark> bookmarks = em.createQuery("FROM Bookmark where application = :app", Bookmark.class).setParameter("app", previousApplication).getResultList();
                        for (Bookmark bookmark : bookmarks) {
                            Bookmark clone = bookmark.clone();
                            clone.setCreatedBy(createCreatedBy(context));
                            clone.setApplication(app);
                            processBookmark(clone, app.idMap);
                            em.persist(clone);
                            clone.setCode(bookmark.getCode());
                            em.persist(clone);
                        }
                    }
                } catch (JSONException ex) {
                    log.error("Cannot convert bookmarks.", ex);
                }
            }
        }
        previousApplication = null;
    }

    private static void processBookmark(Bookmark bookmark, Map<String, Long> idMap) throws JSONException {
        JSONObject bm = new JSONObject(bookmark.getParams());
        JSONArray params = bm.getJSONArray("params");
        JSONArray newParams = new JSONArray();
        for (int i = 0; i < params.length(); i++) {
            JSONObject param = params.getJSONObject(i);
            JSONArray value = param.optJSONArray("value");
            if (param.getString("name").equals("layers")) {
                JSONArray newLayers = new JSONArray();
                for (int j = 0; j < value.length(); j++) {
                    Integer layerId = value.getInt(j);
                    Long newId = idMap.get(ApplicationLayer.class + "_" + layerId);
                    newLayers.put(newId);
                }
                param.put("value", newLayers);
            } else if (param.getString("name").equals("levelOrder")) {
                JSONArray newLevels = new JSONArray();
                for (int j = 0; j < value.length(); j++) {
                    Integer levelId = value.getInt(j);
                    Long newId = idMap.get(Level.class + "_" + levelId);
                    newLevels.put(newId);
                }
                param.put("value", newLevels);
            } else if (param.getString("name").equals("selectedContent")) {
                for (int j = 0; j < value.length(); j++) {
                    JSONObject content = value.getJSONObject(j);
                    if (content.optString("type", "level").equals("level")) {
                        Long newId = idMap.get(Level.class + "_" + content.getString("id"));
                        content.put("id", newId);
                    }
                }
            }
            newParams.put(param);
        }
        JSONObject newBm = new JSONObject();
        newBm.put("params", newParams);
        bookmark.setParams(newBm.toString());
        //layers
        //levelorder
        //selectedcontent
    }

    public static String createCreatedBy(ActionBeanContext context){
        String createdBy = "IP: " + context.getRequest().getRemoteAddr();
        if (context.getRequest().getHeader("x-forwarded-for") != null) {
            createdBy = "IP: " + context.getRequest().getHeader("x-forwarded-for") + "(proxy " + createdBy + ")";
        }
        if (context.getRequest().getRemoteUser() != null) {
            createdBy += ", user: " + context.getRequest().getRemoteUser();
        }
        return createdBy;
    }

    /**
     * When a workversion of an application is published, sometimes (determined
     * by the user) the mashups should "follow" the published version: the
     * mashup should always point to the published version. When this occurs,
     * the mashup should update the layerIds in the components (because
     * otherwise the layerIds point to the previous published version). In this
     * method an Map is created in the same way as deepCopy creates. This Map is
     * used for converting the layerIds in the component configuration.
     *
     * @param app The Application from which the layerIds should be matched.
     * @param old The Application to which the layerIds should be matched.
     * @param em the entity manager to use
     */
    public static void transferMashupLevels(Application app, Application old, EntityManager em) {
        app.originalToCopy = new HashMap();
        app.loadTreeCache(em);
        visitLevelForMashuptransfer(app, old.getRoot(), app.originalToCopy);
        Map reverse = reverse(app.originalToCopy);
        List<StartLayer> startlayersAdded = new ArrayList<>();
        List<StartLevel> startlevelsAdded = new ArrayList<>();
        replaceLevel(app, app.getRoot(),reverse, startlayersAdded, startlevelsAdded);
        app.getStartLevels().retainAll(startlevelsAdded);
        app.getStartLayers().retainAll(app.getStartLayers());
        app.processCopyMap();
        // Loop alle levels af van de oude applicatie
        // Per level alle children
        // Per level,
        //zoek voor elke appLayer (uit oude applicatie) de bijbehorende NIEUWE applayer
        // sla in originalToCopy de ids op van de appLayer
        //zoek voor elke level (uit oude applicatie) de bijbehorende NIEUWE level
        // sla in originalToCopy de ids op van de level
        // Roep postPersist aan.
    }

    public static void transferMashupComponents(Application app, Application newApp) {
        for (ConfiguredComponent component : app.getComponents()) {
            if(component.getMotherComponent() != null){
                for (ConfiguredComponent newAppComp : newApp.getComponents()) {
                    if(component.getName().equals(newAppComp.getName())){
                        component.setMotherComponent(newAppComp);
                    }
                }
            }
        }
    }


    private static void replaceLevel(Application app, Level l,  Map reverse, List<StartLayer> startlayersAdded, List<StartLevel> startlevelsAdded) {
        for (Level level : l.getChildren()) {
            replaceLevel(app, level, reverse,startlayersAdded, startlevelsAdded);
        }

        for (ApplicationLayer layer : l.getLayers()) {
            replaceLayer(app, layer,reverse, startlayersAdded);
        }
        Object o = reverse.get(l);
        if (o != null) {
            StartLevel sl = ((Level) o).getStartLevels().get(app);
            if (sl != null) {
                sl.setLevel(l);
                startlevelsAdded.add(sl);
            }
        }
    }

    private static void replaceLayer(Application app, ApplicationLayer al,Map reverse, List<StartLayer> startlayersAdded){
        Object o = reverse.get(al);
        if (o != null) {
            StartLayer sl = ((ApplicationLayer) o).getStartLayers().get(app);
            if (sl != null) {
                sl.setApplicationLayer(al);
                startlayersAdded.add(sl);
            }
        }
    }

    private static void visitLevelForMashuptransfer(Application app, Level oldLevel, Map originalToCopy) {
        Level newLevel = app.findLevel(oldLevel);
        if (newLevel != null) {
            originalToCopy.put(oldLevel, newLevel);
        }

        for (ApplicationLayer oldLayer : oldLevel.getLayers()) {
            ApplicationLayer newLayer = app.findLayer(oldLayer);
            if (newLayer != null) {
                originalToCopy.put(oldLayer, newLayer);
            }
        }

        for (Level oldChild : oldLevel.getChildren()) {
            visitLevelForMashuptransfer(app, oldChild, originalToCopy);
        }
    }
    // </editor-fold>


    //<editor-fold desc="toJSON" default-state="collapsed">
    /**
     * Create a JSON representation for use in browser to start this application.
     *
     * @param app                   Application for which the jsonobject should be created
     * @param request               servlet request to check authorisation
     * @param validXmlTags          {@code true} if valid xml names should be produced
     * @param onlyServicesAndLayers {@code true} if only services and layers should be returned
     *                              should be included
     * @param em                    the entity manager to use
     * @return a json representation of this object
     * @throws JSONException if transforming to json fails
     * @deprecated gebruik {@link #toJSON(Application, HttpServletRequest, boolean, boolean, boolean, boolean,
     * EntityManager, boolean)}
     */
    @Deprecated
    public static JSONObject toJSON(Application app,HttpServletRequest request, boolean validXmlTags, boolean onlyServicesAndLayers, EntityManager em) throws JSONException {
        return toJSON(app, request, validXmlTags, onlyServicesAndLayers, false, false, em, true);
    }

    public static JSONObject toJSON(Application app,HttpServletRequest request, boolean validXmlTags, boolean onlyServicesAndLayers, EntityManager em, boolean hideAdminOnly) throws JSONException {
        return toJSON(app, request, validXmlTags, onlyServicesAndLayers, false, false, em, true, hideAdminOnly);
    }

    public static JSONObject toJSON(Application app,HttpServletRequest request, boolean validXmlTags, boolean onlyServicesAndLayers,
                             boolean includeAppLayerAttributes, boolean includeRelations,
                             EntityManager em, boolean shouldProcessCache) throws JSONException {
        return toJSON(app, request, validXmlTags, onlyServicesAndLayers, includeAppLayerAttributes, includeRelations, em,
                shouldProcessCache, false);
    }
    /**
     * Create a JSON representation for use in browser to start this
     * application.
     *
     * @param app  Application for which the jsonobject should be created
     * @param request servlet request to check authorisation
     * @param validXmlTags {@code true} if valid xml names should be produced
     * @param onlyServicesAndLayers {@code true} if only services and layers
     * should be returned
     * @param includeAppLayerAttributes {@code true} if applayer attributes
     * should be included
     * @param includeRelations {@code true} if relations should be included
     * @param em the entity manager to use
     * @param shouldProcessCache Flag if the cache should be processed (filtering the layers/levels according to the logged in user)
     * @param hideAdminOnly True to prevent adminOnly config items from showing up in the output
     * @return a json representation of this object
     * @throws JSONException if transforming to json fails
     */
    public static JSONObject toJSON(Application app, HttpServletRequest request, boolean validXmlTags, boolean onlyServicesAndLayers, boolean includeAppLayerAttributes, boolean includeRelations,
                             EntityManager em, boolean shouldProcessCache, boolean hideAdminOnly) throws JSONException {
        JSONObject o = null;
        SelectedContentCache cache = new SelectedContentCache();
        o = cache.getSelectedContent(request, app, validXmlTags, includeAppLayerAttributes, includeRelations, em, shouldProcessCache);

        o.put("id", app.getId());
        o.put("name", app.getName());
        if (!onlyServicesAndLayers && app.getLayout() != null) {
            o.put("layout", new JSONObject(app.getLayout()));
        }
        o.put("version", app.getVersion());
        o.put("title", app.getTitle());
        o.put("language", app.getLang());
        o.put("projectionCode", app.getProjectionCode() != null ? app.getProjectionCode() : "EPSG:28992[+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs]");

        if (!onlyServicesAndLayers) {
            JSONObject d = new JSONObject();
            o.put("details", d);
            for (Map.Entry<String, ClobElement> e : app.getDetails().entrySet()) {
                if (!app.adminOnlyDetails.contains(e.getKey())) {
                    d.put(e.getKey(), e.getValue());
                }
            }
        }
        if (!onlyServicesAndLayers) {
            if (app.getStartExtent() != null) {
                o.put("startExtent", app.getStartExtent().toJSONObject());
            }
            if (app.getMaxExtent() != null) {
                o.put("maxExtent", app.getMaxExtent().toJSONObject());
            }
        }

        if (!onlyServicesAndLayers) {
            // Prevent n+1 query for ConfiguredComponent.details
            em.createQuery(
                    "from ConfiguredComponent cc left join fetch cc.details where application = :this")
                    .setParameter("this", app)
                    .getResultList();

            JSONObject c = new JSONObject();
            o.put("components", c);
            for (ConfiguredComponent comp : app.getComponents()) {
                if (Authorizations.isConfiguredComponentAuthorized(comp, request, em)) {
                    c.put(comp.getName(), comp.toJSON(hideAdminOnly));
                }
            }
        }

        return o;
    }
    //</editor-fold>
}
