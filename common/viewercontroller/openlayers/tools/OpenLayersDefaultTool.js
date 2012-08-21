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
    mapClick: null,
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
        viewer.viewercontroller.openlayers.tools.OpenLayersDefaultTool.superclass.constructor.call(this,conf,olTool);
        //set type to correct tool type.
        this.setType(viewer.viewercontroller.controller.Tool.DEFAULT);
        //get the map.
        this.map=this.viewerController.mapComponent.getMap();
        //navigation tool
        this.navigationControl = new OpenLayers.Control.Navigation({autoActivate: false}); 
        this.map.getFrameworkMap().addControls([this.navigationControl]);
        
        //single map click
        this.mapClick=new viewer.viewercontroller.openlayers.ToolMapClick({
            id: "mapclick_"+this.id,
            viewerController: this.viewerController,
            handler: {
                    fn: this.mapClicked,
                    scope: this
                }
        });
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);
        return this;
    },
    /**
     * called when the map is clicked with this tool
     */
    mapClicked: function(tool,options){
        this.map.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,options);
    },
    /**
     *Activate the tool
     */
    activate: function(){        
        this.navigationControl.activate();
        this.mapClick.activateTool();
        this.getFrameworkObject().activate();
    },
    /**
     *Deactivate the tool
     */
    deactivate: function(){  
        this.navigationControl.deactivate();  
        this.mapClick.deactivateTool();
        this.getFrameworkObject().deactivate();
    }
});