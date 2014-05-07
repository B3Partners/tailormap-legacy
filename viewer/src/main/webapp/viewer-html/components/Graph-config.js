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
    layers:null,
    graphConfigs:null,
    panel:null,
    constructor: function(parentId, configObject) {
        this.nextId = 1;
        this.graphConfigs = new Array();
        if (configObject === null) {
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject);
        this.getLayerList();
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
        var a = 0;
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
                   {fieldLabel: "Laag", name : "layer" + config.id, id: "layer" + config.id, xtype: "combo",emptyText:'Maak uw keuze',store: me.layers,queryMode: 'local',
                       displayField: 'alias',valueField: 'id',listeners :{change:{fn: me.layerChanged,scope: me}}},
                   {fieldLabel: "Categorie attribuut",  name : "categoryAttribute"+config.id ,id: "categoryAttribute"+config.id , disabled:true, xtype: "combo",emptyText:'Maak uw keuze',
                       store:null,queryMode: 'local',
                       displayField: 'longname',valueField: 'id'},
                   {fieldLabel: "Serie attribuut", name : "serieAttribute"+config.id ,id: "serieAttribute"+config.id , disabled:true, xtype: "combo",emptyText:'Maak uw keuze',store:null,queryMode: 'local',
                       displayField: 'longname',valueField: 'id'}
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
    },
    layerChanged:function( comboBox ){
        var selectId = comboBox.getId();
        var configId = selectId.substring("layer".length);
        var appLayerId = comboBox.getValue();
        this.getAttributeList(appLayerId,configId);
    },
    getLayerList: function() {
        var me = this;
        me.layers = null;
        Ext.Ajax.request({ 
            url: contextPath+"/action/componentConfigLayerList",
            params:{
                appId:applicationId,
                attribute:true
            }, 
            success: function ( result, request ) {
                var layers = Ext.JSON.decode(result.responseText);
                
                me.layers = Ext.create('Ext.data.Store', {fields: ['id', 'alias'],data : layers});
                me.createGraphForm();  
                me.addGraphConfig();
            },
            failure: function() {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden weergegeven");
            }
        });
    },
    getAttributeList : function(appLayerId,configId){
         var me = this;
        Ext.Ajax.request({ 
            url: contextPath+"/action/applicationtreelayer",
            params:{
                applicationLayer: appLayerId,
                attributes:true
            }, 
            success: function ( result, request ) {
                var attributeData = Ext.JSON.decode(result.responseText);
                
                var attributes = Ext.create('Ext.data.Store', {fields: ['id', 'longname'],data : attributeData});
                var category = Ext.getCmp("categoryAttribute" + configId);
                category.store = attributes;
                category.setDisabled(false);
                
                var serie = Ext.getCmp("serieAttribute" + configId);
                serie.store = attributes;
                serie.setDisabled(false);
            },
            failure: function() {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden weergegeven");
            }
        });
    }
});

