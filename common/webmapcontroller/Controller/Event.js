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
Event.ON_CONFIG_COMPLETE                    = 0;
/** @field */
Event.ON_SET_TOOL                           = 1;
    
// Map events:                              11 - 50
/** @field */
Event.ON_GET_FEATURE_INFO                   = 11;
/** @field */
Event.ON_GET_FEATURE_INFO_DATA              = 12;
/** @field */
Event.ON_ALL_LAYERS_LOADING_COMPLETE        = 13;
/** @field */
Event.ON_CHANGE_EXTENT                      = 14;
/** @field */
Event.ON_FINISHED_CHANGE_EXTENT             = 15;


// Layer events:                            50 - 100
/** @field */
Event.ON_GET_CAPABILITIES                   = 50;
/** @field */
Event.ON_FEATURE_ADDED                      = 51;
/** @field */
Event.ON_REQUEST                            = 52;
/** @field */
Event.ON_LOADING_START                      = 53;
/** @field */
Event.ON_LOADING_END                        = 54;
    
// Tool events:                             100 - 150
Event.ON_EVENT_DOWN                         = 100;
/** @field */
Event.ON_EVENT_UP                           = 101;
/** @field */
Event.ON_CLICK                              = 102;
/** @field */
Event.ON_MEASURE                            = 103;

// Shared evens:                            150 - ...
/** @field */
Event.ON_ONIT                               = 150;  // Shared by

Event.ON_LAYER_SWITCHED_OFF                 = "layerSwitchedOff";
Event.ON_LAYER_SWITCHED_ON                 = "layerSwitchedOn";