/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    keyStore:null,
    layerStore:null,
    constructor: function (parentId, configObject, configPage) {
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.keyStore = Ext.create("Ext.data.Store", {
            fields: ["id", "filename"],
            data: []
        });
        this.layerStore = Ext.create("Ext.data.Store", {
            fields: ["id", "serviceId", "layerName", "alias"]
        });

        this.form.setLoading(i18next.t('viewer_components_configobject_1'));
        this.initForm();
        this.getFilterableLayers(this.initLayers);
    },

    initLayers: function(layers){
        this.getAppConfig().appLayers = layers;
        this.createLayerStore();
        if(this.configObject.layers){
            this.populateAttributeCombos(this.configObject.layers);
            Ext.getCmp("attributeCombo1").setValue(this.configObject.imageIdAttribute);
            Ext.getCmp("attributeCombo2").setValue(this.configObject.imageDescriptionAttribute);
        }
        this.form.setLoading(false);
    },

    initForm: function(){

        var me = this;
        this.form.add([
            {
                xtype: "textfield",
                name: "width",
                value: this.configObject.width,
                width: 500,
                labelWidth:this.labelWidth,
                fieldLabel: i18next.t('cyclorama_config_0')
            },
            {
                xtype: "textfield",
                name: "height",
                value: this.configObject.height,
                width: 500,
                labelWidth:this.labelWidth,
                fieldLabel: i18next.t('cyclorama_config_1')
            },
            {
                xtype: "combo",
                id: "keyCombo",
                fieldLabel: i18next.t('cyclorama_config_2'),
                labelWidth:this.labelWidth,
                store: this.keyStore,
                queryMode: "local",
                width: 500,
                displayField: "filename",
                editable: false,
                valueField: "id",
                name: "keyCombo",
                value: this.configObject.keyCombo
            },
            {
                xtype: "combo",
                width: 500,
                id: "layerCombo",
                fieldLabel: i18next.t('cyclorama_config_3'),
                labelWidth:this.labelWidth,
                store: this.layerStore,
                queryMode: "local",
                displayField: "alias",
                editable: false,
                valueField: "id",
                name: "layers",
                value: this.configObject.layers,
                listeners: {
                    change: function (combo, id) {
                        me.populateAttributeCombos(id);
                    }
                }
            }, {
                xtype: "combo",
                id: "attributeCombo1",
                fieldLabel: i18next.t('cyclorama_config_4'),
                store: Ext.create("Ext.data.Store", {
                    fields: ["id", "alias", "type"]
                }),
                queryMode: "local",
                displayField: "alias",
                width: 500,
                editable: false,
                name: "imageIdAttribute",
                valueField: "id",
                labelWidth:this.labelWidth,
                listeners: {
                    select: function (combo, records, eOpts) {
                        Ext.getCmp("attributeInfo").setValue(i18next.t('cyclorama_config_5') + records[0].get("type"));
                    }
                }
            }, {
                xtype: "combo",
                id: "attributeCombo2",
                fieldLabel: i18next.t('cyclorama_config_6'),
                store: Ext.create("Ext.data.Store", {
                    fields: ["id", "alias", "type"]
                }),
                queryMode: "local",
                displayField: "alias",
                editable: false,
                width: 500,
                name: "imageDescriptionAttribute",
                valueField: "id",
                labelWidth:this.labelWidth,
                listeners: {
                    select: function (combo, records, eOpts) {
                        Ext.getCmp("attributeInfo").setValue(i18next.t('cyclorama_config_7') + records[0].get("type"));
                    }
                }
            }
        ]);
        this.loadKeys(this.configObject.keyCombo);
    },

    populateAttributeCombos : function(id){
        if (id === null) {
            return;
        }
        var layerId = id;

        var appLayer = this.getAppConfig().appLayers[layerId];

        var ac1 = Ext.getCmp("attributeCombo1");
        ac1.clearValue();
        var photoIdAttribute = ac1.getStore();

        photoIdAttribute.removeAll();

        var ac2 = Ext.getCmp("attributeCombo2");
        ac2.clearValue();
        var photoDescriptionAttribute = ac2.getStore();

        photoDescriptionAttribute.removeAll();

        if (!appLayer) {
            return;
        }

        Ext.Array.each(appLayer.attributes, function (att) {
            photoIdAttribute.add({
                id: att.id,
                alias: att.alias || att.name,
                type: att.type
            });

            photoDescriptionAttribute.add({
                id: att.id,
                alias: att.alias || att.name,
                type: att.type
            });
        });
    },
    createLayerStore: function() {
        var me = this;
        Ext.Object.each(this.getAppConfig().appLayers, function(id, appLayer) {
            if(appLayer.attributes.length > 0) {
                me.layerStore.add({id: id, serviceId: appLayer.serviceId, layerName: appLayer.layerName, alias: appLayer.alias});
            }
        });
        this.layerStore.add({id: "-666", serviceId: "-666", layerName: i18next.t('cyclorama_config_8'), alias: i18next.t('cyclorama_config_9')});
        if(this.configObject.layers){
            Ext.getCmp("layerCombo").setValue(this.configObject.layers);
        }
    },

    loadKeys : function(value){
        var me = this;
        Ext.Ajax.request({
            url: this.getContextpath() + "/action/cyclorama/accountList",
            success: function ( result, request ) {
                var keys = Ext.JSON.decode(result.responseText);
                Ext.each(keys,function(key){
                    me.keyStore.add(key);
                });
                Ext.getCmp("keyCombo").setValue(value);
            },
            failure: function() {
                Ext.MessageBox.alert(i18next.t('cyclorama_config_10'), i18next.t('cyclorama_config_11'));
            }
        });
    }
});
