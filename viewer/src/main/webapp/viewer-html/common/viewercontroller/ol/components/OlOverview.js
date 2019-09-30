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

Ext.define("viewer.viewercontroller.ol.components.OlOverview", {
    extend: "viewer.viewercontroller.ol.OlComponent",
    config: {
        top: null,
        left: null,
        url: null,
        layers: null,
        position: null,
        height: null,
        width: null,
        lox: null,
        loy: null,
        rbx: null,
        rby: null,
        followZoom: null
    },
    layer: null,
    constructor: function (conf) {
        this.height = 300;
        this.width = 300;

        viewer.viewercontroller.ol.components.OlOverview.superclass.constructor.call(this, conf);
        var map = this.config.viewerController.mapComponent.getMap().frameworkMap;
        this.map = map;
        if (Ext.isEmpty(this.config.url)) {
            throw new Error("No URL set for Overview component, unable to load component");
        }
        var maxBounds = this.config.viewerController.mapComponent.getMap().maxExtent;
        var bounds;
        if (this.config.lox !== null && this.config.loy !== null && this.config.rbx !== null && this.config.rby !== null
                && this.config.lox !== this.config.rbx && this.config.loy !== this.config.rby) {
            bounds = [
                parseFloat(this.config.lox),
                parseFloat(this.config.loy),
                parseFloat(this.config.rbx),
                parseFloat(this.config.rby)];
        } else {
            bounds = maxBounds;
        }

        var extentAr = [-285401.0, 22598.0, 595401.0, 903401.0];

        var projection = new ol.proj.get('EPSG:28992');
        projection.setExtent(extentAr);



        if (conf.rb === '1')// 1 = tms button in viewer-admin
        {
            this.layer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: this.config.url + '/{z}/{x}/{-y}.png',
                    projection: "EPSG:28992"
                })
            });

        } else if (conf.rb === '2') // 2 = wms/image button in viewer-admin
        {
            this.layer = new ol.layer.Image({
                source: new ol.source.ImageStatic({
                    url: this.config.url,
                    imageExtent: extentAr,
                    projection: "EPSG:28992"
                })
            });
        }
        this.frameworkObject = new ol.control.OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap',
            layers: [this.layer],
            view: new ol.View({
                projection: projection,
                center: map.getView().getCenter(),
                extent: bounds,
                resolutions: map.getView().getResolutions()
            })
        });

        map.addControl(this.frameworkObject);

        return this;
    }
});
    