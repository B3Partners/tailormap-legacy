/**
 * @class 
 * @constructor
 * @param id The id of the Feature
 * @param wkt The wkt describing the Feature
 * @description
 * The generic class for defining a feature. A feature consists of a id and a wkt. Convenience methods for converting from and to viewerspecific features.
*/
function Feature(id,wkt){
    this.id = id;
    this.wkt = wkt;
    this.wktParser = new OpenLayers.Format.WKT();
}

Feature.prototype.getId = function(){
    return this.id;
}

Feature.prototype.getWkt = function(){
    return this.wkt;
}

/**
* Converts this feature to a OpenLayersFeature
* @return The OpenLayerstype feature
*/
Feature.prototype.toOpenLayersFeature = function(){
    var olFeature = this.wktParser.read(this.getWkt());
    return olFeature;
}

/**
* Helper function: Converts the given OpenLayers Feature to the generic feature.
* @param openLayersFeature The OpenLayersFeature to be converted
* @return The generic feature
*/
Feature.prototype.fromOpenLayersFeature = function(openLayersFeature){
    var feature = new Feature(openLayersFeature.id,openLayersFeature.geometry.toString());
    return feature;
}

/**
* Converts this feature to a FlamingoFeature
* @return The Flamingotype feature
*/
Feature.prototype.toFlamingoFeature = function(){
    var flFeature = new Object();
    flFeature["id"] = this.getId();
    flFeature["wktgeom"] = this.getWkt();
    return flFeature;
}

/**
* Helper function: Converts the given Flamingo Feature to the generic feature.
* @param FlamingoFeature The FlamingoFeature to be converted
* @return The generic feature
*/
Feature.prototype.fromFlamingoFeature = function(flamingoFeature){
    var feature = new Feature(flamingoFeature["id"],flamingoFeature["wktgeom"]);
    return feature;
}

