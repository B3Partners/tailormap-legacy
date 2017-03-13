/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3Tool",{
    extend: "viewer.viewercontroller.controller.Tool",
    controls:null,
    enabledEvents: null,
    constructor : function (conf,frameworkObject){
        viewer.viewercontroller.openlayers3.OpenLayers3Tool.superclass.constructor.call(this, conf);                       
        this.frameworkObject=frameworkObject;
        this.controls = new Array();
        this.enabledEvents= new Object();;
        this.overwriteStyle(conf);
        if (this.type == viewer.viewercontroller.controller.Tool.BUTTON){
            var me = this;
            frameworkObject.trigger= function(){
                me.fire(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN);
            };
        }
        return this;
    },
    
    overwriteStyle: function(conf){
        if(conf.hasOwnProperty("iconUrl") && conf.iconUrl) {
            this.iconUrl_up = conf.iconUrl;
            this.iconUrl_over = conf.iconUrl;
            this.iconUrl_sel = conf.iconUrl;
            this.iconUrl_dis = conf.iconUrl;
        }
        if (this.iconUrl_up!= null || this.iconUrl_sel!=null){
            var html="";
            if (this.iconUrl_up!= null){
                html += ".olControlPanel ."+this.frameworkObject.get("displayClass")+"ItemInactive";
                html += "{" +
                        "background-image: url(\""+this.iconUrl_up+"\");" +
                        "background-repeat: no-repeat;" +
                        "background-position: center center;" +
                    "}";
            }
            if (this.iconUrl_sel!= null){
                html += ".olControlPanel ."+this.frameworkObject.get("displayClass")+"ItemActive";
                html += "{" +
                        "background-image: url(\""+this.iconUrl_sel+"\");" +
                        "background-repeat: no-repeat;" +
                        "background-position: center center;" +
                    "}";
            }           
            Ext.util.CSS.createStyleSheet(html);            
        }
        
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
            if(this.enabledEvents[olSpecificEvent]){
                this.enabledEvents[olSpecificEvent]++;                
            }else{
                this.enabledEvents[olSpecificEvent] = 1;
                this.frameworkObject.events.register(olSpecificEvent, this, this.handleEvent);
            }
            
        }        
        viewer.viewercontroller.openlayers3.OpenLayers3Tool.superclass.addListener.call(this,event,handler,scope);
    },
    
    activate: function(){
        this.getFrameworkTool().activate();
    },
    
    deactivate : function(){
        this.getFrameworkTool().deactivate();
    }
});