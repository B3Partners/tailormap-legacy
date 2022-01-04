/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import org.apache.commons.beanutils.BeanUtils;
import org.hibernate.annotations.Type;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.Basic;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(
        uniqueConstraints=
            @UniqueConstraint(columnNames={"name", "application"})
)
public class ConfiguredComponent implements Comparable<ConfiguredComponent> {
    /**
     * {@value #ADMIN_ONLY} magic prefix for "admin only" config attributes.
     */
    public static final String ADMIN_ONLY = "adminOnly";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic(optional=false)
    private String name;

    @Lob
    @Type(type = "org.hibernate.type.TextType")
    private String config;

    @Basic(optional=false)
    private String className;

    @ElementCollection
    @CollectionTable(joinColumns = @JoinColumn(name = "configured_component"))
    private Map<String,String> details = new HashMap<>();

    @ManyToOne(optional=false)
    @JoinColumn(name = "application")
    private Application application;

    @ElementCollection
    @Column(name="role_name")
    @CollectionTable(joinColumns = @JoinColumn(name = "configured_component"))
    private Set<String> readers = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "mother_component")
    private ConfiguredComponent motherComponent;

    @OneToMany(mappedBy = "motherComponent")
    private List<ConfiguredComponent> linkedComponents = new ArrayList<>();
    
    //<editor-fold defaultstate="collapsed" desc="getters and setters">
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

    public Set<String> getReaders() {
        return readers;
    }

    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public ConfiguredComponent getMotherComponent() {
        return motherComponent;
    }

    public void setMotherComponent(ConfiguredComponent motherComponent) {
        this.motherComponent = motherComponent;
    }

    public List<ConfiguredComponent> getLinkedComponents() {
        return linkedComponents;
    }

    public void setLinkedComponents(List<ConfiguredComponent> linkedComponents) {
        this.linkedComponents = linkedComponents;
    }
    
    //</editor-fold>

    public final static List<String> classesExcludedFromPushing = new ArrayList<>();
    static {
        classesExcludedFromPushing.add("viewer.components.HTML");
    }

    /**
     * @return a JSON representation of this component
     * @throws JSONException if any
     * @deprecated use {@link #toJSON(boolean)}
     */
    @Deprecated
    public JSONObject toJSON() throws JSONException {
        return this.toJSON(false);
    }

    /**
     * render a JSON representation of this component.
     *
     * @param hideAdminOnly set to {@code true} to obtain this component JSON representation without any "admin-only"
     *                     attributes.
     * @return a JSON representation of this component
     * @throws JSONException if ant
     */
    public JSONObject toJSON(boolean hideAdminOnly) throws JSONException {
        JSONObject o = new JSONObject();
        o.put("name", name);
        o.put("className", className);

        JSONObject d = new JSONObject();
        o.put("details", d);
        for(Map.Entry<String,String> e: details.entrySet()) {
            d.put(e.getKey(), e.getValue());
        }

        o.put("config", config == null ? new JSONObject() : new JSONObject(config));
        if (hideAdminOnly) {
            // remove any config keys starting with adminOnly
            JSONObject c = o.getJSONObject("config");
            List<String> removeKeys = new ArrayList<>();
            for (String key : c.keySet()) {
                if (key.startsWith(ADMIN_ONLY)) {
                    removeKeys.add(key);
                }
            }
            for (String key : removeKeys) {
                c.remove(key);
            }
        }
        return o;
    }

    @Override
    public int compareTo(ConfiguredComponent rhs) {
        return className.compareTo(rhs.getClassName());
    }

    public ConfiguredComponent deepCopy(Application app) throws Exception {
        ConfiguredComponent copy = (ConfiguredComponent) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setDetails(new HashMap<>(details));
        copy.setReaders(new HashSet<>(readers));
        copy.setLinkedComponents(new ArrayList<>());
        copy.setApplication(app);
        return copy;
    }
}
