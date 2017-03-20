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
 * @class 
 * @constructor
 * @description
 * The openlayers map object wrapper
 */
Ext.define ("viewer.viewercontroller.openlayers.OpenLayersMap",{
    extend: "viewer.viewercontroller.controller.Map",
    layersLoading : null,
    utils:null,
    markerIcons:null,
    /**
     * @constructor
     * @see viewer.viewercontroller.controller.Map#constructor
     */  
    constructor: function(config){
        viewer.viewercontroller.openlayers.OpenLayersMap.superclass.constructor.call(this, config);        
        this.initConfig(config);
        this.utils = Ext.create("viewer.viewercontroller.openlayers.Utils");
        var maxBounds=null;
        if (config.options.maxExtent){
            maxBounds = this.utils.createBounds(config.options.maxExtent);
        }
        var startBounds;
        if (config.options.startExtent){
            startBounds= this.utils.createBounds(config.options.startExtent);
        }       
        //set the Center point
        if (startBounds){
            config.center = startBounds.getCenterLonLat();
        }else if (maxBounds){
            config.center = maxBounds.getCenterLonLat();
        }else{
            this.config.viewerController.logger.error("No bounds found, can't center viewport");
        }
        config.restrictedExtent = maxBounds;
        
        
        //create a click control that handles only single click     
        var me=this;
        
        //Overwrite default OpenLayers tools,don't set any mouse controls
        config.controls = [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.Navigation()
        ];
        this.frameworkMap = new OpenLayers.Map(config.domId,config); 
        this.frameworkMap.centerLayerContainer();
        /* Zoom to the start extent when the first layer is added
         * because openlayers needs the baselayer to zoom. After zooming, remove the listener.
         */
        if(config.options.startExtent){
            var me = this;
            var handler = function(){
                me.zoomToExtent(config.options.startExtent);            
                me.removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
            };
            this.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
        }
        this.layersLoading = 0;
        this.markerLayer=null;
        this.defaultIcon = {};
        this.markerIcons = {
            "default": contextPath + '/viewer-html/common/openlayers/img/marker.png',
            "spinner": contextPath + '/resources/images/spinner.gif'
        };
        this.markers=new Object();
        this.getFeatureInfoControl = null;
        this.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.layerRemoved, this);
        
        // Prevents the markerlayer to "disappear" beneath all the layers
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, function(){
            if(this.markerLayer){
                this.frameworkMap.setLayerIndex(this.markerLayer, this.frameworkMap.getNumLayers());
            }
        },this);
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
        //delete layer.getFrameworkLayer().id;
        var map = this.getFrameworkMap()
        var l = layer.getFrameworkLayer();
        try{
            map.addLayer(l);
        }catch(exception){
            this.config.viewerController.logger.error(exception);
        }
    },
    
    /**
    *remove the specific layer. See @link Map.removeLayer
    **/
    removeLayer : function(layer){
        //remove layer from framework
        this.getFrameworkMap().removeLayer(layer.getFrameworkLayer());
        /**
         *Dont call super because we listen to a remove of the layer with a listener
         *at the framework:
         *viewer.viewercontroller.openlayers.OpenLayersMap.superclass.removeLayer.call(this,layer);
         */       
    },
    
    layerRemoved : function (map, options){
        var l = options.layer.getFrameworkLayer();
        for ( var i = 0 ; i < this.layers.length ;i++){
            var frameworkLayer = this.layers[i].getFrameworkLayer();
            if(frameworkLayer.id == l.id){
                this.layers.splice(i,1);
                break;
            }
        }
    },
    
    setLayerVisible : function (layer, visible){
        this.superclass.setLayerVisible.call(this,layer,visible);
        layer.setVisible(visible);
    },
    
    /**
    * see @link Map.setLayerIndex
    */
    setLayerIndex : function (layer, newIndex){        
        this.getFrameworkMap().setLayerIndex(layer.getFrameworkLayer(),newIndex);
        return this.callParent(arguments);
    },

    /**
    * Sets the getfeatureinfo control of this map
    */
    setGetFeatureInfoControl : function (control){
        if( control.type != Tool.GET_FEATURE_INFO){
            throw ("Type of given control not of type GET_FEATURE_INFO, but: " + control.type);
        }
        this.getFeatureInfoControl = control;
    },

    /**
    * Move the viewport to the maxExtent. See @link Map.zoomToMaxExtent
    **/
    zoomToMaxExtent : function (){
        this.getFrameworkMap().zoomToExtent(this.getFrameworkMap().getMaxExtent());
    },
    /**
    * See @link Map.zoomToExtent
    **/
    zoomToExtent : function(extent){
        var bounds=this.utils.createBounds(extent)
        this.getFrameworkMap().zoomToExtent(bounds,true);
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
    * See @link viewer.viewercontroller.controller.Map#moveTo
    */
    moveTo: function(x,y){
        this.getFrameworkMap().panTo(new OpenLayers.LonLat(x,y));
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
    * See @link Map.getMaxExtent     
    */
    getMaxExtent : function(){
        return Utils.createExtent(this.getFrameworkMap().getMaxExtent());
    },
    
    /**
    * See @link Map.getExtent
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
        if (this.markerLayer===null){
            this.markerLayer = new OpenLayers.Layer.Markers("Markers");
            this.frameworkMap.addLayer(this.markerLayer);
        }
        if(!type){
            type = "default";
        }
        if(!Ext.isDefined(this.defaultIcon[type])){
            var size = new OpenLayers.Size(17,17);
            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
            var icon = this.markerIcons.hasOwnProperty(type) ? this.markerIcons[type] : this.markerIcons['default'];
            this.defaultIcon [type] =  new OpenLayers.Icon(icon, size, offset);
        }
        var defaultIcon = this.defaultIcon[type];
        var icon= defaultIcon.clone();
        if (this.markers[markerName]=== undefined){
            this.markers[markerName]= new OpenLayers.Marker(new OpenLayers.LonLat(x,y),icon);
            this.markerLayer.addMarker(this.markers[markerName]);
        }else{
            this.markers[markerName].moveTo(this.frameworkMap.getLayerPxFromLonLat(new OpenLayers.LonLat(x,y)));
        }
        
    },
    
    /**
    * see @link Map.removeMarker
    */
    removeMarker : function(markerName){
        if (this.markers[markerName] && this.markerLayer!=null){
            this.markerLayer.removeMarker(this.markers[markerName]);
            this.markers[markerName].destroy(); 
            delete this.markers[markerName];            
        }
    },
    
    /**
     * @see Ext.util.Observable#addListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the addListener. Register event on the OpenLayers Map (only once)
     * If the event is thrown by the OpenLayers event the given handlers are called.
     */
    addListener : function(event,handler,scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /* Add event to OpenLayersMap only once, to prevent multiple fired events.    
             * count the events for removing the listener again.
             */
            if(this.enabledEvents[olSpecificEvent]){
                this.enabledEvents[olSpecificEvent]++;                
            }else{
                this.enabledEvents[olSpecificEvent] = 1;
                this.frameworkMap.events.register(olSpecificEvent, this, this.handleEvent);
            }
        }
        viewer.viewercontroller.openlayers.OpenLayersMap.superclass.addListener.call(this,event,handler,scope);
    },
    
    /**
     * @see Ext.util.Observable#removeListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the removeListener. Unregister the event on the OpenLayers Map if there
     * are no listeners anymore.     
     */
    removeListener : function (event,handler,scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /* Remove event from OpenLayersMap if the number of events == 0
             * If there are no listeners for the OpenLayers event, remove the listener.             
             */
            if(this.enabledEvents[olSpecificEvent]){
                this.enabledEvents[olSpecificEvent]--;
                if (this.enabledEvents[olSpecificEvent] <= 0){
                    this.enabledEvents[olSpecificEvent]=0;
                    this.frameworkMap.events.unregister(olSpecificEvent, this, this.handleEvent);
                }
            }            
            viewer.viewercontroller.openlayers.OpenLayersMap.superclass.removeListener.call(this,event,handler,scope);
        }else{
            this.viewerController.logger.warning("Event not listed in OpenLayersMapComponent >"+ event + "<. The application  might not work correctly.");
        }
    },
    
    /**
     * Handles the events fired by OpenLayers.Map and propagates them to the registered objects.
     *
     */
    handleEvent : function(args){
        var event = args.type;
        var options={};
        var genericEvent = this.config.viewerController.mapComponent.getGenericEventName(event);
        if (genericEvent==viewer.viewercontroller.controller.Event.ON_LAYER_ADDED){
            options.layer=this.getLayerByOpenLayersId(args.layer.id);
            if (options.layer ==undefined){
                //if no layer found return, dont fire
                return;
            }
        }else if (genericEvent== viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED){
            options.layer=this.getLayerByOpenLayersId(args.layer.id);
            if (options.layer ==undefined){
                //if no layer found return, dont fire
                return;
            }
            options.visible=args.layer.visibility;
        }else if (genericEvent==viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED){
            options.layer=this.getLayerByOpenLayersId(args.layer.id);
            if (options.layer ==undefined){
                //if no layer found return, dont fire
                return;
            }
        }else if (genericEvent==viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT ||
                  genericEvent==viewer.viewercontroller.controller.Event.ON_ZOOM_END ||
                  genericEvent==viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT){
            options.extent=this.getExtent();
        }else{
            this.config.viewerController.logger.error("The event "+genericEvent+" is not implemented in the OpenLayersMap.handleEvent()");
        }
        this.fireEvent(genericEvent,this,options);
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
     *See @link Map.getResolutions
     */
    getResolutions : function(){
        return this.getFrameworkMap().resolutions;
    },
    /**
    *See @link Map.coordinateToPixel
    *@returns a OpenLayers.pixel object (has a .x and a .y)
    */
    coordinateToPixel : function(x,y){
        return this.getFrameworkMap().getPixelFromLonLat(new OpenLayers.LonLat(x,y));
    },
    
    pixelToCoordinate : function (x,y){
        var lonLat = this.getFrameworkMap().getLonLatFromPixel(new OpenLayers.Pixel(x,y));
        return {x: lonLat.lon,y: lonLat.lat};
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
    updateSize : function(){
        this.getFrameworkMap().updateSize();
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
