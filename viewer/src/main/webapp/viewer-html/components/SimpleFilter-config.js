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
    
    form: null,

    constructor: function(config) {
        this.configObject = config.configObject;
        
        this.form = Ext.create("Ext.form.Panel", {
            title: 'Slider',
            width: 325,
            bodyPadding: 5,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            defaultType: 'textfield',
            items: [{
                fieldLabel: 'Label',
                name: 'label'
            },{ 
                fieldLabel: "Minimale waarde",
                name: "min",
                qtip: "Indien geen waarde ingevuld wordt kleinste attribuutwaarde uit de attribuutlijst gebruikt",
                listeners: {
                    render: function(c) {
                        Ext.QuickTips.register({
                            target: c.getEl(),
                            text: c.qtip
                        });
                    }
                }            
            },{
                fieldLabel: "Maximale waarde",
                name: "max",
                qtip: "Indien geen waarde ingevuld wordt grootste attribuutwaarde uit de attribuutlijst gebruikt",
                listeners: {
                    render: function(c) {
                        Ext.QuickTips.register({
                            target: c.getEl(),
                            text: c.qtip
                        });
                    }
                }            
            },{
                fieldLabel: "Beginwaarde(s)",
                name: "start",
                value: "min,max",
                qtip: "Vul een vaste waarde in of 'min' of 'max'. Bij een slider voor een bereik geef twee waardes op gescheiden door een komma",
                listeners: {
                    render: function(c) {
                        Ext.QuickTips.register({
                            target: c.getEl(),
                            text: c.qtip
                        });
                    }
                }            
            },{
                fieldLabel: "Stap",
                name: "step",
                value: 1
            },{
                xtype: 'combo',
                fieldLabel: "Soort slider",
                name: "sliderType",
                store: Ext.create("Ext.data.Store", {
                    fields: ["type", "label"],
                    data: [ 
                        {type: "eq", label: "Attribuut gelijk aan waarde slider"},
                        {type: "gt", label: "Attribuut groter dan waarde slider"},
                        {type: "lt", label: "Attribuut kleiner dan waarde slider"},
                        {type: "range", label: "Attribuut binnen bereik (twee schuifjes)"}
                    ]
                }),
                queryModes: "local",
                displayField: "label",
                editable: false,
                valueField: "type",
                value: "eq"
            },{
                fieldLabel: "Waarde format string",
                name: "valueFormatString",
                value: "",
                qtip: "Laat leeg om geen waarde van de schuifjes te tonen. Voorbeelden format strings: '0' (alleen hele getallen), '0 m²' (met eenheid), '0.00' (twee decimalen), '0,000' (met duizendtalscheidingsteken), '€ 0,000.00' (bedrag)",
                listeners: {
                    render: function(c) {
                        Ext.QuickTips.register({
                            target: c.getEl(),
                            text: c.qtip
                        });
                    }
                }            
            }]
        });
        
        Ext.getCmp(config.renderTo).items.add(this.form);
    },
    getConfig: function() {
        var config = this.form.getValues();
        return config;
    }
});

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",

    filterStore: null,
    filterConfigs: null,
    
    filterConfigurer: null,
    
    currentEditIndex: null,
    
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
                {type: "radio", label: "Keuzerondje"},
                {type: "reset", label: "Reset filter knop"}
            ]
        });
        
        this.filterStore = Ext.create("Ext.data.Store", {
            fields: ["soort", "description"],
            data: [
            ]
        });
        
        this.filterConfigs = [];
        
        if(config.filters) {
            var me = this;
            Ext.Array.each(config.filters, function(filter) {
                var type = filter.class.substring(filter.class.lastIndexOf(".")+1);
                var soort = filterTypes.findRecord("type", type).get("label");
                var appLayer = appConfig.appLayers[config.layers[filter.appLayerId]];
                me.filterConfigs.push(filter);
                me.filterStore.add({soort: soort, description: (appLayer.alias || appLayer.layerName) + "." + filter.attributeName});
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
                        store: filterTypes,
                        queryModes: "local",
                        displayField: "label",
                        editable: false,
                        valueField: "type",
                        listeners: {
                            select: function(combo, records, eOpts) {
                                var type = records[0].get("type");
                                var configurerClass = "viewer.components.sf." + type.substring(0,1).toUpperCase() + type.substring(1) + "Config";
                                
                                if(type !== "slider") {
                                    Ext.MessageBox.alert("Concept", "Alleen Slider is nu beschikbaar");
                                    return;
                                }

                                me.filterConfigurer = Ext.create(configurerClass, {
                                    configObject: me,
                                    renderTo: "filterConfigFieldset"
                                });
                                Ext.getCmp("filterConfigFieldset").doLayout();
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
                                select: function(combo, records, eOpts) {
                                    var layerId = records[0].get("id");
                                    
                                    var appLayer = appConfig.appLayers[layerId];
                                    
                                    var ac = Ext.getCmp("attributeCombo");
                                    ac.clearValue();
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
                            editable: false,
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
                        items: [/*{
                            xtype: 'label',
                            text: 'Selecteer een laag en attribuut'
                        }*/]
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
                                fn: me.addClick,
                                scope: me
                            }
                        }
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
    
    addClick: function(button, e, eOpts) {
        console.log("addClick", this);
        if(this.filterConfigurer) {
            var filterConfigurerClass = this.filterConfigurer.self.getName();
            var filterControl = {
                class: filterConfigurerClass.substring(0, filterConfigurerClass.length - 6),
                appLayerId: Ext.getCmp("layerCombo").getValue(),
                attributeName: Ext.getCmp("attributeCombo").getValue(),
                config: this.filterConfigurer.getConfig()
            };
            var soort = filterConfigurerClass.substring(filterConfigurerClass.lastIndexOf('.')+1, filterConfigurerClass.length - 6);
            var appLayer = appConfig.appLayers[filterControl.appLayerId];
            var description = appLayer.alias + "." + filterControl.attributeName;
            console.log("add: ", soort, description, filterControl);
            this.filterConfigs.push(filterControl);
            this.filterStore.add({soort: soort, description: description});
        }
    },
    
    gridSelect: function(grid, record, index, eOpts) {
        this.currentEditIndex = index;
        Ext.MessageBox.alert("Concept", "Filtergereedschappen kunnen nog niet bewerkt worden...");
    },
    
    getConfiguration: function() {
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
    }
});

