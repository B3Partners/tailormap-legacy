/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
package nl.b3p.viewer.config.app;

import javax.persistence.*;
import nl.b3p.viewer.config.services.FeatureSource;
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

    @ManyToOne
    private FeatureSource valueListFeatureSource;

    @ManyToOne
    private SimpleFeatureType valueListFeatureType;

    private String valueListLabelName;

    private String valueListValueName;

    private String valueList;

    private boolean allowValueListOnly;

    private boolean disallowNullValue;

    private boolean disableUserEdit;
    
    private String label;
    
    private boolean automaticValue;
    
    private String automaticValueType;

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

    public FeatureSource getValueListFeatureSource() {
        return valueListFeatureSource;
    }

    public void setValueListFeatureSource(FeatureSource valueListFeatureSource) {
        this.valueListFeatureSource = valueListFeatureSource;
    }

    public SimpleFeatureType getValueListFeatureType() {
        return valueListFeatureType;
    }

    public void setValueListFeatureType(SimpleFeatureType valueListFeatureType) {
        this.valueListFeatureType = valueListFeatureType;
    }

    public String getValueListLabelName() {
        return valueListLabelName;
    }

    public void setValueListLabelName(String valueListLabelName) {
        this.valueListLabelName = valueListLabelName;
    }

    public String getValueListValueName() {
        return valueListValueName;
    }

    public void setValueListValueName(String valueListValueName) {
        this.valueListValueName = valueListValueName;
    }

    public String getValueList() {
        return valueList;
    }

    public void setValueList(String valueList) {
        this.valueList = valueList;
    }

    public boolean getAllowValueListOnly() {
        return allowValueListOnly;
    }

    public void setAllowValueListOnly(boolean allowValueListOnly) {
        this.allowValueListOnly = allowValueListOnly;
    }

    public boolean getDisAllowNullValue() {
        return disallowNullValue;
    }

    public void setDisallowNullValue(boolean disallowNullValue) {
        this.disallowNullValue = disallowNullValue;
    }

    public boolean isDisableUserEdit() {
        return disableUserEdit;
    }

    public void setDisableUserEdit(boolean disableUserEdit) {
        this.disableUserEdit = disableUserEdit;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public boolean isAutomaticValue() {
        return automaticValue;
    }

    public void setAutomaticValue(boolean automaticValue) {
        this.automaticValue = automaticValue;
    }

    public String getAutomaticValueType() {
        return automaticValueType;
    }

    public void setAutomaticValueType(String automaticValueType) {
        this.automaticValueType = automaticValueType;
    }
    //</editor-fold>
    
    public JSONObject toJSONObject() throws JSONException {
        JSONObject o = new JSONObject();     
        o.put("id", id);
        o.put("name", attributeName);
        o.put("visible", visible);
        o.put("editable", editable);
        o.put("disableUserEdit", disableUserEdit);
        o.put("filterable", filterable);
        o.put("selectable", selectable);
        o.put("editAlias", editAlias);
        o.put("editHeight", editHeight);
        o.put("allowValueListOnly", allowValueListOnly);
        o.put("disallowNullValue", disallowNullValue);
        o.put("automaticValueType", automaticValueType);
        o.put("automaticValue", automaticValue);
        o.put("folder_label", label);
        if(editValues != null) {
            try {
                if (!valueList.equalsIgnoreCase("dynamic")) {
                    o.put("editValues", new JSONArray(editValues));
                }
            } catch(JSONException je) {
            }
        }
        o.put("defaultValue", defaultValue);
        if (featureType!=null){
            o.put("featureType",featureType.getId());
            o.put("longname",featureType.getTypeName() + "." + attributeName);
        }

        o.put("valueList", valueList);

        if (valueListFeatureSource != null) {
            o.put("valueListFeatureSource", valueListFeatureSource.getId());
            if (valueListFeatureType != null) {
                o.put("valueListFeatureType", valueListFeatureType.getId());
                o.put("valueListLabelName", valueListLabelName);
                o.put("valueListValueName", valueListValueName);
            }
        }
        return o;
    }

    ConfiguredAttribute deepCopy() throws Exception {
        ConfiguredAttribute copy = (ConfiguredAttribute)BeanUtils.cloneBean(this);
        copy.setId(null);
        return copy;
    }
    /**
     * Returns full name.
     *
     * @return the id of the featuretype + ":" + attributeName
     */
    public String getFullName() {
        String uniqueName= "";
        if (this.getFeatureType()!=null){
            uniqueName = this.getFeatureType().getId()+":"; 
        }
        uniqueName+=this.attributeName;
        return uniqueName;
    }

    public String getLongName(){
         String longName= "";
        if (this.getFeatureType()!=null){
            longName = this.getFeatureType().getTypeName()+"."; 
        }
        longName+=this.attributeName;
        return longName;
    }
}
