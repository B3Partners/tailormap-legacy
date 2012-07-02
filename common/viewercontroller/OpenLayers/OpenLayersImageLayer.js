/**
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersImageLayer",{
    extend: "viewer.viewercontroller.controller.ImageLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersImageLayer.superclass.constructor.call(this, config);
        var ex = Ext.create("viewer.viewercontroller.controller.Extent",this.extent);
        var width = this.viewerController.mapComponent.getMap().getWidth();
        var height = this.viewerController.mapComponent.getMap().getHeight();
        this.initConfig(config);
           this.frameworkLayer = new OpenLayers.Layer.Image(
                this.name,
                this.url,
                new OpenLayers.Bounds(ex.minx, ex.miny,ex.maxx, ex.maxy),
                new OpenLayers.Size(width,height),
                this.options
            );
            
    },
    setUrl: function(url){
        this.url=url;
    },
    setExtent: function (extent){
        this.extent=extent;
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.openLayersLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.openLayersLayer.setAlpha.call(this,alpha);
    }
});