/**
 *Controller subclass for Flamingo
 **/
function FlamingoController(domId){
    var so = new SWFObject("flamingo/flamingo.swf?config=/config.xml", "flamingo", "100%", "100%", "8", "#FFFFFF");
    so.addParam("wmode", "transparent");
    so.write(domId);
    this.viewerObject = document.getElementById("flamingo");
    
    Controller.call(this,domId);
}
//extends Controller
FlamingoController.prototype = new Controller();
FlamingoController.prototype.constructor=FlamingoController;

/**
* Initialize the events. These events are specific for flamingo.
*/
FlamingoController.prototype.initEvents = function(){
    this.eventList[Event.ON_EVENT_DOWN]              	= "onEvent";
    this.eventList[Event.ON_EVENT_UP]                	= "onEvent";
    this.eventList[Event.ON_GET_CAPABILITIES]        	= "onGetCapabilities";
    this.eventList[Event.ON_CONFIG_COMPLETE]         	= "onConfigComplete";
    this.eventList[Event.ON_FEATURE_ADDED]		= "onGeometryDrawFinished";
    this.eventList[Event.ON_REQUEST]			= "onRequest";
    this.eventList[Event.ON_SET_TOOL]                   = "onSetTool";
    this.eventList[Event.ON_GET_FEATURE_INFO]		= "onIdentify";
    this.eventList[Event.ON_GET_FEATURE_INFO_DATA]	= "onIdentifyData";
    this.eventList[Event.ON_ALL_LAYERS_LOADING_COMPLETE] = "onUpdateComplete";
    this.eventList[Event.ON_FINISHED_CHANGE_EXTENT]     = "onReallyChangedExtent";
    this.eventList[Event.ON_CHANGE_EXTENT]              = "onChangeExtent";

}

/**
*Creates a Openlayers.Map object for this framework. See the openlayers.map docs
*@param id the id of the map that is configured in the configuration xml
*@param options Options for the map
*@returns a FlamingoController
*/
FlamingoController.prototype.createMap = function(id,options){
    var map = new FlamingoMap(id,this.viewerObject);
    var maxExtent = options["maxExtent"];
   // map.setMaxExtent(maxExtent);
    return map;
}

/**
*See @link Controller.createWMSLayer
*/
FlamingoController.prototype.createWMSLayer = function(name, url,ogcParams,options){
    var object=new Object();
    object["name"]=name;
    object["url"]=url;
    var id=null;
    for (var key in ogcParams){
        object[key]=ogcParams[key];
    }
    for (var key in options){
        if (key.toLowerCase()=="id"){
            id=options[key];
        }else{
            object[key]=options[key];
        }
    }
    return new FlamingoWMSLayer(id,object,this.viewerObject);
}
/**
* See @link Controller.createTool
* TODO: make the parameter layer part of the options. 
*/
FlamingoController.prototype.createTool= function (id,type,options){
    var tool = new FlamingoTool(id,this.viewerObject);
    if(type == Tool.GET_FEATURE_INFO){
        webMapController.registerEvent(Event.ON_GET_FEATURE_INFO, webMapController.getMap(), options["handlerBeforeGetFeatureHandler"]);
        webMapController.registerEvent(Event.ON_GET_FEATURE_INFO_DATA, webMapController.getMap(), options["handlerGetFeatureHandler"]);
    }
    return tool;
}

/**
* See @link Controller.createVectorLayer
*/
FlamingoController.prototype.createVectorLayer = function (id){
    return new FlamingoVectorLayer(id,this.viewerObject);
}

/**
* See @link Controller.createPanel
*/
FlamingoController.prototype.createPanel = function (name){
    this.panel = name;
}
/**
*See @link Controller.addTool
*/
FlamingoController.prototype.addTool = function(tool){
    if (!(tool instanceof FlamingoTool)){
        throw("The given tool is not of type 'FlamingoTool'");
    }
    this.viewerObject.callMethod(tool.getId(),'setVisible',true);
    Controller.prototype.addTool.call(this,tool);
}

/**
*See @link Controller.activateTool
*/
FlamingoController.prototype.activateTool = function (id){
    this.viewerObject.call(this.panel, "setTool", id);
}

/**
*See @link Controller.removeTool
*/
FlamingoController.prototype.removeTool = function (tool){
    if (!(tool instanceof FlamingoTool)){
        throw("The given tool is not of type 'FlamingoTool'");
    }
    this.viewerObject.callMethod(tool.getId(),'setVisible',false);
    Controller.prototype.removeTool.call(this,tool);
}
/**
*Add a map to the controller.
*For know only 1 map supported.
*/
FlamingoController.prototype.addMap = function (map){
    if (!(map instanceof FlamingoMap)){
        throw("FlamingoController.addMap(): The given map is not of the type 'FlamingoMap'");
    }
    this.maps.push(map);
}

