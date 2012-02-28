/**
 * ViewerController
 * @class Controller for a GIS application
 * @constructor
 * @param viewerType The type of the viewer: flamingo/openlayers/etc..
 * @param mapId The id of the div in which the map has to be shown.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.ViewerController", {
    extend: "Ext.util.Observable", 
    events: [],

    /** Map of name to component configuration object with the following properties:
     *  className: class name to construct
     *  instance: the created instance
     */
    components: {},
    
    /** Map container: element displaying a map including map controls */
    mapComponent: null,
    
    /** App configuration object */
    app: null,

    /** Optional the layout manager if layout specified in app configuration */
    layoutManager: null,
    
    /** A map which stores the current instantiated layerObjects */
    layers : null,
    
    /**
     * Creates a ViewerController and initializes the map container. 
     * 
     * @param {String} viewerType Currently only the value "flamingo" is supported.
     * @param {String} mapId The DOM element id where the map container should be displayed
     * @param {Object} app App configuration object. Properties:
     *   - TODO server side services URL info
     *   - TODO global services index and capabilities
     *   - layout Tree structure describing a layout to be constructed dynamically
     *   - rootLevel Application content tree structure
     *   - components Viewer components list to be dynamically constructed
     * @constructor
     */
    constructor: function(viewerType, mapId, app) {
        this.addEvents(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING);
        this.app = app;
        
        /* If a layout tree structure is supplied, dynamically create DOM elements
         * using Ext objects. If not, the caller must have created these elements
         * before instantiating a ViewerController.
         */
        if(app.layout) {
            //console.log("Creating layout");
            this.layoutManager = Ext.create('viewer.LayoutManager', {
                layout: app.layout
            });            
        }
        this.layers = {};
        
        if(viewerType == "flamingo") {
            if(mapId == null && this.layoutManager != null) {
                mapId = this.layoutManager.getMapId();
            }
            //console.log("Creating FlamingoMapComponent, mapId = " + mapId);
            this.mapComponent = new viewer.viewercontroller.FlamingoMapComponent(this, mapId);
        } else if(viewerType == "openlayers") {
            throw "OpenLayers currently not supported!";
        /*
            this.mapComponent= new OpenLayersController();
            this.mapOptions = {
                projection: new OpenLayers.Projection("EPSG:28992"),
                allOverlays: true,
                units :'m',
                resolutions: [512,256,128,64,32,16,8,4,2,1,0.5,0.25,0.125],
                controls : [new OpenLayers.Control.Navigation({
                    zoomBoxEnabled: true
                }),new OpenLayers.Control.ArgParser()],
                events: []            
            };
            */            
        }

        /* XXX move to constructor? */
        
     
        // XXX does API need to call other functions before the map is created?
        // 
        // XXX use app value
        // this.mapOptions.maxExtent =  new viewer.viewercontroller.controller.Extent(10000, 304000,280000,620000);
        
        // XXX how to setup options before creating the map container - and keep
        // them general...
        
        //console.log("Creating map");
        var map = this.mapComponent.createMap("map", {
            /*viewerController: this*/
        });
        // ??? why doesn't MapContainer keep track of references to maps itself?
        this.mapComponent.addMap(map);
        
        this.mapComponent.registerEvent(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE, this.mapComponent, this.onMapContainerLoaded,this);
        
    },
    
    /** @private Guard variable to prevent double event execution */
    mapContainerLoaded: false,
    /** @private Event handler for when the MapContainer is loaded */
    onMapContainerLoaded: function() {
        if(this.configCompleted) {
            //console.log("onMapContainerLoaded; dupe");
            return;
        }
        this.configCompleted = true;
        //console.log("onMapContainerLoaded()");

        try {            
            // XXX viewer.js: initializeButtons();
            // XXX viewer.js; zooms to some extent: onFrameworkLoaded();

            
            var layersloaded = this.bookmarkValuesFromURL();
            // When there are no layers loaded from bookmark the startmap layers are loaded,
            if(!layersloaded){
                this.initLayers();
            }
            this.initializeConfiguredComponents();
            
        // XXX viewer.js: viewerController.loadLayout(layoutManager.getComponentList());
            
        // XXX viewer.js: viewerController.loadRootLevel(app.rootLevel);
            
        //testComponents();
        } catch(e) {
            if (window.console && console.log){
                console.log(e);
            }
        }  
    },
    
    /** Constructs all components defined in the app configuration object. To be 
     * called after the layout elements are created and the map container is
     * loaded. 
     */
    initializeConfiguredComponents: function(){
        
        // XXX must use order in layout so layoutManager is required
        // app.components is not useful otherwise
        
        var list =  this.layoutManager.getComponentList();
        for(var i = 0; i < list.length; i++) {
            var layoutComponent = list[i];
            var component = this.app.components[layoutComponent.componentName];
            component.config.div = layoutComponent.htmlId;
            this.createComponent(component.name, component.className, component.config, component.details);
        }
        
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING);
    },    
    
    createComponent: function(name, className, config, details){
        
        if(this.components[name] != undefined) {
            throw "Component with name " + name + " (class " + className + ") already added, cannot add component of class " + className + " with the same name";
        }
        
        // XXX
        if(className == "FlamingoMap") {
            return null;
        }

        config.viewerController = this;
        config.name=name;
        //console.log("Creating component " + name + " class  " + className + " with config", config);
        
        // XXX do something with details - maybe integrate into config server side
        var instance = Ext.create(className, config);

        this.components[name] = {
            className: className,
            instance: instance
        };

        return instance;
    },
    
    addService: function(service) {
       if(this.app.services[service.id] == undefined) {
           this.app.services[service.id] = service;
       }
   },
   
   addAppLayer:function(appLayer) {
       if(this.app.appLayers[appLayer.id] == undefined) {
           this.app.appLayers[appLayer.id] = appLayer;
       }
   },
   
   setSelectedContent: function(selectedContent) {
       //clearLayers();
       this.app.selectedContent = selectedContent;
       //initLayers();
       this.fireEvent("selectedContentChanged");
   },
   
   initLayers : function (){
        var appLayers = this.app.appLayers;
        for ( var i in appLayers){
            var appLayer = appLayers[i];
            if(appLayer.checked){
                this.setLayerVisible(appLayer.serviceId, appLayer.layerName, true);
            }
        }
    },
    setLayerVisible : function (serviceId, layerName, visible){
        var layer = this.getLayer(serviceId, layerName);
        this.mapComponent.getMap().setLayerVisible(layer, visible);
    },
    getLayer : function (serviceId, layerName){
        var id = serviceId + "_" + layerName;
        if(this.layers[id] == undefined){
            this.createLayer(serviceId,layerName);
        }
        return this.layers[id];
    },
    
    createLayer : function (serviceId, layerName){
        var id = serviceId + "_" + layerName;
        var service = this.app.services[serviceId];
        var layer = service.layers[layerName];
        var options={
            timeout: 30,
            retryonerror: 10,
            ratio: 1,
            id: layer.name,
            showerrors: true,
            initService: false
        };

        var layerObj = null;
        if(service.protocol =="wms" ){
            var layerUrl = service.url;
            options["isBaseLayer"]=false;
            
            var ogcOptions={
                exceptions: "application/vnd.ogc.se_inimage",
                srs: "EPSG:28992",
                version: "1.1.1",
                layers:layer.name,
                visible: false,
                /*xxx must be set by tool that uses it.
                    *query_layers: layer.name,*/
                styles: "",
                format: "image/png",
                transparent: true,
                noCache: false
            };
            layerObj = this.mapComponent.createWMSLayer(layer.name,layerUrl , ogcOptions, options);
                
            this.layers[id] = layerObj;
        }else if(service.protocol == "arcims" || service.protocol == "arcgis"){
            // Process the url so the MapComponent can handle it
            var url = service.url;
            var server = url.substring(0,url.indexOf("/",7));
            var servlet;
            if(url.indexOf("?") != -1){
                servlet = url.substring(url.indexOf("/",7)+1, url.indexOf("?"));
            }else{
                servlet = url.substring(url.indexOf("/",7)+1);
            }
            // Make arcIms specific ogcOptions
            options.name=  layerName;
            options.server = server;            
            options.mapservice = service.name;
            options.servlet = servlet;
            options.visibleids = layerName;
            if (service.protocol == "arcims"){
                options.type= "ArcIMS";
                layerObj = this.mapComponent.createArcIMSLayer(layerName,server,servlet,service.name, options);
            }else{                
                options.type= "ArcGIS";
                layerObj = this.mapComponent.createArcServerLayer(layerName,server,servlet,service.name, options);
            }
            this.layers[id] = layerObj;
        }
        layerObj.serviceId = serviceId;
        this.mapComponent.getMap().addLayer(layerObj);  
    },
    
    getLayerByLayerId : function (id){
        for (var i in this.app.services){
            var service = this.app.services[i];
            
            for(var j in service.layers){
                var layer = service.layers[j];
                if(id == layer.id){
                    return this.getLayer(service.id,layer.name);
                }
            }
        }
        return null;
    },
    getVisibleLayerIds : function (){
        var layers = this.layers;
        var layerArray = new Array();
        for ( var i in layers){
            var layer = layers[i];
            if(layer.visible){
                layerArray.push(i);
            }
        }
        return layerArray;
    },
    /** 
     * Receives an array with serviceId_layerId entries
     **/
    setLayersVisible : function (layers,checked){
        for ( var i = 0 ; i < layers.length ; i++){
            var layer = layers[i];
            var index = layer.indexOf("_");
            var serviceId = layer.substring(0,index);
            var layerId = layer.substring(index +1);
            this.setLayerVisible(serviceId,layerId,checked);
        }
    },
    getLayerTitle : function (serviceId, layerName){
        var layer = this.app.services[serviceId].layers[layerName];
        if(layer.titleAlias != undefined){
            return layer.titleAlias;
        }else{
            return layer.title;
        }
    },
    getLayerLegendImage :function (serviceId, layerName){
        var layer = this.app.services[serviceId].layers[layerName];
        if(layer.legendImageUrl != undefined){
            return layer.legendImageUrl;
        }else{
            var layerObj = this.getLayer(serviceId, layerName);
            return layerObj.getLegendGraphic();
        }
    },
    getLayerMetadata : function (serviceId, layerName){  
        var layer = this.app.services[serviceId].layers[layerName];
        return layer.details["metadata.stylesheet"];
    },
    getComponentsByClassName : function(className) {
        var result = [];
        for(var name in this.components) {
            var component = this.components[name];
            if(component.className == className) {
                result.push(component.instance);
            }
        }
        return result;
    },
    
    getComponentByName : function (name){
        var component = this.components[name];
        if(component != undefined) {
            return component.instance;
        } else {
            return null;
        }
    },        
    
    /** @deprecated */
    zoomToExtent : function(minx,miny,maxx,maxy){
        this.mapComponent.getMap().zoomToExtent({
            minx:minx,
            miny:miny,
            maxx:maxx,
            maxy:maxy
        }, 0);
    },
    bookmarkValuesFromURL : function(){
        var layersLoaded = false;
        var url = document.URL;
        var index = url.indexOf("?");
        var params = url.substring(index +1);
        
        var parameters = params.split("&");
        for ( var i = 0 ; i < parameters.length ; i++){
            var parameter = parameters[i];
            var index2 = parameter.indexOf("=");
            var type = parameter.substring(0,index2);
            var value = parameter.substring(index2 +1);
            if(type == "bookmark"){
                var me = this;
                Ext.create("viewer.Bookmark").getBookmarkParams(value,function(code){me.succesReadUrl(code);},function(code){me.failureReadUrl(code);});
                layersLoaded = true;
            }else if(type == "layers"){
                //var values = value.split(",");
                //this.setLayersVisible(values,true);
                this.loadBookmarkLayers(value);
                layersLoaded = true;
            }else if(type == "extent"){
                var coords = value.split(",");
                var newExtent = new Object();
                newExtent.minx=coords[0];
                newExtent.miny=coords[1];
                newExtent.maxx=coords[2];
                newExtent.maxy=coords[3];
                this.mapComponent.getMap().zoomToExtent(newExtent);
            }
        }
        return layersLoaded;
    },
    loadBookmarkLayers : function(layers){
        var applayers = this.app.appLayers;
        var values = layers.split(",");
        this.setLayersVisible(values,true);
    },
    succesReadUrl : function(code){
        var parameters = code.split("&");
        for ( var i = 0 ; i < parameters.length ; i++){
            var parameter = parameters[i];
            var index2 = parameter.indexOf("=");
            var type = parameter.substring(0,index2);
            var value = parameter.substring(index2 +1);
            if(type == "layers"){
                //var values = value.split(",");
                //this.setLayersVisible(values,true);
                this.loadBookmarkLayers(value);
            }else if(type == "extent"){
                var coords = value.split(",");
                var newExtent = new Object();
                newExtent.minx=coords[0];
                newExtent.miny=coords[1];
                newExtent.maxx=coords[2];
                newExtent.maxy=coords[3];
                this.mapComponent.getMap().zoomToExtent(newExtent);
            }else if(type == "selectedcontent"){
                var blaa=9;
            }
        }
    },
    failureReadUrl : function(code){
        //
    },
    getBookmarkUrl : function(){
        var allParams = "";
        var url = document.URL;
        var index = url.indexOf("?");
        var newUrl = url.substring(0,index)+"?";
        var params = url.substring(index +1);
        var parameters = params.split("&");
        for ( var i = 0 ; i < parameters.length ; i++){
            var parameter = parameters[i];
            var index2 = parameter.indexOf("=");
            var type = parameter.substring(0,index2);
            if(type != "layers" && type != "extent"){
                allParams += parameter+"&";
            }
        }
        
        var visLayers = this.getVisibleLayerIds();
        if(visLayers.length != 0 ){
            allParams += "layers=";
            for(var x = 0 ; x < visLayers.length ; x++){
                if(x == visLayers.length-1){
                    allParams += visLayers[x]+"&";
                }else{
                    allParams += visLayers[x]+",";
                }
            }
        }
        
        var extent = this.mapComponent.getMap().getExtent();
        allParams += "extent=" + extent.minx +","+ extent.miny +","+ extent.maxx +","+ extent.maxy;
        
        newUrl += allParams;
        return newUrl;
    }
});
