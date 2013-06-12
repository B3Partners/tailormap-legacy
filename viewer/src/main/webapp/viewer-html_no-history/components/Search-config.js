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
/**
 * Custom configuration object for AttributeList configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    panel: null,
    panelHeight: 120,
    searchconfigs: [],
    nextId: 1,
    constructor: function (parentId,configObject){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);        
        this.initSearchconfigs(configObject);
    },
    initSearchconfigs: function(config) {
        var me = this;
        me.panel = Ext.create('Ext.panel.Panel', {
		    width: me.formWidth,
            margin: '15 0 0 0',
		    height: 250,
		    layout: 'auto',
            autoScroll: true,
		    items: [],
		    renderTo: 'config',
            tbar: [
                "->",
                {
                    xtype:'button',
                    iconCls: 'addbutton-icon',
                    text: 'Zoekingang toevoegen',
                    listeners: {
                        click: function() {
                            me.appendSearchField();
                        }
                    }
                }
            ]
		});
    
        if(config != null) {
            if(config.nextSearchConfigId != null) {
                me.nextId = config.nextSearchConfigId;
            }
            if(config.searchconfigs != null) {
                Ext.Array.each(config.searchconfigs, function(searchconfig) {
                    me.appendSearchField(searchconfig);
                });
            }
        }
    },
    appendSearchField: function(config) {
        var me = this;
        var nextId = me.nextId;
        var newconfig = config || {
            id: 'search' + nextId,
            name: 'Zoekingang ' + nextId,
            url: ''
        };
        me.searchconfigs.push(newconfig);
        var collapsed = true;
        if(nextId == 1) collapsed = false;
        me.panel.add(me.newSearchField(newconfig, collapsed));
        me.nextId++;
    },
    newSearchField: function(config, collapsed) {
        var me = this;
        return {
            xtype: 'panel',
            id: config.id,
            layout: 'anchor',
            anchor: '100%',
            width: '100%',
            title: config.name,
            animCollapse: false,
            collapsible: true,
            collapsed: collapsed,
            iconCls: "edit-icon-bw",
            titleCollapse: true,
            hideCollapseTool: true,
            items: [
                { 
                    xtype: 'fieldset',
                    defaultType: 'textfield',
                    border: 0,
                    padding: 10,
                    style: {
                        border: '0px none',
                        marginBottom: '0px'
                    },
                    items: [
                        { fieldLabel: 'Naam', name: 'name', value: config.name, id: 'name'+config.id },
                        { fieldLabel: 'URL', name: 'url', value: config.url, id: 'url'+config.id },
                        {
                            xtype:'button',
                            iconCls: 'savebutton-icon',
                            text: 'Zoekingang opslaan',
                            listeners: {
                                click: function(button) {
                                    me.saveConfig(config.id);
                                }
                            }
                        }
                    ]
                }
            ],
            tbar: ["->", {
                xtype:'button',
                iconCls: 'removebutton-icon',
                text: 'Zoekingang verwijderen',
                listeners: {
                    click: function() {
                        me.removeConfig(config.id);
                    }
                }
            }],
            listeners: {
                beforeexpand: function(){
                    Ext.Array.each(me.panel.items.items, function(item) {
                        item.collapse();
                    });
                }
            }
        };
    },
    saveConfig: function(configid) {
        var me = this;
        var panel = Ext.getCmp(configid);
        var newname = Ext.getCmp('name' + configid).getValue();
        var newurl = Ext.getCmp('url' + configid).getValue();
        panel.setTitle(newname);
        var newSearchconfigs = [];
        Ext.Array.each(me.searchconfigs, function(searchconfig) {
            if(searchconfig.id == configid) {
                searchconfig.name = newname;
                searchconfig.url = newurl;
            }
            newSearchconfigs.push(searchconfig);
        });
        me.searchconfigs = newSearchconfigs;
    },
    removeConfig: function(configid) {
        var me = this;
        me.panel.remove(configid);
        var newSearchconfigs = [];
        Ext.Array.each(me.searchconfigs, function(searchconfig) {
            if(searchconfig.id != configid) {
                newSearchconfigs.push(searchconfig);
            }
        });
        me.searchconfigs = newSearchconfigs;
    },
    getConfiguration: function(){
        var me = this;
        var config = viewer.components.CustomConfiguration.superclass.getConfiguration.call(this);
        config['searchconfigs'] = me.searchconfigs;
        config['nextSearchConfigId'] = me.nextId;
        return config;
    }
});

