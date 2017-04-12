/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol, Ext */

Ext.define("viewer.viewercontroller.OpenLayersMap3Component",{
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
        
            
        viewer.viewercontroller.OpenLayersMap3Component.superclass.constructor.call(this, viewerController,domId,config);
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
        var extentAr = [-285401.0,22598.0,595401.0,903401.0];
        //  var extentAr = [7700,304000,280000,62000];
    
        //Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs";
        proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
        //Proj4js.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
        proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#28992', proj4.defs('EPSG:28992'));

        //var projection = ol.proj.get('EPSG:28992');
        var projection = new ol.proj.get('EPSG:28992');
        projection.setExtent(extentAr);

        //var extentAr = [7700,304000,280000,62000];
        this.mapOptions = {
          projection: projection,
          maxExtent: extentAr,
          resolution: 512,
          resolutions: resolutions
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
            var defaultTool = new viewer.viewercontroller.openlayers3.tools.OpenLayers3DefaultTool({
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
        //options["theme"]= actionBeans["css"]+"?theme="+this.getTheme() + "&location="+  ol._getScriptLocation() + "&app="+this.viewerController.app.id;//+'theme/'+this.getTheme()+'/style.jsp';
        options.mapComponent=this;
        options.viewerController = this.viewerController;
        options.domId=this.domId;
        var olMap = Ext.create("viewer.viewercontroller.openlayers3.OpenLayersMap3",options);
        return olMap;
    },
    
    createTilingLayer : function (name,url, options){
        options.name=name;
        options.url=url;
        options.viewerController=this.viewerController;
        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        var tmsLayer= new viewer.viewercontroller.openlayers3.OpenLayers3TilingLayer(options);
        return tmsLayer;  
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

        return Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3VectorLayer",options);
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

        var wmsLayer = Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3WMSLayer",config);
        return wmsLayer;
    },
    
    createArcServerLayer : function(name,url,options,viewerController){
        options.name=name;
        options.url=url;
        options.viewerController=viewerController;
        if(options.alpha != undefined) {
            options.opacity = options.alpha / 100;
        }
        var arcServer = Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3ArcServerLayer",options);
        return arcServer;
    },
    
    addMap : function(map) {
        if (!(map instanceof viewer.viewercontroller.openlayers3.OpenLayersMap3)){
            Ext.Error.raise({msg: "The given map is not of the type 'OpenLayersMap3'"});
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
            comp = Ext.create("viewer.viewercontroller.openlayers3.components.OpenLayers3LoadMonitor",config);
        
        }else if(type === viewer.viewercontroller.controller.Component.COORDINATES){
            var options = { numDigits: config.decimals};
            if(this.contentBottom){
                options.target = this.contentBottom;
                config.cssClass = "ol-mouse-position";
            }
            comp = Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3Component",config, new ol.control.MousePosition({projection: config.projection,
            //target:options.target,
            undefinedHTML: 'outside',
            coordinateFormat: ol.coordinate.createStringXY(2)}));
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
            }
            comp = Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3Component",config,
                new ol.control.ScaleLine());
        }else if(type == viewer.viewercontroller.controller.Component.MAPTIP){
            comp = Ext.create("viewer.viewercontroller.openlayers3.components.OpenLayers3Maptip",config,this.getMap());
        }else if(type == viewer.viewercontroller.controller.Component.SNAPPING) {
            comp = Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3SnappingController", config);
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
            //conf.tool = "zoom-in";
            //conf.class = "ol-zoom-in";
            //conf.id = "ol-zoom-in";
            //conf.active = false;
            //conf.onlyClick =false;
            //return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new ol.interaction.DragBox());
            return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.ZoomIn(conf));
      }      
      else if (type==viewer.viewercontroller.controller.Tool.ZOOMOUT_BUTTON){//3,
            //conf.tool = "zoom-out";
            //conf.class = "ol-zoom-out";
            //conf.id = "ol-zoom-out";
            //conf.active = false;
            //conf.onlyClick =true;
            //return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new ol.control.Zoom());
            return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.ZoomOutButton(conf));
      }else if (type==viewer.viewercontroller.controller.Tool.FULL_EXTENT){//21,
            //conf.tool = "max-extent";
            //conf.class = "ol-zoom-MaxExtent";
            //conf.id = "max-extent";
            //conf.active = false;
            //conf.onlyClick =true;
            //return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf,new ol.control.ZoomToExtent());
            return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.FullExtent(conf));           
      }else if (type==viewer.viewercontroller.controller.Tool.PAN){//7,
          //conf.id = "ol-DragPan";
          //conf.class = "ol-DragPan";
          //conf.onlyClick = false;
          //return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf,new ol.interaction.DragPan( ));
          return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.DragPan(conf)); 
          
      }else if(type === viewer.viewercontroller.controller.Tool.MEASURELINE ||type === viewer.viewercontroller.controller.Tool.MEASUREAREA ){
          //conf.id = "measure";
          //conf.class = "ol-Measure";
          //conf.onlyClick = false;

          //var t = new viewer.viewercontroller.openlayers3.OpenLayers3Measure(conf);
          //var typ =(conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? 'LineString' : 'Polygon');
          //var t = new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new ol.interaction.Draw({type:typ}));
            
          //return t;
          conf.typ =(conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? 'LineString' : 'Polygon');
          var t = new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.Measure(conf));
          return t;
        }else if(conf.type == viewer.viewercontroller.controller.Tool.BUTTON){
          //frameworkOptions.type=conf.type;
          //conf.id = "loc";
          //conf.class = "ol-Identify";
          //conf.onlyClick = true;
            
            //if(conf.displayClass){
                //frameworkOptions.displayClass = conf.displayClass;
            //}else{
                //frameworkOptions.displayClass ="olButton_"+conf.id;
            //}
            //return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new ol.control.Control(frameworkOptions));
            return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.ToolButton(conf));
        }else if (type == viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO) {
            //return new viewer.viewercontroller.openlayers3.tools.OpenLayers3IdentifyTool(conf);
            return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.OpenLayers3IdentifyTool(conf));
        }else if (type==viewer.viewercontroller.controller.Tool.MAP_CLICK){//22
            return Ext.create ("viewer.viewercontroller.openlayers3.ToolMapClick3",conf);
        }else if (conf.type == viewer.viewercontroller.controller.Tool.MAP_TOOL){
            return new viewer.viewercontroller.openlayers3.OpenLayers3Tool(conf, new viewer.viewercontroller.openlayers3.tools.StreetViewButton(conf));
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
    /*
    activateTool:function(tool){
        tool.active= true;
        if(!tool.onlyClick){
            for(var i =0; i < this.tools.length;i++){
                if(this.tools[i].panelTool !== tool.panelTool){
                    this.tools[i].active = false; 
                }
                this.tools[i].overwriteStylem(this.tools[i]);
            }
            if(this.selectedTool.length > 0){
                for(var i = 0; i < this.selectedTool.length;i++ ){
                    ol.Observable.unByKey(this.selectedTool[i]);
                    this.maps[0].getFrameworkMap().removeInteraction(this.selectedTool[i])
                }
                this.selectedTool =[];
            }
        }
        this.activateSelectedTool(tool);
    },
    */
    /*
    activateSelectedTool:function(tool){
        if(tool.id=="ol-zoom-in"){
            //this.old = tool.frameworkObject;
            this.selectedTool.push(tool.frameworkObject);
            this.maps[0].getFrameworkMap().addInteraction(tool.frameworkObject);
            var temp = tool.frameworkObject.on('boxend',function(evt){
                    var x = tool.frameworkObject.getGeometry().getExtent();
                    var center = [(x[0]+x[2])/2,(x[1]+x[3])/2];
                    this.maps[0].getFrameworkMap().getView().setCenter(center);
                    this.maps[0].getFrameworkMap().getView().setZoom( this.maps[0].getFrameworkMap().getView().getZoom()+1);
            },this);
            this.selectedTool.push(temp);

            var temp = this.maps[0].getFrameworkMap().on('click',function(evt)
            {  
                var crd = evt.coordinate;
                this.maps[0].getFrameworkMap().getView().setCenter(crd);
                this.maps[0].getFrameworkMap().getView().setZoom( this.maps[0].getFrameworkMap().getView().getZoom()+1);
            },this);
            this.selectedTool.push(temp);
        }
        else if(tool.id=="ol-zoom-out"){
            //var temp = this.maps[0].getFrameworkMap().on('click',function(evt){
            
            if (this.maps[0].getFrameworkMap().getView().getZoom() <= 6){
                return;
            }else{
                this.maps[0].getFrameworkMap().getView().setZoom( this.maps[0].getFrameworkMap().getView().getZoom()-1);
            }
            
            //var crd = evt.coordinate;
            //this.maps[0].getFrameworkMap().getView().setCenter(crd);
            //this.maps[0].getFrameworkMap().getView().setZoom( this.maps[0].getFrameworkMap().getView().getZoom()-1)},this);
            
            //this.selectedTool.push(temp);
        }
        else if(tool.id=="max-extent"){
               var extent = this.maps[0].getFrameworkMap().getView().getProjection().getExtent();
               this.maps[0].getFrameworkMap().getView().fit(extent,this.maps[0].getFrameworkMap().getSize());
        }
        
        else if (tool.id=='ol-DragPan'){
            this.selectedTool.push(tool.frameworkObject);
            this.maps[0].getFrameworkMap().addInteraction(tool.frameworkObject);
            //needed to delete fix later
        }
        else if (tool.id=='measure'){
            this.selectedTool.push(tool.frameworkObject);
            this.maps[0].getFrameworkMap().addInteraction(tool.frameworkObject);
            //needed to delete fix later    
        }
    },
    */
    
    
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