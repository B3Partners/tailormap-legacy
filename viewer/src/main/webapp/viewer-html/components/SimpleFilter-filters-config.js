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
            fieldLabel: i18next.t('viewer_components_sf_config_0'),
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }, {
            fieldLabel: i18next.t('viewer_components_sf_config_1'),
            name: "start",
            value: Ext.isDefined(this.configObject.start) ? this.configObject.start : this.getDefaultStartValue(),
            qtip: i18next.t('viewer_components_sf_config_2'),
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
         var filters = [{
                label:  i18next.t('viewer_components_sf_config_81'),
                id: -1
            }];
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
            fieldLabel: i18next.t('viewer_components_sf_config_3'),
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }];

        return items;
    },
    getTitle : function(){
        return i18next.t('viewer_components_sf_config_4');
    }
});

Ext.define("viewer.components.sf.TextlabelConfig", {
    extend: "viewer.components.sf.Config",
    constructor : function (config){
        viewer.components.sf.TextlabelConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        return [{
            fieldLabel: i18next.t('viewer_components_sf_config_5'),
            name: 'textlabel',
            value: this.configObject.textlabel ? this.configObject.textlabel : ""
        }];
    },
    getTitle : function(){
        return i18next.t('viewer_components_sf_config_6');
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
            { text: i18next.t('viewer_components_sf_config_7'), dataIndex: 'label', flex: 1, menuDisabled: true, sortable: false, editor: { xtype: 'textfield', allowBlank: false } },
            { text: i18next.t('viewer_components_sf_config_8'), dataIndex: 'value', flex: 1, menuDisabled: true, sortable: false, editor: { xtype: 'textfield', allowBlank: false } },
            { xtype: 'actioncolumn', menuDisabled: true, sortable: false, width: 30, items: [{
                icon: false,
                iconCls: 'x-fa fa-minus-circle',
                tooltip: i18next.t('viewer_components_sf_config_9'),
                handler: function (grid, rowIndex, colIndex) {
                    grid.getStore().removeAt(rowIndex);
                }
            }]}
        ];
        if(this.setDefaultValue) {
            columns.splice(2, 0, { text: i18next.t('viewer_components_sf_config_10'), dataIndex: 'defaultVal', xtype: 'checkcolumn', tooltip: i18next.t('viewer_components_sf_config_11'), width: 80, menuDisabled: true, sortable: false });
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
                text: i18next.t('viewer_components_sf_config_12'),
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
        return i18next.t('viewer_components_sf_config_13');
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
        return i18next.t('viewer_components_sf_config_14');
    }
});

