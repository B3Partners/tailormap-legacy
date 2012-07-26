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
    circle:null,
    modifyFeature:null,
    enabledEvents: new Object(),
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){
        delete config.style;
        viewer.viewercontroller.openlayers.OpenLayersVectorLayer.superclass.constructor.call(this, config);
        this.frameworkLayer = new OpenLayers.Layer.Vector(config.id, config);
        var me = this;
        this.frameworkLayer.events.register("afterfeaturemodified", this, this.featureModified);
        this.frameworkLayer.events.register("sketchstarted", this, this.featureModified);
        this.frameworkLayer.events.register("featureadded", this, function (args){
            me.onFeatureInsert(args.feature);
            return true;
        });
        
        this.frameworkLayer.onFeatureInsert = function(feature){
            me.onFeatureInsert(feature);
        };
        this.point =  new OpenLayers.Control.DrawFeature(this.frameworkLayer, OpenLayers.Handler.Point, {
            displayClass: 'olControlDrawFeaturePoint',
            handlerOptions: {
                citeCompliant: false
            }
        });
        this.line = new OpenLayers.Control.DrawFeature(this.frameworkLayer, OpenLayers.Handler.Path, {
            displayClass: 'olControlDrawFeaturePath',
            handlerOptions: {
                citeCompliant: false
            }
        });
        this.polygon =  new OpenLayers.Control.DrawFeature(this.frameworkLayer, OpenLayers.Handler.Polygon, {
            displayClass: 'olControlDrawFeaturePolygon',
            handlerOptions: {
                citeCompliant: false
            }
        });
        
        var map = this.viewerController.mapComponent.getMap().getFrameworkMap();
        map.addControl(this.point);
        map.addControl(this.line);
        map.addControl(this.polygon);
        
        this.modifyFeature = new OpenLayers.Control.ModifyFeature(this.frameworkLayer);
        map.addControl(this.modifyFeature);
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
    
    activeFeatureChanged : function (feature){
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,feature);
    },
    
    featureModified : function (evt){
        var featureObject = this.fromOpenLayersFeature(evt.feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,featureObject);
    },
    
    onFeatureInsert : function (feature){
        this.point.deactivate();
        this.line.deactivate();
        this.polygon.deactivate();
        this.editFeature(feature);
        var featureObject = this.fromOpenLayersFeature(feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this,featureObject);
    },
    
    editFeature : function (feature){
        this.modifyFeature.selectControl.unselectAll();
        this.modifyFeature.selectControl.select(feature);
    },
    
    /**
     * Converts this feature to a OpenLayersFeature
     * @return The OpenLayerstype feature
     */
    toOpenLayersFeature : function(feature){
       // throw ("Not yet implemented");
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
    
    addListener : function (event, handler, scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
         if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            this.registerToLayer(olSpecificEvent);
            viewer.viewercontroller.openlayers.OpenLayersVectorLayer.superclass.addListener.call(this,event,handler,scope);
         }else{
            this.viewerController.logger.warning("Event not listed in OpenLayersVectorLayer >"+ event + "<. The application  might not work correctly.");
        }
    },
    
    registerToLayer : function (specificEvent){
          if(this.enabledEvents[specificEvent] == null ||this.enabledEvents[specificEvent] == undefined){
            this.enabledEvents[specificEvent] = true;
            
            this.frameworkLayer.events.register(specificEvent, this, this.handleEvent);
        }
    },
    
    handleEvent : function (event){
        var options = new Object();
        options.layer = this.map.getLayerByOpenLayersId(event.element.id);
        options.feature = this.fromOpenLayersFeature(event.feature);
        var eventName = this.viewerController.mapComponent.getGenericEventName(event.type);
        this.fireEvent(eventName,options);
    }
});
