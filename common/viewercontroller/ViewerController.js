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
        this.mapComponent.initEvents();
     
        // XXX does API need to call other functions before the map is created?
        // 
        // XXX use app value
        // this.mapOptions.maxExtent =  new viewer.viewercontroller.controller.Extent(10000, 304000,280000,620000);
        
        // XXX how to setup options before creating the map container - and keep
        // them general...
        
        //console.log("Creating map");
        var map = this.mapComponent.createMap("map", {
            viewerController: this
        });
        // ??? why doesn't MapContainer keep track of references to maps itself?
        this.mapComponent.addMap(map);
        
        this.mapComponent.registerEvent(
            viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE, 
            this.mapComponent, 
            // XXX In the event handler "this" is set to the object firing 
            // the event, cannot specify this.onMapContainerLoaded and use
            //  normal "this" to refer to the ViewerController...
            function() {
                this.viewerController.onMapContainerLoaded()
            }
            );
        
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

            this.initializeConfiguredComponents();
            // XXX viewer.js: viewerController.loadLayout(layoutManager.getComponentList());
            
            // XXX viewer.js: viewerController.loadRootLevel(app.rootLevel);
            
            loadBaseLayers();

        //testComponents();
        } catch(e) {
            //console.log(e);
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

        //console.log("Creating component " + name + " class  " + className + " with config", config);
        
        // XXX do something with details - maybe integrate into config server side
        var instance = Ext.create(className, config);

        this.components[name] = {
            className: className,
            instance: instance
        };

        return instance;
    },
    setLayerVisible : function (serviceId, layerName, visible){
        var layer = this.getLayer(serviceId, layerName);
        this.mapComponent.getMap().setLayerVisible(layer, visible);
        var a = 0;
    },
    getLayer : function (serviceId, layerName){
        var id = serviceId + "_" + layerName;
        if(this.layers[id] == undefined){
            var service = this.app.services[serviceId];
            var layer = service.layers[layerName];
            var layerUrl = service.url;
    
            var options={
                timeout: 30,
                retryonerror: 10,
                getcapabilitiesurl: service.url,
                ratio: 1,
                showerrors: true,
                initService: true
            };

            var ogcOptions={
                format: "image/png",
                transparent: true,
                exceptions: "application/vnd.ogc.se_inimage",
                srs: "EPSG:28992",
                version: "1.1.1",
                layers:layer.name,
                query_layers: layer.name,
                styles: "",
                noCache: false
            };
            options["isBaseLayer"]=false;
            var layerObj = this.mapComponent.createWMSLayer(layer.name,layerUrl , ogcOptions, options);
            this.mapComponent.getMap().addLayer(layerObj);
            this.layers[id] = layerObj;
        }
        return this.layers[id];
    },
    getLayerTitle : function (serviceId, layerName){
        var layer = this.app.services[serviceId].layers[layerName];
        if(layer.titleAlias != undefined){
            return layer.titleAlias;
        }else{
            return layer.title;
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
    
    /** @deprecated To be replaced by loading layers from rootLevel */
    loadBaseLayers: function() {
        //console.log("Loading base layers");
        
        var layerUrl = "http://osm.kaartenbalie.nl/wms/mapserver?";

        var options={
            timeout: 30,
            retryonerror: 10,
            getcapabilitiesurl: layerUrl,
            ratio: 1,

            showerrors: true,
            initService: true
        };

        var ogcOptions={
            format: "image/png",
            transparent: true,
            exceptions: "application/vnd.ogc.se_inimage",
            srs: "EPSG:28992",
            version: "1.1.1",
            layers: "OpenStreetMap",
            styles: "",
            noCache: false // TODO: Voor achtergrond kaartlagen wel cache gebruiken
        };

        options["isBaseLayer"]=false;

        var osmLayer = this.mapComponent.createWMSLayer("OSM",layerUrl , ogcOptions, options);
        this.mapComponent.getMap().addLayer(osmLayer);        
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
    
    /** @deprecated */
    bind : function (event,object,handler,scope){
        if(object.isComponent != undefined){
            object.bind(event,handler,scope);
        }else{
            this.mapComponent.registerEvent(event, object, handler,scope);
        }
    },
    /** @deprecated */
    unbind : function (event,object){
        this.mapComponent.unRegisterEvent(event, object);
    }
});
