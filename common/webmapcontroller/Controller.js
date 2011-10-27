/*JavaScript interface class file*/
function Controller(viewerObject){
    this.maps= new Array();
    this.tools= new Array();
    this.events = new Array();
    this.panel=null;
    this.eventList = new Array();
    webMapController = this;
}
var webMapController = null;
Controller.prototype.getId = function(){
    return "Controller";
}

/******************************Static declarations***************************************/

//Events:
//Controller events:                        0 - 10
Event.ON_CONFIG_COMPLETE                    = 0;
Event.ON_SET_TOOL                           = 1;
    
// Map events:                              11 - 50
Event.ON_GET_FEATURE_INFO                   = 11;
Event.ON_GET_FEATURE_INFO_DATA              = 12;
Event.ON_ALL_LAYERS_LOADING_COMPLETE        = 13;
Event.ON_CHANGE_EXTENT                      = 14;
Event.ON_FINISHED_CHANGE_EXTENT             = 15;


// Layer events:                            50 - 100
Event.ON_GET_CAPABILITIES                   = 50;
Event.ON_FEATURE_ADDED                      = 51;
Event.ON_REQUEST                            = 52;
Event.ON_LOADING_START                      = 53;
Event.ON_LOADING_END                        = 54;
    
// Tool events:                             100 - 150
Event.ON_EVENT_DOWN                         = 100;
Event.ON_EVENT_UP                           = 101;
Event.ON_CLICK                              = 102;
Event.ON_MEASURE                            = 103;

// Shared evens:                            150 - ...
Event.ON_ONIT                               = 150;  // Shared by
    
// The different types of tools
Tool.DRAW_FEATURE               = 0;
Tool.NAVIGATION_HISTORY         = 1;
Tool.ZOOM_BOX                   = 2;
Tool.PAN                        = 3;
Tool.BUTTON                     = 4;
Tool.TOGGLE                     = 5;
Tool.CLICK                      = 6;
Tool.LOADING_BAR                = 7;
Tool.GET_FEATURE_INFO           = 8;
Tool.MEASURE                    = 9;
Tool.SCALEBAR                   = 10;
Tool.ZOOM_BAR                   = 11;
Tool.LAYER_SWITCH               = 12;

Tool.DRAW_FEATURE_POINT         = 13;
Tool.DRAW_FEATURE_LINE          = 14;
Tool.DRAW_FEATURE_POLYGON       = 15;
	
/**
 *Create functions. SubClass needs to implement these so the user can
*create Framework specific objects.
**/

/**
     *Creates a layer for this framework
     *@param name the showable name of the layer
     *@param url the url to the serviceProvider
     *@param ogcParams the params that are used in the OGC-WMS request
     *@param options extra options for this wms layer
     *Must be implemented by subclass
     */
Controller.prototype.createWMSLayer = function(name, url, ogcParams,options){
    throw("Controller.createWMSLayer() Not implemented! Must be implemented in sub-class");
}
/**
 *Creates a OSGEO TMS layer.
 *@param id the id of the layer
 *@param name the showable name of the layer
 *@param url the url to the tms service
 *@param options extra options for this TMS layer
 */
Controller.prototype.createTMSLayer = function (id,name,url, options){
    throw("Controller.createTMSLayer() Not implemented! Must be implemented in sub-class");
}
/**
     *Creates a Map object for this framework
     *@param id the id of the map
     *@param options extra options for the map
     *Must be implemented by subclass
     */
Controller.prototype.createMap = function(id, options){
    throw("Controller.createMap(...) not implemented! Must be implemented in sub-class");
}
/**
     *Must be implemented by the sub-class
     *This creates a tool.
     */
Controller.prototype.createTool= function (){
    throw("Controller.createTool(...) not implemented! Must be implemented in sub-class");
}
/**
     *Add a array of Tool objects. For every tool .addTool is called.
     *@param tools Array of Tool objects
     */
Controller.prototype.addTools = function (tools){
    for (var i=0; i < tools.length; i++){
        addTool(tools[i]);
    }
}

/**
     *Adds the given tool to the list of tools. Sub-class needs to implement this
     *and call super to do some frameworks specific things.
     *@param tool The tool that needs to be added of type Tool
     */
Controller.prototype.addTool = function(tool){
    if (!(tool instanceof Tool)){
        throw("Given tool not of type 'Tool'");
    }
    this.tools.push(tool);
}
/**
     *Removes a tool from the list of tools. Sub-class needs to implement this
     *and call super to do some framework specific things.
     *@param tool The tool that needs to be removed.
     */
