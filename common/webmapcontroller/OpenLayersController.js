/**
 *Controller subclass for OpenLayers
 */
function OpenLayersController(){
    this.pointButton = null;
    this.lineButton = null;
    this.polygonButton = null;
    Controller.call(this,'');
}
//extends Controller
OpenLayersController.prototype = new Controller();
OpenLayersController.prototype.constructor=OpenLayersController;

OpenLayersController.prototype.initEvents = function(){
    this.eventList[Event.ON_EVENT_DOWN]                             = "activate";
    this.eventList[Event.ON_EVENT_UP]                               = "deactivate";
    this.eventList[Event.ON_GET_CAPABILITIES]                       = "onGetCapabilities";
    this.eventList[Event.ON_CONFIG_COMPLETE]                        = "onConfigComplete";
    this.eventList[Event.ON_FEATURE_ADDED]                          = "featureadded";
    this.eventList[Event.ON_CLICK]                                  = "click";
    this.eventList[Event.ON_SET_TOOL]                               = "activate";
    this.eventList[Event.ON_ALL_LAYERS_LOADING_COMPLETE]            = "onUpdateComplete";
    this.eventList[Event.ON_LOADING_START]                          = "loadstart";
    this.eventList[Event.ON_LOADING_END]                            = "loadend";
    this.eventList[Event.ON_MEASURE]                                = "measure";
    this.eventList[Event.ON_FINISHED_CHANGE_EXTENT]                 = "zoomend";
    this.eventList[Event.ON_CHANGE_EXTENT]                          = "move";
}
/**
     *Gets the panel of this controller and OpenLayers.Map. If the panel is still
     *null, the panel is created and added to the map.
     *@return a OpenLayers.Control.Panel
     */
OpenLayersController.prototype.getPanel = function(){
    if (this.panel==null){
        this.panel=new OpenLayers.Control.Panel();
        this.maps[0].getFrameworkMap().addControl(this.panel);
    }
    return this.panel;
}

OpenLayersController.prototype.createPanel = function (id){
    var paneel= new OpenLayers.Control.Panel();
    this.panel = paneel;
    this.maps[0].getFrameworkMap().addControl(this.panel);
}
/**
     *Creates a Openlayers.Map object for this framework. See the openlayers.map docs
     *@param id the id the DomElement where the map must be set
     *@param options extra options for the map. See the OpenLayers.Map docs.
     *@returns a OpenLayersMap
     */
OpenLayersController.prototype.createMap = function(id, options){
    //set some default options:
    if (!options["theme"])
        options["theme"]=OpenLayers._getScriptLocation()+'theme/b3p/style.css';
    //create the map.
    var map=new OpenLayers.Map(id,options);
    map.events.register("click",webMapController, webMapController.onIdentifyHandler);
    return new OpenLayersMap(map);
}
/**
     *See @link Controller.createWMSLayer
     */
    
OpenLayersController.prototype.createWMSLayer = function(name, wmsurl,ogcParams,options){
    options["id"]=null;
    options["isBaseLayer"]=false;
    options["singleTile"]=true;
    options["events"] = new Object();
    var wmsLayer = new OpenLayersWMSLayer(new OpenLayers.Layer.WMS(name,wmsurl,ogcParams,options),name);
    if(ogcParams["query_layers"] != null && ogcParams["query_layers"] != ""){

        var info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: wmsurl,
            title: 'Identify features by clicking',
            queryVisible: true,
            layers: [wmsLayer.getFrameworkLayer()],
            queryLayers : ogcParams["query_layers"],
            infoFormat : "text/xml"
        });
        info.request = doGetFeatureRequest;
        wmsLayer.setGetFeatureInfoControl(info);
    }
    if (options["maptip_layers"]!=null && options["maptip_layers"]!=""){
        var maptip = new OpenLayers.Control.WMSGetFeatureInfo({
            url: wmsurl,
            title: 'Identify features by clicking',
            queryVisible: true,
            layers: [wmsLayer.getFrameworkLayer()],
            queryLayers : options["maptip_layers"],
            infoFormat : "application/vnd.ogc.gml",
            hover: true
        });
        maptip.request = doGetFeatureRequest;
        wmsLayer.setMapTipControl(maptip);
    }
    return wmsLayer;
}
/**
 *See @link Controller.createTMSLayer
 */
OpenLayersController.prototype.createTMSLayer = function (name,url, options){
    var tmsLayer= new OpenLayersTMSLayer(new OpenLayers.Layer.TMS(name,url,options),name);
    return tmsLayer;
}

/**
 *See @link Controller.createTMSLayer
 */
