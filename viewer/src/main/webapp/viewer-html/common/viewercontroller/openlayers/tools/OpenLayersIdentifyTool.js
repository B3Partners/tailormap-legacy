/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class 
 * @constructor
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    map: null,
    deactivatedControls: null,
    wmsGetFeatureInfoControl:null,
    wmsGetFeatureInfoFormat: null,
    useWMSGetFeatureInfo:null,
    active: false,
    layersToAdd:null,
    /**
     * Constructor
     * @param conf the configuration object
     * @param frameworkTool the openlayers control
     * @param map the viewer.viewercontroller.openlayers.OpenLayersMap
     */
    constructor : function (conf){
        this.wmsGetFeatureInfoFormat="application/vnd.ogc.gml";
        this.useWMSGetFeatureInfo=true;
        //this.wmsGetFeatureInfoFormat="text/plain";
        
        var frameworkOptions = {
            displayClass: "olControlIdentify",
            type: OpenLayers.Control.TYPE_TOOL,
            title: conf.tooltip
        };        
        var frameworkTool= new OpenLayers.Control(frameworkOptions);
        viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        this.map=this.viewerController.mapComponent.getMap();
        
        this.mapClick=new viewer.viewercontroller.openlayers.ToolMapClick({
            id: "mapclick_"+this.id,
            viewerController: this.viewerController,
            handler: {
                    fn: this.handleClick,
                    scope: this
            },
            handlerOptions: {                
                'stopSingle': true
            }
        });
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onRemoveLayer,this);
        
        this.setUseWMSGetFeatureInfo(this.useWMSGetFeatureInfo);
        // activate/deactivate
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);
        return this;
    },
    setUseWMSGetFeatureInfo: function (val){
        this.useWMSGetFeatureInfo=val;
        if (this.useWMSGetFeatureInfo){
            if (this.wmsGetFeatureInfoControl==null){
                // add wms get featureInfo
                if (this.layersToAdd==null){
                    this.layersToAdd=[];
                }
                this.wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                        drillDown: true,
                        queryVisible: true,
                        infoFormat: this.wmsGetFeatureInfoFormat,
                        layers : this.layersToAdd
                    });  
                    
                this.wmsGetFeatureInfoControl.handleResponse = handleResponse;
                this.wmsGetFeatureInfoControl.buildWMSOptions = buildWMSOptions;
                this.wmsGetFeatureInfoControl.events.register("getfeatureinfo",this,this.raiseOnDataEvent);            
                this.map.getFrameworkMap().addControl(this.wmsGetFeatureInfoControl);
                
                //set proxy for getFeatureInfoRequests:
                OpenLayers.ProxyHost = contextPath+"/action/proxy/wms?url=";
            }
            if (this.active){
                this.wmsGetFeatureInfoControl.activate();
            }else{
                this.wmsGetFeatureInfoControl.deactivate();
            }
        }else{
            if (this.wmsGetFeatureInfoControl!=null){
                this.wmsGetFeatureInfoControl.deactivate();
            }
        }
    },
    /**
     * Called when a layer is added
     */
    onAddLayer: function(map,options){        
        var mapLayer=options.layer;
        if (mapLayer==null || !(mapLayer instanceof viewer.viewercontroller.controller.WMSLayer)){
            return;
        }
        var details = mapLayer.getDetails();
        //something to show?
        if (details !=undefined &&
            (!Ext.isEmpty(details["summary.description"]) ||
                !Ext.isEmpty(details["summary.image"]) ||
                !Ext.isEmpty(details["summary.link"]) ||
                !Ext.isEmpty(details["summary.title"]))){
            var doClientWms=true;
            if (mapLayer.appLayerId){
                var appLayer=this.viewerController.app.appLayers[mapLayer.appLayerId];
                var confServiceLayer = this.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
                //do server side getFeature.
                if (confServiceLayer.hasFeatureType){
                    doClientWms=false;
                }
            }
            if (doClientWms){
                this.addWmsClientLayer(mapLayer);
            }
            
        }
    },
    /**
     * Called when a layer is removed
     */
    onRemoveLayer: function(map,options) {
        var mapLayer=options.layer;
        if (mapLayer==null 
                || !(mapLayer instanceof viewer.viewercontroller.controller.WMSLayer)){
            return;
        }
        this.removeWmsClientLayer(mapLayer);
        
    },
    addWmsClientLayer: function(mapLayer){
        var layer = mapLayer.getFrameworkLayer();
        if (this.wmsGetFeatureInfoControl != null){
            if (this.wmsGetFeatureInfoControl.layers==null){
                this.wmsGetFeatureInfoControl.layers=[];
            }
            this.wmsGetFeatureInfoControl.layers.push(layer);
        }else{
            if (this.layersToAdd ==null){
                this.layersToAdd=[];
            }
            this.layersToAdd.push(layer);
        }
    },
    removeWmsClientLayer: function(mapLayer){
        var layer = mapLayer.getFrameworkLayer();
        if (this.wmsGetFeatureInfoControl != null){
            if (this.wmsGetFeatureInfoControl.layers!=null){
                this.wmsGetFeatureInfoControl.layers= Ext.Array.remove(this.wmsGetFeatureInfoControl.layers,layer);
            }
        }else if (this.layersToAdd!=null){
            this.layersToAdd=Ext.Array.remove(this.layersToAdd,layer);
        }
    },
    activate: function(){
        //if mobile: disable the navigation control. To make sure the click can be handled
        //Click won't be handled if there is a navigation controller enabled (for mobile) 
        if (MobileManager.isMobile()){
            if (this.deactivatedControls==null){
                this.deactivatedControls=[];
            }
            var navigationTools= this.map.getFrameworkMap().getControlsByClass("OpenLayers.Control.Navigation");
            for (var i=0; i < navigationTools.length; i++){
                if (navigationTools[i].active){
                    this.deactivatedControls.push(navigationTools[i]);
                    navigationTools[i].deactivate();
                }
            }
        }
        this.active=true;
        //set dragPan.activate();
        //this.map.getFrameworkMap().events.register("click", this, this.handleClick);    
        this.mapClick.activateTool();
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.activate();
        }
    },
    deactivate: function(){
        //if mobile: enable the disactivated controls again
        if (MobileManager.isMobile()){
            while (!Ext.isEmpty(this.deactivatedControls)){
                var disCont = this.deactivatedControls.pop();
                disCont.activate();
            }
        }
        this.active=false;
        //this.map.getFrameworkMap().events.unregister("click", this, this.handleClick);
        this.mapClick.deactivateTool();
        //
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.deactivate();
        }
    },
    handleClick: function(tool,options){                
        this.map.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    }, 
    //called when wms layers return data.           
    raiseOnDataEvent: function(evt){
        var options = new Object();  
        options.x = evt.xy.x;
        options.y = evt.xy.y;
        var coord = new Object();
        var c = this.map.pixelToCoordinate(options.x,options.y);
        coord.x = c.x;
        coord.y = c.y;        
        options.coord=coord;
        var data=[];
        var featuresByLayer = new Object();
        for (var i=0; i< evt.features.length; i++){
            
            var feature = evt.features[i];
            var appLayer = this.getAppLayerByOpenLayersLayer(feature.url,feature.layerNames);
            if (!featuresByLayer.hasOwnProperty(appLayer.id)) {
                featuresByLayer[appLayer.id] = new Object();
                featuresByLayer[appLayer.id].features = new Array();
                featuresByLayer[appLayer.id].appLayerObj = appLayer;             
            }
            featuresByLayer[appLayer.id].features.push(feature.attributes);
        } 

        for(var applayer in featuresByLayer){
            var groupedFeatures = featuresByLayer[applayer];
            var features = groupedFeatures.features;
              var response  = {
                    request: {
                        appLayer: appLayer.id,
                        serviceLayer: feature.layerNames
                    },
                    features: features,
                    appLayer: appLayer
            };
            options.data = new Object();
            options.data[appLayer.id] =response;
       
            groupedFeatures.appLayerObj.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, options);

        }
        
    },
    getAppLayerByOpenLayersLayer : function(url, layerNames){
        var layers = this.map.layers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (layer.url === url) {
                for (var j = 0; j < layerNames.length; j++) {

                    if (layer.options.name === layerNames[j]) {
                        return layer;
                    }
                }
            }
        }
        return null;
    }
    
});