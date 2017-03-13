/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.openlayers3.tools.OpenLayers3IdentifyTool",{
    extend: "viewer.viewercontroller.openlayers3.OpenLayers3Tool",
    map: null,
    deactivatedControls: null,
    wmsGetFeatureInfoControl:null,
    wmsGetFeatureInfoFormat: "application/vnd.ogc.gml",
    useWMSGetFeatureInfo:null,
    active: false,
    layersToAdd:null,
    config: {
        maxFeatures: 1000
    },
    /**
     * Constructor
     * @param conf the configuration object
     * @param frameworkTool the openlayers control
     * @param map the viewer.viewercontroller.openlayers.OpenLayersMap
     */
    constructor : function (conf){
       var frameworkOptions = {
            displayClass: "olControlDefault",
            type: "hallo",
            target: "mart",
            title: conf.tooltip
        };
        var frameworkTool = new ol.control.Control(frameworkOptions);
        viewer.viewercontroller.openlayers3.tools.OpenLayers3IdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        
    },
    
    activate: function(){
        //if mobile: disable the navigation control. To make sure the click can be handled
        //Click won't be handled if there is a navigation controller enabled (for mobile) 
        if (MobileManager.isMobile()){
            if (this.deactivatedControls==null){
                this.deactivatedControls=[];
            }
            var navigationTools= this.map.getFrameworkMap().getControlsByClass("OpenLayers.Control.Navigation");
            for (var i=0; i < navigationTools.length; i++){
                if (navigationTools[i].active){
                    this.deactivatedControls.push(navigationTools[i]);
                    navigationTools[i].deactivate();
                }
            }
        }
        this.active=true;
        //set dragPan.activate();
        //this.map.getFrameworkMap().events.register("click", this, this.handleClick);    
        this.mapClick.activateTool();
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.activate();
        }
    
    },
    
    deactivate: function(){
        //if mobile: enable the disactivated controls again
        if (MobileManager.isMobile()){
            while (!Ext.isEmpty(this.deactivatedControls)){
                var disCont = this.deactivatedControls.pop();
                disCont.activate();
            }
        }
        this.active=false;
        //this.map.getFrameworkMap().events.unregister("click", this, this.handleClick);
        this.mapClick.deactivateTool();
        //
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.deactivate();
        }
    },
    
    onAddLayer: function(map,options){   
        var mapLayer=options.layer;

        if (mapLayer==null || !(mapLayer instanceof viewer.viewercontroller.controller.WMSLayer)){

            return;
        }

        var details = mapLayer.getDetails();
        //something to show?
        if (details !=undefined &&
            (!Ext.isEmpty(details["summary.description"]) ||
                !Ext.isEmpty(details["summary.image"]) ||
                !Ext.isEmpty(details["summary.link"]) ||
                !Ext.isEmpty(details["summary.title"]))){
            
            var doClientWms=true;
            if (mapLayer.appLayerId){
                var appLayer=this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var confServiceLayer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
                //do server side getFeature.
                if (confServiceLayer.hasFeatureType){
                    doClientWms=false;
                }
            }
            if (doClientWms){
                this.addWmsClientLayer(mapLayer);
            }
            
        }
    },
    
    onRemoveLayer: function(map,options) {
        var mapLayer=options.layer;
        if (mapLayer==null 
                || !(mapLayer instanceof viewer.viewercontroller.controller.WMSLayer)){
            return;
        }
        this.removeWmsClientLayer(mapLayer);
        
    },
    
    setUseWMSGetFeatureInfo: function (val){
        this.useWMSGetFeatureInfo=val;
        if (this.useWMSGetFeatureInfo){
            if (this.wmsGetFeatureInfoControl==null){
                // add wms get featureInfo
                if (this.layersToAdd==null){
                    this.layersToAdd=[];
                }
                console.log(this,wmsGetFeatureInfoFormat);
                this.wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
                        drillDown: true,
                        queryVisible: true,
                        infoFormat: this.wmsGetFeatureInfoFormat,
                        layers : this.layersToAdd,
                        maxFeatures: this.getMaxFeatures()
                    });  
                    
                this.wmsGetFeatureInfoControl.handleResponse = handleResponse;
                this.wmsGetFeatureInfoControl.buildWMSOptions = buildWMSOptions;
                this.wmsGetFeatureInfoControl.request = requestWmsGFI;
                this.wmsGetFeatureInfoControl.events.register("getfeatureinfo",this,this.raiseOnDataEvent);   
                //deegree handler:
                this.wmsGetFeatureInfoControl.format.read_FeatureCollection = this.readFeatureCollection;
                this.map.getFrameworkMap().addControl(this.wmsGetFeatureInfoControl);
                
                //set proxy for getFeatureInfoRequests:
                //OpenLayers.ProxyHost = contextPath+"/action/proxy/wms?url=";
            }
            if (this.active){
                this.wmsGetFeatureInfoControl.activate();
            }else{
                this.wmsGetFeatureInfoControl.deactivate();
            }
        }else{
            if (this.wmsGetFeatureInfoControl!=null){
                this.wmsGetFeatureInfoControl.deactivate();
            }
        }
    },
    
    handleClick: function(tool,options){      
        this.map.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    }
    
    
});