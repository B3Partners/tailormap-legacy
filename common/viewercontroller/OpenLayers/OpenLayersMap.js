/**
 * @class 
 * @constructor
 * @description
 *The openlayers map object wrapper
 */
Ext.define ("viewer.viewercontroller.openlayers.OpenLayersMap",{
    extend: "viewer.viewercontroller.controller.Map",
    frameworkMap:null,
    layersLoading : null,
    config:{
        viewerController:null
    },
    constructor: function(config,frameworkMap){
        this.initConfig(config);
        this.frameworkMap = frameworkMap;
        this.frameworkMap.centerLayerContainer();
        viewer.viewercontroller.openlayers.OpenLayersMap.superclass.constructor.call(this, config);
         if (!( this.frameworkMap instanceof OpenLayers.Map)){
            throw("The given map is not of the type 'OpenLayers.Map'");
        }
        this.layersLoading = 0;
        this.markerLayer=null;
        this.defaultIcon=null;
        this.markers=new Object();
        this.getFeatureInfoControl = null;     
        return this;
    },

    /**
    *See @link Map.getAllWMSLayers
    */
    getAllWMSLayers : function(){
        var lagen = new Array();
        for(var i = 0 ; i < this.layers.length;i++){
            if(this.layers[i] instanceof OpenLayersWMSLayer){
                lagen.push(this.layers[i]);
            }
        }
        return lagen;
    },
    /**
    *See @link Map.getAllVectorLayers
    */
    getAllVectorLayers : function(){
        var lagen = new Array();
        for(var i = 0 ; i < this.layers.length;i++){
            if(this.layers[i] instanceof OpenLayersVectorLayer){
                lagen.push(this.layers[i]);
            }
        }
        return lagen;
    },

    /**
        *See @link Map.remove
        */
    remove : function(){
        this.getFrameworkMap().destroy();
    },

    /**
        *Add a layer. Also see @link Map.addLayer
        **/
    addLayer : function(layer){
        if (!(layer instanceof viewer.viewercontroller.openlayers.OpenLayersLayer)){
            throw("The given layer is not of the type 'viewer.viewercontroller.openlayers.OpenLayersLayer'. But: "+layer);
        }
        this.layers.push(layer);
        if (layer instanceof viewer.viewercontroller.openlayers.OpenLayersWMSLayer){
           /* if (layer.getGetFeatureInfoControl()!=null){
                var info=layer.getGetFeatureInfoControl();
                this.getFrameworkMap().addControl(info);
                info.events.register("getfeatureinfo",this.viewerController.mapComponent, this.viewerController.mapComponent.onIdentifyDataHandler,this.viewerController.mapComponent);
                //map.getFrameworkMap().events.register('click', this, this.beforeidentifyafasdfasdf);
                //  info.events.register("beforegetfeatureinfo",webMapController, webMapController.onIdentifyHandler);

                //this.getGetFeatureInfoControl().addControl(info);
                //check if a getFeature tool is active.
                var getFeatureTools=this.viewerController.mapComponent.getToolsByType(Tool.GET_FEATURE_INFO);
                for (var i=0; i < getFeatureTools.length; i++){
                    if (getFeatureTools[i].isActive()){
                        info.activate();
                    }
                }
            }
            if (layer.getMapTipControl()!=null){
                var maptipControl=layer.getMapTipControl();
                this.getFrameworkMap().addControl(maptipControl);
                maptipControl.events.register("getfeatureinfo",layer, this.viewerController.mapComponent.onMapTipHandler);
                maptipControl.activate();
            }

            if(this.viewerController.mapComponent.events[this.viewerController.mapComponent.getSpecificEventName(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE)] != null){
                layer.register(viewer.viewercontroller.controller.Event.ON_LOADING_END,this.layerFinishedLoading);
                layer.register(viewer.viewercontroller.controller.Event.ON_LOADING_START,this.layerBeginLoading);
            }*/
        }
        this.getFrameworkMap().addLayer(layer.getFrameworkLayer());
        this.fire(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,{
            layer: layer
        });
    },
    /**
        *remove the specific layer. See @link Map.removeLayer
        **/
    removeLayer : function(layer){
        if (!(layer instanceof OpenLayersLayer))
            throw("OpenLayersMap.removeLayer(): Given layer not of type OpenLayersLayer");
        //call super function
        Map.prototype.removeLayer.call(this,layer);
        //this.getFrameworkMap().remove(layer.getFrameworkLayer());
        if (layer instanceof OpenLayersWMSLayer){
            if(layer.getGetFeatureInfoControl()!=null){
                layer.getGetFeatureInfoControl().destroy();
            }
            if (layer.getMapTipControl()!=null){
                layer.getMapTipControl().destroy();
            }
        }
        layer.getFrameworkLayer().destroy(false);
    },
    setLayerVisible : function (layer, visible){
        this.superclass.setLayerVisible.call(this,layer,visible);
        layer.setVisible(visible);
    },
    /**
        *see @link Map.setLayerIndex
        */
    setLayerIndex : function (layer, newIndex){
        if (!(layer instanceof OpenLayersLayer)){
            throw("OpenLayersMap.setLayerIndex(): Given layer not of type OpenLayersLayer.");
        }
        this.getFrameworkMap().setLayerIndex(layer.getFrameworkLayer(),newIndex);
        return Map.prototype.setLayerIndex(layer,newIndex);
    },

    /**
    *Sets the getfeatureinfo control of this map
    */
    setGetFeatureInfoControl : function (control){
        if( control.type != Tool.GET_FEATURE_INFO){
            throw ("Type of given control not of type GET_FEATURE_INFO, but: " + control.type);
        }
        this.getFeatureInfoControl = control;
    },

    /**
        *Move the viewport to the maxExtent. See @link Map.zoomToMaxExtent
        **/
    zoomToMaxExtent : function (){
        this.getFrameworkMap().zoomToExtent(this.getFrameworkMap().getMaxExtent());
    },
    /**
        *See @link Map.zoomToExtent
        **/
    zoomToExtent : function(extent){
        var bounds=Utils.createBounds(extent)
        this.getFrameworkMap().zoomToExtent(bounds);
    },
    /**
    * See @link Map.zoomToScale
    * @deprecated, use zoomToResolution because it zooms to a resolution and not a scale
    */
    zoomToScale : function(scale){
        this.getFrameworkMap().zoomToResolution(scale);
    },
    /**
    * See @link Map.zoomToResolution
    */
    zoomToResolution : function(resolution){
        this.getFrameworkMap().zoomTo(this.getFrameworkMap().getZoomForResolution(resolution));
    },

    /**
        * See @link Map.setMaxExtent
        * WARNING: Bug in openlayers: doesn't change the maxextent
        * As workaround add the maxExtent when initing the map
        */
    setMaxExtent : function(extent){
        this.getFrameworkMap().setOptions({
            maxExtent: Utils.createBounds(extent)
        });
    },
    /**
        *See @link Map.getMaxExtent     
        */
    getMaxExtent : function(){
        return Utils.createExtent(this.getFrameworkMap().getMaxExtent());
    },
    /**
        *See @link Map.getExtent
        */
    getExtent : function(){
        var extent = Utils.createExtent(this.getFrameworkMap().getExtent());
        var genericExtent = new Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
        return genericExtent;
    },
    /*TODO:
        doIdentify : function(x,y){}
        update : function(){}    
        removeMarker : function(markerName){}
        */
    /**
        *see @link Map.setMarker
        *TODO: marker icon path...
        */
    setMarker : function(markerName,x,y,type){
        if (this.markerLayer==null){
            this.markerLayer = new OpenLayers.Layer.Markers("Markers");
            this.frameworkMap.addLayer(this.markerLayer);
            var size = new OpenLayers.Size(17,17);
            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
            this.defaultIcon= new OpenLayers.Icon('scripts/openlayers/img/marker.png',size,offset);
        }
        /*According the 'type' load a icon: no types yet only default*/
        var icon= this.defaultIcon.clone();
        this.markers[markerName]= new OpenLayers.Marker(new OpenLayers.LonLat(x,y),icon);
        this.markerLayer.addMarker(this.markers[markerName]);
    },
    /**
        *see @link Map.removeMarker
        */
    removeMarker : function(markerName){
        if (this.markers[markerName] && this.markerLayer!=null){
            this.markerLayer.removeMarker(this.markers[markerName]);
        }
    },

    register : function (event,handler,thisObj){
        if (thisObj==undefined){
            thisObj=this;
        }
        var specificName = webMapController.getSpecificEventName(event);
        if(this.getFrameworkMap().eventListeners == null){
            this.getFrameworkMap().eventListeners = new Object();
        }

        if(event == viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE){
            var wmsLayers = this.getAllWMSLayers();
            for(var i = 0 ; i < wmsLayers.length ; i++){
                var layer = wmsLayers[i];
                layer.register(event,this.layerFinishedLoading);
                layer.register(viewer.viewercontroller.controller.Event.ON_LOADING_START,this.layerBeginLoading);
            }
            webMapController.register(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE, handler);
        }else{
            //this.getFrameworkMap().eventListeners [specificName]= handler;        
            this.getFrameworkMap().events.register(specificName,thisObj,handler);
        }
    },

    unRegister : function (event,handler,thisObj){
        var specificName = webMapController.getSpecificEventName(event);
        if (event == viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE){
            webMapController.unRegister(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE, handler);
        }
        this.getFrameworkMap().events.unregister(specificName,thisObj,handler);
    },
    /**
    *See @link Map.getScale
    *@deprecated, use getResolution because it returns the resolution and not the scale
    */
    getScale : function(){
        return this.getResolution();
    },
    /**
    *See @link Map.getResolution
    */
    getResolution : function(){
        return this.getFrameworkMap().getResolution();
    },
    /**
    *See @link Map.coordinateToPixel
    *@returns a OpenLayers.pixel object (has a .x and a .y)
    */
    coordinateToPixel : function(x,y){
        return this.getFrameworkMap().getPixelFromLonLat(new OpenLayers.LonLat(x,y));
    },

    /**
    *see @link Map.getCenter
    *@return a OpenLayers.LonLat object with .x references to .lon and .y references to .lat
    */
    getCenter : function(){
        var lonlat=this.getFrameworkMap().getCenter();
        lonlat.x=lonlat.lon;
        lonlat.y=lonlat.lat;
        return lonlat;
    },

    layerFinishedLoading : function (id,data,c,d){
        this.layersLoading--;    
        if (this.layersLoading==0){
            webMapController.handleEvent(webMapController.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE]);
        }else if (this.layersLoading < 0){
            this.layersLoading=0;
        }
    },

    layerBeginLoading : function (id,data,c,d){
        this.layersLoading++;
    }
});