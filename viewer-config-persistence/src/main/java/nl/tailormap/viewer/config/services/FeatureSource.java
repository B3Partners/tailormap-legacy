/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
package nl.tailormap.viewer.config.services;

import org.apache.commons.lang3.mutable.MutableBoolean;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OrderColumn;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@DiscriminatorColumn(name="protocol")
public abstract class FeatureSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Basic(optional=false)
    private String name;
    
    @Basic(optional=false)
    private String url;

    private String username;
    private String password;
    
    /**
     * GeoService for which this FeatureSource was automatically created - to
     * enable updating of both at the same time
     */
    @ManyToOne
    @JoinColumn(name = "linked_service")
    private GeoService linkedService;
    
    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268
    @JoinTable(
            name = "feature_source_feature_types",
            inverseJoinColumns=@JoinColumn(name="feature_type"),
            joinColumns=@JoinColumn(name = "feature_source", referencedColumnName = "id")
    )
    @OrderColumn(name="list_index")
    private List<SimpleFeatureType> featureTypes = new ArrayList<SimpleFeatureType>();

    //<editor-fold defaultstate="collapsed" desc="getters en setters">

    public List<SimpleFeatureType> getFeatureTypes() {
        return featureTypes;
    }

    public void setFeatureTypes(List<SimpleFeatureType> featureTypes) {
        this.featureTypes = featureTypes;
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

    public GeoService getLinkedService() {
        return linkedService;
    }

    public void setLinkedService(GeoService linkedService) {
        this.linkedService = linkedService;
    }
    //</editor-fold>

    public String getProtocol() {
        return getClass().getAnnotation(DiscriminatorValue.class).value();
    }    

    public SimpleFeatureType getFeatureType(String typeName) {
        for(SimpleFeatureType sft: getFeatureTypes()) {
            if(sft.getTypeName().equals(typeName)) {
                return sft;
            }
        }
        return null;
    }
    
    public SimpleFeatureType addOrUpdateFeatureType(String typeName, SimpleFeatureType newType, MutableBoolean updated) {
        SimpleFeatureType old = getFeatureType(typeName);
        if(old != null) {
            updated.setValue(old.update(newType));
            return old;
        }

        newType.setFeatureSource(this);
        getFeatureTypes().add(newType);
        
        return newType; 
    }

    public JSONObject toJSONObject() throws JSONException {
        JSONObject json = new JSONObject();
        json.put("id", this.getId());
        json.put("name",this.getName());
        json.put("protocol",this.getProtocol());
        json.put("url",this.getUrl());
        return json;
    }
}
