/**
 * @class 
 * @constructor
 * @description The class for controls 
 * @param id The id of the tool
 * @param frameworkObject The frameworkspecific object, to store as a reference
 * @param type The type of tool to be created
 */
Ext.define("viewer.viewercontroller.controller.Tool",{
    statics:{
        // The different types of tools
        NAVIGATION_HISTORY         : 1,
        ZOOMIN_BOX                 : 2,
        ZOOMOUT_BOX                : 3,
        PAN                        : 4,
        SUPERPAN                   : 5,        
        GET_FEATURE_INFO           : 10,
        MEASURE                    : 11,
        ZOOM_BAR                   : 13,
        DEFAULT                    : 15,

        PREVIOUS_EXTENT            : 19,
        NEXT_EXTENT                : 20,
        FULL_EXTENT                : 21,
        MAP_CLICK                  : 22
    },
    tool: null,    
    mapComponent: null,
    events: null,
    config :{
        id: null,
        frameworkObject: null,
        visible: true,
        type: null
    },
    constructor: function (config){
        this.initConfig(config);
        return this;
    },
    /**
     * Returns the framework object
     * @deprecated use getFrameworkObject
     */
    getFrameworkTool : function(){
        return this.frameworkObject;
    },
    
    getId : function(){
        return this.id;
    },

    setToolVisible : function(){
        Ext.Error.raise({msg: "Tool.setVisible() not implemented! Must be implemented in sub-class"});
    },

    isActive : function(){
        Ext.Error.raise({msg: "Tool.isActive() not implemented! Must be implemented in sub-class"});
    }
});
