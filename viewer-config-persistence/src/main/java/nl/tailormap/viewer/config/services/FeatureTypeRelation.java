/*
 * Copyright (C) 2013 B3Partners B.V.
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Roy Braam
 */
@Entity
public class FeatureTypeRelation {
    public static final String JOIN = "join";
    public static final String RELATE = "relate";
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "feature_type")
    private SimpleFeatureType featureType;
    
    @ManyToOne
    @JoinColumn(name = "foreign_feature_type")
    private SimpleFeatureType foreignFeatureType;
        
    @OneToMany(cascade=CascadeType.ALL, mappedBy="relation", orphanRemoval=true)
    private List<FeatureTypeRelationKey> relationKeys = new ArrayList<FeatureTypeRelationKey>();
    
    private String type;

    private boolean searchNextRelation;

    private boolean canCreateNewRelation;

    //<editor-fold defaultstate="collapsed" desc="Getters/Setters">
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public SimpleFeatureType getFeatureType() {
        return featureType;
    }
    
    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }
    
    public List<FeatureTypeRelationKey> getRelationKeys() {
        return relationKeys;
    }
    
    public void setRelationKeys(List<FeatureTypeRelationKey> relationKeys) {
        this.relationKeys = relationKeys;
    }
    
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public SimpleFeatureType getForeignFeatureType() {
        return foreignFeatureType;
    }

    public void setForeignFeatureType(SimpleFeatureType foreignFeatureType) {
        this.foreignFeatureType = foreignFeatureType;
    }

    public boolean isSearchNextRelation() {
        return searchNextRelation;
    }

    public void setSearchNextRelation(boolean searchNextRelation) {
        this.searchNextRelation = searchNextRelation;
    }

    public boolean isCanCreateNewRelation() { return canCreateNewRelation; }

    public void setCanCreateNewRelation(boolean canCreateNewRelation) { this.canCreateNewRelation = canCreateNewRelation; }
    //</editor-fold>

    public JSONObject toJSONObject(SimpleFeatureType head) throws JSONException {
        JSONObject j = new JSONObject();
        j.put("type",type); 
        if (this.featureType!=null){
            j.put("featureType", this.featureType.getId());
            j.put("featureTypeName", this.featureType.getTypeName());
            j.put("featureTypePrimaryKeyAttribute", this.featureType.getPrimaryKeyAttribute());
            JSONArray keys = new JSONArray();
            j.put("relationKeys", keys);
            relationKeys.forEach(key -> {
                keys.put(key.toJSONObject());
            });
        }
        if (this.foreignFeatureType!=null){
            j.put("foreignFeatureType", this.foreignFeatureType.getId());
            j.put("foreignFeatureTypeName", this.foreignFeatureType.getTypeName());
            j.put("foreignFeatureTypePrimaryKeyAttribute", this.foreignFeatureType.getPrimaryKeyAttribute());
            JSONArray jRel = new JSONArray();
            if (!this.foreignFeatureType.getRelations().isEmpty() && this.isSearchNextRelation() && !head.getTypeName().equals(this.foreignFeatureType.getTypeName())){
                j.put("relations",jRel);
                for (FeatureTypeRelation rel : this.foreignFeatureType.getRelations()){
                    jRel.put(rel.toJSONObject(head));
                }
            }
        }
        return j;
    }

}
