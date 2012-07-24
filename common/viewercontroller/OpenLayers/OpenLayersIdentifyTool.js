/**
 * @class 
 * @constructor
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    olMap: null,
    constructor : function (conf,frameworkTool){
        viewer.viewercontroller.openlayers.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);

        this.olMap=this.viewerController.mapComponent.getMap().getFrameworkMap();
        return this;
    },
    activate: function(){
        this.olMap.events.register("click", this, this.handleClick);
    },
    deactivate: function(){
        this.olMap.events.unregister("click", this, this.handleClick);
    },
    handleClick: function(event){
        var opx = this.olMap.getLonLatFromPixel(event.xy)
        var options = {
            x: event.xy.x,
            y: event.xy.y,
            coord: {
                x: opx.lon,
                y: opx.lat
            }
        };
        this.viewerController.mapComponent.getMap().fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    }  
});