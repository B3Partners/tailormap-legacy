/* 
 * Copyright (C) 2018 B3Partners B.V.
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
 * @constructor
 * @description Measure tool 
 */
Ext.define("viewer.viewercontroller.openlayers.tools.OpenLayersMeasureTool",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersTool",
    frameworkTool:null,
    handler:null,
    config: {

    },
    constructor: function (conf) {
        var handler = conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? OpenLayers.Handler.Path : OpenLayers.Handler.Polygon;
        var callbacks = {
           /* modify: function (vertex, feature) {
                this.handler.layer.events.triggerEvent(
                        "sketchmodified", {vertex: vertex, feature: feature}
                );
            }*/
        };
      //  conf.frameworkOptions["callbacks"] = callbacks;
        this.frameworkTool = new OpenLayers.Control.Measure(handler, conf.frameworkOptions);
        var me =this;
        this.handler = this.frameworkTool.handler;
        this.frameworkTool.handler.activate = function(){
            me.activate.apply(me.handler);
            me.registerToSnapping();
        };
        var tool = new viewer.viewercontroller.openlayers.OpenLayersTool(conf, this.frameworkTool);
        if (conf.type === viewer.viewercontroller.controller.Tool.MEASUREAREA) {
            this.frameworkTool.displayClass = 'olControlMeasureArea';
        }
        viewer.viewercontroller.openlayers.tools.OpenLayersMeasureTool.superclass.constructor.call(this,conf,this.frameworkTool);
    },
    activate: function() {
        if(!OpenLayers.Handler.prototype.activate.apply(this, arguments) || !this.map) {
            return false;
        }
        // create temporary vector layer for rendering geometry sketch
        // TBD: this could be moved to initialize/destroy - setting visibility here
        var options = OpenLayers.Util.extend({
            displayInLayerSwitcher: false,
            // indicate that the temp vector layer will never be out of range
            // without this, resolution properties must be specified at the
            // map-level for this temporary layer to init its resolutions
            // correctly
            calculateInRange: OpenLayers.Function.True,
            wrapDateLine: this.citeCompliant
        }, this.layerOptions);
        this.layer = new OpenLayers.Layer.Vector(this.CLASS_NAME, options);
        this.map.addLayer(this.layer);
         
        return true;
    },
    deactivate: function () {
        this.frameworkObject.deactivate();
        return true;
    },
    registerToSnapping: function(olVectorLayer){
        var snappings = this.config.viewerController.getComponentsByClassName("viewer.components.Snapping");
        var me = this;
        var layer = {
            getFrameworkLayer: function () {
                return me.handler.layer;
            }
        };
        var options = {
           layer:layer
        };
        this.config.viewerController.registerSnappingLayer(layer);
        for(var i = 0 ; i < snappings.length; i++){
           snappings[i].snapCtl.layerAdded(null, options);
        }
        
    }
});