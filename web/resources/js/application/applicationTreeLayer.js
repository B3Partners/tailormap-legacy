/* 
 * Copyright (C) 2012 B3Partners B.V.
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

Ext.Loader.setConfig({enabled:true});
Ext.require([
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.tab.*',
    'Ext.panel.*'
]);

Ext.onReady(function() {
   
    var collapsed = false;
    var editPanelItems = [];
    var filterPanelItems = [];
    var defaults = {
        width: '100%',
        animCollapse: false,
        collapsible: true,
        titleCollapse: true,
        hideCollapseTool: true,
        bodyPadding: '8px 10px',
        collapsedCls: 'headerCollapsed',
        fieldDefaults: {
            labelWidth: 150,
            size: 40
        },
        listeners: {
            beforeexpand: function(panel){
                Ext.Array.each(panel.findParentByType('container').items.items, function(item) {
                    item.collapse();
                });
            }
        }
    };
    
    var geomTypesStore = Ext.create('Ext.data.Store', {
        fields: ['type', 'label'],
        data : [
            {"type":"geometry", "label":"Onbekend (alleen bewerken)"},
            {"type":"point", "label":"Punt"},
            {"type":"linestring", "label":"Lijn"},
            {"type":"polygon", "label":"Vlak"}
        ]
    });
    
    var editAllowed = false;
    var filterAllowed = false;
    if(Ext.isArray(attributes) && attributes.length > 0) {
        editAllowed = true;
        filterAllowed = true;
        Ext.Array.each(attributes, function(attribute) {
            var name = attribute.alias || attribute.name;
            if(editable) {
                var possibleValues = Ext.JSON.decode(attribute.editvalues);
                
                var possibleValuesFormItems = [
                                { fieldLabel: 'Mogelijke waarden', 
                                    name: 'editvalues', id: 'editvalues' + attribute.id, value: possibleValues, xtype: 'textfield', flex: 1 },
                                { xtype: 'button', text: 'DB', style: { marginLeft: '10px' }, listeners: {
                                    click: function() {
                                        getDBValues(attribute.id);
                                    }
                                }}
                            ];
                
                if(attribute.featureTypeAttribute != undefined) {
                    var type = attribute.featureTypeAttribute.type;
                    
                    var geomTypes = ["geometry","point","multipoint","linestring","multilinestring","polygon","multipolygon"];
                    
                    if(Ext.Array.contains(geomTypes, type)) {
                        
                        if(possibleValues) {
                            type = possibleValues[0];
                        }
                        
                        // edit only for single geometries
                        type = type.replace("multi","");
                        
                        possibleValuesFormItems = [{
                            fieldLabel: 'Geometrietype', 
                            store: geomTypesStore,
                            xtype: 'combobox',
                            name: 'editvalues', 
                            id: 'editvalues' + attribute.id, 
                            queryMode: 'local',
                            displayField: 'label',
                            valueField: 'type',                            
                            value: type, 
                            size: 40 
                            }
                        ];
                    }
                }
                
                editPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                    id: 'edit' + attribute.id,
                    title: name + (attribute.editable ? ' (&times;)' : ''),
                    iconCls: "edit-icon-bw",
                    collapsed: collapsed,
                    items: [
                        { fieldLabel: 'Bewerkbaar', name: 'editable', inputValue: 1, checked: attribute.editable, xtype: 'checkbox', listeners: {
                                change: function(field, newval) {
                                    editPanelTitle(field.findParentByType('form'), name, newval)
                                }
                            }
                        },
                        { fieldLabel: 'Alias', name: 'editalias', value: attribute.editalias, xtype: 'textfield' },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            items: possibleValuesFormItems
                        },
                        { fieldLabel: 'Hoogte', name: 'editheight', value: attribute.editheight, xtype: 'textfield' }
                    ]
                })));
            }
            var isEnabled = (attribute.filterable || attribute.selectable) || false;
            filterPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                id: 'filter' + attribute.id,
                title: name + (isEnabled ? ' (&times;)' : ''),
                iconCls: "edit-icon-bw",
                collapsed: collapsed,
                items: [
                    { fieldLabel: 'Filterbaar / Selecteerbaar', name: 'filterable_selectable', inputValue: 1, checked: isEnabled, xtype: 'checkbox',  labelWidth: 150, listeners: {
                        change: function(field, newval) {
                            var panel = field.findParentByType('form');
                            var filterRadio = Ext.getCmp('filterable' + attribute.id);
                            filterRadio.setDisabled(!newval); filterRadio.setValue(false);
                            var selectRadio = Ext.getCmp('selectable' + attribute.id);
                            selectRadio.setDisabled(!newval); selectRadio.setValue(false);
                            editPanelTitle(panel, name, newval);
                        }
                    }},
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            { xtype: 'displayfield', fieldLabel: 'Attribuut gebruiken bij' },
                            { id: 'filterable' + attribute.id, fieldLabel: 'Filteren', name: 'filterable' + attribute.id, inputValue: 'filter', checked: attribute.filterable, disabled: !isEnabled, xtype: 'radio', labelAlign: 'right' },
                            { id: 'selectable' + attribute.id, fieldLabel: ' &nbsp;Dataselectie', name: 'filterable' + attribute.id, inputValue: 'select', checked: attribute.selectable, disabled: !isEnabled, xtype: 'radio',  labelAlign: 'right' }
                        ]
                    },
                    {
                        xtype: 'textfield',
                        name: 'default' + attribute.id,
                        id: 'default' + attribute.id,
                        fieldLabel: 'Defaultwaarde',
                        value: attribute.defaultValue
                    }
                ]
            })));
            collapsed = true;
        });
    }
    var tabconfig = [{
        contentEl:'rights-tab', 
        title: 'Rechten'
    },{
        contentEl:'attributes-tab', 
        title: 'Attributen'
    },{
        contentEl:'settings-tab', 
        title: 'Instellingen'
    }];
    if(editAllowed && editable) {
        tabconfig.push({
            xtype: 'container',
            width: '100%',
            title: 'Edit',
            padding: 10,
            height: 475,
            layout: 'auto',
            autoScroll: true,
            items: editPanelItems
        });
    } else {
        tabconfig.push({
            contentEl:'edit-tab', 
            title: 'Edit'
        });
    }
    if(filterAllowed) {
        tabconfig.push({
            xtype: 'container',
            width: '100%',
            title: 'Filter / Selectie',
            padding: 10,
            height: 475,
            layout: 'auto',
            autoScroll: true,
            items: filterPanelItems
        });
    } else {
        tabconfig.push({
            contentEl:'filter-tab', 
            title: 'Filter / Selectie'
        });
    }

    

    var htmlEditorRendered = false;
    Ext.create('Ext.tab.Panel', {
        renderTo: 'tabs',
        width: '100%',
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        layoutOnTabChange: false,
        items: tabconfig,
        listeners: {
            tabchange: function(panel, activetab, previoustab) {
                if(activetab.contentEl && activetab.contentEl === 'settings-tab' && !htmlEditorRendered) {
                    // HTML editor is rendered when the tab is first opened. This prevents a bug where the contents could not be edited
                    Ext.create('Ext.form.field.HtmlEditor', {
                        id: 'extSettingsHtmlEditor',
                        width: 475,
                        maxWidth: 475,
                        height: 150,
                        maxHeight: 150,
                        value: Ext.get('details_summary_description').dom.value,
                        renderTo: 'details_summary_description_container'
                    });
                    htmlEditorRendered = true;
                }
            }
        }
    });
    
    Ext.get('apptreelayerform').on('submit', function(e) {
        Ext.get('attributesJSON').dom.value = getJson();
        Ext.get('details_summary_description').dom.value = Ext.getCmp('extSettingsHtmlEditor').getValue();
    });
    
});

function editPanelTitle(panel, name, checked) {
    panel.setTitle(name + (checked ? ' (&times;)' : ''));
}

function getJson() {
    var currentAttributes = [];
    Ext.Array.each(attributes, function(attribute) {
        var newAttribute = attribute;
        if (Ext.getCmp('edit' + attribute.id)!=undefined){
            Ext.getCmp('edit' + attribute.id).getForm().getFields().each(function(field) {
                newAttribute[field.getName()] = field.getValue();
            });
            if(newAttribute["editvalues"] != undefined && newAttribute["editvalues"] != ""){
                newAttribute["editvalues"]= newAttribute["editvalues"].split(",");
            }
        }
        newAttribute.filterable = Ext.getCmp('filterable' + attribute.id).getValue();
        newAttribute.selectable = Ext.getCmp('selectable' + attribute.id).getValue();
        var defaultVal = Ext.getCmp('default' + attribute.id).getValue();
        if(defaultVal != ""){
            newAttribute.defaultValue = defaultVal;
        }
        currentAttributes.push(newAttribute);
    });
    return Ext.JSON.encode(currentAttributes);
}

function getDBValues(attributeid) {
    if(getDBValuesUrl != '') {
        Ext.Ajax.request({ 
            url: getDBValuesUrl, 
            params: { 
                attributeid: attributeid
            }, 
            success: function ( result, request ) { 
                var result = Ext.JSON.decode(result.responseText);
                Ext.getCmp('editvalues' + attributeid).setValue(result.join(','));
            }, 
            failure: function ( result, request) { 
                Ext.MessageBox.alert('Foutmelding', result.responseText); 
            } 
        });
    }
}