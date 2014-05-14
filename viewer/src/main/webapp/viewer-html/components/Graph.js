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
 * Graph component
 * Creates a Graph component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.Graph", {
    extend: "viewer.components.Component",
    panel: null,
    initialized: false,
    toolMapClick:null,
    deActivatedTools:null,
    layers:null,
    config: {
        title: null,
        iconUrl: null,
        tooltip: null,
        graphs: null
    },
    constructor: function(conf) {
        viewer.components.Graph.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;
        this.renderButton({
            handler: function() {
                 me.buttonClick();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        });
        // Make hook for Returned feature infos
        // Stub for development
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initialize, this);
        return this;
    },
    initialize: function() {
        this.initialized = true;
            
        this.toolMapClick =  this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.viewerController
        });
        
        this.layers = [];
        for (var i = 0 ; i < this.graphs.length ;i ++){
            var graph = this.graphs[i];
            this.layers.push(graph.layer);
        }
        this.loadWindow();
    },
     loadWindow : function (){
        var me =this;
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            autoScroll: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [
                {
                    id: this.name + 'LayerSelectorPanel',
                    xtype: "container",
                    padding: 4,
                    height: 36
                },
                {
                    xtype: "container",
                    items: [{
                        xtype: 'button',
                        text: 'Selecteer punt voor grafiek',
                        listeners: {
                            click: {
                                scope: me,
                                fn: me.activateMapClick
                            }
                        }
                    }],
                    height: 25
                },
                 {
                    id: this.name + 'graphPanel',
                    xtype: this.graphs.length > 1 ? "tabpanel" : "container",
                    padding: 4,
                    flex: 1,
                    layout: 'fit'
                }
            ]
        });
        this.createLayerSelector();
    },
    createLayerSelector: function(){
        var config = {
            viewerController : this.viewerController,
            restriction : "attribute",
            id : this.name + "layerSelector",
            layers: this.layers,
            div: this.name + 'LayerSelectorPanel'
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);
        if(this.layers.length === 1){
            this.layerSelector.setValue(this.layers[0]);
        }
    },
    layerChanged : function (layer){
      var a = 0;  
    },
            
    mapClicked : function(tool, comp){
       this.deactivateMapClick();
        //Ext.get(this.getContentDiv()).mask("Haalt features op...")
        var coords = comp.coord;
        var x = coords.x;
        var y = coords.y;
        
        var appLayer = this.layerSelector.getValue();
        if(appLayer === null) {
            Ext.Msg.alert('Let op', 'Selecteer eerst een kaartlaag');
            return;
        }
        var graphConfig = this.getConfigByAppLayer(appLayer.id);
        var attributes = [];
        if(!graphConfig){
            return;
        }
        var me = this;
        var graphPanel = Ext.getCmp(this.name + 'graphPanel');
        graphPanel.removeAll();
        // We create placeholders to be able to insert graphs in correct order in the tabpanel
        if(graphConfig.length > 1) {
            for(var i = 0; i < graphConfig.length; i++) {
                graphPanel.add({
                    xtype: 'container',
                    title: graphConfig[i].title,
                    html: 'Bezig met laden...',
                    padding: 10,
                    id: 'placeholderContainer' + i
                });
            }
        }
        for(var i = 0; i < graphConfig.length; i++) {
            (function(config, configId){
                for(var j = 0; j < config.serieAttribute.length; j++) {
                    attributes.push(config.serieAttribute[j]);
                }
                attributes.push(config.categoryAttribute);
                var extraParams = {
                    attributesToInclude : attributes,
                    graph:true
                };
                this.viewerController.mapComponent.getMap().setMarker("edit",x,y);
                var featureInfo = Ext.create("viewer.FeatureInfo", {
                    viewerController: me.viewerController
                });
                featureInfo.editFeatureInfo(x,y,me.viewerController.mapComponent.getMap().getResolution() * 4,appLayer, function (features){
                    me.featuresReceived(features, attributes, configId);
                },function(msg){me.failed(msg);},extraParams);
            })(graphConfig[i], i);
        }
    },
    failed: function(msg) {
        Ext.Msg.alert('Fout', 'Fout bij het ophalen van de grafiek gegevens');
    },
    featuresReceived : function (features,attributes, configId){
        var json = {};
        for (var i = 0 ; i < features.length ;i++){
            var feature = features[i];
            json = feature;
            if(json.related_featuretypes){
                for (var j = 0 ; j < json.related_featuretypes.length ;j++){
                    var linked = this.getLinkedData(json.related_featuretypes[i], attributes, configId);
                    json.linkedData = linked;
                    break;
                }
            }
        }
        var a =0;
    },
    getLinkedData : function (related_feature,attributes, configId){
        var appLayer = this.layerSelector.getValue();
        var options = {};
         
        var filter = "&filter="+encodeURIComponent(related_feature.filter);
        
        var featureType="&featureType="+related_feature.id;
                
        options.application = this.appId;
        options.appLayer = appLayer.id;
        options.limit = 1000;
        options.filter = filter;
        options.graph = true;
        options.arrays = false;
        options.attributesToInclude = attributes;
        Ext.Ajax.request({
            url: appLayer.featureService.getStoreUrl() + featureType+filter,
            params: options,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                var features = response.features;
                this.createGraph(appLayer, features, configId);
                var a =0;
            },
            failure: function(result) {
               var b =0;
            }
        });
    },
    buttonClick: function(){
        this.popup.show();
    },
    featureInfoReturned: function(layer, options) {
        this.loadGraph(layer);
    },
    loadGraph: function(appLayer) {
        this.popup.show();
        this.popup.setWindowTitle(appLayer.alias);
        var featureService = appLayer.featureService;
        if (featureService) {

            // Create store
            // Create graph
            //  loadFeatures: function(appLayer, successFunction, failureFunction,options,scope) {
            var filter;
            var me = this;
            if (appLayer.attributes === undefined) {
                featureService.loadAttributes(me.appLayer, function(attributes) {
                    me.loadData(appLayer);
                });
            } else {
                this.loadData(appLayer);
            }
        } else {
            this.viewerController.logger.error("No featureservice available for layer " + appLayer.alias);
        }

    },
    createGraph : function (appLayer,  data, configId){
        var gco = this.graphs[configId];//this.getConfigByAppLayer(appLayer.id);
        var me = this;
        var fields = this.getAttributeName(appLayer,gco.serieAttribute);
        fields.push(this.getAttributeName(appLayer,gco.categoryAttribute));
        var store = Ext.create('Ext.data.JsonStore', {
            fields: fields,
            data: data
        });

        var graphType = gco.type.toLowerCase();
        // Line charts need to have multiple series
        // Bar/Column charts need 1 serie with multiple yFields
        // For line charts we can iterate over serieAttribute array,
        // for bar/column we wrap it in an array so 1 serie is added only.
        var series = [], serieAttributes = gco.serieAttribute;
        if(graphType === 'bar' || graphType === 'column') {
            serieAttributes = [ gco.serieAttribute ];
        }
        for(var i = 0; i < serieAttributes.length; i++) {
            (function(serieAttribute) {
                series.push({
                    type: graphType,
                    axis: 'left',
                    xField: me.getAttributeName(appLayer, gco.categoryAttribute),
                    yField: me.getAttributeName(appLayer, serieAttribute),
                    markerConfig: {
                        type: 'circle',
                        size: 4,
                        radius: 4,
                        'stroke-width': 0
                    },
                    tips: {
                        trackMouse: true,
                        minWidth: 140,
                        height: 28,
                        renderer: function(storeItem, item) {
                            if(graphType === 'bar' || graphType === 'column') {
                                this.setTitle(item.value[0] + ': ' + item.value[1]);
                            } else {
                                this.setTitle(storeItem.get(me.getAttributeName(appLayer,gco.categoryAttribute)) + ': ' + storeItem.get(me.getAttributeName(appLayer,serieAttribute)));
                            }
                        }
                    },
                    highlight: {
                        size: 7,
                        radius: 7
                    }
                });
            })(serieAttributes[i]);
        }
        /* 
         * The setup for a Theme, we could use this in the future to control the color of the lines/bars
         * 
         * Ext.define('Ext.chart.theme.Flamingo', {
            extend: 'Ext.chart.theme.Base',
            constructor: function(config) {
                var themeConfig = [Ext.apply({
                    series: {
                        'stroke-width': 1
                    },
                    colors: ['#FF0000', '#00FF00', '#0000FF', '#4292C6', '#2171B5', '#084594'],
                    seriesThemes: [{
                        fill: "#FF0000"
                        }, {
                        fill: "#00FF00"
                        }, {
                        fill: "#0000FF"
                        }, {
                        fill: '#4292C6'
                        },{
                        fill: '#2171B5'
                        },{
                        fill: '#084594'
                        }
                    ],
                    stacked: false
                }, config)];
                this.callParent(themeConfig);
            }
        }); */
        var axes = [
            {
                type: 'Numeric',
                position: 'left',
                fields: this.getAttributeName(appLayer, gco.serieAttribute),
                label: {
                    renderer: Ext.util.Format.numberRenderer('0,0')
                },
                title: this.isArray(gco.serieAttribute) ? '' : this.getAttributeTitle(appLayer,gco.serieAttribute),
                grid: true,
                minimum: 0
            },{
                type: 'Category',
                position: 'bottom',
                fields: [this.getAttributeName(appLayer,gco.categoryAttribute)],
                title: this.getAttributeTitle(appLayer,gco.categoryAttribute)
            }
        ];
        if(graphType === 'bar') {
            axes[0]['position'] = 'bottom';
            axes[1]['position'] = 'left';
        }
        var a = Ext.create('Ext.chart.Chart', {
            //theme: 'Flamingo',
            animate: true,
            store: store,
            axes: axes,
            series: series,
            title: gco.title,
            legend: true
        });
        var graphPanel = Ext.getCmp(this.name + 'graphPanel');
        // remove placeholder
        graphPanel.remove('placeholderContainer' + configId, true);
        // add graph in placeholder place
        graphPanel.insert(configId, a);
        // Always select first tab
        graphPanel.setActiveTab(0);
    },
    loadData: function(appLayer) {
        var featureService = appLayer.featureService;
        /*
        var modelName = 'Masdfodel';
        var visCols = {
            "AANTAL_HH":true
        };
        var attributes = this.viewerController.getAttributesFromAppLayer(appLayer);
        var attributeList = [];
        var columns = [];
        var index = 0;
        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            var colName = attribute.alias != undefined ? attribute.alias : attribute.name;
            if(visCols.hasOwnProperty(colName)){
                
                var attIndex = index++;
                
                attributeList.push({
                    name: "c" + attIndex,
                    type : 'string'
                });
                columns.push({
                    id: "c"+name+ +attIndex,
                    header:colName,
                    dataIndex: "c" + attIndex,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }
        var name = appLayer.alias;
        var modelName= name + 'Model';
        Ext.define(modelName, {
            extend: 'Ext.data.Model',
            fields: attributeList
        });
        
        var filter = "";
        
        if (appLayer.filter){
            filter=appLayer.filter.getCQL();
        }
        var featureType = "";
       

        var store = Ext.create('Ext.data.Store', {
            storeId: name + "Store",
            pageSize: 10,
            model: modelName,
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                timeout: 40000,
                url: appLayer.featureService.getStoreUrl() + "&arrays=1" + featureType + filter,
                reader: {
                    type: 'json',
                    root: 'features',
                    totalProperty: 'total'
                },
                simpleSortMode: true,
                listeners: {
                    exception: function(store, response, op) {

                        msg = response.responseText;
                        if (response.status == 200) {
                            try {
                                var j = Ext.JSON.decode(response.responseText);
                                if (j.message) {
                                    msg = j.message;
                                }
                            } catch (e) {
                            }
                        }

                        if (msg == null) {
                            if (response.timedout) {
                                msg = "Request timed out";
                            } else if (response.statusText != null && response.statusText != "") {
                                msg = response.statusText;
                            } else {
                                msg = "Unknown error";
                            }
                        }

                        Ext.getCmp(me.name + "mainGrid").getStore().removeAll();

                        Ext.MessageBox.alert("Foutmelding", msg);

                    }
                }
            },
            autoLoad: true
        });*/
    },
    
    activateMapClick: function(){
        this.deActivatedTools = this.viewerController.mapComponent.deactivateTools();
        this.toolMapClick.activateTool();
    },
    deactivateMapClick: function(){
        for (var i=0; i < this.deActivatedTools.length; i++){
            this.deActivatedTools[i].activate();
        }
        this.deActivatedTools = [];
        this.toolMapClick.deactivateTool();
    },
    getConfigByAppLayer : function (appLayerId) {
        var configs = [];
        for (var i = 0 ; i < this.graphs.length ;i++){
            if(this.graphs[i].layer === appLayerId){
                configs.push(this.graphs[i]);
            }
        }
        if(!configs.length) return null;
        return configs;
    },
    getAttribute : function (appLayer, attributeId){
        for(var i = 0 ; i < appLayer.attributes.length;i++){
            if(appLayer.attributes[i].id === attributeId){
                return appLayer.attributes[i];
            }
        }
        return null;
    },
    getAttributeName: function(appLayer, attributeId) {
        return this.getAttributeTitleName(appLayer, attributeId, false);
    },
    getAttributeTitle: function(appLayer, attributeId) {
        return this.getAttributeTitleName(appLayer, attributeId, true);
    },
    getAttributeTitleName: function(appLayer, attributeId, allowAlias) {
        var attributes = this.wrapArray(attributeId),
            attributeTitles = [],
            attribute = null;
        for(var i = 0; i < attributes.length; i++) {
            attribute = this.getAttribute(appLayer, attributes[i]);
            if(attribute === null) {
                attributeTitles.push('');
                continue;
            }
            attributeTitles.push(allowAlias && attribute.alias ? attribute.alias : attribute.name);
        }
        if(attributeTitles.length === 1) return attributeTitles[0];
        return attributeTitles;
    },
    wrapArray: function(item) {
        if(this.isArray(item)) return item;
        return [ item ];
    },
    isArray: function(item) {
        return Object.prototype.toString.call(item) === '[object Array]';
    },
    getExtComponents: function() {
        return [ this.maincontainer.getId() ];
    }
});
