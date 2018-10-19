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
 * Custom configuration object for Graph configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    nextId:null,
    layers:null,
    configObject: {},
    graphConfigs:null,
    graphTypeStore:null,
    panel:null,
    constructor: function (parentId, configObject, configPage) {
        if (configObject && configObject.layers) {
            graph_layersArrayIndexesToAppLayerIds(configObject);
        }
        this.configObject = configObject || {};
        this.graphConfigs = [];
        this.nextId = 1;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.graphTypeStore = Ext.create('Ext.data.Store', {
            fields: ['naam',"type"],
            data: [
                {"naam": ___("Lijn"), type: "LINE"},
                {"naam": ___("Staaf (horizontaal)"), type : "BAR"},
                {"naam": ___("Staaf (verticaal)"), type: "COLUMN"}
            ]
        });
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
            title: i18next.t('viewer_components_customconfiguration_86'),
            id: "layerListContainer",
            style: {
                marginTop: "10px"
            },
            frame: false,
            bodyPadding: me.formPadding,
            tbar: [
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-plus-circle',
                    text: i18next.t('viewer_components_customconfiguration_87'),
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
    addInitialGraphConfig: function() {
        if(!this.configObject.graphs) {
            this.addGraphConfig();
            return;
        }
        var config = null;
        for(var i = 0; i < this.configObject.graphs.length; i++) {
            config = this.configObject.graphs[i];
            this.addGraphConfig(config);
            if(config.layer) {
                this.getAttributeList( config.layer, config.id);
            }
        }
    },
    addGraphConfig: function(config) {

        var me = this;
        var nextId = me.nextId;
        var newconfig = config || {
            id: 'graph' + nextId,
            title: i18next.t('viewer_components_customconfiguration_88') + nextId
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
        for(var i = 0; i < me.graphConfigs.length; i++) {
            if(me.graphConfigs[i].id !== id) {
                newGraphConfigs.push(me.graphConfigs[i]);
            }
        };
        me.graphConfigs = newGraphConfigs;
    },
    newGraphField: function(config, collapsed) {
        var me = this;
        var store = Ext.create('Ext.data.ArrayStore', {
            fields: ['id', 'longname']
        });
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
            iconCls: "x-fa fa-wrench",
            titleCollapse: true,
            hideCollapseTool: false,
            defaultType: 'textfield',
            items: [
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_89'),
                       name: 'title',
                       value: config.title,
                       id: 'title'+config.id
                   },
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_90'),
                       name : "type" + config.id,
                       id: "type" + config.id,
                       xtype: "combo",
                       emptyText: i18next.t('viewer_components_customconfiguration_91'),
                       store: me.graphTypeStore,
                       queryMode: 'local',
                       displayField: 'naam',
                       valueField: 'type',
                       value: config.type || null
                   },
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_92'),
                       name : "layer" + config.id,
                       id: "layer" + config.id,
                       xtype: "combo",
                       emptyText: i18next.t('viewer_components_customconfiguration_93'),
                       store: me.layers,
                       queryMode: 'local',
                       displayField: 'alias',
                       valueField: 'id',
                       value: config.layer || null,
                       listeners :{
                           change: function(comboBox){
                               me.getAttributeList( comboBox.getValue(), config.id);
                           }
                       }
                   },
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_94'),
                       name : "categoryAttribute"+config.id,
                       id: "categoryAttribute"+config.id,
                       disabled:true,
                       xtype: "combo",
                       emptyText: i18next.t('viewer_components_customconfiguration_95'),
                       store: store,
                       queryMode: 'local',
                       displayField: 'longname',
                       valueField: 'id',
                       value: config.categoryAttribute || null,
                       width: 400
                   },
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_96'),
                       name : "serieAttribute"+config.id,
                       id: "serieAttribute"+config.id,
                       disabled:true,
                       xtype: "combo",
                       multiSelect: true,
                       emptyText: i18next.t('viewer_components_customconfiguration_97'),
                       store: store,
                       queryMode: 'local',
                       displayField: 'longname',
                       valueField: 'id',
                       value: config.serieAttribute || null,
                       width: 400
                   },
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_98'),
                       name: 'xlabel',
                       disabled:true,
                       value: config.xlabel,
                       id: 'xlabel'+config.id
                   },
                   {
                       fieldLabel: i18next.t('viewer_components_customconfiguration_99'),
                       name: 'ylabel',
                       value: config.ylabel,
                       disabled:true,
                       id: 'ylabel'+config.id
                   }
            ],
            tbar: ["->", {
                xtype:'button',
                iconCls: 'x-fa fa-minus-circle',
                text: i18next.t('viewer_components_customconfiguration_100'),
                listeners: {
                    click: function() {
                        me.removeGraphConfig(config.id);
                    }
                }
            }]
        };
    },
    getLayerList: function() {
        var me = this;
        me.layers = null;
        Ext.Ajax.request({
            url: this.getContextpath() + "/action/componentConfigList",
            params:{
                appId: this.getApplicationId(),
                attribute:true,
                layerlist:true
            },
            success: function ( result, request ) {
                var layers = Ext.JSON.decode(result.responseText);
                me.layers = Ext.create('Ext.data.Store', {fields: ['id', 'alias'],data : layers});
                me.createGraphForm();
                me.addInitialGraphConfig();
            },
            failure: function() {
                Ext.MessageBox.alert(i18next.t('viewer_components_customconfiguration_251'), i18next.t('viewer_components_customconfiguration_252'));
            }
        });
    },
    getAttributeList : function(appLayerId,configId){
        var me = this;
        var category = Ext.getCmp("categoryAttribute" + configId);
        var serie = Ext.getCmp("serieAttribute" + configId);
        var xLabel = Ext.getCmp("xlabel" + configId);
        var yLabel = Ext.getCmp("ylabel" + configId);
        category.setLoading(___("Attributen ophalen"));
        serie.setLoading(___("Attributen ophalen"));
        category.getStore().removeAll();
        var currentCategoryValue = category.getValue();
        var currentSerieValue = serie.getValue();
        Ext.Ajax.request({
            url: this.getContextpath() + "/action/applicationtreelayer",
            params:{
                applicationLayer: appLayerId,
                attributes:true
            },
            success: function ( result, request ) {
                var attributeData = Ext.JSON.decode(result.responseText);
                var newList = [];
                for(var i = 0 ; i < attributeData.length; i++){
                    var attribute = attributeData[i];
                    if(attribute.visible){
                        newList.push(attribute);
                    }
                }
                category.getStore().add(newList);
                category.setDisabled(false);
                category.setValue(currentCategoryValue);
                serie.setDisabled(false);
                serie.setLoading(false);
                serie.setValue(currentSerieValue);
                category.setLoading(false);
                xLabel.setDisabled(false);
                yLabel.setDisabled(false);
            },
            failure: function() {
                serie.setLoading(false);
                category.setLoading(false);
                Ext.MessageBox.alert(i18next.t('viewer_components_customconfiguration_253'), i18next.t('viewer_components_customconfiguration_254'));
            }
        });
    },
    getConfiguration : function(){
        var config = viewer.components.CustomConfiguration.superclass.getConfiguration.call(this);
        var graphs = [];
        for(var i = 0 ; i < this.graphConfigs.length ; i ++){
            var gCO = this.graphConfigs[i];
            var graphConfig = this.getGraphConfig(gCO.id);
            graphs.push(graphConfig);

        }
        config.graphs = graphs;
        graph_appLayerIdsToLayersArrayIndexes(config);
        return config;
    },
    getGraphConfig : function (id){
        return {
            id: id,
            title: Ext.getCmp( "title"+id ).getValue(),
            type: Ext.getCmp( "type"+id ).getValue(),
            layer: Ext.getCmp("layer"+id ).getValue(),
            categoryAttribute: Ext.getCmp( "categoryAttribute"+id ).getValue(),
            serieAttribute: Ext.getCmp( "serieAttribute"+id ).getValue(),
            xlabel : Ext.getCmp( "xlabel"+id ).getValue(),
            ylabel: Ext.getCmp( "ylabel"+id ).getValue()
        };
    }
});

