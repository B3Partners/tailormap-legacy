/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class 
 * @constructor
 * @description
 */
//TODO: Add getFeatureInfo through the framework (is used when no featuretype for layer)
Ext.define("viewer.viewercontroller.openlayers.OpenLayersLayer",{        
    config:{
        name: null
    },
    enabledEvents: null,
    events : null,
    type:null,
    alpha:100,
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
        this.alpha=alpha;
        if(this.frameworkLayer) {
            this.frameworkLayer.setOpacity(alpha/100);
        }
    },
    
    getAlpha : function (){
        return this.alpha;
    },
    /**
     * Reloads the layer.
     */
    reload : function (){
        this.getFrameworkLayer().redraw(true);
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
     * @see Ext.util.Observable#addListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the addListener. Register event on the OpenLayers Layer (only once)
     * If the event is thrown by the OpenLayers Layer, the given handlers are called.
     */
    addListener : function(event,handler,scope){
        var olSpecificEvent = this.config.viewerController.mapComponent.getSpecificEventName(event);
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
        var olSpecificEvent = this.config.viewerController.mapComponent.getSpecificEventName(event);
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
     * Return the layer type.
     */
    getType: function(){
        return this.type;
    },
    /**
     * Handles the OpenLayers generated events for this Layer
     */
    handleEvent : function (event){
        var options = new Object();
        options.layer = this.map.getLayerByOpenLayersId(event.element.id);
        options.feature = this.fromOpenLayersFeature(event.feature);
        var eventName = this.config.viewerController.mapComponent.getGenericEventName(event.type);
        if(!eventName){
            eventName = event;
        }
        this.fireEvent(eventName,options);
    },    

    /**
     * Sets the visibility of the layer.
     * @param visible true or false
     */
    setVisible : function (visible){
        this.visible=visible;
        if (this.frameworkLayer!=null){
            this.frameworkLayer.setVisibility(visible);
        }
    },
    /**
     * Get the visibility
     */
    getVisible : function (){
        if (this.frameworkLayer!=null){
            return this.frameworkLayer.getVisibility();
        }
        return null;
    },
    /**
     * Destroy object
     */
    destroy: function(){
        if (this.frameworkLayer!=null){
            this.frameworkLayer.destroy();
        }
        /* fix for infinite loop:
         * If this is called from a layer that extends the OpenLayersArcLayer the superclass is
         * that OpenLayersArcLayer and this function is called again when 
         * this.superclass.function is called
         **/
        if (this.superclass.$className == "viewer.viewercontroller.openlayers.OpenLayersArcLayer"){
            this.superclass.superclass.destroy.call(this);
        }else{
            this.superclass.destroy.call(this);
        }
    }    
});
