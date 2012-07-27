/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * @description An identify tool
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersIdentifyTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    config: {
        olMap: null
    },
    //olMap: null,
    constructor : function (conf,frameworkTool){
        viewer.viewercontroller.openlayers.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,frameworkTool);
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);
        return this;
    },
    activate: function(){
        this.olMap.events.register("click", this, this.handleClick);
    },
    deactivate: function(){
        this.olMap.events.unregister("click", this, this.handleClick);
    },
    handleClick: function(event){
        var opx = this.olMap.getLonLatFromPixel(event.xy)
        var options = {
            x: event.xy.x,
            y: event.xy.y,
            coord: {
                x: opx.lon,
                y: opx.lat
            }
        };
        this.viewerController.mapComponent.getMap().fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    }  
});