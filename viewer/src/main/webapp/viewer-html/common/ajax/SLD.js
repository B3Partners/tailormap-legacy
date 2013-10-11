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

Ext.define("viewer.SLD", {
    config: {
        actionbeanUrl: null
    },
    constructor: function(config) {        
        this.initConfig(config);  
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["sld"];
        }
    },
    /**
     * Create a SLD for named layer in the layer parameter. Optionally specify
     * the named style and filter. The style and cqlFilter parameters can be
     * null. Specify the feature type name when specifying a CQL filter or leave
     * it null for the same name as the layer.
     * 
     * Use sldId to apply filter to existing StyleLibrary saved in database (may
     * be external, retrieved server-side).
     * 
     * Examples:
     * var f = function(sld) { alert(sld); };
     * create("mylayer", null, null, null, null, f, f);
     * create("mylayer", null, "property = 'value'", "thelayerfeaturetype", null, f, f);
     * create("mylayer", "default", null, null, null, f, f);
     */
    create: function(layer, style, cqlFilter, featureTypeName, sldId, successFunction, failureFunction) {
        var params={
            layer: layer,
            format: 'json'
        };
        if (style!==null){
            params.style=style;
        }if(cqlFilter!==null){
            params.filter=cqlFilter;
        }if (featureTypeName!==null){
            params.featureTypeName=featureTypeName;
        }if (sldId!==null){
            params.id=sldId;
        }
        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: params,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                
                if(response.success) {
                    successFunction(response.sld);
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
    
    createURL: function(layer, style, cqlFilter, featureTypeName, sldId) {
        var url = absoluteURIPrefix + this.config.actionbeanUrl;
            url = Ext.urlAppend(url, "layer=" + layer);
        if (style!==null){
            url = Ext.urlAppend(url, "style=" + style);
        }if(cqlFilter!==null){
            url = Ext.urlAppend(url, "filter=" + cqlFilter);
        }if (featureTypeName!==null){
            url = Ext.urlAppend(url, "featureTypeName=" + featureTypeName);
        }if (sldId!==null){
            url = Ext.urlAppend(url, "id=" + sldId);
        }
        url = Ext.urlAppend(url, "format=xml");
        return url;
    },
    
    transformFilter: function (filter,appLayerId,successFunction, failureFunction){
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {
                filter: filter,
                applicationLayer: appLayerId
            },
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                
                if(response.success) {
                    successFunction(response.filter);
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
