/*
 * Copyright (C) 2011 B3Partners B.V.
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
package nl.b3p.viewer.config.services;

import java.util.*;
import javax.persistence.*;
import nl.b3p.web.WaitPageStatus;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class GeoService {
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @ManyToOne
    private Category category;

    @Basic(optional=false)
    private String url;

    private String username;
    private String password;

    private boolean monitoringEnabled;

    @OneToOne(orphanRemoval=true, cascade=CascadeType.ALL)
    private Layer topLayer;

    @ElementCollection
    @Column(name="keyword")
    private Set<String> keywords = new HashSet<String>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Layer getTopLayer() {
        return topLayer;
    }

    public void setTopLayer(Layer topLayer) {
        this.topLayer = topLayer;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(Set<String> keywords) {
        this.keywords = keywords;
    }

    public boolean isMonitoringEnabled() {
        return monitoringEnabled;
    }

    public void setMonitoringEnabled(boolean monitoringEnabled) {
        this.monitoringEnabled = monitoringEnabled;
    }
    //</editor-fold>

    public GeoService loadFromUrl(String url) throws Exception {
        return loadFromUrl(url, new WaitPageStatus());
    }

    public abstract GeoService loadFromUrl(String url, WaitPageStatus waitStatus) throws Exception;
    
    public String getProtocol() {
        return getClass().getAnnotation(DiscriminatorValue.class).value();
    }
    
    public JSONObject toJSONObject(Set<String> layersToInclude) throws JSONException {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("name", name);
        o.put("url", url);
        o.put("protocol", getProtocol());
        
        if(topLayer != null) {
            JSONObject layers = new JSONObject();
            o.put("layers", layers);
            addLayerJSON(topLayer, layers, layersToInclude);
        }
        return o;
    }
    
    private static void addLayerJSON(Layer l, JSONObject layers, Set<String> layersToInclude) throws JSONException {

        /* TODO check readers */
        
        /* Flatten tree structure, currently depth-first - later traversed layers
         * do not overwrite earlier layers with the same name - do not include
         * virtual layers
         */
        
        if(layersToInclude == null || layersToInclude.contains(l.getName())) {
            if(!l.isVirtual() && !layers.has(l.getName())) {
                layers.put(l.getName(), l.toJSONObject());
            }
        }
                
        for(Layer child: l.getChildren()) {
            addLayerJSON(child, layers, layersToInclude);
        }
    }
    
    public JSONObject toJSONObject() throws JSONException {
        return toJSONObject(null);
    }

    /**
     * Returns the layer with the given name in this server
     * @param layerName The layer name
     * @return the Layer or null if not found
     */
    public Layer getLayer(String layerName) {
        return getLayer(layerName,topLayer);
    }
    /**
     * Returns the layer in the given Layer (inLayer) with the given layerName
     * @param layerName the name of the layer
     * @param inLayer the layer to search in
     * @return the Layer with name == layerName or null if not found
     */
    private Layer getLayer(String layerName,Layer inLayer){  
        if (layerName==null)
            return null;
        if(layerName.equals(inLayer.getName()))
            return inLayer;
        //walk through layers
        Layer returnLayer=null;        
        for (Layer layer : inLayer.getChildren()){
            returnLayer= getLayer(layerName,layer);
            if(returnLayer!=null){
                return returnLayer;
            }
        }
        return returnLayer;            
    }
    

}