OpenLayersController.prototype.createImageLayer = function (name,url, bounds, size,options){
    var imageLayer = new OpenLayersImageLayer (new OpenLayers.Layer.Image( name,url,bounds,size,options ));

    return imageLayer;
}


/**
     *Create a tool: the initializing of a piece of functionality to link to a button
     *@param id
     *@param type: the type of the tool. Possible values: DRAW_FEATURE, ...     *
     *@param options: the options used for initializing the Tool
     *  Posible options:
     *  handlerGetFeatureHandler: the handler for getFeatures
     *  handlerBeforeGetFeatureHandler: the handler for before getFeatures
     *  layer: the layer that is needed for some drawing tools
     *  All other openlayer options.
     **/
OpenLayersController.prototype.createTool= function (id,type, options){
    if (type==Tool.DRAW_FEATURE){
        //TODO: Deze crap weg! Afzonderlijke buttons aanmaken en niet in de controller plaatsen! Maar in lijst van tools
        //  var container = params["container"];
        var layer=options["layer"];
        var toolbar= new OpenLayers.Control.EditingToolbar( layer.getFrameworkLayer() );
        
        // Voeg de individuele knoppen toe
        this.pointButton =new OpenLayersTool(id+"_point",toolbar.controls[1],type);
        this.lineButton =new OpenLayersTool(id+"_line",toolbar.controls[2],type);
        this.polygonButton =new OpenLayersTool(id+"_polygon",toolbar.controls[3],type);
        
        var openLayersTools = new Array();
        openLayersTools.push(this.pointButton);
        openLayersTools.push(this.lineButton);
        openLayersTools.push(this.polygonButton);
       
        return openLayersTools;
    }else if (type==Tool.DRAW_FEATURE_POINT){
        //  var container = params["container"];
        var layer=options["layer"];
        var toolbar= new OpenLayers.Control.EditingToolbar( layer.getFrameworkLayer() );

        // Voeg de individuele knoppen toe
        this.pointButton =new OpenLayersTool(id,toolbar.controls[1],type);

        return this.pointButton;
    }else if (type==Tool.DRAW_FEATURE_LINE){
        var layer=options["layer"];
        var toolbar= new OpenLayers.Control.EditingToolbar( layer.getFrameworkLayer() );
        this.lineButton =new OpenLayersTool(id,toolbar.controls[2],type);
        return this.lineButton;
    }else if (type==Tool.DRAW_FEATURE_POLYGON){
        var layer=options["layer"];
        var toolbar= new OpenLayers.Control.EditingToolbar( layer.getFrameworkLayer() );
        this.polygonButton =new OpenLayersTool(id,toolbar.controls[3],type);
        return this.polygonButton;
    }else if (type==Tool.NAVIGATION_HISTORY){
        return new OpenLayersTool(id,new OpenLayers.Control.NavigationHistory(options),type);
    }else if (type==Tool.ZOOM_BOX){
        return new OpenLayersTool(id,new OpenLayers.Control.ZoomBox(options),type);
    }else if (type==Tool.PAN){
        return new OpenLayersTool(id,new OpenLayers.Control.DragPan(options),type)
    }else if (type==Tool.BUTTON){
        if (!options){
            options=new Object();
        }
        options["displayClass"]="olControl"+id;
        options["type"]=OpenLayers.Control.TYPE_BUTTON;
        return new OpenLayersTool(id,new OpenLayers.Control(options),type);
    }else if (type==Tool.TOGGLE){
        if (!options){
            options=new Object();
        }
        options["displayClass"]="olControl"+id;
        options["type"]=OpenLayers.Control.TYPE_TOGGLE;
        return new OpenLayersTool(id,new OpenLayers.Control(options),type);
    }else if (type==Tool.CLICK){
        if (!options){
            options=new Object();
        }
        options["displayClass"]="olControl"+id;
        return new OpenLayersTool(id,new OpenLayers.Control.Click(options),type);
    }else if (type==Tool.LOADING_BAR){
        return new OpenLayersTool(id,new OpenLayers.Control.LoadingPanel(options),type);
    }else if (type == Tool.GET_FEATURE_INFO) {
        if (!options){
            options=new Object();
        }
        options["displayClass"]="olControl"+id;
        options["type"]=OpenLayers.Control.TYPE_TOOL;
        var identifyTool = new OpenLayersIdentifyTool(id,new OpenLayers.Control(options),type);
        identifyTool.getFrameworkTool().events.register("activate",this,this.activateGetFeatureControls);
        identifyTool.getFrameworkTool().events.register("deactivate",this,this.deactivateGetFeatureControls);

        identifyTool.setGetFeatureInfoHandler(options["handlerGetFeatureHandler"]);
        identifyTool.setBeforeGetFeatureInfoHandler(options["handlerBeforeGetFeatureHandler"]);

        //this.getMap().setGetFeatureInfoControl(identifyTool);
        return identifyTool;
    }else if(type == Tool.MEASURE){
        if (!options){
            options=new Object();
        }
        options["persist"]=true;
        options["callbacks"]={
            modify: function (evt){
                //make a tooltip with the measured length
                if (evt.parent){
                    var measureValueDiv=document.getElementById("olControlMeasureValue");
                    if (measureValueDiv==undefined){
                        measureValueDiv=document.createElement('div');
                        measureValueDiv.id="olControlMeasureValue";
                        measureValueDiv.style.position='absolute';
                        this.map.div.appendChild(measureValueDiv);
                        measureValueDiv.style.zIndex="10000";
                        measureValueDiv.className="olControlMaptip";
                        var measureValueText=document.createElement('div');
                        measureValueText.id='olControlMeasureValueText';
                        measureValueDiv.appendChild(measureValueText);
                    }
                    var px= this.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(evt.x,evt.y));
                    measureValueDiv.style.top=px.y+"px";
                    measureValueDiv.style.left=px.x+10+'px'
                    measureValueDiv.style.display="block";
                    var measureValueText=document.getElementById('olControlMeasureValueText');
                    var bestLengthTokens=this.getBestLength(evt.parent);
                    measureValueText.innerHTML= bestLengthTokens[0].toFixed(3)+" "+bestLengthTokens[1];
                }
            }
        }

        var measureTool= new OpenLayersTool(id,new OpenLayers.Control.Measure( OpenLayers.Handler.Path, options),type);
        measureTool.getFrameworkTool().events.register('measure',measureTool.getFrameworkTool(),function(){
            var measureValueDiv=document.getElementById("olControlMeasureValue");
            if (measureValueDiv){                
                measureValueDiv.style.display="none";
            }
            this.cancel();
        });
        measureTool.getFrameworkTool().events.register('deactivate',measureTool.getFrameworkTool(),function(){
            var measureValueDiv=document.getElementById("olControlMeasureValue");
            if (measureValueDiv){
                measureValueDiv.style.display="none";
            }
        });
        return measureTool;
    }else if(type == Tool.SCALEBAR){
        return new OpenLayersTool(id, new OpenLayers.Control.ScaleLine (options),type);
    }else if (type == Tool.ZOOM_BAR) {
        return new OpenLayersTool(id,new OpenLayers.Control.PanZoomBar(options),type)
    }else if (type == Tool.LAYER_SWITCH){
        return new OpenLayersTool(id,new OpenLayers.Control.LayerSwitcher(options),type);
    }else{
        throw ("Type >" + type + "< not recognized. Please use existing type.");
    }
}

