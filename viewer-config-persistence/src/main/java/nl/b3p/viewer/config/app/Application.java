/*
 * Copyright (C) 2011-2017 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import nl.b3p.viewer.config.ClobElement;
import java.util.*;
import javax.persistence.*;
import javax.servlet.http.HttpServletRequest;
import net.sourceforge.stripes.action.ActionBeanContext;
import nl.b3p.viewer.config.security.Authorizations;
import nl.b3p.viewer.config.security.User;
import nl.b3p.viewer.config.services.BoundingBox;
import nl.b3p.viewer.config.services.GeoService;
import nl.b3p.viewer.util.ApplicationDetailsValueTransformer;
import nl.b3p.viewer.util.DB;
import nl.b3p.viewer.util.SelectedContentCache;
import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Session;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 * @author mprins
 */
@Entity
@Table(
        uniqueConstraints
        = @UniqueConstraint(columnNames = {"name", "version"})
)
public class Application {

    private static final Log log = LogFactory.getLog(Application.class);

    // Details keys
    public static final String DETAIL_IS_MASHUP = "isMashup";
    public static final String DETAIL_GLOBAL_LAYOUT = "globalLayout";
    public static final String DETAIL_LAST_SPINUP_TIME = "lastSpinupTime";

    private static Set adminOnlyDetails = new HashSet<String>(Arrays.asList(new String[]{
        "opmerking"
    }));

    public static final Set<String> preventClearDetails = new HashSet<String>(Arrays.asList(new String[]{
        DETAIL_IS_MASHUP,
        DETAIL_GLOBAL_LAYOUT
    }));

    @Id
    private Long id;

    @Basic(optional = false)
    private String name;

    @Column(length = 30)
    private String version;

    @Lob
    @org.hibernate.annotations.Type(type = "org.hibernate.type.StringClobType")
    private String layout;

    @ElementCollection
    @JoinTable(joinColumns = @JoinColumn(name = "application"))
    // Element wrapper required because of http://opensource.atlassian.com/projects/hibernate/browse/JPA-11
    private Map<String, ClobElement> details = new HashMap<String, ClobElement>();

