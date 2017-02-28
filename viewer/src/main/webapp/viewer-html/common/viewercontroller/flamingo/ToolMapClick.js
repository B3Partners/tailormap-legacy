/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * Creates a JSButton with the given configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */ 
Ext.define ("viewer.viewercontroller.flamingo.ToolMapClick",{
    extend: "viewer.viewercontroller.controller.ToolMapClick",
    enabledEvents : null,
    /**
     *@constructor
     *@see viewer.viewercontroller.controller.ToolMapClick#constructor
     */
    constructor: function (conf){              
        viewer.viewercontroller.flamingo.ToolMapClick.superclass.constructor.call(this, conf);
        this.visible=false;
        this.id = conf.id + "_toolMapClick";
        this.enabledEvents = new Object();
        this.initConfig(conf);
        this.mapComponent = this.config.viewerController.mapComponent;
        this.frameworkObject = this.config.viewerController.mapComponent.viewerObject;
        this.addListener(viewer.viewercontroller.controller.Event.ON_MAP_CLICKED,conf.handler.fn,conf.handler.scope);
        //this.mixins.flamingoTool.addListener(viewer.viewercontroller.controller.Event.ON_MAP_CLICKED,conf.handler.fn,conf.handler.scope);
        this.addTool();
        //this.viewerController.mapComponent.addTool(this);
        return this;
    },
    /**
     * Create a xml string for this object.
     * @return string of the xml.
     */
    addTool: function (){        
        var toolGroupId = this.mapComponent.getToolGroup();
        var toolXml="<fmc:ToolGroup id='"+toolGroupId+"'>";
        toolXml+="<fmc:ToolMapClick id='"+this.id+"' listento='"+ this.mapComponent.getMap().getId()+"' visible='"+this.visible+"'/>";
        toolXml+="</fmc:ToolGroup>";    
        this.frameworkObject.callMethod(this.mapComponent.flamingoId,'addComponent',toolXml);            
        this.mapComponent.tools.push(this);
    },
    activateTool : function(){
        this.frameworkObject.callMethod(this.id,"activate");
    },
    deactivateTool : function(){
        this.frameworkObject.callMethod(this.id,"deactivate");
        // TODO make sure the toolmapclick is deactivated. Even if there is no other tool selected.
    },
    
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
        viewer.viewercontroller.flamingo.ToolMapClick.superclass.addListener.call(this,event,handler,scope);
        //enable flamingo event broadcasting
        var flamEvent=this.config.viewerController.mapComponent.eventList[event];
        if (flamEvent!=undefined){
            //if not enabled yet, enable
            if (this.enabledEvents[flamEvent]==undefined){
                this.frameworkObject.callMethod(this.config.viewerController.mapComponent.getId(),"addAllowExternalInterface",this.getId()+"."+flamEvent);
                this.enabledEvents[flamEvent]=true;
            }
        }     
    }
});
