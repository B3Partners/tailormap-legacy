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
 * @class 
 * @constructor
 * @description A drawable vector layer
 */

Ext.define ("viewer.viewercontroller.openlayers.ToolMapClick",{
    extend: "viewer.viewercontroller.controller.ToolMapClick",
    handler:null,
    scope:null,
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
        viewer.viewercontroller.openlayers.ToolMapClick.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        //this.visible=false;
        var me = this;
        
        this.type = viewer.viewercontroller.controller.Tool.MAP_CLICK;
        this.initConfig(conf);
        this.handler = conf.handler.fn;
        this.scope = conf.handler.scope;
        this.olMap=this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        
        //create a click control that handles only single click        
        this.clickControl = new OpenLayers.Control.Click({
            handlerOptions: me.config.handlerOptions,
            click: function(evt){
                me.handleClick(evt)
            }
        });
        this.olMap.addControl(this.clickControl);
        
        return this;
    },
    /**
     *Called when there is clicked on the map with this tool, do some pre work before calling
     *the handler.
     */
    handleClick : function(event){
        var opx = this.olMap.getLonLatFromPixel(event.xy)
        var options = {            
            x: event.xy.x,
            y: event.xy.y,
            coord: {
                x: opx.lon,
                y: opx.lat
            }
        };
        this.handler.call(this.scope, this,options);
        
    },
    /**
     * Activate the tool
     */
    activateTool : function(){
        console.log("hallo");
        this.clickControl.activate();
    },
    /**
     * Deactivate the tool
     */
    deactivateTool : function (){
        this.clickControl.deactivate();
    }
});