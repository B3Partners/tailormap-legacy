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
    /**
     *Constructor
     */
    constructor : function (config){        
        viewer.viewercontroller.openlayers.OpenLayersTilingLayer.superclass.constructor.call(this, config);        
        this.type=viewer.viewercontroller.controller.Layer.TILING_TYPE;
        
        var serviceEnvelopeTokens=this.serviceEnvelope.split(",");
        var x=Number(serviceEnvelopeTokens[0]);
        var y=Number(serviceEnvelopeTokens[1]);
        var options={
            tileOrigin: new OpenLayers.LonLat(x,y),
            serverResolutions: this.resolutions,
            tileSize: new OpenLayers.Size(this.getTileWidth(),this.getTileHeight()),
            type: this.extension,
            transitionEffect: "resize",
            maxExtent: new OpenLayers.Bounds(Number(serviceEnvelopeTokens[0]),Number(serviceEnvelopeTokens[1]),Number(serviceEnvelopeTokens[2]),Number(serviceEnvelopeTokens[3])),
            maxResolution: this.resolutions[0]
        }
        if (this.getProtocol()=="TMS"){
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
            options.layername= layerName,
            
            this.frameworkLayer = new OpenLayers.Layer.TMS(layerName,this.url,options);
        }else if(this.getProtocol()=="ArcGisRest"){  
            var tokens=this.serviceEnvelope.split(",");
            options.tileOrigin= new OpenLayers.LonLat(Number(tokens[0]),Number(tokens[3]));
            //options.projection="EPSG:28992";
            //options.tileOrigin= new OpenLayers.LonLat(y,x);
            this.frameworkLayer = new OpenLayers.Layer.ArcGISCache(this.name,this.url,options);
        }else{
            this.viewerController.logger.error("Tiling protocol "+this.getProtocol()+" not supported bij OpenLayers Tiling layer.");
        }
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
    
    /******** overwrite functions to make use of the mixin functions **********/    
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.openLayersLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.openLayersLayer.setAlpha.call(this,alpha);
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
    }
});