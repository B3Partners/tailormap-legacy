/*
 * Copyright (C) 2016 B3Partners B.V.
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
 * CoordinateLinkWindow component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.CoordinateLinkWindow", {
    extend: "viewer.components.tools.Tool",
    toolMapClick: null,
    deActivatedTools: null,
    window: null,
    config: {
        url:null,
        width:null,
        height:null
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.CoordinateLinkWindow.superclass.constructor.call(this, this.config);

        this.button = this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_TOOL,
            id: this.getName(),
            name: this.getName(),
            tooltip: this.config.tooltip || null,
            displayClass: !!this.config.iconUrl ? "coordinateLinkWindow-" + Ext.id() : "streetView",
            viewerController: this.config.viewerController,
            iconUrl: this.config.iconUrl || null,
            preventActivationAsFirstTool: true
        });
        this.config.viewerController.mapComponent.addTool(this.button);

        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN, this.buttonDown, this);
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP, this.buttonUp, this);
        // Registreer voor layerinitialized
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initComp, this);

        return this;
    },
    initComp: function () {
        if(this.toolMapClick !== null) {
            return;
        }
        this.toolMapClick = this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name + "toolMapClick",
            handler: {
                fn: this.mapClicked,
                scope: this
            },
            viewerController: this.config.viewerController
        });
    },
    mapClicked: function (tool, event) {
        var me = this;
        var coords = event.coord;
        var x = coords.x;
        var y = coords.y;
        var newUrl = this.config.url;
        if(newUrl.indexOf("/cyclomedia.html") !== -1){
            newUrl = FlamingoAppLoader.get('contextPath') + newUrl;
        }
        
        newUrl=newUrl.replace(/\[RDX\]/g, x);
        newUrl=newUrl.replace(/\[RDY\]/g, y);
        this.window = window.open(newUrl, 'name', 'height=' + this.config.height + ',width=' + this.config.width + ',location=no,resizable=yes,status=no,toolbar=no,menubar=no');
        if (window.focus) {
            this.window.focus();
        }
    },
    /**
     *The next functions will synchronize the button and the tool.
     */
    /**
     * When the button is hit and toggled true
     * @param button the button
     * @param object the options.        
     */
    buttonDown: function (button, object) {
        this.toolMapClick.activateTool();

        this.config.viewerController.mapComponent.setCursor(true, "crosshair");
    },
    /**
     * When the button is hit and toggled false
     */
    buttonUp: function (button, object) {
        this.config.viewerController.mapComponent.setCursor(false);
        if (this.config.useMarker) {
            this.config.viewerController.mapComponent.getMap().removeMarker(this.markerName);
        }
        this.toolMapClick.deactivateTool();
    }
});