OpenLayersController.prototype.activateGetFeatureControls = function(){
    var layers=this.getMap().getAllWMSLayers();
    //var controls = webMapController.getMap().getGetFeatureInfoControl().controls;
    for (var i = 0 ; i< layers.length ; i++ ){
        var con = layers[i].getGetFeatureInfoControl();
        if (con!=null)
            con.activate();
    }
}

OpenLayersController.prototype.deactivateGetFeatureControls = function(){
    var layers=this.getMap().getAllWMSLayers();
    //var controls = webMapController.getMap().getGetFeatureInfoControl().controls;
    for (var i = 0 ; i< layers.length ; i++ ){
        var con = layers[i].getGetFeatureInfoControl();
        if (con!=null)
            con.deactivate();
    }
}
/**
     *See @link Controller.addTool
     */
OpenLayersController.prototype.addTool = function(tool){
    /* if (!(tool instanceof OpenLayersTool)){
        throw("The given tool is not of type 'OpenLayersTool'");
    }*/
    if (this.maps.length==0){
        throw("No map in Controller!");
    }
    if( tool instanceof Array){
        for(var i = 0 ; i < tool.length; i++){
            this.getMap().getFrameworkMap().addControl(tool[i].getFrameworkTool());
            this.addTool(tool[i]);
            Controller.prototype.addTool.call(this,tool[i]);
        }
    }else if (tool.getType()==Tool.NAVIGATION_HISTORY){
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
        this.getPanel().addControls([tool.getFrameworkTool().next, tool.getFrameworkTool().previous]);
    }else if (tool.getType() == Tool.CLICK){
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
        this.getPanel().addControls([tool.getFrameworkTool().button]);
    }else if (tool.getType() == Tool.LOADING_BAR){
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
    }else if( tool.getType() == Tool.GET_FEATURE_INFO ){
        this.getPanel().addControls([tool.getFrameworkTool()]);
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
    }else if (tool.getType() == Tool.SCALEBAR){
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
    }else if(tool.getType() == Tool.ZOOM_BAR){
        this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
    } else{
        this.getPanel().addControls([tool.getFrameworkTool()]);
    }

    if(!(tool instanceof Array) ){
        Controller.prototype.addTool.call(this,tool);
    }
}

