/**
 * @class 
 * @constructor
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    constructor : function (conf,frameworkTool){
        if (conf.type!=viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO){
            Ext.Error.raise({msg: "OpenLayersIdentifyTool.constructor(): A OpenLayersIdentifyTool needs to be of type: Tool.GET_FEATURE_INFO"});
        }
        viewer.viewercontroller.openlayers.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);

        //this.viewerController.getMap();
        return this;
    },
    activate: function(){
        alert("activate");
    },
    deactivate: function(){
        alert("deactivate");
    }
});