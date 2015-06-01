/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",

    filterTypes: null,
    filterStore: null,
    filterConfigs: null,

    filterConfigurer: null,

    currentEditIndex: null,

    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        var title = config && config.title ? config.title : "";

        Ext.tip.QuickTipManager.init();  // enable tooltips

        this.filterTypes = Ext.create("Ext.data.Store", {
            fields: ["type", "label"],
            data: [
                {type: "slider", label: "Slider"},
                {type: "combo", label: "Selectielijst"},
                {type: "checkbox", label: "Vinkvak"},
                {type: "radio", label: "Keuzerondje"},
                {type: "reset", label: "Reset filter knop"}
            ]
        });

        this.filterStore = Ext.create("Ext.data.Store", {
            fields: ["soort", "description","id"],
            data: []
        });

        this.filterConfigs = [];

        if(config && config.filters) {
            var me = this;
            Ext.Array.each(config.filters, function(filter) {
                me.addFilter(filter,config);
            });
        }

        var layerStore = this.createLayerStore();

        var me = this;

        Ext.create('Ext.panel.Panel', {
            width: '95%',
            height: '95%',
            border: 0,
            layout: 'vbox',
            renderTo: Ext.get(parentid),
            items: [{
                xtype: 'panel',
                width: '100%',
                padding: '5 5 15 0',
                border: 0,
                html: 'Met een simpel filter kunt u een gebruiker laten filteren op een voorgedefinieerde laag een attribuut. Kies eerst het soort filtergereedschap, stel de gegevens in en voeg het filtergereedschap toe aan de lijst met de plus-knop.'
            },{
                xtype: 'panel',
                border: 0,
                width: '100%',
                //flex: 1,
                layout: 'column',
                items: [{
                    xtype: 'form',
                    border: 0,
                    height: '100%',
                    columnWidth: 0.5,
                    fieldDefaults: {
                        msgTarget: 'side',
                        labelWidth: 150
                    },
                    items: [{
                        xtype: 'combo',
                        fieldLabel: 'Soort filtergereedschap',
                        store: this.filterTypes,
                        id: "filterType",
                        queryModes: "local",
                        displayField: "label",
                        editable: false,
                        valueField: "type",
                        listeners: {
                            select: function (combo, records, eOpts) {
                                me.resetConfig();
                                var type = records[0].get("type");
                                me.createFilterConfig(type,me);
                            }
                        }
                    },{
                        xtype: "fieldset",
                        id: "filterAttributeConfigFieldset",
                        title: "Instellingen voor filter",
                        collapsible: false,
                        defaultType: "textfield",
                        layout: "anchor",
                        defaults: {
                            anchor: '100%'
                        },
                        items: [{
                            xtype: "combo",
                            id: "layerCombo",
                            fieldLabel: "Laag",
                            store: layerStore,
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

                                    var appLayer = appConfig.appLayers[layerId];

                                    var ac = Ext.getCmp("attributeCombo");
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

                                }
                            }
                        },{
                            xtype: "combo",
                            id: "attributeCombo",
                            fieldLabel: "Attribuut",
                            store: Ext.create("Ext.data.Store", {
                                fields: ["name", "alias", "type"]
                            }),
                            queryMode: "local",
                            displayField: "alias",
                            editable: false,
                            valueField: "name",
                            listeners: {
                                select: function(combo, records, eOpts) {
                                    Ext.getCmp("attributeInfo").setValue("Type: " + records[0].get("type"));
                                }
                            }
                        },{
                            xtype: 'displayfield',
                            id: 'attributeInfo',
                            fieldLabel: 'Attribuut info',
                            value: ''
                        }]
                    },{
                        xtype: "fieldset",
                        id: "filterConfigFieldset",
                        title: "Instellingen voor filtergereedschap",
                        collapsible: false,
                        defaultType: "textfield",
                        layout: "anchor",
                        height: 300,
                        autoScroll: true,
                        defaults: {
                            anchor: '100%',
                            width: 500
                        },
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
                        text: '+',
                        margin: '0 0 5 0',
                        listeners: {
                            click: {
                                fn: me.saveCurrentConfig,
                                scope: me
                            }
                        }
                    },{
                        xtype: 'button',
                        text: 'x',
                        margin: '0 0 15 0',
                        listeners:{
                            click :{
                                scope: me,
                                fn:function(){
                                    var grid = Ext.getCmp( "configuredFiltersGrid");
                                    var record = grid.getSelectionModel().getSelection();

                                    if(record.length > 0){
                                        var id = record[0].data.id;
                                        var me = this;
                                        Ext.MessageBox.confirm('Weet u het zeker', 'Weet u zeker dat u de configuratie wilt verwijderen?', function(btn, text){
                                            if (btn === 'yes') {
                                                me.removeConfig(id);
                                                me.resetConfig(true);
                                            }
                                        });
                                    }else{
                                        Ext.MessageBox.alert("Fout", "Selecteer filter");
                                    }
                                }
                            }
                        }
                    },{
                        xtype: 'button',
                        text: 'u',
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
                        text: 'd',
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
                    id: 'configuredFiltersGrid',
                    title: 'Toegevoegde filters',
                    height: 430,
                    columnWidth: 0.48,
                    store: this.filterStore,
                    columns: [
                        {header: 'Soort', dataIndex: 'soort', sortable: false, hideable: false},
                        {header: 'Laag en attribuut', dataIndex: 'description', sortable: false, hideable: false, flex: 1}
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
        return this;
    },
    createFilterConfig: function(type,config){
        var configurerClass = "viewer.components.sf." + type.substring(0,1).toUpperCase() + type.substring(1) + "Config";

        this.filterConfigurer = Ext.create(configurerClass, {
            configObject: config,
            renderTo: "filterConfigFieldset"
        });
        Ext.getCmp("filterConfigFieldset").doLayout();
    },
    addFilter : function(filter,config){
        var type = filter.class.substring(filter.class.lastIndexOf(".")+1);
        var soort = this.filterTypes.findRecord("type", type).get("label");
        var appLayer = appConfig.appLayers[config.layers[filter.appLayerId]];
        if(appLayer){
            filter.appLayerId = appLayer.id;
            var description = type === "Reset" ? " - " : (appLayer.alias || appLayer.layerName) + "." + filter.attributeName;
        }
        this.filterConfigs.push(filter);
        this.filterStore.add({soort: soort, description: description, id:filter.config.id});
    },
    gridSelect: function(grid, record, index) {
        this.currentEditIndex = index;
        var config = this.filterConfigs[this.currentEditIndex];
        var type = config.class.substring(config.class.lastIndexOf(".")+1).toLowerCase();

        this.resetConfig(true);
        Ext.getCmp("layerCombo").setValue(config.appLayerId);
        Ext.getCmp("attributeCombo").setValue(config.attributeName);
        Ext.getCmp("filterType").setValue(type);
        this.createFilterConfig(type, config.config);
    },
    saveCurrentConfig: function(button, e, eOpts) {
        if(this.filterConfigurer) {
            var filterConfigurerClass = this.filterConfigurer.self.getName();
            var filterControl = {
                class: filterConfigurerClass.substring(0, filterConfigurerClass.length - 6),
                appLayerId: Ext.getCmp("layerCombo").getValue(),
                attributeName: Ext.getCmp("attributeCombo").getValue(),
                config: this.filterConfigurer.getConfig()
            };

            var record = this.getSelectedRecord();
            var oldIndex = this.filterStore.indexOf(record);
            oldIndex = oldIndex !== -1 ? oldIndex : this.filterConfigs.length;
            this.removeConfig( filterControl.config.id );

            var soort = filterConfigurerClass.substring(filterConfigurerClass.lastIndexOf('.')+1, filterConfigurerClass.length - 6);
            var appLayer = appConfig.appLayers[filterControl.appLayerId];
            var description = soort === "Reset" ? " - " : appLayer.alias + "." + filterControl.attributeName;
            Ext.Array.insert(this.filterConfigs, oldIndex, [filterControl]);
            var soortString = this.filterTypes.findRecord("type", soort).get("label");
            this.filterStore.insert(oldIndex,{soort: soortString, description: description, id:filterControl.config.id});
            this.resetConfig(true);
        }
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
        var grid = Ext.getCmp("configuredFiltersGrid");
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
        var grid = Ext.getCmp("configuredFiltersGrid");
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
            var index = Ext.Array.indexOf(config.layers, filter.appLayerId);
            if(index === -1) {
                config.layers.push(filter.appLayerId);
                filter.appLayerId = config.layers.length - 1;
            } else {
                filter.appLayerId = index;
            }
        });
        return config;
    },

    createLayerStore: function() {
        var store = Ext.create("Ext.data.Store", {
            fields: ["id", "serviceId", "layerName", "alias"]
        });

        Ext.Object.each(appConfig.appLayers, function(id, appLayer) {
            if(appLayer.attributes.length > 0) {
                store.add({id: id, serviceId: appLayer.serviceId, layerName: appLayer.layerName, alias: appLayer.alias});
            }
        });
        return store;
    },
    resetConfig: function (alsoType) {
        if(alsoType){
            Ext.getCmp("filterType").setValue(null);
        }
        Ext.getCmp("layerCombo").setValue(null);
        Ext.getCmp("attributeCombo").setValue(null);
        Ext.getCmp("filterConfigFieldset").removeAll();
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