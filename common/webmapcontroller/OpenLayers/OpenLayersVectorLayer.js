
/**
 *Vector layer
 */
function OpenLayersVectorLayer(olLayerObject,id){
    if (!olLayerObject instanceof OpenLayers.Layer.Vector){
        throw("The given layer object is not of type 'OpenLayers.Layer.Vector'. But: "+olLayerObject);
    }
    OpenLayersLayer.call(this,olLayerObject,id);
}

OpenLayersVectorLayer.prototype = new OpenLayersLayer();
OpenLayersVectorLayer.prototype.constructor= OpenLayersVectorLayer;

OpenLayersVectorLayer.prototype.removeAllFeatures = function(){
    this.getFrameworkLayer().removeAllFeatures();
}

OpenLayersVectorLayer.prototype.getActiveFeature = function(){
    var index = this.getFrameworkLayer().features.length - 1;
    var olFeature = this.getFrameworkLayer().features[index];
    var featureObj = new Feature();
    var feature = featureObj.fromOpenLayersFeature(olFeature);

    return feature;
}

OpenLayersVectorLayer.prototype.getFeature = function(id){
    return this.getFrameworkLayer().features[id];
}

OpenLayersVectorLayer.prototype.getAllFeatures = function(){
    var olFeatures = this.getFrameworkLayer().features;
    var features = new Array();
    var featureObj = new Feature();
    for(var i = 0 ; i < olFeatures.length;i++){
        var olFeature = olFeatures[i];
        var feature = featureObj.fromOpenLayersFeature(olFeature);

        features.push(feature);
    }
    return features;
}

OpenLayersVectorLayer.prototype.addFeature = function(feature){
    var features = new Array();
    features.push(feature);
    this.addFeatures(features);
}


OpenLayersVectorLayer.prototype.addFeatures = function(features){
    var olFeatures = new Array();
    for(var i = 0 ; i < features.length ; i++){
        var feature = features[i];
        var olFeature = feature.toOpenLayersFeature();
        olFeatures.push(olFeature);
    }
    return this.getFrameworkLayer().addFeatures(olFeatures);
}

OpenLayersVectorLayer.prototype.drawFeature = function(type){
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