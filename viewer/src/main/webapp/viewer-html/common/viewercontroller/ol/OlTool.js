/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.ol.OlTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    controls:null,
    enabledEvents: null,
    constructor : function (conf,tool){
        viewer.viewercontroller.ol.OlTool.superclass.constructor.call(this, conf);
        this.olTool = tool;
        if(tool.frameworkObject){
            this.frameworkObject=tool.frameworkObject;
        }
        this.controls = new Array();
        this.enabledEvents= new Object();
        this.setTool(conf);
        this.overwriteStyle(conf);
        return this;
    },
    
    setTool : function(conf){
      var me = this;
      me.conf = conf;  
      this.panelTool = document.createElement('div');
      this.panelTool.className = "svg-tool "+conf.class+'ItemInactive';
      this.panelTool.title = (conf.tooltip) ? conf.tooltip : "";
      this.panelTool.id = conf.id;
      var spriteLink = "/viewer/viewer-html/sprite.svg#icon-"+conf.class.toLowerCase();
      this.panelTool.innerHTML = [
                    '<div class="svg-click-area"></div>', // An extra transparent DIV is added to fix issue where button could not be clicked in IE
                    '<svg role="img" title=""><use xlink:href="'+spriteLink+'"/></svg>'
                ].join('');
      //if (this.type == viewer.viewercontroller.controller.Tool.BUTTON){
            //var me = this;
            //this.panelTool.addEventListener('click',function(){me.fire(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN);},me);
      //}else{
        this.panelTool.addEventListener("click",function(){me.test();},me);
       // }
    },
    
    test:function(){
      this.conf.viewerController.mapComponent.activateTool(this);  
    },
    
    
    overwriteStylem: function(conf){
      if(conf.active){
          this.panelTool.className = "svg-tool "+conf.class+'ItemActive';
      }else{
          this.panelTool.className = "svg-tool "+conf.class+'ItemInactive';
      }
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
                this.frameworkObject.on(olSpecificEvent, this, this.handleEvent);
            }
            
        }        
        viewer.viewercontroller.ol.OlTool.superclass.addListener.call(this,event,handler,scope);
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
                    this.frameworkObject.un(olSpecificEvent, this, this.handleEvent);
                }
            }            
        }
        viewer.viewercontroller.ol.OlTool.superclass.removeListener.call(this,event,handler,scope);
    },
    
    activate: function(){
        this.olTool.activate(this);
        if(!this.conf.onlyClick){
            this.conf.active = true;
            this.overwriteStylem(this.conf);
        }
    },
    
    deactivate : function(){
        this.olTool.deactivate(this);
        if(!this.conf.onlyClick){
            this.conf.active = false;
            this.overwriteStylem(this.conf);
        }
    },
    
    isActive : function(){
        return this.olTool.isActive();
    },
    handleEvent : function (event){
        var eventName = this.config.viewerController.mapComponent.getGenericEventName(event.type);
        if(!eventName){
            eventName = event;
        }
        this.fire(eventName,{});
    }
});