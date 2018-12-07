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
/* global Ext */

/**
 * @class 
 * @description Default tool for OpenLayers
 */
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersDefaultTool",{
    extend: "viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool",
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
            type: OpenLayers.Control.TYPE_TOOL,
            title: conf.tooltip
        };        
        var olTool= new OpenLayers.Control(controlOptions);        
        //call super.super constructor
        viewer.viewercontroller.openlayers.tools.OpenLayersIdentifyTool.superclass.constructor.call(this,conf,olTool);
        //set type to correct tool type.
        this.setType(viewer.viewercontroller.controller.Tool.DEFAULT);
        //get the map.
        this.map=this.config.viewerController.mapComponent.getMap();
        
        //single map click
        this.mapClick=new viewer.viewercontroller.openlayers.ToolMapClick({
            id: "mapclick_"+this.id,
            viewerController: this.config.viewerController,
            handler: {
                    fn: this.handleClick,
                    scope: this
                },
            handlerOptions:{
                pixelTolerance: 10
            }
        });
        /* The default tool can be added by the mapcomponent.checkTools. It's added
         * when there is no other tool added. The layers are already added then, so 
         * we need to iterate the layers and call the 'onaddlayer' event handler
         */
        var layers=this.getViewerController().mapComponent.getMap().getLayers();
        for (var i=0; i < layers.length; i++){
            this.onAddLayer(null,{layer: layers[i]});
        }
        
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onRemoveLayer,this);
        
        this.getFrameworkTool().events.register("activate",this,this.activate);
        this.getFrameworkTool().events.register("deactivate",this,this.deactivate);
        
        this.setUseWMSGetFeatureInfo(true);
        
        return this;
    },
    /**
     *Activate the tool
     */
    activate: function(){        
        this.active=true;
        this.mapClick.activateTool();
        this.getFrameworkObject().activate();
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.activate();
        }
    },
    /**
     *Deactivate the tool
     */
    deactivate: function(){  
        this.active=false;
        this.mapClick.deactivateTool();
        this.getFrameworkObject().deactivate();
        if (this.wmsGetFeatureInfoControl!=null){
            this.wmsGetFeatureInfoControl.deactivate();
        }
    }
});