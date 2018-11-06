/*JavaScript interface class file*/

/* global Ext, viewer, i18next */

/**
 * MapComponent
 * @class 
 * 
 * @param viewerObject Het viewerObject
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.MapComponent",{
    extend: "Ext.util.Observable",
    eventList: null,
    maps: null,
    tools : null,
    events: null,
    components: null,
    panel : null,    
    viewerController: null,
    config:{
        resolutions : null,
        projection:null,
        id: null
    },
    /**
     * Construct a map component
     * @param viewerController the viewerController
     * @param domId id of the dom where this map component must be added
     * @param {Object} config a config object having:
     *        config.resolutions a array of resolutions for the map
     * @constructor
     */    
    constructor :function (viewerController,domId,config){
        //init values
        viewer.viewercontroller.MapComponent.superclass.constructor.call(this, config);
        this.eventList={};
        this.maps=[];
        this.tools=[];
        this.events=[];
        this.components=[];
        //init the config
        this.initConfig(config);
        this.initEvents();
        this.viewerController=viewerController;
        return this;
    },
       
    /**
    * Creates a Map object for this framework. Must be implemented by subclass.
    * @param id the id of the map
    * @param {Object} options extra options for the map, having:
    *       options.startExtent the starting extent (viewer.viewercontroller.controller.Extent) of the map
    *       options.maxExtent the max extent (viewer.viewercontroller.controller.Extent) of the map
    *
    */
    createMap : function(id, options){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_0')});
    },
    /*
    *Create functions. SubClass needs to implement these so the user can
    *create Framework specific objects.
    */

    /**
    *Creates a layer for this framework, Must be implemented by subclass
    *@param name the showable name of the layer
    *@param url the url to the serviceProvider
    *@param ogcParams the params that are used in the OGC-WMS request
    *@param options extra options for this wms layer
    *
    */
    createWMSLayer : function(name, url, ogcParams,options){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_1')});
    },
    /**
    * @description Creates a OSGEO TMS layer.
    * @param name the showable name of the layer
    * @param url the url to the tms service
    * @param {Object} options extra options for this tiling layer, having:
    *         options.tileHeight the tile height,
    *         options.tileWidth the tile width,
    *         options.serviceEnvelop the envelope of the service,
    *         options.resolutions the resolutions of this service,
    *         options.protocol tiling protocol
    * @returns  the TilingLayer
    */
    createTilingLayer : function (id,name,url, options){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_2')});
    },    
    /**
    * @description Creates a Arc IMS layer.
    * @param id the id of the layer
    * @param name the showable name of the layer
    * @param url the url to the tms service
    * @param options extra options for this TMS layer
    * @returns Returns the ArcIMSLayer
    */
    createArcIMSLayer: function(){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_3')});
    },      
    /**
    * @description Creates a Arc Server layer.
    * @param name the showable name of the layer
    * @param url the url to the ArcGis service
    * @param options extra options for this layer
    * @param viewerController the viewerController
    * @returns Returns the ArcServerLayer
    */
    createArcServerLayer : function(name,url,options,viewerController){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_4')});
    },   
    /**
    *Creates a layer of an image
    *Must be implemented by subclass
    * A vectorlayer is a layer on which features can be drawn by the user (a EditMap in Flamingo, a VectorLayer in OpenLayers)
    * @param name The name of this layer
    * @param url The url of the image
    * @param bounds The boundary of the layer as a viewer.viewercontroller.controller.Extent object
    * @param size The size of the image
    * @param options Hashtable of extra options to tag onto the layer
    */
    createImageLayer : function (name,url, bounds, size,options){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_5')});
    }, 
    /**
    *Creates a drawable vectorlayer
    *Must be implemented by subclass
    * A vectorlayer is a layer on which features can be drawn by the user (a EditMap in Flamingo, a VectorLayer in OpenLayers)
    * @param name The name of this layer
    */
    createVectorLayer : function (name){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_6')});
    },
    /**
    *Must be implemented by the sub-class, Create a tool.
    *
    * @param {Object} conf: the options used for initializing the Tool, having:
    *        conf.id the id
    *        conf.type the type tool @see viewer.viewercontroller.controller.Tool#statics
    *        conf.tooltip the tooltip for this tool
    *        conf.iconUrl_up overwrite (or set if not available for the tool type) the icon url for the up state of the control
    *        conf.iconUrl_over  overwrite (or set if not available for the tool type) the icon url for the over state of the control
    *        conf.iconUrl_sel overwrite (or set if not available for the tool type) the icon url for the selected state of the control
    *        conf.iconUrl_dis overwrite (or set if not available for the tool type) the icon url for the disabled state of the control
    * @return object of type: viewer.viewercontroller.controller.Tool
    */
    createTool: function (conf){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_7')});
    },
    /**
     *Must be implemented by sub-class
     *Creates a new component
     */
    createComponent: function(){
        Ext.Error.raise({
            msg: i18next.t('viewer_viewercontroller_mapcomponent_8')
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
                msg: i18next.t('viewer_viewercontroller_mapcomponent_9'),
                options: {tool: tool}
            });
            Ext.err();
        }
        tool.mapComponent=this;
        this.tools.push(tool);
    },
    /**
    *Removes a tool from the list of tools. Sub-class needs to implement this
    *and call super to do some framework specific things.
    *@param tool The tool that needs to be removed.
    */
    removeTool : function (tool){
        if (!(tool instanceof viewer.viewercontroller.controller.Tool)){
            Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_10')});
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
     * Return a array of tool object
     * @return [{Tool}]
     */
    getTools: function(){
        return this.tools;
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
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_11')});
    },
    
    addComponent: function(component){
        if (!(component instanceof viewer.viewercontroller.controller.Component)){
            Ext.Error.raise({
                msg: i18next.t('viewer_viewercontroller_mapcomponent_12'),
                options: {tool: component}
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
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_13')});
    },
    /**
 *Gets the map with mapId
 *Must be implemented by subclass
 * @param mapId The id of the map which must be returned.
 */
    getMap : function (mapId){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_14')});
    },
    /**
 *Removes the given map from the MapComponent.
 *Must be implemented by subclass
 * @param removeMap The map which must be removed
 */
    removeMap : function (removeMap){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_15')});
    },

    /**
 * Entrypoint for all the fired events.
 * Must be implemented by subclass
 * @param event The event to be handled
 */
    handleEvents : function(event){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_16')});
    },

    /**
 * Initialize all the MapComponent specific events.
 */
    initEvents : function(){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_17')});
    },

    /**
 * Gets the generic name for the specified specific eventname. Throws exception if specific name does not exist.
 * @param specific The specific name
 * @return The generic name.
 */
    getGenericEventName : function (specific){
        if (specific==undefined || specific==null){
            return null;
        }
        //console.log(specific);
        if (this.eventList.length==0){
            this.initEvents();
        }
        for( var key in this.eventList){
            if(this.eventList.hasOwnProperty(key)) {
                if(this.eventList[key] == specific){
                    return key;
                }
            }
        }
        return null;
        //Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_18') + specific + " does not exist!");
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
    activateTool : function (id,firstIfNull){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_19')});
    },
    /**
     * Deactivate all tools
     * @return list of tools that where active
     */
    deactivateTools : function (){
        var activeTools=[];
        for (var i=0 ; i < this.tools.length; i++){
            if (this.tools[i].isActive()){
                activeTools.push(this.tools[i]);
            }
            this.tools[i].deactivate();
        }
        return activeTools;
    },     
    /**
     * Get the width of this component
     * @return width in pixels.
     */
    getWidth : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_20')});
    },
    /**
     * Get the height of this component
     * @return height in pixels.
     */    
    getHeight: function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_21')});
    },
    /**
     * Set the cursor on map
     * @param boolean show turn it on or off
     * @param string cursor the name of the cursor
     */
    setCursor :function(show, cursor){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_mapcomponent_22')});
    }
});
