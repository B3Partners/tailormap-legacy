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

import java.io.IOException;
import java.util.*;
import javax.persistence.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="feature_type")
@org.hibernate.annotations.Entity(dynamicUpdate = true)
public class SimpleFeatureType {
    public static final int MAX_FEATURES_DEFAULT = 250;
    public static final int MAX_FEATURES_UNBOUNDED = -1;
    
    @Id
    private Long id;

    @ManyToOne(cascade=CascadeType.PERSIST)
    private FeatureSource featureSource;    
    
    private String typeName;
    
    private String description;
    
    private boolean writeable;

    private String geometryAttribute;
    
    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(inverseJoinColumns=@JoinColumn(name="attribute_descriptor"))
    @OrderColumn(name="list_index")
    private List<AttributeDescriptor> attributes = new ArrayList<AttributeDescriptor>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">
    public List<AttributeDescriptor> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<AttributeDescriptor> attributes) {
        this.attributes = attributes;
    }

    public FeatureSource getFeatureSource() {
        return featureSource;
    }

    public void setFeatureSource(FeatureSource featureSource) {
        this.featureSource = featureSource;
    }

    public String getGeometryAttribute() {
        return geometryAttribute;
    }

    public void setGeometryAttribute(String geometryAttribute) {
        this.geometryAttribute = geometryAttribute;
    }

    public boolean isWriteable() {
        return writeable;
    }

    public void setWriteable(boolean writeable) {
        this.writeable = writeable;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    //</editor-fold>
    
    public Object getMaxValue ( String attributeName )throws Exception {
        return featureSource.getMaxValue(this, attributeName, MAX_FEATURES_DEFAULT);
    }
    
    public Object getMaxValue ( String attributeName, int maxFeatures )throws Exception {
        return featureSource.getMaxValue(this, attributeName, maxFeatures);
    }
    
    public Object getMinValue ( String attributeName )throws Exception {
        return featureSource.getMinValue(this, attributeName, MAX_FEATURES_DEFAULT);
    }
    
    public Object getMinValue ( String attributeName, int maxFeatures )throws Exception {
        return featureSource.getMinValue(this, attributeName, maxFeatures);
    }
    
    public List<String> calculateUniqueValues(String attributeName) throws Exception {
        return featureSource.calculateUniqueValues(this, attributeName, MAX_FEATURES_DEFAULT);
    }    
    
    public List<String> calculateUniqueValues(String attributeName, int maxFeatures) throws Exception {
        return featureSource.calculateUniqueValues(this, attributeName, maxFeatures);
    }    
    
    public org.geotools.data.FeatureSource openGeoToolsFeatureSource() throws Exception {
        return featureSource.openGeoToolsFeatureSource(this);
    }

    public org.geotools.data.FeatureSource openGeoToolsFeatureSource(int timeout) throws Exception {
        return featureSource.openGeoToolsFeatureSource(this, timeout);
    }    
    
    public void update(SimpleFeatureType update) {
        if(!getTypeName().equals(update.getTypeName())) {
            throw new IllegalArgumentException("Cannot update feature type with properties from feature type with different type name!");
        }        

        description = update.description;
        writeable = update.writeable;
        geometryAttribute = update.geometryAttribute;
        
        if(!attributes.equals(update.attributes)) {
            attributes.clear();
            attributes.addAll(update.attributes);
        }                
    }
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("typeName", typeName);
        o.put("writeable", writeable);
        o.put("geometryAttribute", geometryAttribute);
        
        JSONArray atts = new JSONArray();
        o.put("attributes", atts);
        for(AttributeDescriptor a: attributes) {
            JSONObject ja = new JSONObject();
            ja.put("id", a.getId());
            ja.put("name", a.getName());
            ja.put("alias", a.getAlias());
            ja.put("type", a.getType());
            atts.put(ja);
        }
        return o;
    }
}

