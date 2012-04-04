/**
 * @class 
 * @constructor
 * @description A drawable vector layer
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersVectorLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersLayer",
    constructor : function (frameworkLayer,id){
        viewer.viewercontroller.openlayers.OpenLayersVectorLayer.superclass.constructor.call(this, {});
        this.frameworkLayer = frameworkLayer;
        this.id = id;
        //this.initConfig(config);
        if (!this.frameworkLayer instanceof OpenLayers.Layer.Vector){
            Ext.Error.raise({msg: "The given layer object is not of type 'OpenLayers.Layer.Vector'. But: "+this.frameworkLayer});
        }
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
        var featureObj = new Feature();
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
            webMapController.pointButton.getFrameworkTool().activate();
        }else if(type == "LineString"){
            webMapController.lineButton.getFrameworkTool().activate();
        }else if(type == "Polygon"){
            webMapController.polygonButton.getFrameworkTool().activate();
        }else{
            throw ("Feature type >" + type + "< not implemented!");
        }
    }
});
