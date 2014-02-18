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
/**
 * A manager to handle asynchronous requests
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */


Ext.define ("viewer.components.RequestManager",{
    previousRequests: null,
    featureInfo:null,
    constructor: function(featureInfo){
        this.previousRequests = new Object();
        this.featureInfo = featureInfo;
    },
    request: function(id, options, radius, layers, callback, failure) {
        var me = this;
  
        if (this.previousRequests[id] === undefined) {
            this.previousRequests[id] = new Array();
            this.cancelPrevious(id);
        }
        var request = this.featureInfo.layersFeatureInfo(options.coord.x, options.coord.y, radius, layers, id,callback, this.onFailure);
        
        this.previousRequests[id].push(request);
        
    },
    cancelPrevious : function(currentId){
        for( var id in this.previousRequests){
            if(id !== currentId){
                this.cancel(id);
                delete this.previousRequests[id];
            }
        }
    },
    cancel : function (id){
        var requests = this.previousRequests[id];
        for (var i = 0 ; i < requests.length; i++){
            var request = requests[i];
            Ext.Ajax.abort(request);
        }
    }
});