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
    extend: "viewer.viewercontroller.controller.Layer",
    enabledEvents: new Object(),
    constructor :function (config){
        viewer.viewercontroller.flamingo.FlamingoLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    
    toXML : function(){
        throw("FlamingoLayer.toXML(): .toXML() must be made!");
    },

    getTagName : function(){
        throw("FlamingoLayer.getTagName: .getTagName() must be made!");
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
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
        viewer.viewercontroller.flamingo.FlamingoLayer.superclass.addListener.call(this,event,handler,scope);
        //enable flamingo event broadcasting
        var flamEvent=this.map.mapComponent.eventList[event];
        if (flamEvent!=undefined){
            //if not enabled yet, add it
            if (this.enabledEvents[flamEvent]==undefined){
               this.map.getFrameworkMap().callMethod(this.map.mapComponent.getId(),"addAllowExternalInterface",this.getFrameworkId()+"."+flamEvent);
               this.enabledEvents[flamEvent]=true;
            }
        }     
    }
});