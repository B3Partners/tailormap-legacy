/**
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersWMSLayer",{
    extend: "viewer.viewercontroller.controller.WMSLayer",    
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){        
        viewer.viewercontroller.openlayers.OpenLayersWMSLayer.superclass.constructor.call(this,config);
        this.frameworkLayer = new OpenLayers.Layer.WMS(this.name,this.url,this.config.ogcParams,config);
                
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
     * Implementation of setUrl in Layer
     * @see viewer.viewercontroller.controller.Layer#setUrl
     */
    setUrl: function(url){
        this.url=url;
        /*Todo: needs to implement. CHange the url in the framework*/
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