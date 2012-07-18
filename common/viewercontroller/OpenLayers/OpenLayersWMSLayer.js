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
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.openLayersLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.openLayersLayer.setAlpha.call(this,alpha);
    }
});