/**
* See @link Controller.removeToolById
*/
FlamingoController.prototype.removeToolById = function (id){
    var tool = this.getTool(id);
    if(tool == null || !(tool instanceof FlamingoTool)){
        throw("The given tool is not of type 'FlamingoTool' or the given id does not exist");
    }
    this.removeTool(tool);
}

/**
*Get the map by id. If no id is given and 1 map is available that map wil be returned
*@param mapId the mapId
*@returns the Map with the id, or the only map.
*/
FlamingoController.prototype.getMap = function (mapId){
    if (mapId==undefined && this.maps.length==1){
        return this.maps[0];
    }
    var availableMaps="";
    for (var i=0; i < this.maps.length; i++){
        if (i!=0)
            availableMaps+=",";
        availableMaps+=this.maps[i].getId();
        if (this.maps[i].getId()==mapId){
            return this.maps[i];
        }
    }
    throw("FlamingoController.getMap(): Map with id: "+mapId+" not found! Available maps: "+availableMaps);
}

/****************************************************************Event handling***********************************************************/

/**
 * Registers an event to a handler, on a object. Flamingo doesn't implement per component eventhandling,
 * so this controller stores the event in one big array.
 * This array is a two-dimensional array: the first index is the eventname (the generic one! Actually, not a name, but the given id).
 * The second index is the id of the object. 
 */
FlamingoController.prototype.registerEvent = function (event,object,handler){
    if( this.events[event] == undefined){
        this.events[event] = new Object();
    }
    if (this.events[event][object.getId()]==undefined){
        this.events[event][object.getId()]=new Array();
    }
    this.events[event][object.getId()].push(handler);
}
/**
 *Unregister the event @link see Controller.unRegisterEvent
 */
FlamingoController.prototype.unRegisterEvent = function (event,object,handler){
    var newHandlerArray=new Array();
    for (var i=0; i < this.events[event][object.getId()].length; i++){
        if (handler != this.events[event][object.getId()][i]){
            newHandlerArray.push(this.events[event][object.getId()][i]);
        }
    }    
    if (newHandlerArray.length==0){
        delete this.events[event][object.getId()];
    }else{
        this.events[event][object.getId()]=newHandlerArray;
    }
    
}
/**
 * Handles all the events. This function retrieves the function registered to this event.
 * Flamingo doesn't understand per object eventhandling, but instead it fires an event, with a id of the object (and a bunch of parameters).
 * In this function we translate the events to per object events, and more specific events (button up/down)
 */
FlamingoController.prototype.handleEvents = function (event, component){
    var id = component[0];
    // onEvent is a general event, fired when a jsButton is hovered over, pressed or released. Here we specify which it was.
    if(event == "onEvent"){
        if(component[1]["down"]){
            event = Event.ON_EVENT_DOWN;
        }else{
            // TODO: specify more events. This is not ONLY ON_EVENT_UP, but also hover.
            event = Event.ON_EVENT_UP;
        }
    }else{
        // Translate the specific name to the generic name. 
        event = this.getGenericEventName(event);
    }
    if (event==Event.ON_REQUEST){
        var obj=component[2];
        if (obj.requesttype=="GetMap"){
            var tokens = component[0].split("_");

            /* TODO kijken of we de functie kunnen uitbreiden zodat dit werkt met meer
             * dan 3 tokens en of dat nut heeft. Kun je weten aan de hand van aantal tokens
             * om wat voor layer het gaat ? */
            if (tokens.length == 2){
                this.getMap(tokens[0]).getLayer(tokens[1]).setURL(obj.url);
            }
            
            if (tokens.length == 3){
                this.getMap(tokens[0]).getLayer(tokens[1]+"_"+tokens[2]).setURL(obj.url);
            }
        }        
    }else if(event==Event.ON_SET_TOOL){
        //onchange tool is called for a tool group but event is registerd on the controller
        id=component[1];
    }else{
        if(event == Event.ON_FEATURE_ADDED){
            // Make sure "component" is the drawn feature
            var feature = new Feature(id,component[1]);
            component = feature;
        }else if( event == Event.ON_GET_FEATURE_INFO){
            component = component[1];
        }else if( event == Event.ON_GET_FEATURE_INFO_DATA){
            component = component[2];
        }
    }
    for (var i=0; i < this.events[event][id].length; i++){
        this.events[event][id][i](id,component);
    }
}

/**
 * Entrypoint for flamingoevents. This function propagates the events to the webMapController (handleEvents).
 */
function dispatchEventJS(event, comp) {
    if(comp [0]== null){
        comp[0] = webMapController.getId();
        comp[1] = new Object();
    }
    
    webMapController.handleEvents(event,comp);
}
