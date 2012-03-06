/**
 * @class 
 * @constructor
 * @description The class for controls 
 * @param id The id of the tool
 * @param frameworkObject The frameworkspecific object, to store as a reference
 * @param type The type of tool to be created
 */
Ext.define("viewer.viewercontroller.controller.Tool",{
    extend: "viewer.components.Component",
    statics:{
        // The different types of tools
        DRAW_FEATURE               : 0,
        NAVIGATION_HISTORY         : 1,
        ZOOMIN_BOX                 : 2,
        ZOOMOUT_BOX                : 3,
        PAN                        : 4,
        SUPERPAN                   : 5,
        BUTTON                     : 6,
        TOGGLE                     : 7,
        CLICK                      : 8,
        LOADING_BAR                : 9,
        GET_FEATURE_INFO           : 10,
        MEASURE                    : 11,
        SCALEBAR                   : 12,
        ZOOM_BAR                   : 13,
        LAYER_SWITCH               : 14,
        DEFAULT                    : 15,

        DRAW_FEATURE_POINT         : 16,
        DRAW_FEATURE_LINE          : 17,
        DRAW_FEATURE_POLYGON       : 18,
        PREVIOUS_EXTENT            : 19,
        NEXT_EXTENT                : 20,
        FULL_EXTENT                : 21
    },
    tool: null,    
    mapComponent: null,
    events: [],
    config :{
        id: "id",
        frameworkObject: new Object(),
        type: -1
    },
    constructor: function (config){
        this.initConfig(config);
        this.addEvents(viewer.viewercontroller.controller.Event.ON_CLICK,viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,viewer.viewercontroller.controller.Event.ON_EVENT_UP);
        return this;
    },
    /**
     * Init the tool and add it to the mapcomponent
     */
    initTool: function(conf){ 
        //MapComponent is working with ids instead of names
        conf.id=this.name;
        //Let the Mapcomponent create the specific tool
        tool = viewerController.mapComponent.createTool(conf);   
        if (tool==null){
            throw new Error("Tool not initialized! Initialize the tool before the addTool");            
        }
        //Add the tool
        viewerController.mapComponent.addTool(tool);
    },
    fire : function (event,options){
        this.fireEvent(event,this,options);
    },

    registerEvent : function (event,handler){
        this.addListener(event,handler);
    },
    getFrameworkTool : function(){
        return this.frameworkTool;
    },

    getType : function(){
        return this.type;
    },

    getId : function(){
        return this.id;
    },

    setVisible : function(){
        Ext.Error.raise({msg: "Tool.setVisible() not implemented! Must be implemented in sub-class"});
    },

    isActive : function(){
        Ext.Error.raise({msg: "Tool.isActive() not implemented! Must be implemented in sub-class"});
    }
});
