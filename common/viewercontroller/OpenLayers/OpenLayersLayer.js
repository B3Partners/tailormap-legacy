/**
 * @class 
 * @constructor
 * @description
 */

Ext.define("viewer.viewercontroller.openlayers.OpenLayersLayer",{    
    config:{
        name: null
    },
    constructor :function (config){        
        this.initConfig(config);
        return this;
    },
    /**
    *see @link Layer.getOption
    */
    getOption : function(optionKey){
        var lowerOptionKey=optionKey.toLowerCase();
        for (var key in this.getFrameworkLayer().options){
            if (key.toLowerCase()==lowerOptionKey){
                return this.getFrameworkLayer().options[key];
            }
        }
        for (var key in this.getFrameworkLayer().params){
            if (key.toLowerCase()==lowerOptionKey){
                return this.getFrameworkLayer().params[key];
            }
        }
        return null;
    },
    /**
        *see @link Layer.setOption
        */
    setOption : function(optionKey,optionValue){
        var object=new Object();
        object[optionKey]= optionValue;
        this.getFrameworkLayer().setOptions(object);
    },
       
    setAlpha : function (alpha){
        this.frameworkLayer.setOpacity(alpha/100);
    },
    /*
     *Implement in subclass:
     */
    /*
    getLegendGraphic : function () {
        Ext.Error.raise({msg: "Layer.getLegendGraphic() Not implemented! Must be implemented in sub-class"});
    },
    setQuery : function (query){
        Ext.Error.raise({msg: "Layer.setQuery() Not implemented! Must be implemented in sub-class"});
    },
    */
    /**
     * Needs to return a object with the last request
     * @return array of objects with:
     *  object.url the url of the last request
     *  object.body (optional) the body of the request
     */
    getLastMapRequest: function(){
        Ext.Error.raise({msg: "Layer.getLastMapRequest() Not implemented! Must be implemented in sub-class"});
    },

    /* Eventhandling for layers */
    register : function (event,handler,scope){
         var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            this.getFrameworkLayer().events.register(olSpecificEvent, this, this.handleEvent);
            this.addListener(event, handler, scope);
        }else{
            this.viewerController.warning("Event not listed in OpenLayerLayers >"+ event + "<. The application  might not work correctly.");
        }
      
    },
    handleEvent : function(args){
        var event = args.type;
        var options={};
        var genericEvent = this.viewerController.mapComponent.getGenericEventName(event);
        if (genericEvent==viewer.viewercontroller.controller.Event.ON_LAYER_MOVEEND){
            options.layer=this.map.getLayerByOpenLayersId(args.element.id);
        }else {
            this.viewerController.logger.error("The event "+genericEvent+" is not implemented in the OpenLayersMap.handleEvent()");
        }
        this.fireEvent(genericEvent,this,options);
    },

    unRegisterEvent : function (event,handler,thisObj){
        var specificName = this.viewerController.mapComponent.getSpecificEventName(event);
        this.getFrameworkMap().events.unregister(specificName,handler,thisObj);
        this.removeListener(event,handler,thisObj);
    },
    setVisible : function (visible){
        if (this.frameworkLayer!=null){
            this.frameworkLayer.setVisibility(visible);
        }
    },
    layerFeatureHandler : function (obj){
        // TODO: FIX THIS. this handles the registered event directly. Ugh
        var id = obj.object.id;
        var eventName = this.viewerController.mapComponent.getGenericEventName(obj.type);
        var wkt = obj.feature.geometry.toString();
        var feature = new Feature(id,wkt);
        webMapController.events[eventName][id](id,feature);
    }
});