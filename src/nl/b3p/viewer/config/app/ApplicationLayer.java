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
import nl.b3p.viewer.config.services.Layer;
import org.apache.commons.beanutils.BeanUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

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
    
    private Integer selectedIndex;   

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

    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268    
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

    public Integer getSelectedIndex() {
        return selectedIndex;
    }

    public void setSelectedIndex(Integer selectedIndex) {
        this.selectedIndex = selectedIndex;
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
    
    public ConfiguredAttribute getAttribute(String name) {
        for(ConfiguredAttribute att: attributes) {
            if(att.getAttributeName().equals(name)) {
                return att;
            }
        }
        return null;
    }

    public JSONObject toJSONObject() throws JSONException {

        JSONObject o = new JSONObject();
        o.put("id", getId());
        o.put("checked", isChecked());
        o.put("layerName", getLayerName());
        if(getService() != null) {
            o.put("serviceId", getService().getId());
            //try to get the alias.
            Layer layer=getService().getLayer(this.getLayerName());
            if (layer!=null){
                String alias=layer.getName();
                if (layer.getTitleAlias()!=null){
                    alias=layer.getTitleAlias();
                }else if (layer.getTitle()!=null){
                    alias=layer.getTitle();
                }
                o.put("alias",alias);
            }
            
        }

        /* TODO add attribute if writeable according to al.getWriters() */

        if(!getDetails().isEmpty()) {
            JSONObject d = new JSONObject();
            o.put("details", d);
            for(Map.Entry<String,String> e: getDetails().entrySet()) {
                d.put(e.getKey(), e.getValue());
            }
        }

        return o;
    }

    ApplicationLayer deepCopy() throws Exception {
        ApplicationLayer copy = (ApplicationLayer) BeanUtils.cloneBean(this);
        copy.setId(null);
        
        // service reference is not deep copied, of course
        
        copy.setReaders(new HashSet<String>(readers));
        copy.setWriters(new HashSet<String>(writers));
        copy.setDetails(new HashMap<String,String>(details));
        
        copy.setAttributes( new ArrayList<ConfiguredAttribute>());
        for(ConfiguredAttribute a: attributes) {
            copy.getAttributes().add(a.deepCopy());
        }
        return copy;
    }
}
