/*
 * Copyright (C) 2011-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.config.ClobElement;
import nl.tailormap.viewer.config.security.User;
import nl.tailormap.viewer.config.services.BoundingBox;
import nl.tailormap.viewer.util.ApplicationDetailsValueTransformer;
import nl.tailormap.viewer.util.DB;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hibernate.Session;
import org.hibernate.annotations.Type;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.PostPersist;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
public class Application implements Comparable<Application>{

    private static final Log log = LogFactory.getLog(Application.class);

    // Details keys
    public static final String DETAIL_IS_MASHUP = "isMashup";
    public static final String DETAIL_GLOBAL_LAYOUT = "globalLayout";
    public static final String DETAIL_LAST_SPINUP_TIME = "lastSpinupTime";

    public static Set adminOnlyDetails = new HashSet<>(Arrays.asList("opmerking"));

    public static final Set<String> preventClearDetails = new HashSet<>(Arrays.asList(DETAIL_IS_MASHUP,
            DETAIL_GLOBAL_LAYOUT));

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic(optional = false)
    private String name;

    @Column(length = 30)
    private String version;

    @Column()
    private String title;

    @Column()
    // lang instead of language because language can be a reserved word in some SQL versions
    private String lang;
    @Lob
    @Type(type = "org.hibernate.type.TextType")
    private String layout;

    @ElementCollection
    @JoinTable(joinColumns = @JoinColumn(name = "application"))
    // Element wrapper required because of http://opensource.atlassian.com/projects/hibernate/browse/JPA-11
    private Map<String, ClobElement> details = new HashMap<>();

    @ManyToOne
    @JoinColumn(name = "owner")
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
    @JoinColumn(name = "root")
    private Level root;

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private Set<ConfiguredComponent> components = new HashSet<>();

    @Basic(optional = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date authorizationsModified = new Date();

    /**
     * Map (populated in deepCopy()) of the original persistant object from the
     * copy source Application to the new object in this copy used for updating
     * the references in component JSON config using id's in postPersist().
     */
    @Transient
    public Map originalToCopy;

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private List<Bookmark> bookmarks = new ArrayList<>();

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private List<StartLayer> startLayers = new ArrayList<>();

    @OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, mappedBy = "application")
    private List<StartLevel> startLevels = new ArrayList<>();

    @ElementCollection
    @CollectionTable(joinColumns = @JoinColumn(name = "application"))
    @Column(name = "role_name")
    private Set<String> readers = new HashSet<>();
    private String projectionCode;

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

    public String getTitle() {
        return title;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getLang() {
        return lang;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getProjectionCode() {
        return projectionCode;
    }

    public void setProjectionCode(String projectionCode) {
        this.projectionCode = projectionCode;
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

    @Override
    public int compareTo(Application o) {
        if(o != null){
            return o.getId().compareTo(this.getId());
        }else{
            return -1;
        }
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
                        parentChildren = new ArrayList<>();
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

    /**
     * keep a cached copy of our mashup status.
     */
    @Transient
    public Boolean isMashup_cached;

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
                    .setParameter("appId", this.getId())
                    .setResultTransformer(ApplicationDetailsValueTransformer.INSTANCE)
                    .list();
            if (items.size() > 0) {
                String mashupValue = items.get(0).get("value").toString();
                this.isMashup_cached = Boolean.valueOf(mashupValue);
            }
        }
        return this.isMashup_cached;
    }


    public ApplicationLayer findLayer(ApplicationLayer oldLayer) {
        List<ApplicationLayer> appLayers = treeCache.applicationLayers;
        for (ApplicationLayer appLayer : appLayers) {
            if (appLayer.getService().equals(oldLayer.getService()) && appLayer.getLayerName().equals(oldLayer.getLayerName())) {
                return appLayer;
            }
        }
        return null;
    }

    public Level findLevel(Level oldLevel) {
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

    public void processCopyMap() {
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
