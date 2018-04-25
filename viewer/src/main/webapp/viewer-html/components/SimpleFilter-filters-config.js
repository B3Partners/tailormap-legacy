/*
 * Copyright (C) 2012-2014 B3Partners B.V.
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

Ext.define("viewer.components.sf.Config", {
    configObject: null,
    id: null,
    form: null,
    configurator: null,
    constructor: function (config) {
        this.configObject = config.configObject;
        this.configurator = config.configurator;
        this.id = this.configObject.id ? this.configObject.id : Date.now();
        var items = this.getFormItems();
        this.form = Ext.create("Ext.form.Panel", {
            title: this.getTitle(),
            width: 325,
            bodyPadding: 5,
            layout: 'anchor',
            defaults: {
                anchor: '100%',
                flex:1
            },
            defaultType: 'textfield',
            items: items
        });

        if(config.renderTo) {
            Ext.ComponentQuery.query(config.renderTo)[0].add(this.form);
        }
        if(config.container) {
            config.container.add(this.form);
        }
    },
    getFormItems: function () {
        var items = [{
            fieldLabel: 'Label',
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }, {
            fieldLabel: "Beginwaarde(s)",
            name: "start",
            value: Ext.isDefined(this.configObject.start) ? this.configObject.start : this.getDefaultStartValue(),
            qtip: "Vul een vaste waarde in of 'min' of 'max'. Bij een slider voor een bereik geef twee waardes op gescheiden door een komma",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }];

        return items;
    },
    getConfig: function() {
        var config = this.form.getValues();
        config.id = this.id;
        return config;
    },
    getDefaultStartValue : function(){
        console.log("Error: getDefaultStartValue() not yet implemented");
    },
    getTitle : function(){
        console.log("Error: getTitle() not yet implemented");
    },
    getOtherFilters: function(){
         var filters = [];
        var currentConfig = null;
        for(var i = 0 ; i <this.configurator.filterConfigs.length; i++){
            var f = this.configurator.filterConfigs[i];
            if(f.config.id !== this.id && f.appLayerId !== null){
                var type = "";
                var appLayer = this.configurator.getAppConfig().appLayers[f.appLayerId];
                filters.push({
                    label: this.configurator.createDescription(type, appLayer, f),
                    id: f.config.id
                });
            }
        }
        return filters;
        if(currentConfig){
            var currentAppLayer = this.configurator.getAppConfig().appLayers[currentConfig.appLayerId];
            var attrs = [];
            Ext.Array.each(currentAppLayer.attributes, function(attr) {
                attrs.push({
                    name : attr.name,
                    label : attr.alias || attr.name,
                    type : attr.type
                });
            });
        }
    },
    getAttributes: function(){
        for (var i = 0; i < this.configurator.filterConfigs.length; i++) {
            var f = this.configurator.filterConfigs[i];
            if (f.config.id === this.id) {
                var currentAppLayer = this.configurator.getAppConfig().appLayers[f.appLayerId];
                var attrs = [];
                Ext.Array.each(currentAppLayer.attributes, function (attr) {
                    attrs.push({
                        name: attr.name,
                        label: attr.alias || attr.name,
                        type: attr.type
                    });
                });
                return attrs;
            }
        }
    }
});


Ext.define("viewer.components.sf.ResetConfig", {
    extend: "viewer.components.sf.Config",
    constructor : function (config){
        viewer.components.sf.ResetConfig.superclass.constructor.call(this, config);

    },

    getFormItems : function(){
        var items = [{
            fieldLabel: 'Label',
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }];

        return items;
    },
    getTitle : function(){
        return "Reset filter knop";
    }
});

Ext.define("viewer.components.sf.TextlabelConfig", {
    extend: "viewer.components.sf.Config",
    constructor : function (config){
        viewer.components.sf.TextlabelConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        return [{
            fieldLabel: 'Tekst',
            name: 'textlabel',
            value: this.configObject.textlabel ? this.configObject.textlabel : ""
        }];
    },
    getTitle : function(){
        return "Tekst label";
    }
});

Ext.define("viewer.components.sf.CheckboxConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config, setDefaultValue) {
        this.setDefaultValue = typeof setDefaultValue !== "undefined" ? setDefaultValue : true;
        this.createStore(config);
        viewer.components.sf.CheckboxConfig.superclass.constructor.call(this, config);
    },
    createStore: function(config) {
        var fields = [
            { name: 'id', type: 'string' },
            { name: 'label', type: 'string' },
            { name: 'value', type: 'string' }
        ];
        if(this.setDefaultValue) {
            fields.push({ name: 'defaultVal', type: 'boolean', defaultValue: false });
        }
        Ext.define('viewer.components.sf.CheckboxOption', {
            extend: 'Ext.data.Model',
            requires: [
                'Ext.data.identifier.Uuid'
            ],
            fields: fields,
            idProperty: 'id',
            identifier : 'uuid'
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'viewer.components.sf.CheckboxOption',
            data: []
        });
        if(config.configObject.options){
            for (var i = 0 ; i < config.configObject.options.length ; i++){
                this.addOption(config.configObject.options[i]);
            }
        }
    },
    addOption: function(option) {
        if(!option) {
            option = {};
        }
        this.store.add(option);
    },
    getFormItems : function(){
        var items = this.callParent();
        var columns = [
            { text: 'Label', dataIndex: 'label', flex: 1, menuDisabled: true, sortable: false, editor: { xtype: 'textfield', allowBlank: false } },
            { text: 'Waarde', dataIndex: 'value', flex: 1, menuDisabled: true, sortable: false, editor: { xtype: 'textfield', allowBlank: false } },
            { xtype: 'actioncolumn', menuDisabled: true, sortable: false, width: 30, items: [{
                icon: false,
                iconCls: 'x-fa fa-minus-circle',
                tooltip: 'Verwijder',
                handler: function (grid, rowIndex, colIndex) {
                    grid.getStore().removeAt(rowIndex);
                }
            }]}
        ];
        if(this.setDefaultValue) {
            columns.splice(2, 0, { text: 'Standaard', dataIndex: 'defaultVal', xtype: 'checkcolumn', tooltip: 'Standaard aan/uit', width: 80, menuDisabled: true, sortable: false });
        }
        var grid = Ext.create("Ext.grid.Panel", {
            store: this.store,
            selModel: 'cellmodel',
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1,
                pluginId: 'celleditor'
            },
            columns: columns,
            height: 150,
            width: 315
        });
        items.push(
            {
                name: "addOption",
                xtype: "button",
                id: "addOption",
                text: "Voeg optie toe",
                listeners: {
                    click: {
                        fn: function () {
                            this.addOption(null);
                            grid.getPlugin('celleditor').startEditByPosition({
                                row: this.store.count() - 1,
                                column: 0
                            });
                        },
                        scope: this
                    }
                }
            },
            grid
        );
        return items;
    },
    getTitle : function (){
        return "Vinkvak";
    },
    getDefaultStartValue : function (){
        return "";
    },
    getConfig : function(){
        var parentConfig = this.callParent();
        var config = {
            id: parentConfig.id,
            label : parentConfig.label,
            start: parentConfig.start
        };
        var options = [];
        this.store.each(function(record) {
            var option = {
                label: record.get("label"),
                value: record.get("value"),
                id: record.get("id")
            };
            if(this.setDefaultValue) {
                option.defaultVal = record.get("defaultVal");
            }
            options.push(option);
        }, this);
        config.options = options;
        return config;
    }
});

Ext.define("viewer.components.sf.RadioConfig", {
    extend: "viewer.components.sf.CheckboxConfig",
    constructor : function (config) {
        viewer.components.sf.RadioConfig.superclass.constructor.call(this, config, /*setDefaultValue=*/false);
    },
    getTitle : function(){
        return "Keuzerondje";
    }
});

