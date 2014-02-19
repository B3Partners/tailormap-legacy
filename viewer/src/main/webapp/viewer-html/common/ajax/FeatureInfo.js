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

Ext.define("viewer.FeatureInfo", {
    config: {
        actionBeanUrl: null,
        viewerController: null
    },
    constructor: function(config) {        
        this.initConfig(config);      
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["featureinfo"];
        }        
    },
    getVisibleAppLayers: function() {
        var visibleLayerIds = this.viewerController.getVisibleLayers();
        
        var visibleAppLayers = {};
        
        for(var i in visibleLayerIds) {            
            var id=visibleLayerIds[i];
            var appLayer = viewerController.getAppLayerById(id);
            if(appLayer != null) {
                visibleAppLayers[appLayer.id] = true;
            }
        }
        return visibleAppLayers;

    },
    featureInfoInternal: function(params, successFunction, failureFunction,scope) {
        var me = this;
        params = Ext.apply(params, { application: this.viewerController.app.id });
        return Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: params,
            scope:scope,
            timeout: 60000,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                
                for(var i in response) {
                    var r = response[i];
                    if(r.request.appLayer) {
                        r.appLayer = me.viewerController.app.appLayers[r.request.appLayer];
                    } else if(r.request.service) {
                        r.service = me.viewerController.app.services[r.request.service];
                    }
                }
                successFunction(response);
            },
            failure: function(result) {
                if(failureFunction != undefined) {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });        
    },
    featureInfo: function(x, y, distance, successFunction, failureFunction) {
        var visibleAppLayers = this.getVisibleAppLayers();
        
        var queries = [];
        for(var id in visibleAppLayers) {
            var appLayer = this.viewerController.app.appLayers[id];
            var query = { appLayer: appLayer.id };
            if(appLayer.filter) {
                query.filter = appLayer.filter.getCQL();
            }
            queries.push(query);
        }
        
        var params = {featureInfo: true, x: x, y: y, distance: distance, queryJSON: Ext.JSON.encode(queries)};

        this.featureInfoInternal(params, successFunction, failureFunction);
    },
    layersFeatureInfo: function(x, y, distance, appLayers, extraParams, successFunction, failureFunction,scope) {

        var visibleAppLayers = this.getVisibleAppLayers();
        
        var queries = [];
        for(var i in appLayers) {
            var appLayer = appLayers[i];
            
            if(visibleAppLayers[appLayer.id] === true) {
                var query = { appLayer: appLayer.id };
                if(appLayer.filter) {
                    query.filter = appLayer.filter.getCQLWithoutType("GEOMETRY");
                }
                queries.push(query);
            }
        }
        
        var params = {
            featureInfo: true, 
            x: x, 
            y: y, 
            distance: distance, 
            queryJSON: Ext.JSON.encode(queries)
        };
        Ext.merge(params, extraParams);
        if(queries.length > 0) {
            return this.featureInfoInternal(params, successFunction, failureFunction,scope);
        }
    },    
    editFeatureInfo: function(x, y, distance, appLayer, successFunction, failureFunction) {
        var query = [{appLayer: appLayer.id}];
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {application: this.viewerController.app.id, featureInfo: true, edit: true, arrays: true, x: x, y: y, distance: distance, queryJSON: Ext.JSON.encode(query)},
            timeout: 40000,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText)[0];

                if(response.error) {
                    failureFunction("Error finding feature to edit: " + response.error);
                } else {
                    successFunction(response.features);
                }
            },
            failure: function(result) {
                if(failureFunction != undefined) {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });         
    }
});
