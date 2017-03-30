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
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    map: null,
    deactivatedControls: null,
    wmsGetFeatureInfoControl:null,
    wmsGetFeatureInfoFormat: "application/vnd.ogc.gml",
    useWMSGetFeatureInfo:null,
    active: false,
    layersToAdd:null,
    config: {
        maxFeatures: 1000
    },
    /**
     * Constructor
     * @param conf the configuration object
     * @param frameworkTool the openlayers control
     * @param map the viewer.viewercontroller.openlayers.OpenLayersMap
     */
    constructor : function (conf){
        this.useWMSGetFeatureInfo=true;
        //this.wmsGetFeatureInfoFormat="text/plain";

        var frameworkOptions = {
            displayClass: "olControlIdentify",
            type: OpenLayers.Control.TYPE_TOOL,
            title: conf.tooltip
        };        
        var frameworkTool= new OpenLayers.Control(frameworkOptions);
        viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        this.map=this.config.viewerController.mapComponent.getMap();
        
        this.mapClick=new viewer.viewercontroller.openlayers.ToolMapClick({
            id: "mapclick_"+this.id,
            viewerController: this.config.viewerController,
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
                        layers : this.layersToAdd,
                        maxFeatures: this.getMaxFeatures()
                    });  
                    
                this.wmsGetFeatureInfoControl.handleResponse = handleResponse;
                this.wmsGetFeatureInfoControl.buildWMSOptions = buildWMSOptions;
                this.wmsGetFeatureInfoControl.request = requestWmsGFI;
                this.wmsGetFeatureInfoControl.events.register("getfeatureinfo",this,this.raiseOnDataEvent);   
                //deegree handler:
                this.wmsGetFeatureInfoControl.format.read_FeatureCollection = this.readFeatureCollection;
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
                var appLayer=this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var confServiceLayer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
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
        var c = this.map.pixelToCoordinate(options.x, options.y);
        coord.x = c.x;
        coord.y = c.y;
        options.coord = coord;
        var featuresByLayer = new Object();
        for (var i = 0; i < evt.features.length; i++) {

            var feature = evt.features[i];
            var layerName = feature.type ? feature.type : feature.layerNames;
            var appLayer = this.getAppLayerByOpenLayersLayer(feature.url, layerName);
            if (appLayer === null) {
                // If appLayer is null, perhaps the OpenLayersWMSLayers has multiple layerNames in the layers parameter, so try it again with the layerNames
                appLayer = this.getAppLayerByOpenLayersLayer(feature.url, feature.layerNames);
            }
            if (!featuresByLayer.hasOwnProperty(appLayer.id)) {
                featuresByLayer[appLayer.id] = new Object();
            }
            if (!featuresByLayer[appLayer.id].hasOwnProperty(layerName)) {
                featuresByLayer[appLayer.id][layerName] = new Object();
                featuresByLayer[appLayer.id][layerName].appLayerObj = appLayer;
                featuresByLayer[appLayer.id][layerName].features = new Array();
            }
            featuresByLayer[appLayer.id][layerName].features.push(feature.attributes);
        }
        for (var applayer in featuresByLayer) {
            options.data = [];
            var groupedLayers = featuresByLayer[applayer];
            var appLayer = null;
            for (var lName in groupedLayers) {
                var features = groupedLayers[lName].features;
                var response = {
                    request: {
                        appLayer: applayer,
                        serviceLayer: lName
                    },
                    features: features,
                    appLayer: groupedLayers[lName].appLayerObj
                }
                appLayer = groupedLayers[lName].appLayerObj;
                options.data.push(response);
            }
            appLayer.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, options);
        }
    },
    getAppLayerByOpenLayersLayer : function(url, layerNames){
        var layers = this.map.layers;
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (layer.url === url) {
                var mapLayers= layer.getLayers();
                if (!(mapLayers instanceof Array)){
                    var array = [];
                    array.push(mapLayers);
                    mapLayers = array;
                }
                if (mapLayers.length === layerNames.length){
                    var allFound = true;
                    for (var j = 0; j < layerNames.length; j++) {
                        var found=false;
                        for (var l=0; l < mapLayers.length; l++){
                            if (mapLayers[l]=== layerNames[j]) {
                                found=true;
                                break;
                            }
                        }
                        if (!found){
                            allFound=false;
                            break;
                        }                        
                    }
                    var hasSummary = this.viewerController.isSummaryLayer(layer);
                    if (allFound && hasSummary){
                        return layer;
                    }
                }
            }
        }
        return null;
    },
    
    /**
     * Is called by the .format from the OpenLayers GetFeatureInfoControl to parse the xml
     * This parses the deegree
     * @param {DOMElement} Root DOM element
     */
    readFeatureCollection: function (data){
        var featureIdentifier = "featureMember";
        var layerNodes = this.getSiblingNodesByTagCriteria(data,
            featureIdentifier);
        var response = [];
        if (layerNodes) {
            for (var i=0, len=layerNodes.length; i<len; ++i) {
                if (layerNodes.hasOwnProperty(i)){
                    var featureNode = layerNodes[i].firstElementChild || layerNodes[i].firstChild || layerNodes[i].children[0] ||{};
                    if (featureNode){
                        var attributes = this.parseAttributes(featureNode);
                        var geomAttr = this.parseGeometry(featureNode);
                        var feature = new OpenLayers.Feature.Vector(geomAttr.geometry,
                            attributes,null);
                        feature.type = featureNode.localName || featureNode.baseName;
                        response.push(feature);
                    }
                }
            }
        }
        return response;
    }
});
