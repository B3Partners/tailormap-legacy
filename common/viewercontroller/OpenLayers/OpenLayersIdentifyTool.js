/**
 * @class 
 * @constructor
 * @description An identify tool
 */
function OpenLayersIdentifyTool(id,olControlObject,type){
    if (type!=Tool.GET_FEATURE_INFO){
        throw("OpenLayersIdentifyTool.constructor(): A OpenLayersIdentifyTool needs to be of type: Tool.GET_FEATURE_INFO");
    }
    this.getFeatureInfoHandler = new Object();
    this.beforeGetFeatureInfoHandler = new Object();
    OpenLayersTool.call(this,id,olControlObject,type);
}
OpenLayersIdentifyTool.prototype = new OpenLayersTool();
OpenLayersIdentifyTool.prototype.constructor= OpenLayersIdentifyTool;
/**
 *Set the getFeatureInfo handler
 **/
OpenLayersIdentifyTool.prototype.setGetFeatureInfoHandler = function(handler){    
    this.getFeatureInfoHandler = handler;
}
/**
 *Set the setBeforeGetFeatureInfoHandler handler
 **/
OpenLayersIdentifyTool.prototype.setBeforeGetFeatureInfoHandler = function(handler){
    this.beforeGetFeatureInfoHandler = handler;
}