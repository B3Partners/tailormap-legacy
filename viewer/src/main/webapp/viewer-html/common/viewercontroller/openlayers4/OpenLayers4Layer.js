/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.openlayers4.OpenLayers4Layer",{        
    config:{
        name: null
    },
    enabledEvents: null,
    events : null,
    type:null,
    alpha:100,
    constructor :function (config){       
        this.initConfig(config);
        this.enabledEvents = new Object();
        this.events = new Object();
        return this;
    },
    
    setVisible : function (visible){
        this.visible=visible;
        if (this.frameworkLayer!=null){
            this.frameworkLayer.setVisible(visible);
        }
    },
    
    reload : function (){
        this.getFrameworkLayer().getSource().refresh();
        //this.viewerController.mapComponent.getMap().getFrameworkMap().removeLayer(this.getFrameworkLayer());
        //this.viewerController.mapComponent.getMap().getFrameworkMap().addLayer(this.getFrameworkLayer());
        //window.location.reload();
        //var source = this.getFrameworkLayer().getSource();
        //var params = source.getParams();
        //params.t = new Date().getMilliseconds();
        //source.updateParams(params);
        //this.getFrameworkLayer().getSource().clear();
        
    },
    getType: function(){
        return this.type;
    },
    
    addListener : function(event,handler,scope){
        var olSpecificEvent = this.config.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /* Add event to OpenLayers Layer only once, to prevent multiple fired events.    
             * count the events for removing the listener again.
             */
            if(!olSpecificEvent == "addfeature"){
                if(this.enabledEvents[olSpecificEvent]){
                    this.enabledEvents[olSpecificEvent]++;                
                }else{
                    this.enabledEvents[olSpecificEvent] = 1;
                    
                    this.frameworkLayer.on(olSpecificEvent,this.handleEvent,this);
                }
            }
        }        
        viewer.viewercontroller.controller.Layer.superclass.addListener.call(this,event,handler,scope);
    },
    
    
    removeListener : function (event,handler,scope){
        var olSpecificEvent = this.config.viewerController.mapComponent.getSpecificEventName(event);
        if(olSpecificEvent){
            if(!scope){
                scope = this;
            }
            /* Remove event from OpenLayers Layer if the number of events == 0
             * If there are no listeners for the OpenLayers event, remove the listener.             
             */
            if(this.enabledEvents[olSpecificEvent]){
                this.enabledEvents[olSpecificEvent]--;
                if (this.enabledEvents[olSpecificEvent] <= 0){
                    this.enabledEvents[olSpecificEvent]=0;
                    this.frameworkLayer.un(olSpecificEvent,this.handleEvent,this);
                }
            }            
        }
        viewer.viewercontroller.controller.Layer.superclass.removeListener.call(this,event,handler,scope);
    },
    
    handleEvent : function (event){
        var options = new Object();
        options.layer = this.map.getLayerByOpenLayersId(event.element.id);
        options.feature = this.fromOpenLayersFeature(event.feature);
        var eventName = this.config.viewerController.mapComponent.getGenericEventName(event.type);
        if(!eventName){
            eventName = event;
        }
        this.fireEvent(eventName,options);
    },
    
    getVisible : function (){
        if (this.frameworkLayer!=null){
            return this.frameworkLayer.getVisible();
        }
        return null;
    },
    
    setAlpha : function (alpha){
        this.alpha=alpha;
        if(this.frameworkLayer) {
            this.frameworkLayer.setOpacity(alpha/100);
        }
    },
    
    getAlpha : function (){
        return this.alpha;
    }
    
    });