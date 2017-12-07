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
        this.initConfig(conf);
        viewer.components.Graph.superclass.constructor.call(this, this.config);
        this.loadCSS();
        if(this.config.layers !== null){
            graph_layersArrayIndexesToAppLayerIds(conf);
        }
        var me = this;
        this.renderButton({
            handler: function() {
                 me.buttonClick();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initialize, this);
        return this;
    },
    // Additional Ext CSS is required when using the chart component
    loadCSS: function() {
        var head = document.getElementsByTagName( "head" )[0];
        var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", FlamingoAppLoader.get('contextPath') + "/extjs/packages/charts/triton/resources/charts-all.css");
        head.insertBefore( fileref, head.firstChild );
    },
    initialize: function() {
        this.initialized = true;
        this.toolMapClick =  this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.config.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.config.viewerController
        });

        this.layers = [];
        if(!this.config.graphs){
            this.config.graphs = [];
        }
        if(this.config.graphs){
            for (var i = 0 ; i < this.config.graphs.length ;i ++){
                var graph = this.config.graphs[i];
                this.layers.push(graph.layer);
            }
        }else{
            this.viewerController.logger.warning("Geen grafieken geconfigureerd.");
        }
        this.loadWindow();
    },
     loadWindow : function (){
        var me =this;
        this.createLayerSelector();
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.config.name + 'Container',
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
                this.layerSelector.getLayerSelector(),
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
                    id: this.config.name + 'graphPanel',
                    xtype: this.config.graphs.length > 1 ? "tabpanel" : "container",
                    padding: 4,
                    flex: 1,
                    layout: 'fit'
                }
            ]
        });
    },
    createLayerSelector: function(){
        var config = {
            viewerController : this.config.viewerController,
            restriction : "attribute",
            id : this.config.name + "layerSelector",
            layers: this.layers,
            padding: 4
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, this.selectFirstLayer, this);
    },
    selectFirstLayer: function() {
        if (this.layers.length === 1) {
            this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, this.selectFirstLayer, this);
            this.layerSelector.selectFirstLayer();
        }
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
        if(!graphConfig){
            return;
        }
        var me = this;
        var graphPanel = Ext.getCmp(this.config.name + 'graphPanel');
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
            (function(config, index){
                var attributes = [];
                for(var j = 0; j < config.serieAttribute.length; j++) {
                    attributes.push(config.serieAttribute[j]);
                }
                attributes.push(config.categoryAttribute);
                var extraParams = {
                    attributesToInclude : attributes,
                    attributesNotNull : attributes,
                    graph:true
                };
                me.config.viewerController.mapComponent.getMap().setMarker("edit",x,y);
                var featureInfo = Ext.create("viewer.FeatureInfo", {
                    viewerController: me.config.viewerController
                });
                featureInfo.editFeatureInfo(x,y,me.config.viewerController.mapComponent.getMap().getResolution() * 4,appLayer, function (features){
                    me.featuresReceived(features, attributes, config, index);
                },function(msg){me.failed(msg);},extraParams);
            })(graphConfig[i], i);
        }
    },
    failed: function(msg) {
        Ext.Msg.alert('Fout', 'Fout bij het ophalen van de grafiek gegevens');
    },
    featuresReceived : function (features,attributes, config, index){
        var json = {};
        for (var i = 0 ; i < features.length ;i++){
            var feature = features[i];
            json = feature;
            if(json.related_featuretypes){
                for (var j = 0 ; j < json.related_featuretypes.length ;j++){
                    var linked = this.getLinkedData(json.related_featuretypes[j], attributes, config, index);
                    json.linkedData = linked;
                    break;
                }
                break;
            }
        }
    },
    getLinkedData : function (related_feature,attributes, config, index){
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
        options.sort = this.getAttributeTitle(appLayer, config.categoryAttribute);
        options.attributesToInclude = attributes;
        options.attributesNotNull = attributes;
        Ext.Ajax.request({
            url: appLayer.featureService.getStoreUrl() + featureType+filter,
            params: options,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                var features = response.features;
                this.createGraph(appLayer, features, config, index);
            },
            failure: function(result) {
               this.config.viewerController.logger.error(result);
            }
        });
    },
    buttonClick: function(){
        this.popup.show();
    },
    createGraph : function (appLayer,  data, config, index){
        var gco = config;
        var me = this;
        var fields = this.getAttributeTitle(appLayer,gco.serieAttribute);
        if(!(fields instanceof Array)){
            fields = [fields];
        }
        fields.push(this.getAttributeTitle(appLayer,gco.categoryAttribute));
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
                    // No column type in ExtJS 5
                    type: graphType === 'column' ? 'bar' : graphType,
                    axis: 'left',
                    xField: me.getAttributeTitle(appLayer, gco.categoryAttribute),
                    yField: me.getAttributeTitle(appLayer, serieAttribute),
                    title: me.getAttributeTitle(appLayer,serieAttribute),
                    marker: {
                        type: 'circle',
                        size: 4,
                        radius: 4,
                        'stroke-width': 0
                    },
                    tooltip: {
                        trackMouse: true,
                        minWidth: 140,
                        height: 28,
                        renderer: function(toolTip, item) {
                            toolTip.setHtml(item.get(me.getAttributeTitle(appLayer,gco.categoryAttribute)) + ': ' + item.get(me.getAttributeTitle(appLayer,serieAttribute)));
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
                type: 'numeric',
                position: 'left',
                fields: this.getAttributeTitle(appLayer, gco.serieAttribute),
                renderer: Ext.util.Format.numberRenderer('0,0'),
                title: gco.ylabel,
                grid: true
            },{
                type: 'category',
                position: 'bottom',
                fields: [this.getAttributeTitle(appLayer,gco.categoryAttribute)],
                title: gco.xlabel
            }
        ];
        if(graphType === 'bar') {
            axes[0]['position'] = 'bottom';
            axes[1]['position'] = 'left';
        }
        var chart = Ext.create('Ext.chart.Chart', {
            //theme: 'Flamingo',
            animate: true,
            store: store,
            axes: axes,
            series: series,
            title: gco.title,
            legend: true,
            flipXY: graphType === 'bar'
        });
        var graphPanel = Ext.getCmp(this.config.name + 'graphPanel');
        // remove placeholder
        graphPanel.remove('placeholderContainer' + index, true);
        // add graph in placeholder place
        graphPanel.insert(index, chart);
        // Always select first tab
        if(graphPanel.setActiveTab){
            graphPanel.setActiveTab(0);
        }
    },
    activateMapClick: function(){
        this.deActivatedTools = this.config.viewerController.mapComponent.deactivateTools();
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
        for (var i = 0 ; i < this.config.graphs.length ;i++){
            if(this.config.graphs[i].layer === appLayerId){
                configs.push(this.config.graphs[i]);
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
