/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global ol */

Ext.define ("viewer.viewercontroller.openlayers3.OpenLayersMap3",{
    extend: "viewer.viewercontroller.controller.Map",
    layersLoading : null,
    utils:null,
    markerIcons:null,
    /**
     * @constructor
     * @see viewer.viewercontroller.controller.Map#constructor
     */  
    constructor: function(config){
        viewer.viewercontroller.openlayers3.OpenLayersMap3.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.utils = Ext.create("viewer.viewercontroller.openlayers3.Utils");
        var maxBounds=null;
        
        if (config.options.maxExtent){
            maxBounds = this.utils.createBounds(config.options.maxExtent);
        }
        var startBounds;
        if (config.options.startExtent){
            startBounds= this.utils.createBounds(config.options.startExtent);
        }       
        //set the Center point
        if (startBounds){
            config.center = [(startBounds[0]+startBounds[2])/2, (startBounds[1]+startBounds[3])/2];
        }else if (maxBounds){
            config.center = [(maxBounds[0]+maxBounds[2])/2, (maxBounds[1]+maxBounds[3])/2];
        }else{
            this.config.viewerController.logger.error("No bounds found, can't center viewport");
        }
 
        config.restrictedExtent = maxBounds;
        this.frameworkMap = new ol.Map({
        target: config.domId,
        view: new ol.View({
            projection: config.projection,
            center: config.center,
            minZoom: 5,
            maxZoom: 12,
            resolution: config.resolution,
            minResolution:0.105,
            maxResolution:3440.64,
            resolutions: config.resolutions,
            extent: config.restrictedExtent
        })
    });
    
    console.log(this.frameworkMap);
     },
     
     addLayer : function(layer){        
        this.superclass.addLayer.call(this,layer);   
        //delete layer.getFrameworkLayer().id;
        var map = this.getFrameworkMap()
        var l = layer.getFrameworkLayer();
        try{
            map.addLayer(l);
        }catch(exception){
            this.config.viewerController.logger.error(exception);
        }
    },
    
    setLayerVisible : function(layer, visible){
        this.superclass.setLayerVisible.call(this,layer,visible);
        layer.setVisible(visible);
    },
     
     updateSize : function(){
         this.getFrameworkMap().updateSize();
     },
     
     getResolution : function(){
         
         return this.getFrameworkMap().getView().getResolution();
     },
     
     getScale : function(){
        return this.getFrameworkMap().getView().getResolution();
    }
    
    });
