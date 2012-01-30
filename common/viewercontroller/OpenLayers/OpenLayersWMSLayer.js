/**
 * @class 
 * @constructor
 * @description
 */
function OpenLayersWMSLayer(olLayerObject,id){
    if (!olLayerObject instanceof OpenLayers.Layer.WMS){
        throw("The given layer object is not of type 'OpenLayers.Layer.WMS'. But: "+olLayerObject);
    }
    OpenLayersLayer.call(this,olLayerObject,id);
    this.getFeatureInfoControl=null;
    this.mapTipControl=null;
}
OpenLayersWMSLayer.prototype = new OpenLayersLayer();
OpenLayersWMSLayer.prototype.constructor= OpenLayersWMSLayer;

/**
 *Gets the last wms request-url of this layer
 *@returns the WMS getMap Reqeust.
 */
OpenLayersWMSLayer.prototype.getURL = function(){
    return this.getFrameworkLayer().getURL(this.getFrameworkLayer().map.getExtent());
}
/**
 *Set a OGC-WMS param and refresh the layer
 */
OpenLayersWMSLayer.prototype.setOGCParams= function(newParams){
    this.getFrameworkLayer().mergeNewParams(newParams);
}
/**
 *Get Feature
 */
OpenLayersWMSLayer.prototype.setGetFeatureInfoControl = function(controller){
    this.getFeatureInfoControl=controller;
}
OpenLayersWMSLayer.prototype.getGetFeatureInfoControl = function(){
    return this.getFeatureInfoControl;
}
/**
 *Maptip:
 */
OpenLayersWMSLayer.prototype.setMapTipControl = function(controller){
    this.mapTipControl=controller;
}
OpenLayersWMSLayer.prototype.getMapTipControl = function(){
    return this.mapTipControl;
}
