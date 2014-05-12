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
        
        this.layers = new Array();
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
                type: 'vbox'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [
                {
                    id: this.name + 'LayerSelectorPanel',
                    xtype: "container",
                    padding: "4px",
                    width: '100%',
                    height: 36
                },
                {
                    xtype: 'button',
                    text: 'Selecteer punt voor grafiek',
                    listeners: {
                        click: {
                            scope: me,
                            fn: me.activateMapClick
                        }
                    }

                },
                 {
                    id: this.name + 'graphPanel',
                    xtype: "container",
                    padding: "4px",
                    width: '100%',
                    height: 36
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
          //  this.layerSelector.setValue(this.layers[0]);
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
        var graphConfig = this.getConfigByAppLayer(appLayer.id)
        var attributes = new Array();
        if(!graphConfig){
            return;
        }
        attributes.push(graphConfig.serieAttribute);
        attributes.push(graphConfig.categoryAttribute);
        
        var extraParams = {
            attributesToInclude : attributes,
            graph:true
        };
        this.viewerController.mapComponent.getMap().setMarker("edit",x,y);
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.viewerController
        });
        var me =this;
        featureInfo.editFeatureInfo(x,y,this.viewerController.mapComponent.getMap().getResolution() * 4,appLayer, function (features){
            me.featuresReceived(features, attributes);
        },function(msg){me.failed(msg);},extraParams);
    },
    featuresReceived : function (features,attributes){
        var json = new Object();
        for (var i = 0 ; i < features.length ;i++){
            var feature = features[i];
            json = feature;
            if(json.related_featuretypes){
                for (var j = 0 ; j < json.related_featuretypes.length ;j++){
                    var linked = this.getLinkedData(json.related_featuretypes[i],attributes);
                    json.linkedData = linked;
                    break;
                }
            }
        }
        var a =0;
    },
    getLinkedData : function (related_feature,attributes){
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
                this.createGraph(appLayer, features);
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
    createGraph : function (appLayer,  data){
        var gco = this.getConfigByAppLayer(appLayer.id);
        var me = this;
        var store = Ext.create('Ext.data.JsonStore', {
            fields: [this.getAttribute(appLayer,gco.serieAttribute).name,this.getAttribute(appLayer,gco.categoryAttribute).name],
            data: data
        });

       var a=  Ext.create('Ext.chart.Chart', {
            renderTo:this.name + 'graphPanel',
            width: 300,
            height: 300,
            animate: true,
            store: store,
            axes: [
                {
                    type: 'Numeric',
                    position: 'left',
                    fields: [this.getAttribute(appLayer,gco.serieAttribute).name],
                    label: {
                        renderer: Ext.util.Format.numberRenderer('0,0')
                    },
                  //  title: this.getAttribute(appLayer,gco.serieAttribute).alias,
                  title: 'asdfasdfsd',
                    grid: true,
                    minimum: 0
                },
                {
                    type: 'Category',
                    position: 'bottom',
                    fields: [this.getAttribute(appLayer,gco.categoryAttribute).name],
                    title: this.getAttribute(appLayer,gco.categoryAttribute).name
                }
            ],
            series: [
                {
                    type: 'line',
                    highlight: {
                        size: 7,
                        radius: 7
                    },
                    axis: 'left',
                    xField: this.getAttribute(appLayer,gco.categoryAttribute).name,
                    yField: this.getAttribute(appLayer,gco.serieAttribute).name,
                    markerConfig: {
                        type: 'circle',
                        size: 4,
                        radius: 4,
                        'stroke-width': 0
                    },
                    tips: {
                        trackMouse: true,
                        width: 140,
                        height: 28,
                        
                        renderer: function(storeItem, item) {
                            this.setTitle(storeItem.get(me.getAttribute(appLayer,gco.categoryAttribute).name) + ': ' + storeItem.get(me.getAttribute(appLayer,gco.serieAttribute).name));
                        }
                    }
                }
            ]
        });  
    },
    loadData: function(appLayer) {
        var featureService = appLayer.featureService;
        /*
        var modelName = 'Masdfodel';
        var visCols = {
            "AANTAL_HH":true
        };
        var attributes = this.viewerController.getAttributesFromAppLayer(appLayer);
        var attributeList = new Array();
        var columns = new Array();
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
    getConfigByAppLayer : function (appLayerId){
        for (var i = 0 ; i < this.graphs.length ;i++){
            if(this.graphs[i].layer === appLayerId){
                return this.graphs[i];
            }
        }
        return null;
    },
    getAttribute : function (appLayer, attributeId){
        for(var i = 0 ; i < appLayer.attributes.length;i++){
            if(appLayer.attributes[i].id === attributeId){
                return appLayer.attributes[i];
            }
        }
        return null;
    },
    getExtComponents: function() {
        return [];
    }
});
