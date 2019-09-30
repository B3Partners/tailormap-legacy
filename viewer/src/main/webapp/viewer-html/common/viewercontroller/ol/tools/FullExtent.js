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

Ext.define("viewer.viewercontroller.ol.tools.FullExtent", {

    constructor: function (conf) {
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "max-extent";
        conf.displayClass = "olControlZoomToMaxExtent";
        conf.id = "max-extent";
        conf.actives = false;
        conf.onlyClick = true;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.ZoomToExtent({extent: [12000, 304000, 280000, 620000]});
    },

    activate: function () {
        //var extent = this.mapComponent.maps[0].getFrameworkMap().getView().getProjection().getExtent();
        var extent = this.mapComponent.getMap().getRestrictedExtent();
        this.mapComponent.maps[0].getFrameworkMap().getView().fit(extent, this.mapComponent.maps[0].getFrameworkMap().getSize());
    },

    deactivate: function () {
        //only click can't be deactivated
    },

    isActive: function () {
        return false;
    }

});