Ext.define("viewer.components.sf.DateConfig", {
    extend: "viewer.components.sf.Config",
    constructor : function (config) {
        viewer.components.sf.DateConfig.superclass.constructor.call(this, config, /*setDefaultValue=*/false);
    },
    getFormItems : function(){
        var items =  [{
            fieldLabel: 'Label',
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }, {
            fieldLabel: "Beginwaarde(s)",
            name: "start",
            value: Ext.isDefined(this.configObject.start) ? this.configObject.start : this.getDefaultStartValue(),
            qtip: "Vul een vaste waarde in. Gebruik 'curweek' i.c.m. twee datumprikkers om in het begin te filteren op de huidige week.",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }];
        items = items.concat([{
            xtype: 'combo',
            fieldLabel: "Type",
            name: "datepickerType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "bt", label: "Attribuut ligt tussen datum"},
                    {type: "gt", label: "Attribuut ligt na datum"},
                    {type: "lt", label: "Attribuut ligt voor datum"}
                ]
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "type",
            value: this.configObject.datepickerType ? this.configObject.datepickerType : "bt"
        }]);

        return items;
    },
    getTitle : function(){
        return "Datum";
    }
});

Ext.define("viewer.components.sf.ComboConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.ComboConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([ {
            xtype: 'combo',
            fieldLabel: "Waardes selectielijst",
            name: "comboType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "unique", label: "Unieke waardes uit bron"},
                    {type: "own", label: "Eigen waardes toevoegen"},
                    {type: "range", label: "Numerieke waardes tussen bereik genereren."}
                ]
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "type",
            value: this.configObject.comboType ? this.configObject.comboType : "unique",
            listeners: {
                scope: this,
                change: function(obj, newValue){
                    this.toggleComboType(newValue);
                },
                render: function(obj) {
                    this.toggleComboType(this.configObject.comboType || "unique");
                }
            }
        },
        {
            fieldLabel: "Minimale waarde",
            name: "min",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "range") || !this.configObject.comboType,
            id: "min",
            qtip: "De minimale waarde voor de waardes in het bereik",
            value: this.configObject.min ? this.configObject.min : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Maximale waarde",
            name: "max",
            hidden: ( this.configObject.comboType && this.configObject.comboType !== "range" ) || !this.configObject.comboType,
            qtip: "De maximale waarde voor de waardes in het bereik",
            id: "max",
            value: this.configObject.max ? this.configObject.max : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Eigen waardes",
            name: "ownValues",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "own") || this.configObject.comboType,
            id: "ownValues",
            qtip: "Vul hier een lijst met eigen waardes in. De waardes moeten komma gescheiden zijn, bijvoorbeeld: 1,2,3",
            value: this.configObject.ownValues ? this.configObject.ownValues : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Max. features",
            name: "maxFeatures",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "maxFeatures",
            qtip: "Vul hier het aantal features in dat maximaal opgehaald wordt. Afhankelijk van service/database die erachter zit.",
            value: this.configObject.maxFeatures ? this.configObject.maxFeatures : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },{ 
            xtype: 'combo',
            store: Ext.create("Ext.data.Store", {
                fields: ["id", "label"],
                data: this.getOtherFilters()
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "id",
            fieldLabel: "Gekoppeld filter",
            name: "linkedFilter",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilter",
            qtip: "Kies hier het filter dat kan dienen als invoer voor dit filter. Gebruik dit om getrapte zoekers te maken.",
            value: this.configObject.linkedFilter ? this.configObject.linkedFilter : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                },
                scope:this
            }
        },
        { 
            xtype: 'combo',
            store: Ext.create("Ext.data.Store", {
                fields: ["name", "label", "type"],
                data: this.getAttributes()
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "name",
            fieldLabel: "Attribuut voor gekoppeld filter",
            name: "linkedFilterAttribute",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilterAttribute",
            qtip: "Kies hier het attribuut waarop het filter hierboven effect op heeft",
            value: this.configObject.linkedFilterAttribute ? this.configObject.linkedFilterAttribute : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                },
                scope:this
            }
        }
        ]);
        return items;
    },
    toggleComboType: function(newValue) {
        var min = Ext.getCmp("min");
        var max = Ext.getCmp("max");
        var ownValues = Ext.getCmp("ownValues");
        var maxFeatures = Ext.getCmp("maxFeatures");
        var linkedFilter = Ext.getCmp("linkedFilter");
        var linkedFilterAttribute = Ext.getCmp("linkedFilterAttribute");
        if(newValue === "unique" ){
            min.hide();
            max.hide();
            ownValues.hide();
            maxFeatures.show();
            linkedFilter.show();
            linkedFilterAttribute.show();
        }else if (newValue === "range"){
            min.show();
            max.show();
            ownValues.hide();
            maxFeatures.hide();
            linkedFilter.hide();
            linkedFilterAttribute.hide();
        }else if (newValue === "own"){
            min.hide();
            max.hide();
            ownValues.show();
            maxFeatures.hide();
            linkedFilter.hide();
            linkedFilterAttribute.hide();
        }
    },
    getDefaultStartValue : function (){
        return "max";
    },
    getTitle : function (){
        return "Selectielijst";
    }
});

