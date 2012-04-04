/**
 * @class 
 * @constructor
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    constructor : function (config){
        if (type!=Tool.GET_FEATURE_INFO){
            Ext.Error.raise({msg: "OpenLayersIdentifyTool.constructor(): A OpenLayersIdentifyTool needs to be of type: Tool.GET_FEATURE_INFO"});
        }
        viewer.viewercontroller.openlayers.OpenLayersIdentifyTool.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.getFeatureInfoHandler = new Object();
        this.beforeGetFeatureInfoHandler = new Object();
        return this;
    },
    /**
    *Set the getFeatureInfo handler
    **/
    setGetFeatureInfoHandler : function(handler){    
        this.getFeatureInfoHandler = handler;
    },
    /**
    *Set the setBeforeGetFeatureInfoHandler handler
    **/
    setBeforeGetFeatureInfoHandler : function(handler){
        this.beforeGetFeatureInfoHandler = handler;
    }
});