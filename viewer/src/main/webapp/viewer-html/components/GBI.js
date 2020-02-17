/* 
 * Copyright (C) 2020 B3Partners B.V.
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
/* global Ext, i18next */

/**
 * GBI component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.GBI", {
    extend: "viewer.components.Component",
    div: null,
    toolMapClick:null,
    formConfigs:null,
    relatedFeatureCounter: {},
    config: {
        layers:[],
        configUrl:null
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.GBI.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function() {
                var deferred = me.createDeferred();
                me.showWindow();
             
                return deferred.promise;
            },
            text: "me.config.title"
        });
        this.initialize();
        
        return this;
    },
    initialize: function(){
        this.loadConfig();
        this.toolMapClick =  this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.config.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.config.viewerController
        });
        this.toolMapClick.activateTool();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_EDIT_MULTIPLE_FEATURES_START,this.editMultiple,this);
    },
    initializeForm: function(){
        this.div = document.createElement("flamingo-wegvak-popup");
        this.div.addEventListener('wanneerPopupClosed', function(evt){
            console.log("wanneerPopupClosed", evt.detail);
        });
        this.div.setAttribute("config", JSON.stringify(this.formConfigs));
        this.div.setAttribute("application", this.config.viewerController.app.id);
        document.body.appendChild(this.div);
    },
    loadConfig: function(){
        Ext.Ajax.request({
            url: this.config.configURL,
            scope: this,
            success: function(result) {
                var text = result.responseText;
                var response = Ext.JSON.decode(text);
                this.formConfigs = response;
                this.initializeForm();
            },
            failure: function(result) {
               this.config.viewerController.logger.error(result);
            }
        });
    },
    mapClicked : function(tool, comp){
        var coords = comp.coord;
        var x = coords.x;
        var y = coords.y;

        var appLayers = this.config.layers;
        for (var key in appLayers) {
            if (appLayers.hasOwnProperty(key)) {
                var me = this;
                var appLayer = me.config.viewerController.getAppLayerById(appLayers[key]);

                if (appLayer === null) {
                    Ext.MessageBox.alert(i18next.t('viewer_components_graph_2'), i18next.t('viewer_components_graph_3'));
                    return;
                }

                var extraParams = {
                    graph: false,
                    edit:false,
                    arrays: false,
                    attributesToInclude: this.getAttributesToInclude(this.formConfigs.config, appLayer)
                };
                me.config.viewerController.mapComponent.getMap().setMarker("gbi", x, y);
                var featureInfo = Ext.create("viewer.FeatureInfo", {
                    viewerController: me.config.viewerController
                });
                featureInfo.editFeatureInfo(x, y, me.config.viewerController.mapComponent.getMap().getResolution() * 4, appLayer, function (response) {
                    var features = response.features;
                    me.featuresReceived(features, appLayer);
                }, function (msg) {
                    me.failed(msg);
                }, extraParams);
            }
        }
    },

    featuresReceived : function (features, appLayer){
        var json = {};
        for (var i = 0 ; i < features.length ;i++){
            var feature = features[i];
            json = this.convertFeature(feature, appLayer.id);
                        
            if(feature.related_featuretypes){
                json.children = [];
                this.relatedFeatureCounter[json.id] ={
                    totalRelated :feature.related_featuretypes.length,
                    totalRetrieved: 0
                };
                for (var j = 0 ; j < feature.related_featuretypes.length ;j++){
                    this.getLinkedData(feature.related_featuretypes[j], json, appLayer);
                }
                break;
            }else{
                this.div.setAttribute("app-layer", this.stringifyAppLayer(appLayer));
                this.div.setAttribute("feature-clicked", JSON.stringify(json));
            }
            break;// for now only open the first one
        }
    },
    editMultiple: function(appLayer, a, b,c ){
        var options = {};
        options.application = this.appId;
        options.appLayer = appLayer.id;
        options.limit = 1000;
        options.filter =  appLayer.filter ? appLayer.filter.getCQL() : null;
        options.graph = false;
        options.edit = false;
        options.arrays = false;
        options.attributesToInclude = this.getAttributesToInclude(this.formConfigs.config, appLayer);
        Ext.Ajax.request({
            url: appLayer.featureService.getStoreUrl(),
            params: options,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                var fs = response.features;
                var features = [];
                for(var i = 0 ; i < fs.length ;i++){
                    features.push(this.convertFeature(fs[i],appLayer.id));
                }
                this.div.setAttribute("app-layer", this.stringifyAppLayer(appLayer));
                this.div.setAttribute("feature-clicked", JSON.stringify(features));
            },
            failure: function(result) {
               this.config.viewerController.logger.error(result);
            }
        });
    },
    convertFeature: function(feature, appLayer){
        var json = {};
        json.id = feature["__fid"];
        json.attributes = feature;
        json.appLayer = appLayer;
        return json;
    },
    getLinkedData : function (related_featuretype, feature, appLayer){
        var appLayer = this.config.viewerController.getAppLayerById(appLayer.id);
        var options = {};

        var filter = "&filter="+encodeURIComponent(related_featuretype.filter);

        var featureType="&featureType="+related_featuretype.id;

        options.application = this.appId;
        options.appLayer = appLayer.id;
        options.limit = 1000;
        options.filter = filter;
        options.graph = true;
        options.edit = false;
        options.attributesToInclude = this.getAttributesToInclude(this.formConfigs.config, appLayer);
        options.arrays = false;
        Ext.Ajax.request({
            url: appLayer.featureService.getStoreUrl() + featureType+filter,
            params: options,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                var features = response.features;
                var childs = [];
                for(var i = 0 ; i < features.length ;i++){
                    childs.push(this.convertFeature(features[i],appLayer.id));
                }
                feature.children = feature.children.concat(childs);
                this.relatedFeatureFinishedLoading(feature, appLayer);
            },
            failure: function(result) {
               this.config.viewerController.logger.error(result);
            }
        });
    },
    relatedFeatureFinishedLoading: function(feature, appLayer){
        this.relatedFeatureCounter[feature.id]["totalRetrieved"] = this.relatedFeatureCounter[feature.id]["totalRetrieved"]+1;
        if(this.relatedFeatureCounter[feature.id]["totalRetrieved"] === this.relatedFeatureCounter[feature.id]["totalRelated"]){
            this.div.setAttribute("app-layer", this.stringifyAppLayer(appLayer));
            this.div.setAttribute("feature-clicked", JSON.stringify(feature));
        }
    },
    
    getAttributesToInclude: function(formConfigs, appLayer){
        var attributes = [];
        for(var key in formConfigs){
            if(formConfigs.hasOwnProperty(key)){
                var formConfig = formConfigs[key];
                for (var i = 0 ; i< formConfig.fields.length ;i++){
                    var field = formConfig.fields[i];
                    for(var j = 0 ; j < appLayer.attributes.length ;j++){
                        var attr = appLayer.attributes[j];
                        if(attr.name === field.key){
                            attributes.push(attr.id);
                            break;
                        }
                    }
                }
            }
        }
        return attributes;
    },
    
    stringifyAppLayer: function(al){
        var culledObject = {
            id: al.id,
            layername: al.layername,
            serviceId: al.serviceId,
            attributes: al.attributes
        };
        var stringified = JSON.stringify(culledObject);
        return stringified;
    },
    failed: function(msg) {
        Ext.MessageBox.alert(i18next.t('viewer_components_graph_5'), i18next.t('viewer_components_graph_6'));
    }
});
