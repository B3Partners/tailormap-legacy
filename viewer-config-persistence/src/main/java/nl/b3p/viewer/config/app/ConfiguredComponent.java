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
package nl.b3p.viewer.config.app;

import java.util.*;
import javax.persistence.*;
import nl.b3p.viewer.components.ComponentRegistry;
import nl.b3p.viewer.components.ViewerComponent;
import org.apache.commons.beanutils.BeanUtils;
import org.json.JSONException;
import org.json.JSONObject;

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
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String config;

    @Basic(optional=false)
    private String className;

    @ElementCollection
    private Map<String,String> details = new HashMap<String,String>();

    @ManyToOne(optional=false)
    private Application application;

    @ElementCollection
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    @ManyToOne
    private ConfiguredComponent motherComponent;

    @OneToMany(mappedBy = "motherComponent")
    private List<ConfiguredComponent> linkedComponents = new ArrayList<ConfiguredComponent>();
    
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


    public final static List<String> classesExcludedFromPushing = new ArrayList<String>();
    static {
        classesExcludedFromPushing.add("viewer.components.HTML");
    }
    
    /**
     * Retrieve the metadata from the component registry for the class of this
     * component.
     *
     * @return the configured ViewerComponent for this component
     */
    public ViewerComponent getViewerComponent() {
        return ComponentRegistry.getInstance().getViewerComponent(className);
    }

    public JSONObject toJSON() throws JSONException {
        JSONObject o = new JSONObject();
        o.put("name", name);
        o.put("className", className);

        JSONObject d = new JSONObject();
        o.put("details", d);
        for(Map.Entry<String,String> e: details.entrySet()) {
            d.put(e.getKey(), e.getValue());
        }

        o.put("config", config == null ? new JSONObject() : new JSONObject(config));
        return o;
    }

    @Override
    public int compareTo(ConfiguredComponent rhs) {
        return className.compareTo(rhs.getClassName());
    }

    ConfiguredComponent deepCopy(Application app) throws Exception {
        ConfiguredComponent copy = (ConfiguredComponent) BeanUtils.cloneBean(this);
        copy.setId(null);
        copy.setDetails(new HashMap<String,String>(details));
        copy.setReaders(new HashSet<String>(readers));
        copy.setLinkedComponents(new ArrayList<ConfiguredComponent>());
        copy.setApplication(app);
        return copy;
    }
}
