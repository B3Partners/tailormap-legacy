/*
 * Copyright (C) 2016 B3Partners B.V.
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

Ext.define("viewer.FeatureExtent", {
    config: {
        actionbeanUrl: null
    },
    constructor: function(config) {
        this.initConfig(config);
        if(this.config.actionbeanUrl === null) {
            this.config.actionbeanUrl = actionBeans["featureExtent"];
        }
    },
    getExtentForFeatures: function (featureIds, appLayer, buffer, successFn, failedFn) {
        if(!Ext.isArray(featureIds)) {
            featureIds = [featureIds];
        }
        var filter = ["IN ('", featureIds.join("','"), "')"].join("");
        this._doRequest(filter, appLayer, buffer, successFn, failedFn);
    },
    getExtentForFilter: function (filter, appLayer,  buffer, successFn, failedFn) {
        if(filter === "") {
            filter = "include";
        }
        this._doRequest(filter, appLayer,  buffer, successFn, failedFn);
    },
    _doRequest: function (filter, appLayer,  buffer, successFunction, failureFunction) {
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {
                buffer: buffer,
                filter: filter,
                appLayer: appLayer.id
            },
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                if(response.success) {
                    successFunction(response.extent);
                } else if(typeof failureFunction !== "undefined") {
                    failureFunction(response.error);
                }
            },
            failure: function(result) {
                if(typeof failureFunction !== "undefined") {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });
    }
});