Ext.define("viewer.components.sf.NumberConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.NumberConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([{
            fieldLabel: "Label achter nummerveld",
            name: "fieldLabel",
            qtip: "Label dat achter het nummer veld komt",
            value: this.configObject.fieldLabel ? this.configObject.fieldLabel : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },{
            fieldLabel: "Minimale waarde",
            name: "min",
            qtip: "Indien geen waarde ingevuld wordt kleinste attribuutwaarde uit de attribuutlijst gebruikt",
            value: this.configObject.min ? this.configObject.min : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Maximale waarde",
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: "Indien geen waarde ingevuld wordt grootste attribuutwaarde uit de attribuutlijst gebruikt",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },{
            xtype: 'combo',
            fieldLabel: "Type",
            name: "numberType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "eq", label: "Attribuut gelijk aan ingevuld nummer"},
                    {type: "gt", label: "Attribuut groter dan ingevuld nummer"},
                    {type: "lt", label: "Attribuut kleiner dan ingevuld nummer"}
                ]
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "type",
            value: this.configObject.numberType ? this.configObject.numberType : "eq"
        }]);
        return items;
    },
    getDefaultStartValue : function (){
        return 0;
    },
    getTitle : function(){
        return "Getalfilter";
    }

});

Ext.define("viewer.components.sf.SliderConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.SliderConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([{
            fieldLabel: "Minimale waarde",
            name: "min",
            qtip: "Indien geen waarde ingevuld wordt kleinste attribuutwaarde uit de attribuutlijst gebruikt",
            value: this.configObject.min ? this.configObject.min : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Maximale waarde",
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: "Indien geen waarde ingevuld wordt grootste attribuutwaarde uit de attribuutlijst gebruikt",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Stap",
            name: "step",
            value: this.configObject.step ? this.configObject.step : "1"
        }, {
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
            value: this.configObject.sliderType ? this.configObject.sliderType : "eq"
        }, {
            fieldLabel: "Waarde format string",
            name: "valueFormatString",
            value: this.configObject.valueFormatString ? this.configObject.valueFormatString : "",
            qtip: "Laat leeg om geen waarde van de schuifjes te tonen. Voorbeelden format strings: '0' (alleen hele getallen), '0 m²' (met eenheid), '0.00' (twee decimalen), '0,000' (met duizendtalscheidingsteken), '€ 0,000.00' (bedrag)",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },
    ,{ 
            xtype: 'combo',
            store: Ext.create("Ext.data.Store", {
                fields: ["id", "label"],
                data: this.getOtherFilters()
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "id",
            fieldLabel: "Gekoppeld filter",
            name: "linkedFilter",
            hidden: false,// (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilter",
            qtip: "Kies hier het filter dat kan dienen als invoer voor dit filter. Gebruik dit om getrapte zoekers te maken.",
            value: this.configObject.linkedFilter ? this.configObject.linkedFilter : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                },
                scope:this
            }
        },
        { 
            xtype: 'combo',
            store: Ext.create("Ext.data.Store", {
                fields: ["name", "label", "type"],
                data: this.getAttributes()
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "name",
            fieldLabel: "Attribuut voor gekoppeld filter",
            name: "linkedFilterAttribute",
            hidden: false,//(this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilterAttribute",
            qtip: "Kies hier het attribuut waarop het filter hierboven effect op heeft",
            value: this.configObject.linkedFilterAttribute ? this.configObject.linkedFilterAttribute : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                },
                scope:this
            }
        }]);
        return items;
    },
    getDefaultStartValue : function (){
        return "min,max";
    },
    getTitle : function(){
        return "Slider";
    }

});

Ext.define("viewer.components.sf.NumberrangeConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.NumberrangeConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([{
            fieldLabel: "Minimale waarde",
            name: "min",
            qtip: "Indien geen waarde ingevuld wordt kleinste attribuutwaarde uit de attribuutlijst gebruikt",
            value: this.configObject.min ? this.configObject.min : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: "Maximale waarde",
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: "Indien geen waarde ingevuld wordt grootste attribuutwaarde uit de attribuutlijst gebruikt",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },{
            fieldLabel: "Label min. waarde",
            name: "fieldLabelMin",
            qtip: "Label dat achter het minimale waarde veld komt",
            value: this.configObject.fieldLabelMin ? this.configObject.fieldLabelMin : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },{
            fieldLabel: "Label max. waarde",
            name: "fieldLabelMax",
            qtip: "Label dat achter het maximale waarde veld komt",
            value: this.configObject.fieldLabelMax ? this.configObject.fieldLabelMax : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }]);
        return items;
    },
    getDefaultStartValue : function (){
        return "";
    },
    getTitle : function(){
        return "Getalrange";
    }

});
