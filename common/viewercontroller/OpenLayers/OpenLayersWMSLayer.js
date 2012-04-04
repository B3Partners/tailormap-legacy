/**
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersWMSLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersLayer",
    constructor : function (frameworkLayer){
        viewer.viewercontroller.openlayers.OpenLayersWMSLayer.superclass.constructor.call(this,{});
        // TODO: see if this can be prettier: when giving an OpenLayers object to initConfig, it will be cloned, which results in a stackoverflow
        this.frameworkLayer = frameworkLayer;
//    / /   this.initConfig(config);        
         if (!this.frameworkLayer instanceof OpenLayers.Layer.WMS){
                Ext.Error.raise({msg: "The given layer object is not of type 'OpenLayers.Layer.WMS'. But: "+this.frameworkLayer});
            }
            this.getFeatureInfoControl=null;
            this.mapTipControl=null;
    },

    /**
    *Gets the last wms request-url of this layer
    *@returns the WMS getMap Reqeust.
    */
    getURL : function(){
        return this.getFrameworkLayer().getURL(this.getFrameworkLayer().map.getExtent());
    },
    /**
    *Set a OGC-WMS param and refresh the layer
    */
    setOGCParams: function(newParams){
        this.getFrameworkLayer().mergeNewParams(newParams);
    },
    /**
    *Get Feature
    */
    setGetFeatureInfoControl : function(controller){
        this.getFeatureInfoControl=controller;
    },
    
    getGetFeatureInfoControl : function(){
        return this.getFeatureInfoControl;
    },
    /**
    *Maptip:
    */
    setMapTipControl : function(controller){
        this.mapTipControl=controller;
    },
    
    getMapTipControl : function(){
        return this.mapTipControl;
    }
});