/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define ("viewer.viewercontroller.openlayers3.ToolMapClick3",{
    extend: "viewer.viewercontroller.controller.ToolMapClick",
    handler:null,
    scope:null,
    clickControl:null,
    config:{
        id:null,
        name: null,
        handlerOptions: null
    },
    /**
     * @constructor
     * @see viewer.viewercontroller.controller.ToolMapClick#constructor
     */
    constructor: function (conf){
        conf.onlyClick = false;
        viewer.viewercontroller.openlayers3.ToolMapClick3.superclass.constructor.call(this,conf);
        this.initConfig(conf);
        this.visible=false;
        this.type = viewer.viewercontroller.controller.Tool.MAP_CLICK;
        //this.initConfig(conf);
        this.handler = conf.handler.fn;
        this.scope = conf.handler.scope;
        this.olMap=this.config.viewerController.mapComponent.getMap().getFrameworkMap();

        //create a click control that handles only single click 
            
        /*this.clickControl = new OpenLayers.Control.Click({
            handlerOptions: me.config.handlerOptions,
            click: function(evt){
                me.handleClick(evt);
            }
        });
        */
        return this;
    },
    
    handleClick: function(evt){
        var crd = evt.coordinate;
            var pix = evt.pixel;
            
            var options ={
            x:pix[0],
            y:pix[1],
            coord: {
                x:crd[0],
                y:crd[1]
            }
        };

        this.handler.call(this.scope, this,options);
        //this.deactivateTool();
    },
    
    activateTool : function(){      
        this.clickControl = this.olMap.on("click", function(evt){
            this.handleClick(evt);
        },this);
    },
    
    deactivateTool : function (){
         ol.Observable.unByKey(this.clickControl);
         //this.activateTool();
    }   
});