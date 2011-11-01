/**
 * @class 
 * @constructor
 * @description The class for controls 
 * @param id The id of the tool
 * @param frameworkObject The frameworkspecific object, to store as a reference
 * @param type The type of tool to be created
 */
function Tool(id,frameworkObject,type){
    this.id=id;
    this.frameworkTool=frameworkObject;
    this.type=type;
}

// The different types of tools
Tool.DRAW_FEATURE               = 0;
Tool.NAVIGATION_HISTORY         = 1;
Tool.ZOOM_BOX                   = 2;
Tool.PAN                        = 3;
Tool.BUTTON                     = 4;
Tool.TOGGLE                     = 5;
Tool.CLICK                      = 6;
Tool.LOADING_BAR                = 7;
Tool.GET_FEATURE_INFO           = 8;
Tool.MEASURE                    = 9;
Tool.SCALEBAR                   = 10;
Tool.ZOOM_BAR                   = 11;
Tool.LAYER_SWITCH               = 12;

Tool.DRAW_FEATURE_POINT         = 13;
Tool.DRAW_FEATURE_LINE          = 14;
Tool.DRAW_FEATURE_POLYGON       = 15;

Tool.prototype.getFrameworkTool = function(){
    return this.frameworkTool;
}

Tool.prototype.getType = function(){
    return this.type;
}

Tool.prototype.getId = function(){
    return this.id;
}

Tool.prototype.setVisible = function(){
    throw("Tool.setVisible() not implemented! Must be implemented in sub-class");
}

Tool.prototype.isActive = function(){
    throw("Tool.isActive() not implemented! Must be implemented in sub-class");
}
