/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

 /**
  *Openlayers implementation of Tool.
  *@see viewer.viewercontroller.controller.Tool
  *@author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
  *@author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
  **/
Ext.define("viewer.viewercontroller.openlayers.OpenLayersTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    controls:null,
    enabledEvents: null,
    constructor : function (conf,frameworkObject){
        viewer.viewercontroller.openlayers.OpenLayersTool.superclass.constructor.call(this, conf);                       
        this.frameworkObject=frameworkObject;
        this.controls = new Array();
        this.enabledEvents= new Object();
        this.overwriteStyle();
        if (this.type == viewer.viewercontroller.controller.Tool.BUTTON){
            var me = this;
            frameworkObject.trigger= function(){
                me.fire(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN);
            };
        }
        return this;
    },
    /**
     * If iconUrl paths are set, add a style to show the correct images.
     * This needs to add a style to the page because the html element is loaded after
     * the Tool is added to the panel
     */
    overwriteStyle: function() {
        if (this.iconUrl_up!= null || this.iconUrl_sel!=null){
            var html=""
            if (this.iconUrl_up!= null){
                html += ".olControlPanel ."+this.frameworkObject.displayClass+"ItemInactive";
                html += "{ background-image: url(\""+this.iconUrl_up+"\")}";
            }
            if (this.iconUrl_sel!= null){
                html += ".olControlPanel ."+this.frameworkObject.displayClass+"ItemActive";
                html += "{ background-image: url(\""+this.iconUrl_sel+"\")}";
            }           
            Ext.util.CSS.createStyleSheet(html);            
        }

    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#setToolVisible
     */
    setVisible : function(vis){
        this.visible= vis;
        if (this.getFrameworkTool()){
            if (vis){
                this.getFrameworkTool().panel_div.style.display="block";
            }else{
                this.getFrameworkTool().panel_div.style.display="none";
            }
        }
    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#isActive
     */
    isActive : function (){
        return this.getFrameworkTool().active;
    },
    /**
     * @see viewer.viewercontroller.controller.Tool#activate
     */
    activate: function(){
        this.getFrameworkTool().activate();
    },
    /**
     * @see viewer.viewercontroller.controller.Tool#deactivate
     */
    deactivate: function(){
        this.getFrameworkTool().deactivate();
    },
    
    /**
     * @see Ext.util.Observable#addListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the addListener. Register event on the OpenLayers tool (only once)
     * If the event is thrown by the OpenLayers Tool, the given handlers are called.
     */
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
        viewer.viewercontroller.openlayers.OpenLayersTool.superclass.addListener.call(this,event,handler,scope);
    },
    /**
     * @see Ext.util.Observable#removeListener
     * @param event the event
     * @param handler the handler
     * @param scope the scope 
     * Overwrite the removeListener. Unregister the event on the OpenLayers Control if there
     * are no listeners anymore.     
     */
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
                    this.frameworkObject.events.unregister(olSpecificEvent, this, this.handleEvent);
                }
            }            
        }
        viewer.viewercontroller.openlayers.OpenLayersTool.superclass.removeListener.call(this,event,handler,scope);
    },
    /**
     * Handles the OpenLayers generated events for this Layer
     * And make use of the ext framework to fire the event.
     */
    handleEvent : function (event){
        var eventName = this.config.viewerController.mapComponent.getGenericEventName(event.type);
        if(!eventName){
            eventName = event;
        }
        this.fire(eventName,{});
    }
    
});