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

Ext.define("viewer.DirectFeatureService", {
    config: {
        actionBeanUrl: null,
        appLayer: null,
        protocol: null,
        url: null
    },
    constructor: function(config) {        
        this.initConfig(config);      
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["feature"];
        }        
        console.log("DirectFeatureService init", this.config);        
    },
    loadAttributes: function(successFunction, failureFunction) {
        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {getLayerFeatureType: true, protocol: this.protocol, layer: this.appLayer.layerName},
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                
                if(response.success) {
                    
                    successFunction(response.attributes);
                } else {
                    if(failureFunction != undefined) {
                        failureFunction(response.error);
                    }
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

Ext.define("viewer.AppLayerService", {
    config: {
        actionbeanUrl: null,
        appLayer: null,
        debug: false
    },
    constructor: function(config) {        
        if(config.actionbeanUrl == null) {
            config.actionbeanUrl = actionBeans["appLayer"];
        }        
        this.initConfig(config);     
    },
    loadAttributesAndDetails: function(theAppLayer, successFunction, failureFunction) {
        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {attributes: true, appLayer: this.appLayer.id},
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                
                if(response.success) {
                    theAppLayer.attributes = response.attributes;
                    theAppLayer.geometryAttributeIndex = response.geometryAttributeIndex;
                    theAppLayer.geometryAttribute = response.geometryAttribute;
                    theAppLayer.details = response.details;
                    successFunction(response.attributes);
                } else {
                    if(failureFunction != undefined) {
                        failureFunction(response.error);
                    }
                }
            },
            failure: function(result) {
                if(failureFunction != undefined) {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });
    },
    getStoreUrl: function() {
        return this.getActionbeanUrl() + "?store=1&appLayer=" + this.appLayer.id + (this.debug ? "&debug=true" : "");
    }
});
