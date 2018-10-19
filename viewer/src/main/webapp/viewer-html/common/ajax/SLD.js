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
                    failureFunction(___("Ajax request failed with status ") + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });
    },
    /**
     * Creates a SLD url. Length of layer,style and cqlfilter must be the same or null
     * @param {String/Array} layer a array of layers or a comma sperated list of layers
     * @param {String/Array} style a array of styles or acomma seperated list of styles
     * @param {Array} cqlFilter a array of cql filters
     * @param {String} featureTypeName featuretypename
     * @param {String} sldId the id of the predefined sld
     * @param {String} commonAndFilter a common and filter (filter for all layers)
     * @param {String/Array} colors of the objects that pass the filter.
     * @param {boolean} true if the filter must be added to the rule
     */
    createURL: function(layer, style, cqlFilter, featureTypeName, sldId, commonAndFilter,colors,useRuleFilter) {
        var url = FlamingoAppLoader.get('absoluteURIPrefix') + this.config.actionbeanUrl;
        if (layer instanceof Array){    
            url = Ext.String.urlAppend(url, "layer=" + layer.join(","));
        }else{
            url = Ext.String.urlAppend(url, "layer=" + layer);
        }
        if (style!==null){
            if (style instanceof Array){
                url = Ext.String.urlAppend(url, "style=" + style.join(","));
            }else{
                url = Ext.String.urlAppend(url, "style=" + style);
            }
        }if(cqlFilter!==null){
            if (cqlFilter instanceof Array){
                url = Ext.String.urlAppend (url,"filter=" + encodeURIComponent(JSON.stringify(cqlFilter)));
            }else{
                url = Ext.String.urlAppend(url, "filter=" + encodeURIComponent(cqlFilter));
            }
        }if (featureTypeName!==null){
            url = Ext.String.urlAppend(url, "featureTypeName=" + featureTypeName);
        }if (sldId!==null){
            url = Ext.String.urlAppend(url, "id=" + sldId);
        }if (commonAndFilter){
            url = Ext.String.urlAppend(url, "commonAndFilter="+encodeURIComponent(commonAndFilter));
        }if(colors){
            if (colors instanceof Array){
                colors= colors.join(",");
            }            
            url = Ext.String.urlAppend(url, "color="+encodeURIComponent(colors));
            
        }if (useRuleFilter){
            url = Ext.String.urlAppend(url, "useRuleFilter=true");
        }
        url = Ext.String.urlAppend(url, "format=xml");
        return url;
    },

    createURLWithHash: function(hash, sessionId, layers, styles){
        var url = FlamingoAppLoader.get('absoluteURIPrefix') + this.config.actionbeanUrl;
       
        url = Ext.String.urlAppend(url, "sldId=" + hash);
        url = Ext.String.urlAppend(url, "sessId=" + sessionId);
        url = Ext.String.urlAppend(url, "findSLD=t");
        url = Ext.String.urlAppend(url, "layer=" + layers);
        url = Ext.String.urlAppend(url, "style=" + styles);
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
                    successFunction(response.filter,response.sldId, response.sessId);
                } else {
                    if(failureFunction != undefined) {
                        failureFunction(response.error);
                    }
                }
            },
            failure: function(result) {
                if(failureFunction != undefined) {
                    failureFunction(___("Ajax request failed with status ") + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });
    }
});
