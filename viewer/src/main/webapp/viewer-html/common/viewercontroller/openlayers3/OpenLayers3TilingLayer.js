/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol */

Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3TilingLayer",{
    extend: "viewer.viewercontroller.controller.TilingLayer",
    mixins: {
        openLayers3Layer: "viewer.viewercontroller.openlayers3.OpenLayers3Layer"
    },
    constructor : function(config){
        viewer.viewercontroller.openlayers3.OpenLayers3TilingLayer.superclass.constructor.call(this, config);
        
        if(!Ext.Array.contains(["TMS", "ArcGisRest"], this.getProtocol())) {
            throw new Error("OpenLayersTilingLayer currently does not support tiling protocol " + this.getProtocol());
        }
        
         this.mixins.openLayers3Layer.constructor.call(this,config);
         var opacity = this.config.opacity != undefined ? this.config.opacity : 1;
         var serviceEnvelopeTokens=this.serviceEnvelope.split(",");
         var options={
            //tileOrigin: new OpenLayers.LonLat(x,y),
            serverResolutions: this.resolutions,
            //tileSize: new OpenLayers.Size(this.getTileWidth(),this.getTileHeight()),
            type: this.extension,
            transitionEffect: opacity == 1 ? "resize" : null,
            maxExtent: [Number(serviceEnvelopeTokens[0]),Number(serviceEnvelopeTokens[1]),Number(serviceEnvelopeTokens[2]),Number(serviceEnvelopeTokens[3])],
            maxResolution: this.resolutions[0],
            visibility: this.visible==undefined ? true : this.visible,
            opacity: this.config.opacity != undefined ? this.config.opacity : 1,
            attribution: this.config.attribution
        };
         if (this.getProtocol()=="TMS"){
            var t= this.url;
            
            //fix the url: example: "http://tilecache.kaartenbalie.nl/tilecache.cgi/1.0.0/osm/"
            
            var version=null;
            var layerName=null;
            if (this.url.lastIndexOf("/")==this.url.length-1){
                this.url=this.url.substring(0,this.url.length-1);
            }
            var urlTokens=this.url.split("/");
            layerName=urlTokens[urlTokens.length-1];
            version= urlTokens[urlTokens.length-2];
            urlTokens.splice(urlTokens.length-2,2);
            this.url=urlTokens.join("/")+"/";
            
            //set TMS tiling options.
            options.serviceVersion= version;
            options.layername= layerName;
            var openbasiskaartSource = new ol.source.XYZ({
            crossOrigin: 'anonymous',
            attributions: options.attribution,
            projection: config.viewerController.mapComponent.mapOptions.projection,
            url: t+'/{z}/{x}/{-y}.png'
        });
        this.frameworkLayer = new ol.layer.Tile({
            source: openbasiskaartSource,
            opacity: options.opacity,
            extent: options.maxExtent,
            maxResolution: options.maxResolution,
            visible: options.visibility
        }); 
        }
    },
    
    setVisible: function(vis){
        this.mixins.openLayers3Layer.setVisible.call(this,vis);
    }
    
});