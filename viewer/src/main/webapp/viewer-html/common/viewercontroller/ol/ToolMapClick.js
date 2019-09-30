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

Ext.define("viewer.viewercontroller.ol.ToolMapClick", {
    extend: "viewer.viewercontroller.controller.ToolMapClick",
    handler: null,
    scope: null,
    clickControl: null,
    config: {
        id: null,
        name: null,
        handlerOptions: null
    },
    /**
     * @constructor
     * @see viewer.viewercontroller.controller.ToolMapClick#constructor
     */
    constructor: function (conf) {
        conf.onlyClick = false;
        viewer.viewercontroller.ol.ToolMapClick.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.visible = false;
        this.type = viewer.viewercontroller.controller.Tool.MAP_CLICK;
        //this.initConfig(conf);
        this.handler = conf.handler.fn;
        this.scope = conf.handler.scope;
        this.olMap = this.config.viewerController.mapComponent.getMap().getFrameworkMap();

        //create a click control that handles only single click 

        /*this.clickControl = new OpenLayers.Control.Click({
         handlerOptions: me.config.handlerOptions,
         click: function(evt){
         me.handleClick(evt);
         }
         });
         */
        return this;
    },

    handleClick: function (evt) {
        var crd = evt.coordinate;
        var pix = evt.pixel;

        var options = {
            x: pix[0],
            y: pix[1],
            coord: {
                x: crd[0],
                y: crd[1]
            }
        };

        this.handler.call(this.scope, this, options);
        //this.deactivateTool();
    },

    activateTool: function () {
        var me = this;
        this.clickControl = this.olMap.on("click", function (evt) {
            me.handleClick(evt);
        }, this);
    },

    deactivateTool: function () {
        ol.Observable.unByKey(this.clickControl);
    }
});