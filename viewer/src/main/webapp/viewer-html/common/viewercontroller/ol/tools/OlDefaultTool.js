/* 
 * Copyright (C) 2019 B3Partners B.V.
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


/* global Ext, ol */

Ext.define("viewer.viewercontroller.ol.tools.OlDefaultTool", {
    extend: "viewer.viewercontroller.ol.tools.OlIdentifyTool",
    map: null,
    navigationControl: null,
    mapClick: null,

    constructor: function (conf) {
        var me = this;
        var controlOptions = {
            type: "default",
            title: conf.tooltip
        };
        var olTool = new ol.control.Control(controlOptions);
        conf.displayClass = "olControlDefault";
        viewer.viewercontroller.ol.tools.OlIdentifyTool.superclass.constructor.call(this, conf, olTool);

        this.setType(viewer.viewercontroller.controller.Tool.DEFAULT);

        this.map = this.config.viewerController.mapComponent.getMap();

        this.mapClick = new viewer.viewercontroller.ol.ToolMapClick({
            id: "mapclick_" + this.id,
            viewerController: this.config.viewerController,
            handler: {
                fn: me.handleClick,
                scope: me
            }
        });

        var layers = this.getViewerController().mapComponent.getMap().getLayers();
        for (var i = 0; i < layers.length; i++) {
            this.onAddLayer(null, {layer: layers[i]});
        }

        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED, this.onAddLayer, this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED, this.onRemoveLayer, this);


        this.useWMSGetFeatureInfo = true;

        return this;
    },

    activate: function () {
        this.active = true;
        this.mapClick.activateTool();
        viewer.viewercontroller.ol.tools.OlIdentifyTool.superclass.overwriteStyle.call(this, {
            active: true,
            displayClass: "olControlDefault"
        });
    },

    deactivate: function () {
        this.active = false;
        this.mapClick.deactivateTool();
        viewer.viewercontroller.ol.tools.OlIdentifyTool.superclass.overwriteStyle.call(this, {
            active: false,
            displayClass: "olControlDefault"
        });
    }




});