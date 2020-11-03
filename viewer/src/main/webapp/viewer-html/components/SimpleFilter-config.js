/*
 * Copyright (C) 2012-2015 B3Partners B.V.
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
    extend: "viewer.components.ConfigObject",

    mixins: ['Ext.mixin.Observable'],

    filterTypes: null,
    filterStore: null,
    filterConfigs: null,

    filterConfigurer: null,

    currentEditIndex: null,
    parentId: null,
    layerStore:null,
    configObject:null,
    simplefilterForm:null,

    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.mixins.observable.constructor.call(this, config);
        this.parentId = parentId;
        this.configObject = configObject;
        Ext.tip.QuickTipManager.init();  // enable tooltips

        this.filterTypes = Ext.create("Ext.data.Store", {
            fields: ["type", "label"],
            data: [
                {type: "slider", label: i18next.t('simplefilter_config_0')},
                {type: "number", label: i18next.t('simplefilter_config_1')},
                {type: "text", label: i18next.t('simplefilter_config_2')},
                {type: "numberrange", label: i18next.t('simplefilter_config_3')},
                {type: "combo", label: i18next.t('simplefilter_config_4')},
                {type: "checkbox", label: i18next.t('simplefilter_config_5')},
                {type: "date", label: i18next.t('simplefilter_config_6')},
                {type: "radio", label: i18next.t('simplefilter_config_7')},
                {type: "reset", label: i18next.t('simplefilter_config_8')},
                {type: "textlabel", label: i18next.t('simplefilter_config_9')}
            ]
        });

        this.filterStore = Ext.create("Ext.data.Store", {
            fields: ["soort", "description","id"],
            data: []
        });

        this.layerStore = Ext.create("Ext.data.Store", {
            fields: [{name: "id", type: 'int'}, "serviceId", "layerName", "alias"]
        });
        this.filterConfigs = [];
        this.createForm();
        this.getFilterableLayers(this.initLayers);
        return this;
    },

    initLayers: function(layers){

        this.getAppConfig().appLayers = layers;
        this.createLayerStore();
    },

    initConfiguration: function(){
        if(this.configObject && this.configObject.filters) {
            var me = this;
            Ext.Array.each(this.configObject.filters, function(filter) {
                me.addFilter(filter,me.configObject);
            });
        }
        this.simplefilterForm.setLoading(false);
    },

    createForm: function(){
        var me = this;
        this.simplefilterForm = Ext.create('Ext.panel.Panel', {
            border: 0,
            width: 730,
            height: 800,

            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            renderTo: Ext.get(this.parentId),
            items: [{
                xtype: 'textfield',
                fieldLabel: i18next.t('simplefilter_config_10'),
                name: 'title',
                itemId: 'title',
                value: this.configObject.title ? this.configObject.title : "",
                labelWidth: me.labelWidth,
                width: 500
            }, {
                xtype: 'panel',
                padding: '5 5 15 0',
                border: 0,
                html: i18next.t('simplefilter_config_11')
            },{
                xtype: 'panel',
                border: 0,
                flex: 1,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [{
                    xtype: 'form',
                    border: 0,
                    height: '100%',
                    flex: 0.6,
                    fieldDefaults: {
                        msgTarget: 'side',
                        labelWidth: 150
                    },
                    items: [{
                        xtype: 'combo',
                        fieldLabel: i18next.t('simplefilter_config_12'),
                        store: this.filterTypes,
                        itemId: "filterType",
                        queryModes: "local",
                        displayField: "label",
                        editable: false,
                        valueField: "type",
                        listeners: {
                            select: function (combo, record, eOpts) {
                                me.resetConfig();
                                var type = record.get("type");
                                me.createFilterConfig(type,{});
                            }
                        }
                    },{
                        xtype: "fieldset",
                        id: "filterAttributeConfigFieldset",
                        title: i18next.t('simplefilter_config_13'),
                        collapsible: false,
                        defaultType: "textfield",
                        layout: "anchor",
                        items: [{
                            xtype: "combo",
                            itemId: "layerCombo",
                            fieldLabel: i18next.t('simplefilter_config_14'),
                            store: this.layerStore,
                            queryMode: "local",
                            displayField: "alias",
                            editable: false,
                            valueField: "id",
                            listeners: {
                                change: function(combo, id) {
                                    if(id === null){
                                        return;
                                    }
                                    var layerId = id;

                                    var appLayer = me.getAppConfig().appLayers[layerId];

                                    var ac = Ext.ComponentQuery.query("#attributeCombo")[0];
                                    ac.clearValue();
                                    var store = ac.getStore();

                                    store.removeAll();
                                    if(!appLayer){
                                        return;
                                    }

                                    Ext.Array.each(appLayer.attributes, function(att) {
                                        store.add({
                                            name: att.name,
                                            alias: att.alias || att.name,
                                            type: att.type
                                        });
                                    });

                                    me.fireEvent("simpleFilterLayerChanged", appLayer);
                                }
                            }
                        },{
                            xtype: "combo",
                            itemId: "attributeCombo",
                            fieldLabel: i18next.t('simplefilter_config_15'),
                            store: Ext.create("Ext.data.Store", {
                                fields: ["name", "alias", "type"]
                            }),
                            queryMode: "local",
                            displayField: "alias",
                            editable: false,
                            valueField: "name",
                            listeners: {
                                select: function(combo, record, eOpts) {
                                    Ext.ComponentQuery.query("#attributeInfo")[0].setValue("Type: " + record.get("type"));
                                }
                            }
                        },{
                            xtype: 'displayfield',
                            itemId: 'attributeInfo',
                            fieldLabel: i18next.t('simplefilter_config_16'),
                            value: ''
                        }]
                    },{
                        xtype: "fieldset",
                        itemId: "filterConfigFieldset",
                        title: i18next.t('simplefilter_config_17'),
                        collapsible: false,
                        defaultType: "textfield",
                        layout: "fit",
                        height: 600,
                        scrollable: true,
                        // defaults: {
                        //     anchor: '100%',
                        //     width: 500
                        // },
                        items: []
                    }]
                },{
                    xtype: 'panel',
                    border: 0,
                    width: 30,
                    margin: '0 0 0 10',
                    height: 250,
                    layout: {
                        type: "vbox",
                        pack: "center"
                    },
                    items: [{
                        xtype: 'button',
                        text: i18next.t('simplefilter_config_18'),
                        margin: '0 0 5 0',
                        listeners: {
                            click: {
                                fn: me.saveCurrentConfig,
                                scope: me
                            }
                        }
                    },{
                        xtype: 'button',
                        text: i18next.t('simplefilter_config_19'),
                        margin: '0 0 15 0',
                        listeners:{
                            click :{
                                scope: me,
                                fn:function(){
                                    var grid = Ext.ComponentQuery.query("#configuredFiltersGrid")[0];
                                    var record = grid.getSelectionModel().getSelection();

                                    if(record.length > 0){
                                        var id = record[0].data.id;
                                        this.removeConfig(id);
                                        this.resetConfig(true);
                                    }else{
                                        Ext.MessageBox.alert(i18next.t('simplefilter_config_22'), i18next.t('simplefilter_config_23'));
                                    }
                                }
                            }
                        }
                    },{
                        xtype: 'button',
                        text: i18next.t('simplefilter_config_24'),
                        margin: '0 0 5 0',
                        listeners:{
                            click:{
                                scope:me,
                                fn: function(){
                                    me.move(-1);
                                }
                            }
                        }
                    },{
                        xtype: 'button',
                        text: i18next.t('simplefilter_config_25'),
                        listeners:{
                            click:{
                                scope:me,
                                fn:  function(){
                                    me.move(1);
                                }
                            }
                        }
                    }]
                }, {
                    xtype: 'gridpanel',
                    itemId: 'configuredFiltersGrid',
                    title: i18next.t('simplefilter_config_26'),
                    height: 430,
                    flex: 0.4,
                    store: this.filterStore,
                    columns: [
                        {header: i18next.t('simplefilter_config_27'), dataIndex: 'soort', sortable: false, hideable: false},
                        {header: i18next.t('simplefilter_config_28'), dataIndex: 'description', sortable: false, hideable: false, flex: 1}
                    ],
                    listeners: {
                        select: {
                            fn: me.gridSelect,
                            scope: me
                        }
                    }
                }]
            }]
        });
        this.simplefilterForm.setLoading(i18next.t('viewer_components_configobject_1'));
    },
    createFilterConfig: function(type,config){
        var configurerClass = "viewer.components.sf." + type.substring(0,1).toUpperCase() + type.substring(1) + "Config";

        this.filterConfigurer = Ext.create(configurerClass, {
            configObject: config,
            container: Ext.ComponentQuery.query("#filterConfigFieldset")[0],
            configurator:this
        });
        Ext.ComponentQuery.query("#filterConfigFieldset")[0].updateLayout();
    },
    addFilter : function(filter,config){
        var type = filter.class.substring(filter.class.lastIndexOf(".")+1);
        var soort = this.filterTypes.findRecord("type", type).get("label");
        var appLayer = this.getAppConfig().appLayers[config.layers[filter.appLayerId]];
        if(appLayer){
            filter.appLayerId = appLayer.id;
            var description = this.createDescription(type, appLayer, filter);
        }
        this.filterConfigs.push(filter);
        this.filterStore.add({soort: soort, description: description, id:filter.config.id});
    },
    gridSelect: function(grid, record, index) {
        this.currentEditIndex = index;
        var config = this.filterConfigs[this.currentEditIndex];
        var type = config.class.substring(config.class.lastIndexOf(".")+1).toLowerCase();

        this.resetConfig(true);
        Ext.ComponentQuery.query("#layerCombo")[0].setValue(config.appLayerId);
        Ext.ComponentQuery.query('#attributeCombo')[0].setValue(config.attributeName);
        Ext.ComponentQuery.query("#filterType")[0].setValue(type);
        this.createFilterConfig(type, config.config);
    },
    createDescription: function(type, appLayer, filter) {
        return (type === "Reset" || type === "Textlabel") ? " - " : (appLayer.alias || appLayer.layerName) + "." + (filter.attributeAlias || filter.attributeName);
    },
    saveCurrentConfig: function(button, e, eOpts) {
        if(this.filterConfigurer) {
            var filterConfigurerClass = this.filterConfigurer.self.getName();
            var attributeCombo = Ext.ComponentQuery.query('#attributeCombo')[0];
            var filterControl = {
                class: filterConfigurerClass.substring(0, filterConfigurerClass.length - 6),
                appLayerId: Ext.ComponentQuery.query("#layerCombo")[0].getValue(),
                attributeName: attributeCombo.getValue(),
                attributeAlias: attributeCombo.getValue() ? attributeCombo.getStore().findRecord("name", attributeCombo.getValue()).get('alias') : '',
                config: this.filterConfigurer.getConfig()
            };

            var record = this.getSelectedRecord();
            var oldIndex = this.filterStore.indexOf(record);
            oldIndex = oldIndex !== -1 ? oldIndex : this.filterConfigs.length;
            this.removeConfig( filterControl.config.id );

            var soort = filterConfigurerClass.substring(filterConfigurerClass.lastIndexOf('.')+1, filterConfigurerClass.length - 6);
            var appLayer = this.getAppConfig().appLayers[filterControl.appLayerId];
            var description = this.createDescription(soort, appLayer, filterControl);
            Ext.Array.insert(this.filterConfigs, oldIndex, [filterControl]);
            var soortString = this.filterTypes.findRecord("type", soort).get("label");
            this.filterStore.insert(oldIndex,{soort: soortString, description: description, id:filterControl.config.id});
            this.resetConfig(true);
        }
        var t = Ext.ComponentQuery.query("#title")[0].getValue();
        this.configObject.title = t;
    },
    removeConfig : function( id ){
        for (var i = 0; i < this.filterConfigs.length; i++) {
            var config = this.filterConfigs[i];
            if (config.config.id === id) {
                this.filterConfigs.splice(i, 1);
                var record = this.filterStore.findRecord("id",id);
                this.filterStore.remove(record);
                break;
            }
        }
    },
    move : function(moveAmount){
        var record = this.getSelectedRecord();
        var grid = Ext.ComponentQuery.query("#configuredFiltersGrid")[0];
        if(record){
            var config = this.getFilter(record.data.id);
            var configIndex = Ext.Array.indexOf(this.filterConfigs, config);
            this.filterStore.remove(record);
            this.filterStore.insert( configIndex+moveAmount,record);
            this.filterConfigs.move(configIndex, configIndex+moveAmount);
            grid.getSelectionModel().select(record);
        }
    },
    getSelectedRecord : function(){
        var grid = Ext.ComponentQuery.query("#configuredFiltersGrid")[0];
        var records = grid.getSelectionModel().getSelection();
        var record = null;
        if(records.length > 0){
            record = records[0];
        }
        return record;
    },
    getFilter : function(id){
        for ( var i = 0 ; i < this.filterConfigs.length; i ++){
            if(this.filterConfigs[i].config.id === id){
                return this.filterConfigs[i];
            }
        }
        return null;
    },
    getConfiguration: function() {
        // Save possible open configs
        this.saveCurrentConfig();

        var config = { filters: this.filterConfigs};
        config.layers = [];
        /* App layers must always be in the "layers" property so they can get
         * updated when the application is copied, use indexes to this array
         */
        Ext.Array.each(config.filters, function(filter) {
            if(!filter.appLayerId && filter.appLayerId !== 0) {
                // Allow for empty appLayerId's
                // When no appLayer is selected (which is allowed for Tekst and Reset types) do not add to layers config
                return true;
            }
            var index = Ext.Array.indexOf(config.layers, filter.appLayerId);
            if(index === -1) {
                config.layers.push(filter.appLayerId);
                filter.appLayerId = config.layers.length - 1;
            } else {
                filter.appLayerId = index;
            }
        });
        config.title = this.configObject.title;
        return config;
    },

    createLayerStore: function() {
        var me = this;
        Ext.Object.each(this.getAppConfig().appLayers, function(id, appLayer) {
            if(appLayer.attributes.length > 0) {
                me.layerStore.add({id: id, serviceId: appLayer.serviceId, layerName: appLayer.layerName, alias: appLayer.alias});
            }
        });

        this.initConfiguration();
    },

    resetConfig: function (alsoType) {
        if(alsoType){
            Ext.ComponentQuery.query("#filterType")[0].setValue(null);
        }
        Ext.ComponentQuery.query("#layerCombo")[0].setValue(null);
        Ext.ComponentQuery.query('#attributeCombo')[0].setValue(null);
        Ext.ComponentQuery.query("#filterConfigFieldset")[0].removeAll();
        this.filterConfigurer = null;
    }
});
/**
 * Method for moving items around in an array. Found on http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
 * @param {type} old_index Move item from position old_index
 * @param {type} new_index Move the item to position new_index
 * @returns {Array.prototype}
 */
Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};