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

Ext.define("viewer.viewercontroller.ol.tools.ZoomOutButton", {

    constructor: function (conf) {
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "zoom-out";
        conf.displayClass = "olControlZoomOut";
        conf.id = "ol-zoom-out";
        conf.active = false;
        conf.onlyClick = true;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.Zoom();
    },

    activate: function () {
        this.mapComponent.maps[0].getFrameworkMap().getView().setZoom(this.mapComponent.maps[0].getFrameworkMap().getView().getZoom() - 1);
    },

    deactivate: function () {
        //only click can't be deactivated
    },
    isActive: function () {
        return false;
    }

});