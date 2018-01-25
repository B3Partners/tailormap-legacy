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
/* global Ext */

/**
 * A manager to handle asynchronous requests
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.RequestManager",{
    previousRequests: null,
    featureInfo:null,
    viewerController:null,
    constructor: function(featureInfo,viewerController){
        this.previousRequests = new Object();
        this.featureInfo = featureInfo;
        this.config.viewerController = viewerController;
    },
    request: function (id, options, radius, layers, callback, failure, scope, params) {
        var me = this;
        if (!scope) {
            scope = me;
        }
        if (this.previousRequests[id] === undefined) {
            this.previousRequests[id] = new Object();
            this.previousRequests[id].requests = new Array();
            this.previousRequests[id].total = 0;
            this.previousRequests[id].done = 0;
            this.cancelPrevious(id);
        }
        var extraParams = Ext.merge({}, params, {
            requestId: id
        });
        for(var i = 0 ; i < layers.length;i++){
            var request = this.featureInfo.layersFeatureInfo(options.coord.x, options.coord.y, radius, [layers[i]], extraParams,function(data){
                me.responseReceived(data[0].requestId);
                callback(data);
            }, failure, scope);
            
            if(request){
                this.previousRequests[id].requests.push(request);
                if(options.useCursorForWaiting){
                    this.config.viewerController.mapComponent.setCursor(true, "wait");
                }
                this.previousRequests[id].total++;
            }
        }
    },
    
    requestsFinished: function(requestId) {
        return (this.previousRequests[requestId].done === this.previousRequests[requestId].total);
    },
    
    responseReceived: function (id){
        this.previousRequests[id].done++;
        if(this.requestsFinished(id)){
            this.config.viewerController.mapComponent.setCursor(false);
        }
    },
    
    cancelPrevious : function(currentId){
        for( var id in this.previousRequests){
            if(!this.previousRequests.hasOwnProperty(id)) {
                continue;
            }
            if(id !== currentId) {
                this.cancel(id);
                delete this.previousRequests[id];
            }
        }
    },
    cancel : function (id){
        var requests = this.previousRequests[id].requests;
        for (var i = 0 ; i < requests.length; i++){
            var request = requests[i];
            Ext.Ajax.abort(request);
        }
    }
});