/**
 * @class 
 * @constructor
 * @description
 */

Ext.define("viewer.viewercontroller.openlayers.OpenLayersLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    type: null,
    constructor :function (config){
        viewer.viewercontroller.openlayers.OpenLayersLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        if (!this.frameworkLayer instanceof OpenLayers.Layer){
            Ext.Error.raise({msg: "The given layer object is not of type 'OpenLayers.Layer'. But: "+this.frameworkLayer});
        }
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

    /* Eventhandling for layers */
    register : function (event,handler){
        // TODO fix this. Use ext event
        var specificName = this.viewerController.mapComponent.getSpecificEventName(event);
        if(specificName == this.viewerController.mapComponent.eventList[viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED]){
            if( webMapController.events[event] == undefined){
                webMapController.events[event] = new Object();
            }
            webMapController.events[event][this.getFrameworkLayer().id] = handler;
            this.getFrameworkLayer().events.register(specificName, this.getFrameworkLayer(),this.layerFeatureHandler);
        }else if(event == viewer.viewercontroller.controller.Event.ON_LOADING_START || event == viewer.viewercontroller.controller.Event.ON_LOADING_END){
            this.getFrameworkLayer().events.register(specificName, this, handler);
        }else{
            this.getFrameworkLayer().events.register(specificName, this.getFrameworkLayer(), handler);
        }
    },
    setVisible : function (visible){
        this.frameworkLayer.setVisibility (visible)
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