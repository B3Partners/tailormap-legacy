/*JavaScript interface class file*/

/**
 * Event
 * @class 
 * @constructor
 * @description The class that defines the generic events. This is a helper class to abstract the viewer specific event types.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.controller.Event",{
    statics:{
        //Events:
        //MapComponent events:                        0 - 10
        /** @field */
        ON_CONFIG_COMPLETE                    : "ON_CONFIG_COMPLETE",
        /** @field */
        ON_SET_TOOL                           : "ON_SET_TOOL",
    
        // Map events:                              11 - 50
        /** @field */
        ON_GET_FEATURE_INFO                   : "ON_GET_FEATURE_INFO",
        /** @field */
        ON_GET_FEATURE_INFO_DATA              : "ON_GET_FEATURE_INFO_DATA",
        /** @field */
        ON_ALL_LAYERS_LOADING_COMPLETE        : "ON_ALL_LAYERS_LOADING_COMPLETE",
        /** @field */
        ON_CHANGE_EXTENT                      : "ON_CHANGE_EXTENT",
        /** @field */
        ON_FINISHED_CHANGE_EXTENT             : "ON_FINISHED_CHANGE_EXTENT",
        /** @field */
        ON_LAYER_ADDED                        : "ON_LAYER_ADDED",


        // Layer events:                            50 - 100
        /** @field */
        ON_GET_CAPABILITIES                   : "ON_REQUEST",
        /** @field */
        ON_FEATURE_ADDED                      : "ON_FEATURE_ADDED",
        /** @field */
        ON_REQUEST                            : "ON_REQUEST",
        /** @field */
        ON_LOADING_START                      : "ON_LOADING_START",
        /** @field */
        ON_LOADING_END                        : "ON_LOADING_END",
    
        // Tool events:                             100 - 150
        ON_EVENT_DOWN                         : "ON_EVENT_DOWN",
        /** @field */
        ON_EVENT_UP                           : "ON_EVENT_UP",
        /** @field */
        ON_CLICK                              : "ON_CLICK",
        /** @field */
        ON_MEASURE                            : "ON_MEASURE",

        // Shared evens:                            150 - ...
        /** @field */
        ON_ONIT                               : "ON_ONIT",  // Shared by

        ON_LAYER_VISIBILITY_CHANGED           : "ON_LAYER_VISIBILITY_CHANGED",
        
        ON_LAYERSELECTOR_CHANGE                 : "ON_LAYERSELECTOR_CHANGE"
    }
});