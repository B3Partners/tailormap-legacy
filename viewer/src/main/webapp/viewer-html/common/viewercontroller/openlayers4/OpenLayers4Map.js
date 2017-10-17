/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global ol */

Ext.define ("viewer.viewercontroller.openlayers4.OpenLayers4Map",{
    extend: "viewer.viewercontroller.controller.Map",
    layersLoading : null,
    utils:null,
    markerIcons:null,
    restrictedExtent:null,
    /**
     * @constructor
     * @see viewer.viewercontroller.controller.Map#constructor
     */  
    constructor: function(config){
        viewer.viewercontroller.openlayers4.OpenLayers4Map.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.utils = Ext.create("viewer.viewercontroller.openlayers4.Utils");
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
            config.center = [(startBounds[0]+startBounds[2])/2, (startBounds[1]+startBounds[3])/2];
        }else if (maxBounds){
            config.center = [(maxBounds[0]+maxBounds[2])/2, (maxBounds[1]+maxBounds[3])/2];
        }else{
            this.config.viewerController.logger.error("No bounds found, can't center viewport");
        }
 
        config.restrictedExtent = maxBounds;
        this.frameworkMap = new ol.Map({
        target: config.domId,
        controls: [],
        interactions: [new ol.interaction.MouseWheelZoom()],
        keyboardEventTarget: document,
        view: new ol.View({
            projection: config.projection,
            center: config.center,
            resolution: config.resolution,
            resolutions: config.resolutions,
            extent: config.restrictedExtent
        })
    });
    
        this.restrictedExtent = config.restrictedExtent;
        this.group = new ol.layer.Group();
        this.frameworkMap.setLayerGroup(this.group);
        
    
        if(config.options.startExtent){
            var me = this;
            var handler = function(){
                me.zoomToExtent(config.options.startExtent);            
                me.removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
            };
            this.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
            this.group.getLayers().on("add",this.handleEvent,this);
        }
    
    this.group.getLayers().on('remove',this.handleEvent,this);
    
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
                this.markerLayer.setZIndex(this.frameworkMap.getLayers().getLength()+1);
            }
        },this);
    
    
    return this;
     },
         
     addLayer : function(layer){
        this.superclass.addLayer.call(this,layer);   
        //delete layer.getFrameworkLayer().id;
        var map = this.getFrameworkMap();
        var l = layer.getFrameworkLayer();
        if(layer.id==undefined){
            layer.id=layer.name;
        }
        try{
            l.set('id',layer.id,false);
            l.on("change:visible",function(evt){
                layer.tempType = evt.type;
                this.handleEvent(layer);},this);
            map.addLayer(l);
        }catch(exception){
            this.config.viewerController.logger.error(exception);
        }
    },
    
    removeLayer : function(layer){
        //remove layer from framework
        this.getFrameworkMap().removeLayer(layer.getFrameworkLayer());
        /**
         *Dont call super because we listen to a remove of the layer with a listener
         *at the framework:
         *viewer.viewercontroller.openlayers.OpenLayersMap.superclass.removeLayer.call(this,layer);
         */       
    },
    
    
    setLayerVisible : function(layer, visible){
        this.superclass.setLayerVisible.call(this,layer,visible);
        layer.setVisible(visible);
    },
     
     updateSize : function(){
         this.getFrameworkMap().updateSize();
     },
     
     getResolution : function(){
         return this.getFrameworkMap().getView().getResolution();
     },
     
     getScale : function(){
        return this.getFrameworkMap().getView().getResolution();
    },
    moveTo: function(x,y){
        var center = [x,y];
        this.getFrameworkMap().getView().setCenter(center);
        new ol.geom.Point(center);
    },
    
    setMarker : function(markerName,x,y,type){
        if(this.markers[markerName]=== undefined){
        var positionFeature = new ol.Feature();
        positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                   src:this.markerIcons.default
            })
        }));
        
        var center = [x,y];
        positionFeature.setGeometry(new ol.geom.Point(center));
        this.markers[markerName] = positionFeature;   
        }else{
            this.markers[markerName].setGeometry(new ol.geom.Point([x,y]));
            return;
        }
        if(this.markerLayer===null){
            this.markerLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [this.markers[markerName]]
                })
            });
            this.frameworkMap.addLayer(this.markerLayer);
        }else{
            this.markerLayer.getSource().addFeature(this.markers[markerName]);
        }
    },
    
    removeMarker : function(markerName){
        if (this.markers[markerName] && this.markerLayer!=null){
            this.markerLayer.getSource().removeFeature(this.markers[markerName]);
            //this.markers[markerName].destroy(); 
            delete this.markers[markerName];
        }
    },
    
    zoomToExtent : function(extent){
            var bounds=this.utils.createBounds(extent);
            this.frameworkMap.getView().fit(bounds, this.frameworkMap.getSize()); 
    },
    
    handleEvent : function(args){
        if(args.tempType){
            var event = args.tempType;
        }else{
            var event = args.type;
        }
        var options={};
        var genericEvent = this.config.viewerController.mapComponent.getGenericEventName(event);
        if (genericEvent==viewer.viewercontroller.controller.Event.ON_LAYER_ADDED){
            args.id = args.element.get('id');
            options.layer=this.getLayerByOpenLayersId(args.id);
            if (options.layer ==undefined){
                //if no layer found return, dont fire
                return;
            }
        }else if (genericEvent== viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED){
            
            options.layer=this.getLayerByOpenLayersId(args.id);
            if (options.layer ==undefined){
                
                //if no layer found return, dont fire
                return;
            }
            options.visible=options.layer.visible;
        }else if (genericEvent==viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED){
            args.id = args.element.get('id');
            options.layer=this.getLayerByOpenLayersId(args.id);
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
    
    getLayerByOpenLayersId: function(olId){
        for (var i=0; i < this.layers.length; i++){
            if (this.layers[i].frameworkLayer){
                if (this.layers[i].id == olId){
                    return this.layers[i];
                }
            }
        }
    },
    
    layerRemoved : function (map, options){
        var l = options.layer.getFrameworkLayer();
        for ( var i = 0 ; i < this.layers.length ;i++){
            var frameworkLayer = this.layers[i].getFrameworkLayer();
            if(frameworkLayer.get('id') == l.get('id')){
                this.layers.splice(i,1);
                break;
            }
        }
    },
    
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
                this.frameworkMap.on(olSpecificEvent,this.handleEvent, this);
            }
        }
        viewer.viewercontroller.openlayers4.OpenLayers4Map.superclass.addListener.call(this,event,handler,scope);
    },
    
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
                    this.frameworkMap.un(olSpecificEvent,this.handleEvent,this);
                }
            }            
            viewer.viewercontroller.openlayers4.OpenLayers4Map.superclass.removeListener.call(this,event,handler,scope);
        }else{
            this.viewerController.logger.warning("Event not listed in OpenLayersMapComponent >"+ event + "<. The application  might not work correctly.");
        }
    },
    
    getWidth : function(){
        var size = this.frameworkMap.getSize();
        return size[0];
    },
    
    getHeight : function (){
        var size = this.frameworkMap.getSize();
        return size[1];
    },
    
    
    getExtent : function(){
        //var extent = this.getFrameworkMap().getView().getProjection().getExtent();
        var extent = this.getFrameworkMap().getView().calculateExtent(this.getFrameworkMap().getSize());
        return extent;
    },
    
    getRestrictedExtent : function(){
        return this.restrictedExtent;
    }
    });
