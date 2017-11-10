/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol, Ext */

Ext.define("viewer.viewercontroller.OpenLayers4MapComponent",{
    extend: "viewer.viewercontroller.MapComponent",
    
    mapOptions:null,
    // References to the dom object of the content top and -bottom.
    contentTop:null,
    selectedTool:null,
    contentBottom:null,
    config:{
        theme: "flamingo"
    },
    constructor:function(viewerController, domId, config){
        
        this.selectedTool =[];
        this.domId = Ext.id();
        var container = document.createElement('div');
        container.id = this.domId;
        container.style.height = '100%';
        container.style.width = '100%';
        document.getElementById(domId).appendChild(container);
        
            
        viewer.viewercontroller.OpenLayers4MapComponent.superclass.constructor.call(this, viewerController,domId,config);
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
        var extentAr = [-285401.0,22598.0,595401.0,903401.0];
        var maxExtent = [7700,304000,280000,62000];
    
        proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs ");
        var projection = ol.proj.get('EPSG:28992');
       
        projection.setExtent(extentAr);


        this.mapOptions = {
          projection: projection,
          maxExtent: maxExtent,
          resolution: 512,
          resolutions: resolutions,
          extentAr: extentAr
        };
        
        var me =this;
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,function(){
            setTimeout(function(){me.checkTools();},10);
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
            var defaultTool = new viewer.viewercontroller.openlayers4.tools.OpenLayers4DefaultTool({
                viewerController: this.viewerController,
                id: 'defaultTool'
            });
            this.addTool(defaultTool);
            defaultTool.setVisible(false);
            defaultTool.activate();
        }
    },
    
    initEvents : function(){
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_DOWN]                             = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_UP]                               = "deactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_CAPABILITIES]                       = "onGetCapabilities";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE]                        = "onConfigComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED]                          = "addfeature";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CLICK]                                  = "click";
        this.eventList[viewer.viewercontroller.controller.Event.ON_SET_TOOL]                               = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE]            = "onUpdateComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LOADING_START]                          = "loadstart";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LOADING_END]                            = "loadend";
        this.eventList[viewer.viewercontroller.controller.Event.ON_MEASURE]                                = "measure";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT]                 = "moveend";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT]                          = "move";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED]                          = "remove";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_ADDED]                            = "add";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO]                       = "getfeatureinfo";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED]               = "change:visible";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ACTIVATE]                               = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_DEACTIVATE]                             = "deactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ZOOM_END]                               = "zoomend";
    },
    
    getPanel : function(){
        return this.panel;
    },
    
    createMap : function(id, options){
        options = Ext.merge(this.mapOptions,options); 
        options.mapComponent=this;
        options.viewerController = this.viewerController;
        options.domId=this.domId;
        var olMap = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4Map",options);
        return olMap;
    },
    
    createTilingLayer : function (name,url, options){
        options.name=name;
        options.url=url;
        options.viewerController=this.viewerController;
        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        var tmsLayer= new viewer.viewercontroller.openlayers4.OpenLayers4TilingLayer(options);
        return tmsLayer;  
    },
    
    createImageLayer : function (name,url, bounds){
        var imageLayer = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4ImageLayer",{
            id: name,
            url: url,
            extent : bounds,
            frameworkLayer : this.viewerObject,
            viewerController: this.viewerController
        });

        return imageLayer;
    },
    
    createVectorLayer : function(options){
        if (options==undefined){
            options = new Object();
            options["isBaseLayer"]= false;
        }else{
            if(options["isBaseLayer"] == undefined){
                options["isBaseLayer"]= false;
            }
        }

        return Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4VectorLayer",options);
    },

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

        var wmsLayer = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4WMSLayer",config);
        return wmsLayer;
    },
    
    createArcServerLayer : function(name,url,options,viewerController){
        options.name=name;
        options.url=url;
        options.viewerController=viewerController;
        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        var arcServer = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4ArcServerLayer",options);
        return arcServer;
    },
    
    addMap : function(map) {
        if (!(map instanceof viewer.viewercontroller.openlayers4.OpenLayers4Map)){
            Ext.Error.raise({msg: "The given map is not of the type 'OpenLayers4Map'"});
        }
        if (this.maps.length>=1)
            Ext.Error.raise({msg: "Multiple maps not supported yet"});
        this.maps.push(map);
        
        this.createMenus(this.mapOptions.options.top,this.mapOptions.options.bottom);
        
    },
    
    
    
    getMap : function() {
        return this.maps[0];
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
        var mapEl = Ext.get(this.getMap().frameworkMap.getViewport());
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
    
    
    createComponent : function (config){
        var type = config.type;
        var comp = null;
        if(type == viewer.viewercontroller.controller.Component.LOADMONITOR){
            comp = Ext.create("viewer.viewercontroller.openlayers4.components.OpenLayers4LoadMonitor",config);
        }else if(type == viewer.viewercontroller.controller.Component.OVERVIEW){
            comp = Ext.create("viewer.viewercontroller.openlayers4.components.OpenLayers4Overview",config);
        }else if(type == viewer.viewercontroller.controller.Component.NAVIGATIONPANEL){
            var panZoomBar = new ol.control.panZoomBar({imgPath:"/openlayers/img/",
            slider:true,
            ownmap:this,
            left:config.left,
            top:config.top});
            comp = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4Component",config,panZoomBar);
        }
        else if(type === viewer.viewercontroller.controller.Component.COORDINATES){
            var options = { numDigits: config.decimals};
            if(this.contentBottom){
                options.target = this.contentBottom;
                config.cssClass = "ol-mouse-position";
            }
            comp = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4Component",config, new ol.control.MousePosition({projection: config.projection,
            target:options.target,
            undefinedHTML: 'outside',
            coordinateFormat: ol.coordinate.createStringXY(options.numDigits)}));
        } else if(type == viewer.viewercontroller.controller.Component.SCALEBAR){
            var frameworkOptions={};
            frameworkOptions.bottomOutUnits='';
            frameworkOptions.bottomInUnits='';
            if (!Ext.isEmpty(config.units)){
                frameworkOptions.topOutUnits=config.units;
            }
            if(this.contentBottom){
                frameworkOptions.target = this.contentBottom;
                config.cssClass = "olControlScale";
            }8
            comp = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4Component",config,
                new ol.control.ScaleLine());
        }else if(type == viewer.viewercontroller.controller.Component.MAPTIP){
            comp = Ext.create("viewer.viewercontroller.openlayers4.components.OpenLayers4Maptip",config,this.getMap());
        }else if(type == viewer.viewercontroller.controller.Component.SNAPPING) {
            comp = Ext.create("viewer.viewercontroller.openlayers4.OpenLayers4SnappingController", config);
        }else if(type == viewer.viewercontroller.controller.Component.KEYBOARD){
            this.getMap().getFrameworkMap().addInteraction(new ol.interaction.KeyboardPan());
            this.getMap().getFrameworkMap().addInteraction(new ol.interaction.KeyboardZoom());
        }else {
            this.viewerController.logger.warning ("Framework specific component with type " + type + " not yet implemented!");
        }
        
        return comp;
    },
    
    addComponent: function(component){
        if(Ext.isEmpty(component)){
            this.viewerController.logger.warning("Empty component added to OpenLayersMapComponent. \nProbably not yet implemented");
        }else{
            //add the component to the map
            this.getMap().getFrameworkMap().addControl(component.getFrameworkObject());
            //component.getFrameworkObject().activate();
            component.doAfterAdd();
        }
    },
    
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

      if(type == viewer.viewercontroller.controller.Tool.ZOOMIN_BOX){
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.ZoomIn(conf));
      }      
      else if (type==viewer.viewercontroller.controller.Tool.ZOOMOUT_BUTTON){//3,
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.ZoomOutButton(conf));
      }else if (type==viewer.viewercontroller.controller.Tool.FULL_EXTENT){//21,
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.FullExtent(conf));           
      }else if (type==viewer.viewercontroller.controller.Tool.PAN){//7,
          return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.DragPan(conf)); 
          
      }else if (type==viewer.viewercontroller.controller.Tool.SUPERPAN){//5,
            conf.enableKinetic=true;
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.DragPan(conf));
        }else if(type === viewer.viewercontroller.controller.Tool.MEASURELINE ||type === viewer.viewercontroller.controller.Tool.MEASUREAREA ){
          conf.typ =(conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? 'LineString' : 'Polygon');
          conf.class =(conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? 'olControlMeasure' : 'olControlMeasureArea');
          var t = new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.Measure(conf));
          return t;
        }else if(conf.type == viewer.viewercontroller.controller.Tool.BUTTON){
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.ToolButton(conf));
        }else if (type == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO) {
            //return new viewer.viewercontroller.openlayers4.tools.OpenLayers4IdentifyTool(conf);
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.OpenLayers4IdentifyTool(conf));
        }else if (type==viewer.viewercontroller.controller.Tool.MAP_CLICK){//22
            return Ext.create ("viewer.viewercontroller.openlayers4.ToolMapClick",conf);
        }else if (type==viewer.viewercontroller.controller.Tool.DEFAULT){//15,
            return new viewer.viewercontroller.openlayers4.tools.OpenLayers4DefaultTool(conf);
        }else if (conf.type == viewer.viewercontroller.controller.Tool.MAP_TOOL){
            return new viewer.viewercontroller.openlayers4.OpenLayers4Tool(conf, new viewer.viewercontroller.openlayers4.tools.StreetViewButton(conf));
        }
    },
    
    addTool: function(tool){
       if (this.maps.length==0){
            Ext.Error.raise({msg: "No map in MapComponent!"});
        }
        if( tool instanceof Array){
            for(var i = 0 ; i < tool.length; i++){
                this.getMap().getFrameworkMap().addControl(tool[i].getFrameworkTool());
                this.addTool(tool[i]);
                MapComponent.prototype.addTool.call(this,tool[i]);
            }
        } 
        this.panel = this.contentTop;
        this.panel.appendChild(tool.panelTool);
        if(!tool.onlyClick && tool.frameworkObject){
            this.maps[0].getFrameworkMap().addInteraction(tool.frameworkObject);
        }
        
        if(!(tool instanceof Array)){
            this.superclass.addTool.call(this,tool);
            //check if this is the first tool, activate it.
            if (tool.getVisible()){
                var toolsVisible=0;
                for (var i=0; i < this.tools.length; i++){
                    if (this.tools[i].getVisible()){
                        toolsVisible++;
                    }
                }
                if (toolsVisible ==1){
                    this.activateTool(tool);
                }
            }
        }
    },

    
    activateTool : function (tool,first){
        if(first){
            tool=this.tools[0];
        }
        var tools = this.tools;
        if(!tool.onlyClick){
            for(var i = 0 ; i < tools.length ; i++){
                var t = tools[i];
                t.deactivate();
            }
        }
        var t = tool;
        t.activate();
    },
    
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
    

    setCursor: function(show,cursor) {
        if(show) {
            Ext.get(this.domId).dom.style.cursor = cursor;
        } else {
            Ext.get(this.domId).dom.style.cursor = "default";
        }
    }
    
    
});