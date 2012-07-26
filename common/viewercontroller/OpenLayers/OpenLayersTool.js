/**
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    onActiveHandler:null,
    controls:null,
    constructor : function (conf,frameworkObject){
        viewer.viewercontroller.openlayers.OpenLayersTool.superclass.constructor.call(this, conf);                       
        this.frameworkObject=frameworkObject;
        this.controls = new Array();
        this.onActiveHandler = new Object();
        return this;
    },
    //XXX ?? addListener >> have to ask Meine to handle it correct
    register : function (event,handler){
        var specificName = webMapController.getSpecificEventName(event);
        if(this.type == Tool.BUTTON){
            this.getFrameworkTool().trigger= handler;
        }else if (this.type== Tool.CLICK){
            this.getFrameworkTool().handler.callbacks[specificName]= function (evt){
                var lonlat= this.map.getLonLatFromViewPortPx(evt.xy);
                handler.call(this,new Extent(lonlat.lat,lonlat.lon,lonlat.lat,lonlat.lon))
            };
        }else if(viewer.viewercontroller.controller.Event.ON_SET_TOOL == event){
            this.onActiveHandler = handler;
            this.getFrameworkTool().events.register(specificName,this,this.onSetActive);
        } else{
            this.getFrameworkTool().events.register(specificName,this.getFrameworkTool(),handler);
        }
    },

    addControl : function(control){
        if (!(this.type == Tool.GET_FEATURE_INFO)){
            Ext.Error.raise({msg: "The given Control object is not of type get feature info. But: "+this.type});
        }
        this.controls.push(control);
    },

    getId : function(){
        return this.id;
    },

    setToolVisible : function(visibility){
        this.setVisible(visibility);
        if (visibility){
            this.getFrameworkTool().panel_div.style.display="block";
        }else{
            this.getFrameworkTool().panel_div.style.display="none";
        }
    },

    isActive : function (){
        return this.getFrameworkTool().active;
    },

    onSetActive : function(data){
        this.onActiveHandler(this.getId(),data);
    }
});