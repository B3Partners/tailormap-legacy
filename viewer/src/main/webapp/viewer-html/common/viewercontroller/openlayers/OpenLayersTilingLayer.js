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
 * @class
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersTilingLayer",{
    extend: "viewer.viewercontroller.controller.TilingLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    utils: null,
    /**
     *Constructor
     */
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersTilingLayer.superclass.constructor.call(this, config);

        if(!Ext.Array.contains(["TMS", "ArcGisRest", "WMTS"], this.getProtocol())) {
            throw new Error("OpenLayersTilingLayer currently does not support tiling protocol " + this.getProtocol());
        }

        this.mixins.openLayersLayer.constructor.call(this,config);

        this.type=viewer.viewercontroller.controller.Layer.TILING_TYPE;
        this.utils = Ext.create("viewer.viewercontroller.openlayers.Utils");
        
        var opacity = this.config.opacity !== undefined ? this.config.opacity : 1;
        var options = {
            serverResolutions: this.resolutions,
            type: this.extension,
            transitionEffect: opacity === 1 ? "resize" : null,
            visibility: this.visible === undefined ? true : this.visible,
            opacity: this.config.opacity !== undefined ? this.config.opacity : 1,
            attribution: this.config.attribution
        };
        if(this.getTileWidth() && this.getTileHeight()){
            options.tileSize = new OpenLayers.Size(this.getTileWidth(),this.getTileHeight());
        }
        if(this.serviceEnvelope){
            var serviceEnvelopeTokens=this.serviceEnvelope.split(",");
            var x=Number(serviceEnvelopeTokens[0]);
            var y=Number(serviceEnvelopeTokens[1]);
            //if arcgisrest/wmts the origin y is top left. (maxy)
            if (this.getProtocol()==="ArcGisRest" || this.getProtocol() === "WMTS"){
                y=Number(serviceEnvelopeTokens[3]);
            }
            options.maxExtent = new OpenLayers.Bounds(Number(serviceEnvelopeTokens[0]),Number(serviceEnvelopeTokens[1]),Number(serviceEnvelopeTokens[2]),Number(serviceEnvelopeTokens[3]));
            options.tileOrigin = new OpenLayers.LonLat(x,y);
        }
        if(this.resolutions){
            options.maxResolution = this.resolutions[0];
        }
        if (this.getProtocol() === "TMS") {
            //fix the url: example: "http://tilecache.kaartenbalie.nl/tilecache.cgi/1.0.0/osm/"
            var version = null;
            var layerName = null;
            if (this.url.lastIndexOf("/") === this.url.length - 1) {
                this.url = this.url.substring(0, this.url.length - 1);
            }
            var urlTokens = this.url.split("/");
            layerName = urlTokens[urlTokens.length - 1];
            version = urlTokens[urlTokens.length - 2];
            urlTokens.splice(urlTokens.length - 2, 2);
            this.url = urlTokens.join("/") + "/";
            //set TMS tiling options.

            options.serviceVersion = version;
            options.layername = layerName;
            this.frameworkLayer = new OpenLayers.Layer.TMS(layerName,this.url,options);
        }else if(this.getProtocol()==="ArcGisRest"){
            options.resolutions = this.resolutions;
            options.projection =  'EPSG:28992';
            this.frameworkLayer = new OpenLayers.Layer.ArcGISCache(this.name,this.url,options);
        }else if (this.getProtocol()==="WMTS"){
            var convertRatio = 1/0.00028;
            options.url = this.url;
            options.style = this.config.style;
            options.layer = this.config.name;
            options.matrixSet = this.config.matrixSet.identifier;
            options.matrixIds = this.getMatrixIds(this.config.matrixSet.matrices);
            options.format = this.extension;
            options.maxResolution = this.config.matrixSet.matrices[0].scaleDenominator /convertRatio;
            options.minResolution = this.config.matrixSet.matrices[this.config.matrixSet.matrices.length -1].scaleDenominator /convertRatio;
            var wmts = new OpenLayers.Layer.WMTS(options);
            this.frameworkLayer = wmts;
        }
    },
    
    getMatrixIds: function(matrices){
        var newMatrixIds = [];
        for(var i = 0 ; i<matrices.length;i++){
            var matrix = matrices[i];
            var topLeft = matrix.topLeftCorner;
            var x = topLeft.substring(0, topLeft.indexOf(" "));
            var y = topLeft.substring(topLeft.indexOf(" ") +1);
            var newMatrix = {
               identifier : matrix.identifier,
               scaleDenominator: parseFloat(matrix.scaleDenominator),
               topLeftCorner: new OpenLayers.LonLat(x,y),
               tileWidth: matrix.tileWidth,
               tileHeight: matrix.tileHeight
            };
            newMatrixIds.push(newMatrix);
        }
        return newMatrixIds;
    },
    /**
     * Implementation of setUrl in Layer
     * @see viewer.viewercontroller.controller.Layer#setUrl
     */
    setUrl: function(url){
        this.url=url;
        /*Todo: needs to implement. CHange the url in the framework*/
    },
    /**
     *Gets the layer that are set in this layer
     */
    getLayers: function (){
        return this.frameworkLayer.options.layername;
    },
    /**
     * @see viewer.viewercontroller.controller.Layer.getLegendGraphic
     * @return null because there are no legends for Tiling layers.
     */
    getLegendGraphic: function(){
        return null;
    },
    /**
     * Return the last Map requests as object.
     * @see viewer.viewercontroller.controller.Layer#getLastMapRequest
     * @return a array of objects with
     * .url the url to the image and
     * .extent the extent of the image
     */
    getLastMapRequest: function(){
        var requests=[];
        var grid = this.getFrameworkLayer().grid;
        for (var r=0; r < grid.length; r++){
            for (var c=0; c < grid[r].length; c++){
                var tile = grid[r][c]
                var bounds=tile.bounds;
                var url = tile.url;
                requests.push({
                    extent: this.utils.createExtent(bounds),
                    url: url
                    });
            }
        }
        return requests;
    },
    /******** overwrite functions to make use of the mixin functions **********/
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.openLayersLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    getVisible: function(){
        return this.mixins.openLayersLayer.getVisible.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha){
        if(this.frameworkLayer) {
            this.frameworkLayer.transitionEffect = alpha < 100 ? null : "resize";
        }
        this.mixins.openLayersLayer.setAlpha.call(this,alpha);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#reload
     */
    reload: function (){
        this.mixins.openLayersLayer.reload.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#addListener
     */
    addListener: function (event,handler,scope){
        this.mixins.openLayersLayer.addListener.call(this,event,handler,scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#removeListener
     */
    removeListener: function (event,handler,scope){
        this.mixins.openLayersLayer.removeListener.call(this,event,handler,scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#getType
     */
    getType : function (){
        return this.mixins.openLayersLayer.getType.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#destroy
     */
    destroy: function (){
        this.mixins.openLayersLayer.destroy.call(this);
    }
});
