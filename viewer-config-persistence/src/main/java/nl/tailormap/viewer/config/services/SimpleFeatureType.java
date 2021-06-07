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

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import javax.persistence.Table;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 *
 * @author Matthijs Laan
 */
@Entity
@Table(name="feature_type")
@org.hibernate.annotations.Entity(dynamicUpdate = true)
public class SimpleFeatureType {
    private static final Log log = LogFactory.getLog(SimpleFeatureType.class);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade=CascadeType.PERSIST)
    @JoinColumn(name = "feature_source")
    private FeatureSource featureSource;    
    
    private String typeName;
    
    private String description;
    
    private boolean writeable;

    private String geometryAttribute;

    private String primaryKeyAttribute;

    @OneToMany (cascade=CascadeType.ALL, mappedBy="featureType")
    private List<FeatureTypeRelation> relations = new ArrayList<FeatureTypeRelation>();
    
    @ManyToMany(cascade=CascadeType.ALL) // Actually @OneToMany, workaround for HHH-1268 
    @JoinTable(
            inverseJoinColumns=@JoinColumn(name="attribute_descriptor"),
            name="feature_type_attributes",
            joinColumns=@JoinColumn(name = "feature_type", referencedColumnName = "id")
    )
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
    
    public List<FeatureTypeRelation> getRelations() {
        return relations;
    }

    public void setRelations(List<FeatureTypeRelation> relations) {
        this.relations = relations;
    }

    public String getPrimaryKeyAttribute() {
        return primaryKeyAttribute;
    }

    public void setPrimaryKeyAttribute(String primaryKeyAttribute) {
        this.primaryKeyAttribute = primaryKeyAttribute;
    }
    //</editor-fold>

    public boolean update(SimpleFeatureType update) {
        if(!getTypeName().equals(update.getTypeName())) {
            throw new IllegalArgumentException("Cannot update feature type with properties from feature type with different type name!");
        }        

        description = update.description;
        writeable = update.writeable;
        geometryAttribute = update.geometryAttribute;
        primaryKeyAttribute = update.primaryKeyAttribute;
        
        boolean changed = false;
        
        // Retain user set aliases for attributes
        
        // Does not work correctly for Arc* feature sources which set attribute
        // title in alias... Needs other field to differentiate user set title
        
        Map<String,String> aliasesByAttributeName = new HashMap();
        for(AttributeDescriptor ad: attributes) {
            if(StringUtils.isNotBlank(ad.getAlias())) {
                aliasesByAttributeName.put(ad.getName(), ad.getAlias());
            }
        }
        
        //loop over oude attributes
        // voor iedere oude attr kijk of er een attib ib de update.attributes zit
        //   zo ja kijk of type gelijk is
        //      als type niet gelijk dan oude attr verwijderen en vervangen door nieuwe, evt met alias kopieren
        // zo niet dan toevoegen nieuw attr aan oude set
        //   loop over nieuwe attributen om te kijken of er oude verwijderd moeten worden
        // todo: Het is handiger om deze check op basis van 2 hashmaps uittevoeren
        if(!attributes.equals(update.attributes)) {
            changed = true;
            for(int i = 0; i < attributes.size();i++){
                boolean notFound = true;
                
                for(AttributeDescriptor newAttribute: update.attributes){
                    
                    if(attributes.get(i).getName().equals(newAttribute.getName())){
                        notFound = false;  
                        AttributeDescriptor oldAttr  = attributes.get(i);
                        if(Objects.equals(oldAttr.getType(), newAttribute.getType())){
                            // ! expression didnt work(???) so dummy if-else (else is only used)
                        }else{
                            attributes.remove(i);
                            attributes.add(i, newAttribute);  
                        }
                        break;
                    }
                }
                if(notFound){
                    attributes.remove(i);
                }
            }
            
            //nieuwe attributen worden hier toegevoegd aan de oude attributen lijst
            for(int i = 0; i < update.attributes.size();i++){
                boolean notFound = true;
                
                for(AttributeDescriptor oldAttribute: attributes){
                    if(update.attributes.get(i).getName().equals(oldAttribute.getName())){
                        notFound = false;
                        break; 
                    }
                   
                }
                if(notFound){
                    attributes.add(update.attributes.get(i));
                }
            }
        }
        
        //update.attributes ID = NULL so the attributes list is getting NULL aswell
        //if(!attributes.equals(update.attributes)) {
            //attributes.clear();
            //attributes.addAll(update.attributes);
            //changed = true;
        //}
        
        for(AttributeDescriptor ad: attributes) {
            String alias = aliasesByAttributeName.get(ad.getName());
            if(alias != null) {
                ad.setAlias(alias);
            }            
        }
        return changed;
    }
    
    public AttributeDescriptor getAttribute(String attributeName) {
        for(AttributeDescriptor ad: attributes) {
            if(ad.getName().equals(attributeName)) {
                return ad;
            }
        }
        return null;
    }   
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();
        o.put("id", id);
        o.put("typeName", typeName);
        o.put("writeable", writeable);
        o.put("geometryAttribute", geometryAttribute);
        o.put("primaryKeyAttribute", primaryKeyAttribute);

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

    public boolean hasRelations() {
        return this.relations!=null && this.relations.size()>0;
    }
}

