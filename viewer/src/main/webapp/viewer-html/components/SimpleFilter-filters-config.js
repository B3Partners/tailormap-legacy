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

Ext.define("viewer.components.sf.Config", {
    configObject: null,
    id: null,
    form: null,
    constructor: function (config) {
        this.configObject = config.configObject;
        this.id = this.configObject.id ? this.configObject.id : Ext.id();
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

        Ext.getCmp(config.renderTo).items.add(this.form);
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

Ext.define("viewer.components.sf.CheckboxConfig", {
    extend: "viewer.components.sf.Config",
    constructor: function(config) {
        viewer.components.sf.CheckboxConfig.superclass.constructor.call(this, config);
        if(config.configObject.options){
            for (var i = 0 ; i < config.configObject.options.length ; i++){
                var option = config.configObject.options[i];
                this.addOption(option);
            }
        }
    },
    getFormItems : function(){
        var items = this.callParent();
        items = items.concat([
        {
            name: "addOption",
            xtype: "button",
            id: "addOption",
            text: "Voeg optie toe",
            listeners: {
                click: {
                    fn: function () {
                        this.addOption();
                    },
                    scope: this
                }
            }
        },
        {
            xtype: "panel",
            border: 0,
            id: "optionsPanel",
            items : []
        }
        ]);
        return items;
    },
    addOption: function(entry){
        if (!entry){
            entry = {
                id : Ext.id()
            };
        }
        var panel = Ext.getCmp("optionsPanel");
        var items = [{
            name: "label" + entry.id,
            flex:1,
            id: "label" + entry.id,
            value: entry.label
        },
        {
            name: "value" + entry.id,
            id: "value"+ entry.id,
            flex:1,
            value: entry.value
        },
        {
            xtype: "button",
            id: "remove" + entry.id,
            name: "remove" + entry.id,
            text: "X",
            width: 25,
            flex:0,
            listeners:{
                click:{
                    scope:this,
                    fn:function (button) {
                        var id = button.getId().substring("remove".length);
                        this.removeOption(id);
                    }
                }
            }
        }];
        if (panel.items.length=== 0) {
            var header = Ext.create("Ext.container.Container", {
                layout: {
                    type: 'hbox'
                },
                border: 0,
                defaults: {
                    flex: 1
                },
                defaultType: "textfield",
                items:  [
                    {
                        xtype: 'label',
                        forId: 'label' + entry.id,
                        text: 'Label'
                    },
                    {
                        xtype: 'label',
                        forId: 'value' + entry.id,
                        text: 'Waarde'
                    },
                    {
                        xtype: 'label',
                        forId: 'remove' + entry.id,
                        text: 'Verwijder'
                    }
                ]
            });
            panel.add(header);
        }
        var item = Ext.create("Ext.container.Container", {
            id: "optionContainer" + entry.id,
            layout: {
                type: 'hbox'
            },
            border: 0,
            defaults: {
                flex: 1
            },
            defaultType: "textfield",
            items: items
        });
        panel.add(item);
    },
    removeOption : function(id){
        var panel = Ext.getCmp("optionsPanel");
        var container = Ext.getCmp("optionContainer" + id);
        panel.remove(container);
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
        var panel = Ext.getCmp("optionsPanel");
        for(var i = 1 ; i < panel.items.items.length ; i++){
            var item = panel.items.items[i];
            var data =item.items.items;
            var id = data[0].getId().substring(5);
            var option = {
                label: data[0].getValue(),
                value: data[1].getValue(),
                id: id
            };
            options.push(option);
        }
        config.options = options;
        return config;
    }
});

Ext.define("viewer.components.sf.RadioConfig", {
    extend: "viewer.components.sf.CheckboxConfig",
    constructor : function (config){
        viewer.components.sf.RadioConfig.superclass.constructor.call(this, config);

    },
    getTitle : function(){
        return "Keuzerondje";
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
                change: {
                    scope: this,
                    fn: function(obj, newValue){
                        var min = Ext.getCmp("min");
                        var max = Ext.getCmp("max");
                        var ownValues = Ext.getCmp("ownValues");
                        if(newValue === "unique" ){
                            min.hide();
                            max.hide();
                            ownValues.hide();
                        }else if (newValue === "range"){
                            min.show();
                            max.show();
                            ownValues.hide();
                        }else if (newValue === "own"){
                            min.hide();
                            max.hide();
                            ownValues.show();
                        }
                    }
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
            hidden: (this.configObject.comboType && this.configObject.comboType !== "own") || !this.configObject.comboType,
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
        }
        ]);
        return items;
    },
    getDefaultStartValue : function (){
        return "max";
    },
    getTitle : function (){
        return "Selectielijst";
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