OpenLayersController.prototype.removeToolById = function (id){
    var tool = this.getTool(id);
    this.removeTool(tool);
}

/**
     *See @link Controller.removeTool
     */
OpenLayersController.prototype.removeTool = function (tool){
    if (!(tool instanceof OpenLayersTool)){
        throw("The given tool is not of type 'OpenLayersTool'");
    }    
    if (tool.type==Tool.NAVIGATION_HISTORY){
        OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool().next);
        OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool().previous);
        tool.getFrameworkTool().destroy();
    }else{
        OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool());
    }
    this.maps[0].getFrameworkMap().removeControl(tool.getFrameworkTool());
    if (this.getPanel().controls.length==0){
        this.getPanel().destroy();
        this.panel=null
    }else{
        this.getPanel().redraw();
    }
    Controller.prototype.removeTool.call(this,tool);
}
/**Add a map to the controller.
     *For know only 1 map supported.
     */
OpenLayersController.prototype.addMap = function (map){
    if (!(map instanceof OpenLayersMap)){
        throw("The given map is not of the type 'OpenLayersMap'");
    }
    if (this.maps.length>=1)
        throw("Multiple maps not supported yet");
    this.maps.push(map);
    map.getFrameworkMap().events.register("mousemove",this,this.removeMaptip);
}
/**
     *Get the map by id. For openlayers only 1 map....
     *@param mapId the mapId
     *@returns the Map with the id, or the only map.
     */
OpenLayersController.prototype.getMap = function (mapId){
    return this.maps[0];
}
/**
     *Remove the map from the
     */
OpenLayersController.prototype.removeMap = function (removeMap){
    removeMap.remove();
    this.maps=new Array();
}

OpenLayersController.prototype.createVectorLayer = function(id,options){
    if (options==undefined){
        options = new Object();
        options["isBaseLayer"]= false;
    }else{
        if(options["isBaseLayer"] == undefined){
            options["isBaseLayer"]= false;
        }
    }
    return new OpenLayersVectorLayer(new OpenLayers.Layer.Vector(id, options),id);
}

OpenLayersController.prototype.activateTool = function (id){
    var tools = this.tools;
    for(var i = 0 ; i < tools.length ; i++){
        tools[i].getFrameworkTool().deactivate();
    }
    var tool = this.getTool(id);
    tool.getFrameworkTool().activate();
}

/****************************************************************Event handling***********************************************************/

/**
 * Registers an event to a handler, on a object. Flamingo doesn't implement per component eventhandling,
 * so this controller stores the event in one big array (Object..).
 */
OpenLayersController.prototype.registerEvent = function (event,object,handler,thisObj){
    object.register(event,handler,thisObj);
}

OpenLayersController.prototype.unRegisterEvent= function (event,object,handler,thisObj){
    object.unRegister(event,handler,thisObj);
}
/**
 * Register an event to the Controller. But only if the handler is not registerd for the
 * event yet.
 */
OpenLayersController.prototype.register = function (event,handler){
    var specificName = this.getSpecificEventName(event);
    if(this.events[specificName] == null){
        this.events[specificName] = new Array();
    }
    for (var i=0; i < this.events[specificName].length; i++){
        if(this.events[specificName][i]==handler){
            //alert("Handler >"+ handler + "< for event: "+specificName+" already registered");
            return;
        }
    }
    this.events[specificName].push(handler);
}
/**
 *All registerd handlers for event 'event' that equals 'handler' are removed as listener.
 *This is because you don't want duplication of the same handler and event. This will
 *result in multiple call of a handler on the same event.
 *@param event the event
 *@param handler the handler you want to remove
 */
OpenLayersController.prototype.unRegister = function (event,handler){
    var specificName = this.getSpecificEventName(event);
    var newEventHandlers=new Array();
    for (var i=0; i < this.events[specificName].length; i++){
        if(this.events[specificName][i]!=handler){
            newEventHandlers.push(this.events[specificName][i]);
        }
    }
    this.events[specificName]=newEventHandlers;
}

