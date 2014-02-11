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
     * @param {String} viewerType Currently only the value "flamingo" and "openlayers" are supported.
     * @param {String} domId The DOM element id where the viewer should be displayed/created
     * @param {Object} app App configuration object. Properties:
     *   - TODO server side services URL info
     *   - TODO global services index and capabilities
     *   - layout Tree structure describing a layout to be constructed dynamically
     *   - rootLevel Application content tree structure
     *   - components Viewer components list to be dynamically constructed
     * @param {Array} listeners a array of listeners
     * @param {Object} mapConfig config settings for map object.
     * @constructor
     */
    constructor: function(viewerType, domId, app, listeners,mapConfig) {
        this.events = {}; // this is needed if addListener() is called and we don't do addEvents() before! See Ext.util.Observable.constructor
        this.callParent([{ listeners: listeners }]);
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
            var layoutOptions = {
                layout: app.layout,
                configuredComponents: app.components,
                maxHeight: maxHeight
            };
            if (domId){
                layoutOptions.wrapperId= domId;
            }
            this.layoutManager = Ext.create('viewer.LayoutManager', 
                layoutOptions                
            );            
        }
        this.layers = {};
        
        //get the map id
        var mapId = this.layoutManager.getMapId();
       
        // Get config for map
        var comps = this.app.components;
        var config = {};            
        for (var c in comps){
            var component = comps[c];
            if(component.className == "viewer.mapcomponents.FlamingoMap" ||
                component.className == "viewer.mapcomponents.OpenLayersMap"){
                config = component.config;
                break;
            }
        }
        Ext.apply(config, mapConfig || {});
        if(viewerType == "flamingo") {
            this.mapComponent = new viewer.viewercontroller.FlamingoMapComponent(this, mapId,config);
        }else if(viewerType == "openlayers") {
            this.mapComponent = new viewer.viewercontroller.OpenLayersMapComponent(this, mapId,config);
        }else{
            this.logger.error("No correct viewerType defined. This might be a problem. ViewerType: " + viewerType);
        }
        
        this.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,
            this.spinupDataStores, this);
              
        this.mapComponent.addListener(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE,this.onMapContainerLoaded,this);
        this.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.onSelectedContentChanged,this);
        
        if(viewerType == "openlayers") {
            this.mapComponent.fireEvent(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE);
        }
    },
    
    showLoading: function(msg) {
        var loadingMsg = 'Loading...';
        if(msg) loadingMsg += ' ' + msg;
        document.getElementById('loader').innerHTML = loadingMsg;
        document.getElementById('loader').style.display = 'block';
        document.getElementById('loadwrapper').style.zIndex = '900000';
    },
    
    hideLoading: function() {
        document.getElementById('loadwrapper').style.zIndex = '0';
        document.getElementById('loader').style.display = 'none';
    },
    
    isDebug: function() {
        return this.queryParams.hasOwnProperty("debug") && this.queryParams.debug == "true";
    },
    
    spinupDataStores: function() {
        if(this.app.details["dataStoreSpinupDisabled"]){
            return;
        }
        var lastSpinupTime = this.app.details['lastSpinupTime'];
        if(lastSpinupTime) {
            // server and browser timezone may differ but no big deal, time is
            // also checked server-side
            lastSpinupTime = Ext.Date.parse(lastSpinupTime, "c", true);
        }
        var me = this;
        if(!lastSpinupTime || Ext.Date.getElapsed(lastSpinupTime) > 1800 * 1000) {
            Ext.Ajax.request({
                url: actionBeans["datastorespinup"],
                params: {application: this.app.id},
                success: function(result) {
                    var response = Ext.JSON.decode(result.responseText);
                    if(response.success) {
                        me.logger.debug("DataStore spinup result success: " + response.message);
                    } else {
                        me.logger.debug("DataStore spinup result error: " + response.error);
                    }
                },
                failure: function(result) {
                    me.logger.error("DataStore spinup Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            });                 
        }
        
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
                    bottom: mapBottom,
                    visible: "true",
                    maxExtent : maxExtent,
                    startExtent: startExtent,
                    extenthistory: "10"
                }
            });
            this.mapComponent.addMap(map);
            
            this.initializeConfiguredComponents();
            var layersloaded = this.valuesFromURL(this.queryParams);
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
            
            if(this.isDebug()){
                if(e instanceof Error) {
                    console.log(e);
                    if(e.stack != undefined) {
                        console.log(e.stack);
                    }
                }
            }
        }

        return instance;
    },
    
    addService: function(service) {
        if(this.app.services[service.id] == undefined) {
            this.app.services[service.id] = service;
        }
    },
            
    addOrReplaceService: function (service){
        this.app.services[service.id] = service;
    },
   
    addAppLayer:function(appLayer) {
       if(this.app.appLayers[appLayer.id] == undefined) {
           this.app.appLayers[appLayer.id] = appLayer;
       }
    },
            
    addOrReplaceAppLayer: function(appLayer){
        this.app.appLayers[appLayer.id] = appLayer;
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
                if(mapLayer){
                    mapLayer.setQuery(appLayer.filter);
                    this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,appLayer.filter,appLayer);
                }
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
            if(!level){
                return;
            }
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
        if (level) {
            if (level.layers) {
                for (var i in level.layers) {
                    appLayers.push(level.layers[i]);
                }
            }
            if (level.children) {
                for (var c in level.children) {
                    var childId = level.children[c];
                    var childLayers = this.getLevelAppLayerIds(this.app.levels[childId]);
                    appLayers = appLayers.concat(childLayers);
                }
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
        if (!level || level.background!=background){
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
                this.logger.warning("getLayer() old method call is used!");
            }
        }
        if(this.layers[appLayer.id] == undefined){  
            if (!this.layersInitialized){
                this.logger.warning("Layers not initialized! getLayer() caller should wait for the layers to be added!");
            }else{
                this.logger.warning("The layer #" + appLayer.id + " can't be found!");
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
        if(layer === undefined){
            return null;
        }
        var options={
            id: id,
            ratio: 1,
            visible: appLayer.checked
        };
        if(appLayer.details && appLayer.details.transparency != undefined) {
            options.alpha = 100-appLayer.details.transparency;
        }

        var layerObj = null;
        
        try {
            if(service.protocol =="wms" ){
                var layerUrl = service.url;

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
                if(layer.name == undefined && layer.details && layer.details.all_children) {
                    options.layers = layer.details.all_children;
                }

                var layerConfig = { };
                
                // styling options
                var style = "registry_default";
                if(appLayer.details != undefined && appLayer.details.style != undefined) {
                    style = appLayer.details.style;
                }
                layerConfig.style = style;

                var sld = null;
                if(style == "registry_default") {
                    if(service.defaultStyleLibrary != undefined) {
                        sld = service.defaultStyleLibrary;
                    }
                } else if(/^sld:/.test(style)) {
                    var slds = service.styleLibraries != undefined ? service.styleLibraries : {};
                    sld = slds[style];
                    
                    // ArcGIS requires the STYLE parameter for GetMap requests
                    // to name the used UserStyle from the SLD
                    if(service.url.toLowerCase().indexOf("/arcgis/") != -1) {
                        if(sld.userStylesPerNamedLayer && sld.userStylesPerNamedLayer[layer.name] && sld.userStylesPerNamedLayer[layer.name].styles.length > 0) {
                            ogcOptions.styles = sld.userStylesPerNamedLayer[layer.name].styles[0].name;
                            layerConfig.sldLegendStyle = ogcOptions.styles;
                            //console.log("Detected ArcGIS WMS service #" + service.id + ", for layer " + layer.name + " using SLD #" + sld.id + " setting STYLE parameter to " + ogcOptions.styles);
                        }
                    }
                    
                    if(sld.extraLegendParameters) {
                        try {
                            layerConfig.extraLegendParameters = Ext.Object.fromQueryString(sld.extraLegendParameters);
                        } catch(e) {
                            this.logger.error("Invalid extra legend parameters for SLD '" + sld.title + "': " + sld.extraLegendParameters + "; error: " + e);
                        }
                    }                    
                } else if(/^wms:/.test(style)) {
                    ogcOptions.styles = style.substring(4);
                    layerConfig.wmsStyle = ogcOptions.styles;
                }

                if(sld != null) {
                    layerConfig.sld = sld;
                    var sldUrl;
                    if(sld.hasBody) {
                        sldUrl = Ext.create(viewer.SLD).createURL(null,null,null,null,sld.id);
                    } else {
                        sldUrl = sld.externalUrl;
                    }
                    ogcOptions.sld = sldUrl;
                    layerConfig.originalSldUrl = sldUrl;
                }

                layerObj = this.mapComponent.createWMSLayer(layer.name,layerUrl , ogcOptions, options,this);
                
                Ext.apply(layerObj.config, layerConfig);

            }else if(service.protocol == "arcims" || service.protocol == "arcgis"){            
                options.layers= layer.name;
                if(layer.details && layer.details.all_children) {
                    options.layers = layer.details.all_children;
                }
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
                options.title = layer.title;
                options.viewerController=this;
                if (layer.details && layer.details["image_extension"]){
                    options.extension = layer.details["image_extension"];
                }
                layerObj = this.mapComponent.createTilingLayer(appLayer.layerName,service.url,options);
            }
        } catch(e) {
            var msg = Ext.String.format("Error creating layer object for appLayer #{0} ({1} {2} layer {3}: {4}",
                id,
                service.protocol,
                service.url,
                appLayer.layerName,
                e);
            this.logger.error(msg);
            
            if(this.isDebug()){
                if(e instanceof Error) {
                    console.log(e);
                    if(e.stack != undefined) {
                        console.log(e.stack);
                    }
                }
            }            
            
            return null;
        }
            
        layerObj.serviceId = appLayer.serviceId;
        layerObj.appLayerId = appLayer.id;
        this.layers[id] = layerObj;
        this.mapComponent.getMap().addLayer(layerObj);  
        
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
     * Compare the min/max scale of the layer with the scale
     * @param appLayer the applayer
     * @param scale (optional) compare with this scale. If ommited, use the current scale of the map
     * @return 0 if within scale 
     *        -1 if applayer.maxScale < scale
     *         1 if appLayer.minScale > scale
     */
    compareToScale: function (appLayer,scale){
        //get the serviceLayer
        var serviceLayer=this.getServiceLayer(appLayer);
        
        var minScale=serviceLayer.minScale;
        var maxScale=serviceLayer.maxScale;
        
        //fix for Esri Configurations. Sometimes users switch max with min. Make 
        //the min the minimal scale and max the maximal scale
        if (this.isMinMaxSwitched(minScale, maxScale)){
            minScale=serviceLayer.maxScale;
            maxScale=serviceLayer.minScale;
        }
        
        /* If minScale or maxScale is '0' then ignore that check
         * It's not correct but this is how it's configured in ESRI by most of the users.
         */
        //no min/max scale or 0? Return true;
        if (!minScale && !maxScale){
            return 0;
        }        
        
        //if scale empty, get from map
        if (scale==undefined || scale==null){
            scale = this.mapComponent.getMap().getScale();
        }
        
        
        var service=this.app.services[appLayer.serviceId];
        //fix some things with scale and resolution differences in servers:
        var scaleCorrection = this.calculateScaleCorrection(service,minScale,maxScale);
        scale = scale * scaleCorrection;        
        
        if (minScale && scale < minScale){
            return 1;            
        }
        if (maxScale && scale > maxScale){
            return -1;
        }            
        return 0;      
    },
            
    /**
     *  Checks if the min/max scale are switched. Sometimes (esri)users switch max with min.
     *  @param minScale The minimum scale as given in the layer
     *  @param maxScale The maximum scale as given in the layer
     */
    isMinMaxSwitched: function(minScale, maxScale){
        if (minScale!==undefined && maxScale!==undefined  && minScale > maxScale){
            return true;
        }else{
            return false;
        }
    },
    /**
     * Check's if this layer is within the current map scale
     * @param appLayer the applayer
     * @param scale (optional) compare with this scale. If ommited, use the current scale of the map
     * @return true/false
     */
    isWithinScale: function (appLayer,scale){
        return (0==this.compareToScale(appLayer,scale));
    },
    /**
     *Zoom to the min or max scale of this layer (make it visible)
     */
    zoomToLayer: function (appLayer){
        var compare = this.compareToScale(appLayer);
        var serviceLayer=this.getServiceLayer(appLayer);
        var serviceScaleCorrection = 1;                
        var service=this.app.services[appLayer.serviceId];        
        
        //fix some things with scale and resolution differences in servers:
        serviceScaleCorrection = 1 / this.calculateScaleCorrection(service,serviceLayer.minScale,serviceLayer.maxScale);
        var mapResolutions = this.mapComponent.getMap().getResolutions();
        if (compare===-1){
            var res =serviceLayer.maxScale*serviceScaleCorrection;
            if(this.isMinMaxSwitched(serviceLayer.minScale,serviceLayer.maxScale)){
                res =serviceLayer.minScale*serviceScaleCorrection;
            }
            if (mapResolutions!==null){
                for (var i =0 ; i < mapResolutions.length; i++){
                    if (res > mapResolutions[i]){
                        res = mapResolutions[i];
                        break;
                    }
                }
            }
            this.mapComponent.getMap().zoomToResolution(res);
        }else if (compare==1){
            var res =serviceLayer.minScale*serviceScaleCorrection;
            if (mapResolutions!=null){
                for (var i =0 ; i < mapResolutions.length; i++){
                    if (res > mapResolutions[i]){
                        if (i==0){
                            res= mapResolutions[i];
                        }else{
                            res = mapResolutions[i-1];
                        }
                        break;
                    }
                }
            }
            this.mapComponent.getMap().zoomToResolution(res);
        }
    },
    /**
     * Fixes the different implementation of scalehint and scaledenominator in services
     * - ArcGis doesn't give the scale in pixel per unit, calculate the 'ArcGis scale'  
     * -Geoserver 2.2.3 doesn't return units per pixel (resolution) in the scalehint but the scale.
        Dirty fix. When min/max scale (resolution) is larger then 750 it's propberly a scaledenominator.
        Then transform the resolution of the map to a scaledenominator      
        @return {number} The correction needed to go from resolution to scaledenominator.So:
            resolution * returnValue = scaledenominator
     */
     calculateScaleCorrection: function (service,minScale,maxScale){
        if (service && service.protocol === "arcgis"){            
            //scale * (dpi / ratio dpi to dpm)
            return 96/0.0254;
        }
        //Chose arbitrary values 750 minscale and 5000 maxscale
        //return correction for scaledenominator
        else if (minScale > 750 || 
                ((minScale === undefined || minScale ===0 )&& maxScale > 5000)){
            return 1/0.00028;
        }
        //no need for changes
        return 1;
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
            
            // Check override for appLayer by service admin
            if(appLayer.details != undefined && appLayer.details.legendImageUrl != undefined) {
                success(appLayer, { parts: [ {url: appLayer.details.legendImageUrl}] });
                return;
            }
            
            var l = this.getLayer(appLayer);
            if(!l) {
                failure(appLayer);
                return;
            }
            
            var serviceLayer = this.getServiceLayer(appLayer);

            // check for WMS STYLE
            if(l.config.wmsStyle) {
                // Get the legend URL from the capabilities for this style;
                // saved in service layer details as JSON string
                var wmsStyle = l.config.wmsStyle;
                if(serviceLayer.details != undefined && serviceLayer.details['wms.styles']) {
                    var styles = Ext.JSON.decode(serviceLayer.details['wms.styles']);
                    
                    var info = null;
                    Ext.Array.each(styles, function(theStyle) {
                        if(theStyle.name == wmsStyle && theStyle.legendURLs && theStyle.legendURLs.length > 0) {
                            
                            info = { parts: [] };
                            Ext.Array.each(theStyle.legendURLs, function(legendURL) {
                                info.parts.push( { url: legendURL });
                            });
                        }
                    });

                    if(info != null) {
                        success(appLayer, info);
                        return;
                    }
                }
            } 
            if(l.config.sld) {
                if(l.getLegendGraphic) {
                    // l.getLegendGraphic() will create GetLegendGraphic URL
                    // with the SLD parameter the layer was created with
                    success(appLayer, { parts: [ { url: l.getLegendGraphic() } ] });
                    return;
                }
            }
            
            // Check override by service admin
            if(serviceLayer.details != undefined && serviceLayer.details['alternateLegendImageUrl']) {
                success(appLayer, { parts: [ {url: serviceLayer.details.alternateLegendImageUrl}] });
                return;
            }

            // Use default legend (for WMS, Legend URL from the first, default Style)
             if(serviceLayer.legendImageUrl) {
                success(appLayer, { 
                    parts: [ {
                        url: serviceLayer.legendImageUrl,
                        label: appLayer.alias
                    }],
                    name: appLayer.alias
                });
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
        if(!appLayer){
            return;
        }
        if(!appLayer.filter){
            appLayer.filter = Ext.create("viewer.components.CQLFilterWrapper",{
                id: "",
                cql: "",
                operator : ""
            });
        }
        appLayer.filter.addOrReplace(filter);
        
        var mapLayer = this.getLayer(appLayer);
        
        if (appLayer.relations && appLayer.relations.length > 0){
            var me = this;
            var url = Ext.urlAppend(actionBeans["sld"], "transformFilter=t");
            //alert("do reformat filter!!!");
            Ext.create("viewer.SLD",{
                actionbeanUrl : url
            }).transformFilter(filter.getCQL(),appLayer.id,
                function(newFilter){
                    //success
                    var cqlBandage = Ext.create("viewer.components.CQLFilterWrapper",{
                        id: "",
                        cql: newFilter,
                        operator : ""
                    });
                    //cqlBandage.addOrReplace(newFilter);
                    mapLayer.setQuery(cqlBandage);
                    me.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,cqlBandage,appLayer);
                },function(message){
                    //failure
                    me.logger.error("Error while transforming SLD for joined/related featuretypes: "+ message);
                });
        }else{
            mapLayer.setQuery(appLayer.filter);
            this.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,appLayer.filter,appLayer);
        }
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
    /**
     * Layer is clicked
     * @param layerObj the layer object
     */
    layerClicked: function(layerObj) {
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_CLICKED, layerObj);
    },
    /**
     * Layer is clicked
     * @param layerObj the layer object
     */
    showHelp: function(configObject) {
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_HELP, configObject);
    },
    /**
     * Get all the registered components.
     * @return {Array} A array of the registered components.
     */
    getComponents: function (){
        var results=[];
        for(var name in this.components) {
            results.push(this.components[name].instance);
        }
        return results;
    },
    /**
     * Get the components by classname
     * @param {String} classname the full name of the class
     * @return {Array} of found components.
     */
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
    /**
     * Get Component by name
     * @param {String} name the name of the component
     * @return the component with the given name or null if not found.
     */
    getComponentByName : function (name){
        var component = this.components[name];
        if(component != undefined) {
            return component.instance;
        } else {
            return null;
        }
    },   
    /**
     * Get the attributes of the appLayer
     */
    getAttributesFromAppLayer: function (appLayer, featureTypeId, addJoinedAttributes){
        if (appLayer.attributes == undefined){
            return appLayer.attributes;
        }
        //if no featureTypeId given, get the one of the application layer.
        if (featureTypeId== undefined || featureTypeId==null){
            var serviceLayer=this.getServiceLayer(appLayer);
            featureTypeId=serviceLayer.featureTypeId;            
        }
        if (addJoinedAttributes==undefined || addJoinedAttributes==null ){
            addJoinedAttributes=true;
        }
        var joinedFeatureTypes=[];
        joinedFeatureTypes.push(featureTypeId);
        if (addJoinedAttributes && appLayer.relations){
             joinedFeatureTypes=joinedFeatureTypes.concat(this.getJoinedFeatureTypes(appLayer.relations,featureTypeId));            
        }
        var attributes=[];
        for (var i =0; i < appLayer.attributes.length; i++){
            var attr = appLayer.attributes[i];
            if (attr.featureType==undefined || joinedFeatureTypes.indexOf(attr.featureType)!=-1){
                attributes.push(attr);
            }
        }
        
        return attributes;
    },
    /**
     * Get a list of featuretypes that are joined with this featuretype.
     * @param {Array} relations array of relations
     * @param {Num} featureTypeId The featureType for which the jiones need to be searched.
     * @return {Array} FeatureTypeIds
     */
    getJoinedFeatureTypes : function(relations,featureTypeId){
        var joinedFeatureTypes=[];
        for (var i=0; i < relations.length; i++){
            var relation=relations[i];
            var newJoined=[]
            if (relation.featureType==featureTypeId && relation.type =="join"){
                newJoined.push(relation.foreignFeatureType);
                if (relation.relations){
                    newJoined=newJoined.concat(this.getJoinedFeatureTypes(relation.relations,relation.foreignFeatureType));
                }
            }else if (relation.relations){
                newJoined=newJoined.concat(this.getJoinedFeatureTypes(relation.relations,featureTypeId));
            }
            //don't add double ft
            for (var b=0; b < newJoined.length; b++){
                if (joinedFeatureTypes.indexOf(newJoined[b])>=0){
                    return joinedFeatureTypes;
                }else{
                    joinedFeatureTypes.push(newJoined[b]);
                }
            }
        }
        return joinedFeatureTypes;
    },
            
    valuesFromURL : function(params){
        var layersLoaded = false;
        var bookmark = false;
        var appLayers = this.app.appLayers;
        var selectedContent = this.app.selectedContent;

        for( var key in params){
            var value = params[key];
            if(key === "bookmark"){
                var me = this;
                Ext.create("viewer.Bookmark").getBookmarkParams(value,function(code){me.succesReadUrl(code);},function(code){me.failureReadUrl(code);});
                layersLoaded = true;
                bookmark = true;
            }else if(key === "layers"){
                if(!Ext.isArray(value)){
                    value = value.split(",");
                }
                appLayers = this.loadBookmarkLayers(value);
                layersLoaded = true;
            }else if(key ==="selectedContent"){
                selectedContent = value;
            }else if(key === "extent"){
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
                var me = this;
                me.newExtent = newExtent;
                var handler = function(){
                    me.mapComponent.getMap().zoomToExtent(me.newExtent);
                    me.mapComponent.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
                };
                this.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);   
            }else if (key === "levelOrder"){
               selectedContent=[];
               if(!Ext.isArray(value)){
                    value = value.split(",");
                }
                for (var v=0; v < value.length; v++){
                    for (var s=0; s < this.app.selectedContent.length; s++){
                        if (this.app.selectedContent[s].id === value[v]){
                            selectedContent.push(this.app.selectedContent[s]);
                            break;
                        }
                    }
                }
                for (var s=0; s < this.app.selectedContent.length; s++){
                    if (!Ext.Array.contains(selectedContent,this.app.selectedContent[s])){
                        selectedContent.push(this.app.selectedContent[s]);
                    }
                }
            }else if(key === "search"){
                if(!Ext.isEmpty(value)){
                    var components = this.getComponentsByClassName("viewer.components.Search");
                    for (var i = 0 ; i < components.length ;i++){
                        var comp = components[i];
                        comp.loadVariables(value);
                    }
                }
            }else{
                var component=this.getComponentByName(key);
                if (component && !Ext.isEmpty(value)){
                    component.loadVariables(value);
                }
            }
        }

        if(layersLoaded && !bookmark){
            this.app.appLayers = appLayers;
            this.setSelectedContent(selectedContent);
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
        this.valuesFromURL(params);
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
                if(type != "layers" && type != "extent" && type != "bookmark" && type != "levelOrder"){
                    paramJSON.params.push({
                        name: type, 
                        value: value
                    });
                }
            }
        }
        
        var visLayers = this.getVisibleLayers();
        for (var i = visLayers.length-1; i >= 0 ; i--){
            var appLayer = this.getAppLayerById(visLayers[i]);
            //remove the layers that are added by user.
            if (appLayer.status == "added"){
                visLayers.splice(i,1);
            }
        }
        if(visLayers.length != 0 ){
            paramJSON.params.push({
                name: "layers", 
                value: visLayers
            });
        }
        
        var extent = this.mapComponent.getMap().getExtent();       
        paramJSON.params.push({
            name: "extent", 
            value: extent
        });
        
        var levelOrder = [];
        for (var i=0; i < this.app.selectedContent.length; i++){
            var levelId = this.app.selectedContent[i].id;
            levelOrder.push(levelId);
        }
        
        paramJSON.params.push({
            name: "levelOrder",
            value: levelOrder
        });
        
        paramJSON.params.push({
            name: "selectedContent",
            value: this.app.selectedContent
        });
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
        var me = this;
        me.layoutManager.resizeLayout(function(){
            // Openlayers needs to be manually resized and has a resize function
            if(me.mapComponent.doResize) {
                me.mapComponent.doResize();
            }
            // We are execturing the doResize function manually on all components, instead of
            // firing an event, because all components are required execute this function
            for(var name in me.components) {
                var component = me.components[name];
                component.instance.resizeScreenComponent();
            }
            return true;
        });
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
