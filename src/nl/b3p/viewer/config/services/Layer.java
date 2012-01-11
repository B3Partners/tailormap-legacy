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

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class Layer {
    public static final String EXTRA_KEY_METADATA_URL = "metadata.url";
    public static final String EXTRA_KEY_METADATA_STYLESHEET_URL = "metadata.stylesheet";
    public static final String EXTRA_KEY_DOWNLOAD_URL = "download.url";
    
    @Id
    private Long id;

    @ManyToOne
    private GeoService service;

    @ManyToOne
    private Layer parent;

    private String name;

    private String title;

    /**
     * Alternative title, can be set by admin
     */
    private String titleAlias;

    private String legendImageUrl;

    private Double minScale;
    private Double maxScale;

    @ElementCollection
    private Set<CoordinateReferenceSystem> crsList = new HashSet<CoordinateReferenceSystem>();

    @ElementCollection
    private Map<CoordinateReferenceSystem,BoundingBox> boundingBoxes = new HashMap<CoordinateReferenceSystem,BoundingBox>();

    @ManyToOne
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

    @ManyToOne
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
    
    public Layer(org.geotools.data.ows.Layer l) {
        name = l.getName();
        title = l.getTitle();
        minScale = l.getScaleDenominatorMin();
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

        for(org.geotools.data.ows.Layer child: l.getLayerChildren()) {
            children.add(new Layer(child));
        }
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
