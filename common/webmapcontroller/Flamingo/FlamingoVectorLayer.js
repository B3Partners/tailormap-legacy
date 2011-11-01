/**
 * @class 
 * @constructor
 * @description The FlamingoVectorLayer class. In flamingo also known as EditMap. 
 **/
function FlamingoVectorLayer(id,flamingoObject){
    FlamingoLayer.call(this,id,null,flamingoObject);
    this.layerName = "layer1";
}
FlamingoVectorLayer.prototype = new FlamingoLayer();
FlamingoVectorLayer.prototype.constructor= FlamingoVectorLayer;

FlamingoVectorLayer.prototype.toXML = function(){
    return "";
}

FlamingoVectorLayer.prototype.getLayerName = function(){
    return this.layerName;
}

/**
* Removes all the features from this vectorlayer
*/
FlamingoVectorLayer.prototype.removeAllFeatures = function(){
    var flamingoObj = this.getFrameworkLayer();
    flamingoObj.callMethod(this.getId(),'removeAllFeatures');
}


/**
* Gets the active feature from this vector layer
* @return The active - generic type - feature from this vector layer.
*/
FlamingoVectorLayer.prototype.getActiveFeature = function(){
    var flamingoObj = this.getFrameworkLayer();
    var flaFeature = flamingoObj.callMethod(this.id,'getActiveFeature');

    /* als er geen tekenobject op scherm staat is flaFeature null */
    if(flaFeature == null){
        return null;
    }

    var featureObj = new Feature();
    var feature = featureObj.fromFlamingoFeature(flaFeature);

    return feature;
}

/**
* Get the feature on the given index
* @param index The index of the feature.
* @return The generic feature type on index
*/
FlamingoVectorLayer.prototype.getFeature = function(index){
    return this.getAllFeatures()[index];
}

/**
* Add a feature to this vector layer.
* @param feature The generic feature to be added to this vector layer.
*/
FlamingoVectorLayer.prototype.addFeature = function(feature){
    var flamingoObj = this.getFrameworkLayer();
    flamingoObj.callMethod(this.getId(),'addFeature',this.getLayerName(),feature.toFlamingoFeature());
}

/**
* Gets all features on this vector layer
* @return Array of generic features.
*/
FlamingoVectorLayer.prototype.getAllFeatures = function(){
    var flamingoObj = this.getFrameworkLayer();
    var flamingoFeatures = flamingoObj.callMethod(this.getId(),"getAllFeaturesAsObject");
    var features = new Array();
    var featureObj = new Feature();
    for(var i = 0 ; i< flamingoFeatures.length ; i++){
        var flFeature = flamingoFeatures[i];
        var feature = featureObj.fromFlamingoFeature(flFeature);
        features.push(feature);
    }
    return features;
}

FlamingoVectorLayer.prototype.drawFeature = function(type){
    this.getFrameworkLayer().callMethod(this.getId(),"editMapDrawNewGeometry",this.getLayerName(),type );
}

/* stop editing */
FlamingoVectorLayer.prototype.stopDrawDrawFeature = function(){
    this.getFrameworkLayer().callMethod(this.getId(),"removeEditMapCreateGeometry",this.getLayerName());
}
    