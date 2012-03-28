/* 
 * Copyright (C) 2012 B3Partners B.V.
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
        var visibleLayerIds = viewerController.getVisibleLayerIds();
        
        var visibleAppLayers = {};
        
        for(var i in visibleLayerIds) {
            var s = visibleLayerIds[i];
            var idx = s.indexOf("_");
            var id = s.substring(0,idx);
            var layer = s.substring(idx+1);
            
            for(var appLayerId in viewerController.app.appLayers) {
                var appLayer = viewerController.app.appLayers[appLayerId];

                if(appLayer.serviceId == id && appLayer.layerName == layer) {
                    visibleAppLayers[appLayer.id] = true;
                }
            }
        }
        return visibleAppLayers;

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
        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {featureInfo: true, x: x, y: y, distance: distance, queryJSON: Ext.JSON.encode(queries)},
            timeout: 40000,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                successFunction(response);
            },
            failure: function(result) {
                if(failureFunction != undefined) {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });        
    }
});
