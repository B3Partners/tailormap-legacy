/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global Ext */

Ext.define("viewer.viewercontroller.ol.tools.OlDefaultTool",{ 
    extend: "viewer.viewercontroller.ol.tools.OlIdentifyTool",
    map: null,
    navigationControl: null,
    mapClick: null,

     constructor : function (conf){

     var controlOptions = {
            displayClass: "olControlDefault",
            type: "hallo",
            target: "mart",
            title: conf.tooltip
        };
      var olTool = new ol.control.Control(controlOptions);
      for(var i in controlOptions){
          olTool.set(i,controlOptions[i],true);
      }
      viewer.viewercontroller.ol.tools.OlIdentifyTool.superclass.constructor.call(this,conf,olTool);
      
      this.setType(viewer.viewercontroller.controller.Tool.DEFAULT);
      
      this.map=this.config.viewerController.mapComponent.getMap();
      
      this.mapClick = new viewer.viewercontroller.ol.ToolMapClick({
          id: "mapclick_"+this.id,
          viewerController: this.config.viewerController,
          handler: {
                  fn: this.handleClick,
                  scope: this
                }
      });
      
      var layers=this.getViewerController().mapComponent.getMap().getLayers();
        for (var i=0; i < layers.length; i++){
            this.onAddLayer(null,{layer: layers[i]});
        }
        
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onRemoveLayer,this);
        
        
        this.getFrameworkTool().on("activate",this.activate,this);
        this.getFrameworkTool().on("deactivate",this.deactivate,this);
        
        //this.setUseWMSGetFeatureInfo(true);
      
      return this;
      },
      
      activate: function(){
        this.active=true;
        this.mapClick.activateTool();
        //this.getFrameworkObject().activate();
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.activate();
        }
         
      },
      
      
      deactivate: function(){  
        this.active=false;
        this.mapClick.deactivateTool();
        //this.getFrameworkObject().deactivate();
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.deactivate();
        }
    }




});