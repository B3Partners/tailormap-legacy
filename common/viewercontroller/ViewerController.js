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

    queryParams: null,
    
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
    /** A logger    */
    logger: null,
    
    dataSelectionChecker:null,
    /** Layers initialized?*/
    layersInitialized: false,
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
        this.callParent(arguments);
        this.dataSelectionChecker = Ext.create("viewer.components.DataSelectionChecker",{viewerController:this});
        this.app = app;
        
        this.queryParams = Ext.urlDecode(window.location.search.substring(1));
        
        var logLevel=viewer.components.Logger.LEVEL_ERROR;
        if (this.isDebug()){
            logLevel=viewer.components.Logger.LEVEL_DEBUG;
        }
        this.logger = Ext.create("viewer.components.Logger",{logLevel:logLevel});
        /* If a layout tree structure is supplied, dynamically create DOM elements
         * using Ext objects. If not, the caller must have created these elements
         * before instantiating a ViewerController.
         */
        if(app.layout) {
            // maxHeight is needed for IE8 bug where maxHeight on wrapper only does not work
            var maxHeight = null;
            if(app.details && app.details.maxHeight && parseInt(app.details.maxHeight, 10) !== 0) maxHeight = parseInt(app.details.maxHeight, 10);
            this.layoutManager = Ext.create('viewer.LayoutManager', {
                layout: app.layout,
                configuredComponents: app.components,
                maxHeight: maxHeight
            });            
        }
        this.layers = {};
        
        if(mapId == null && this.layoutManager != null) {
            mapId = this.layoutManager.getMapId();
        }
        
        if(viewerType == "flamingo") {
            // Get config for map
            var comps = this.app.components;
            var config = null;
            var cn = "viewer.mapcomponents.FlamingoMap";
            for (var c in comps){
                var component = comps[c];
                if(component.className == cn){
                    config = component.config;
                    break;
                }
            }
            this.mapComponent = new viewer.viewercontroller.FlamingoMapComponent(this, mapId,config);
        } else if(viewerType == "openlayers") {
            this.mapComponent = new viewer.viewercontroller.OpenLayersMapComponent(this, mapId);
        }
              
        this.mapComponent.registerEvent(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE, this.mapComponent, this.onMapContainerLoaded,this);
        this.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.onSelectedContentChanged,this);
        
        if(viewerType == "openlayers") {
            this.mapComponent.fireEvent(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE);
        }
    },
    
    showLoading: function(msg) {
        var loadingMsg = 'Loading...';
        if(msg) loadingMsg += ' ' + msg;
        document.getElementById('loader').innerHTML = loadingMsg;
        document.getElementById('loadwrapper').style.zIndex = '900000';
    },
    
    hideLoading: function() {
        document.getElementById('loadwrapper').style.zIndex = '0';
    },
    
    isDebug: function() {
        return this.queryParams.hasOwnProperty("debug") && this.queryParams.debug == "true";
    },
    
    /** @private Guard variable to prevent double event execution */
    mapContainerLoaded: false,
    /** @private Event handler for when the MapContainer is loaded */
    onMapContainerLoaded: function() {
        if(this.configCompleted) {
            return;
        }
        this.configCompleted = true;

        try {
            //if there is a height set for the top_menu start the map lower.
            var topMenuLayout=this.getLayout('top_menu');
            var mapTop= topMenuLayout.height && topMenuLayout.height>=0 ? topMenuLayout.height : 0;
            if (topMenuLayout.heightmeasure){
                mapTop+= topMenuLayout.heightmeasure == "px" ? "" : topMenuLayout.heightmeasure;
            }
            //if there is a height set for the content_bottom the map bottom is changed.
            var contentBottomLayout=this.getLayout('content_bottom');
            var mapBottom= contentBottomLayout.height && contentBottomLayout.height>=0? contentBottomLayout.height : 0;
            if (contentBottomLayout.heightmeasure){
                mapBottom+= contentBottomLayout.heightmeasure == "px" ? "" : contentBottomLayout.heightmeasure;
            }
            
            var max = this.app.maxExtent;
            var maxExtent;
            if(max != undefined){
                maxExtent = Ext.create("viewer.viewercontroller.controller.Extent",max.minx, max.miny, max.maxx, max.maxy);
            }else{
                maxExtent=Ext.create("viewer.viewercontroller.controller.Extent","12000,304000,280000,620000");
            }
            var startExtent;
            var start = this.app.startExtent;
            if(start){
                startExtent = Ext.create("viewer.viewercontroller.controller.Extent",start.minx, start.miny, start.maxx, start.maxy);
            }else{
                startExtent = Ext.create("viewer.viewercontroller.controller.Extent","12000,304000,280000,620000");
            }
            //xxx todo: remove specific flamingo things.
            var map = this.mapComponent.createMap("map", {
                viewerController: this,
                options: {
                    left: 0,
                    top: mapTop,
                    width: "100%",
                    bottom: "bottom -"+mapBottom,
                    visible: "true",
                    maxExtent : maxExtent,
                    startExtent: startExtent,
                    extenthistory: "10"
                }
            });
            this.mapComponent.addMap(map);
            
            this.initializeConfiguredComponents();
            var layersloaded = this.bookmarkValuesFromURL(this.queryParams);
            // When there are no layers loaded from bookmark the startmap layers are loaded,
            if(!layersloaded){
                this.initLayers();                
            }
            this.layersInitialized=true;
            this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED);
        } catch(e) {
            this.logger.error(e);
        }  
    },
    
    /** Constructs all components defined in the app configuration object. To be 
     * called after the layout elements are created and the map container is
     * loaded. 
     */
    initializeConfiguredComponents: function(){
        var list =  this.layoutManager.getComponentList();
        for(var i = 0; i < list.length; i++) {
            var layoutComponent = list[i];
            var component = this.app.components[layoutComponent.componentName];
            if(component) {
                component.config.div = layoutComponent.htmlId;
                component.config.isPopup = layoutComponent.isPopup;
                component.config.hasSharedPopup = layoutComponent.hasSharedPopup;
                component.config.showOnStartup = layoutComponent.showOnStartup;
                component.config.regionName = layoutComponent.regionName;
                this.createComponent(component.name, component.className, component.config, component.details);
            }
        }
        
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING);
    },    
    
    createComponent: function(name, className, config, details){
        if(this.components[name] != undefined) {
            throw "Component with name " + name + " (class " + className + ") already added, cannot add component of class " + className + " with the same name";
        }
        
        // XXX
        if(className == "viewer.mapcomponents.FlamingoMap" || className == "viewer.mapcomponents.OpenLayersMap") {
            return null;
        }

        config.viewerController = this;
        config.name=name;
        config.details=details;
               
        try{
            var instance = Ext.create(className, config);

            if(instance.hasSharedPopup){
                instance.popup = this.layoutManager.popupWin;
            }
            this.components[name] = {
                className: className,
                instance: instance
            };
        } catch(e) {
            
            this.logger.error("Error creating component with className " + className + ": error "+e+ " with config"+ config);
            if (this.isDebug()){
                throw e;
            }
        }

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
   
    counter: 0,
    max: 0,
    /**
     * set the selected content. Raises a ON_SELECTEDCONTENT_CHANGE. First all layers are removed
     * when all layers are removed, the new selectedcontent is initialized.
     * @param selectedContent the new selected content
     * TODO: Don't remove the selectedContent first and then set the new one. Have to make it smarter
     * - make some layers persistent, a addition to layer(image for Influence and Vector for drawing module) and don't remove those
     * - remove all layers that doesn't exist in new selectedcontent
     * - walk the new selected content
     * - if layer (in framework) exists set to new index
     * - if not exists add as new.
     */
    setSelectedContent: function(selectedContent) {
        this.counter = 0;
        this.max = this.mapComponent.getMap().layers.length;
        var me = this;
        var f = function  (map,options){
            this.counter++;
            if(this.counter >= this.max){                
                setTimeout(function(){
                    me.app.selectedContent = selectedContent;
                    me.uncheckUnselectedContent();
                    me.initLayers();
                    me.mapComponent.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,f, me);
                    me.fireEvent(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE);
                },1);
                
            }
        }
        //fallback if the framework is out of sync
        if (this.max==0){
            f.call(this);
        }
        this.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,f, this);
        this.clearLayers();
    },
    /**
     * Triggered when the selected content has changed. This method makes sure that all the previous filters are restored after deleting all the layers.
     */
    onSelectedContentChanged : function (){
        var appLayers = this.app.appLayers;
        for(var key in appLayers ){
            var appLayer = appLayers[key];
            if(appLayer.filter){
                var mapLayer = this.getLayer(appLayer);
                mapLayer.setQuery(appLayer.filter);
                this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,appLayer.filter,appLayer);
            }
        }
    },
    uncheckUnselectedContent: function() {
        var selectedAppLayers = [];
        
        for(var i in this.app.selectedContent) {
            var content = this.app.selectedContent[i];
            if(content.type == "appLayer") {
                selectedAppLayers.push(content.id);
            } else {
                selectedAppLayers = selectedAppLayers.concat(this.getLevelAppLayerIds(this.app.levels[content.id]));
            }
        }

        for(var i in this.app.appLayers) {
            var appLayer = this.app.appLayers[i];
            
            if(appLayer.checked) {
                if(Ext.Array.indexOf(selectedAppLayers, appLayer.id + "") == -1) {
                    appLayer.checked = false;
                }
            }
        }
    },
    
    /**
     * Depth-first traversal of selected content
     */
    traverseSelectedContent: function(onLevel, onAppLayer) {
        var app = this.app;
        
        var traverseLevel = function(level) {
            onLevel(level);
            if(level.children) {
                for(var i in level.children) {
                    var child = app.levels[level.children[i]];
                    traverseLevel(child);
                }
            }
            if(level.layers) {
                for(var i in level.layers) {
                    var layer = app.appLayers[level.layers[i]];
                    onAppLayer(layer);
                }
            }
        };
        
        for(var i in app.selectedContent) {
            var c = app.selectedContent[i];
            
            if(c.type == "level") {
                traverseLevel(app.levels[c.id]);
            } else if(c.type == "appLayer") {
                onAppLayer(app.appLayers[c.id]);
            }
        }
    },
    
    getLevelAppLayerIds: function(level) {
        var appLayers = [];
        
        if(level.layers) {
            for(var i in level.layers) {
                appLayers.push(level.layers[i]);
            }
        }
        if(level.children) {
            for(var c in level.children) {
                var childId = level.children[c];
                var childLayers = this.getLevelAppLayerIds(this.app.levels[childId]);
                appLayers = appLayers.concat(childLayers);
            }
        }
        return appLayers;
    },
    /**
     *Get the level that is the parent of the appLayer by the given id
     *@param appLayerId the id of the applayer.
     *@return the level that is parent of this applayer or null if not found.
     */    
    getAppLayerParent: function(appLayerId){
        //make sure its a string so the compare works.
        appLayerId=""+appLayerId;
        for (var levelId in this.app.levels){
            var level = this.app.levels[levelId];
            if (level.layers){
                if(Ext.Array.contains(level.layers,appLayerId)){
                    return level;
                }
            }
        }        
        return null;
    },
    /**
     *Get the level that is the parent of the level by the given id
     *@param levelId the id of the level.
     *@return the level that is parent of this level or null if not found.
     */    
    getLevelParent: function(levelId){
        //make sure its a string so the compare works.
        levelId=""+levelId;
        for (var lid in this.app.levels){
            var level = this.app.levels[lid];
            if (level.children){
                if(Ext.Array.contains(level.children,levelId)){
                    return level;
                }
            }
        }        
        return null;
    },
    
    /**
     * Returns a array of documents in the given level and every level above.
     * @param level the level
     * @return a object array with object[document id]=document
     */
    getDocumentsInLevel: function(level){
        var documents= new Object();
        if (level.documents){
            for (var i =0;i < level.documents.length; i++){
                var doc = level.documents[i];
                documents[doc.id]=doc;
            }
        }
        var parentLevel=this.getLevelParent(level.id);
        if (parentLevel!=null){
            var parentDocuments= this.getDocumentsInLevel(parentLevel);
            Ext.apply(documents,parentDocuments);
        }
        return documents;
    },    

    /** Remove all layers
     */
    clearLayers: function() {
        this.layers = [];
        this.mapComponent.getMap().removeAllLayers();
    },
    /**
     *Initialize layers and levels
     *@param background true/false/undefined. 
     *True if only the background levels and layers must be initialized, false only the other level and layers must be initialized
     *and undefined if both must be initialized (first background, then foreground)
     */
    initLayers : function (background){
        if (background==undefined){
            //first the background
            this.initLayers(true);
            //then the forground (on top)
            this.initLayers(false);
        }else{
            for( var i = this.app.selectedContent.length -1 ; i >= 0 ; i--){
                var content = this.app.selectedContent[i];
                if(content.type == "appLayer") {
                    this.initAppLayer(content.id,background);
                } else {
                    this.initLevel(content.id,background);
                }
            }
        
        }
    },
      
    /**
     *Initialize applayers
     *@param background true/false/undefined. 
     *True if only the background levels and layers must be initialized, false only the other level and layers must be initialized
     *and undefined if both must be initialized (first background, then foreground)
     */    
    initAppLayer: function(appLayerId,background) {
        var appLayer = this.app.appLayers[appLayerId];
        if (appLayer.background!=background){
            return;
        }
        
        var layer = this.getOrCreateLayer(appLayer);
        
        if (layer){
            this.mapComponent.getMap().setLayerVisible(layer, appLayer.checked);
        }
    },
      
    /**
     *Initialize layers and levels
     *@param background true/false/undefined. 
     *True if only the background levels and layers must be initialized, false only the other level and layers must be initialized
     *and undefined if both must be initialized (first background, then foreground)
     */
    initLevel: function(levelId,background) {
        var level = this.app.levels[levelId];
        if (level.background!=background){
            return;
        }
        if(level.layers) {
            for (var i = level.layers.length - 1 ; i >= 0 ; i--){
                this.initAppLayer(level.layers[i],background);
            }
        }
        
        if(level.children) {
            for (var i = level.children.length - 1 ; i >= 0 ; i--){
                this.initLevel(level.children[i],background);
            }
        }
    },
    /**
     * Set the layer visible
     * @param appLayer The app layer
     * @param visible true or false.
     */
    setLayerVisible : function (appLayer, visible){
        var layer = this.getLayer(appLayer);
        if (layer){
            layer.visible = visible;
            this.mapComponent.getMap().setLayerVisible(layer, visible);
        }
    },
    /**
     * Get the layer or null if not found
     * @param appLayer the app layer
     * @return viewer.viewercontroller.controller.Layer object or null if no layer found
     */
    getLayer : function (appLayer, deprecatedParam){
        //if deprecatedParam is given, the old (and wrong)way of calling this function is used.
        if (deprecatedParam){
            if(this.isDebug()){
                this.logger.warning("GetLayer() old method call is used.");
            }
        }
        if(this.layers[appLayer.id] == undefined){  
            if (!this.layersInitialized){
                this.logger.warning("Layers not initialized! Wait for the layers to be added!");
            }else{
                this.logger.warning("The layer cant be found! Maybe the wrong param? "+appLayer);
            }
            return null;
        }
        return this.layers[appLayer.id];
    },
    /**
     * get or create (if not already created) the map layer with serviceId and layerName
     * @param appLayer the applicationLayer
     * @return viewer.viewercontroller.controller.Layer object.
     */
    getOrCreateLayer: function(appLayer){
        var id = appLayer.id;
        if(this.layers[id] == undefined){            
            this.createLayer(appLayer);
        }
        return this.layers[id];
    },
    /**
     * Get the appLayer with the given id
     * @param appLayerId the id of the appLayer
     * @return the application layer.
     */
    getAppLayerById: function (appLayerId){
        return this.app.appLayers[appLayerId];
    },
     /**
     *Get the application layer
     *@param serviceId the id of the service
     *@param layerName the name of the layer
     *@return the application layer JSON object.
     *@deprecated the combination serviceId and layerName is not unique. 
     *Use viewer.viewerController.ViewerController#getAppLayerById
     */
    getAppLayer : function (serviceId, layerName){
        this.logger.warning("viewerController.getAppLayer() with serviceId and LayerName is not unique");
        var count=0;
        var foundAppLayer=null;
        for ( var i in this.app.appLayers){
            var appLayer = this.app.appLayers[i];
            if(appLayer.layerName== layerName && appLayer.serviceId == serviceId){
                count++;
                if (foundAppLayer==null){
                    foundAppLayer=appLayer;
                }
            }
        }
        if (count>1){
            this.logger.warning("viewerController.getAppLayer() with serviceId and LayerName found "+count+
                " application layers with serviceId: '"+serviceId+"' and layerName: '"+layerName+"' returning the first");
        }
            
        return foundAppLayer;
    },

    getAppLayerFeatureService: function(appLayer) {
        
        if(appLayer.featureService == undefined) {
            // XXX appLayer can be custom service or from service registry...
            if(appLayer.added) {
                var service = this.app.services[appLayer.serviceId];
                appLayer.featureService = Ext.create("viewer.DirectFeatureService", { 
                    appLayer: appLayer,
                    protocol: service.protocol,
                    url: service.url
                });
            } else {
                appLayer.featureService = Ext.create("viewer.AppLayerService", { 
                    appId: this.app.id,
                    appLayer: appLayer,
                    debug: this.isDebug()                    
                });
            }
        }
        return appLayer.featureService;
    },
    
    /**
     * Creates a layer with the given applicationLayer
     * @param appLayer the application layer that is used to create a layer
     * @return the created viewer.viewerController.controller.layer
     */
    createLayer : function (appLayer){        
        var id = appLayer.id;
        var service = this.app.services[appLayer.serviceId];
        var layer = service.layers[appLayer.layerName];
        var options={
            id: id,
            ratio: 1,
            visible: appLayer.checked
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
                styles: "",
                format: "image/png",
                transparent: true,
                noCache: true
            };
            if (layer.queryable){
                ogcOptions.query_layers= layer.name;
            }
            layerObj = this.mapComponent.createWMSLayer(layer.name,layerUrl , ogcOptions, options,this);
                
        }else if(service.protocol == "arcims" || service.protocol == "arcgis"){            
            options.layers= layer.name;
            if (service.protocol == "arcims"){
                options.type= "ArcIMS";
                options.mapservice=service.serviceName;
                layerObj = this.mapComponent.createArcIMSLayer(appLayer.layerName,service.url, options,this);
            }else{                
                options.type= "ArcGIS";                
                layerObj = this.mapComponent.createArcServerLayer(appLayer.layerName,service.url, options,this);                
            }
        }else if (service.protocol == "tiled"){
            var res=layer.resolutions.split(",");
            for (var i=0; res.length > i; i++){
                res[i] = Number(res[i]);
            }
            options.tileHeight = layer.tileHeight;
            options.tileWidth = layer.tileWidth;
            options.serviceEnvelope= layer.bbox.minx+","+layer.bbox.miny+","+layer.bbox.maxx+","+layer.bbox.maxy;
            options.resolutions = res,
            options.protocol = service.tilingProtocol;
            options.viewerController=this;
            if (layer.details && layer.details["image_extension"]){
                options.extension = layer.details["image_extension"];
            }
            layerObj = this.mapComponent.createTilingLayer(appLayer.layerName,service.url,options);
        }
        if (layerObj==null){
            return null;
        }
        layerObj.serviceId = appLayer.serviceId;
        layerObj.appLayerId = appLayer.id;
        this.layers[id] = layerObj;
        this.mapComponent.getMap().addLayer(layerObj);  
        /** xxxxx Still needed?**/
        if(service.protocol == "arcgis"){
            this.layers[id].addListener(viewer.viewercontroller.controller.Event.ON_GET_SERVICE_INFO,function(){
                    this.setVisible(appLayer.checked)
                },this.layers[id]);
        }
        return layerObj;
    },
    /**
     *Get map layer with id of the layer in the service object
     *@param id the id of the layer in a service object
     *@return viewer.viewercontroller.controller.Layer object
     */
    getLayerByLayerId : function (id){
        this.logger.warning("viewerController.getLayerByLayerId() is not returning a unique layer!");
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
    /**
     *Returns the layer of the service as configured.
     *@param id the id of the layer service layer
     *@return a service layer. The layer that is stored in app.services.layers
     **/
    getServiceLayerById: function (id){
        for (var i in this.app.services){
            var service = this.app.services[i];
            
            for(var j in service.layers){
                var layer = service.layers[j];
                if(id == layer.id){
                    return layer;
                }
            }
        }
        return null;
    },
    /** Get the serviceLayer for the applayer.
     *@param appLayer the applicationlayer
     *@return the service layer
     */
    getServiceLayer: function(appLayer){
        return this.app.services[appLayer.serviceId].layers[appLayer.layerName];
    },
    /** 
     * Receives an array with visible map layers ids
     * @return a array of Layer id's (same as appLayerIds) objects
     **/
    getVisibleLayers : function (){
        var layers = this.layers;
        var layerArray = new Array();
        for ( var i in layers){
            var layer = layers[i];
            if(layer.getVisible()){
                layerArray.push(i);
            }
        }
        return layerArray;
    },
    /**
     *Set a list of layers visible
     *@param layers a array of application layers
     *@param vis true/false -- visible/invisible
     */
    setLayersVisible : function (layers,vis){
        for ( var i = 0 ; i < layers.length ; i++){
            var appLayer = layers[i];
            this.setLayerVisible(appLayer,vis);
        }
    },
    /**
     * Check's if this layer is within the current map scale
     * @param appLayer the applayer
     * @return true/false
     */
    isWithinScale: function (appLayer,scale){
        if (scale==undefined || scale==null){
            scale = this.mapComponent.getMap().getScale();
        }
        var serviceLayer=this.getServiceLayer(appLayer);
        /* If minScale or maxScale is '0' then ignore it that check
         * It's not correct but this is how it's configured in ESRI by most of the users.
         */
        if (serviceLayer.minScale && serviceLayer.minScale != 0 && scale < serviceLayer.minScale){
            return false;            
        }
        if (serviceLayer.maxScale && serviceLayer.maxScale != 0 && scale > serviceLayer.maxScale){
            return false;
        }            
        return true;        
    },
    // XXX this is already done server-side setting appLayer.alias
    getLayerTitle : function (serviceId, layerName){
        var layer = this.app.services[serviceId].layers[layerName];
        if(layer.titleAlias != undefined){
            return layer.titleAlias;
        }else{
            return layer.title;
        }
    },
    /**
     * Get the Layer Legend image. Superseded by getLayerLegendInfo()
     * @param appLayer the applayer
     */
    getLayerLegendImage :function (appLayer){
        var serviceId=appLayer.serviceId;
        var layerName=appLayer.layerName;
        var layer = this.app.services[serviceId].layers[layerName];
        if(layer.legendImageUrl != undefined){
            return layer.legendImageUrl;
        }else{
            var layerObj = this.getLayer(appLayer);
            return layerObj.getLegendGraphic();
        }
    },
    
    /**
     * Retrieve info about the layer legend and call the success function with
     * that info. Implemented by Layer subclasses. NOTE: the success function
     * can be called immediately <i>during execution</i> of this function OR at 
     * a later time.
     * 
     * If the layer has no legend, if the protocol is unsupported or if an error 
     * occurs (this will have been logged) the failure function is called with
     * the appLayer argument.
     * 
     * The success function is called with the given appLayer argument and a 
     * Object argument with the following properties:
     * 
     * name: optional String, server provided label for the legend of this layer
     * parts: Array of:
     *   label: optional String, label for legend part
     *   url: String, URL for image, may be provided as data: protocol base64
     *        encoded image by ArcGIS
     */
    getLayerLegendInfo: function(appLayer, success, failure) {
        
        try {
            var l = this.getLayer(appLayer);
            
            // Check override by service admin
            var serviceLayer = this.getServiceLayer(appLayer);
            if(serviceLayer.legendImageUrl) {
                success(appLayer, { parts: [ {url: serviceLayer.legendImageUrl}] });
                return;
            }
            
            if(l.getLayerLegendInfo) {
                l.getLayerLegendInfo(
                    function(legendInfo) {
                        success(appLayer, legendInfo);
                    },
                    function() {
                        failure(appLayer);
                    }
                    );
            } else {
                this.logger.error("Layer class " + l.$className + " does not support getLayerLegendInfo");
                failure(appLayer);
            }
        
        } catch(e) {
            this.logger.error("Error creating legend info for appLayerId " + appLayer.id + ": " + e);
            failure(appLayer);
        }        
    },
    
    getLayerMetadata : function (serviceId, layerName){  
        var layer = this.app.services[serviceId].layers[layerName];
        return layer.details["metadata.stylesheet"];
    },
    /**
     * add ore replace the filter for the given layer.
     * @param filter the filter
     * @param appLayer the application layer
     */
    setFilter : function (filter, appLayer){
         if(!appLayer.filter){
            appLayer.filter = Ext.create("viewer.components.CQLFilterWrapper",{
                id: "",
                cql: "",
                operator : ""
            });
        }
        appLayer.filter.addOrReplace(filter);
        
        var mapLayer = this.getLayer(appLayer);
        mapLayer.setQuery(appLayer.filter);
        
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,appLayer.filter,appLayer);
    },
    /**
     * Remove a filter from the given applayer
     * @param filterId the id of the filter
     * @param layer the app layer
     */
    removeFilter: function(filterId,layer){
        if (layer.filter){
            layer.filter = layer.filter.removeFilterById(filterId);
            if(layer.filter.filters.length == 0){
                layer.filter = null;
            }
            var mapLayer = this.getOrCreateLayer(layer);
            mapLayer.setQuery(layer.filter);
            this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,layer.filter,layer);
        }
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
    
    bookmarkValuesFromURL : function(params){
        var layersLoaded = false;
        var bookmark = false;
        var appLayers = this.app.appLayers;

        for( var key in params){
            var value = params[key];
            if(key == "bookmark"){
                var me = this;
                Ext.create("viewer.Bookmark").getBookmarkParams(value,function(code){me.succesReadUrl(code);},function(code){me.failureReadUrl(code);});
                layersLoaded = true;
                bookmark = true;
            }else if(key == "layers"){
                if(!Ext.isArray(value)){
                    value = value.split(",");
                }
                appLayers = this.loadBookmarkLayers(value);
                layersLoaded = true;
            }else if(key == "extent"){
                var coords = value;
                var newExtent = new Object();
                if(!Ext.isObject(value)){
                    coords = value.split(",");
                    newExtent.minx=coords[0];
                    newExtent.miny=coords[1];
                    newExtent.maxx=coords[2];
                    newExtent.maxy=coords[3];
                }else{
                    newExtent = coords;
                }
                this.mapComponent.getMap().zoomToExtent(newExtent);
            }
        }

        if(layersLoaded && !bookmark){
            this.app.appLayers = appLayers;
            this.setSelectedContent(this.app.selectedContent);
        }

        return layersLoaded;
    },
    loadBookmarkLayers : function(values){
        var appLayers = this.app.appLayers;
        
        for ( var i in appLayers){
            var appLayer = appLayers[i];
            var isBookmarked = false;
            
            for(var x = 0 ; x < values.length ; x++){
                var appLayerId = values[x];
                if(appLayer.id == appLayerId){
                    isBookmarked = true;
                    break;
                }
            }
            
            if(isBookmarked){
                appLayer.checked = true;
            }else{
                appLayer.checked = false;
            }
        }
        return appLayers;
    },
    succesReadUrl : function(code){
        var paramJSON = Ext.JSON.decode(code);
        
        var params = new Object();
        for ( var i = 0 ; i < paramJSON["params"].length ; i++){
            var parameter = paramJSON["params"][i];
            var key = parameter.name;
            var value = parameter.value;
            params[key] = value;
        }
        this.bookmarkValuesFromURL(params);
    },
    failureReadUrl : function(code){
    },
    getBookmarkUrl : function(){
        var paramJSON = {
            params:[]
        };
        
        var url = document.URL;
        var index = url.indexOf("?");
        var newUrl = "";
        if(index > 0){
            newUrl = url.substring(0,index)+"?";
        }else{
            newUrl = url+"?";
        }
        var param = {
            name: "url", 
            value: newUrl
        };
        paramJSON.params.push(param);
        
        if(index > 0){
            var params = url.substring(index +1);
            var parameters = params.split("&");
            for ( var i = 0 ; i < parameters.length ; i++){
                var parameter = parameters[i];
                var index2 = parameter.indexOf("=");
                var type = parameter.substring(0,index2);
                var value = parameter.substring(index2 +1);
                if(type != "layers" && type != "extent" && type != "bookmark"){
                    var otherParam = {
                        name: type, 
                        value: value
                    };
                    paramJSON.params.push(otherParam);
                }
            }
        }
        
        var visLayers = this.getVisibleLayers();
        if(visLayers.length != 0 ){
            var layerParam = {
                name: "layers", 
                value: visLayers
            };
            paramJSON.params.push(layerParam);
        }
        
        var extent = this.mapComponent.getMap().getExtent();
        var extentParam = {
            name: "extent", 
            value: extent
        };
        paramJSON.params.push(extentParam);
    
        return paramJSON;
    },
    getApplicationSprite: function() {
        // XXX this class does not need to know about the sprite Component.js
        // uses - replace by generic app config details access function
        // or if sprite is used more widely provide it outside Component.js
        if(Ext.isDefined(this.app.details) && Ext.isDefined(this.app.details.iconSprite)) {
            return this.app.details.iconSprite;
        }
        return null;
    },
    /**
     * Gets the layout height for a layout container
     * @param layoutid the id that represents the container for example: 'top_menu'
     * @returns a number 
     */
    getLayoutHeight: function(layoutid){
        var height=-1;
        var layoutObject=this.getLayout(layoutid);
        if (layoutObject &&
            layoutObject.height){
            height=layoutObject.height;                
        }
        return height;
    },
    /**
     *Get the layout of the region
     *@param layoutregion id of the region. For example: 'top_menu'
     */
    getLayout: function (layoutRegion){
        var layoutObject=this.app.layout[layoutRegion];
        if (layoutObject &&
            layoutObject.layout){
            return layoutObject.layout;
        }
        return null;
    },
    
    getTopMenuHeightInPixels: function (){
        var topMenuLayout=this.getLayout('top_menu');
        var top = Number(topMenuLayout.height && topMenuLayout.height>=0 ? topMenuLayout.height : 0);
        if (topMenuLayout.heightmeasure && topMenuLayout.heightmeasure =="%"){
            var divHeight=Ext.get(this.layoutManager.mapId).getHeight();
            top = Math.round(divHeight / 100 * top);
        }
        return top;
    },
        
    resizeComponents: function() {
        this.layoutManager.resizeLayout();
        // We are execturing the doResize function manually on all components, instead of
        // firing an event, because all components are required execute this function
        for(var name in this.components) {
            var component = this.components[name];
            component.instance.resizeScreenComponent();
        }
        return true;
    },
    /**
     *Utility functions
     ***/
    isEmptyObject:function(map) {
        for(var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
});
