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
    var editAllowed = false;
    var filterAllowed = false;
    if(Ext.isArray(attributes) && attributes.length > 0) {
        editAllowed = true;
        filterAllowed = true;
        Ext.Array.each(attributes, function(attribute) {
            var name = attribute.alias || attribute.name;
            if(editable) {
                editPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                    id: 'edit' + attribute.id,
                    title: name + (attribute.editable ? ' (&times;)' : ''),
                    collapsed: collapsed,
                    items: [
                        { fieldLabel: 'Bewerkbaar', name: 'editable', inputValue: 1, checked: attribute.editable, xtype: 'checkbox', listeners: {
                            change: function(field, newval) {
                                editPanelTitle(field.findParentByType('form'), name, newval)
                            }
                        }},
                        { fieldLabel: 'Alias', name: 'editalias', value: attribute.editalias, xtype: 'textfield' },
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            items: [
                                { fieldLabel: 'Mogelijke waarden', name: 'editvalues', id: 'editvalues' + attribute.id, value: attribute.editvalues, xtype: 'textfield', size: 100 },
                                { xtype: 'button', text: 'DB', style: { marginLeft: '10px' }, listeners: {
                                    click: function() {
                                        getDBValues(attribute.id);
                                    }
                                }},
                            ]
                        },
                        { fieldLabel: 'Hoogte', name: 'editheight', value: attribute.editheight, xtype: 'textfield' }
                    ]
                })));
            }
            var isEnabled = (attribute.filterable || attribute.selectable) || false;
            filterPanelItems.push(Ext.create('Ext.form.Panel', Ext.apply(defaults, {
                id: 'filter' + attribute.id,
                title: name + (isEnabled ? ' (&times;)' : ''),
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
                            { xtype: 'displayfield', fieldLabel: 'Attribuut gebruiken bij', labelWidth: 'auto' },
                            { id: 'filterable' + attribute.id, fieldLabel: 'Filteren', name: 'filterable', inputValue: 'filter', checked: attribute.filterable, disabled: !isEnabled, xtype: 'radio', labelWidth: 'auto', labelAlign: 'right' },
                            { id: 'selectable' + attribute.id, fieldLabel: ' &nbsp;Dataselectie', name: 'filterable', inputValue: 'select', checked: attribute.selectable, disabled: !isEnabled, xtype: 'radio', labelWidth: 'auto', labelAlign: 'right' }
                        ]
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
            height: 550,
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
            height: 550,
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

    Ext.createWidget('tabpanel', {
        renderTo: 'tabs',
        width: '100%',
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        layoutOnTabChange: false,
        items: tabconfig
    });
    
    Ext.get('apptreelayerform').on('submit', function(e) {
        Ext.get('attributesJSON').dom.value = getJson();
    });
    
});

function editPanelTitle(panel, name, checked) {
    panel.setTitle(name + (checked ? ' (&times;)' : ''));
}

function getJson() {
    var currentAttributes = [];
    Ext.Array.each(attributes, function(attribute) {
        var newAttribute = attribute;
        Ext.getCmp('edit' + attribute.id).getForm().getFields().each(function(field) {
            newAttribute[field.getName()] = field.getValue();
        });
        newAttribute.filterable = Ext.getCmp('filterable' + attribute.id).getValue();
        newAttribute.selectable = Ext.getCmp('selectable' + attribute.id).getValue();
        currentAttributes.push(newAttribute);
    });
    return JSON.stringify(currentAttributes);
}

function getDBValues(attributeid) {
    if(getDBValuesUrl != '') {
        Ext.Ajax.request({ 
            url: getDBValuesUrl, 
            params: { 
                attributeid: attributeid
            }, 
            success: function ( result, request ) { 
                var result = JSON.parse(result.responseText);
                Ext.getCmp('editvalues' + attributeid).setValue(result.join(','));
            }, 
            failure: function ( result, request) { 
                Ext.MessageBox.alert('Foutmelding', result.responseText); 
            } 
        });
    }
}