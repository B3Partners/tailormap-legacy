/**
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersTMSLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersLayer",
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersTMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        if (!this.frameworkLayer instanceof OOpenLayers.Layer.TMS){
            Ext.Error.raise({msg: "The given layer object is not of type 'OpenLayers.Layer.TMS'. But: "+this.frameworkLayer});
        }
    }
});