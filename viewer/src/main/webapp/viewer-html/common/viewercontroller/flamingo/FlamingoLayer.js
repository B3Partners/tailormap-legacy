/** The FlamingLayer Class **/

/**  
 * @augments Layer
 * @description The superclass for all flamingolayers 
 * param id The id of the layer
 * param options The options to be given to the layer
 * param flamingoObject The flamingo object of the layer
 * 
 */

Ext.define("viewer.viewercontroller.flamingo.FlamingoLayer",{
    enabledEvents: null,
    type: null,
    constructor :function (config){
        if (config.id){
            this.id = config.viewerController.mapComponent.makeFlamingoAcceptableId(config.id);
            config.id = this.id;
        }
        this.enabledEvents=new Object();
        this.map = this.viewerController ? this.viewerController.mapComponent.getMap() : null;
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
        // Fixup wrong Flash alpha, it thinks 0 is transparent and 100 is opaque
        if(this.map) {
            this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"setAlpha",alpha)
        }
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
    /**
     * reloads the framework map
     */
    reload: function(){
        if (this.map !=null && this.map.getFrameworkMap()){
            return this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"update");
        }
    },
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
        //enable flamingo event broadcasting
        var flamEvent=this.viewerController.mapComponent.eventList[event];
        if (flamEvent!=undefined){
            //if not enabled yet, add it
            if (this.enabledEvents[flamEvent]==undefined){
               this.map.getFrameworkMap().callMethod(this.viewerController.mapComponent.getId(),"addAllowExternalInterface",this.getFrameworkId()+"."+flamEvent);
               this.enabledEvents[flamEvent]=true;
            }
        }
        /* fix for infinite loop:
         * If this is called from a layer that extends the FlamingoArcLayer the superclass is
         * that FlamingoArcLayer and this function is called again when this.superclass.function is called
         **/
        if (this.superclass.$className == "viewer.viewercontroller.flamingo.FlamingoArcLayer"){
            this.superclass.superclass.addListener.call(this,event,handler,scope);
        }else{
            this.superclass.addListener.call(this,event,handler,scope);
        }
        //viewer.viewercontroller.controller.Layer.superclass.addListener.call(this,event,handler,scope);
    },
    setVisible : function (visible){  
        this.visible = visible;
        
        if (this.options!=null){
            this.options["visible"] = visible;
        }
              
        if (this.map !=null){
            this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setVisible", visible);
        }
    },
    /**
     * Get the visibility
     */
    getVisible : function (){
        if (this.map !=null){
            this.visible = this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "getVisible");
        }
        if (this.options!=null)
            this.options["visible"] = this.visible;
        return this.visible;
    },
    /**
     * Overwrite destroy, clear Listeners and forward to super.destroy
     */
    destroy: function(){        
        /* fix for infinite loop:
         * If this is called from a layer that extends the FlamingoArcLayer the superclass is
         * that FlamingoArcLayer and this function is called again when this.superclass.function is called
         **/
        if (this.superclass.$className == "viewer.viewercontroller.flamingo.FlamingoArcLayer"){
            this.superclass.superclass.destroy.call(this);
        }else{
            this.superclass.destroy.call(this);
        }
    }
    
});