OpenLayersController.prototype.handleEvent = function(event){
    var handlers = this.events[event];
    for(var i = 0 ; i < handlers.length ; i++){
        var handler = handlers[i];
        handler();
    }
}

OpenLayersController.prototype.onMapTipHandler = function(data){
    //this is the Layer not the Controller
    var allMaptips="";
    for( var i = 0 ; i < data.features.length ; i++){
        var featureType=null;
        if (data.features[i].gml){
            featureType = data.features[i].gml.featureType;
        }else if (data.features[i].type){
            featureType = data.features[i].type;
        }
        var maptip=this.getMapTipByFeatureType(featureType);
        /*temp*/
        if (maptip==null){
            maptip=this.getMapTips()[0];
        }
        if (maptip!=null){
            var maptipField=maptip.mapTipField;
            for (var f in data.features[i].attributes){
                if (data.features[i].attributes[f]!=null)
                    maptipField=maptipField.replace("["+f+"]",data.features[i].attributes[f]);
            }
            if (!(maptipField.indexOf("[")>=0)){
                if (allMaptips.length!=0){
                    allMaptips+="<br/>";
                }
                allMaptips+=maptipField;
            }
        }
    }
    var maptipDiv=document.getElementById("olControlMapTip");
    if (allMaptips.length>0){
        if (maptipDiv==undefined){
            maptipDiv=document.createElement('div');
            maptipDiv.id="olControlMapTip";
            maptipDiv.style.position='absolute';
            data.object.map.div.appendChild(maptipDiv);
            maptipDiv.style.zIndex="10000";
            maptipDiv.className="olControlMaptip";
            var maptipText=document.createElement('div');
            maptipText.id='olControlMaptipText';
            maptipDiv.appendChild(maptipText);
        }
        maptipDiv.style.top=data.xy.y+"px";
        maptipDiv.style.left=data.xy.x+10+'px'
        maptipDiv.style.display="block";
        var maptipText=document.getElementById('olControlMaptipText');
        if (maptipText.innerHTML.length==0)
            maptipText.innerHTML=allMaptips;
        else{
            maptipText.innerHTML=maptipText.innerHTML+"<br/>"+allMaptips;
        }
    }
}
OpenLayersController.prototype.removeMaptip = function(object){
    var maptipDiv=document.getElementById("olControlMapTip");
    if (maptipDiv!=undefined){
        maptipDiv.style.display="none";
        var maptipText=document.getElementById('olControlMaptipText');
        maptipText.innerHTML="";
    }
}

OpenLayersController.prototype.onIdentifyDataHandler = function(data){
    var obj = new Object();
    for( var i = 0 ; i < data.features.length ; i++){
        var featureType = data.features[i].gml.featureType;
        if(obj[featureType] == undefined){
            obj [featureType] = new Array();
        }
        obj [featureType].push( data.features[i].attributes);
    }
    //get The identifyTool that is active to call the onIdentifyData handler
    var getFeatureTools=this.getToolsByType(Tool.GET_FEATURE_INFO);
    for (var i=0; i < getFeatureTools.length; i++){
        if (getFeatureTools[i].isActive()){
            getFeatureTools[i].getFeatureInfoHandler("onIdentifyData",obj);
            return;
        }
    }
}
// onIdentify event handling
OpenLayersController.prototype.onIdentifyHandler = function(extent){
    //get The identifyTool that is active to call the onIdentify handler
    var getFeatureTools=this.getToolsByType(Tool.GET_FEATURE_INFO);
    for (var i=0; i < getFeatureTools.length; i++){
        if (getFeatureTools[i].isActive()){
            var pix = extent.xy;
            var lonlat = webMapController.getMap().getFrameworkMap().getLonLatFromPixel(pix);
            var genericExtent = new Extent(lonlat.lon,lonlat.lat,lonlat.lon,lonlat.lat);
            getFeatureTools[i].beforeGetFeatureInfoHandler("onIdentify",genericExtent);
            return;
        }
    }
}

$(document).ready(function() {
    if( webMapController instanceof OpenLayersController){
        var specificName = webMapController.getSpecificEventName(Event.ON_CONFIG_COMPLETE);
        webMapController.handleEvent(specificName);
    }
});
 
