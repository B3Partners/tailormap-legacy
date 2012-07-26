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

    
    /**
     * @see Ext.util.Observable#addListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the addListener. Register event on the OpenLayers Layer (only once)
     * If the event is thrown by the OpenLayers Layer, the given handlers are called.
     */
    addListener : function(event,handler,scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /* Add event to OpenLayers Layer only once, to prevent multiple fired events.    
             * count the events for removing the listener again.
             */
            if(!olSpecificEvent == "featureadded"){
                if(this.enabledEvents[olSpecificEvent]){
                    this.enabledEvents[olSpecificEvent]++;                
                }else{
                    this.enabledEvents[olSpecificEvent] = 1;
                    this.frameworkMap.events.register(olSpecificEvent, this, this.handleEvent);
                }
            }
            viewer.viewercontroller.openlayers.OpenLayersMap.superclass.addListener.call(this,event,handler,scope);
        }else{
            this.viewerController.logger.warning("Event not listed in OpenLayersMapComponent >"+ event + "<. The application  might not work correctly.");
        }
    },
    /**
     * @see Ext.util.Observable#removeListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the removeListener. Unregister the event on the OpenLayers Layer if there
     * are no listeners anymore.     
     */
    removeListener : function (event,handler,scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /* Remove event from OpenLayers Layer if the number of events == 0
             * If there are no listeners for the OpenLayers event, remove the listener.             
             */
            if(this.enabledEvents[olSpecificEvent]){
                this.enabledEvents[olSpecificEvent]--;
                if (this.enabledEvents[olSpecificEvent] <= 0){
                    this.enabledEvents[olSpecificEvent]=0;
                    this.frameworkMap.events.unregister(olSpecificEvent, this, this.handleEvent);
                }
            }            
            viewer.viewercontroller.openlayers.OpenLayersMap.superclass.removeListener.call(this,event,handler,scope);
        }else{
            this.viewerController.logger.warning("Event not listed in OpenLayersMapComponent >"+ event + "<. The application  might not work correctly.");
        }
    },
    
    /**
     * Handles the OpenLayers generated events for this Layer
     */
    handleEvent : function (event){
        var options = new Object();
        options.layer = this.map.getLayerByOpenLayersId(event.element.id);
        options.feature = this.fromOpenLayersFeature(event.feature);
        var eventName = this.viewerController.mapComponent.getGenericEventName(event.type);
        if(!eventName){
            eventName = event;
        }
        this.fireEvent(eventName,options);
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