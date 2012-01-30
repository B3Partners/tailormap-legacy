/**
 * @class 
 * @constructor
 * @description
 *The openlayers map object wrapper
 */
function OpenLayersMap(olMapObject){
    if (!(olMapObject instanceof OpenLayers.Map)){
        throw("The given map is not of the type 'OpenLayers.Map'");
    }
    this.markerLayer=null;
    this.defaultIcon=null;
    this.markers=new Object();
    this.getFeatureInfoControl = null;
    Map.call(this,olMapObject);
}
//set inheritens
OpenLayersMap.prototype = new Map();
OpenLayersMap.prototype.constructor=OpenLayersMap;

/**
     *See @link Map.getId
     */
OpenLayersMap.prototype.getId = function(){
    //multiple maps not supported yet
    return "";
}

/**
 *See @link Map.getAllWMSLayers
 */
OpenLayersMap.prototype.getAllWMSLayers = function(){
    var lagen = new Array();
    for(var i = 0 ; i < this.layers.length;i++){
        if(this.layers[i] instanceof OpenLayersWMSLayer){
            lagen.push(this.layers[i]);
        }
    }
    return lagen;
}
/**
 *See @link Map.getAllVectorLayers
 */
OpenLayersMap.prototype.getAllVectorLayers = function(){
    var lagen = new Array();
    for(var i = 0 ; i < this.layers.length;i++){
        if(this.layers[i] instanceof OpenLayersVectorLayer){
            lagen.push(this.layers[i]);
        }
    }
    return lagen;
}

/**
     *See @link Map.remove
     */
OpenLayersMap.prototype.remove = function(){
    this.getFrameworkMap().destroy();
}

/**
     *Add a layer. Also see @link Map.addLayer
     **/
OpenLayersMap.prototype.addLayer = function(layer){
    if (!(layer instanceof OpenLayersLayer)){
        throw("The given layer is not of the type 'OpenLayersLayer'. But: "+layer);
    }
    this.layers.push(layer);
    if (layer instanceof OpenLayersWMSLayer){
        if (layer.getGetFeatureInfoControl()!=null){
            var info=layer.getGetFeatureInfoControl();
            this.getFrameworkMap().addControl(info);
            info.events.register("getfeatureinfo",webMapController, webMapController.onIdentifyDataHandler);
            //map.getFrameworkMap().events.register('click', this, this.beforeidentifyafasdfasdf);
            //  info.events.register("beforegetfeatureinfo",webMapController, webMapController.onIdentifyHandler);

            //this.getGetFeatureInfoControl().addControl(info);
            //check if a getFeature tool is active.
            var getFeatureTools=webMapController.getToolsByType(Tool.GET_FEATURE_INFO);
            for (var i=0; i < getFeatureTools.length; i++){
                if (getFeatureTools[i].isActive()){
                    info.activate();
                }
            }
        }
        if (layer.getMapTipControl()!=null){
            var maptipControl=layer.getMapTipControl();
            this.getFrameworkMap().addControl(maptipControl);
            maptipControl.events.register("getfeatureinfo",layer, webMapController.onMapTipHandler);
            maptipControl.activate();
        }

        if(webMapController.events[webMapController.getSpecificEventName(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE)] != null){
            layer.register(viewer.viewercontroller.controller.Event.ON_LOADING_END,this.layerFinishedLoading);
            layer.register(viewer.viewercontroller.controller.Event.ON_LOADING_START,this.layerBeginLoading);
        }
    }

    this.getFrameworkMap().addLayer(layer.getFrameworkLayer());
}
/**
     *remove the specific layer. See @link Map.removeLayer
     **/
OpenLayersMap.prototype.removeLayer=function(layer){
    if (!(layer instanceof OpenLayersLayer))
        throw("OpenLayersMap.removeLayer(): Given layer not of type OpenLayersLayer");
    //call super function
    Map.prototype.removeLayer.call(this,layer);
    //this.getFrameworkMap().remove(layer.getFrameworkLayer());
    if (layer instanceof OpenLayersWMSLayer){
        if(layer.getGetFeatureInfoControl()!=null){
            layer.getGetFeatureInfoControl().destroy();
        }
        if (layer.getMapTipControl()!=null){
            layer.getMapTipControl().destroy();
        }
    }
    layer.getFrameworkLayer().destroy(false);
}
/**
     *see @link Map.setLayerIndex
     */
OpenLayersMap.prototype.setLayerIndex = function (layer, newIndex){
    if (!(layer instanceof OpenLayersLayer)){
        throw("OpenLayersMap.setLayerIndex(): Given layer not of type OpenLayersLayer.");
    }
    this.getFrameworkMap().setLayerIndex(layer.getFrameworkLayer(),newIndex);
    return Map.prototype.setLayerIndex(layer,newIndex);
}

/**
 *Sets the getfeatureinfo control of this map
 */
OpenLayersMap.prototype.setGetFeatureInfoControl = function (control){
    if( control.type != Tool.GET_FEATURE_INFO){
        throw ("Type of given control not of type GET_FEATURE_INFO, but: " + control.type);
    }
    this.getFeatureInfoControl = control;
}

/**
     *Move the viewport to the maxExtent. See @link Map.zoomToMaxExtent
     **/
OpenLayersMap.prototype.zoomToMaxExtent = function (){
    this.getFrameworkMap().zoomToExtent(this.getFrameworkMap().getMaxExtent());
}
/**
     *See @link Map.zoomToExtent
     **/
