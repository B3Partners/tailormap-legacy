/** The FlamingLayer Class **/

/**  
 * @constructor
 * @augments Layer
 * @description The superclass for all flamingolayers 
 * @param id The id of the layer
 * @param options The options to be given to the layer
 * @param flamingoObject The flamingo object of the layer
 * 
 */

Ext.define("viewer.viewercontroller.flamingo.FlamingoLayer",{
    enabledEvents: null,
    type: null,
    constructor :function (config){
        if (config.id){
            config.id=""+config.id;
            if((config.id).indexOf(":") != -1){
                config.id = (config.id).replace(/:/g,'_');
            }
        }
        this.enabledEvents=new Object();
        return this;
    },
    /**
     * Get's the frameworklayer: the viewer specific layer.
     */
    getFrameworkLayer : function(){
        if (this.map==null){
            return null;
        }
        return this.map.getFrameworkMap();
    },
    
    toXML : function(){
        Ext.Error.raise({msg: "FlamingoLayer.toXML(): .toXML() must be made!"});
    },

    getTagName : function(){
        Ext.Error.raise({msg: "FlamingoLayer.getTagName: .getTagName() must be made!"});
    },
    setOption : function(optionKey,optionValue){
        this.options[optionKey]=optionValue;
    },
    getId : function(){
        return this.id;
    },
    getFrameworkId: function(){
        return this.map.getId()+"_"+this.getId();
    },
    setAlpha : function (alpha){
        this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"setAlpha",alpha)
    },
    getAlpha : function (){
        return this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"getAlpha");
    },
    /**
     * Get the last getMap request array
     * @see viewer.viewerController.controller.Layer#getLastMapRequest
     */
    getLastMapRequest: function(){
        var request=this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"getLastGetMapRequest");
        if (request==null){
            return null;
        }
        return [request];
    },
    /**
     * Returns the type of the layer.
     */
    getType: function(){
        return this.type;
    },
    update: function(){
        return this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"update");
    },
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
       // viewer.viewercontroller.flamingo.FlamingoLayer.superclass.addListener.call(this,event,handler,scope);
        //enable flamingo event broadcasting
        var flamEvent=this.map.mapComponent.eventList[event];
        if (flamEvent!=undefined){
            //if not enabled yet, add it
            if (this.enabledEvents[flamEvent]==undefined){
               this.map.getFrameworkMap().callMethod(this.map.mapComponent.getId(),"addAllowExternalInterface",this.getFrameworkId()+"."+flamEvent);
               this.enabledEvents[flamEvent]=true;
            }
        }     
    },
    setVisible : function (visible){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setVisible", visible);
        this.visible = visible;
        if (this.options!=null)
            this.options["visible"] = visible;
    },
    /**
     * Get the visibility
     */
    getVisible : function (){
        this.visible = this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "getVisible");
        if (this.options!=null)
            this.options["visible"] = this.visible;
    }
    
});