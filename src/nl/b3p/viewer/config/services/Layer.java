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
import org.geotools.data.ows.CRSEnvelope;
import org.json.JSONException;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class Layer {
    public static final String EXTRA_KEY_METADATA_URL = "metadata.url";
    public static final String EXTRA_KEY_METADATA_STYLESHEET_URL = "metadata.stylesheet";
    public static final String EXTRA_KEY_DOWNLOAD_URL = "download.url";
    public static final String EXTRA_KEY_FILTERABLE = "filterable";
    public static final String EXTRA_IMAGE_EXTENSION ="image_extension";
    
    private static Set<String> interestingDetails = new HashSet<String>(Arrays.asList(new String[] { 
        EXTRA_KEY_METADATA_URL, 
        EXTRA_KEY_METADATA_STYLESHEET_URL,
        EXTRA_KEY_DOWNLOAD_URL,
        EXTRA_KEY_FILTERABLE,
        EXTRA_IMAGE_EXTENSION        
    }));  
    
    private static Set<String> updatableDetails = new HashSet<String>(Arrays.asList(new String[] { 
        EXTRA_KEY_METADATA_URL       
    }));        
            
    @Id
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    private GeoService service;

    @ManyToOne(fetch=FetchType.LAZY)
    private Layer parent;

    private String name;

    private String title;

    /**
     * Alternative title, can be set by admin
     */
    private String titleAlias;

    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String legendImageUrl;

    private Double minScale;
    private Double maxScale;

    @ElementCollection
    private Set<CoordinateReferenceSystem> crsList = new HashSet<CoordinateReferenceSystem>();

    @ElementCollection
    private Map<CoordinateReferenceSystem,BoundingBox> boundingBoxes = new HashMap<CoordinateReferenceSystem,BoundingBox>();

    @ManyToOne(fetch=FetchType.LAZY)
    private TileSet tileset;

    /**
     * If a service does not have a single top layer, a virtual top layer is
     * created. A virtual layer should not be used in a request to the service.
     *
     * Also a WMS layer which does not have a name is virtual.
     */
    private boolean virtual;
    private boolean queryable;
    private boolean filterable;

    @ManyToOne(fetch=FetchType.LAZY, cascade={CascadeType.PERSIST, CascadeType.MERGE})
    private SimpleFeatureType featureType;

    @ElementCollection
    @Column(name="keyword")
    private Set<String> keywords = new HashSet<String>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> writers = new HashSet<String>();

    @OneToMany(orphanRemoval=true, cascade= CascadeType.ALL)
    @JoinTable(inverseJoinColumns=@JoinColumn(name="child"))
    @OrderColumn(name="list_index")
    private List<Layer> children = new ArrayList<Layer>();

    @ElementCollection
    private Map<String,String> details = new HashMap<String,String>();

    public Layer() {
    }
    
    public Layer(org.geotools.data.ows.Layer l, GeoService service) {
        name = l.getName();
        virtual = name == null;
        title = l.getTitle();
        minScale = l.getScaleDenominatorMin();
        this.service = service;
        if(Double.isNaN(minScale)) {
            minScale = null;
        }
        maxScale = l.getScaleDenominatorMax();
        if(Double.isNaN(maxScale)) {
            maxScale = null;
        }

        for(CRSEnvelope e: l.getLayerBoundingBoxes()) {
            BoundingBox b = new BoundingBox(e);
            boundingBoxes.put(b.getCrs(), b);
        }
        
        for(String s: l.getSrs()) {
            crsList.add(new CoordinateReferenceSystem(s));
        }
        queryable = l.isQueryable();
        if(l.getKeywords() != null) {
            keywords.addAll(Arrays.asList(l.getKeywords()));
        }
        
        if(!l.getMetadataURL().isEmpty()) {
            details.put(EXTRA_KEY_METADATA_URL, l.getMetadataURL().get(0).getUrl().toString());
        }
        
        if(l.getStyles().size() > 0 && l.getStyles().get(0).getLegendURLs().size() > 0) {
            String legendUrl = (String)l.getStyles().get(0).getLegendURLs().get(0);
            legendImageUrl = legendUrl;
        }

        for(org.geotools.data.ows.Layer child: l.getLayerChildren()) {
            Layer childLayer = new Layer(child, service);
            childLayer.setParent(this);
            children.add(childLayer);
        }             
    }
    
    protected void update(Layer update) {
        if(!getName().equals(update.getName())) {
            throw new IllegalArgumentException("Cannot update layer with properties from layer with different name!");
        }
        
        virtual = update.virtual;
        queryable = update.queryable;
        filterable = update.filterable;
        title = update.title;
        minScale = update.minScale;
        maxScale = update.maxScale;
        
        // XXX check if equals() required to avoid update statements
        if(!boundingBoxes.equals(update.boundingBoxes)) {
            boundingBoxes.clear();
            boundingBoxes.putAll(update.boundingBoxes);
        }        
        if(!crsList.equals(update.crsList)) {
            crsList.clear();
            crsList.addAll(update.crsList);
        }
        if(!keywords.equals(update.keywords)) {
            keywords.clear();
            keywords.addAll(update.keywords);
        }
        
        for(String s: updatableDetails) {
            details.remove(s);
        }
        details.putAll(update.getDetails());
        
        legendImageUrl = update.legendImageUrl;
        
        // tileSet ignored -- only for tile services!
    }

    /**
     * Copy user modified properties of given layer onto this instance. Used for
     * updating the topLayer. Not called for other layers, those instances are 
     * updated with update().
     */
    protected void copyUserModifiedProperties(Layer other) {     
        setTitleAlias(other.getTitleAlias());
        getReaders().clear();
        getReaders().addAll(other.getReaders());
        getWriters().clear();
        getWriters().addAll(other.getWriters());
    }
    
    /**
     * Clone this layer and remove it from the tree of the GeoService this Layer
     * is part of. Used for updating service, call only on non-persistent objects.
     * @return a clone of this Layer with its parent and service set to null and
     * children set to a new, empty list. 
     */
    public Layer pluckCopy() {
        if(Stripersist.getEntityManager().contains(this)) {
            throw new IllegalStateException();
        }
        try {
            Layer clone = (Layer)super.clone();
            clone.setParent(null);
            clone.setChildren(new ArrayList());
            clone.setService(null);
            return clone;
        } catch(CloneNotSupportedException e) {
            return null;
        }
    }

    /**
     * Checks if the layer is bufferable.
     * if service type of this layer is ArcIms or ArcGis or if the layer has a featuretype
     * return true, otherwise return false
     */
    public boolean isBufferable(){
        return getService().getProtocol().equals(ArcIMSService.PROTOCOL) || 
                this.getFeatureType() != null;
    }

    public interface Visitor {
        public boolean visit(Layer l);
    }

    /**
     * Do a depth-first traversal while the visitor returns true. Uses the call
     * stack to save layers yet to visit.
     * @return true if visitor accepted all layers
     */
    public boolean accept(Layer.Visitor visitor) {
        for(Layer child: getCachedChildren()) {
            if(!child.accept(visitor)) {
                return false;
            }
        }
        return visitor.visit(this);
    }
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();
        
        o.put("id", id);
        o.put("serviceId", service.getId());
        o.put("name", name);
        
        o.put("virtual", virtual);
        o.put("queryable", queryable);
        o.put("filterable", filterable);       
        
        if(title != null) {
            o.put("title", title);
        }
        if(titleAlias != null) {
            o.put("titleAlias", titleAlias);
        }
        if(legendImageUrl != null) {
            o.put("legendImageUrl", legendImageUrl);
        }
        if(minScale != null) {
            o.put("minScale", minScale);
        }
        if(maxScale != null) {
            o.put("maxScale", maxScale);
        }
        
        o.put("hasFeatureType", featureType != null);
        
        /* Only include "interesting" details in JSON */
        
        if(!details.isEmpty()) {
            JSONObject d = new JSONObject();
            o.put("details", d);
            for(Map.Entry<String,String> e: details.entrySet()) {
                if(interestingDetails.contains(e.getKey())) {
                    d.put(e.getKey(), e.getValue());
                }
            }        
        }
        
        if (tileset!=null){
            o.put("tileHeight",tileset.getHeight());
            o.put("tileWidth",tileset.getWidth());
            if (tileset.getResolutions()!=null){
                String resolutions="";
                for (Double d : tileset.getResolutions()){
                    if (resolutions.length()>0){
                        resolutions+=",";
                    }
                    resolutions+=d.toString();
                }
                o.put("resolutions",resolutions);
            }
            if (boundingBoxes.size()==1){
                BoundingBox bbox=boundingBoxes.values().iterator().next();
                o.put("bbox",bbox.toJSONObject());
            }
            
        }
        
        
        return o;
    }

    public List<Layer> getCachedChildren() {        
        return service.getLayerChildrenCache(this);
    }
    
    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public Layer getParent() {
        return parent;
    }

    public void setParent(Layer parent) {
        this.parent = parent;
    }

    public boolean isVirtual() {
        return virtual;
    }

    public void setVirtual(boolean virtual) {
        this.virtual = virtual;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitleAlias() {
        return titleAlias;
    }

    public void setTitleAlias(String titleAlias) {
        this.titleAlias = titleAlias;
    }

    public GeoService getService() {
        return service;
    }

    public void setService(GeoService service) {
        this.service = service;
    }

    public Set<CoordinateReferenceSystem> getCrsList() {
        return crsList;
    }

    public void setCrsList(Set<CoordinateReferenceSystem> crsList) {
        this.crsList = crsList;
    }

    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }

    public boolean isFilterable() {
        return filterable;
    }

    public void setFilterable(boolean filterable) {
        this.filterable = filterable;
    }

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

    public boolean isQueryable() {
        return queryable;
    }

    public void setQueryable(boolean queryable) {
        this.queryable = queryable;
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

    public List<Layer> getChildren() {
        return children;
    }
    
    public void setChildren(List<Layer> children) {
        this.children = children;
    }

    public Set<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(Set<String> keywords) {
        this.keywords = keywords;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }

    public Double getMaxScale() {
        return maxScale;
    }

    public void setMaxScale(Double maxScale) {
        this.maxScale = maxScale;
    }

    public Double getMinScale() {
        return minScale;
    }

    public void setMinScale(Double minScale) {
        this.minScale = minScale;
    }

    public TileSet getTileset() {
        return tileset;
    }

    public void setTileset(TileSet tileset) {
        this.tileset = tileset;
    }    

    public String getLegendImageUrl() {
        return legendImageUrl;
    }

    public void setLegendImageUrl(String legendImageUrl) {
        this.legendImageUrl = legendImageUrl;
    }

    public Map<CoordinateReferenceSystem, BoundingBox> getBoundingBoxes() {
        return boundingBoxes;
    }

    public void setBoundingBoxes(Map<CoordinateReferenceSystem, BoundingBox> boundingBoxes) {
        this.boundingBoxes = boundingBoxes;
    }
    //</editor-fold>
}
