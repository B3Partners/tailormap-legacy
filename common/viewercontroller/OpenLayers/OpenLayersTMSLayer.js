/**
 * @class 
 * @constructor
 * @description
 */
function OpenLayersTMSLayer(olLayerObject,id){
    if (!olLayerObject instanceof OpenLayers.Layer.TMS){
        throw("The given layer object is not of type 'OpenLayers.Layer.WMS'. But: "+olLayerObject);
    }
    OpenLayersLayer.call(this,olLayerObject,id);
}
OpenLayersTMSLayer.prototype = new OpenLayersLayer();
OpenLayersTMSLayer.prototype.constructor= OpenLayersTMSLayer;

