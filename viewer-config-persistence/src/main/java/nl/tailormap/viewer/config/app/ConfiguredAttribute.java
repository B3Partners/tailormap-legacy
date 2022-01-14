/*
 * Copyright (C) 2012-2021 B3Partners B.V.
 */
package nl.tailormap.viewer.config.app;

import nl.tailormap.viewer.config.services.FeatureSource;
import nl.tailormap.viewer.config.services.SimpleFeatureType;
import org.apache.commons.beanutils.BeanUtils;
import org.hibernate.annotations.Type;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;

/**
 *
 * @author Matthijs Laan
 */
@Entity
public class ConfiguredAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Not a direct association but like ApplicationLayer.layerName
     */
    private String attributeName;
    /** 
     * link with feature type
     */
    @ManyToOne
    @JoinColumn(name = "feature_type")
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
    @Type(type = "org.hibernate.type.TextType")
    private String editValues;

    private String defaultValue;

    @ManyToOne
    @JoinColumn(name = "value_list_feature_source")
    private FeatureSource valueListFeatureSource;

    @ManyToOne
    @JoinColumn(name = "value_list_feature_type")
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
                if (valueList == null || !valueList.equalsIgnoreCase("dynamic")) {
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

    public ConfiguredAttribute deepCopy() throws Exception {
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
