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

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="feature_type")
public abstract class SimpleFeatureType {
    public static final int MAX_FEATURES_DEFAULT = 0;
    public static final int MAX_FEATURES_UNBOUNDED = -1;
    
    @Id
    private Long id;

    @ManyToOne
    private FeatureSource featureSource;    
    
    private String typeName;
    
    private boolean writeable;

    private String geometryAttribute;

    @OneToMany(orphanRemoval=true)
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
    //</editor-fold>
    
    public List<String> calculateUniqueValues(String attributeName) throws IOException {
        return calculateUniqueValues(attributeName, MAX_FEATURES_DEFAULT);
    }
    
    public abstract List<String> calculateUniqueValues(String attributeName, int maxFeatures) throws IOException;    
}

