/**
 * @class 
 * @constructor
 * @description A drawable vector layer
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersVectorLayer",{
    extend: "viewer.viewercontroller.controller.VectorLayer",
    point:null,
    line:null,
    polygon:null,
    drawFeatureControls:null,
    modifyFeature:null,
    enabledEvents: new Object(),
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){
        // TODO make styles work in openlayersvectorlayers
        delete config.style;
        viewer.viewercontroller.openlayers.OpenLayersVectorLayer.superclass.constructor.call(this, config);
        this.frameworkLayer = new OpenLayers.Layer.Vector(config.id, config);
        
        // Make all drawFeature controls: the controls to draw features on the vectorlayer
        //TODO: Make a circlecontrol
        this.point =  new OpenLayers.Control.DrawFeature(this.frameworkLayer, OpenLayers.Handler.Point, {
            displayClass: 'olControlDrawFeaturePoint'
        });
        this.line = new OpenLayers.Control.DrawFeature(this.frameworkLayer, OpenLayers.Handler.Path, {
            displayClass: 'olControlDrawFeaturePath'
        });
        this.polygon =  new OpenLayers.Control.DrawFeature(this.frameworkLayer, OpenLayers.Handler.Polygon, {
            displayClass: 'olControlDrawFeaturePolygon'
        });
        this.drawFeatureControls = new Array();
        this.drawFeatureControls.push(this.polygon);
        this.drawFeatureControls.push(this.line);
        this.drawFeatureControls.push(this.point);
        
        // The modifyfeature control allows us to edit and select features.
        this.modifyFeature = new OpenLayers.Control.ModifyFeature(this.frameworkLayer);
        
        var map = this.viewerController.mapComponent.getMap().getFrameworkMap();
        map.addControl(this.point);
        map.addControl(this.line);
        map.addControl(this.polygon);
        map.addControl(this.modifyFeature);
        
        this.modifyFeature.selectControl.events.register("featurehighlighted", this, this.activeFeatureChanged);
        this.frameworkLayer.events.register("afterfeaturemodified", this, this.featureModified);
        this.frameworkLayer.events.register("featuremodified", this, this.featureModified);
        this.frameworkLayer.events.register("featureadded", this, this.featureAdded);
        
        this.modifyFeature.activate();
    },
    
    adjustStyle : function(){
        this.viewerController.logger.error("OpenLayersVectorLayer.adjustStyle() not yet implemented!");
    },
    
    removeAllFeatures : function(){
        this.getFrameworkLayer().removeAllFeatures();
    },

    getActiveFeature : function(){
        var index = this.getFrameworkLayer().features.length - 1;
        var olFeature = this.getFrameworkLayer().features[index];
        var featureObj = new Feature();
        var feature = featureObj.fromOpenLayersFeature(olFeature);

        return feature;
    },

    getFeature : function(id){
        return this.getFrameworkLayer().features[id];
    },

    getAllFeatures : function(){
        var olFeatures = this.getFrameworkLayer().features;
        var features = new Array();
        var featureObj = new viewer.viewercontroller.controller.Feature();
        for(var i = 0 ; i < olFeatures.length;i++){
            var olFeature = olFeatures[i];
            var feature = featureObj.fromOpenLayersFeature(olFeature);

            features.push(feature);
        }
        return features;
    },

    addFeature : function(feature){
        var features = new Array();
        features.push(feature);
        this.addFeatures(features);
    },

    addFeatures : function(features){
        var olFeatures = new Array();
        for(var i = 0 ; i < features.length ; i++){
            var feature = features[i];
            var olFeature = this.toOpenLayersFeature(feature);
            olFeatures.push(olFeature);
        }
        return this.getFrameworkLayer().addFeatures(olFeatures);
    },

    drawFeature : function(type){
        if(type == "Point"){
            this.point.activate();
        }else if(type == "LineString"){
            this.line.activate();
        }else if(type == "Polygon"){
            this.polygon.activate();
        }else{
            throw ("Feature type >" + type + "< not implemented!");
        }
    },
    
    /**
     * Called when a feature is selected
     */
    activeFeatureChanged : function (object){
        var feature = this.fromOpenLayersFeature (object.feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,feature);
    },
    
    /**
     * Called when a feature is modified.
     */
    featureModified : function (evt){
        var featureObject = this.fromOpenLayersFeature(evt.feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this,featureObject);
    },
    
    /**
     * Called when a feature is added to the vectorlayer. It deactivates all drawFeature controls, makes the added feature editable and fires @see viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED
     */
    featureAdded : function (object){
        var feature = this.fromOpenLayersFeature (object.feature);
        for ( var i = 0 ; i < this.drawFeatureControls.length ; i++ ){
            var control = this.drawFeatureControls[i];
            control.deactivate();
        }
        this.editFeature(object.feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this,feature);
    },
    
    /**
     * Puts an openlayersfeature in editmode and fires an event: viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED
     * TODO: fix the selecting of a newly added point (after adding another geometry first)
     */
    editFeature : function (feature){
        this.modifyFeature.selectControl.unselectAll();
        this.modifyFeature.selectControl.select(feature);
        var featureObject = this.fromOpenLayersFeature (feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,featureObject);
    },
    
    /**
     * Converts this feature to a OpenLayersFeature
     * @return The OpenLayerstype feature
     */
    toOpenLayersFeature : function(feature){
        var geom = OpenLayers.Geometry.fromWKT(feature.wktgeom);
        var olFeature = new OpenLayers.Feature.Vector(geom);
        return olFeature;
    },

    /**
     * Helper function: Converts the given OpenLayers Feature to the generic feature.
     * @param openLayersFeature The OpenLayersFeature to be converted
     * @return The generic feature
     */
    fromOpenLayersFeature : function(openLayersFeature){
        var feature = new viewer.viewercontroller.controller.Feature({id:openLayersFeature.id,wktgeom: openLayersFeature.geometry.toString()});
        return feature;
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
