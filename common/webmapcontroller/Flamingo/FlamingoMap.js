/** 
 * Flamingomap 
 * @class 
 * @constructor
 * @description
 * 
 */
function FlamingoMap(id,flamingoObject){
    if (id==undefined || flamingoObject==undefined)
        throw("FlamingoMap.constructor: Id or Flamingo object is undefined");
    this.id=id;
    this.addEvents(Event.ON_ALL_LAYERS_LOADING_COMPLETE,Event.ON_CHANGE_EXTENT,Event.ON_GET_FEATURE_INFO,Event.ON_GET_FEATURE_INFO_DATA,Event.ON_FINISHED_CHANGE_EXTENT);
    Map.call(this,flamingoObject);
}
//set inheritance
FlamingoMap.prototype = new Map();
FlamingoMap.prototype.constructor=FlamingoMap;

FlamingoMap.prototype.registerEvent = function (event,handler){
    this.addListener(event,handler);
}

FlamingoMap.prototype.fire = function (event,options){
    this.fireEvent (event,this,options);
}

/**
*See @link Map.getId
*/
FlamingoMap.prototype.getId = function(){
    return this.id;
}

/**
 *See @link Map.getAllWMSLayers
 */
FlamingoMap.prototype.getAllWMSLayers = function(){
    var lagen = new Array();
    for(var i = 0 ; i < this.layers.length;i++){
        if(this.layers[i] instanceof FlamingoWMSLayer){
            lagen.push(this.layers[i]);
        }
    }
    return lagen;
}
/**
 *See @link Map.getAllVectorLayers
 */
FlamingoMap.prototype.getAllVectorLayers = function(){
    var lagen = new Array();
    for(var i = 0 ; i < this.layers.length;i++){
        if(this.layers[i] instanceof FlamingoVectorLayer){
            lagen.push(this.layers[i]);
        }
    }
    return lagen;
}
/**
*see @link Map.remove
*/
FlamingoMap.prototype.remove = function(){
    this.getFrameworkMap().callMethod("flamingo","killComponent",this.getId());
}

/**
*Add a layer(service) to the map
*@param layer a FlamingoLayer that needs to be added.
*see @link Map.addLayer
**/
FlamingoMap.prototype.addLayer = function(layer){
    if (!(layer instanceof FlamingoLayer))
        throw("FlamingoMap.addLayer(): Given layer not of type FlamingoLayer");
    //call super function
    Map.prototype.addLayer.call(this,layer);
    if (!(layer instanceof FlamingoVectorLayer)){
        this.getFrameworkMap().callMethod(this.getId(),'addLayer',layer.toXML());
    }
}
    
/**
*remove the specific layer. See @link Map.removeLayer
**/
FlamingoMap.prototype.removeLayer=function(layer){
    if (!(layer instanceof FlamingoLayer))
        throw("FlamingoMap.removeLayer(): Given layer not of type FlamingoLayer");
    //call super function
    Map.prototype.removeLayer.call(this,layer);
    if (!(layer instanceof FlamingoVectorLayer)){
        this.getFrameworkMap().callMethod(this.getId(),'removeLayer',this.getId()+'_'+layer.getId());
    }
}

/**
*see @link Map.setLayerIndex
*/
FlamingoMap.prototype.setLayerIndex = function (layer, newIndex){
    if (!(layer instanceof FlamingoLayer)){
        throw("FlamingoMap.setLayerIndex(): Given layer not of type FlamingoLayer.");
    }

    if (!(layer instanceof FlamingoVectorLayer)){
        this.getFrameworkMap().callMethod(this.getId(),"swapLayer",this.getId()+'_'+layer.getId(),newIndex);
    }
    return Map.prototype.setLayerIndex(layer,newIndex);
}
/**
* See @link Map.zoomToExtent
*/
FlamingoMap.prototype.zoomToExtent = function (extent){
    this.getFrameworkMap().callMethod(this.getId(), "moveToExtent", extent, 0);
}

/**
* See @link Map.zoomToMaxExtent
*/
FlamingoMap.prototype.zoomToMaxExtent = function(){
    this.zoomToExtent(this.getFrameworkMap().callMethod(this.getId(), "getFullExtent"));
}

/**
* See @link Map.zoomToResolution
*/
FlamingoMap.prototype.zoomToResolution = function(resolution){
    this.getFrameworkMap().callMethod(this.getId(), "moveToScale",resolution,undefined,0);
}
/**
* See @link Map.zoomToScale
* @deprecated, use zoomToResolution because it zooms to a resolution and not a scale!
*/
FlamingoMap.prototype.zoomToScale = function(resolution){
    this.zoomToResolution(resolution);
}

/**
* see @link Map.setMaxExtent
*/
FlamingoMap.prototype.setMaxExtent=function(extent){
    this.getFrameworkMap().callMethod(this.getId(), "setFullExtent", extent);
}
/**     
*See @link Map.getFullExtent()
*/
FlamingoMap.prototype.getMaxExtent=function(){
    var extent=this.getFrameworkMap().callMethod(this.getId(), "getFullExtent");
    return new Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
}

/**
*See @link Map.doIdentify
*/
FlamingoMap.prototype.doIdentify = function(x,y){
    throw("Map.doIdentify() Not implemented!");
}

/**
*see @link Map.getExtent
*/
FlamingoMap.prototype.getExtent= function(){
    var extent= this.getFrameworkMap().callMethod(this.getId(),'getExtent');
    return new Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
}

/**
*see @link Map.update
*/
FlamingoMap.prototype.update = function (){
    this.getFrameworkMap().callMethod(this.getId(),'update', 100, true);
}

/**
*see @link Map.setMarker
*/
FlamingoMap.prototype.setMarker = function(markerName,x,y,type){
    this.getFrameworkMap().callMethod(this.getId(),"setMarker",markerName,type,Number(x),Number(y));
}
/**
*see @link Map.removeMarker
*/
FlamingoMap.prototype.removeMarker = function(markerName){
    this.getFrameworkMap().callMethod(this.getId(),"removeMarker",markerName);
}

/**
 *see @link Map.getScale
 *@deprecated use: getResolution because it returns the resolution and not the scale
 */
FlamingoMap.prototype.getScale = function (){
    return this.getResolution();
}
/**
 *see @link Map.getResolution
 */
FlamingoMap.prototype.getResolution = function (){
    return this.getFrameworkMap().callMethod(this.getId(), "getScaleHint");
}

/**
 * see @link Map.coordinateToPixel
 */
FlamingoMap.prototype.coordinateToPixel = function(x,y){
    return this.getFrameworkMap().callMethod(this.getId(), "coordinate2Point",{
        x: x,
        y: y
    });
}
/**
 * see @link Map.getCenter
 */
FlamingoMap.prototype.getCenter = function(){
    return this.getFrameworkMap().callMethod(this.getId(), "getCenter");
}