Controller.prototype.removeTool = function (tool){
    if (!(tool instanceof Tool)){
        throw("Given tool not of type 'Tool'");
    }
    for (var i=0; i < this.tools; i++){
        if (this.tools[i]==tool){
            this.tools.splice(i,1);
            return;
        }
    }
}

/**
* Helperfunction: Get a tool based on the given id
* @param id The id of the Tool which must be retrieved
 **/
Controller.prototype.getTool = function (id){
    for (var i = 0 ; i < this.tools.length ; i++){
        var tool = this.tools[i];
        if(tool.getId() == id){
            return tool;
        }
    }
    return null;
}
/**
 *Returns the tools that are added with type: type
 *@param type The type of the tools wanted
 *@return A array of tools with the given type (or a empty array when no tool is found)
 */
Controller.prototype.getToolsByType = function(type){
    var foundTools=new Array();
    for(var i=0; i < this.tools.length; i++){
        if(this.tools[i].getType()==type){
            foundTools.push(this.tools[i]);
        }
    }
    return foundTools;
}
/**
     *Removes a tool based on the given id
     *Must be implemented by subclass
	 * @param id Id of the which must be removed
     **/
Controller.prototype.removeToolById = function (id){
    throw("Controller.removeToolById() Not implemented! Must be implemented in sub-class");
}

/**
     *Add a map to the controller
     *Must be implemented by subclass
	 * @param mapObject The map which must be added to the controller.
     **/    
Controller.prototype.addMap = function (mapObject){
    throw("Controller.addMap() Not implemented! Must be implemented in sub-class");
}
/**
     *Gets the map with mapId
     *Must be implemented by subclass
	 * @param mapId The id of the map which must be returned.
     */
Controller.prototype.getMap = function (mapId){
    throw("Controller.getMap() Not implemented! Must be implemented in sub-class");
}
/**
     *Removes the given map from the controller.
     *Must be implemented by subclass
	 * @param removeMap The map which must be removed
     */
Controller.prototype.removeMap = function (removeMap){
    throw("Controller.removeMap() Not implemented! Must be implemented in sub-class");
}

/**
     *Creates a drawable vectorlayer
     *Must be implemented by subclass
	 * A vectorlayer is a layer on which features can be drawn by the user (a EditMap in Flamingo, a VectorLayer in OpenLayers)
	 * @param name The name of this laye
     */
Controller.prototype.createVectorLayer = function (name){
    throw("Controller.createVectorLayer() Not implemented! Must be implemented in sub-class");
}
/**
 *Creates a layer of an image
 *Must be implemented by subclass
 * A vectorlayer is a layer on which features can be drawn by the user (a EditMap in Flamingo, a VectorLayer in OpenLayers)
 * @param name The name of this layer
 * @param url The url of the image
 * @param bounds The boundary of the layer
 * @param size The size of the image
 * @param options Hashtable of extra options to tag onto the layer
 */
Controller.prototype.createImageLayer = function (name,url, bounds, size,options){
    throw("Controller.createImageLayer() Not implemented! Must be implemented in sub-class");
}

/**
* Creates a panel
*/
Controller.prototype.createPanel = function (name){
    throw("Controller.createPanel() Not implemented! Must be implemented in sub-class");
}
/**
 * Registers a function with a given event on the given object
 * Must be implemented by subclass
 * @param event The generic name for the event. Possible values declared as Event.ON_EVENT, etc. See the constructor of this class for the complete list of events.
 * @param object The object on which the event has effect
 * @param handler The function to be called when event takes place. The function must have the following signature:
 * handlerFunction(id,params).
 *
*/
Controller.prototype.registerEvent = function(event, object, handler){
    throw("Controller.registerEvent() Not implemented! Must be implemented in sub-class");
}
/**
 *Unregisters a event.
 *@param event is the event that needs to be unregisterd
 *@param object is the object on which the event must be unregisterd.
 */
Controller.prototype.unRegisterEvent = function (event, object){
    throw("Controller.unRegisterEvent() Not implemented! Must be implemented in sub-class");
}
 
/**
 * Entrypoint for all the fired events.
 * Must be implemented by subclass
 * @param event The event to be handled
 */
Controller.prototype.handleEvents = function(event){
    throw("Controller.handleEvents() Not implemented! Must be implemented in sub-class");
}

/**
* Initialize all the controller specific events.
*/
Controller.prototype.initEvents = function(){
    throw("Controller.initEvent() Not implemented! Must be implemented in sub-class");
}

/**
 * Gets the generic name for the specified specific eventname. Throws exception if specific name does not exist.
 * @param specific The specific name
 * @return The generic name.
 */
