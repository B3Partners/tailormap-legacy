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
 * FeatureInfo component
 * Shows feature info.
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.FeatureInfo",{
    extend: "viewer.components.Maptip",   
    progressElement: null,
    /**
     * Overwrite constructor to set some other settings then maptip.
     */
    constructor: function (conf){    
        conf.isPopup=true;
        //don't call maptip constructor but that of super maptip.
        this.initConfig(conf);
        viewer.components.FeatureInfo.superclass.constructor.call(this, this.config);
        //make the balloon
        this.balloon = new Balloon(this.getDiv(),this.getViewerController().mapComponent,"balloonFeatureInfo",this.width,this.height);
        //set the offset of the map
        var mapTopOffset=this.config.viewerController.getLayoutHeight('top_menu');
        if (mapTopOffset<0){
            mapTopOffset=0;
        }
        this.balloon.offsetY+=Number(mapTopOffset);
        //show close button and dont close on mouse out.
        this.balloon.closeOnMouseOut=false;
        this.balloon.showCloseButton=true;
        var me = this;
        this.balloon.close = function(){            
            me.balloon.setContent("");
            me.balloon.hide();
            me.setMaptipEnabled(true);
        }
        //if topmenu height is in % then recalc on every resize.        
        var topMenuLayout=this.config.viewerController.getLayout('top_menu');
        if (topMenuLayout.heightmeasure && topMenuLayout.heightmeasure =="%"){
            Ext.on('resize', function(){
                me.onResize();            
            }, this);
        }
        this.onResize();
        //listen to the on addlayer
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onLayerRemoved,this);
         //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfoStart,this);
        //listen to a extent change
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT, this.onChangeExtent,this);
        return this;        
    },    
    /**
     * Event handler for when a layer is added to the map
     * @see event ON_LAYER_ADDED
     */
    onAddLayer: function(map,options){
        var mapLayer=options.layer;
        if (mapLayer==null)
            return;
        if (!this.isLayerConfigured(mapLayer)){
            return;
        }
        if(this.config.viewerController.isSummaryLayer(mapLayer)){   
            //Store the current map extent for every maptip request.            
            this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,function(map,options){
                this.setRequestExtent(map.getExtent());
            },this); 
            
            if (mapLayer.appLayerId){
                var appLayer=this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var layer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];

                //do server side getFeature.
                if (layer.hasFeatureType){
                    this.addLayerInServerRequest(appLayer);
                }else{
                    //listen to the onMaptipData
                    mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA,this.onMapData,this);       
                }            
                this.numRequestLayers++;
            }else{
                mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA,this.onMapData,this);
            }
        }
    },
    
    onLayerRemoved: function(map,options) {
        var mapLayer = options.layer;
        if (mapLayer==null)
            return;        
        if(this.viewerController.isSummaryLayer(mapLayer)){ 
            if (mapLayer.appLayerId){
                var appLayer=this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var layer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
                if (layer.hasFeatureType && this.serverRequestLayers){
                    Ext.Array.remove(this.serverRequestLayers, appLayer);
                }
            }
            this.numRequestLayers--;
        }

    },
        
    /**
     * Enable doing server requests.
     * @param appLayer the applayer
     */
    addLayerInServerRequest: function (appLayer){ 
        //first time register for event and make featureinfo ajax request handler.
        if (!this.serverRequestEnabled){
            this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.doServerRequest,this);
            //this.featureInfo=Ext.create("viewer.FeatureInfo", {viewerController: this.config.viewerController});
            this.requestManager = Ext.create(viewer.components.RequestManager,Ext.create("viewer.FeatureInfo", {viewerController: this.config.viewerController}), this.config.viewerController);
            
            this.serverRequestEnabled = true;
        }
        if (this.serverRequestLayers ==null){
            this.serverRequestLayers=new Array();
        }
        Ext.Array.include(this.serverRequestLayers, appLayer);
    },    
    /**
     * When a feature info starts.
     */
    onFeatureInfoStart: function(){
        this.balloon.setContent("");
        this.balloon.hide();
        this.setMaptipEnabled(false);
    },
    /**
     * 
     */
    onDataReturned: function(options){
        var found=false;
        var data = options.data;
        for (var layerIndex in data) {
            if(!data.hasOwnProperty(layerIndex)){
                continue;
            }
            var layer=data[layerIndex];
            for (var index in layer.features) {
                if(layer.features.hasOwnProperty(index)) {
                    found = true;
                    break;
                }
            }
            if(found){
                break;
            }
        }
        if (!found){
            this.setMaptipEnabled(true);
        } else {
            this.autoOpenFeatureInfoLinks(data);
        }
        this.callParent(arguments);        
    },
    autoOpenFeatureInfoLinks: function(data) {
        for (var layerIndex = 0; layerIndex < data.length; layerIndex++) {
            var layer = data[layerIndex];
            this.autoOpenLink(layer);
        }
    },
    autoOpenLink: function(layer) {
        var appLayer =  this.config.viewerController.app.appLayers[layer.request.appLayer];
        var details;
        if(appLayer) {
            details = appLayer.details;
        } else {
            details = this.config.viewerController.mapComponent.getMap().getLayer(layer.request.appLayer).getDetails();
        }
        if (!details || !details["summary.link"]) {
            return;
        }
        var noHtmlEncode = "true" === details['summary.noHtmlEncode'];
        var nl2br = "true" === details['summary.nl2br'];
        for (var index = 0 ; index < layer.features.length ; index ++) {
            var feature = layer.features[index];
            var link = this.replaceByAttributes(details["summary.link"], feature, noHtmlEncode, nl2br);
            window.open(link, '_blank' + (feature.__fid || feature.fid || ''));
        }
    },
    /**
     *Called when extent is changed, recalculate the position
     */
    onChangeExtent : function(map,options){        
        if (this.worldPosition && options.extent){
            if (options.extent.isIn(this.worldPosition.x,this.worldPosition.y)){
                this.balloon.setPositionWorldCoords(this.worldPosition.x,this.worldPosition.y,false,this.getBrowserZoomRatio());
            }else{
                this.balloon.hide();
            }
        }
    },
    /**
     * 
     */
     setMaptipEnabled: function (enable){        
        var maptips= this.config.viewerController.getComponentsByClassName("viewer.components.Maptip");
        for (var i =0; i < maptips.length;i++){
            if (typeof maptips[i].setEnabled == 'function'){
                maptips[i].setEnabled(enable);
            }
        } 
     }
            
});

