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
    contentBottom:null,
    config:{
        theme: "flamingo"
    },
    constructor:function(viewerController, domId, config){
        this.domId = Ext.id();
        console.log(this.domId)
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
      
      
    checkTools(){
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
    
    getPanel : function(){
        if (this.panel==null){
            this.createPanel();
        }
        return this.panel;
    },
    
    createPanel : function(){
        var panel= new ol.control.Control({
          element:this.contentTop, // Render the panel to the previously created div,
          target:'ext-33'
        });
        this.panel = panel;
        this.maps[0].getFrameworkMap().addControl(this.panel);
        console.log("joehoee");
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
        console.log('ff');
        console.log(this.getMap().frameworkMap.getViewport());
        var mapEl = Ext.get(this.getMap().frameworkMap.getViewport());
        console.log(mapEl);
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
        
        if(type === viewer.viewercontroller.controller.Component.COORDINATES){
            var options = { numDigits: config.decimals};
            if(this.contentBottom){
                options.target = this.contentBottom;
                config.cssClass = "olControlMousePosition";
            }
            comp = Ext.create("viewer.viewercontroller.openlayers3.OpenLayers3Component",config, new ol.control.MousePosition({projection: config.projection,
            target:options.target,
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
        }else if (tool.getType()==viewer.viewercontroller.controller.Tool.NAVIGATION_HISTORY){
            var me = this;
            var handler = function(){
                me.maps[0].getFrameworkMap().addControl(tool.getFrameworkTool());
                //me.getPanel().addControls([tool.getFrameworkTool().previous,tool.getFrameworkTool().next]);
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
                //me.getPanel().addControls([navControl.previous]);
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
                //me.getPanel().addControls([navControl.next]);
                me.getMap().removeListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
            };
            this.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,handler,handler);
        }else {
            var ft = tool.getFrameworkTool();
            //console.log(this.maps[0].getFrameworkMap().getControls());
            //this.maps[0].getFrameworkMap().addControl(this.getPanel());
            //this.getPanel().addControls([tool.getFrameworkTool()]);
            this.getPanel().element.addEventListener('click', this.test);
        }

        if(!(tool instanceof Array) ){
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
                    this.activateTool(tool.getId());
                }
            }
        }

    
    },
    test : function(){ 
      console.log("he6t we");  
    },
    
    activateTool : function (id,firstIfNull){
        var tools = this.tools;
        for(var i = 0 ; i < tools.length ; i++){
            var t = tools[i];
            //t.getFrameworkTool().deactivate();
        }
        var tool = this.getTool(id);
        if(firstIfNull){
            tool = tools[0];
        }
        //tool.getFrameworkTool().activate();
    }
    
});