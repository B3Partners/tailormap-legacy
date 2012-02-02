/*
 * Copyright (C) 2012 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import javax.persistence.*;
import java.util.*;
import nl.b3p.viewer.config.services.GeoService;

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class ApplicationLayer {
    @Id
    private Long id;

    /**
     * Should this app layer be visible in the application by default
     */    
    private boolean checked;
    
    /**
     * Should this app layer be shown in a table of contents by default
     */    
    private boolean toc;

    @ManyToOne
    private GeoService service;

    /**
     * Not direct association to a layer but the name of the layer. No foreign
     * key so the GeoService layers can be refreshed without breaking relations.
     * Although the name of a layer is not guaranteed unique, ignore this for
     * now.
     */
    @Basic(optional=false)
    private String layerName;

    @ElementCollection
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> writers = new HashSet<String>();

    @ElementCollection
    private Map<String,String> details = new HashMap<String,String>();

    @OneToMany(orphanRemoval=true, cascade=CascadeType.ALL)
    @JoinTable(inverseJoinColumns=@JoinColumn(name="attribute_"))
    @OrderColumn(name="list_index")
    private List<ConfiguredAttribute> attributes = new ArrayList<ConfiguredAttribute>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public List<ConfiguredAttribute> getAttributes() {
        return attributes;
    }
    
    public void setAttributes(List<ConfiguredAttribute> attributes) {
        this.attributes = attributes;
    }
    
    public boolean isChecked() {
        return checked;
    }
    
    public void setChecked(boolean checked) {
        this.checked = checked;
    }

    public boolean isToc() {
        return toc;
    }

    public void setToc(boolean toc) {
        this.toc = toc;
    }
    
    public Map<String, String> getDetails() {
        return details;
    }
    
    public void setDetails(Map<String, String> details) {
        this.details = details;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Set<String> getReaders() {
        return readers;
    }
    
    public void setReaders(Set<String> readers) {
        this.readers = readers;
    }
    
    public Set<String> getWriters() {
        return writers;
    }
    
    public void setWriters(Set<String> writers) {
        this.writers = writers;
    }
    
    
    public GeoService getService() {
        return service;
    }
    
    public void setService(GeoService service) {
        this.service = service;
    }
    
    public String getLayerName() {
        return layerName;
    }
    
    public void setLayerName(String layerName) {
        this.layerName = layerName;
    }
    //</editor-fold> 
}
