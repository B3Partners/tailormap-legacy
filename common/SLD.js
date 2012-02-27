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

Ext.define("viewer.SLD", {
    config: {
        actionbeanUrl: null
    },
    constructor: function(config) {        
        this.initConfig(config);      
    },
    /**
     * Create a SLD for named layers in the layers parameter. Optionally specify
     * the named styles and filters. Do not use empty array values in styles and
     * cqlFilters parameters but use "none" for no style or filter. The styles 
     * and cqlFilters parameters can be null.
     * 
     * Examples:
     * var f = function(sld) { alert(sld); };
     * create( ["mylayer"], null, null, f, f);
     * create( ["mylayer"], null, ["property = 'value'"], f, f);
     * create( ["mylayer1", "mylayer2"], ["none", "default"], null, f, f);
     * create( ["mylayer1", "mylayer2"], null, ["none", "property = 'value'"], f, f);
     */
    create: function(layers, styles, cqlFilters, successFunction, failureFunction) {
        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {layers: layers, styles: styles, filters: cqlFilters}, 
            success: function(result) {
                var response = JSON.parse(result.responseText);
                
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
    }
});
