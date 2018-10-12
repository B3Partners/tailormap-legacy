/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
/**
 * Custom configuration object for Buffer configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        this.labelWidth=200;
        configObject.showLabelconfig =true;
        var me = this;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        
        var autoShowSelectionModule = 'nolayers';
        if(configObject.showWhenOnlyBackground) { // Support for legacy config option
            autoShowSelectionModule = 'onlybackground';
        }
        if(typeof configObject.autoShowSelectionModule !== "undefined") {
            autoShowSelectionModule = configObject.autoShowSelectionModule;
        }

        this.form.add({
            xtype: "combobox",
            value: autoShowSelectionModule,
            store: [ ['never','Nooit'], ['nolayers','Indien er geen lagen zijn bij opstarten'], ['onlybackground','Indien er alleen achtergrond lagen zijn'], ['always','Altijd'] ],
            name: "autoShowSelectionModule",
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_174'),
            width: 500
        });

        this.form.add({
            xtype: "checkbox",
            checked: configObject.showBackgroundLevels !== undefined ? configObject.showBackgroundLevels : false,
            name: "showBackgroundLevels",
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_175')
        });
        
        this.form.add({
            xtype: "combobox",
            value: configObject.autoOnLayers !== undefined ? configObject.autoOnLayers : 'always',
            store: [ ['never','Nooit'], ['always','Altijd'], ['onlybackground','Alleen achtergrondlagen'] ],
            name: 'autoOnLayers',
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_176'),
            width: 400
        });
        
        var fieldNames = [
            { name: 'Groups', description: 'Kaarten selecteren', defaultLabel: 'Kaart' },
            { name: 'Layers', description: 'Kaartlagen selecteren', defaultLabel: 'Kaartlaag' },
            { name: 'OwnServices', description: 'Eigen services selecteren', defaultLabel: 'Eigen service' },
            { name: 'Csw', description: 'CSW service doorzoeken', defaultLabel: 'CSW service' }
        ];
        // Adding configuration options for all fieldNames
        Ext.Array.forEach(fieldNames, function(field) {
            me.form.add({
                xtype: 'container',
                layout: 'hbox',
                margin: '0 0 2 0',
                items: [{
                    xtype: "checkbox",
                    id: "checkbox" + field.name,
                    checked: configObject.hasOwnProperty('select' + field.name) ? configObject['select' + field.name] : true,
                    name: 'select' + field.name,
                    fieldLabel: field.description,
                    labelWidth: me.labelWidth,
                    margin: '0 10 0 0',
                    listeners: {
                        change: function(box) {
                            me.handleChange(box);
                        }
                    }
                },{
                    xtype: "checkbox",
                    checked: configObject.hasOwnProperty('showSearch' + field.name) ? configObject['showSearch' + field.name] : true,
                    name: "showSearch" + field.name,
                    fieldLabel: i18next.t('viewer_components_customconfiguration_177'),
                    margin: '0 10 0 0',
                    labelWidth: 95
                },{
                    xtype: "textfield",
                    value: configObject.hasOwnProperty('label' + field.name) ? configObject['label' + field.name] : field.defaultLabel,
                    name: "label" + field.name,
                    fieldLabel: i18next.t('viewer_components_customconfiguration_178'),
                    labelWidth: 60,
                    width: 200
                }]
            });
        });

        this.form.add({
            xtype: "textfield",
            value: configObject.defaultCswUrl !== undefined ? configObject.defaultCswUrl : "",
            name: "defaultCswUrl",
            id: "defaultCswUrl",
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_179'),
            width: 500
        });
        
           this.form.add({
            xtype: "checkbox",
            checked: configObject.showCswUrl !== undefined ? configObject.showCswUrl : true,
            name: "showCswUrl",
            id: "showCswUrl",
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_180')
        });
        
        this.form.add({
            xtype: "checkbox",
            checked: configObject.advancedFilter !== undefined ? configObject.advancedFilter : false,
            name: "advancedFilter",
            id: "advancedFilter",
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_181'),
            width: 500,
            listeners:{
                change: function(obj, val) {
                    Ext.getCmp("advancedFilterFieldset").setVisible(val);
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
            fieldLabel: i18next.t('viewer_components_customconfiguration_182'),
            width: "100%",
            layout: {
                type: 'vbox'
            },
            height: 170,
            padding: '5 5 0 5',
            items:[
                {
                    xtype: "checkbox",
                    checked: configObject.alwaysShow !== undefined ? configObject.alwaysShow : false,
                    name: "alwaysShow",
                    id: "alwaysShow",
                    labelWidth: this.labelWidth,
                    fieldLabel: i18next.t('viewer_components_customconfiguration_183'),
                    width: 500
                },
                {
                    xtype: "checkbox",
                    checked: configObject.alwaysMatch !== undefined ? configObject.alwaysMatch : false,
                    name: "alwaysMatch",
                    id: "alwaysMatch",
                    labelWidth: this.labelWidth,
                    fieldLabel: i18next.t('viewer_components_customconfiguration_184'),
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
                            fieldLabel: i18next.t('viewer_components_customconfiguration_185'),
                            value: configObject.advancedLabel !== null ? configObject.advancedLabel : ""
                        }, {
                            xtype: "textfield",
                            name: "advancedValue",
                            id: "advancedValue",
                            labelWidth: 180,
                            fieldLabel: i18next.t('viewer_components_customconfiguration_186'),
                            value: configObject.advancedValue !== null ? configObject.advancedValue : ""
                        }
                    ]
                },
                {
                    xtype: "fieldset",
                    height: 110,
                    width: '100%',
                    title: i18next.t('viewer_components_customconfiguration_187'),
                    layout: 'hbox',
                    items: [{
                        xtype:"button",
                        name: "addValue",
                        text: i18next.t('viewer_components_customconfiguration_188'),
                        margin: '0 10 0 0',
                        listeners:{
                            click:{
                                fn:function(){
                                    var valueSet = Ext.getCmp("advancedFilterValues");
                                    valueSet.add(this.createRow('', ''));
                                    valueSet.updateLayout();
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
        
        // Trigger change on checkboxes to show/enable / hide/disable fields
        Ext.Array.forEach(fieldNames, function(field) {
            var checkbox = Ext.getCmp('checkbox' + field.name);
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
                    fieldLabel: i18next.t('viewer_components_customconfiguration_189'),
                    value: labelValue
                }, {
                    name: "comboValue",
                    fieldLabel: i18next.t('viewer_components_customconfiguration_190'),
                    value: comboValue
                }, {
                    xtype: "button",
                    text: i18next.t('viewer_components_customconfiguration_191'),
                    width: "auto",
                    listeners:{
                        click: function(btn) {
                            Ext.getCmp('advancedFilterValues').remove(btn.up('.container'));
                            Ext.getCmp("advancedFilterValues").updateLayout();
                        }
                    }
                }]
        };
    },
    handleChange: function(box) {
        // Get next sibling and set sibling disabled / enabled based on checked value
        var siblCheckbox = box.next(),
            siblTextfield = siblCheckbox.next(),
            isChecked = box.getValue();
        // We only set the class to disabled to emulate disabled, this will ensure that
        // the value is sent to the backend anyway. This is important to reliably show/
        // hide the search box in the front-end
        if(!isChecked) {
            siblCheckbox.addCls('x-item-disabled');
            siblCheckbox.setValue(false);
            siblTextfield.addCls('x-item-disabled');
        } else {
            siblCheckbox.removeCls('x-item-disabled');
            siblTextfield.removeCls('x-item-disabled');
        }
        
        if(box.getName() === 'selectCsw') {
            Ext.getCmp('defaultCswUrl').setVisible(isChecked);
            Ext.getCmp('showCswUrl').setVisible(isChecked);
            Ext.getCmp('advancedFilter').setVisible(isChecked);
            var showAdvanced = isChecked;
            if(isChecked && !Ext.getCmp('advancedFilter').getValue()) {
                showAdvanced = false;
            }
            Ext.getCmp("advancedFilterFieldset").setVisible(showAdvanced);
        }
    },
    getConfiguration: function() {
        var config = this.callParent(arguments);
        var advancedLabel = Ext.getCmp("advancedLabel");
        var advancedValue = Ext.getCmp("advancedValue");
        var alwaysMatch = Ext.getCmp("alwaysMatch");
        var alwaysShow = Ext.getCmp("alwaysShow");
        var values =  Ext.getCmp("advancedFilterValues");
        config.advancedLabel = advancedLabel !== null ? advancedLabel.getValue() : "";
        config.advancedValue = advancedValue !== null ? advancedValue.getValue() : "";
        config.alwaysMatch = alwaysMatch !== null ? alwaysMatch.getValue() : "";
        config.alwaysShow = alwaysShow !== null ? alwaysShow.getValue() : "";
        
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
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 575,
                minHeight: 400
            }
        }
    }
});