/**
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

        if(webMapController.events[webMapController.getSpecificEventName(Event.ON_ALL_LAYERS_LOADING_COMPLETE)] != null){
            layer.register(Event.ON_LOADING_END,this.layerFinishedLoading);
            layer.register(Event.ON_LOADING_START,this.layerBeginLoading);
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
    
    if(event == Event.ON_ALL_LAYERS_LOADING_COMPLETE){
        var wmsLayers = this.getAllWMSLayers();
        for(var i = 0 ; i < wmsLayers.length ; i++){
            var layer = wmsLayers[i];
            layer.register(event,this.layerFinishedLoading);
            layer.register(Event.ON_LOADING_START,this.layerBeginLoading);
        }
        webMapController.register(Event.ON_ALL_LAYERS_LOADING_COMPLETE, handler);
    }else{
        //this.getFrameworkMap().eventListeners [specificName]= handler;        
        this.getFrameworkMap().events.register(specificName,thisObj,handler);
    }
}

OpenLayersMap.prototype.unRegister = function (event,handler,thisObj){
    var specificName = webMapController.getSpecificEventName(event);
    if (event == Event.ON_ALL_LAYERS_LOADING_COMPLETE){
        webMapController.unRegister(Event.ON_ALL_LAYERS_LOADING_COMPLETE, handler);
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
        webMapController.handleEvent(webMapController.eventList[Event.ON_ALL_LAYERS_LOADING_COMPLETE]);
    }else if (layersLoading < 0){
        layersLoading=0;
    }
}

OpenLayersMap.prototype.layerBeginLoading = function (id,data,c,d){
    layersLoading++;
}


function OpenLayersLayer(olLayerObject,id){
    if (!olLayerObject instanceof OpenLayers.Layer){
        throw("The given layer object is not of type 'OpenLayers.Layer'. But: "+olLayerObject);
    }
    Layer.call(this,olLayerObject,id);
}
OpenLayersLayer.prototype = new Layer();
OpenLayersLayer.prototype.constructor = OpenLayersLayer;

/**
     *see @link Layer.getOption
     */
OpenLayersLayer.prototype.getOption = function(optionKey){
    var lowerOptionKey=optionKey.toLowerCase();
    for (var key in this.getFrameworkLayer().options){
        if (key.toLowerCase()==lowerOptionKey){
            return this.getFrameworkLayer().options[key];
        }
    }
    for (var key in this.getFrameworkLayer().params){
        if (key.toLowerCase()==lowerOptionKey){
            return this.getFrameworkLayer().params[key];
        }
    }
    return null;
}
/**
     *see @link Layer.setOption
     */
OpenLayersLayer.prototype.setOption = function(optionKey,optionValue){
    var object=new Object();
    object[optionKey]= optionValue;
    this.getFrameworkLayer().setOptions(object);
}

/* Eventhandling for layers */
OpenLayersLayer.prototype.register = function (event,handler){
    var specificName = webMapController.getSpecificEventName(event);
    if(specificName == webMapController.eventList[Event.ON_FEATURE_ADDED]){
        if( webMapController.events[event] == undefined){
            webMapController.events[event] = new Object();
        }
        webMapController.events[event][this.getFrameworkLayer().id] = handler;
        this.getFrameworkLayer().events.register(specificName, this.getFrameworkLayer(), layerFeatureHandler);
    }else if(event == Event.ON_LOADING_START || event == Event.ON_LOADING_END){
        this.getFrameworkLayer().events.register(specificName, this, handler);
    }else{
        this.getFrameworkLayer().events.register(specificName, this.getFrameworkLayer(), handler);
    }
}

function layerFeatureHandler(obj){
    var id = obj.object.id;
    var eventName = webMapController.getGenericEventName(obj.type);
    var wkt = obj.feature.geometry.toString();
    var feature = new Feature(id,wkt);
    webMapController.events[eventName][id](id,feature);
}
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
function OpenLayersTMSLayer(olLayerObject,id){
    if (!olLayerObject instanceof OpenLayers.Layer.TMS){
        throw("The given layer object is not of type 'OpenLayers.Layer.WMS'. But: "+olLayerObject);
    }
    OpenLayersLayer.call(this,olLayerObject,id);
}
OpenLayersTMSLayer.prototype = new OpenLayersLayer();
OpenLayersTMSLayer.prototype.constructor= OpenLayersTMSLayer;


function OpenLayersImageLayer (olLayerObject, id){
    if (!olLayerObject instanceof OpenLayers.Layer.Image){
        throw("The given layer object is not of type 'OpenLayers.Layer.WMS'. But: "+olLayerObject);
    }
    OpenLayersLayer.call(this,olLayerObject,id);
}

OpenLayersImageLayer.prototype = new OpenLayersLayer();
OpenLayersImageLayer.prototype.constructor= OpenLayersImageLayer;

