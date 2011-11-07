/**
 * @class 
 * @constructor
 * @description The superclass for all maps 
 * @param frameworkMap The frameworkspecific layer
 * Map object interface class
 * */
function Map(frameworkMap){
    this.layers=new Array();
    this.frameworkMap=frameworkMap;
}

Ext.extend(Map,Ext.util.Observable,{});


Map.prototype.registerEvent = function (event,handler){
    this.addListener(event,handler);
}

Map.prototype.fire = function (event,options){
    this.fireEvent (event,this,options);
}

/**
 * @returns the framework map object.
 */
Map.prototype.getFrameworkMap= function(){
    return this.frameworkMap;
}
    
/**
 *Add a Array of layers(services) to the map
 *@param layers a array of layers
 **/    
Map.prototype.addLayers = function(layers){
    for (var i=0; i < layers.length; i++){
        this.addLayer(layers[i]);
    }
}
/**
 *Returns all the layers added to this maps.
 */
Map.prototype.getLayers = function(){
    if (this.layers==undefined){
        this.layers=new Array();
    }
    return this.layers;
}

/**
 *Get the layer by id
 *@param id the id of the layer you want.
 *@return the layer with the given id or null if the layer does not exists.
 */
Map.prototype.getLayer = function (id){
    for (var i=0; i < this.layers.length; i++){
        if (id==this.layers[i].getId()){
            return this.layers[i];
        }
    }
    return null;
}

/**
 *Removes a layer by the given id. Throws a exception when layer with id doesn't exists
 *@param layerId the id of the layer that needs to be removed.
 *Must be implemented by subclass
 */
Map.prototype.removeLayerById = function (layerId){
    this.removeLayer(this.getLayer(layerId));
}
/**
 *Remove all the layers
 */
Map.prototype.removeAllLayers=function(){
    for (var i=0; i < this.layers().length; i++){
        removeLayer(this.layers[i]);
    }
}
/**
* Returns the index of the layer.
* @param layer a Layer
* @return the index of the layer or -1 if the layer is not found.
*/
Map.prototype.getLayerIndex = function(layer){
    for (var i=0; i < this.getLayers().length; i++){
        if (this.getLayers()[i]==layer){
            return i;
        }
    }
    return -1;
}

/*****************Overwrite these functions in the subclass and call this function in the overwrite*****************/

/**
 *Add a layer(service) to the map
 *@param layer the layer that needs to be added.
 *Must be implemented by subclass to add the layer to the frameworkmap
 **/
Map.prototype.addLayer = function(layer){
    if (!(layer instanceof Layer)){
        throw("Map.addLayer: Given layer is not of type Layer");
    }
    this.layers.push(layer);
}
/**
 *Removes a specifice layer from the map.
 *Must be implemented by subclas! The subclass needs to do the remove from the framework!
 **/
Map.prototype.removeLayer=function(layer){
    var index=this.getLayerIndex(layer);
    if (index==-1)
        throw("Map.removeLayer(): Layer not available in map!");
    this.layers.splice(index,1);
}
/**
 * Set the layer index of the given layer. The subclass needs to implement
 * the setLayerIndex in the framework.
 * @param layer a Layer object.
 * @param newIndex the new index for this layer
 * @return the old index of this layer
 */
Map.prototype.setLayerIndex = function (layer, newIndex){
    if(!(layer instanceof Layer)){
        throw("Given layer not of type Layer");
    }
    var currentIndex=this.getLayerIndex(layer);
    var newLayerArray= new Array();
    var oldLayerArray = this.getLayers();
    var size = oldLayerArray.length;
    var count=0;
    // Delete layer from the old array
    oldLayerArray.splice(currentIndex   ,1);
    for(var i = 0 ; i < size; i++){
        if(newIndex == i ){
            newLayerArray.push(layer);
        }else{
            newLayerArray.push(oldLayerArray[count]);
            count++;
        }
    }
    this.layers=newLayerArray;
    return currentIndex;
}

/*****************These functions need to be overwritten*****************/
/**
 *Gets the id of this object
 *Must be implemented by subclass
 */
Map.prototype.getId = function(){
    throw("Map.getId() Not implemented! Must be implemented in sub-class");
}

/** 
 *Gets all the wms layers in this map
 */
