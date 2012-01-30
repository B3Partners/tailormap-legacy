/**
 * @class 
 * @constructur
 * @augments MapComponent
 * @description MapComponent subclass for Flamingo
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 **/
Ext.define("viewer.viewercontroller.FlamingoMapComponent",{
    extend: "viewer.viewercontroller.MapComponent",
    viewerObject : null,
    constructor :function (domId){
        var so = new SWFObject( contextPath + "/flamingo/flamingo.swf?config=config.xml", "flamingo", "100%", "100%", "8", "#FFFFFF");
        so.addParam("wmode", "transparent");
        so.write(domId);
        this.viewerObject = document.getElementById("flamingo");
        return this;
    },
    /**
     * Initialize the events. These events are specific for flamingo.
     */
    initEvents : function(){
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_DOWN]              	= "onEvent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_UP]                	= "onEvent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_CAPABILITIES]        	= "onGetCapabilities";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE]         	= "onConfigComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED]		= "onGeometryDrawFinished";
        this.eventList[viewer.viewercontroller.controller.Event.ON_REQUEST]			= "onRequest";
        this.eventList[viewer.viewercontroller.controller.Event.ON_SET_TOOL]                   = "onSetTool";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO]		= "onIdentify";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA]	= "onIdentifyData";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE] = "onUpdateComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT]     = "onReallyChangedExtent";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT]              = "onChangeExtent";

    },
    /**
     *Creates a Openlayers.Map object for this framework. See the openlayers.map docs
     *@param id the id of the map that is configured in the configuration xml
     *@param options Options for the map
     *@returns a FlamingoMapComponent
     */
    createMap : function(id,options){
        var config = {
            id: id
        };
        var map = new viewer.viewercontroller.flamingo.FlamingoMap(config);
        var maxExtent = options["maxExtent"];
        // map.setMaxExtent(maxExtent);
        return map;
    },
    /**
     *See @link MapComponent.createWMSLayer
     */
    createWMSLayer : function(name, url,ogcParams,options){
        var object=new Object();
        object["name"]=name;
        object["url"]=url;
        var ide=null;
        for (var key in ogcParams){
            object[key]=ogcParams[key];
        }
        for (var key in options){
            if (key.toLowerCase()=="id"){
                ide=options[key];
            }else{
                object[key]=options[key];
            }
        }
        if(ide == null){
            ide = name;
        }
        var config = {
            id: ide,
            options: object,
            frameworkObject : new Object() //this.viewerObject
        };
        return new viewer.viewercontroller.flamingo.FlamingoWMSLayer(config);
    },
    createArcIMSLayer : function(name,server,servlet,mapservice,ogcParams,options){
        var object=new Object();
        object["name"]=name;
        object["server"]=server;
        object["servlet"]=servlet;
        object["mapservice"]=mapservice;
        var ide=null;
    
        for (var key in ogcParams){
            object[key]=ogcParams[key];
        }
        for (var key in options){
            if (key.toLowerCase()=="id"){
                ide=options[key];
            }else{
                object[key]=options[key];
            }
        }
        var config ={
            id: ide,
            options: object
        };
        return new viewer.viewercontroller.flamingo.FlamingoArcIMSLayer(config);
    },
    /**
     * See @link MapComponent.createTool
     * TODO: make the parameter layer part of the options. 
     */
    createTool: function (ide,type,options){
    
        // aaron = new FlamingoTool({id:"aapnootmis",frameworkObject: this});
        var config = {
            id: ide,
            frameworkObject: new Object() //this.viewerObject
        };
        var tool = new viewer.viewercontroller.flamingo.FlamingoTool(config);
        if(type == Tool.GET_FEATURE_INFO){
            webMapController.registerEvent(viewer.viewercontroller.controller.ON_GET_FEATURE_INFO, webMapController.getMap(), options["handlerBeforeGetFeatureHandler"]);
            webMapController.registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, webMapController.getMap(), options["handlerGetFeatureHandler"]);
        }
        return tool;
    },
    /**
     * See @link MapComponent.createVectorLayer
     */
    createVectorLayer : function (identification){
        var config = {
            id:identification,
            frameworkObject: new Object()
        };
        return new viewer.viewercontroller.flamingo.FlamingoVectorLayer(config);
    },
    /**
     * See @link MapComponent.createPanel
     */
    createPanel : function (name){
        this.panel = name;
    },
    /**
     *See @link MapComponent.addTool
     */
    addTool : function(tool){
        if (!(tool instanceof viewer.viewercontroller.flamingo.FlamingoTool)){
            throw("The given tool is not of type 'FlamingoTool'");
        }
        this.viewerObject.callMethod(tool.getId(),'setVisible',true);
        MapComponent.prototype.addTool.call(this,tool);
    },
    /**
     *See @link MapComponent.activateTool
     */
    activateTool : function (id){
        this.viewerObject.call(this.panel, "setTool", id);
    },
    /**
     *See @link MapComponent.removeTool
     */
    removeTool : function (tool){
        if (!(tool instanceof viewer.viewercontroller.flamingo.FlamingoTool)){
            throw("The given tool is not of type 'FlamingoTool'");
        }
        this.viewerObject.callMethod(tool.getId(),'setVisible',false);
        MapComponent.prototype.removeTool.call(this,tool);
    },
    /**
     *Add a map to the MapComponent.
     *For know only 1 map supported.
     */
    addMap : function (map){
        if (!(map instanceof viewer.viewercontroller.flamingo.FlamingoMap)){
            throw("FlamingoMapComponent.addMap(): The given map is not of the type 'FlamingoMap'");
        }
        this.maps.push(map);
    },
    /**
     * See @link MapComponent.removeToolById
     */
    removeToolById : function (id){
        var tool = this.getTool(id);
        if(tool == null || !(tool instanceof viewer.viewercontroller.flamingo.FlamingoTool)){
            throw("The given tool is not of type 'FlamingoTool' or the given id does not exist");
        }
        this.removeTool(tool);
    },
    /**
     *Get the map by id. If no id is given and 1 map is available that map wil be returned
     *@param mapId the mapId
     *@returns the Map with the id, or the only map.
     */
    getMap : function (mapId){
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
        return null;
        //throw("FlamingoMapComponent.getMap(): Map with id: "+mapId+" not found! Available maps: "+availableMaps);
    },
    /****************************************************************Event handling***********************************************************/

    /**
     * Registers an event to a handler, on a object. Flamingo doesn't implement per component eventhandling,
     * so this MapComponent stores the event in one big array.
     * This array is a two-dimensional array: the first index is the eventname (the generic one! Actually, not a name, but the given id).
     * The second index is the id of the object. 
     */
    registerEvent : function (event,object,handler){
        if(object instanceof Ext.util.Observable){
            if(object == this){
                this.addListener(event,handler);
            }else{
                object.registerEvent(event,handler);
            }
        }else{
            alert("Unmapped event:",event);
            if( this.events[event] == undefined){
                this.events[event] = new Object();
            }
        
            if (this.events[event][object.getId()]==undefined){
                this.events[event][object.getId()]=new Array();
            }
            this.events[event][object.getId()].push(handler);
        }
    },
    /**
     *Unregister the event @link see MapComponent.unRegisterEvent
     */
    unRegisterEvent : function (event,object,handler){
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
    
    },
    getObject : function(name){
        if( name instanceof Array){
            name = name[0];
        }
    
        if(this.getMap(name)!= null){
            return this.getMap(name);
        }else if( this.getMap().getLayer( (name.replace(this.getMap().getId() + "_" ,""))) != null){
        
            return this.getMap().getLayer( (name.replace(this.getMap().getId() + "_" ,"")));
        }else if(this.getTool(name) != null){
            return this.getTool(name);
        }else if(name == this.getId()){
            return this;
        }else{
            return null;
        }
    },
    /**
     * Handles all the events. This function retrieves the function registered to this event.
     * Flamingo doesn't understand per object eventhandling, but instead it fires an event, with a id of the object (and a bunch of parameters).
     * In this function we translate the events to per object events, and more specific events (button up/down)
     */
    handleEvents : function (event, component){
        var id = component[0];
        // onEvent is a general event, fired when a jsButton is hovered over, pressed or released. Here we specify which it was.
        if(event == "onEvent"){
            if(component[1]["down"]){
                event = viewer.viewercontroller.controller.Event.ON_EVENT_DOWN;
            }else{
                // TODO: specify more events. This is not ONLY ON_EVENT_UP, but also hover.
                event = viewer.viewercontroller.controller.Event.ON_EVENT_UP;
            }
        }else{
            // Translate the specific name to the generic name. 
            event = this.getGenericEventName(event);
        }
        if (event==viewer.viewercontroller.controller.Event.ON_REQUEST){
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
        }else if(event==viewer.viewercontroller.controller.Event.ON_SET_TOOL){
            //onchange tool is called for a tool group but event is registerd on the MapComponent
            id=this.getId();
        }else{
            if(event == viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED){
                // Make sure "component" is the drawn feature
                var feature = new viewer.viewercontroller.controller.Feature(id,component[1]);
                component = feature;
            }else if( event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO){
                component = component[1];
            }else if( event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA){
                component = component[2];
            }
        }
    
        var object = this.getObject(id);
        if(object != undefined){
            object.fire(event);
        }
    },
    fire : function (event,options){
        this.fireEvent (event,this,options);
    }

    /**
     * Entrypoint for flamingoevents. This function propagates the events to the webMapController (handleEvents).
     */
    
});

function dispatchEventJS(event, comp) {
        if(comp [0]== null){
            comp[0] = viewerController.wmc.getId();
            comp[1] = new Object();
        }
        viewerController.wmc.handleEvents(event,comp);
    }