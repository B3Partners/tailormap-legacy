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
    config: {
        layers:[]
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
        this.div = document.createElement("flamingo-wegvak-popup");
        this.div.addEventListener('wanneerPopupClosed', function(evt){
            console.log("wanneerPopupClosed", evt.detail);
        });
        this.div.setAttribute("config", JSON.stringify(this.getConfig()));
        document.body.appendChild(this.div);
        return this;
    },
    initialize: function(){
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
    mapClicked : function(tool, comp){
       //this.deactivateMapClick();
        //Ext.get(this.getContentDiv()).mask("Haalt features op...")
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

                var attributes = [];

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
                    me.featuresReceived(features, attributes, appLayer);
                }, function (msg) {
                    me.failed(msg);
                }, extraParams);
            }
        }
    },
    featuresReceived : function (features,attributes, appLayer){
        var json = {};
        for (var i = 0 ; i < features.length ;i++){
            var feature = features[i];
            json.id = feature["__fid"];
            json.attributes = feature;
            if(json.related_featuretypes){
                for (var j = 0 ; j < json.related_featuretypes.length ;j++){
                    var linked = this.getLinkedData(json.related_featuretypes[j], attributes, config);
                    json.linkedData = linked;
                    break;
                }
                break;
            }
            this.div.setAttribute("feature-clicked", JSON.stringify(json));
            break;// for now only open the first one
        }
    },
    getLinkedData : function (related_feature,attributes, appLayerId){
        
        var appLayer = this.config.viewerController.getAppLayerById(appLayerId);
        var options = {};

        var filter = "&filter="+encodeURIComponent(related_feature.filter);

        var featureType="&featureType="+related_feature.id;

        options.application = this.appId;
        options.appLayer = appLayer;
        options.limit = 1000;
        options.filter = filter;
        options.graph = true;
        options.arrays = false;
     //   options.sort = this.getAttributeTitleName(appLayer, config.categoryAttribute, false);
        options.attributesToInclude = attributes;
        options.attributesNotNull = attributes;
        Ext.Ajax.request({
            url: appLayer.featureService.getStoreUrl() + featureType+filter,
            params: options,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                var features = response.features;
                console.log("related features:", features)
                //this.createGraph(appLayer, features, config);
            },
            failure: function(result) {
               this.config.viewerController.logger.error(result);
            }
        });
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
                            name: "Wegvakonderdeel"
                        }
            }
        };
    },
    
    failed: function(msg) {
        Ext.MessageBox.alert(i18next.t('viewer_components_graph_5'), i18next.t('viewer_components_graph_6'));
    }
});
