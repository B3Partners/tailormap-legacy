/**
 * @class 
 * @constructor
 * @description
 */
function OpenLayersImageLayer (olLayerObject, id){
    if (!olLayerObject instanceof OpenLayers.Layer.Image){
        Ext.Error.raise({msg: "The given layer object is not of type 'OpenLayers.Layer.WMS'. But: "+olLayerObject});
    }
    OpenLayersLayer.call(this,olLayerObject,id);
}

OpenLayersImageLayer.prototype = new OpenLayersLayer();
OpenLayersImageLayer.prototype.constructor= OpenLayersImageLayer;