Controller.prototype.getGenericEventName = function (specific){
    if (this.eventList.length==0){
        this.initEvents();
    }
    for( var key in this.eventList){
        if(this.eventList[key] == specific){
            return key;
        }
    }
    throw("Event " + specific + " does not exist!");
}

/**
 * Gets the specific name for the specified generic eventname. null or undefined if generic name does not exist.
 * @param generic The generic name
 * @return The specific name.
 */
Controller.prototype.getSpecificEventName = function (generic){
    return this.eventList[generic];
}

/**
 * Activates the tool
 * @param id Id of the tool to be activated
 */
Controller.prototype.activateTool = function (id){
    throw("Controller.activateTool() Not implemented! Must be implemented in sub-class");
}

/*Map object interface class*/
function Map(frameworkMap){
    // console.log("super Map");
    this.layers=new Array();
    this.frameworkMap=frameworkMap;
//  console.log("Layers: "+this.layers);
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
    *Returns the index of the layer.
    *@param layer a Layer
    *@return the index of the layer or -1 if the layer is not found.
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

/** Gets all the wms layers in this map
     */
Map.prototype.getAllWMSLayers = function(){
    throw("Map.getAllWMSLayers() Not implemented! Must be implemented in sub-class");
}

/** Gets all the vector layers in this map
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
     *Must be implemented by subclass
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
     *Must be implemented by subclass
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
     *updates the map
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

/*  The superclass for all layers */

function Layer(frameworkLayer,id){
    this.frameworkLayer=frameworkLayer;
    this.id = id;
    this.maptips=new Array();
}

/**
* Get's the frameworklayer: the viewer specific layer.
*/
Layer.prototype.getFrameworkLayer = function(){
    return this.frameworkLayer;
}
/**
     *Gets a option of this layer
     *@return the option value or null if not exists
     */
Layer.prototype.getOption = function(optionKey){
    throw("Layer.getOption() Not implemented! Must be implemented in sub-class");
}
/**
     *sets or overwrites a option
     */
Layer.prototype.setOption = function(optionKey,optionValue){
    throw("Layer.getOption() Not implemented! Must be implemented in sub-class");
}

/**
     *Get the id of this layer
     */
Layer.prototype.getId =function (){
    return this.id;
}
/**
 *Add a maptip to the layer
 */
Layer.prototype.addMapTip = function(maptip){
    this.maptips.push(maptip);
}
/**
 * set a array of maptips
 */
Layer.prototype.setMapTips = function (maptips){
    this.maptips=maptips;
}
/**
 * get a array of maptips
 */
Layer.prototype.getMapTips = function (){
    return this.maptips;
}
/**
 *Gets the feature by a feature type (layername)
 *@param featureType the name of the featuretype returned by the server
 *@return the maptip for this layer/featuretype or null if none found
 */
Layer.prototype.getMapTipByFeatureType = function(featureType){
    for (var m=0; m < this.maptips.length; m++){
        if (this.maptips[m].layer == featureType ||
            this.maptips[m].aka == featureType){
            return this.maptips[m];
        }
    }
    return null;
}
////newLayer.addLayerProperty(new LayerProperty(layerItems[i].wmslayers, layerItems[i].maptipfield, aka));
function MapTip(layer,mapTipField,aka){
    this.layer=layer;
    this.mapTipField=mapTipField;
    this.aka=aka;
}

/* The class for controls */
function Tool(id,frameworkObject,type){
    this.id=id;
    this.frameworkTool=frameworkObject;
    this.type=type;
}

Tool.prototype.getFrameworkTool = function(){
    return this.frameworkTool;
}
Tool.prototype.getType = function(){
    return this.type;
}

Tool.prototype.getId = function(){
    return this.id;
}

Tool.prototype.setVisible = function(){
    throw("Tool.setVisible() not implemented! Must be implemented in sub-class");
}

Tool.prototype.isActive = function(){
    throw("Tool.isActive() not implemented! Must be implemented in sub-class");
}

/**
 *Extent class constructor
 *There are 2 ways to create a extent:
 *- With 1 string that has 4 comma seperated coords(xxx,xxx,xxx,xxx)
 *- With 4 numbers
 **/
function Extent(minx,miny,maxx,maxy){
    if (minx!=undefined && miny==undefined && maxx==undefined && maxy==undefined){
        var tokens=minx.split(",");
        if (tokens.length!=4){
            throw("Can not create Extent because there is no bbox found");
        }
        this.minx=tokens[0];
        this.miny=tokens[1];
        this.maxx=tokens[2];
        this.maxy=tokens[3];
    }else{
        this.minx=minx;
        this.maxx=maxx;
        this.miny=miny;
        this.maxy=maxy;
    }
}

/**
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