function OpenLayersTool(id,olControlObject,type,addToPanel){
    this.controls = new Array();
    this.onActiveHandler = new Object();
    Tool.call(this,id,olControlObject,type);
}
OpenLayersTool.prototype = new Tool();
OpenLayersTool.prototype.constructor= OpenLayersTool;

OpenLayersTool.prototype.register = function (event,handler){
    var specificName = webMapController.getSpecificEventName(event);
    if(this.type == Tool.BUTTON){
        this.getFrameworkTool().trigger= handler;
    }else if (this.type== Tool.CLICK){
        this.getFrameworkTool().handler.callbacks[specificName]= function (evt){
            var lonlat= this.map.getLonLatFromViewPortPx(evt.xy);
            handler.call(this,new Extent(lonlat.lat,lonlat.lon,lonlat.lat,lonlat.lon))
        };
    }else if(Event.ON_SET_TOOL == event){
        this.onActiveHandler = handler;
        this.getFrameworkTool().events.register(specificName,this,this.onSetActive);
    } else{
        this.getFrameworkTool().events.register(specificName,this.getFrameworkTool(),handler);
    }
}

OpenLayersTool.prototype.addControl = function(control){
    if (!(this.type == Tool.GET_FEATURE_INFO)){
        throw("The given Control object is not of type get feature info. But: "+this.type);
    }
    this.controls.push(control);
}

OpenLayersTool.prototype.getId = function(){
    return this.id;
}

OpenLayersTool.prototype.setVisible = function(visibility){
    if (visibility){
        this.getFrameworkTool().panel_div.style.display="block";
    }else{
        this.getFrameworkTool().panel_div.style.display="none";
    }
}

OpenLayersTool.prototype.isActive = function (){
    return this.getFrameworkTool().active;
}

OpenLayersTool.prototype.onSetActive = function(data){
    this.onActiveHandler(this.getId(),data);
}
/**
 *A identify tool
 */
function OpenLayersIdentifyTool(id,olControlObject,type){
    if (type!=Tool.GET_FEATURE_INFO){
        throw("OpenLayersIdentifyTool.constructor(): A OpenLayersIdentifyTool needs to be of type: Tool.GET_FEATURE_INFO");
    }
    this.getFeatureInfoHandler = new Object();
    this.beforeGetFeatureInfoHandler = new Object();
    OpenLayersTool.call(this,id,olControlObject,type);
}
OpenLayersIdentifyTool.prototype = new OpenLayersTool();
OpenLayersIdentifyTool.prototype.constructor= OpenLayersIdentifyTool;
/**
 *Set the getFeatureInfo handler
 **/
OpenLayersIdentifyTool.prototype.setGetFeatureInfoHandler = function(handler){    
    this.getFeatureInfoHandler = handler;
}
/**
 *Set the setBeforeGetFeatureInfoHandler handler
 **/
OpenLayersIdentifyTool.prototype.setBeforeGetFeatureInfoHandler = function(handler){
    this.beforeGetFeatureInfoHandler = handler;
}
function Utils(){
}
Utils.createBounds=function(extent){
    return new OpenLayers.Bounds(extent.minx,extent.miny,extent.maxx,extent.maxy);
}
Utils.createExtent=function(bounds){
    return new Extent(bounds.left,bounds.bottom,bounds.right,bounds.top);
}

OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
    button: null,

    defaultHandlerOptions: {
        'single': true,
        'double': true,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },
    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
        {}, this.defaultHandlerOptions
            );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
            );
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.onClick,
                'dblclick': this.onDblclick
            }, this.handlerOptions
            );
        var buttonOptions= {
            displayClass: this.displayClass + "Button",
            type: OpenLayers.Control.TYPE_TOOL
        };
        this.button= new OpenLayers.Control(buttonOptions);
        this.button.events.register("activate",this,this.activate);
        this.button.events.register("deactivate",this,this.deactivate);        
    },
    onClick: function(evt) {
    },

    onDblclick: function(evt) {
    }
});