Ext.define("viewer.components.sf.DateConfig", {
    extend: "viewer.components.sf.Config",
    constructor : function (config) {
        viewer.components.sf.DateConfig.superclass.constructor.call(this, config, /*setDefaultValue=*/false);
    },
    getFormItems : function(){
        var items =  [{
            fieldLabel: i18next.t('viewer_components_sf_config_15'),
            name: 'label',
            value: this.configObject.label ? this.configObject.label : ""
        }, {
            fieldLabel: i18next.t('viewer_components_sf_config_16'),
            name: "start",
            value: Ext.isDefined(this.configObject.start) ? this.configObject.start : this.getDefaultStartValue(),
            qtip: i18next.t('viewer_components_sf_config_17'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_18'),
            name: "datepickerType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "bt", label: i18next.t('viewer_components_sf_config_19')},
                    {type: "gt", label: i18next.t('viewer_components_sf_config_20')},
                    {type: "lt", label: i18next.t('viewer_components_sf_config_21')}
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
        return i18next.t('viewer_components_sf_config_22');
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
            fieldLabel: i18next.t('viewer_components_sf_config_23'),
            name: "comboType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "unique", label: i18next.t('viewer_components_sf_config_24')},
                    {type: "own", label: i18next.t('viewer_components_sf_config_25')},
                    {type: "range", label: i18next.t('viewer_components_sf_config_26')}
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
            fieldLabel: i18next.t('viewer_components_sf_config_27'),
            name: "min",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "range") || !this.configObject.comboType,
            id: "min",
            qtip: i18next.t('viewer_components_sf_config_28'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_29'),
            name: "max",
            hidden: ( this.configObject.comboType && this.configObject.comboType !== "range" ) || !this.configObject.comboType,
            qtip: i18next.t('viewer_components_sf_config_30'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_31'),
            name: "ownValues",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "own") || this.configObject.comboType,
            id: "ownValues",
            qtip: i18next.t('viewer_components_sf_config_32'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_33'),
            name: "maxFeatures",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "maxFeatures",
            qtip: i18next.t('viewer_components_sf_config_34'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_35'),
            name: "linkedFilter",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilter",
            qtip: i18next.t('viewer_components_sf_config_36'),
            value: this.configObject.linkedFilter ? this.configObject.linkedFilter : "",
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                },
                change: function (record, value) {
                    if (value === -1) {
                        Ext.getCmp("linkedFilterAttribute").setValue(null);
                        Ext.getCmp("linkedFilter").setValue(null);
                    }
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
            fieldLabel: i18next.t('viewer_components_sf_config_37'),
            name: "linkedFilterAttribute",
            hidden: (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilterAttribute",
            qtip: i18next.t('viewer_components_sf_config_38'),
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
        return i18next.t('viewer_components_sf_config_39');
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
            fieldLabel: i18next.t('viewer_components_sf_config_40'),
            name: "fieldLabel",
            qtip: i18next.t('viewer_components_sf_config_41'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_42'),
            name: "min",
            qtip: i18next.t('viewer_components_sf_config_43'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_44'),
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: i18next.t('viewer_components_sf_config_45'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_46'),
            name: "numberType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "eq", label: i18next.t('viewer_components_sf_config_47')},
                    {type: "gt", label: i18next.t('viewer_components_sf_config_48')},
                    {type: "lt", label: i18next.t('viewer_components_sf_config_49')}
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
        return i18next.t('viewer_components_sf_config_50');
    }

});


Ext.define("viewer.components.sf.TextConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.TextConfig.superclass.constructor.call(this, config);
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([{
            xtype: 'combo',
            fieldLabel: i18next.t('viewer_components_sf_config_51'),
            name: "filterType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "eq", label: i18next.t('viewer_components_sf_config_52')},
                    {type: "ilike", label: i18next.t('viewer_components_sf_config_53')}
                ]
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "type",
            value: this.configObject.filterType ? this.configObject.filterType : "eq"
        }]);
        return items;
    },
    getDefaultStartValue : function (){
        return "";
    },
    getTitle : function(){
        return i18next.t('viewer_components_sf_config_54');
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
            fieldLabel: i18next.t('viewer_components_sf_config_55'),
            name: "min",
            qtip: i18next.t('viewer_components_sf_config_56'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_57'),
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: i18next.t('viewer_components_sf_config_58'),
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        }, {
            fieldLabel: i18next.t('viewer_components_sf_config_59'),
            name: "step",
            value: this.configObject.step ? this.configObject.step : "1"
        }, {
            xtype: 'combo',
            fieldLabel: i18next.t('viewer_components_sf_config_60'),
            name: "sliderType",
            store: Ext.create("Ext.data.Store", {
                fields: ["type", "label"],
                data: [
                    {type: "eq", label: i18next.t('viewer_components_sf_config_61')},
                    {type: "gt", label: i18next.t('viewer_components_sf_config_62')},
                    {type: "lt", label: i18next.t('viewer_components_sf_config_63')},
                    {type: "range", label: i18next.t('viewer_components_sf_config_64')}
                ]
            }),
            queryModes: "local",
            displayField: "label",
            editable: false,
            valueField: "type",
            value: this.configObject.sliderType ? this.configObject.sliderType : "eq"
        }, {
            fieldLabel: i18next.t('viewer_components_sf_config_65'),
            name: "valueFormatString",
            value: this.configObject.valueFormatString ? this.configObject.valueFormatString : "",
            qtip: i18next.t('viewer_components_sf_config_66'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_67'),
            name: "linkedFilter",
            hidden: false,// (this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilter",
            qtip: i18next.t('viewer_components_sf_config_68'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_69'),
            name: "linkedFilterAttribute",
            hidden: false,//(this.configObject.comboType && this.configObject.comboType !== "unique") || !this.configObject.comboType,
            id: "linkedFilterAttribute",
            qtip: i18next.t('viewer_components_sf_config_70'),
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
        return i18next.t('viewer_components_sf_config_71');
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
            fieldLabel: i18next.t('viewer_components_sf_config_72'),
            name: "min",
            qtip: i18next.t('viewer_components_sf_config_73'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_74'),
            name: "max",
            value: this.configObject.max ? this.configObject.max : "",
            qtip: i18next.t('viewer_components_sf_config_75'),
            listeners: {
                render: function (c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: c.qtip
                    });
                }
            }
        },{
            fieldLabel: i18next.t('viewer_components_sf_config_76'),
            name: "fieldLabelMin",
            qtip: i18next.t('viewer_components_sf_config_77'),
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
            fieldLabel: i18next.t('viewer_components_sf_config_78'),
            name: "fieldLabelMax",
            qtip: i18next.t('viewer_components_sf_config_79'),
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
        return i18next.t('viewer_components_sf_config_80');
    }

});
