/**
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersImageLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersLayer",
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersImageLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        if (!this.frameworkLayer instanceof OOpenLayers.Layer.Image){
            Ext.Error.raise({msg: "The given layer object is not of type 'OpenLayers.Layer.Image'. But: "+this.frameworkLayer});
        }
    }
});