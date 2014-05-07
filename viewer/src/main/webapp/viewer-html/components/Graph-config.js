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
 * Custom configuration object for Graph configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    nextId:null,
    graphConfigs:null,
    panel:null,
    constructor: function(parentId, configObject) {
        this.nextId = 1;
        this.graphConfigs = new Array();
        if (configObject === null) {
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject);
        this.createGraphForm();  
    },
    createGraphForm: function() {
        var me = this;
        this.panel = Ext.create("Ext.panel.Panel", {
            width: me.formWidth,
            margin: '15 0 0 0',
            height: 350,
            layout: 'auto',
            autoScroll: true,
            title: "Maak grafieken",
            id: "layerListContainer",
            style: {
                marginTop: "10px"
            },
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            height: me.checkPanelHeight,
            tbar: [
                {
                    xtype: 'button',
                    iconCls: 'addbutton-icon',
                    text: 'Grafiekconfiguratie toevoegen',
                    listeners: {
                        click: function() {
                            me.addGraphConfig();
                        }
                    }
                }
            ],
            renderTo: this.parentId
        });
    },
    addGraphConfig: function(config) {
        var me = this;
        var nextId = me.nextId;
        var newconfig = config || {
            id: 'graph' + nextId,
            title: 'Grafiek ' + nextId
        };
        me.graphConfigs.push(newconfig);
        var collapsed = true;
        if (nextId === 1){
            collapsed = false;
        }
        me.panel.add(me.newGraphField(newconfig, collapsed));
        me.nextId++;
    },
    removeGraphConfig : function(id){
        this.panel.remove(id);
        var me = this;
        var newGraphConfigs = [];
        Ext.Array.each(me.graphConfigs, function(graphConfig) {
            if(graphconfig.id != id) {
                newGraphConfigs.push(graphconfig);
            }
        });
        me.graphConfigs = newGraphConfigs;
    },
    newGraphField: function(config, collapsed) {
        var me = this;
        return {
            xtype: 'panel',
            id: config.id,
            layout: 'anchor',
            anchor: '100%',
            width: '100%',
            title: config.title,
            animCollapse: false,
            collapsible: true,
            collapsed: collapsed,
            iconCls: "edit-icon-bw",
            titleCollapse: true,
            hideCollapseTool: false,
            defaultType: 'textfield',
            items: [
                   { fieldLabel: 'Titel', name: 'title', value: config.title, id: 'name'+config.id },
                   { fieldLabel: 'Gebruik alleen via url', name: 'urlOnly'+config.id, id: 'urlOnly'+config.id, checked: false, xtype:'checkbox'}
            ],
            tbar: ["->", {
                xtype:'button',
                iconCls: 'removebutton-icon',
                text: 'Grafiekconfiguratie verwijderen',
                listeners: {
                    click: function() {
                        me.removeGraphConfig(config.id);
                    }
                }
            }]
        };
    }
});

