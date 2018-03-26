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

Ext.define("viewer.EditFeature", {
    config: {
        actionbeanUrl: null,
        viewerController: null
    },
    constructor: function(config) {        
        this.initConfig(config);      
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["editfeature"];
        }        
    },
    edit: function(appLayer, feature, successFunction, failureFunction, extendUrl) {
        if(extendUrl === undefined){
            extendUrl = "";
        }
        Ext.Ajax.request({
            url: this.config.actionbeanUrl+extendUrl,
            params: {application: this.config.viewerController.app.id, appLayer: appLayer.id, feature: Ext.JSON.encode(feature)},
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);   
                if(response.success) {
                    if(response.hasOwnProperty("__fid")) {
                        successFunction(response.__fid);
                    } else {
                        successFunction(null);
                    }
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
    remove: function(appLayer, feature,successFunction, failureFunction, extendUrl){
        var obj ={};
        if(extendUrl === undefined){
            extendUrl = "";
            obj = {application: this.config.viewerController.app.id, appLayer: appLayer.id, feature: Ext.JSON.encode(feature),"delete": "d"};
        }else if(extendUrl === "?removeRelatedFeatures"){
            obj = {application: this.config.viewerController.app.id, appLayer: appLayer.id, feature: Ext.JSON.encode(feature)};
        }
        Ext.Ajax.request({
            url: this.config.actionbeanUrl+extendUrl,
            params: obj,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);             
                if(response.success) {                    
                    successFunction();
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