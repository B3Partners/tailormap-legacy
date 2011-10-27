
function OpenLayersLayer(olLayerObject,id){
    if (!olLayerObject instanceof OpenLayers.Layer){
        throw("The given layer object is not of type 'OpenLayers.Layer'. But: "+olLayerObject);
    }
    Layer.call(this,olLayerObject,id);
}
OpenLayersLayer.prototype = new Layer();
OpenLayersLayer.prototype.constructor = OpenLayersLayer;

/**
     *see @link Layer.getOption
     */
OpenLayersLayer.prototype.getOption = function(optionKey){
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
}
/**
     *see @link Layer.setOption
     */
OpenLayersLayer.prototype.setOption = function(optionKey,optionValue){
    var object=new Object();
    object[optionKey]= optionValue;
    this.getFrameworkLayer().setOptions(object);
}

/* Eventhandling for layers */
OpenLayersLayer.prototype.register = function (event,handler){
    var specificName = webMapController.getSpecificEventName(event);
    if(specificName == webMapController.eventList[Event.ON_FEATURE_ADDED]){
        if( webMapController.events[event] == undefined){
            webMapController.events[event] = new Object();
        }
        webMapController.events[event][this.getFrameworkLayer().id] = handler;
        this.getFrameworkLayer().events.register(specificName, this.getFrameworkLayer(), layerFeatureHandler);
    }else if(event == Event.ON_LOADING_START || event == Event.ON_LOADING_END){
        this.getFrameworkLayer().events.register(specificName, this, handler);
    }else{
        this.getFrameworkLayer().events.register(specificName, this.getFrameworkLayer(), handler);
    }
}

function layerFeatureHandler(obj){
    var id = obj.object.id;
    var eventName = webMapController.getGenericEventName(obj.type);
    var wkt = obj.feature.geometry.toString();
    var feature = new Feature(id,wkt);
    webMapController.events[eventName][id](id,feature);
}