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
import nl.b3p.viewer.config.app.Level;
import nl.b3p.web.WaitPageStatus;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class GeoService {
    public static final String PARAM_PERSIST_FEATURESOURCE = "persistFeatureSource";
    
    @Id
    private Long id;

    @Basic(optional=false)
    private String name;

    @ManyToOne(fetch=FetchType.LAZY)
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

    public GeoService loadFromUrl(String url, Map params) throws Exception {
        return loadFromUrl(url, params, new WaitPageStatus());
    }

    public abstract GeoService loadFromUrl(String url, Map params, WaitPageStatus waitStatus) throws Exception;
    
    public String getProtocol() {
        return getClass().getAnnotation(DiscriminatorValue.class).value();
    }
    
    public JSONObject toJSONObject(boolean flattenTree, Set<String> layersToInclude) throws JSONException {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("name", name);
        o.put("url", url);
        o.put("protocol", getProtocol());
        
        if(topLayer != null) {
            Map<Layer,List<Layer>> childrenByParent = null;
            
            if(Stripersist.getEntityManager().contains(this)) {
                // XXX Oracle specific
                // Retrieve layer tree structure in single query
                List<Layer> layerEntities = Stripersist.getEntityManager().createNativeQuery(
                    "select * from layer start with id = :rootId connect by parent = prior id",
                    Layer.class)
                    .setParameter("rootId", topLayer.getId())
                    .getResultList();   

                childrenByParent = new HashMap<Layer,List<Layer>>();            
                for(Layer l: layerEntities) {               
                    if(l.getParent() != null) {
                        List<Layer> parentChildren = childrenByParent.get(l.getParent());
                        if(parentChildren == null) {
                            parentChildren = new ArrayList<Layer>();
                            childrenByParent.put(l.getParent(), parentChildren);
                        }
                        parentChildren.add(l);
                    }
                }            

                // Prevent n+1 queries
                /* Currently disabled as Layer.details is not included in JSON at
                * the moment. Reenable this when it is required
                *
                Stripersist.getEntityManager().createQuery("from Layer l "
                        + "left join fetch l.details "
                        + "where l in (:layers)")
                        .setParameter("layers", layerEntities)
                        .getResultList();
                */
            }

            if(flattenTree) {
                JSONObject layers = new JSONObject();
                o.put("layers", layers);
                walkLayerJSONFlatten(topLayer, layers, childrenByParent, layersToInclude);
            } else {
                o.put("topLayer", walkLayerJSONTree(topLayer, childrenByParent));
            }
            
        }
        return o;
    }
    
    private static void walkLayerJSONFlatten(Layer l, JSONObject layers, Map<Layer,List<Layer>> childrenByParent, Set<String> layersToInclude) throws JSONException {

        /* TODO check readers (and include readers in n+1 prevention query */
        
        /* Flatten tree structure, currently depth-first - later traversed layers
        * do not overwrite earlier layers with the same name - do not include
        * virtual layers
        */

        if(layersToInclude == null || layersToInclude.contains(l.getName())) {
            if(!l.isVirtual() && !layers.has(l.getName())) {
                layers.put(l.getName(), l.toJSONObject());
            }
        }
        
        List<Layer> children = childrenByParent == null ? l.getChildren() : childrenByParent.get(l);
        if(children != null) {        
            for(Layer child: children) {                
                walkLayerJSONFlatten(child, layers, childrenByParent, layersToInclude);
            }
        }
    }
    
    private static JSONObject walkLayerJSONTree(Layer l, Map<Layer,List<Layer>> childrenByParent) throws JSONException {
        JSONObject j = l.toJSONObject();
        
        List<Layer> children = childrenByParent == null ? l.getChildren() : childrenByParent.get(l);
        if(children != null) {        
            JSONArray jc = new JSONArray();
            j.put("children", jc);
            for(Layer child: children) {                
                jc.put(walkLayerJSONTree(child, childrenByParent));
            }
        }
        return j;
    }
    
    public JSONObject toJSONObject(boolean flattenTree) throws JSONException {
        return toJSONObject(flattenTree, null);
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
