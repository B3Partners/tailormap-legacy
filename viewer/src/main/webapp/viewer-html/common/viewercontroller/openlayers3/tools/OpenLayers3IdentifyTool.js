/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global handleResponse, requestWmsGFI, buildWMSOtions */

Ext.define("viewer.viewercontroller.openlayers3.tools.OpenLayers3IdentifyTool",{
    extend: "viewer.viewercontroller.openlayers3.OpenLayers3Tool",
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
        
        conf.id = conf.tooltip;
        conf.class = "ol-Measure";
        conf.onlyClick = false;
        conf.actives =false;


        this.mapComponent = conf.viewerController.mapComponent;
        viewer.viewercontroller.openlayers3.tools.OpenLayers3IdentifyTool.superclass.constructor.call(this,conf,this);
        this.map=this.config.viewerController.mapComponent.getMap();
        
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onRemoveLayer,this);
        
        //this.setUseWMSGetFeatureInfo(this.useWMSGetFeatureInfo);
        
        return this;
    },
    
    activate: function(){
        this.conf.actives =true;
        this.tempKey = this.mapComponent.maps[0].getFrameworkMap().on('singleclick',function(evt){  
            var crd = evt.coordinate;
            var pix = evt.pixel;
            
            var options ={
            x:pix[0],
            y:pix[1],
            coord: {
                x:crd[0],
                y:crd[1]
            }
        };
            this.handleClick(this,options);
        },this);
    },
    
    deactivate: function(){
        this.conf.actives = false;
        ol.Observable.unByKey(this.tempKey);
       
    },
    
    isActive : function(){
        return this.conf.actives;
    },
    
    handleClick: function(tool,options){    
        console.log('fired');
        this.map.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    },
    
    
    setUseWMSGetFeatureInfo: function (val){
        this.useWMSGetFeatureInfo=val;
        if (this.useWMSGetFeatureInfo){
            if (this.wmsGetFeatureInfoControl==null){
                // add wms get featureInfo
                if (this.layersToAdd==null){
                    this.layersToAdd=[];
                }
                this.wmsGetFeatureInfoControl = new ol.format.WMSGetFeatureInfo({
                        layers : this.layersToAdd
                    });  
                    
                //this.wmsGetFeatureInfoControl.handleResponse = handleResponse;
                //this.wmsGetFeatureInfoControl.buildWMSOptions = buildWMSOtions;
                //this.wmsGetFeatureInfoControl.request = requestWmsGFI;
                //this.wmsGetFeatureInfoControl.events.register("getfeatureinfo",this,this.raiseOnDataEvent);   
                //deegree handler:
                this.wmsGetFeatureInfoControl.format.read_FeatureCollection = this.readFeatureCollection;
                //this.map.getFrameworkMap().addControl(this.wmsGetFeatureInfoControl);
                
                //set proxy for getFeatureInfoRequests:
                ol.ProxyHost = contextPath+"/action/proxy/wms?url=";
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