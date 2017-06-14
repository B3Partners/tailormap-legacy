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
        var sources = new ol.source.TileWMS({
            
            url:config.options.url,
            projection: config.viewerController.mapComponent.mapOptions.projection,
            params :{ LAYERS: config.options.layers,
                      VERSION: this.options.version,
                      SRS: this.options.srs,
                      STYLES: this.options.styles,
                      FORMAT: this.options.format,
                      TRANSPARENT: this.options.transparent,
                      TILED:true,
                      REQUEST: 'GetMap'
            }
        });
        this.frameworkLayer = new ol.layer.Tile({
            source: sources,
            visible: this.options.visibility,
            preload:1
        });
        
        this.type=viewer.viewercontroller.controller.Layer.WMS_TYPE;

        this.getFeatureInfoControl=null;
        this.mapTipControl=null;
    },
    
    setVisible: function(vis){
        this.mixins.openLayers3Layer.setVisible.call(this,vis);
    },
    
    getVisible: function(){
        return this.mixins.openLayers3Layer.getVisible.call(this);
    },
    getType : function (){
        return this.mixins.openLayers3Layer.getType.call(this);
    },
    
    
    setOGCParams: function(newParams){
        var source = this.frameworkLayer.getSource();
        source.updateParams(newParams);
    },
    /**
    *Gets the last wms request-url of this layer
    *@returns the WMS getMap Reqeust.
    */
    getLastMapRequest : function(){
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var request=[{
            url: this.getFrameworkLayer().getSource().getGetFeatureInfoUrl(map.getView().getCenter(),map.getView().getResolution(), map.getView().getProjection())
        }];
        console.log(request[0].url);
        return request;
    },
    
    setQuery : function (filter, sldHash, sessionId){
        if(filter && filter.getCQL() != ""){
            var service = this.config.viewerController.app.services[this.serviceId];
            var layer = service.layers[this.options.name];
            if(layer.details != undefined){
                var filterable =layer.details["filterable"];
                if(filterable != undefined && filterable != null ){
                    filterable = Ext.JSON.decode(filterable);
                    if(filterable){
                        var url;
                        if(!sldHash){
                            url = Ext.create(viewer.SLD).createURL(
                                this.options["layers"],
                                this.getOption("styles") || "default",
                                null,
                                layer.hasFeatureType ? layer.featureTypeName : null,
                                this.config.sld ? this.config.sld.id : null,
                                filter.getCQL());
                        }else{
                            url = Ext.create(viewer.SLD).createURLWithHash(
                                sldHash,
                                sessionId,
                                this.options["layers"],
                                this.getOption("styles") || "default");
                        }
                        this.setOGCParams({"SLD": url});
                        this.reload();
                    }
                }
            }
        }else{
            this.setOGCParams({
                "SLD": this.config.originalSldUrl || null
            });
        }
    },
    
    setAlpha: function (alpha){
        this.mixins.openLayers3Layer.setAlpha.call(this,alpha);
    },
    
    reload: function (){
        var source = this.frameworkLayer.getSource();
        var params = source.getParams();
        params.t = new Date().getMilliseconds();
        source.updateParams(params);
        this.mixins.openLayers3Layer.reload.call(this);
    }
});