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
        var me = this,
            handleChangeListener = {
                change: function(box) {
                    me.handleChange(box);
                }
            },
            checkboxgroupWidth = 500;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);
        this.form.add({
            xtype: 'checkboxgroup',
            columns: 2,
            width: checkboxgroupWidth,
            vertical: true,
            items: [{
                xtype: "checkbox",
                checked: configObject.selectGroups !== undefined ? configObject.selectGroups : true,
                name: "selectGroups",
                fieldLabel: "Kaarten selecteren",
                labelWidth: this.labelWidth,
                listeners: handleChangeListener
            },{
                xtype: "checkbox",
                checked: configObject.showSearchGroups !== undefined ? configObject.showSearchGroups : true,
                name: "showSearchGroups",
                fieldLabel: "Toon zoekveld",
                labelWidth: 80
            }]
        });
        this.form.add({
            xtype: 'checkboxgroup',
            columns: 2,
            width: checkboxgroupWidth,
            vertical: true,
            items: [{
                xtype: "checkbox",
                checked: configObject.selectLayers !== undefined ? configObject.selectLayers : true,
                name: "selectLayers",
                labelWidth: this.labelWidth,
                fieldLabel: "Kaartlagen selecteren",
                listeners: handleChangeListener
            },{
                xtype: "checkbox",
                checked: configObject.showSearchLayers !== undefined ? configObject.showSearchLayers : true,
                name: "showSearchLayers",
                fieldLabel: "Toon zoekveld",
                labelWidth: 80
            }]
        });
        this.form.add({
            xtype: 'checkboxgroup',
            columns: 2,
            width: checkboxgroupWidth,
            vertical: true,
            items: [{
                xtype: "checkbox",
                checked: configObject.selectOwnServices !== undefined ? configObject.selectOwnServices : true,
                name: "selectOwnServices",
                labelWidth: this.labelWidth,
                fieldLabel: "Eigen services selecteren",
                listeners: handleChangeListener
            },{
                xtype: "checkbox",
                checked: configObject.showSearchOwnServices !== undefined ? configObject.showSearchOwnServices : true,
                name: "showSearchOwnServices",
                fieldLabel: "Toon zoekveld",
                labelWidth: 80
            }]
        });
        
        this.form.add({
            xtype: 'checkboxgroup',
            columns: 2,
            width: checkboxgroupWidth,
            vertical: true,
            items: [{
                xtype: "checkbox",
                checked: configObject.selectCsw !== undefined ? configObject.selectCsw : true,
                name: "selectCsw",
                labelWidth: this.labelWidth,
                fieldLabel: "CSW service doorzoeken",
                listeners: handleChangeListener
            },{
                xtype: "checkbox",
                checked: configObject.showSearchCsw !== undefined ? configObject.showSearchCsw : true,
                name: "showSearchCsw",
                fieldLabel: "Toon zoekveld",
                labelWidth: 80
            }]
        });
        this.form.add({
            xtype: "textfield",
            value: configObject.defaultCswUrl !== undefined ? configObject.defaultCswUrl : "",
            name: "defaultCswUrl",
            id: "defaultCswUrl",
            labelWidth: this.labelWidth,
            fieldLabel: "Standaard CSW Url",
            width: 500
        });
        
           this.form.add({
            xtype: "checkbox",
            checked: configObject.showCswUrl !== undefined ? configObject.showCswUrl : true,
            name: "showCswUrl",
            id: "showCswUrl",
            labelWidth: this.labelWidth,
            fieldLabel: "Laat CSW url zien"
        });
        
        
         this.form.add({
            xtype: "checkbox",
            checked: configObject.showWhenOnlyBackground !== undefined ? configObject.showWhenOnlyBackground : true,
            name: "showWhenOnlyBackground",
            labelWidth: this.labelWidth,
            fieldLabel: "Laat zien bij opstarten indien er alleen achtergrondlagen zijn"
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
            height: 170,
            padding: '5 5 0 5',
            items:[
                {
                    xtype: "checkbox",
                    checked: configObject.alwaysMatch !== undefined ? configObject.alwaysMatch : false,
                    name: "alwaysMatch",
                    id: "alwaysMatch",
                    labelWidth: this.labelWidth,
                    fieldLabel: "Match altijd met gegevensregister",
                    width: 500
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        margin: '0 10 0 0'
                    },
                    width: '100%',
                    items: [
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
                            labelWidth: 180,
                            fieldLabel: "Waarde voor het filterattribuut",
                            value: configObject.advancedValue !== null ? configObject.advancedValue : ""
                        }
                    ]
                },
                {
                    xtype: "fieldset",
                    height: 110,
                    width: '100%',
                    title: "Waardes",
                    layout: 'hbox',
                    items: [{
                        xtype:"button",
                        name: "addValue",
                        text: "Voeg waarde toe",
                        margin: '0 10 0 0',
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
                    },{
                        xtype: 'container',
                        name: "advancedFilterValues",
                        id: "advancedFilterValues",
                        items: waardeItems,
                        flex: 1,
                        autoScroll: true,
                        height: 90 // Weird ExtJS behaviour (bug?) does not take fieldset height into account when calculating layout
                    }]
                }
            ]
        });
        
        // Trigger change event on all checkboxgroups to enable/disable the 'show search' checkbox
        this.form.query('.checkboxgroup').forEach(function(field) {
            // Select the first checkbox child of the checkbox group
            var checkbox = field.child('.checkbox');
            // Fire change event and pass the checkbox as first argument
            checkbox.fireEvent('change', checkbox);
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
                }, {
                    xtype: "button",
                    text: " X ",
                    width: "auto",
                    listeners:{
                        click: function(btn) {
                            Ext.getCmp('advancedFilterValues').remove(btn.up('.container'));
                            Ext.getCmp("advancedFilterValues").doLayout();
                        }
                    }
                }]
        };
    },
    handleChange: function(box) {
        // Get next sibling and set sibling disabled / enabled based on checked value
        var sibl = box.next(),
            isChecked = box.getValue();
        // We only set the class to disabled to emulate disabled, this will ensure that
        // the value is sent to the backend anyway. This is important to reliably show/
        // hide the search box in the front-end
        if(!isChecked) {
            sibl.addCls('x-item-disabled');
            sibl.setValue(false);
        } else {
            sibl.removeCls('x-item-disabled');
        }
        
        if(box.getName() === 'selectCsw') {
            Ext.getCmp('defaultCswUrl').setVisible(isChecked);
            Ext.getCmp('showCswUrl').setVisible(isChecked);
            
        }
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

