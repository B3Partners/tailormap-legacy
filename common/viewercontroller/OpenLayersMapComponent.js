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
    constructor :function (viewerController, domId,config){
        viewer.viewercontroller.OpenLayersMapComponent.superclass.constructor.call(this, viewerController,domId,config);        
        this.domId = domId;
        this.pointButton = null;
        this.lineButton = null;
        this.polygonButton = null;
        var maxBounds=new OpenLayers.Bounds(120000,304000,280000,620000);
        var resolutions = [512,256,128,64,32,16,8,4,2,1,0.5,0.25,0.125];
        if(config && config.resolutions){
            resolutions = (config.resolutions).split(",");
        }
        this.mapOptions =  {
            projection:new OpenLayers.Projection("EPSG:28992"),
            maxExtent: maxBounds,
            allOverlays: true,
            units :'m',
            resolutions: resolutions,
            resolution: 512,
            controls : [new OpenLayers.Control.Navigation({
                    zoomBoxEnabled: true
                }),new OpenLayers.Control.ArgParser()]
        };
        
        return this;
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
        var paneel= new OpenLayers.Control.Panel({
            saveState: true,
            allowDepress : true
        });
        this.panel = paneel;
        this.maps[0].getFrameworkMap().addControl(this.panel);
    },
    /**
     * @description Creates a Openlayers.Map object for this framework. See the openlayers.map docs
     *@param id the id the DomElement where the map must be set
     *@param options extra options for the map. See the OpenLayers.Map docs.
     *@returns a OpenLayersMap
     */
    createMap : function(id, options){
        options = Ext.merge(this.mapOptions,options);
        options["theme"]=OpenLayers._getScriptLocation()+'theme/default/style.css';
        options.mapComponent=this;   
        options.viewerController = this.viewerController;
        options.domId=this.domId;
        var olMap = Ext.create("viewer.viewercontroller.openlayers.OpenLayersMap",options);
        //map.events.register("click",this, this.onIdentifyHandler);
        return olMap;
    },
    /**
     *See @link MapComponent.createWMSLayer
     */
    
    createWMSLayer : function(name, wmsurl,ogcParams,config){
        config.options = new Object();
        config.options["id"]=null;
        config.options["isBaseLayer"]=true;
        config.options["singleTile"]=true;
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
        var wmsLayer = Ext.create("viewer.viewercontroller.openlayers.OpenLayersWMSLayer",config);
        
        if(ogcParams["query_layers"] != null && ogcParams["query_layers"] != ""){

            var info = new OpenLayers.Control.WMSGetFeatureInfo({
                url: wmsurl,
                title: 'Identify features by clicking',
                queryVisible: true,
                layers: [wmsLayer.getFrameworkLayer()],
                queryLayers : ogcParams["query_layers"],
                infoFormat : "text/xml"
            });
            info.request = doGetFeatureRequest;
            wmsLayer.setGetFeatureInfoControl(info);
        }
        if (config["maptip_layers"]!=null && config["maptip_layers"]!=""){
            var maptip = new OpenLayers.Control.WMSGetFeatureInfo({
                url: wmsurl,
                title: 'Identify features by clicking',
                queryVisible: true,
                layers: [wmsLayer.getFrameworkLayer()],
                queryLayers : config["maptip_layers"],
                infoFormat : "application/vnd.ogc.gml",
                hover: true
            });
            maptip.request = doGetFeatureRequest;
            wmsLayer.setMapTipControl(maptip);
        }
        return wmsLayer;
    },
    /**
     *see {@link MapComponent.createTMSLayer} sdf
     */
    createTilingLayer : function (name,url, options){
        options.name=name;
        options.url=url;
        options.viewerController=this.viewerController;
        var tmsLayer= new viewer.viewercontroller.openlayers.OpenLayersTilingLayer(options);
        return tmsLayer;
    },
    /**
     *see {@link MapComponent.createTMSLayer} sdf
     */
    //appLayer.layerName,server,servlet,service.serviceName, options,this);
    createArcIMSLayer : function (name,url, servlet, serviceName,options){
        options.name=name;
        options.url=url;
        options.servlet = servlet;
        options.serviceName = serviceName;
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
            comp = Ext.create("viewer.viewercontroller.openlayers.LoadMonitor",config);
        }else if(type == viewer.viewercontroller.controller.Component.OVERVIEW){
            comp = Ext.create("viewer.viewercontroller.openlayers.components.OpenLayersOverview",config);
        }else if(type == viewer.viewercontroller.controller.Component.MAPTIP){
            comp = Ext.create("viewer.viewercontroller.openlayers.components.OpenLayersMaptip",config,this.getMap());
        }else if(type == viewer.viewercontroller.controller.Component.NAVIGATIONPANEL){
            comp = Ext.create("viewer.viewercontroller.openlayers.OpenLayersComponent",config,
                new OpenLayers.Control.PanZoomBar({zoomWorldIcon: true}));
        }else{
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
        //pass the tool tip to the framework object.
        if (conf.toolTip){
            frameworkOptions.title=conf.toolTip;
        }

        if (type==viewer.viewercontroller.controller.Tool.NAVIGATION_HISTORY){//1
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.NavigationHistory(options));
        }else if(type == viewer.viewercontroller.controller.Tool.ZOOMIN_BOX){
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomBox(frameworkOptions))
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOMOUT_BOX){//3,
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomOut(frameworkOptions));
        }else if (type==viewer.viewercontroller.controller.Tool.PAN){
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.DragPan(frameworkOptions))
        }else if (type==viewer.viewercontroller.controller.Tool.SUPERPAN){//5,
            frameworkOptions.enableKinetic=true;
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.DragPan(frameworkOptions));            
        }else if (type == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO) {  
            //olControlidentify
            frameworkOptions["displayClass"]="olControlidentify";
            frameworkOptions["type"]=OpenLayers.Control.TYPE_TOOL;
            
            //conf.olMap= this.getMap().getFrameworkMap();
            var identifyTool = new viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool(
                conf ,new OpenLayers.Control(frameworkOptions),this.getMap());
            
            //this.getMap().setGetFeatureInfoControl(identifyTool);
            return identifyTool;
        }else if(type == viewer.viewercontroller.controller.Tool.MEASURE){
            
            frameworkOptions["persist"]=true;
            frameworkOptions["callbacks"]={
                modify: function (evt){
                    //make a tooltip with the measured length
                    if (evt.parent){
                        var measureValueDiv=document.getElementById("olControlMeasureValue");
                        if (measureValueDiv==undefined){
                            measureValueDiv=document.createElement('div');
                            measureValueDiv.id="olControlMeasureValue";
                            measureValueDiv.style.position='absolute';
                            this.map.div.appendChild(measureValueDiv);
                            measureValueDiv.style.zIndex="10000";
                            measureValueDiv.className="olControlMaptip";
                            var measureValueText=document.createElement('div');
                            measureValueText.id='olControlMeasureValueText';
                            measureValueDiv.appendChild(measureValueText);
                        }
                        var px= this.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(evt.x,evt.y));
                        measureValueDiv.style.top=px.y+"px";
                        measureValueDiv.style.left=px.x+10+'px'
                        measureValueDiv.style.display="block";
                        var measureValueText=document.getElementById('olControlMeasureValueText');
                        var bestLengthTokens=this.getBestLength(evt.parent);
                        measureValueText.innerHTML= bestLengthTokens[0].toFixed(3)+" "+bestLengthTokens[1];
                    }
                }
            }
            var measureTool= new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.Measure( OpenLayers.Handler.Path, frameworkOptions));
            measureTool.getFrameworkTool().events.register('measure',measureTool.getFrameworkTool(),function(){
                var measureValueDiv=document.getElementById("olControlMeasureValue");
                if (measureValueDiv){                
                    measureValueDiv.style.display="none";
                }
                this.cancel();
            });
            measureTool.getFrameworkTool().events.register('deactivate',measureTool.getFrameworkTool(),function(){
                var measureValueDiv=document.getElementById("olControlMeasureValue");
                if (measureValueDiv){
                    measureValueDiv.style.display="none";
                }
            });
            return measureTool;
        }else if (type==viewer.viewercontroller.controller.Tool.ZOOM_BAR){//13,            
            return new OpenLayersTool(conf,new OpenLayers.Control.PanZoomBar(frameworkOptions)); 
        }else if (type==viewer.viewercontroller.controller.Tool.DEFAULT){//15,
            // The default tool is always available in openlayers.
            //this.viewerController.logger.info("Tool DEFAULT is default available in OpenLayers, no configuration needed");
        }else if (type==viewer.viewercontroller.controller.Tool.PREVIOUS_EXTENT ||
            type==viewer.viewercontroller.controller.Tool.NEXT_EXTENT){//19 - 20,            
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf,new OpenLayers.Control.NavigationHistory());
        }else if (type==viewer.viewercontroller.controller.Tool.FULL_EXTENT){//21,            
            //this.getMap().setGetFeatureInfoControl(identifyTool);
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control.ZoomToMaxExtent(frameworkOptions));
            //this.viewerController.logger.error("Tool FULL_EXTENT not implemented (yet)");
        }else if (type==viewer.viewercontroller.controller.Tool.MAP_CLICK){//22
            return Ext.create ("viewer.viewercontroller.openlayers.ToolMapClick",conf);
        }else if (conf.type == viewer.viewercontroller.controller.Tool.TOGGLE){
            frameworkOptions.type=OpenLayers.Control.TYPE_TOGGLE;
            frameworkOptions.displayClass ="fuck";
            return new viewer.viewercontroller.openlayers.OpenLayersTool(conf, new OpenLayers.Control(frameworkOptions));
        }else if (conf.type == viewer.viewercontroller.controller.Tool.BUTTON){
            frameworkOptions.type=OpenLayers.Control.TYPE_BUTTON;
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
            };
            this.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);        
        }else {
            var ft = tool.getFrameworkTool();
            this.getPanel().addControls([tool.getFrameworkTool()]);
        }

        if(!(tool instanceof Array) ){
            this.superclass.addTool.call(this,tool);
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
        /*if(false){
        }else{*/
            //add the component to the map
            this.getMap().getFrameworkMap().addControl(component.getFrameworkObject());
            component.getFrameworkObject().activate();
        //}
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
    activateTool : function (id){
        var tools = this.tools;
        for(var i = 0 ; i < tools.length ; i++){
            tools[i].getFrameworkTool().deactivate();
        }
        var tool = this.getTool(id);
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
            return m.getWidth();
        }
        return null;
    },
    /****************************************************************Event handling***********************************************************/


    /**
     * Registers an event to a handler.
     * @param event The generic eventname to register
     * @param handler The handlerfunction to execute
     * @param scope The scope to fire the events in
     */
     registerEvent : function(event,object,handler,scope){
        var olSpecificEvent = this.viewerController.mapComponent.getSpecificEventName(event);
         
        if(olSpecificEvent){
            if(object == this){
                this.addListener(event,handler,scope);
            }else{
                object.registerEvent(event,handler,scope);
            }
        }else{
            this.viewerController.logger.warning("Event not listed in OpenLayersMapComponent >"+ event + "<. The application  might not work correctly.");
        }
    },
    /**
     *All registerd handlers for event 'event' that equals 'handler' are removed as listener.
     *This is because you don't want duplication of the same handler and event. This will
     *result in multiple calls of a handler on the same event.
     *@param event the event
     *@param handler the handler you want to remove
     */
    unRegisterEvent : function (event,handler,thisObj){
        var specificName = this.viewerController.mapComponent.getSpecificEventName(event);
        this.removeListener(specificName,handler,thisObj);
    }
});


