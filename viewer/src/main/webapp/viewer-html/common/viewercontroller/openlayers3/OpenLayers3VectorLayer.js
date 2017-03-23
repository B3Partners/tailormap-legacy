/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3VectorLayer",{
    extend: "viewer.viewercontroller.controller.VectorLayer",
    mixins: {
        openLayers3Layer: "viewer.viewercontroller.openlayers3.OpenLayers3Layer"
    },
    draw:null,
    point:null,
    line:null,
    polygon:null,
    circle: null,
    source:null,
    box:null,
    freehand:null,
    drawFeatureControls: null,
    activeDrawFeatureControl: null,
    modifyFeature:null,
    constructor : function (config){
        config.colorPrefix = '#';
        viewer.viewercontroller.openlayers3.OpenLayers3VectorLayer.superclass.constructor.call(this, config);
        this.mixins.openLayers3Layer.constructor.call(this,config);
        this.draw = new ol.interaction.Draw({type:'Point'});
        this.maps = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var index  = this.config.viewerController.mapComponent.getMap().getFrameworkMap().getLayers().getLength() +1;
        this.source = new ol.source.Vector();
        
        this.frameworkLayer = new ol.layer.Vector({
            zIndex:index,
            source: this.source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
            })
        });
        //this.maps.addLayer(this.frameworkLayer);
        this.type=viewer.viewercontroller.controller.Layer.VECTOR_TYPE;
        
    },
    removeAllFeatures : function(){
        this.source.clear();
    },
    removeFeature : function (feature){    
        Ext.Error.raise({msg: "VectorLayer.removeFeature() Not implemented! Must be implemented in sub-class"});    
    },
    getActiveFeature : function(){
        Ext.Error.raise({msg: "VectorLayer.getActiveFeature() Not implemented! Must be implemented in sub-class"});
    },
    getFeature : function(id){
        Ext.Error.raise({msg: "VectorLayer.getFeature() Not implemented! Must be implemented in sub-class"});
    },
    getFeatureById : function (featureId){
        Ext.Error.raise({msg: "VectorLayer.getFeatureById() Not implemented! Must be implemented in sub-class"});
    },
    getAllFeatures : function(){
        Ext.Error.raise({msg: "VectorLayer.getAllFeatures() Not implemented! Must be implemented in sub-class"});
    },
    addFeature : function(feature){
        Ext.Error.raise({msg: "VectorLayer.addFeature() Not implemented! Must be implemented in sub-class"});
    },
    addFeatures : function(features){
        Ext.Error.raise({msg: "VectorLayer.addFeatures() Not implemented! Must be implemented in sub-class"});
    },
    /**
     ** Note: subclasses should call this method to add the keylistener.
     * @param {String} type geometry type to draw
     *
     */
    drawFeature : function(type){
        
        
        this.maps.removeInteraction(this.draw);
        
        this.superclass.drawFeature.call(this, type);
        if (type === "Point") {
            this.addInteraction(type);
        } else if (type === "LineString") {
            this.addInteraction(type);
            console.log('LineString')
        } else if (type === "Polygon") {
            this.addInteraction(type);
            console.log('Polygon')
        } else if (type === "Circle") {
            this.addInteraction(type);
            console.log('Circle')
        } else if (type === "Box") {
            this.addInteraction(type);
            console.log('Box')
        } else if (type === "Freehand") {
            this.addInteraction(type);
            console.log('Freehand')
        } else {
           this.config.viewerController.logger.warning("Feature type >" + type + "< not implemented!");
        }
    },
    
    addInteraction : function(type){
      this.draw = new ol.interaction.Draw({type:type,
      source:this.source});  
      this.maps.addInteraction(this.draw);
      this.draw.on('drawend',function(evt){this.maps.removeInteraction(this.draw)},this);
    },
    
    adjustStyle : function(){
    },
    /**
     * Note: subclasses should call this method to remove the added keylistener.
     */
    stopDrawing: function () {
        // remove the previously added key listener
        var me = this;
        Ext.getDoc().un('keydown', me._keyListener, me);
    },
    
    /** handle CTRL-Z key when drawing. */
    undoSketch: function () {
        Ext.Error.raise({msg: "VectorLayer.undoSketch() Not implemented! Must be implemented in sub-class"});
    },
    /** handle CTRL-Y key when drawing. */
    redoSketch: function () {
        Ext.Error.raise({msg: "VectorLayer.redoSketch() Not implemented! Must be implemented in sub-class"});
    },
    /** handle ESC key when drawing. */
    cancelSketch: function () {
        Ext.Error.raise({msg: "VectorLayer.cancelSketch() Not implemented! Must be implemented in sub-class"});
    }
    
    
    
    
    });
    