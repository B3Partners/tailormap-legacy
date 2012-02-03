/*JavaScript interface class file*/

/**
 * MapComponent
 * @class 
 * @constructor
 * @param viewerObject Het viewerObject
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.MapComponent",{
    extend: "Ext.util.Observable",
    eventList: new Array(),
    webMapMapComponent :null,
    maps: new Array(),
    tools : new Array(),
    events: new Array(),
    components: new Array(),
    panel : null,
    constructor :function (viewerObject){
     
       // this.eventList = new Array();
        this.addEvents(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE);
       // webMapMapComponent = this;
        //this.initConfig(config);
        return this;
    },
    getId : function() {
        return "flamingo";        
    },
    

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
    createWMSLayer : function(name, url, ogcParams,options){
        throw("MapComponent.createWMSLayer() Not implemented! Must be implemented in sub-class");
    },
    /**
    * @description Creates a OSGEO TMS layer.
    * @param id the id of the layer
    * @param name the showable name of the layer
    * @param url the url to the tms service
    * @param options extra options for this TMS layer
    * @returns Returns the TMSLayer
    */
    createTMSLayer : function (id,name,url, options){
        throw("MapComponent.createTMSLayer() Not implemented! Must be implemented in sub-class");
    },
    /**
    *Creates a Map object for this framework
    *@param id the id of the map
    *@param options extra options for the map
    *Must be implemented by subclass
    */
    createMap : function(id, options){
        throw("MapComponent.createMap(...) not implemented! Must be implemented in sub-class");
    },
    /**
    *Must be implemented by the sub-class
    *This creates a tool.
    */
    createTool: function (){
        throw("MapComponent.createTool(...) not implemented! Must be implemented in sub-class");
    },
    /**
     *Must be implemented by sub-class
     *Creates a new component
     */
    createComponent: function(){
        Ext.Error.raise({
            msg: "MapComponent.createComponent() not implemented! Must be implemented in the sub-class"
        });
    },
    /**
    *Add a array of Tool objects. For every tool .addTool is called.
    *@param tools Array of Tool objects
    */
    addTools : function (tools){
        for (var i=0; i < tools.length; i++){
            addTool(tools[i]);
        }
    },
    /**
    *Adds the given tool to the list of tools. Sub-class needs to implement this
    *and call super to do some frameworks specific things.
    *@param tool The tool that needs to be added of type Tool
    */
    addTool : function(tool){        
        if (!(tool instanceof viewer.viewercontroller.controller.Tool)){
            Ext.Error.raise({
                msg: "Given tool not of type 'Tool'",
                options: {tool: tool}
            });
            Ext.err();
        }
        this.tools.push(tool);
    },
    /**
    *Removes a tool from the list of tools. Sub-class needs to implement this
    *and call super to do some framework specific things.
    *@param tool The tool that needs to be removed.
    */
    removeTool : function (tool){
        if (!(tool instanceof viewer.viewercontroller.controller.Tool)){
            throw("Given tool not of type 'Tool'");
        }
        for (var i=0; i < this.tools; i++){
            if (this.tools[i]==tool){
                this.tools.splice(i,1);
                return;
            }
        }
    },

    /**
 * Helperfunction: Get a tool based on the given id
 * @param id The id of the Tool which must be retrieved
 **/
    getTool : function (id){
        for (var i = 0 ; i < this.tools.length ; i++){
            var tool = this.tools[i];
            if(tool.getId() == id){
                return tool;
            }
        }
        return null;
    },
    /**
 *Returns the tools that are added with type: type
 *@param type The type of the tools wanted
 *@return A array of tools with the given type (or a empty array when no tool is found)
 */
    getToolsByType : function(type){
        var foundTools=new Array();
        for(var i=0; i < this.tools.length; i++){
            if(this.tools[i].getType()==type){
                foundTools.push(this.tools[i]);
            }
        }
        return foundTools;
    },
    /**
 *Removes a tool based on the given id
 *Must be implemented by subclass
 * @param id Id of the which must be removed
 **/
    removeToolById : function (id){
        throw("MapComponent.removeToolById() Not implemented! Must be implemented in sub-class");
    },
    
    addComponent: function(component){
        if (!(tool instanceof viewer.viewercontroller.controller.Component)){
            Ext.Error.raise({
                msg: "Given tool not of type 'Tool'",
                options: {tool: tool}
            });
            Ext.err();
        }
        this.components.push(component);
    },

    /**
 *Add a map to the MapComponent
 *Must be implemented by subclass
 * @param mapObject The map which must be added to the MapComponent.
 **/    
    addMap : function (mapObject){
        throw("MapComponent.addMap() Not implemented! Must be implemented in sub-class");
    },
    /**
 *Gets the map with mapId
 *Must be implemented by subclass
 * @param mapId The id of the map which must be returned.
 */
    getMap : function (mapId){
        throw("MapComponent.getMap() Not implemented! Must be implemented in sub-class");
    },
    /**
 *Removes the given map from the MapComponent.
 *Must be implemented by subclass
 * @param removeMap The map which must be removed
 */
    removeMap : function (removeMap){
        throw("MapComponent.removeMap() Not implemented! Must be implemented in sub-class");
    },

    /**
 *Creates a drawable vectorlayer
 *Must be implemented by subclass
 * A vectorlayer is a layer on which features can be drawn by the user (a EditMap in Flamingo, a VectorLayer in OpenLayers)
 * @param name The name of this laye
 */
    createVectorLayer : function (name){
        throw("MapComponent.createVectorLayer() Not implemented! Must be implemented in sub-class");
    },
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
    createImageLayer : function (name,url, bounds, size,options){
        throw("MapComponent.createImageLayer() Not implemented! Must be implemented in sub-class");
    },

    /**
 * Creates a panel
 */
    createPanel : function (name){
        throw("MapComponent.createPanel() Not implemented! Must be implemented in sub-class");
    },
    /**
 * Registers a function with a given event on the given object
 * Must be implemented by subclass
 * @param event The generic name for the event. Possible values declared as Event.ON_EVENT, etc. See the constructor of this class for the complete list of events.
 * @param object The object on which the event has effect
 * @param handler The function to be called when event takes place. The function must have the following signature:
 * handlerFunction(id,params).
 *
 */
    registerEvent : function(event, object, handler){
        throw("MapComponent.registerEvent() Not implemented! Must be implemented in sub-class");
    },
    /**
 *Unregisters a event.
 *@param event is the event that needs to be unregisterd
 *@param object is the object on which the event must be unregisterd.
 */
    unRegisterEvent : function (event, object){
        throw("MapComponent.unRegisterEvent() Not implemented! Must be implemented in sub-class");
    },
 
    /**
 * Entrypoint for all the fired events.
 * Must be implemented by subclass
 * @param event The event to be handled
 */
    handleEvents : function(event){
        throw("MapComponent.handleEvents() Not implemented! Must be implemented in sub-class");
    },

    /**
 * Initialize all the MapComponent specific events.
 */
    initEvents : function(){
        throw("MapComponent.initEvent() Not implemented! Must be implemented in sub-class");
    },

    /**
 * Gets the generic name for the specified specific eventname. Throws exception if specific name does not exist.
 * @param specific The specific name
 * @return The generic name.
 */
    getGenericEventName : function (specific){
        //  console.log(specific);
        if (this.eventList.length==0){
            this.initEvents();
        }
        for( var key in this.eventList){
            if(this.eventList[key] == specific){
                return key;
            }
        }
        throw("Event " + specific + " does not exist!");
    },

    /**
 * Gets the specific name for the specified generic eventname. null or undefined if generic name does not exist.
 * @param generic The generic name
 * @return The specific name.
 */
    getSpecificEventName : function (generic){
        return this.eventList[generic];
    },

    /**
 * Activates the tool
 * @param id Id of the tool to be activated
 */
    activateTool : function (id){
        throw("MapComponent.activateTool() Not implemented! Must be implemented in sub-class");
    }

});
