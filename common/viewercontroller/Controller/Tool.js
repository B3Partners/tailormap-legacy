/**
 * @class 
 * @constructor
 * @description The class for controls 
 * @param id The id of the tool
 * @param frameworkObject The frameworkspecific object, to store as a reference
 * @param type The type of tool to be created
 */
Ext.define("Tool",{
    extend: "Ext.util.Observable",
    events: [],
    config :{
        id: "id",
        frameworkObject: new Object()
    },
    constructor: function (config/*id,frameworkObject,type*/){
        /* this.id=id;
       this.frameworkTool=frameworkObject;
        this.type=type;*/
        this.initConfig(config);
        this.addEvents(Event.ON_CLICK,Event.ON_EVENT_DOWN,Event.ON_EVENT_UP);
        return this;
    },
    
    fire : function (event,options){
        this.fireEvent(event,this,options);
    },

    registerEvent : function (event,handler){
        this.addListener(event,handler);
    },
    statics:{
        // The different types of tools
        DRAW_FEATURE               : 0,
        NAVIGATION_HISTORY         : 1,
        ZOOM_BOX                   : 2,
        PAN                        : 3,
        BUTTON                     : 4,
        TOGGLE                     : 5,
        CLICK                      : 6,
        LOADING_BAR                : 7,
        GET_FEATURE_INFO           : 8,
        MEASURE                    : 9,
        SCALEBAR                   : 10,
        ZOOM_BAR                   : 11,
        LAYER_SWITCH               : 12,

        DRAW_FEATURE_POINT         : 13,
        DRAW_FEATURE_LINE          : 14,
        DRAW_FEATURE_POLYGON       : 15
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
        throw("Tool.setVisible() not implemented! Must be implemented in sub-class");
    },

    isActive : function(){
        throw("Tool.isActive() not implemented! Must be implemented in sub-class");
    }
});
