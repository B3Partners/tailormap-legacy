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
    utils:null,
    config:{
        viewerController:null
    },
    constructor: function(config){
        viewer.viewercontroller.openlayers.OpenLayersMap.superclass.constructor.call(this, config);        
        this.initConfig(config);
        this.utils = Ext.create("viewer.viewercontroller.openlayers.Utils");
        var maxBounds=null;
        if (config.maxExtent){
            //maxBounds = new OpenLayers.Bounds(config.maxExtent.minx,config.maxExtent.miny,config.maxExtent.maxx,config.maxExtent.maxy);
            maxBounds= new OpenLayers.Bounds(120000,304000,280000,620000);
        }else{
            //fallback for bounds.
            maxBounds= new OpenLayers.Bounds(120000,304000,280000,620000);
        }
        config["center"] = maxBounds.getCenterLonLat();
        
        config.maxExtent = maxBounds;
        
        this.frameworkMap=new OpenLayers.Map(config.domId,config);
        this.frameworkMap.centerLayerContainer();
      
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
        this.superclass.addLayer.call(this,layer);
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
    },
    /**
        *remove the specific layer. See @link Map.removeLayer
        **/
    removeLayer : function(layer){
        //call super function
        this.superclass.removeLayer.call(this,layer);
        //this.getFrameworkMap().remove(layer.getFrameworkLayer());
        if (layer instanceof viewer.viewercontroller.openlayers.OpenLayersWMSLayer){
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
        if (this.getFrameworkMap()!=null){
            this.getFrameworkMap().setOptions({
                maxExtent: Utils.createBounds(extent)
            }); 
        }
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
        var extent = this.utils.createExtent(this.getFrameworkMap().getExtent());
        return extent;
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
    registerEvent : function(event,handler,scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /*
             *Don't know what this does, so commented out. Seems to be working fine without it, but maybe it's usefull
             *if(this.getFrameworkMap().eventListeners == null){
                this.getFrameworkMap().eventListeners = new Object();
            }*/
            this.frameworkMap.events.register(olSpecificEvent, this, this.handleEvent);
            this.addListener(event, handler, scope);
        }else{
            this.viewerController.warning("Event not listed in OpenLayersMapComponent >"+ event + "<. The application  might not work correctly.");
        }
    },

    handleEvent : function(args){
        var event = args.type;
        var options={};
        var genericEvent = this.viewerController.mapComponent.getGenericEventName(event);
        if (genericEvent==viewer.viewercontroller.controller.Event.ON_LAYER_ADDED){
            options.layer=this.getLayerByOpenLayersId(args.layer.id);
        }else if (genericEvent== viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED){
            options.layer=this.getLayerByOpenLayersId(args.layer.id);
            options.visible=args.layer.visible;
        }else{
            this.viewerController.logger.error("The event "+genericEvent+" is not implemented in the OpenLayersMap.handleEvent()");
        }
        this.fireEvent(genericEvent,this,options);
    },

    unRegisterEvent : function (event,handler,thisObj){
        var specificName = this.viewerController.mapComponent.getSpecificEventName(event);
        this.getFrameworkMap().events.unregister(specificName,handler,thisObj);
        this.removeListener(event,handler,thisObj);
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

    getWidth : function(){
        var size = this.frameworkMap.getSize();
        return size.w;
    },
    
    getHeight : function (){
        var size = this.frameworkMap.getSize();
        return size.h;
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
    },
    /**
     * The OpenLayers ID can't be changed. With this function you can get the 
     * viewer.viewercontroller.openlayers.OpenLayersLayer with the openlayersid
     * @param olId the openlayers id of the layer
     * @return a viewer.viewercontroller.openlayers.OpenLayersLayer that 
     * contains the openlayers layer with the given id.
     */
    getLayerByOpenLayersId: function(olId){
        for (var i=0; i < this.layers.length; i++){
            if (this.layers[i].frameworkLayer){
                if (this.layers[i].frameworkLayer.id == olId){
                    return this.layers[i];
                }
            }
        }
    }
});