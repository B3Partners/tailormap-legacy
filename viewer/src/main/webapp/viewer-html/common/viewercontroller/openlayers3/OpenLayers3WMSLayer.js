/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3WMSLayer",{
    extend: "viewer.viewercontroller.controller.WMSLayer",
    mixins: {
        openLayers3Layer: "viewer.viewercontroller.openlayers3.OpenLayers3Layer"
    },
    constructor : function (config){
        viewer.viewercontroller.openlayers3.OpenLayers3WMSLayer.superclass.constructor.call(this,config);
        this.mixins.openLayers3Layer.constructor.call(this,config);

        this.options.visibility = this.visible;
        this.options.singleTile=true;
        this.options.transitionEffect = "resize";
        this.options.attribution = this.config.attribution;
        var sources = new ol.source.ImageWMS({
            url:config.options.url,
            projection: config.viewerController.mapComponent.mapOptions.projection,
            params :{ layers: config.options.layers
            }
        });
        this.frameworkLayer = new ol.layer.Image({
            source: sources,
            visible: this.options.visibility
        });
        
        this.type=viewer.viewercontroller.controller.Layer.WMS_TYPE;

        this.getFeatureInfoControl=null;
        this.mapTipControl=null;
    },
    
    setVisible: function(vis){
        this.mixins.openLayers3Layer.setVisible.call(this,vis);
    }
});