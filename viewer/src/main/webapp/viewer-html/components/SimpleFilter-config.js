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

    filterTypes: null,
    filterStore: null,
    filterConfigs: null,

    filterConfigurer: null,

    currentEditIndex: null,

    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);

        Ext.tip.QuickTipManager.init();  // enable tooltips

        this.filterTypes = Ext.create("Ext.data.Store", {
            fields: ["type", "label"],
            data: [
                {type: "slider", label: "Slider"},
                {type: "number", label: "Getalfilter"},
                {type: "numberrange", label: "Getalrange"},
                {type: "combo", label: "Selectielijst"},
                {type: "checkbox", label: "Vinkvak"},
                {type: "radio", label: "Keuzerondje"},
                {type: "reset", label: "Reset filter knop"},
                {type: "textlabel", label: "Tekst label"}
            ]
        });

        this.filterStore = Ext.create("Ext.data.Store", {
            fields: ["soort", "description","id"],
            data: []
        });

        this.filterConfigs = [];

        if(configObject && configObject.filters) {
            var me = this;
            Ext.Array.each(configObject.filters, function(filter) {
                me.addFilter(filter,configObject);
            });
        }

        var layerStore = this.createLayerStore();

        var me = this;

        Ext.create('Ext.panel.Panel', {
            border: 0,
            width: 730,
            height: 800,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            renderTo: Ext.get(parentId),
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Titel',
                name: 'title',
                itemId: 'title',
                value: this.configObject.title ? this.configObject.title : "",
                labelWidth: me.labelWidth,
                width: 500
            }, {
                xtype: 'panel',
                padding: '5 5 15 0',
                border: 0,
                html: 'Met een simpel filter kunt u een gebruiker laten filteren op een voorgedefinieerde laag een attribuut. Kies eerst het soort filtergereedschap, stel de gegevens in en voeg het filtergereedschap toe aan de lijst met de plus-knop.'
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
                        fieldLabel: 'Soort filtergereedschap',
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
                        items: [{
                            xtype: "combo",
                            itemId: "layerCombo",
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

                                }
                            }
                        },{
                            xtype: "combo",
                            itemId: "attributeCombo",
                            fieldLabel: "Attribuut",
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
                            fieldLabel: 'Attribuut info',
                            value: ''
                        }]
                    },{
                        xtype: "fieldset",
                        itemId: "filterConfigFieldset",
                        title: "Instellingen voor filtergereedschap",
                        collapsible: false,
                        defaultType: "textfield",
                        layout: "fit",
                        height: 400,
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
                                    var grid = Ext.ComponentQuery.query("#configuredFiltersGrid")[0];
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
                    itemId: 'configuredFiltersGrid',
                    title: 'Toegevoegde filters',
                    height: 430,
                    flex: 0.4,
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
            container: Ext.ComponentQuery.query("#filterConfigFieldset")[0]
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
        var store = Ext.create("Ext.data.Store", {
            fields: [{name: "id", type: 'int'}, "serviceId", "layerName", "alias"]
        });

        Ext.Object.each(this.getAppConfig().appLayers, function(id, appLayer) {
            if(appLayer.attributes.length > 0) {
                store.add({id: id, serviceId: appLayer.serviceId, layerName: appLayer.layerName, alias: appLayer.alias});
            }
        });
        return store;
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