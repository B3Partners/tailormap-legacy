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

Ext.define("viewer.components.sf.SliderConfig", {
    configObject: null,

    constructor: function(configObject, renderTo) {
        this.configObject = configObject;
        
        
        //Ext.create
    },
    getConfig: function() {
    }
});

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",

    filterStore: null,
    
    filterConfigurer: null,
    
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        var title = config && config.title ? config.title : "";
        
        Ext.tip.QuickTipManager.init();  // enable tooltips
        
        var filterTypes = Ext.create("Ext.data.Store", {
            fields: ["type", "label"],
            data: [ 
                {type: "slider", label: "Slider"},
                {type: "combo", label: "Selectielijst"},
                {type: "checkbox", label: "Vinkvak"},
                {type: "radio", label: "Keuzerondje"}
            ]
        });
        
        this.filterStore = Ext.create("Ext.data.Store", {
            fields: ["type", "label", "description"],
            data: [
            ]
        });
        
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
                        blankText: 'Selecteer een optie',        
                        store: filterTypes,
                        queryModes: "local",
                        displayField: "label",
                        valueField: "type",
                        listeners: {
                            select: function(combo, records, eOpts) {
                                var type = records[0].get("type");
                                var configurerClass = "viewer.components.sf." + type.substring(0,1).toUpperCase() + type.substring(1) + "Config";
                                
                                me.filterConfigurer = Ext.create(configurerClass, {
                                    configObject: me,
                                    renderTo: "filterConfigFieldset"
                                });
                            }
                        }
                    },{
                        xtype: "fieldset",
                        id: "filterConfigFieldset",
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
                            valueField: "id",
                            listeners: {
                                select: function(combo, records, eOpts) {
                                    var layerId = records[0].get("id");
                                    
                                    var appLayer = appConfig.appLayers[layerId];
                                    
                                    var ac = Ext.getCmp("attributeCombo");
                                    var store = ac.getStore();
                                    
                                    store.removeAll();
                                    
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
                            valueField: "name",
                            listeners: {
                                select: function(combo, records, eOpts) {
                                    var attributeName = records[0].get("name");
                                    
                                    Ext.getCmp("attributeInfo").setValue("Type: " + records[0].get("type"));
                                }
                            }
                        },{
                            xtype: 'displayfield',
                            id: 'attributeInfo',
                            fieldLabel: 'Attribuut info',
                            value: ''
                        }]
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
                        margin: '0 0 5 0'
                    },{
                        xtype: 'button',
                        text: 'x',
                        margin: '0 0 15 0'
                    },{
                        xtype: 'button',
                        text: 'u',
                        margin: '0 0 5 0'
                    },{
                        xtype: 'button',
                        text: 'd'
                    }]
                }, {
                    xtype: 'gridpanel',
                    title: 'Toegevoegde filters',
                    height: 430,
                    columnWidth: 0.48,
                    store: this.filterStore,
                    columns: [
                        {header: 'Soort', dataIndex: 'label', sortable: false, hideable: false},
                        {header: 'Instellingen', dataIndex: 'description', sortable: false, hideable: false, flex: 1}
                    ]
                }]
            }]
        });
        
        /*this.titleField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Titel (optioneel, wordt gebruikt voor tabbladen)',
            name: 'title',
            value: title,
            labelWidth: 275,
            width: 500,
            renderTo: Ext.get(parentid)
        });
        this.titleField.focus(false, true);*/
        return this;
    },
    
    getConfiguration: function(){
        return { title: 'hoi'};
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
    }
});

