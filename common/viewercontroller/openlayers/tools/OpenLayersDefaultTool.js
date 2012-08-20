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
 * @description Default tool for OpenLayers
 */
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersDefaultTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    map: null,
    navigationControl: null,
    /**
     * Constructor
     * @param conf the configuration object
     * @param frameworkTool the openlayers control
     * @param map the viewer.viewercontroller.openlayers.OpenLayersMap
     */
    constructor : function (conf){
        var controlOptions = {
            displayClass: "olControlDefault",
            type: OpenLayers.Control.TYPE_TOOL
        };        
        var olTool= new OpenLayers.Control(controlOptions);
        viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,olTool);
        this.map=this.viewerController.mapComponent.getMap();
        
        this.navigationControl = new OpenLayers.Control.Navigation(); 
        this.map.getFrameworkMap().addControls([this.navigationControl]);                
        this.navigationControl.deactivate();
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);
        return this;
    },
    activate: function(){        
        //alert("don't click me again!");
        this.navigationControl.activate();
    },
    deactivate: function(){  
        this.navigationControl.deactivate();
        //this.map.getFrameworkMap().events.unregister("click", this, this.handleClick);
        //deactivate all controls.
    }
});