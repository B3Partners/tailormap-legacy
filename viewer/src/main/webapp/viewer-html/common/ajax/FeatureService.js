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

Ext.define("viewer.DirectFeatureService", {
    config: {
        actionbeanUrl: null,
        appLayer: null,
        protocol: null,
        url: null
    },
    constructor: function(config) {
        this.initConfig(config);
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["feature"];
        }
        //console.log("DirectFeatureService init", this.config);
    },
    loadAttributes: function(successFunction, failureFunction) {

        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {getLayerFeatureType: true, protocol: this.config.protocol, layer: this.config.appLayer.layerName},
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
    },
    getCount : function(appLayer, successFunction, failureFunction,filter,scope){
        successFunction(16);
    }
});

Ext.define("viewer.AppLayerService", {
    config: {
        actionbeanUrl: null,
        appId: null,
        appLayer: null,
        debug: false
    },
    constructor: function(config) {
        if(config.actionbeanUrl == null) {
            config.actionbeanUrl = actionBeans["attributes"];
        }
        this.initConfig(config);
    },
    loadAttributes: function(theAppLayer, successFunction, failureFunction) {
        var appLayerId = theAppLayer.id;
        if(!isNaN(appLayerId) && this.config.actionbeanUrl){
            Ext.Ajax.request({
                url: this.config.actionbeanUrl,
                timeout: 120000,
                params: {attributes: true, application: this.config.appId, appLayer: this.config.appLayer.id},
                success: function(result) {
                    var response = Ext.JSON.decode(result.responseText);

                    if(response.success) {
                        theAppLayer.attributes = response.attributes;
                        theAppLayer.relations= response.relations;
                        theAppLayer.geometryAttributeIndex = response.geometryAttributeIndex;
                        theAppLayer.geometryAttribute = response.geometryAttribute;
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
        }else{
            if(failureFunction != undefined) {
                failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
            }
        }
    },
    getStoreUrl: function() {
        var url = this.getActionbeanUrl();
        return Ext.urlAppend(url, "store=1&application=" + this.config.appId + "&appLayer=" + this.config.appLayer.id + (this.config.debug ? "&debug=true" : ""));
    },

    loadFeatures: function(appLayer, successFunction, failureFunction,options,scope) {
        var appLayerId= appLayer.id;
        if(!isNaN(appLayerId)){
            var filter=null;
            if(appLayer && appLayer.filter) {
                filter = appLayer.filter.getCQL();
            }
            if (options === undefined || options === null){
                options={};
            }
            options.application = this.config.appId;
            options.appLayer = appLayerId;
            options.filter = options.filter === undefined ? filter: options.filter;
            Ext.Ajax.request({
                url: this.getStoreUrl(),
                timeout: 120000,
                params: options,
                scope: scope,
                success: function(result) {
                    var response = Ext.JSON.decode(result.responseText);
                    if(response.success) {
                        successFunction.call(this,response.features);
                    } else {
                        if(failureFunction != undefined) {
                            failureFunction.call(this, response.error || response.message);
                        }
                    }
                },
                failure: function(result) {
                    if(failureFunction != undefined) {
                        failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                    }
                }
            });
        }else{
            if(failureFunction != undefined) {
                failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
            }
        }
    },
    getCount : function(appLayer, successFunction, failureFunction,filter,scope){
        successFunction(16);
    }
});
