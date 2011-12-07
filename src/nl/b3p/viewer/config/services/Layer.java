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

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class Layer {
    public static final String EXTRA_KEY_METADATA_URL = "metadata.url";
    public static final String EXTRA_KEY_METADATA_STYLESHEET_URL = "metadata.stylesheet";
    
    @Id
    private Long id;

    @ManyToOne
    private GeoService service;

    @ManyToOne
    private Layer parent;

    @Basic(optional=false)
    private String name;

    private Double minScale;
    private Double maxScale;

    @Embedded
    private Envelope extent;

    @ManyToOne
    private TileSet tileset;

    private boolean queryable;
    private boolean filterable;

    @OneToOne(fetch=FetchType.LAZY, mappedBy="layer", orphanRemoval=true)
    private SimpleFeatureType featureType;

    @ElementCollection
    @Column(name="role_name")
    private Set<String> readers = new HashSet<String>();

    @ElementCollection
    @Column(name="role_name")
    private Set<String> writers = new HashSet<String>();

    @OneToMany(orphanRemoval=true, mappedBy="parent")
    @OrderColumn
    private List<Layer> children = new ArrayList<Layer>();

    @ElementCollection
    private Map<String,String> extraInfo = new HashMap<String,String>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public Layer getParent() {
        return parent;
    }

    public void setParent(Layer parent) {
        this.parent = parent;
    }

    public GeoService getService() {
        return service;
    }

    public void setService(GeoService service) {
        this.service = service;
    }

    public Envelope getExtent() {
        return extent;
    }

    public void setExtent(Envelope extent) {
        this.extent = extent;
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

    public Map<String, String> getExtraInfo() {
        return extraInfo;
    }

    public void setExtraInfo(Map<String, String> extraInfo) {
        this.extraInfo = extraInfo;
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
    //</editor-fold>
}
