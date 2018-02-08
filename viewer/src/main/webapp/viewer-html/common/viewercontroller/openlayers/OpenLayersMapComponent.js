/**
 * @class
 * @constructor
 * @augments MapComponent
 * @description MapComponent subclass for OpenLayers
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.OpenLayersMapComponent",{
    extend: "viewer.viewercontroller.MapComponent",
    mapOptions:null,
    // References to the dom object of the content top and -bottom.
    contentTop:null,
    contentBottom:null,
    config:{
        theme: "flamingo"
    },
    constructor :function (viewerController, domId,config){
        /* create a wrapper div so placement of topmenu and bottomcontainer can be done properly */
        this.domId = Ext.id();
        var container = document.createElement('div');
        container.id = this.domId;
        container.style.height = '100%';
        container.style.width = '100%';
        document.getElementById(domId).appendChild(container);

        viewer.viewercontroller.OpenLayersMapComponent.superclass.constructor.call(this, viewerController, this.domId,config);
        this.pointButton = null;
        this.lineButton = null;
        this.polygonButton = null;
        var resolutions;
        if(config && config.resolutions){
            var rString = (config.resolutions).split(",");
            resolutions=[];
            for (var i = 0; i < rString.length; i++){
                var res=Number(rString[i]);
                if (!isNaN(res)){
                    resolutions.push(res);
                }
            }
        }else{
            resolutions = [3440.64,1720.32,860.16,430.08,215.04,107.52,53.76,26.88,13.44,6.72,3.36,1.68,0.84,0.42,0.21,0.105];
        }
        //TODO: remove the hardcoded projection....
        Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs";
        //set some default options.
        this.mapOptions =  {
            projection:new OpenLayers.Projection("EPSG:28992"),
            maxExtent: new OpenLayers.Bounds(7700,304000,280000,620000),
            allOverlays: true,
            units :'m',
            resolutions: resolutions,
            resolution: 512
        };
        /*listen to ON_COMPONENTS_FINISHED_LOADING to check if there is a tool configured
         *Otherwise add default tool. Small delay to step out of the thread.
         */
        var me =this
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,function(){
            setTimeout(function(){me.checkTools()},10);
        },this);
        return this;
    },

    checkTools : function(){
        var enable = true;
        if(this.getTools().length !== 0){
            var tools = this.getTools();
            for (var i = 0 ; i < tools.length;i++){
                var tool = tools[i];
                if(tool.blocksDefaultTool){
                    enable = false;
                }
            }
        }

        if(enable){
            var defaultTool = new viewer.viewercontroller.openlayers.tools.OpenLayersDefaultTool({
                viewerController: this.viewerController,
                id: 'defaultTool'
            });
            this.addTool(defaultTool);
            defaultTool.setVisible(false);
            defaultTool.activate();
        }
    },

    /**
     * @function
     * @description Initializes the events
     */
    initEvents : function(){
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_DOWN]                             = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_UP]                               = "deactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_CAPABILITIES]                       = "onGetCapabilities";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE]                        = "onConfigComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED]                          = "featureadded";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CLICK]                                  = "click";
        this.eventList[viewer.viewercontroller.controller.Event.ON_SET_TOOL]                               = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE]            = "onUpdateComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LOADING_START]                          = "loadstart";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LOADING_END]                            = "loadend";
        this.eventList[viewer.viewercontroller.controller.Event.ON_MEASURE]                                = "measure";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT]                 = "moveend";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT]                          = "move";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED]                          = "removelayer";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_ADDED]                            = "addlayer";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO]                       = "getfeatureinfo";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED]               = "changelayer";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ACTIVATE]                               = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_DEACTIVATE]                             = "deactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ZOOM_END]                               = "zoomend";
    },
    /**
     * @description Gets the panel of this controller and OpenLayers.Map. If the panel is still null, the panel is created and added to the map.
     * @returns a OpenLayers.Control.Panel
     */
    getPanel : function(){
        if (this.panel==null){
            this.createPanel();
        }
        return this.panel;
    },
    /**
     * @description Creates a OpenLayers.Control.Panel and adds it to the map
     */
    createPanel : function (id){
        var panel= new OpenLayers.Control.Panel({
            saveState: true,
            div: this.contentTop // Render the panel to the previously created div
        });
        this.initSvgSupport(panel);
        this.panel = panel;
        this.maps[0].getFrameworkMap().addControl(this.panel);
    },
    
    initSvgSupport: function(panel) {
        if(!this.viewerController.hasSvgSprite()) {
            return;
        }
        // Override the rendering of panel buttons 
        // to be able to use SVG
        var appSprite = this.viewerController.getApplicationSprite();
        OpenLayers.Util.extend(panel, {
            createControlMarkup: function(control) {
                var buttondiv = document.createElement("div");
                if(control.flamingoIconDefined) {
                    return buttondiv;
                }
                var displayClass = control.displayClass.toLowerCase().replace("olcontrolnavigationhistory ", "");
                buttondiv.innerHTML = [
                    '<div class="svg-click-area"></div>', // An extra transparent DIV is added to fix issue where button could not be clicked in IE
                    '<svg role="img" title=""><use xlink:href="',
                    appSprite,
                    '#icon-',
                    displayClass,
                    '"/></svg>'
                ].join('');
                buttondiv.className += 'svg-tool';
                control.events.on({
                    activate: function() {
                        buttondiv.className += ' svg-tool-active';
                    },
                    deactivate: function() {
                        buttondiv.className = buttondiv.className.replace(' svg-tool-active', '');
                    }
                });
                return buttondiv;
            }
        });
    },
    
    /**
     *Creates a Openlayers.Map object for this framework. See the openlayers.map docs
     *@see viewer.viewercontroller.MapComponent#createMap
     *@returns a OpenLayersMap
     */
    createMap : function(id, options){
        options = Ext.merge(this.mapOptions,options);
        options["theme"]= actionBeans["css"]+"?theme="+this.getTheme() + "&location="+  OpenLayers._getScriptLocation() + "&app="+this.viewerController.app.id;//+'theme/'+this.getTheme()+'/style.jsp';
        options.mapComponent=this;
        options.viewerController = this.viewerController;
        options.domId=this.domId;
        var olMap = Ext.create("viewer.viewercontroller.openlayers.OpenLayersMap",options);
        return olMap;
    },

    createMenus : function(top, bottom){
        // Make a panel div in order to:
        // 1. catch mouseclicks/touch events to the panel (when a misclick is done) so it doesn't propagate to the map (and trigger some other controls)
        // 2. make it possible to place the toolbar out of the map
        // 3. make it possible to place scalebar/mouseposition/etc. out of the map

        // Div container for content
        var container = document.getElementById(this.domId);
        container.style.position = "absolute";

        // Top menu
        var mapEl = Ext.get(this.getMap().frameworkMap.viewPortDiv.id);
        var currentHeight = mapEl.getHeight();
        mapEl.dom.style.position = "absolute";

        var topHeight;
        if(top.indexOf("%") == -1){
            currentHeight -= top;
            topHeight = top;
        }else{
            var percent = top.substring(0,top.indexOf("%"));
            var heightInPixels = currentHeight / 100 * percent;
            currentHeight -= heightInPixels;
            topHeight = heightInPixels;
        }
        container.style.top = topHeight + 'px';

        // Bottom menu
        var bottomHeight;
        if(bottom.indexOf("%") == -1){
            bottomHeight = bottom;
            currentHeight -= bottom;
        }else{
            var percent = bottom.substring(0,bottom.indexOf("%"));
            var heightInPixels = currentHeight / 100 * percent;
            bottomHeight = heightInPixels;
            currentHeight -= heightInPixels;
        }

        container.style.height = currentHeight + 'px';

        // Make divs
        this.contentTop = document.createElement('div');
        this.contentTop.id = 'content_top';

        var topStyle = this.contentTop.style;
        var topLayout= this.viewerController.getLayout('top_menu');
        if(topLayout.height ) {
            topStyle.background = topLayout.bgcolor;
            topStyle.height = topLayout.height + topLayout.heightmeasure;
        }

        // Give it a higher z-index than the map to render it on top of the map
        mapEl.dom.style.zIndex = 100;
        topStyle.zIndex = mapEl.dom.style.zIndex + 1;

        this.contentTop.setAttribute("class","olControlPanel");
        container.parentNode.insertBefore(this.contentTop, container);

        // Make content_bottom
        if(bottomHeight && parseInt(bottomHeight) > 0 ){
            this.contentBottom = document.createElement('div');
            this.contentBottom.id = "content_bottom";
            var bottomStyle = this.contentBottom.style;
            var bottomLayout = this.viewerController.getLayout('content_bottom');
            bottomStyle.height = bottomHeight + "px";
            bottomStyle.background = bottomLayout.bgcolor;
            bottomStyle.top = currentHeight + parseInt(topHeight) + "px";
            bottomStyle.position = "relative";
            container.parentNode.appendChild(this.contentBottom);
        }
        this.getMap().updateSize();
    },

    /**
     * Resize function is called when the screen is resized
     */
    doResize: function() {
        // Container
        var container = Ext.get(document.getElementById(this.domId).parentNode);
        var totalHeight = container.getHeight();

        // Top menu
        var topMenuHeight= Number(this.viewerController.getLayout('top_menu').height);

        // Footer
        if(this.contentBottom !== null) {
            var footer = Ext.get(this.contentBottom);
            footer.setTop((totalHeight - footer.getHeight()) + 'px');
        }

        // Map
        var mapEl = Ext.get(this.domId);
        var height = totalHeight - topMenuHeight;
        if(footer != null){
            height -= footer.getHeight();
        }
        mapEl.setHeight(height + 'px');
    },

    /**
     *See @link MapComponent.createWMSLayer
     */
    createWMSLayer : function(name, wmsurl,ogcParams,config){
        config.options = new Object();
        config.options["id"]=null;
        config.options["isBaseLayer"]=true;
        config.options["transitionEffect"] = "resize";
        config.options["events"] = new Object();
        config.options["visibility"] = ogcParams["visible"];
        config.options["name"]=name;
        config.options["url"]=wmsurl;
        // TODO: still needed?
        for (var key in ogcParams){
           config.options[key]=ogcParams[key];
        }
        config.ogcParams=ogcParams;
        config.viewerController = this.viewerController;
        config.options.url = wmsurl;
        if(config.alpha != undefined) {
            config.options.opacity = (config.alpha / 100);
        }
        if (config.ratio !=undefined){
            config.options.ratio = config.ratio;
        }
        var wmsLayer = Ext.create("viewer.viewercontroller.openlayers.OpenLayersWMSLayer",config);
        return wmsLayer;
    },
    /**
     *see {@link MapComponent.createTMSLayer} sdf
     */
    createTilingLayer : function (name,url, options){
        options.name=name;
        options.url=url;
        options.viewerController=this.viewerController;
        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        var tmsLayer= new viewer.viewercontroller.openlayers.OpenLayersTilingLayer(options);
        return tmsLayer;
    },
    /**
     *see {@link MapComponent.createArcIMSLayer}
     */
    createArcIMSLayer : function (name,url, options, viewerController){
        options.name=name;

        // Set URL to proxy
        options.url = Ext.urlAppend(actionBeans.proxy, Ext.Object.toQueryString({ url: url, mode: 'arcims'}));

        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        options.serviceName = options.mapservice;
        options.viewerController=this.viewerController;

        var arcIMS= Ext.create("viewer.viewercontroller.openlayers.OpenLayersArcIMSLayer",options);
        return arcIMS;
    },
    /**
     *see @link MapComponent#createArcServerLayer
     */
    createArcServerLayer : function(name,url,options,viewerController){
        options.name=name;
        options.url=url;
        options.viewerController=viewerController;
        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        var arcServer = Ext.create("viewer.viewercontroller.openlayers.OpenLayersArcServerLayer",options);
        return arcServer;
    },
    /**
     *See @link MapComponent#createImageLayer
     */
    createImageLayer : function (name,url, bounds){
        var imageLayer = Ext.create("viewer.viewercontroller.openlayers.OpenLayersImageLayer",{
            id: name,
            url: url,
            extent : bounds,
            frameworkLayer : this.viewerObject,
            viewerController: this.viewerController
        });

        return imageLayer;
    },
    /**
     *See @link MapComponent#createVectorLayer
     */
    createVectorLayer : function(options){
        if (options==undefined){
            options = new Object();
            options["isBaseLayer"]= false;
        }else{
            if(options["isBaseLayer"] == undefined){
                options["isBaseLayer"]= false;
            }
        }

        return Ext.create("viewer.viewercontroller.openlayers.OpenLayersVectorLayer",options);
    },
    /**
     * createComponent(config)
     * Creates a new, OpenLayers specific component. Used for components that implement openlayerspecific stuff
     *
     */
    createComponent : function (config){
        var type = config.type;
        var comp = null;
        if(type == viewer.viewercontroller.controller.Component.LOADMONITOR){
            comp = Ext.create("viewer.viewercontroller.openlayers.components.OpenLayersLoadMonitor",config);
        }else if(type == viewer.viewercontroller.controller.Component.OVERVIEW){
            comp = Ext.create("viewer.viewercontroller.openlayers.components.OpenLayersOverview",config);
        }else if(type == viewer.viewercontroller.controller.Component.MAPTIP){
            comp = Ext.create("viewer.viewercontroller.openlayers.components.OpenLayersMaptip",config,this.getMap());
        }else if(type == viewer.viewercontroller.controller.Component.NAVIGATIONPANEL){

            var topMenuHeight = Number(this.viewerController.getLayout('top_menu').height);
            var minTop = 40;

            // divide by 2 is necessary for some reason?
            var y = topMenuHeight > minTop ? 4 : (minTop - topMenuHeight) / 2 + 2;
            var x=0;
            if (config.top){
                y+=Number(config.top);
            }if (config.left){
                x = Number(config.left);
            }
            var showPanButtons = true;
            if(config.hasOwnProperty('navigationPanel') && !config.navigationPanel) {
                showPanButtons = false;
            }
            var panZoom =  new OpenLayers.Control.PanZoomBar({position: new OpenLayers.Pixel(x,y), zoomWorldIcon: showPanButtons, panIcons: showPanButtons });
            if(config.zoomToFullIsStart){
                var me = this;
                function onButtonClick (evt) {
                    var btn = evt.buttonElement;
                    switch (btn.action) {
                        case "panup":
                            this.map.pan(0, -this.getSlideFactor("h"));
                            break;
                        case "pandown":
                            this.map.pan(0, this.getSlideFactor("h"));
                            break;
                        case "panleft":
                            this.map.pan(-this.getSlideFactor("w"), 0);
                            break;
                        case "panright":
                            this.map.pan(this.getSlideFactor("w"), 0);
                            break;
                        case "zoomin": 
                            this.map.zoomIn();
                            this.fireEvent(viewer.viewercontroller.controller.Event.ON_ZOOM_END,position);
                            break;
                        case "zoomout": 
                            this.map.zoomOut(); 
                            this.fireEvent(viewer.viewercontroller.controller.Event.ON_ZOOM_END,position);
                            break;
                        case "zoomworld": 
                            me.viewerController.mapComponent.getMap().zoomToExtent(me.viewerController.mapComponent.mapOptions.options.startExtent); 
                            this.fireEvent(viewer.viewercontroller.controller.Event.ON_ZOOM_END,position);
                            break;
                    }
                }
                panZoom.onButtonClick = onButtonClick;
            }

            comp = Ext.create("viewer.viewercontroller.openlayers.OpenLayersComponent",config,panZoom);
        }else if (type == viewer.viewercontroller.controller.Component.BORDER_NAVIGATION){
            comp = Ext.create("viewer.viewercontroller.openlayers.components.OpenLayersBorderNavigation",config);
        }else if(type == viewer.viewercontroller.controller.Component.COORDINATES){
            var options = { numDigits: config.decimals};
            if(this.contentBottom){
                options.div = this.contentBottom;
                config.cssClass = "olControlMousePosition";
            }
            comp = Ext.create("viewer.viewercontroller.openlayers.OpenLayersComponent",config, new OpenLayers.Control.MousePosition(options));
        }else if(type == viewer.viewercontroller.controller.Component.SCALEBAR){
            var frameworkOptions={}
            frameworkOptions.bottomOutUnits='';
            frameworkOptions.bottomInUnits='';
            if (!Ext.isEmpty(config.units)){
                frameworkOptions.topOutUnits=config.units;
            }
            if(this.contentBottom){
                frameworkOptions.div = this.contentBottom;
                config.cssClass = "olControlScale";
            }
            comp = Ext.create("viewer.viewercontroller.openlayers.OpenLayersComponent",config,
                new OpenLayers.Control.ScaleLine(frameworkOptions));
        } else if(type == viewer.viewercontroller.controller.Component.SNAPPING) {
            comp = Ext.create("viewer.viewercontroller.openlayers.OpenLayersSnappingController", config);
        } else {
            this.viewerController.logger.warning ("Framework specific component with type " + type + " not yet implemented!");
        }
        return comp;
    },
    /**
     * @see viewer.viewercontroller.MapComponent#createTool
     *
     **/
    createTool : function (conf){
        var type = conf.type;
        var id = conf.id;
        conf.viewerController=this.viewerController;
        var frameworkOptions={};
        if(conf.frameworkOptions) {
            frameworkOptions = conf.frameworkOptions;
        }
        //pass the tool tip to the framework object.
        if (conf.tooltip){
            frameworkOptions.title=conf.tooltip;
        }

        if (type==viewer.viewercontroller.controller.Tool.NAVIGATION_HISTORY){//1
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.NavigationHistory(options));
        }else if(type == viewer.viewercontroller.controller.Tool.ZOOMIN_BOX){
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomBox(frameworkOptions))
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOMIN_BUTTON){//26,
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomIn(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOMOUT_BOX){//3,
            frameworkOptions["out"] = true;
            frameworkOptions["displayClass"] = "olControlZoomOut";
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomBox(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOMOUT_BUTTON){//6,
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomOut(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOM){//7,
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.Zoom(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.PAN){
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.DragPan(frameworkOptions))
        }else if (type==viewer.viewercontroller.controller.Tool.SUPERPAN){//5,
            frameworkOptions.enableKinetic=true;
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.DragPan(frameworkOptions));
        }else if (type == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO) {
            return new viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool(conf);
        }else if(type === viewer.viewercontroller.controller.Tool.MEASURELINE ||type === viewer.viewercontroller.controller.Tool.MEASUREAREA ){
            var handler = conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? OpenLayers.Handler.Path : OpenLayers.Handler.Polygon;
            var measureTool= new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.Measure( handler, frameworkOptions));
            if(conf.type === viewer.viewercontroller.controller.Tool.MEASUREAREA){
                measureTool.getFrameworkTool().displayClass = 'olControlMeasureArea';
            }
            return measureTool;
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOM_BAR){//13,
            return new OpenLayersTool(conf,new OpenLayers.Control.PanZoomBar(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.DEFAULT){//15,
            return new viewer.viewercontroller.openlayers.tools.OpenLayersDefaultTool(conf);
        }else if (type==viewer.viewercontroller.controller.Tool.PREVIOUS_EXTENT
               || type==viewer.viewercontroller.controller.Tool.NEXT_EXTENT) {//19, 20

            // We need the tooltips from both the previous and next components,
            // search in viewerController for the configs...
            //
            // 'Wrong way' of navigating the API, and we can't use ViewerController.getComponentsByClassName
            // because that isn't initialized yet

            frameworkOptions = { };

            for(var name in this.viewerController.app.components) {
                var c = this.viewerController.app.components[name];
                if(c.className == "viewer.components.tools.NextExtent") {
                    frameworkOptions.nextOptions = { title: c.config.tooltip };
                } else if(c.className == "viewer.components.tools.PreviousExtent") {
                    frameworkOptions.previousOptions = { title: c.config.tooltip };
                }
            }
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.NavigationHistory(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.FULL_EXTENT){//21,
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomToMaxExtent(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.MAP_CLICK){//22
            return Ext.create ("viewer.viewercontroller.openlayers.ToolMapClick",conf);
        }else if (conf.type == viewer.viewercontroller.controller.Tool.TOGGLE){
            frameworkOptions.type=OpenLayers.Control.TYPE_TOGGLE;
            if(conf.displayClass){
                frameworkOptions.displayClass = conf.displayClass;
            } else {
                frameworkOptions.displayClass = "olToggle_" + conf.id;
            }
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control(frameworkOptions));
        }else if (conf.type == viewer.viewercontroller.controller.Tool.MAP_TOOL){
            frameworkOptions.type=OpenLayers.Control.TYPE_TOOL;
            if (conf.displayClass) {
                frameworkOptions.displayClass = conf.displayClass;
            } else {
                frameworkOptions.displayClass = "olButton_" + conf.id;
            }
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control(frameworkOptions));
        }else if (conf.type == viewer.viewercontroller.controller.Tool.BUTTON){
            frameworkOptions.type=OpenLayers.Control.TYPE_BUTTON;
            if(conf.displayClass){
                frameworkOptions.displayClass = conf.displayClass;
            }else{
                frameworkOptions.displayClass ="olButton_"+conf.id;
            }
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control(frameworkOptions));
        }else{
            this.viewerController.logger.warning("Tool Type >" + type + "< not recognized. Please use existing type.");
        }
    },
    activateGetFeatureControls : function(){
        var layers=this.getMap().getAllWMSLayers();
        //var controls = webMapController.getMap().getGetFeatureInfoControl().controls;
        for (var i = 0 ; i< layers.length ; i++ ){
            var con = layers[i].getGetFeatureInfoControl();
            if (con!=null)
                con.activate();
        }
    },
    deactivateGetFeatureControls : function(){
        var layers=this.getMap().getAllWMSLayers();
        //var controls = webMapController.getMap().getGetFeatureInfoControl().controls;
        for (var i = 0 ; i< layers.length ; i++ ){
            var con = layers[i].getGetFeatureInfoControl();
            if (con!=null)
                con.deactivate();
        }
    },
    /**
     *See @link MapComponent.addTool
     */
    addTool : function(tool){
        /* if (!(tool instanceof OpenLayersTool)){
        Ext.Error.raise({msg: "The given tool is not of type 'OpenLayersTool'"});
    }*/
        if (this.maps.length==0){
            Ext.Error.raise({msg: "No map in MapComponent!"});
        }
        if( tool instanceof Array){
            for(var i = 0 ; i < tool.length; i++){
                this.getMap().getFrameworkMap().addControl(tool[i].getFrameworkTool());
                this.addTool(tool[i]);
                MapComponent.prototype.addTool.call(this,tool[i]);
            }
        }else if (tool.getType()==viewer.viewercontroller.controller.Tool.NAVIGATION_HISTORY){
            var me = this;
            var handler = function(){
                me.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
                me.getPanel().addControls([tool.getFrameworkTool().previous,tool.getFrameworkTool().next]);
                me.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
                me.repaintTools();
            };
            this.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
        }else if (tool.getType() == viewer.viewercontroller.controller.Tool.CLICK){
            this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
            this.getPanel().addControls([tool.getFrameworkTool().button]);
        }else if( tool.getType() == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO ){
            this.getPanel().addControls([tool.getFrameworkTool()]);
            this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
        }else if(tool.getType() == viewer.viewercontroller.controller.Tool.ZOOM_BAR){
            this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
        }else if(tool.getType() == viewer.viewercontroller.controller.Tool.ZOOM){
            this.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
        }else if (tool.getType()==viewer.viewercontroller.controller.Tool.PREVIOUS_EXTENT){
            //add after the a layer is added.
            var me = this;
            var handler = function(){
                var navControl=tool.getFrameworkTool();
                var addedControls= me.maps[0].getFrameworkMap().getControlsByClass("OpenLayers.Control.NavigationHistory");
                if (addedControls.length > 0){
                    navControl=addedControls[0];
                }else{
                    me.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
                }
                me.getPanel().addControls([navControl.previous]);
                me.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
                me.repaintTools();
            };
            this.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
        }else if (tool.getType()==viewer.viewercontroller.controller.Tool.NEXT_EXTENT){//19,
            //add after the a layer is added.
            var me = this;
            var handler = function(){
                var navControl=tool.getFrameworkTool();
                var addedControls= me.maps[0].getFrameworkMap().getControlsByClass("OpenLayers.Control.NavigationHistory");
                if (addedControls.length > 0){
                    navControl=addedControls[0];
                }else{
                    me.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
                }
                me.getPanel().addControls([navControl.next]);
                me.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
                me.repaintTools();
            };
            this.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
        }else {
            var ft = tool.getFrameworkTool();
            this.getPanel().addControls([tool.getFrameworkTool()]);
        }

        if(!(tool instanceof Array) ){
            this.superclass.addTool.call(this,tool);
            //check if this is the first tool, activate it.
            if (tool.getVisible() && !tool.getPreventActivationAsFirstTool()){
                var toolsVisible = 0;
                for (var j = 0; j < this.tools.length; j++){
                    if (this.tools[j].getVisible() && !this.tools[j].getPreventActivationAsFirstTool()){
                        toolsVisible++;
                    }
                }
                if (toolsVisible === 1){
                    this.activateTool(tool.getId());
                }
            }
        }

    },
    /**
     * IE does not render tools propertly when tools are added later, which is the case for next/prev extent
     * Code below modifies the <use> tag inside the SVG which seems to fix the issue.
     */
    repaintTools: function() {
        if(!Ext.browser.is.IE) {
            return;
        }
    ﻿   var tools = document.querySelectorAll('.svg-tool svg use');
        for(var i = 0; i < tools.length; i++) {
            tools[i].setAttribute('href', tools[i].getAttribute('xlink:href'));
        }
    },
    removeToolById : function (id){
        var tool = this.getTool(id);
        this.removeTool(tool);
    },
    /**
     *See @link MapComponent.removeTool
     */
    removeTool : function (tool){
        if (!(tool instanceof OpenLayersTool)){
            Ext.Error.raise({msg: "The given tool is not of type 'OpenLayersTool'"});
        }
        if (tool.type==Tool.NAVIGATION_HISTORY){
            OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool().next);
            OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool().previous);
            tool.getFrameworkTool().destroy();
        }else{
            OpenLayers.Util.removeItem(this.getPanel().controls, tool.getFrameworkTool());
        }
        this.maps[0].getFrameworkMap().removeControl(tool.getFrameworkTool());
        if (this.getPanel().controls.length==0){
            this.getPanel().destroy();
            this.panel=null
        }else{
            this.getPanel().redraw();
        }
        MapComponent.prototype.removeTool.call(this,tool);
    },
    addComponent: function(component){
        if(Ext.isEmpty(component)){
            this.viewerController.logger.warning("Empty component added to OpenLayersMapComponent. \nProbably not yet implemented");
        }else{
            //add the component to the map
            this.getMap().getFrameworkMap().addControl(component.getFrameworkObject());
            component.getFrameworkObject().activate();
            component.doAfterAdd();
        }
    },
    /**Add a map to the controller.
     *For know only 1 map supported.
     */
    addMap : function (map){
        if (!(map instanceof viewer.viewercontroller.openlayers.OpenLayersMap)){
            Ext.Error.raise({msg: "The given map is not of the type 'OpenLayersMap'"});
        }
        if (this.maps.length>=1)
            Ext.Error.raise({msg: "Multiple maps not supported yet"});
        this.maps.push(map);

        this.createMenus(this.mapOptions.options.top,this.mapOptions.options.bottom);
        map.getFrameworkMap().events.register("mousemove",this,this.removeMaptip);
    },
    /**
     *Get the map by id. For openlayers only 1 map....
     *@param mapId the mapId
     *@returns the Map with the id, or the only map.
     */
    getMap : function (mapId){
        return this.maps[0];
    },
    /**
     *Remove the map from the
     */
    removeMap : function (removeMap){
        removeMap.remove();
        this.maps=new Array();
    },
    activateTool : function (id,firstIfNull){
        var tools = this.tools;
        for(var i = 0 ; i < tools.length ; i++){
            var t = tools[i];
            t.getFrameworkTool().deactivate();
        }
        var tool = this.getTool(id);
        if(firstIfNull){
            tool = tools[0];
        }
        tool.getFrameworkTool().activate();
    },
    /**
     * @see viewer.viewercontroller.MapComponent#getWidth
     */
    getWidth: function(){
        var m=this.getMap();
        if(m){
            return m.getWidth();
        }
        return null;
    },
    /**
     * @see viewer.viewercontroller.MapComponent#getHeight
     */
    getHeight: function (){
        var m=this.getMap();
        if(m){
            return m.getHeight();
        }
        return null;
    },
    /**
     * @see viewer.viewercontroller.MapComponent#setCursor
     */
    setCursor: function(show,cursor) {
        if(show) {
            Ext.get(this.domId).dom.style.cursor = cursor;
        } else {
            Ext.get(this.domId).dom.style.cursor = "default";
        }
    }

    /****************************************************************Event handling***********************************************************/

});


