/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import javax.persistence.*;
import nl.b3p.viewer.config.services.SimpleFeatureType;
import org.apache.commons.beanutils.BeanUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class ConfiguredAttribute {
    @Id
    private Long id;

    /**
     * Not a direct association but like ApplicationLayer.layerName
     */
    private String attributeName;
    /** 
     * link with feature type
     */
    @ManyToOne
    private SimpleFeatureType featureType;
    
    private boolean visible;
    private boolean editable;
    private boolean selectable;
    private boolean filterable;

    private String editAlias;
    private String editHeight;

    /**
     * JSON array
     */
    @Lob
    @org.hibernate.annotations.Type(type="org.hibernate.type.StringClobType")
    private String editValues;

    private String defaultValue;

    //<editor-fold defaultstate="collapsed" desc="getters and setters">
    public String getAttributeName() {
        return attributeName;
    }
    
    public void setAttributeName(String attributeName) {
        this.attributeName = attributeName;
    }
    
    public String getDefaultValue() {
        return defaultValue;
    }
    
    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
    
    public String getEditAlias() {
        return editAlias;
    }
    
    public void setEditAlias(String editAlias) {
        this.editAlias = editAlias;
    }
    
    public String getEditHeight() {
        return editHeight;
    }
    
    public void setEditHeight(String editHeight) {
        this.editHeight = editHeight;
    }
    
    public String getEditValues() {
        return editValues;
    }
    
    public void setEditValues(String editValues) {
        this.editValues = editValues;
    }
    
    public boolean isEditable() {
        return editable;
    }
    
    public void setEditable(boolean editable) {
        this.editable = editable;
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
    
    public boolean isSelectable() {
        return selectable;
    }
    
    public void setSelectable(boolean selectable) {
        this.selectable = selectable;
    }
    
    public boolean isVisible() {
        return visible;
    }
    
    public void setVisible(boolean visible) {
        this.visible = visible;
    }
    
    public SimpleFeatureType getFeatureType() {
        return featureType;
    }

    public void setFeatureType(SimpleFeatureType featureType) {
        this.featureType = featureType;
    }
    //</editor-fold>
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();     
        o.put("id", id);
        o.put("name", attributeName);
        o.put("visible", visible);
        o.put("editable", editable);
        o.put("filterable", filterable);
        o.put("selectable", selectable);
        o.put("editAlias", editAlias);
        o.put("editHeight", editHeight);
        
        if(editValues != null) {
            try {
                o.put("editValues", new JSONArray(editValues));
            } catch(JSONException je) {
            }
        }
        o.put("defaultValue", defaultValue);
        if (featureType!=null){
            o.put("featureType",featureType.getId());
            o.put("longname",featureType.getTypeName() + "." + attributeName);
        }
        return o;
    }

    ConfiguredAttribute deepCopy() throws Exception {
        ConfiguredAttribute copy = (ConfiguredAttribute)BeanUtils.cloneBean(this);
        copy.setId(null);
        return copy;
    }
    /**
     * Returns full name. That is the id of the featuretype + ":" + attributeName
     */
    public String getFullName() {
        String uniqueName= "";
        if (this.getFeatureType()!=null){
            uniqueName = this.getFeatureType().getId()+":"; 
        }
        uniqueName+=this.attributeName;
        return uniqueName;
    }

}