    @ManyToOne
    private User owner;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name = "start_crs")),
        @AttributeOverride(name = "minx", column = @Column(name = "start_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name = "start_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name = "start_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name = "start_maxy"))
    })
    private BoundingBox startExtent;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "crs.name", column = @Column(name = "max_crs")),
        @AttributeOverride(name = "minx", column = @Column(name = "max_minx")),
        @AttributeOverride(name = "maxx", column = @Column(name = "max_maxx")),
        @AttributeOverride(name = "miny", column = @Column(name = "max_miny")),
        @AttributeOverride(name = "maxy", column = @Column(name = "max_maxy"))
    })
    private BoundingBox maxExtent;

    private boolean authenticatedRequired;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Level root;

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private Set<ConfiguredComponent> components = new HashSet<ConfiguredComponent>();

    @Basic(optional = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date authorizationsModified = new Date();

    /**
     * Map (populated in deepCopy()) of the original persistant object from the
     * copy source Application to the new object in this copy used for updating
     * the references in component JSON config using id's in postPersist().
     */
    @Transient
    Map originalToCopy;

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private List<Bookmark> bookmarks = new ArrayList<Bookmark>();

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private List<StartLayer> startLayers = new ArrayList<StartLayer>();

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private List<StartLevel> startLevels = new ArrayList<StartLevel>();

    @ElementCollection
    @Column(name = "role_name")
    private Set<String> readers = new HashSet<String>();

    // <editor-fold defaultstate="collapsed" desc="getters and setters">
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public Map<String, ClobElement> getDetails() {
        return details;
    }

    public void setDetails(Map<String, ClobElement> details) {
        this.details = details;
    }

    public boolean isAuthenticatedRequired() {
        return authenticatedRequired;
    }

    public void setAuthenticatedRequired(boolean authenticatedRequired) {
        this.authenticatedRequired = authenticatedRequired;
    }

    public Set<ConfiguredComponent> getComponents() {
        return components;
    }

    public void setComponents(Set<ConfiguredComponent> components) {
        this.components = components;
    }

    public BoundingBox getMaxExtent() {
        return maxExtent;
    }

    public void setMaxExtent(BoundingBox maxExtent) {
        this.maxExtent = maxExtent;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Level getRoot() {
        return root;
    }

    public void setRoot(Level root) {
        this.root = root;
    }

    public BoundingBox getStartExtent() {
        return startExtent;
    }

    public void setStartExtent(BoundingBox startExtent) {
        this.startExtent = startExtent;
    }

    public Date getAuthorizationsModified() {
        return authorizationsModified;
    }

    public void setAuthorizationsModified(Date authorizationsModified) {
        this.authorizationsModified = authorizationsModified;
    }

    public List<Bookmark> getBookmarks() {
        return bookmarks;
    }

    public void setBookmarks(List<Bookmark> bookmarks) {
        this.bookmarks = bookmarks;
    }

    public List<StartLayer> getStartLayers() {
        return startLayers;
    }

    public void setStartLayers(List<StartLayer> startLayers) {
        this.startLayers = startLayers;
    }

    public List<StartLevel> getStartLevels() {
        return startLevels;
    }

    public void setStartLevels(List<StartLevel> startLevels) {
        this.startLevels = startLevels;
    }

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }
    //</editor-fold>

    public String getNameWithVersion() {
        String n = getName();
        if (getVersion() != null) {
            n += " v" + getVersion();
        }
        return n;
    }

    public TreeCache getTreeCache() {
        return treeCache;
    }

    public static class TreeCache {

        List<Level> levels;
        Map<Level, List<Level>> childrenByParent;
        List<ApplicationLayer> applicationLayers;

        public List<ApplicationLayer> getApplicationLayers() {
            return applicationLayers;
        }

        public Map<Level, List<Level>> getChildrenByParent() {
            return childrenByParent;
        }

        public List<Level> getChildren(Level l) {
            List<Level> children = childrenByParent.get(l);
            if (children == null) {
                return Collections.EMPTY_LIST;
            } else {
                return children;
            }
        }

        public List<Level> getLevels() {
            return levels;
        }

        public void initializeLevels(String leftJoins, EntityManager em) {
            // Prevent n+1 queries for each level
            int i = 0;
            do {
                List<Level> subList = levels.subList(i, Math.min(levels.size(), i + DB.MAX_LIST_EXPRESSIONS));
                em.createQuery("from Level l "
                        + leftJoins + " "
                        + "where l in (:levels) ")
                        .setParameter("levels", subList)
                        .getResultList();
                i += subList.size();
            } while (i < levels.size());
        }

        public void initializeApplicationLayers(String leftJoins, EntityManager em) {
            if (!getApplicationLayers().isEmpty()) {
                // Prevent n+1 queries for each ApplicationLayer
                int i = 0;
                do {
                    List<ApplicationLayer> subList = applicationLayers.subList(i, Math.min(applicationLayers.size(), i + DB.MAX_LIST_EXPRESSIONS));
                    em.createQuery("from ApplicationLayer al "
                            + leftJoins + " "
                            + "where al in (:alayers) ")
                            .setParameter("alayers", subList)
                            .getResultList();
                    i += subList.size();
                } while (i < applicationLayers.size());
            }
        }
    }

    @Transient
    private TreeCache treeCache;

    public void setTreeCache(TreeCache treeCache) {
        this.treeCache = treeCache;
    }

    public TreeCache loadTreeCache(EntityManager em) {
        if (treeCache == null) {

            treeCache = new TreeCache();

            // Retrieve level tree structure in single query
            treeCache.levels = em.createNamedQuery("getLevelTree")
                    .setParameter("rootId", root.getId())
                    .getResultList();

            treeCache.childrenByParent = new HashMap();
            treeCache.applicationLayers = new ArrayList();

            for (Level l : treeCache.levels) {
                treeCache.applicationLayers.addAll(l.getLayers());

                if (l.getParent() != null) {
                    List<Level> parentChildren = treeCache.childrenByParent.get(l.getParent());
                    if (parentChildren == null) {
                        parentChildren = new ArrayList<Level>();
                        treeCache.childrenByParent.put(l.getParent(), parentChildren);
                    }
                    parentChildren.add(l);
                }
            }

        }
        return treeCache;
    }

    public void authorizationsModified() {
        authorizationsModified = new Date();
    }

    public String toJSON(HttpServletRequest request, boolean validXmlTags, boolean onlyServicesAndLayers, EntityManager em) throws JSONException {
        return toJSON(request, validXmlTags, onlyServicesAndLayers, false, false, em);
    }

    /**
     * Create a JSON representation for use in browser to start this
     * application.
     *
     * @param request servlet request to check authorisation
     * @param validXmlTags {@code true} if valid xml names should be produced
     * @param onlyServicesAndLayers {@code true} if only services and layers
     * should be returned
     * @param includeAppLayerAttributes {@code true} if applayer attributes
     * should be included
     * @param includeRelations {@code true} if relations should be included
     * @param em the entity manager to use
     * @return a json representation of this object
     * @throws JSONException if transforming to json fails
     */
    public String toJSON(HttpServletRequest request, boolean validXmlTags, boolean onlyServicesAndLayers, boolean includeAppLayerAttributes, boolean includeRelations, EntityManager em) throws JSONException {
        JSONObject o = null;
        SelectedContentCache cache = new SelectedContentCache();
        o = cache.getSelectedContent(request, this, validXmlTags, includeAppLayerAttributes, includeRelations, em);

        o.put("id", id);
        o.put("name", name);
        if (!onlyServicesAndLayers && layout != null) {
            o.put("layout", new JSONObject(layout));
        }
        o.put("version", version);

        if (!onlyServicesAndLayers) {
            JSONObject d = new JSONObject();
            o.put("details", d);
            for (Map.Entry<String, ClobElement> e : details.entrySet()) {
                if (!adminOnlyDetails.contains(e.getKey())) {
                    d.put(e.getKey(), e.getValue());
                }
            }
        }
        if (!onlyServicesAndLayers) {
            if (startExtent != null) {
                o.put("startExtent", startExtent.toJSONObject());
            }
            if (maxExtent != null) {
                o.put("maxExtent", maxExtent.toJSONObject());
            }
        }

        if (!onlyServicesAndLayers) {
            // Prevent n+1 query for ConfiguredComponent.details
            em.createQuery(
                    "from ConfiguredComponent cc left join fetch cc.details where application = :this")
                    .setParameter("this", this)
                    .getResultList();

            JSONObject c = new JSONObject();
            o.put("components", c);
            for (ConfiguredComponent comp : components) {
                if (Authorizations.isConfiguredComponentAuthorized(comp, request, em)) {
                    c.put(comp.getName(), comp.toJSON());
                }
            }
        }

        return o.toString(4);
    }

    private void walkAppTreeForJSON(JSONObject levels, JSONObject appLayers, List selectedContent, Level l, boolean parentIsBackground, HttpServletRequest request, boolean validXmlTags, boolean includeAppLayerAttributes, boolean includeRelations, EntityManager em) throws JSONException {
        JSONObject o = l.toJSONObject(false, this, request, em);
        o.put("background", l.isBackground() || parentIsBackground);
        String levelId = l.getId().toString();
        if (validXmlTags) {
            levelId = "level_" + levelId;
        }
        levels.put(levelId, o);

        StartLevel sl = l.getStartLevels().get(this);
        if (sl != null && sl.getSelectedIndex() != null) {
            selectedContent.add(l);
        }

        for (ApplicationLayer al : l.getLayers()) {
            if (!Authorizations.isAppLayerReadAuthorized(this, al, request, em)) {
                //System.out.printf("Application layer %d (service #%s %s layer %s) in level %d %s unauthorized\n", al.getId(), al.getService().getId(), al.getService().getName(), al.getLayerName(), l.getId(), l.getName());
                continue;
            }
            JSONObject p = al.toJSONObject(includeAppLayerAttributes, includeRelations, em, this);
            p.put("background", l.isBackground() || parentIsBackground);
            p.put("editAuthorized", Authorizations.isAppLayerWriteAuthorized(this, al, request, em));
            String alId = al.getId().toString();
            if (validXmlTags) {
                alId = "appLayer_" + alId;
            }
            appLayers.put(alId, p);
            StartLayer startLayer = al.getStartLayers().get(this);
            if (startLayer != null && startLayer.getSelectedIndex() != null) {
                selectedContent.add(al);
            }
        }

        List<Level> children = treeCache.childrenByParent.get(l);
        if (children != null) {
            Collections.sort(children);
            JSONArray jsonChildren = new JSONArray();
            o.put("children", jsonChildren);
            for (Level child : children) {
                if (Authorizations.isLevelReadAuthorized(this, child, request, em)) {
                    String childId = child.getId().toString();
                    if (validXmlTags) {
                        childId = "level_" + childId;
                    }
                    jsonChildren.put(childId);
                    walkAppTreeForJSON(levels, appLayers, selectedContent, child, l.isBackground(), request, validXmlTags, includeAppLayerAttributes, includeRelations, em);
                }
            }
        }
    }

    private void visitLevelForUsedServicesLayers(Level l, Map<GeoService, Set<String>> usedLayersByService, HttpServletRequest request, EntityManager em) {
        if (!Authorizations.isLevelReadAuthorized(this, l, request, em)) {
            return;
        }

        for (ApplicationLayer al : l.getLayers()) {
            if (!Authorizations.isAppLayerReadAuthorized(this, al, request, em)) {
                continue;
            }
            GeoService gs = al.getService();

            Set<String> usedLayers = usedLayersByService.get(gs);
            if (usedLayers == null) {
                usedLayers = new HashSet<String>();
                usedLayersByService.put(gs, usedLayers);
            }
            usedLayers.add(al.getLayerName());
        }
        List<Level> children = treeCache.childrenByParent.get(l);
        if (children != null) {
            for (Level child : children) {
                visitLevelForUsedServicesLayers(child, usedLayersByService, request, em);
            }
        }
    }

    /**
     * keep a cached copy of our mashup status.
     */
    @Transient
    private Boolean isMashup_cached;

    /**
     * slow method -especially on Oracle- because it will need all keys and
     * Oracle lazy loading sucks so clob's get pulled in as well.
     *
     * @return {@code true} if we are a mashup
     * @see #isMashup(org.hibernate.Session)
     */
    public Boolean isMashup() {
        if (this.getDetails().containsKey(Application.DETAIL_IS_MASHUP)) {
            String mashupValue = this.getDetails().get(Application.DETAIL_IS_MASHUP).getValue();
            this.isMashup_cached = Boolean.valueOf(mashupValue);
        } else {
            this.isMashup_cached = Boolean.FALSE;
        }
        return this.isMashup_cached;
    }

    /**
     * fast access to determine if we are mashup.
     *
     * @param sess the hibernate session
     * @return {@code true} if we are a mashup, this may be a cached value
     *
     * @see #isMashup()
     */
    public Boolean isMashup(Session sess) {
        if (this.isMashup_cached == null) {
            this.isMashup_cached = Boolean.FALSE;
            List<Map<String, Object>> items = sess.createSQLQuery("select d.value from application_details d where d.details_key = '" + Application.DETAIL_IS_MASHUP + "' and d.application =  :appId")
                    .setLong("appId", this.getId())
                    .setResultTransformer(ApplicationDetailsValueTransformer.INSTANCE)
                    .list();
            if (items.size() > 0) {
                String mashupValue = items.get(0).get("value").toString();
                this.isMashup_cached = Boolean.valueOf(mashupValue);
            }
        }
        return this.isMashup_cached;
    }

    public Application createMashup(String mashupName, EntityManager em, boolean linkComponents) throws Exception {
        Application source = this;

        if (!em.contains(source)) {
            source = em.merge(source);
        }
        Application mashup = source.deepCopyAllButLevels(linkComponents);
        mashup.setName(mashup.getName() + "_" + mashupName);
        em.persist(mashup);
        if (mashup.getRoot() != null) {
            mashup.getRoot().processForMashup(mashup, source);
        }

        this.isMashup_cached = Boolean.TRUE;
        mashup.getDetails().put(Application.DETAIL_IS_MASHUP, new ClobElement(this.isMashup_cached + ""));
        return mashup;
    }
    
    public Application createWorkVersion(EntityManager em, String version, ActionBeanContext context) throws Exception {
        Application base = this;
        Application copy = deepCopyAllButLevels(false);
        copy.setVersion(version);
        // don't save changes to original app and it's mashups
        
        Set<Application> apps = base.getRoot().findApplications(em);
        for (Application app : apps) {
            em.detach(app);
        }
        copy.setRoot(null);
        // save application, so it will have an id
        em.persist(copy);
        em.getTransaction().commit();
        em.getTransaction().begin();
        
        copy.originalToCopy = new HashMap();
        if (root != null) {
            copy.setRoot(root.deepCopy(null, copy.originalToCopy, copy,false));
            root.processForMashup(copy, base);
        }

        em.persist(copy);
        em.flush();
        Application prev = em.createQuery("FROM Application where id = :id", Application.class).setParameter("id", base.getId()).getSingleResult();
        copy.processBookmarks(prev, context, em);
        SelectedContentCache.setApplicationCacheDirty(copy, Boolean.TRUE, false, em);
        em.getTransaction().commit();
        return copy;
    }

    public List<Application> getMashups(EntityManager em) {
        return em.createQuery(
                "from Application where root = :level and id <> :oldId")
                .setParameter("level", getRoot()).setParameter("oldId", getId()).getResultList();
    }

    public Application deepCopy() throws Exception {
        Application copy = deepCopyAllButLevels(false);

        copy.originalToCopy = new HashMap();
        if (root != null) {
            copy.setRoot(root.deepCopy(null, copy.originalToCopy, copy,true));
        }

        return copy;
    }

    private Application deepCopyAllButLevels(boolean linkComponents) throws Exception {
        Application copy = (Application) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setBookmarks(null);
        copy.setTreeCache(null);
        copy.setStartLayers(new ArrayList<>());
        copy.setStartLevels(new ArrayList<>());
        copy.setReaders(new HashSet<>());
        // user reference is not deep copied, of course

        copy.setDetails(new HashMap<>(details));
        if (startExtent != null) {
            copy.setStartExtent(startExtent.clone());
        }
        if (maxExtent != null) {
            copy.setMaxExtent(maxExtent.clone());
        }

        copy.setComponents(new HashSet<>());
        for (ConfiguredComponent cc : components) {
            ConfiguredComponent componentCopy = cc.deepCopy(copy);
            copy.getComponents().add(componentCopy);
            if (linkComponents) {
                componentCopy.setMotherComponent(cc);
                cc.getLinkedComponents().add(componentCopy);
            }
        }

        for (String reader : readers) {
            copy.getReaders().add(reader);
        }
        return copy;
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
     * @param old The Application to which the layerIds should be matched.
     * @param em the entity manager to use
     */
    public void transferMashup(Application old, EntityManager em) {
        originalToCopy = new HashMap();
        loadTreeCache(em);
        visitLevelForMashuptransfer(old.getRoot(), originalToCopy);
        processCopyMap();
        // Loop alle levels af van de oude applicatie
        // Per level alle children
        // Per level,
        //zoek voor elke appLayer (uit oude applicatie) de bijbehorende NIEUWE applayer
        // sla in originalToCopy de ids op van de appLayer
        //zoek voor elke level (uit oude applicatie) de bijbehorende NIEUWE level
        // sla in originalToCopy de ids op van de level
        // Roep postPersist aan.
    }

    private void visitLevelForMashuptransfer(Level oldLevel, Map originalToCopy) {
        Level newLevel = findLevel(oldLevel);
        if (newLevel != null) {
            originalToCopy.put(oldLevel, newLevel);
        }

        for (ApplicationLayer oldLayer : oldLevel.getLayers()) {
            ApplicationLayer newLayer = findLayer(oldLayer);
            if (newLayer != null) {
                originalToCopy.put(oldLayer, newLayer);
            }
        }

        for (Level oldChild : oldLevel.getChildren()) {
            visitLevelForMashuptransfer(oldChild, originalToCopy);
        }
    }

    private ApplicationLayer findLayer(ApplicationLayer oldLayer) {
        List<ApplicationLayer> appLayers = treeCache.applicationLayers;
        for (ApplicationLayer appLayer : appLayers) {
            if (appLayer.getService().equals(oldLayer.getService()) && appLayer.getLayerName().equals(oldLayer.getLayerName())) {
                return appLayer;
            }
        }
        return null;
    }

    private Level findLevel(Level oldLevel) {
        List<Level> levels = treeCache.levels;
        for (Level level : levels) {
            if (level.getName().equals(oldLevel.getName())) {
                return level;
            }
        }
        return null;
    }

    @PostPersist
    public void postPersist() {
        if (isMashup()) {
            log.debug("postPersist(): mashup");
            return;
        }
        processCopyMap();
    }

    @Transient
    public Map<String, Long> idMap;

    private void processCopyMap() {
        if (originalToCopy == null) {
            log.debug("postPersist(): not a copy");
            return;
        }
        idMap = getIdMap();

        originalToCopy = null;

        log.debug("Updating component configs");
        for (ConfiguredComponent comp : components) {
            if (comp.getConfig() == null) {
                continue;
            }
            log.debug(String.format("Checking component class %s, name %s", comp.getClassName(), comp.getName()));
            boolean changed = false;
            try {
                JSONObject cfg = new JSONObject(comp.getConfig());
                if (cfg.has("layers")) {
                    JSONArray layers = cfg.getJSONArray("layers");
                    for (int i = 0; i < layers.length(); i++) {
                        Long newId = idMap.get(ApplicationLayer.class + "_" + layers.getInt(i));
                        if (newId != null) {
                            log.debug(String.format("Index %d: new id for application layer %d is %d", i, layers.getInt(i), newId));
                            layers.put(i, newId.longValue());
                        } else {
                            log.debug(String.format("Index %d: old id %d was not a valid application layer in original", i, layers.getInt(i)));
                            layers.put(i, -1);
                        }
                        changed = true;
                    }
                }
                if (cfg.has("levels")) {
                    JSONArray levels = cfg.getJSONArray("levels");
                    for (int i = 0; i < levels.length(); i++) {
                        Long newId = idMap.get(Level.class + "_" + levels.getInt(i));
                        if (newId != null) {
                            log.debug(String.format("Index %d: new id for level %d is %d", i, levels.getInt(i), newId));
                            levels.put(i, newId.longValue());
                        } else {
                            log.debug(String.format("Index %d: old id %d was not a valid level in original", i, levels.getInt(i)));
                            levels.put(i, -1);
                        }
                        changed = true;
                    }
                }
                if (changed) {
                    log.debug("Old config: " + comp.getConfig());
                    comp.setConfig(cfg.toString());
                    log.debug("New config: " + comp.getConfig());
                }

            } catch (Exception ex) {
                log.error(String.format("Cannot update persistent object id's "
                        + "in component config on application copy, "
                        + "copied application=%s, component class=%s, component name=%s",
                        getNameWithVersion(),
                        comp.getClassName(),
                        comp.getName()), ex);
            }
        }
    }

    private Map<String, Long> getIdMap() {
        Map<String, Long> idMap = new HashMap();
        for (Object e : originalToCopy.entrySet()) {
            Map.Entry<Object, Object> entry = (Map.Entry<Object, Object>) e;
            Object original = entry.getKey();
            Object copy = entry.getValue();
            log.debug(String.format("postPersist(): original=%s, copy=%s", original, copy));
            if (original instanceof Level) {
                Level oL = (Level) original;
                Level cL = (Level) copy;
                idMap.put(original.getClass() + "_" + oL.getId(), cL.getId());
            } else if (original instanceof ApplicationLayer) {
                ApplicationLayer oAl = (ApplicationLayer) original;
                ApplicationLayer cAl = (ApplicationLayer) copy;
                idMap.put(original.getClass() + "_" + oAl.getId(), cAl.getId());
            }
        }
        return idMap;
    }

    public void processBookmarks(Application previousApplication, ActionBeanContext context, EntityManager em) {
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
                            clone.setCreatedBy(clone.createCreatedBy(context));
                            clone.setApplication(this);
                            processBookmark(clone, idMap);
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

    private void processBookmark(Bookmark bookmark, Map<String, Long> idMap) throws JSONException {
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

    public void removeOldProperties() {
        // In previous versions maxHeight and maxWidth where assigned to details directly
        // Now these settings are saved in globalLayout. We are removing these settings from
        // details (when present) to migrate from old layout to new layout
        if (this.details.containsKey("maxWidth")) {
            this.details.remove("maxWidth");
        }
        if (this.details.containsKey("maxHeight")) {
            this.details.remove("maxHeight");
        }
    }

    public void setGlobalLayout(String globalLayout) {
        this.details.put("globalLayout", new ClobElement(globalLayout));
    }

    public JSONObject getGlobalLayout() throws JSONException {
        JSONObject globalLayout = new JSONObject();
        if (this.getDetails().containsKey("globalLayout")) {
            globalLayout = new JSONObject(this.getDetails().get("globalLayout").getValue());
        }
        // Legacy properties
        if (!globalLayout.has("maxWidth") && this.getDetails().containsKey("maxWidth")) {
            globalLayout.put("maxWidth", this.getDetails().get("maxWidth").getValue());
        }
        if (!globalLayout.has("maxHeight") && this.getDetails().containsKey("maxHeight")) {
            globalLayout.put("maxHeight", this.getDetails().get("maxHeight").getValue());
        }
        return globalLayout;
    }
}