OpenLayersMap.prototype.zoomToExtent = function(extent){
    var bounds=Utils.createBounds(extent)
    this.getFrameworkMap().zoomToExtent(bounds);
}
/**
* See @link Map.zoomToScale
* @deprecated, use zoomToResolution because it zooms to a resolution and not a scale
*/
OpenLayersMap.prototype.zoomToScale = function(scale){
    this.getFrameworkMap().zoomToResolution(scale);
}
/**
* See @link Map.zoomToResolution
*/
OpenLayersMap.prototype.zoomToResolution = function(resolution){
    this.getFrameworkMap().zoomTo(this.getFrameworkMap().getZoomForResolution(resolution));
}

/**
     * See @link Map.setMaxExtent
     * WARNING: Bug in openlayers: doesn't change the maxextent
     * As workaround add the maxExtent when initing the map
     */
OpenLayersMap.prototype.setMaxExtent=function(extent){
    this.getFrameworkMap().setOptions({
        maxExtent: Utils.createBounds(extent)
    });
}
/**
     *See @link Map.getMaxExtent     
     */
OpenLayersMap.prototype.getMaxExtent=function(){
    return Utils.createExtent(this.getFrameworkMap().getMaxExtent());
}
/**
     *See @link Map.getExtent
     */
OpenLayersMap.prototype.getExtent=function(){
    var extent = Utils.createExtent(this.getFrameworkMap().getExtent());
    var genericExtent = new Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
    return genericExtent;
}
/*TODO:
    OpenLayersMap.prototype.doIdentify = function(x,y){}
    OpenLayersMap.prototype.update = function(){}    
    OpenLayersMap.prototype.removeMarker = function(markerName){}
     */
/**
     *see @link Map.setMarker
     *TODO: marker icon path...
     */
OpenLayersMap.prototype.setMarker = function(markerName,x,y,type){
    if (this.markerLayer==null){
        this.markerLayer = new OpenLayers.Layer.Markers("Markers");
        this.frameworkMap.addLayer(this.markerLayer);
        var size = new OpenLayers.Size(17,17);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        this.defaultIcon= new OpenLayers.Icon('scripts/openlayers/img/marker.png',size,offset);
    }
    /*According the 'type' load a icon: no types yet only default*/
    var icon= this.defaultIcon.clone();
    this.markers[markerName]= new OpenLayers.Marker(new OpenLayers.LonLat(x,y),icon);
    this.markerLayer.addMarker(this.markers[markerName]);
}
/**
     *see @link Map.removeMarker
     */
OpenLayersMap.prototype.removeMarker = function(markerName){
    if (this.markers[markerName] && this.markerLayer!=null){
        this.markerLayer.removeMarker(this.markers[markerName]);
    }
}

OpenLayersMap.prototype.register = function (event,handler,thisObj){
    if (thisObj==undefined){
        thisObj=this;
    }
    var specificName = webMapController.getSpecificEventName(event);
    if(this.getFrameworkMap().eventListeners == null){
        this.getFrameworkMap().eventListeners = new Object();
    }
    
    if(event == viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE){
        var wmsLayers = this.getAllWMSLayers();
        for(var i = 0 ; i < wmsLayers.length ; i++){
            var layer = wmsLayers[i];
            layer.register(event,this.layerFinishedLoading);
            layer.register(viewer.viewercontroller.controller.Event.ON_LOADING_START,this.layerBeginLoading);
        }
        webMapController.register(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE, handler);
    }else{
        //this.getFrameworkMap().eventListeners [specificName]= handler;        
        this.getFrameworkMap().events.register(specificName,thisObj,handler);
    }
}

OpenLayersMap.prototype.unRegister = function (event,handler,thisObj){
    var specificName = webMapController.getSpecificEventName(event);
    if (event == viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE){
        webMapController.unRegister(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE, handler);
    }
    this.getFrameworkMap().events.unregister(specificName,thisObj,handler);
}
/**
 *See @link Map.getScale
 *@deprecated, use getResolution because it returns the resolution and not the scale
 */
OpenLayersMap.prototype.getScale = function(){
    return this.getResolution();
}
/**
 *See @link Map.getResolution
 */
OpenLayersMap.prototype.getResolution = function(){
    return this.getFrameworkMap().getResolution();
}
/**
 *See @link Map.coordinateToPixel
 *@returns a OpenLayers.pixel object (has a .x and a .y)
 */
OpenLayersMap.prototype.coordinateToPixel = function(x,y){
    return this.getFrameworkMap().getPixelFromLonLat(new OpenLayers.LonLat(x,y));
}

/**
 *see @link Map.getCenter
 *@return a OpenLayers.LonLat object with .x references to .lon and .y references to .lat
 */
OpenLayersMap.prototype.getCenter = function(){
    var lonlat=this.getFrameworkMap().getCenter();
    lonlat.x=lonlat.lon;
    lonlat.y=lonlat.lat;
    return lonlat;
}

var layersLoading=0;
OpenLayersMap.prototype.layerFinishedLoading = function (id,data,c,d){
    layersLoading--;    
    if (layersLoading==0){
        webMapController.handleEvent(webMapController.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE]);
    }else if (layersLoading < 0){
        layersLoading=0;
    }
}

OpenLayersMap.prototype.layerBeginLoading = function (id,data,c,d){
    layersLoading++;
}