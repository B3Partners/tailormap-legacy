/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class 
 * @constructor
 * @description
 */

Ext.define("viewer.viewercontroller.openlayers.OpenLayersLayer",{    
    config:{
        name: null
    },
    enabledEvents: null,
    events : null,
    constructor :function (config){        
        this.initConfig(config);
        this.enabledEvents = new Object();
        this.events = new Object();
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
                    this.frameworkLayer.events.register(olSpecificEvent, this, this.handleEvent);
                }
            }
        }        
        viewer.viewercontroller.controller.Layer.superclass.addListener.call(this,event,handler,scope);
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
                    this.frameworkLayer.events.unregister(olSpecificEvent, this, this.handleEvent);
                }
            }            
        }
        viewer.viewercontroller.controller.Layer.superclass.removeListener.call(this,event,handler,scope);
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

    // @deprecated use removeListener() instead
    unRegisterEvent : function (event,handler,thisObj){
        var specificName = this.viewerController.mapComponent.getSpecificEventName(event);
        this.getFrameworkLayer().events.unregister(specificName,handler,thisObj);
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