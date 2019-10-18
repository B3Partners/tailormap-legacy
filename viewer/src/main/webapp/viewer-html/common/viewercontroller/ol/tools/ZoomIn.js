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

Ext.define("viewer.viewercontroller.ol.tools.ZoomIn", {

    tempKey: null,
    constructor: function (conf) {
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "zoom-in";
        conf.displayClass = "olControlZoomBox";
        conf.id = "ol-zoom-in";
        conf.actives = false;
        conf.onlyClick = false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.interaction.DragBox();
        this.initTool(this.frameworkObject);
    },

    activate: function () {
        var me = this;
        var pinch = new ol.interaction.PinchZoom();
        this.conf.actives = true;
        this.frameworkObject.setActive(true);

        this.tempKey = this.mapComponent.maps[0].getFrameworkMap().on('click', function (evt) {
            var crd = evt.coordinate;
            me.mapComponent.maps[0].getFrameworkMap().getView().setCenter(crd);
            me.mapComponent.maps[0].getFrameworkMap().getView().setZoom(me.mapComponent.maps[0].getFrameworkMap().getView().getZoom() + 1);
        }, this);
        this.mapComponent.maps[0].getFrameworkMap().addInteraction(pinch);
    },

    deactivate: function () {
        this.conf.actives = false;
        this.frameworkObject.setActive(false);
        ol.Observable.unByKey(this.tempKey);
    },

    initTool: function (tool) {
        var me = this;
        tool.on('boxend', function (evt) {
            var x = tool.getGeometry().getExtent();
            var center = [(x[0] + x[2]) / 2, (x[1] + x[3]) / 2];
            me.mapComponent.maps[0].getFrameworkMap().getView().setCenter(center);
            me.mapComponent.maps[0].getFrameworkMap().getView().setZoom(me.mapComponent.maps[0].getFrameworkMap().getView().getZoom() + 1);
        }, this);

        this.deactivate();
    },
    isActive: function () {
        return this.frameworkObject.getActive();
    }
});