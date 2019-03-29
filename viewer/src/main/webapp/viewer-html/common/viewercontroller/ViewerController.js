/* global Ext, actionBeans, viewer, Proj4js, i18next */

/**
 * ViewerController
 * @class Controller for a GIS application
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
    /* Keep track of open popups to close previous when configured */
    singlePopup: false,
    previousPopup: null,
    dataSelectionChecker:null,
    /** Layers initialized?*/
    layersInitialized: false,
    /**
     * layers that have been registered by controls that wish to benefit from snapping.
     */
    registeredSnappingLayers: [],
    spriteUrl: null,
    /**
     * List of layers for this application and whether the user has them checked/unchecked
     */
    savedCheckedState: {},
        // Debouce resize events
    resizeDebounce: null,
    // Debounce applyFilter calls
    filterDebounce: {},
    // List of elements that are "anchored" to a container. After resizing the element is re-aligned
    anchors: [],
    projection:null,
    projectionString:null,
    
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
        // this.events = {}; // this is needed if addListener() is called and we don't do addEvents() before! See Ext.util.Observable.constructor
        this.callParent([{ listeners: listeners }]);
        this.dataSelectionChecker = Ext.create("viewer.components.DataSelectionChecker", { viewerController: this });
        this.app = app;
        this.projection = this.app.projectionCode.substring(0,this.app.projectionCode.lastIndexOf('['));
        this.projectionString = this.app.projectionCode.substring(this.app.projectionCode.lastIndexOf('[')+1,this.app.projectionCode.lastIndexOf(']'));

        this.queryParams = Ext.urlDecode(window.location.search.substring(1));

        this.savedCheckedState = this.restoreSavedCheckedState();

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
                layoutOptions,
                app.components // Components configuration is used for floating panels
            );
        }
        this.layers = {};

        // Check if single popup is configured
        try {
            if(app.details && app.details.globalLayout) {
                var globalLayout = Ext.JSON.decode(app.details.globalLayout);
                if(globalLayout.hasOwnProperty('singlePopup') && globalLayout.singlePopup) {
                    this.singlePopup = globalLayout.singlePopup;
                }
            }
        } catch(e) {}

        //get the map id
        var mapId = this.layoutManager.getMapId();

        // Get config for map
        var comps = this.app.components;
        var config = {};
        for (var c in comps){
            if(!comps.hasOwnProperty(c)) {
                continue;
            }
            var component = comps[c];
            if(component.className === "viewer.mapcomponents.FlamingoMap" ||
                component.className === "viewer.mapcomponents.OpenLayersMap"){
                config = component.config;
                break;
            }
        }
        config.projection = this.projection;
        config.projectionString = this.projectionString;
        this.initialiseProjectionSupport();
        
        Ext.apply(config, mapConfig || {});
        if(viewerType === "flamingo") {
            this.mapComponent = new viewer.viewercontroller.FlamingoMapComponent(this, mapId,config);
        }else if(viewerType === "openlayers") {
            this.mapComponent = new viewer.viewercontroller.OpenLayersMapComponent(this, mapId,config);
        }else{
            this.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_0') + viewerType);
        }

        this.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,
            this.spinupDataStores, this);

        this.mapComponent.addListener(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE,this.onMapContainerLoaded,this);
        this.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.onSelectedContentChanged,this);

        if(viewerType === "openlayers") {
            this.mapComponent.fireEvent(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE);
        }

        // Listen for resize & orientation changes
        if(window.addEventListener) {
            window.addEventListener("orientationchange", (function() {
                this.resizeComponents(true);
            }).bind(this), false);
            window.addEventListener('resize', (function() {
                this.resizeComponents(true);
            }).bind(this));
        }
        Ext.on('resize', function () {
            this.resizeComponents(true);
        }, this);
    },

    showLoading: function(msg) {
        var loadingMsg = i18next.t('viewer_viewercontroller_viewercontroller_1');
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
        return this.queryParams.hasOwnProperty("debug") && this.queryParams.debug === "true";
    },

    initialiseProjectionSupport:function(){
        //TODO: remove the hardcoded projection....
        if(this.projectionString === ""){
            return;
        }
        Proj4js.defs[this.projection] = this.projectionString;
        
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
                        me.logger.debug(i18next.t('viewer_viewercontroller_viewercontroller_2') + response.message);
                    } else {
                        me.logger.debug(i18next.t('viewer_viewercontroller_viewercontroller_3') + response.error);
                    }
                },
                failure: function(result) {
                    me.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_4') + result.status + " " + result.statusText + ": " + result.responseText);
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
                this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED);
            }
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
                component.config.containerId = layoutComponent.containerId;
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
            throw i18next.t('viewer_viewercontroller_viewercontroller_5', { name: name, className: className });
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

            if(instance.config.hasSharedPopup){
                instance.popup = this.layoutManager.popupWin;
            }
            this.components[name] = {
                className: className,
                instance: instance
            };
        } catch(e) {

            this.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_6', { className: className, e: e, config: config }));

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

    /**
     * Will return the geoservice or null if not found.
     * @param {Number} serviceId
     * @returns {ViewerControllerAnonym$0.app.services} the geoservice
     */
    getService: function (serviceId) {
        if (this.app.services[serviceId]) {
            return this.app.services[serviceId];
        } else {
            return null;
        }
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
            if(!appLayers.hasOwnProperty(key)) {
                continue;
            }
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

        for(var i = 0; i < this.app.selectedContent.length; i++) {
            var content = this.app.selectedContent[i];
            if(content.type == "appLayer") {
                selectedAppLayers.push(content.id);
            } else {
                selectedAppLayers = selectedAppLayers.concat(this.getLevelAppLayerIds(this.app.levels[content.id]));
            }
        }

        for(var i in this.app.appLayers) {
            if(!this.app.appLayers.hasOwnProperty(i)) {
                continue;
            }
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
            if(!level || level.removed){
                return;
            }
            onLevel(level);
            if(level.children) {
                for(var i = 0; i < level.children.length; i++) {
                    var child = app.levels[level.children[i]];
                    traverseLevel(child);
                }
            }
            if(level.layers) {
                for(var j = 0; j < level.layers.length; j++) {
                    var layer = app.appLayers[level.layers[j]];
                    if(layer && !layer.removed){
                        onAppLayer(layer);
                    }
                }
            }
        };

        for(var i = 0; i < app.selectedContent.length; i++) {
            var c = app.selectedContent[i];
            if(c.type == "level") {
                traverseLevel(app.levels[c.id]);
            } else if(c.type == "appLayer") {
                onAppLayer(app.appLayers[c.id]);
            }
        }
    },
    /**
     * Function to determine if the level does exist.
     * @param {Level} level The level to be checked
     */
    doesLevelExist : function (levelToCheck){
        var me = this;
        me.found = false;
        this.traverseSelectedContent(function(level){
            me.found = level.id == levelToCheck.id || me.found;
        }, Ext.emptyFn);
        return me.found;
    },

    getLevelAppLayerIds: function(level) {
        var appLayers = [];
        if (level) {
            if (level.layers) {
                for (var i = 0; i < level.layers.length; i++) {
                    appLayers.push(level.layers[i]);
                }
            }
            if (level.children) {
                for (var c = 0; c < level.children.length; c++) {
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
        for (var levelId in this.app.levels) {
            if(!this.app.levels.hasOwnProperty(levelId)) {
                continue;
            }
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
            if(!this.app.levels.hasOwnProperty(lid)) {
                continue;
            }
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
        this.layers = {};
        this.mapComponent.getMap().removeAllLayers();
    },
    /**
     *Initialize layers and levels
     *@param background true/false/undefined.
     *True if only the background levels and layers must be initialized, false only the other level and layers must be initialized
     *and undefined if both must be initialized (first background, then foreground)
     */
    initLayers : function (background){
        this.layersInitialized=false;
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
        this.layersInitialized=true;
    },

    /**
     *Initialize applayers
     *@param background true/false/undefined.
     *True if only the background levels and layers must be initialized, false only the other level and layers must be initialized
     *and undefined if both must be initialized (first background, then foreground)
     */
    initAppLayer: function(appLayerId,background) {
        var appLayer = this.app.appLayers[appLayerId];
        if (appLayer === undefined) {
            return;
        }
        if (appLayer.background!=background){
            return;
        }

        var layer = this.getOrCreateLayer(appLayer);

        if (layer){
            this.mapComponent.getMap().setLayerVisible(layer, this.getLayerChecked(appLayer));
        }
    },

    /**
     * Get the key under which the checked layers are stored
     * @returns {string}
     */
    getStorageKey: function() {
        return ["checkedlayers", this.getApplicationName(), "v", this.getApplicationVersion()].join("_");
    },

    /**
     * Returns the checked state for an appLayer. If state is saved return saved state, else return default state
     * @param appLayer
     * @returns {boolean}
     */
    getLayerChecked: function(appLayer) {
        var layerid = "" + appLayer.id;
        if(!this.savedCheckedState.hasOwnProperty(layerid)) {
            return appLayer.checked;
        }
        return this.savedCheckedState[layerid];
    },

    /**
     * Saves the checked state of an appLayer to the localstorage
     * @param {Object} appLayer
     * @param {bool} checked
     */
    saveCheckedState: function(appLayer, checked) {
        var layerid = "" + appLayer.id;
        this.savedCheckedState[layerid] = checked;
        // Especially when the TOC is started multiple calls to this function are made
        // so a small timeout is added before persisting to localstorage
        if(this._persistTimer) window.clearTimeout(this._persistTimer);
        this._persistTimer = window.setTimeout((function() {
            viewer.components.LocalStorage.setItem(this.getStorageKey(), this.savedCheckedState);
        }).bind(this), 150);
    },

    /**
     * Restores the state of the checked layers from localstorage. Also checks current appLayers and removes
     * any layers that are not present in the applications appLayers
     * @returns {Object}
     */
    restoreSavedCheckedState: function() {
        var storedLayers = viewer.components.LocalStorage.getItem(this.getStorageKey());
        var checkedLayers = {};
        if(storedLayers === null) {
            return checkedLayers;
        }
        var appLayers = Ext.Object.getKeys(this.app.appLayers);
        for(var layerid in storedLayers) if(storedLayers.hasOwnProperty(layerid)) {
            if(Ext.Array.indexOf(appLayers, layerid) !== -1) {
                checkedLayers[layerid] = storedLayers[layerid];
            }
        }
        return checkedLayers;
    },

    /**
     * Remove saved checked state from localstorage
     */
    removeSavedCheckedState: function() {
        this.savedCheckedState = {};
        viewer.components.LocalStorage.removeItem(this.getStorageKey());
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
                this.logger.warning(i18next.t('viewer_viewercontroller_viewercontroller_7'));
            }
        }
        if(this.layers[appLayer.id] == undefined){
            if (!this.layersInitialized){
                this.logger.warning(i18next.t('viewer_viewercontroller_viewercontroller_8'));
            }else{
                this.logger.warning(i18next.t('viewer_viewercontroller_viewercontroller_9', { appLayerId: appLayer.id }));
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
        this.logger.warning(i18next.t('viewer_viewercontroller_viewercontroller_10'));
        var count=0;
        var foundAppLayer=null;
        for ( var i in this.app.appLayers) {
            if(!this.app.appLayers.hasOwnProperty(i)) {
                continue;
            }
            var appLayer = this.app.appLayers[i];
            if(appLayer.layerName== layerName && appLayer.serviceId == serviceId){
                count++;
                if (foundAppLayer==null){
                    foundAppLayer=appLayer;
                }
            }
        }
        if (count>1){
            this.logger.warning(i18next.t('viewer_viewercontroller_viewercontroller_11', { count: count, serviceId: serviceId, layerName: layerName }));
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
            visible: appLayer.checked,
            serviceId : service.id
        };
        if(appLayer.details && appLayer.details.transparency != undefined) {
            options.alpha = 100-appLayer.details.transparency;
        }
        options.attribution = layer.details && layer.details.attribution ? layer.details.attribution : null;

        var layerObj = null;

        try {
            if(service.protocol =="wms" ){
                var layerUrl = service.url;

                var ogcOptions={
                    exceptions: service.exception_type ? service.exception_type : "application/vnd.ogc.se_inimage",
                    srs: this.projectionCode,
                    version: "1.1.1",
                    layers:layer.name,
                    styles: "",
                    format: "image/png",
                    transparent: true,
                    noCache: true
                };
                
                var correction = this.calculateScaleCorrection(service,layer.minScale, layer.maxScale);
                if(Ext.isDefined(layer.minScale)){
                    var minRes = layer.minScale / correction;
                    ogcOptions.minResulution = minRes;
                }
                
                if(Ext.isDefined(layer.maxScale)){
                    var maxRes = layer.maxScale / correction;
                    ogcOptions.maxResolution = maxRes;
                }
                
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
                            this.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_12', { sldTitle: sld.title, sldLegendParams: sld.extraLegendParameters, e: e }));
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
                if(layer.resolutions){
                    var res=layer.resolutions.split(",");
                    for (var i=0; res.length > i; i++){
                        res[i] = Number(res[i]);
                    }
                    options.resolutions = res;
                }
                if(layer.bbox){
                    options.serviceEnvelope= layer.bbox.minx+","+layer.bbox.miny+","+layer.bbox.maxx+","+layer.bbox.maxy;
                }
                
                options.tileHeight = layer.tileHeight;
                options.tileWidth = layer.tileWidth;
                options.protocol = service.tilingProtocol;
                options.title = layer.title;
                options.viewerController=this;
                if (layer.details && layer.details["image_extension"]){
                    options.extension = layer.details["image_extension"];
                }
                if (layer.details && layer.details["wms.styles"]){
                    var styles = Ext.JSON.decode(layer.details["wms.styles"]);
                    options.style = "";
                    var found = false;
                    for (var  i = 0 ; i < styles.length ;i++){
                        var style = styles[i];
                        if(style.isDefault){
                            options.style = style.identifier;
                            found = true;
                        }
                    }
                    if(!found && styles.length > 0){
                        options.style = styles[0].identifier;
                    }
                    
                }
                if(layer.matrixSets){
                    var matrixSet = layer.matrixSets[0];
                    for(var i = 0 ; i < layer.matrixSets.length ;i++){
                        if(layer.matrixSets[i].crs.indexOf("28992") !== -1){
                            matrixSet = layer.matrixSets[i];
                            break;
                        }
                    }
                    
                    options.matrixSet = matrixSet;
                }
                layerObj = this.mapComponent.createTilingLayer(appLayer.layerName,service.url,options);
            }
        } catch(e) {
            var msg = i18next.t('viewer_viewercontroller_viewercontroller_13', {
                id: id,
                serviceProtocol: service.protocol,
                serviceUrl: service.url,
                appLayerLayerName: appLayer.layerName,
                e: e
            });
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
     * Get the geometry attributes from the argument.
     * @param {appLayer} the initialized appLayer
     * @returns {Array} of attributes
     */
    getAppLayerGeometryAttributes: function (appLayer) {
        var geomFields = appLayer.attributes.filter(function (obj) {
            if (obj.type === "polygon" || obj.type === "multipolygon"
                    || obj.type === "point" || obj.type === "multipoint"
                    || obj.type === "multilinestring" || obj.type === "linestring"
                    || obj.type === "geometry") {
                return obj.alias || obj.name;
            }
        });
        return geomFields;
    },
    /**
     *Get map layer with id of the layer in the service object
     *@param id the id of the layer in a service object
     *@return viewer.viewercontroller.controller.Layer object
     */
    getLayerByLayerId : function (id){
        this.logger.warning(i18next.t('viewer_viewercontroller_viewercontroller_14'));
        for (var i in this.app.services) {
            if(!this.app.services.hasOwnProperty(i)) {
                continue;
            }
            var service = this.app.services[i];
            for(var j in service.layers){
                if(!service.layers.hasOwnProperty(j)) {
                    continue;
                }
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
            if(!this.app.services.hasOwnProperty(i)) {
                continue;
            }
            var service = this.app.services[i];
            for(var j in service.layers){
                if(!service.layers.hasOwnProperty(j)) {
                    continue;
                }
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
     * @param castToStrings boolean An optional parameter to cast all ID's to strings.
     * @return a array of Layer id's (same as appLayerIds) objects
     **/
    getVisibleLayers: function(castToStrings) {
        var layers = this.layers;
        var layerArray = new Array();
        for (var i in layers){
            if (layers.hasOwnProperty(i)){
                var layer = layers[i];
                if(layer.getVisible()) {
                    // When castToStrings is specified all ID's are casted to strings.
                    // This makes it easier to use indexOf (which uses strict === equality checks) on the result
                    layerArray.push(castToStrings ? "" + i : i);
                }
            }
        }
        return layerArray;
    },
    /**
     * Returns an object with visible applayer ids
     * @param castToStrings boolean An optional parameter to cast all ID's to strings.
     * @return a object of Layer id's (same as appLayerIds) objects
     **/
    getVisibleAppLayers: function(castToStrings) {
        var visibleLayerIds = this.getVisibleLayers(castToStrings);
        var visibleAppLayers = {};
        for(var i = 0; i < visibleLayerIds.length; i++) {
            var id=visibleLayerIds[i];
            var appLayer = this.getAppLayerById(id);
            if(appLayer != null) {
                visibleAppLayers[appLayer.id] = true;
            }
        }
        return visibleAppLayers;
    },
    /**
     * Gets the layers that have a maptip configured
     * @param layer a mapComponent layer.
     * @return a string of layer names in the given layer that have a maptip configured.
     */
    isSummaryLayer: function(layer){
        var details = layer.getDetails();
        return this.isSummaryDetails(details);
    },
    /**
     * Check if the given details has data to show configured
     * @param details the details for a layer
     */
    isSummaryDetails: function (details){
        if (details &&
            (!Ext.isEmpty(details["summary.description"]) ||
                !Ext.isEmpty(details["summary.image"]) ||
                !Ext.isEmpty(details["summary.link"]) ||
                !Ext.isEmpty(details["summary.title"]))){
            return true;
        }
        return false;
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
     * @param doCorrection calculate a correction on scale (default: true)
     * @return 0 if within scale
     *        -1 if applayer.maxScale < scale
     *         1 if appLayer.minScale > scale
     */
    compareToScale: function (appLayer,scale,doCorrection){

        if (doCorrection === undefined){
            doCorrection = true;
        }

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

        if (doCorrection){
            //fix some things with scale and resolution differences in servers:
            var scaleCorrection = this.calculateScaleCorrection(service,minScale,maxScale);
            scale = scale * scaleCorrection;
        }

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
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ZOOM_END,res);

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
    calculateScaleCorrection: function (service, minScale, maxScale) {
        var scaleCorrection = 1;
        if (service && service.protocol === "arcgis"){
            //scale * (dpi / ratio dpi to dpm)
            return 96/0.0254;
        }
        //Chose arbitrary values 50 minscale and 5000 maxscale
        //return correction for scaledenominator
        else if (minScale >= 50 ||
                ((minScale === undefined || minScale ===0 )&& maxScale >= 5000)){
            scaleCorrection = 1 / 0.00028;
        }
        // magic multiply
        if (service.url.toLowerCase().indexOf("geoserver") > 0) {
            // test for geoserver
            scaleCorrection = scaleCorrection * 90.7 / 72;
        } else if (service.url.toLowerCase().indexOf("mapserver/wmsserver") > 0) {
            // test for arcgis wms
            scaleCorrection = scaleCorrection * 96 / 72;
        } else {
            // kweenie service
            scaleCorrection = scaleCorrection * 96 / 90.7;
        }
        return scaleCorrection;
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
                success(appLayer, { parts: [ {url: appLayer.details.legendImageUrl, isAlternative:false,serviceId: appLayer.serviceId}] });
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
                                info.parts.push( { url: legendURL, isAlternative:false,serviceId: serviceLayer.serviceId });
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
                    success(appLayer, { parts: [ { url: l.getLegendGraphic(), isAlternative:false,serviceId: serviceLayer.serviceId } ] });
                    return;
                }
            }

            // Check override by service admin
            if(serviceLayer.details != undefined && serviceLayer.details['alternateLegendImageUrl']) {
                success(appLayer, { parts: [ {url: serviceLayer.details.alternateLegendImageUrl, isAlternative:true,serviceId: serviceLayer.serviceId}] });
                return;
            }

            // Use default legend (for WMS, Legend URL from the first, default Style)
             if(serviceLayer.legendImageUrl) {
                success(appLayer, {
                    parts: [ {
                        url: serviceLayer.legendImageUrl,
                        label: appLayer.alias, 
                        isAlternative:false,
                        serviceId: serviceLayer.serviceId
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
                this.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_15', {className:l.$className}));
                failure(appLayer);
            }

        } catch(e) {
            this.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_16',  {appLayerId: appLayer.id, e: e}));
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
        this.applyFilter(appLayer);
    },

    applyFilter : function(appLayer){
        var mapLayer = this.getLayer(appLayer);
        if(!mapLayer) {
            return;
        }
        if (appLayer.relations && appLayer.relations.length > 0 && appLayer.filter && appLayer.filter.getCQL()){
            if(this.filterDebounce[appLayer.id]) {
                window.clearTimeout(this.filterDebounce[appLayer.id]);
            }
            // Small timeout to prevent multiple calls to backend
            this.filterDebounce[appLayer.id] = window.setTimeout((function() { this._doApplyFilter(appLayer, mapLayer); }).bind(this), 250);

        }else{
            this._doApplyFilter(appLayer, mapLayer);
        }
    },

    _doApplyFilter: function(appLayer, mapLayer) {
        var me = this;
        if(!appLayer.filter){
            appLayer.filter = Ext.create("viewer.components.CQLFilterWrapper", { id: "", cql: "", operator : "" });
        }
        var url = Ext.urlAppend(actionBeans["sld"], "transformFilter=t");
        Ext.create("viewer.SLD", {
            actionbeanUrl: url
        }).transformFilter(appLayer.filter.getCQL(), appLayer.id,
            function (newFilter, hash, sessionId) {
                if (appLayer.filter.getCQL() && appLayer.filter.getCQL() !== "") {
                    //success
                    var cqlBandage = Ext.create("viewer.components.CQLFilterWrapper", {
                        id: "",
                        cql: newFilter,
                        operator: ""
                    });
                    mapLayer.setQuery(cqlBandage, hash, sessionId);

                } else {
                    mapLayer.setQuery(appLayer.filter);
                }
                me.fireEvent(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED, appLayer.filter, appLayer);
            }, function (message) {
                //failure
                me.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_17',  {message: message}));
            }
        );
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
            this.applyFilter(layer);
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
     * @return {Array} An array of the registered components.
     */
    getComponents: function (){
        var results=[];
        for(var name in this.components) {
            if(this.components.hasOwnProperty(name)) {
                results.push(this.components[name].instance);
            }
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
            if(this.components.hasOwnProperty(name)) {
                var component = this.components[name];
                if(component.className == className) {
                    result.push(component.instance);
                }
            }
        }
        return result;
    },
    /**
     * Get the components by an incomplete classname
     * @param {String} classname the incomplete name of the class
     * @return {Array} of found components.
     */
    getComponentsByIncompleteClassName : function(className) {
        var result = [];
        for(var name in this.components) {
            if(this.components.hasOwnProperty(name)) {
                var component = this.components[name];
                if(component.className.toLowerCase().indexOf(className)!== -1) {
                    result.push(component.instance);
                }
            }
        }
        return result;
    },
    /**
     * Get the components by classnames
     * @param {Array} classNames full names of the class(es)
     * @return {Array} of found components.
     */
    getComponentsByClassNames : function(classNames) {
        var result = [];
        for(var name in this.components) {
            if(this.components.hasOwnProperty(name)) {
                var component = this.components[name];
                if(Ext.Array.indexOf(classNames, component.className) !== -1) {
                    result.push(component.instance);
                }
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
     * Deactivate contols by calling cancel(), will also deactivate subclasses
     * of the specified classes.
     *
     * eg. when called with [viewer.components.Merge] and
     * viewer.components.IbisMerge", { extend: "viewer.components.Merge"...
     * both Merge and IbisMerge will be cancelled.
     *
     * This will raise an error if a class listed in the argument does not have a cancel() function.
     *
     * @param {Array} cancellable An array of classnames that have a cancel function to be called
     */
    deactivateControls: function (cancellable) {
        var cmps = this.getComponents();
        for (var i = 0; i < cmps.length; i++) {
            for (var n = 0; n < cancellable.length; n++) {
                if (cmps[i].self.getName() === cancellable[n] ||
                        cmps[i].superclass.self.getName() === cancellable[n]) {
                    if (typeof cmps[i].cancel === "function") {
                        cmps[i].cancel();
                    } else {
                        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_viewercontroller_18') + cmps[i].self.getName()});
                    }
                }
            }
        }
    },
    /**
     * Get the attributes of the appLayer
     */
    getAttributesFromAppLayer: function (appLayer, featureTypeId, addJoinedAttributes){
        if (appLayer.attributes == undefined){
            return undefined;
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
            for (var b = 0; b < newJoined.length; b++){
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
        var levelsLoaded = [];
        var appLayers = this.app.appLayers;
        var selectedContent = this.app.selectedContent;

        for( var key in params) {
            if(!params.hasOwnProperty(key)) {
                continue;
            }
            var value = params[key];
            if(key === "bookmark"){
                if(value){
                    var me = this;
                    Ext.create("viewer.Bookmark").getBookmarkParams(value,function(code){me.succesReadUrl(code);},function(code){me.failureReadUrl(code);});
                    layersLoaded = true;
                    bookmark = true;
                }
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

                for (var i = 0; i < value.length; i++) {
                    if (value[i][0] === "L") {
                        var id = value[i].slice(1, value[i].length);
                        selectedContent.push({
                            type: "level",
                            id: id
                        });
                        this.app.levels[id].removed = false;
                        levelsLoaded.push(id);
                    } else if (value[i][0] === "A") {
                        var id = value[i].slice(1, value[i].length);
                        selectedContent.push({
                            type: "appLayer",
                            id: id
                        });
                    } else {
                        selectedContent.push({
                            type: "level",
                            id: value[i]
                        });
                        levelsLoaded.push(value[i]);
                    }
                }
            }else if(key === "levels"){
                this.app.levels = value;
            }else if (key ==="forceLoadLayers") {
                layersLoaded = true;
            }else{
                if (!Ext.isEmpty(value)) {
                    var component = this.getComponentByName(key);
                    if (component) {
                        component.loadVariables(value);
                    } else {
                        var comps = this.getComponentsByIncompleteClassName(key);
                        if (comps.length > 0 ) {
                            for (var i = 0; i < comps.length; i++) {
                                var comp = comps[i];
                                comp.loadVariables(value);
                            }
                        }
                    }
                }
            }
        }

        if(layersLoaded && !bookmark){
            this.app.appLayers = appLayers;
            // set all applayers of the loaded levels to removed = false, so the layers will be added to the map (and not an empty level is visible in the toc)
            for(var i = 0 ; i < levelsLoaded.length ;i++){
                var layers = this.app.levels[levelsLoaded[i]].layers;
                for(var j = 0 ; j < layers.length; j++){
                    this.app.appLayers[layers[j]].removed = false;
                }
            }
            this.setSelectedContent(selectedContent);
            this.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,function(){

                this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED);
            }, this,{single:true});
        }

        return layersLoaded;
    },
    loadBookmarkLayers : function(values){
        var appLayers = this.app.appLayers;

        for ( var i in appLayers){
            if(!appLayers.hasOwnProperty(i)) {
                continue;
            }
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
                appLayer.removed = false;
            }else{
                appLayer.checked = false;
            }
        }
        return appLayers;
    },
    succesReadUrl : function(code){
        var paramJSON = Ext.JSON.decode(code);

        var params = {};
        for ( var i = 0 ; i < paramJSON["params"].length ; i++){
            var parameter = paramJSON["params"][i];
            var key = parameter.name;
            var value = parameter.value;
            params[key] = value;
        }
        this.valuesFromURL(params);
    },
    failureReadUrl : function(code){
        this.logger.error(i18next.t('viewer_viewercontroller_viewercontroller_19', { code: code }));
    },
    getBookmarkUrl : function(){
        var paramJSON = {
            params:[]
        };

        var url = window.location.origin+ actionBeans["app"];
        url += "/"+this.app.name;
        if(typeof this.app.version !== "undefined") {
            url += "/v"+this.app.version;
        }
        var param = {
            name: "url",
            value: url+"?"
        };
        paramJSON.params.push(param);
        
        var obj = Ext.urlDecode(window.location.search);
        
        for (var option in obj){
            if(option != "layers" && option != "extent" && option != "bookmark" && option != "levelOrder"){
                paramJSON.params.push({
                    name: option,
                    value: obj[option]
                });
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
            var layer = this.app.selectedContent[i];
            var levelId = this.app.selectedContent[i].id;
            if(layer.type === "level"){
                levelId = "L"+levelId;
            }
            else if(layer.type === "appLayer"){
                levelId = "A"+levelId;
            }
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

        paramJSON.params.push({
            name: "levels",
            value: this.app.levels
        });

        return paramJSON;
    },
    getApplicationSprite: function() {
        // XXX this class does not need to know about the sprite Component.js
        // uses - replace by generic app config details access function
        // or if sprite is used more widely provide it outside Component.js
        if(Ext.isDefined(this.app.details) && Ext.isDefined(this.app.details.iconSprite)) {
            if(this.hasSvgSprite()) {
                return this.checkSvgSupport(this.app.details.iconSprite);
            }
            return this.app.details.iconSprite;
        }
        return null;
    },
    /**
     * Checks is the sprite URL is using a SVG sprite
     * @param {String} sprite
     * @returns {Boolean}
     */
    hasSvgSprite: function() {
        // Check if extension is SVG
        var sprite = this.app.details.iconSprite || "";
        return sprite.substring(sprite.length - 4, sprite.length) === ".svg";
    },
    /**
     * Check support for External Content for SVG
     * If not supported, get SVG using Ajax and add to body
     * @param {String} sprite
     * @returns {String}
     */
    checkSvgSupport: function(sprite) {
        // Check already executed, return spriteUrl
        if(this.spriteUrl !== null) {
            return this.spriteUrl;
        }
        // Unfortunately it is not easy to detect support for external content
        // This check is borrowed from https://github.com/jonathantneal/svg4everybody
        var noExternalContentSupport = /\bEdge\/12\b|\bTrident\/[567]\b|\bVersion\/7.0 Safari\b/.test(navigator.userAgent) || (navigator.userAgent.match(/AppleWebKit\/(\d+)/) || [])[1] < 537;
        if(!noExternalContentSupport) {
            // External content is supported, return full sprite URL
            this.spriteUrl = sprite;
            return this.spriteUrl;
        }
        // Versions of IE/Edge and Safari do not support external content in xlink:href
        // This can be solved by adding the SVG document to the body
        // The SVG is fetched using Ajax and then appended to the body
        Ext.Ajax.request({
            url: sprite,
            success: function(result) {
                var svgsprite = result.responseText;
                var body = document.querySelector('body');
                var svgcontainer = document.createElement('div');
                svgcontainer.style.display = 'none';
                svgcontainer.innerHTML = svgsprite;
                body.insertBefore(svgcontainer, body.firstChild);
            }
        });
        // Return empty sprite url so the SVG inside the body is used
        this.spriteUrl = "";
        return this.spriteUrl;
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

    /**
     * Gets the ID of the map container
     * @returns string
     */
    getMapId: function() {
        return this.layoutManager.getMapId();
    },

    getWrapperId: function() {
        return this.layoutManager.getWrapperId();
    },

    /**
     *
     */
    anchorTo: function(element, container, position, offsets) {
        this.anchors.push({ element: element, container: container, position: position, offsets: offsets });
    },
    doAlignAnchors: function() {
        for(var i = 0; i < this.anchors.length; i++) {
            this.anchors[i].element.alignTo(this.anchors[i].container, this.anchors[i].position, this.anchors[i].offsets);
        }
    },
    /**
     * Get the application name
     * @returns string
     */
    getApplicationName: function() {
        return this.app.name;
    },

    /**
     * Get the application version
     * @returns string
     */
    getApplicationVersion: function() {
        return this.app.version;
    },

    /**
     * Registers all open windows to close previous windows if needed
     * @param ScreenPopup popup
     */
    registerPopupShow: function(popup) {
        if(this.singlePopup && this.previousPopup && this.previousPopup !== popup) {
            this.previousPopup.hide();
        }
        this.previousPopup = popup;
    },
    /**
     * Register a layer as a snapping client.
     * To be called by controls that which to benefit from snapping before they
     * add the layer to the map.
     *
     * @param {type} vectorLayer the layer to add
     * @returns {void}
     */
    registerSnappingLayer: function (vectorLayer) {
        if (!Ext.Array.contains(this.registeredSnappingLayers, vectorLayer)) {
            this.registeredSnappingLayers.push(vectorLayer);
        }
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
      /**
       * Entrypoint for updating the components.
       * @param {boolean} informLayoutmanager If true, than the layoutmanager will be called. Not set of false, will not inform the layoutmanager (and thus the map will
       * not be updated). Used to prevent endless calling of functions
       *  @returns {boolean} Always true
       */
    resizeComponents: function(informLayoutmanager) {
        var me = this;
        if(this.resizeDebounce !== null) {
            window.clearTimeout(this.resizeDebounce);
        }
        this.resizeDebounce = window.setTimeout(function() {
            if(informLayoutmanager){
                me.layoutManager.resizeLayout(function(){
                    me.doAlignAnchors();
                    return me.resizeComponentsImpl();
                });
            }else{
                me.doAlignAnchors();
                return me.resizeComponentsImpl();
            }
        }, 50);
    },
    /**
     * Actual calling the resize functions of all the components
     * @returns {Boolean}
     */
    resizeComponentsImpl: function(){
        var me = this;
         // Openlayers needs to be manually resized and has a resize function
        if(me.mapComponent.doResize) {
            me.mapComponent.doResize();
        }
        me.mapComponent.getMap().updateSize();
        // We are execturing the doResize function manually on all components, instead of
        // firing an event, because all components are required execute this function
        for(var name in me.components) {
            if(me.components.hasOwnProperty(name)) {
                var component = me.components[name];
                component.instance.resizeScreenComponent();
            }
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
    },

    destroyComponents: function() {
        for(var name in this.components) {
            if(this.components.hasOwnProperty(name)) {
                this.components[name].instance.destroy();
            }
        }
        delete this.components;
    }
});
