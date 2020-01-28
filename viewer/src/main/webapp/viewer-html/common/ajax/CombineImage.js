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
 * Submits image settings with ajax. To the image combine action
 */
Ext.define("viewer.CombineImage", {
    config: {
        actionbeanUrl: null
    },
    constructor: function(config) {        
        this.initConfig(config);      
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["combineimage"];
        }        
    },
    /**
     * submits the params to the image action and returns a url to the image.
     * @param params the params
     * @param succesFunction the function that is called when success
     * @param failureFunction the function that is called when failed
     */
    getImageUrl: function(params, successFunction, failureFunction) {        
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {create: true, "params": params},
            method: 'POST',
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);                
                if(response.success) {
                    successFunction(response.imageUrl);
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
    /**
     * submits the params to the image action and downloads the image.
     * @param params the params
     * @param succesFunction the function that is called when success
     * @param failureFunction the function that is called when failed
     */
    downloadImage: function (params, successFunction, failureFunction) {
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {
                download: true,
                "params": params
            },
            method: 'POST',
            binary: true,
            success: function (result) {
                if (successFunction !== undefined) {
                    var blob = new Blob([result.responseBytes], {type: 'image/png'});
                    // get filename
                    var disposition = result.getResponseHeader('content-disposition');
                    var matches = /"([^"]*)"/.exec(disposition);
                    var filename = (matches !== null && matches[1] ? matches[1] : 'kaart.png');
                    successFunction(blob, filename);
                } else {
                    if (failureFunction !== undefined) {
                        failureFunction("Ajax request failed with status " + result.status + " " + result.statusText);
                    }
                }
            },
            failure: function (result) {
                if (failureFunction != undefined) {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText);
                }
            }
        });
    }
});