/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 *
 * Class: OpenLayers.Control.LoadingPanel
 * In some applications, it makes sense to alert the user that something is
 * happening while tiles are loading. This control displays a div across the
 * map when this is going on.
 * SRC: http://svn.openlayers.org/addins/loadingPanel/trunk/
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: counter
     * {Integer} A counter for the number of layers loading
     */
    counter: 0,

    /**
     * Property: maximized
     * {Boolean} A boolean indicating whether or not the control is maximized
    */
    maximized: false,

    /**
     * Property: visible
     * {Boolean} A boolean indicating whether or not the control is visible
    */
    visible: true,

    /**
     * Constructor: OpenLayers.Control.LoadingPanel
     * Display a panel across the map that says 'loading'.
     *
     * Parameters:
     * options - {Object} additional options.
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Function: setVisible
     * Set the visibility of this control
     *
     * Parameters:
     * visible - {Boolean} should the control be visible or not?
    */
    setVisible: function(visible) {
        this.visible = visible;
        if (visible) {
            OpenLayers.Element.show(this.div);
        } else {
            OpenLayers.Element.hide(this.div);
        }
    },

    /**
     * Function: getVisible
     * Get the visibility of this control
     *
     * Returns:
     * {Boolean} the current visibility of this control
    */
    getVisible: function() {
        return this.visible;
    },

    /**
     * APIMethod: hide
     * Hide the loading panel control
    */
    hide: function() {
        this.setVisible(false);
    },

    /**
     * APIMethod: show
     * Show the loading panel control
    */
    show: function() {
        this.setVisible(true);
    },

    /**
     * APIMethod: toggle
     * Toggle the visibility of the loading panel control
    */
    toggle: function() {
        this.setVisible(!this.getVisible());
    },

    /**
     * Method: addLayer
     * Attach event handlers when new layer gets added to the map
     *
     * Parameters:
     * evt - {Event}
    */
    addLayer: function(evt) {
        if (evt.layer) {
            evt.layer.events.register('loadstart', this, this.increaseCounter);
            evt.layer.events.register('loadend', this, this.decreaseCounter);
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register('preaddlayer', this, this.addLayer);
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.events.register('loadstart', this, this.increaseCounter);
            layer.events.register('loadend', this, this.decreaseCounter);
        }
    },

    /**
     * Method: increaseCounter
     * Increase the counter and show control
    */
    increaseCounter: function() {
        this.counter++;
        if (this.counter > 0) {
            if (!this.maximized && this.visible) {
                this.maximizeControl();
            }
        }
    },

    /**
     * Method: decreaseCounter
     * Decrease the counter and hide the control if finished
    */
    decreaseCounter: function() {
        if (this.counter > 0) {
            this.counter--;
        }
        if (this.counter == 0) {
            if (this.maximized && this.visible) {
                this.minimizeControl();
            }
        }
    },

    /**
     * Method: draw
     * Create and return the element to be splashed over the map.
     */
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },

    /**
     * Method: minimizeControl
     * Set the display properties of the control to make it disappear.
     *
     * Parameters:
     * evt - {Event}
     */
    minimizeControl: function(evt) {
        this.div.style.display = "none";
        this.maximized = false;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: maximizeControl
     * Make the control visible.
     *
     * Parameters:
     * evt - {Event}
     */
    maximizeControl: function(evt) {
        this.div.style.display = "block";
        this.maximized = true;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister('preaddlayer', this, this.addLayer);
            if (this.map.layers) {
                for (var i = 0; i < this.map.layers.length; i++) {
                    var layer = this.map.layers[i];
                    layer.events.unregister('loadstart', this,
                        this.increaseCounter);
                    layer.events.unregister('loadend', this,
                        this.decreaseCounter);
                }
            }
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.LoadingPanel"

});

/**
 * The request function for WMSGetFeatureInfo redone, so that querylayers are properly set
 */
function doGetFeatureRequest(clickPosition, options) {
    var layers = this.findLayers();
    if(layers.length == 0) {
        this.events.triggerEvent("nogetfeatureinfo");
        // Reset the cursor.
        OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
        return;
    }

    options = options || {};
    if(this.drillDown === false) {
        var wmsOptions = this.buildWMSOptions(this.url, layers, clickPosition, layers[0].params.FORMAT);
        (wmsOptions["params"])["STYLES"] = "";
        (wmsOptions["params"])["QUERY_LAYERS"] = this.queryLayers.split(",");
        var request = OpenLayers.Request.GET(wmsOptions);

        if (options.hover === true) {
            this.hoverRequest = request;
        }
    } else {
        this._requestCount = 0;
        this._numRequests = 0;
        this.features = [];
        // group according to service url to combine requests
        var services = {}, url;
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var service, found = false;
            url = layer.url instanceof Array ? layer.url[0] : layer.url;
            if(url in services) {
                services[url].push(layer);
            } else {
                this._numRequests++;
                services[url] = [layer];
            }
        }
        var layers;
        for (var url in services) {
            layers = services[url];
            var wmsOptions = this.buildWMSOptions(url, layers,
                clickPosition, layers[0].params.FORMAT);
            OpenLayers.Request.GET(wmsOptions);
        }
    }
}