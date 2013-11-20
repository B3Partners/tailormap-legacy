/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
/**
 * Custom configuration object for Buffer configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId,configObject){
        if (configObject === null){
            configObject = {};
        }
        this.labelWidth=200;
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectGroups !== undefined ? configObject.selectGroups : true,
            name: "selectGroups",
            fieldLabel: "Kaarten selecteren",
            labelWidth: this.labelWidth,
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectLayers !== undefined ? configObject.selectLayers : true,
            name: "selectLayers",
            labelWidth: this.labelWidth,
            fieldLabel: "Kaartlagen selecteren",
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectOwnServices !== undefined ? configObject.selectOwnServices : true,
            name: "selectOwnServices",
            labelWidth: this.labelWidth,
            fieldLabel: "Eigen services selecteren",
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectCsw !== undefined ? configObject.selectCsw : true,
            name: "selectCsw",
            labelWidth: this.labelWidth,
            fieldLabel: "CSW service doorzoeken",
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        
        this.form.add({
            xtype: "textfield",
            value: configObject.defaultCswUrl !== undefined ? configObject.defaultCswUrl : "",
            name: "defaultCswUrl",
            labelWidth: this.labelWidth,
            fieldLabel: "Standaard CSW Url",
            width: 500
        });
        
        this.form.add({
            xtype: "checkbox",
            checked: configObject.advancedFilter !== undefined ? configObject.advancedFilter : false,
            name: "advancedFilter",
            labelWidth: this.labelWidth,
            fieldLabel: "Gebruik een geavanceerd filter",
            width: 500,
            listeners:{
                change:{
                    fn:function(obj, val){
                        Ext.getCmp("advancedFilterFieldset").setVisible(val);
                    },
                    scope:this
                }
            }
        });
        
        var waardeItems = new Array();
        var configWaardes = configObject.advancedValueConfigs;
        if(typeof configWaardes !== "undefined") {
            for (var i = 0 ; i < configWaardes.length ;i++){
                var waarde = configWaardes[i];
                var item = this.createRow(waarde.label, waarde.value);
                waardeItems.push(item);
            }
        }
        this.form.add({
            xtype: "fieldset",
            name: "advancedFilterFieldset",
            id: "advancedFilterFieldset",
            hidden: configObject.advancedFilter !== undefined ? !configObject.advancedFilter : true ,
            labelWidth: this.labelWidth,
            fieldLabel: "Gebruik een geavanceerd filter",
            width: "100%",
            layout: {
                type: 'vbox'
            },
            height: 220,
            padding: '5 5 0 5',
            items:[
                {
                    xtype: "checkbox",
                    checked: configObject.alwaysMatch !== undefined ? configObject.alwaysMatch : false,
                    name: "alwaysMatch",
                    id: "alwaysMatch",
                    labelWidth: this.labelWidth,
                    fieldLabel: "Match altijd met gegevensregister",
                    width: 500,
                },
                {
                    xtype: "textfield",
                    name: "advancedLabel",
                    id: "advancedLabel",
                    labelWidth: this.labelWidth,
                    fieldLabel: "Label voor het filterattribuut",
                    value: configObject.advancedLabel !== null ? configObject.advancedLabel : ""
                }, {
                    xtype: "textfield",
                    name: "advancedValue",
                    id: "advancedValue",
                    labelWidth: this.labelWidth,
                    fieldLabel: "Waarde voor het filterattribuut",
                    value: configObject.advancedValue !== null ? configObject.advancedValue : ""
                },{
                    xtype:"button",
                    name: "addValue",
                    text: "Voeg waarde toe",
                    listeners:{
                        click:{
                            fn:function(){
                                var valueSet = Ext.getCmp("advancedFilterValues");
                                valueSet.add(this.createRow('', ''));
                                valueSet.doLayout();
                            },
                            scope:this
                        }
                    }
                },
                {
                    xtype: "fieldset",
                    height: 130,
                    width: '100%',
                    title: "Waardes",
                    items: [{
                        xtype: 'container',
                        name: "advancedFilterValues",
                        id: "advancedFilterValues",
                        items: waardeItems,
                        autoScroll: true,
                        height: 110 // Weird ExtJS behaviour (bug?) does not take fieldset height into account when calculating layout
                    }]
                }
            ]
        });
        
    },
    createRow: function(labelValue, comboValue) {
        return {
            xtype: "container",
            layout: {
                type: "hbox",
                align: "stretch"
            },
            height: 27,
            defaults: {
                xtype: 'textfield',
                labelWidth: 50,
                width: 160,
                margin: '0 5 2 0'
            },
            items: [{
                    name: "label",
                    fieldLabel: "Label",
                    value: labelValue
                }, {
                    name: "comboValue",
                    fieldLabel: "Waarde",
                    value: comboValue
                }]
        };
    },
    getConfiguration: function() {
        var config = this.callParent(arguments);
        var advancedLabel = Ext.getCmp("advancedLabel");
        var advancedValue = Ext.getCmp("advancedValue");
        var alwaysMatch = Ext.getCmp("alwaysMatch");
        var values =  Ext.getCmp("advancedFilterValues");
        config.advancedLabel = advancedLabel !== null ? advancedLabel.getValue() : "";
        config.advancedValue = advancedValue !== null ? advancedValue.getValue() : "";
        config.alwaysMatch = alwaysMatch !== null ? alwaysMatch.getValue() : "";
        
        var items = values.items.items;
        
        var valueConfig = [];
        for (var i = 0 ; i< items.length ; i++){
            var item = items[i];
            var vals = item.items.items;
            var entry = {
                label : vals[0].getValue(),
                value : vals[1].getValue()
            };
            if(entry.label && entry.value && entry.label !=="" && entry.value !==""){
                valueConfig.push(entry);
            }
        }
        config.advancedValueConfigs = valueConfig;
        
        return config;
    }
});