/**
    * The request function for WMSGetFeatureInfo redone, so that querylayers are properly set
    */
function doGetFeatureRequest(clickPosition, options) {
    var layers = this.findLayers();
    if(layers.length == 0) {
        this.events.triggerEvent("nogetfeatureinfo");
        // Reset the cursor.
        OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
        return;
    }

    options = options || {};
    if(this.drillDown === false) {
        var wmsOptions = this.buildWMSOptions(this.url, layers, clickPosition, layers[0].params.FORMAT);
        (wmsOptions["params"])["STYLES"] = "";
        (wmsOptions["params"])["QUERY_LAYERS"] = this.queryLayers.split(",");
        var request = OpenLayers.Request.GET(wmsOptions);

        if (options.hover === true) {
            this.hoverRequest = request;
        }
    } else {
        this._requestCount = 0;
        this._numRequests = 0;
        this.features = [];
        // group according to service url to combine requests
        var services = {}, url;
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var service, found = false;
            url = layer.url instanceof Array ? layer.url[0] : layer.url;
            if(url in services) {
                services[url].push(layer);
            } else {
                this._numRequests++;
                services[url] = [layer];
            }
        }
        var layers;
        for (var url in services) {
            layers = services[url];
            var wmsOptions = this.buildWMSOptions(url, layers,
                clickPosition, layers[0].params.FORMAT);
            OpenLayers.Request.GET(wmsOptions);
        }
    }
}