Map.prototype.getAllWMSLayers = function(){
    throw("Map.getAllWMSLayers() Not implemented! Must be implemented in sub-class");
}

/** 
 *Gets all the vector layers in this map
 */
Map.prototype.getAllVectorLayers = function(){
    throw("Map.getAllVectorLayers() Not implemented! Must be implemented in sub-class");
}

/**
 *Remove this map
 *Must be implemented by subclass
 */
Map.prototype.remove = function(){
    throw("Map.remove() Not implemented! Must be implemented in sub-class");
}

/**
 * Move the map to the given extent.
 * @param extent a Extent object
 *Must be implemented by subclass
 */
Map.prototype.zoomToExtent = function (extent){
    throw("Map.moveToExtent() Not implemented! Must be implemented in sub-class");
}

/**
 * Moves the viewport to the max extent.
 * Must be implemented by subclass
 */
Map.prototype.zoomToMaxExtent = function(){
    throw("Map.zoomToMaxExtent() Not implemented! Must be implemented in sub-class");
}

/**
 *Zooms to the given scale
 *Must be implemented by subclass
 */
Map.prototype.zoomToScale = function(scale){
    throw("Map.zoomToScale() Not implemented! Must be implemented in sub-class");
}

/**
 *Zooms to the given resolution
 *Must be implemented by subclass
 */
Map.prototype.zoomToResolution = function(resolution){
    throw("Map.zoomToResolution() Not implemented! Must be implemented in sub-class");
}

/**
 *Returns the current extent of the viewport as a extent object.
 *Must be implemented by subclass
 */
Map.prototype.getExtent= function(){
    throw("Map.getExtent() Not implemented! Must be implemented in sub-class");
}

/**
 * Sets the full extent of the viewport
 * @param extent (see Extent object)
 * Must be implemented by subclass
 */
Map.prototype.setMaxExtent=function(extent){
    throw("Map.setMaxExtent() Not implemented! Must be implemented in sub-class");
}
/**
 *returns the full extent as a extent object
 *Must be implemented by subclass
 *
 */
Map.prototype.getMaxExtent=function(){
    throw("Map.getFullExtent() Not implemented! Must be implemented in sub-class");
}

/**
 *Do a identify on a specific coord extent.
 *@param x the x coord
 *@param y the y coord
 *Must be implemented by subclass
 */
Map.prototype.doIdentify = function(x,y){
    throw("Map.doIdentify() Not implemented! Must be implemented in sub-class");
}

/**
 * Ipdates the map
 *Must be implemented by subclass
 */
Map.prototype.update = function (){
    throw("Map.update() Not implemented! Must be implemented in sub-class");
}

/**
 *Sets a marker on the map
 *@param markerName the name of the marker
 *@param x the x coord
 *@param y the y coord
 *@param type the type marker
 *Must be implemented by subclass
 */
Map.prototype.setMarker = function(markerName,x,y,type){
    throw("Map.setMarker() Not implemented! Must be implemented in sub-class");
}

/**
 *Removes the marker with the given markerName
 *@param markerName the name of the marker that needs to be removed.
 *Must be implemented by subclass
 */
Map.prototype.removeMarker = function(markerName){
    throw("Map.removeMarker() Not implemented! Must be implemented in sub-class");
}

/**
 * Gets the scale of this map
 * @return The current scale of this map
 */
Map.prototype.getScale = function (){
    throw("Map.getScale() Not implemented! Must be implemented in sub-class");
}

/**
 * Gets the resolution of this map
 * @return The current resolution of this map
 */
Map.prototype.getResolution = function (){
    throw("Map.getResolution() Not implemented! Must be implemented in sub-class");
}

/**
 * calculates the viewport pixel coordinate from the realworld pixel
 * @param x xcoord
 * @param y ycoord
 * @return a object with object.x the x pixel and object.y the y pixel
*/
Map.prototype.coordinateToPixel = function(x,y){
    throw("Map.coordinateToPixel() Not implemented! Must be implemented in sub-class");
}

/**
 * gets the center of this viewport in worldcoordinates
 * @return a object with object.x the .y.
 */
Map.prototype.getCenter = function(){
    throw("Map.getCenter() Not implemented! Must be implemented in sub-class");
}
