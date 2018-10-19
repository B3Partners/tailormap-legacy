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
 * Abstract component to for Arc Layers
  *@author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.viewercontroller.controller.ArcLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    
    /** Cache of http://<arcgis-server>/.../MapServer/legend JSON data keyed by
     * the server URL and then by layer name
     * 
     * The object for a server also contains info whether a Ajax call is in 
     * progress to prevent duplicate Ajax calls  
     */
    /* static */ legendInfoCache: {}, 
    
    constructor: function(config){
        viewer.viewercontroller.controller.ArcLayer.superclass.constructor.call(this,config);
    },
    
    /** 
     * Get info as specified by ViewerController.getLayerLegendInfo() 
     * Exceptions to be catched by the caller.
     */
    getLayerLegendInfo: function(success, failure) {
    
        if(this.getType() == viewer.viewercontroller.controller.Layer.ARCSERVER_TYPE
        || this.getType() == viewer.viewercontroller.controller.Layer.ARCSERVERREST_TYPE) {
            
            this.getLayerLegendInfoArcGIS(
                function(agsLegend) {
                    
                    // convert from ArcGIS JSON format 
                    // to format specified by ViewerController.getLayerLegendInfo() 
                    
                    var legend = { 
                        name: agsLegend.layerName,
                        parts: []
                    };
                    for(var i in agsLegend.legend) {
                        if(!agsLegend.legend.hasOwnProperty(i)) {
                            continue;
                        }
                        var agsPart = agsLegend.legend[i];
                        var part = {
                            label: agsPart.label,
                            url: "data:" + agsPart.contentType + ";base64," + agsPart.imageData
                        };
                        legend.parts.push(part);
                    }
                    
                    success(legend);
                },
                failure
            );
            
        } else {
            /* ArcXML legends not yet supported, needs server side support for a
             * cross-domain POST
             */
            this.getViewerController().logger.warn(i18next.t('viewer_viewercontroller_controller_arclayer_14', {appLayerId: this.getAppLayerId()}));

            failure();
        }
    },
    
    /* Gets the JSON accessible at http://<server-url>/MapServer/legend for this
     * layer.
     * 
     * Uses a cache and transforms the server JSON to avoid looping all layers 
     * to find the JSON so it can be looked up by a simple index by layer name.
     */
    getLayerLegendInfoArcGIS: function(success, failure) {
        var me = this;
        
        var errorMsg = i18next.t('viewer_viewercontroller_controller_arclayer_15', {appLayerId: this.getAppLayerId()});
        
        var appLayerId = this.appLayerId;
        var appLayer = this.getViewerController().getAppLayerById(appLayerId);
        var service = this.getViewerController().app.services[appLayer.serviceId];
        
        /* Check the ArcGIS server version: only since version 10 are legends
         * supported
         */
        if(!service.arcGISVersion) {
            // Only available since version 4.2
            this.getViewerController().logger.warn(errorMsg + i18next.t('viewer_viewercontroller_controller_arclayer_16'));
            failure();
            return;
        }
        if(service.arcGISVersion.major < 10) {
            this.getViewerController().logger.warn(errorMsg + i18next.t('viewer_viewercontroller_controller_arclayer_17') + service.arcGISVersion.s);
            failure();
            return;            
        }
        
        var serviceCache = this.legendInfoCache[service.url];
        
        if(serviceCache && serviceCache.failedPreviously) {
            // Don't try fetching from service everytime, a previous attempt 
            // failed and logged an error
            failure();
            return;            
        }
        
        var onServiceCached = function(theServiceCache) {
            var layerLegend = theServiceCache[appLayer.layerName];
            
            if(!layerLegend) {
                // XXX temp disable
                //me.getViewerController().logger.warn(errorMsg + "server did not return legend info for layer with id " + appLayer.layerName);
                failure();
            } else {
                success(layerLegend);
            }
        };
            
        if(serviceCache && !serviceCache.inProgress) {
            //console.log("using cached legend data for app layer id " + appLayerId);
            
            onServiceCached(serviceCache);
        } else if(serviceCache && serviceCache.inProgress) {
            // An Ajax call is already in progress for this server, join the
            // request
            
            //console.log("joining legend data Ajax call for app layer id " + appLayerId);
            
            serviceCache.joiners.push({
                success: onServiceCached,
                failure: failure
            });
        } else {
            //console.log("doing first-time legend data Ajax call for app layer id " + appLayerId);
            //
            // First time requesting legend data from server, requires an Ajax
            // JSONP call
            serviceCache = { 
                inProgress: true, 
                joiners: []
            };
            this.legendInfoCache[service.url] = serviceCache;
            
            Ext.data.JsonP.request({
                url: service.url + "/legend",
                params: {
                    f: "json"
                },
                disableCaching: false,
                success: function(json) {

                    // Do the following loop only once by building the serviceCache
                    // as indexed by layer id
                    for(var i in json.layers) {
                        if(!json.layers.hasOwnProperty(i)) {
                            continue;
                        }
                        var layer = json.layers[i];
                        serviceCache[layer.layerId] = layer;
                        
                    }
                    serviceCache.inProgress = false;
                    
                   //console.log("legend data received, calling success function");
                    onServiceCached(serviceCache);
                    
                    for(var i = 0; i < serviceCache.joiners.length; i++) {
                        var joiner = serviceCache.joiners[i];
                        //console.log("legend data received, calling joined success function");
                        joiner.success(serviceCache);
                    }
                    delete serviceCache.joiners;
                },
                failure: function(msg) {
                    serviceCache.failedPreviously = true;
                    serviceCache.inProgress = false;

                    me.getViewerController().logger.error(errorMsg + i18next.t('viewer_viewercontroller_controller_arclayer_18') + msg);
                    failure();
                    
                    for(var i = 0; i < serviceCache.joiners.length; i++) {
                        //console.log("legend data Ajax failure, calling joined failure function");
                        var joiner = serviceCache.joiners[i];
                        joiner.failure();
                    }
                    delete serviceCache.joiners;
                }
            });
        } 
    },

    /* Abstract functions below: */
    getId :function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_0')});
    },
    reload : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_1')});
    },
    getName : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_2')});
    },
    //TODO: remove Not for all arclayers!
    getServer :function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_3')});
    },
    //TODO: remove Not for all arclayers!
    getService : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_4')});
    },
    //TODO: remove Not for all arclayers!
    getServlet : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_5')});
    },
    //TODO: remove Not for all arclayers!
    getMapservice : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_6')});
    },
    getLayers : function(){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_7')});
    },
    setMaptips: function(maptips){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_8')});
    },
    passMaptips: function(){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_9')});
    },    
    setVisible : function (visible){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_10')});
    },
    getLegendGraphic: function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_11')});
    },
    setBuffer : function (radius,layer){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_12')});
    },
    removeBuffer: function(layer){        
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_arclayer_13')});
    }
});

