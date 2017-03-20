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

/**
 * ServiceInfo
 * Load information about a service using Ajax to leverage server-side code.
 * 
 * It is not a vulnerability that the user can cause the server to load a 
 * user-inputted URL: only service info according to the protocol is requested.
 * Only "arcims" protocol causes a POST request but the user cannot control the 
 * request body.
 * 
 * A downside is that the user cannot use a service in his LAN or a service for 
 * which he is on a whitelist because the service info is requested by the server.
 *  
 * @author Matthijs Laan
 */

Ext.define("viewer.ServiceInfo", {
    config: {
        actionbeanUrl: null,
        protocol: "wms",
        url : null
    },
    url: null,
    constructor: function(config) {        
        this.initConfig(config);     
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["service"];
        }        
    },
    loadInfo: function(successFunction, failureFunction) {
        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: this.config, // XXX also posts actionbeanUrl, but is harmless
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                
                if(response.success) {
                    successFunction(response.service);
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


