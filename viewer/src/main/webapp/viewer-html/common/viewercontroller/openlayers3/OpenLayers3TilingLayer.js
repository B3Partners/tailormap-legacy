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
        
        if(!Ext.Array.contains(["TMS", "ArcGisRest","WMTS"], this.getProtocol())) {
            throw new Error("OpenLayersTilingLayer currently does not support tiling protocol " + this.getProtocol());
        }
        
         this.mixins.openLayers3Layer.constructor.call(this,config);
         
        this.type=viewer.viewercontroller.controller.Layer.TILING_TYPE;
        this.utils = Ext.create("viewer.viewercontroller.openlayers3.Utils");
         
         var opacity = this.config.opacity != undefined ? this.config.opacity : 1;
         //var serviceEnvelopeTokens=this.serviceEnvelope.split(",");
         var options={
            //tileOrigin: new OpenLayers.LonLat(x,y),
            serverResolutions: this.resolutions,
            //tileSize: new OpenLayers.Size(this.getTileWidth(),this.getTileHeight()),
            type: this.extension,
            transitionEffect: opacity == 1 ? "resize" : null,
            //maxExtent: [Number(serviceEnvelopeTokens[0]),Number(serviceEnvelopeTokens[1]),Number(serviceEnvelopeTokens[2]),Number(serviceEnvelopeTokens[3])],
            //maxResolution: this.resolutions[0],
            visibility: this.visible==undefined ? true : this.visible,
            opacity: this.config.opacity != undefined ? this.config.opacity : 1,
            attribution: this.config.attribution
        };
        if(this.getTileWidth() && this.getTileHeight()){
            options.tileSize = [this.getTileWidth(),this.getTileHeight()];
        }
        if(this.serviceEnvelope){
            var serviceEnvelopeTokens=this.serviceEnvelope.split(",");
            var x=Number(serviceEnvelopeTokens[0]);
            var y=Number(serviceEnvelopeTokens[1]);
            //if arcgisrest/wmts the origin y is top left. (maxy)
            if (this.getProtocol()==="ArcGisRest" || this.getProtocol() === "WMTS"){
                y=Number(serviceEnvelopeTokens[3]);
            }
            options.maxExtent = [Number(serviceEnvelopeTokens[0]),Number(serviceEnvelopeTokens[1]),Number(serviceEnvelopeTokens[2]),Number(serviceEnvelopeTokens[3])];
            
            var projExt = config.viewerController.mapComponent.mapOptions.projection.getExtent();
            options.tileOrigin = ol.extent.getTopLeft(projExt);
            
        }
        if(this.resolutions){
            options.maxResolution = this.resolutions[0];
        }
        if (this.getProtocol()=="TMS"){
            console.log('hallo');
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
            console.log(options); 
            var openbasiskaartSource = new ol.source.XYZ({
            crossOrigin: null,
            attributions: options.attribution,
            maxZoom:15,
            minZoom:1,
            projection: "EPSG:28992",
            url: t+'/{z}/{x}/{-y}.png'
        });
        this.frameworkLayer = new ol.layer.Tile({
            source: openbasiskaartSource,
            opacity: options.opacity,
            extent: options.maxExtent,
            //maxResolution: options.maxResolution,
            visible: options.visibility
            
            
        },options); 
        }else if (this.getProtocol()==="WMTS"){
            var convertRatio = 1/0.00028;
            options.url = this.url;
            options.style = this.config.style;
            options.layer = this.config.name;
            options.matrixSet = this.config.matrixSet.identifier;
            options.matrixIds = this.getMatrixIdsm(config.viewerController.mapComponent.mapOptions.resolutions);
            options.format = this.extension;
            options.maxResolution = this.config.matrixSet.matrices[0].scaleDenominator /convertRatio;
            options.minResolution = this.config.matrixSet.matrices[this.config.matrixSet.matrices.length -1].scaleDenominator /convertRatio;
            //var wmts = new OpenLayers.Layer.WMTS(options);
            var grid = new ol.tilegrid.WMTS({
                extent: options.maxExtent,
                origin: options.tileOrigin,
                resolutions: config.viewerController.mapComponent.mapOptions.resolutions,
                matrixIds: options.matrixIds            
            });
            var source = new ol.source.WMTS({
                tileGrid: grid,
                projection: config.viewerController.mapComponent.mapOptions.projection,
                layer: options.layer,
                style: options.style,
                format:options.format,
                matrixSet: options.matrixSet,
                url: options.url
            });
            this.frameworkLayer = new ol.layer.Tile({
            source: source,
            opacity: options.opacity,
            extent: options.maxExtent,
            //maxResolution: options.maxResolution,
            visible: options.visibility
            
        });   

        }
    },
    
    setVisible: function(vis){
        this.mixins.openLayers3Layer.setVisible.call(this,vis);
    },
    
    getVisible: function(){
        return this.mixins.openLayers3Layer.getVisible.call(this);
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
               topLeftCorner: [x,y],
               tileWidth: matrix.tileWidth,
               tileHeight: matrix.tileHeight
            };
            newMatrixIds.push(newMatrix);
        }
        return newMatrixIds;
    },
    
    getMatrixIdsm: function(matrices){
        var matrixIds =[];
        for (var z = 0; z < matrices.length; ++z) {		
            matrixIds[z] = 'EPSG:28992:' + z;
        }
        return matrixIds;
    },
    addListener: function (event,handler,scope){
        this.mixins.openLayers3Layer.addListener.call(this,event,handler,scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#removeListener
     */
    removeListener: function (event,handler,scope){
        this.mixins.openLayers3Layer.removeListener.call(this,event,handler,scope);
    },
    
    getType : function (){
        return this.mixins.openLayers3Layer.getType.call(this);
    },
    
    getLastMapRequest : function(){
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var r = this.getFrameworkLayer().getSource().getTileUrlFunction();
        var mapcenter =map.getView().getCenter();
        var crd = this.getFrameworkLayer().getSource().getTileGrid().getTileCoordForCoordAndResolution(mapcenter,map.getView().getResolution());
        var request=[{
            extent: this.getFrameworkLayer().getSource().getTileGrid().getTileCoordExtent(crd),
            url: r(crd,1, map.getView().getProjection())
        }];
        return request;

    },
    setAlpha: function (alpha){
        if(this.frameworkLayer) {
            this.frameworkLayer.transitionEffect = alpha < 100 ? null : "resize";
        }
        this.mixins.openLayers3Layer.setAlpha.call(this,alpha);
    },
    getLayers: function (){
        return this.frameworkLayer.options.layername;
    }
    
});
        