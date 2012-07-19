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
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersVectorLayer.superclass.constructor.call(this, config);
        this.frameworkLayer = new OpenLayers.Layer.Vector(config.id, config);
        var me = this;
        this.frameworkLayer.onFeatureInsert = function(){
            me.onFeatureInsert();
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
            var olFeature = feature.toOpenLayersFeature();
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
    onFeatureInsert : function (){
        this.point.deactivate();
        this.line.deactivate();
        this.polygon.deactivate();
    }
});
