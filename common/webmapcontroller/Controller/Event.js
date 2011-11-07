/*JavaScript interface class file*/

/**
 * Event
 * @class 
 * @constructor
 * @description The class that defines the generic events. This is a helper class to abstract the viewer specific event types.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
function Event(){
}

//Events:
//Controller events:                        0 - 10
/** @field */
Event.ON_CONFIG_COMPLETE                    = "ON_CONFIG_COMPLETE";
/** @field */
Event.ON_SET_TOOL                           = "ON_SET_TOOL";
    
// Map events:                              11 - 50
/** @field */
Event.ON_GET_FEATURE_INFO                   = "ON_GET_FEATURE_INFO";
/** @field */
Event.ON_GET_FEATURE_INFO_DATA              = "ON_GET_FEATURE_INFO_DATA";
/** @field */
Event.ON_ALL_LAYERS_LOADING_COMPLETE        = "ON_ALL_LAYERS_LOADING_COMPLETE";
/** @field */
Event.ON_CHANGE_EXTENT                      = "ON_CHANGE_EXTENT";
/** @field */
Event.ON_FINISHED_CHANGE_EXTENT             = "ON_FINISHED_CHANGE_EXTENT";


// Layer events:                            50 - 100
/** @field */
Event.ON_GET_CAPABILITIES                   = "ON_REQUEST";
/** @field */
Event.ON_FEATURE_ADDED                      = "ON_FEATURE_ADDED";
/** @field */
Event.ON_REQUEST                            = "ON_REQUEST";
/** @field */
Event.ON_LOADING_START                      = "ON_LOADING_START";
/** @field */
Event.ON_LOADING_END                        = "ON_LOADING_END";
    
// Tool events:                             100 - 150
Event.ON_EVENT_DOWN                         = "ON_EVENT_DOWN";
/** @field */
Event.ON_EVENT_UP                           = "ON_EVENT_UP";
/** @field */
Event.ON_CLICK                              = "ON_CLICK";
/** @field */
Event.ON_MEASURE                            = "ON_MEASURE";

// Shared evens:                            150 - ...
/** @field */
Event.ON_ONIT                               = "ON_ONIT";  // Shared by

Event.ON_LAYER_SWITCHED_OFF                 = "ON_LAYER_SWITCHED_OFF";
Event.ON_LAYER_SWITCHED_ON                  = "ON_LAYER_SWITCHED_ON";