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
    },
    initializeForm: function(){
        this.div = document.createElement("flamingo-wegvak-popup");
        this.div.addEventListener('wanneerPopupClosed', function(evt){
            console.log("wanneerPopupClosed", evt.detail);
        });
        this.div.setAttribute("config", JSON.stringify(this.formConfigs));
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
                    arrays: false
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
    relatedFeatureCounter: {},
    featuresReceived : function (features, appLayer){
        var json = {};
        for (var i = 0 ; i < features.length ;i++){
            var feature = features[i];
            json = this.convertFeature(feature);
                        
            if(feature.related_featuretypes){
                json.children = [];
                this.relatedFeatureCounter[json.id] ={
                    totalRelated :feature.related_featuretypes.length,
                    totalRetrieved: 0
                };
                for (var j = 0 ; j < feature.related_featuretypes.length ;j++){
                    this.getLinkedData(feature.related_featuretypes[j], json, appLayer.id);
                }
                break;
            }else{
                this.div.setAttribute("feature-clicked", JSON.stringify(json));
            }
            break;// for now only open the first one
        }
    },
    convertFeature: function(feature){
        var json = {};
        json.id = feature["__fid"];
        json.attributes = feature;
        return json;
    },
    getLinkedData : function (related_featuretype, feature, appLayerId){
        var appLayer = this.config.viewerController.getAppLayerById(appLayerId);
        var options = {};

        var filter = "&filter="+encodeURIComponent(related_featuretype.filter);

        var featureType="&featureType="+related_featuretype.id;

        options.application = this.appId;
        options.appLayer = appLayerId;
        options.limit = 1000;
        options.filter = filter;
        options.graph = false;
        options.edit = false;
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
                    childs.push(this.convertFeature(features[i]));
                }
                feature.children = [...childs];
                this.relatedFeatureFinishedLoading(feature);
            },
            failure: function(result) {
               this.config.viewerController.logger.error(result);
            }
        });
    },
    relatedFeatureFinishedLoading: function(feature){
        this.relatedFeatureCounter[feature.id]["totalRetrieved"] = this.relatedFeatureCounter[feature.id]["totalRetrieved"]+1;
        if(this.relatedFeatureCounter[feature.id]["totalRetrieved"] === this.relatedFeatureCounter[feature.id]["totalRelated"]){
            this.div.setAttribute("feature-clicked", JSON.stringify(feature));
        }
    },
    showWindow: function(){
        this.div.setAttribute("feature-clicked", JSON.stringify(this.getData()));
        this.resolveDeferred();
    },
    getData: function(){
        return {
            id: 'wegvakaonderdeel',
            featureType: "Planning",
            featureSource: 'orakel',
            attributes: [
              {
                key: 'id',
                value: '123'
              },{
                key: 'type',
                value: 'WEGOPBREKING'
              },{
                key: 'naam',
                value: 'Bob de Bouwer'
              }
            ]
          };
    },

    getConfig: function () {
        return {config: {
                'wegvakonderdeel': // featureTypeId
                        {
                            fields: [
                                {
                                    key: 'id',
                                    type: 'textfield',
                                    column: 1,
                                    tab: 1
                                },
                                {
                                    key: 'woonplaats',
                                    type: 'textfield',
                                    column: 1,
                                    tab: 1
                                },
                                {
                                    key: 'verhardingsfunctie',
                                    type: 'textfield',
                                    column: 2,
                                    tab: 1
                                },
                                {
                                    key: 'buurt',
                                    type: 'textfield',
                                    column: 2,
                                    tab: 1
                                },
                                {
                                    key: 'std_domein',
                                    type: 'textfield',
                                    column: 1,
                                    tab: 2
                                }, {
                                    key: 'type',
                                    type: 'combo',
                                    column: 2,
                                    tab: 2
                                }
                            ],
                            tabs: 2,
                            name: "Wegvakonderdeel",
                            tabConfig:{
                                1: "Eerste",
                                2: "Tweede"
                            }
                        }
            }
        };
    },
    
    failed: function(msg) {
        Ext.MessageBox.alert(i18next.t('viewer_components_graph_5'), i18next.t('viewer_components_graph_6'));
    }
});
