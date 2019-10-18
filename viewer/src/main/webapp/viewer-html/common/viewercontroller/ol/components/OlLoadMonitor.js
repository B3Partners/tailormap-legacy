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

Ext.define("viewer.viewercontroller.ol.components.OlLoadMonitor", {
    extend: "viewer.viewercontroller.ol.OlComponent",
    config: {
        top: null,
        left: null,
        timeout: null
    },

    constructor: function (conf) {
        viewer.viewercontroller.ol.components.OlLoadMonitor.superclass.constructor.call(this, conf);
        // Make the control and add it to the openlayersmap
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();

        this.frameworkObject = new ol.control.LoadingPanel({
            timeOut: this.config.timeout,
            left: this.config.left,
            top: this.config.top
        });
        map.addControl(this.frameworkObject);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, function () {
            this.frameworkObject.registerLayersLoadEvents_();
        }, this);


        return this;
    },

    getExtComponents: function () {
        return [];
    }
});