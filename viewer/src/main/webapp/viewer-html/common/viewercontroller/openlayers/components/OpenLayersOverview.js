/* 
 * Copyright (C) 2012-2015 B3Partners B.V.
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
 * OpenLayers Overview component.
 * Creates an Overview component for an OpenLayers map.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.viewercontroller.openlayers.components.OpenLayersOverview", {
    extend: "viewer.viewercontroller.openlayers.OpenLayersComponent",
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
    constructor: function (conf) {
        this.height = 300;
        this.width = 300;
        viewer.viewercontroller.openlayers.components.OpenLayersOverview.superclass.constructor.call(this, conf);

        if (Ext.isEmpty(this.config.url)) {
            throw new Error(___("No URL set for Overview component, unable to load component"));
        }
        var maxBounds = this.config.viewerController.mapComponent.getMap().frameworkMap.maxExtent;
        var bounds;
        if (this.config.lox !== null && this.config.loy !== null && this.config.rbx !== null && this.config.rby !== null
                && this.config.lox !== this.config.rbx && this.config.loy !== this.config.rby) {
            bounds = new OpenLayers.Bounds(
                    parseFloat(this.config.lox),
                    parseFloat(this.config.loy),
                    parseFloat(this.config.rbx),
                    parseFloat(this.config.rby));
        } else {
            bounds = maxBounds;
        }
       
        var size = new OpenLayers.Size(parseInt(this.config.width, 10), parseInt(this.config.height, 10));
        var layer = new OpenLayers.Layer.Image(
                "OverviewLaag",
                this.config.url,
                bounds,
                size);

        this.frameworkObject = new OpenLayers.Control.OverviewMap({
            maximized: true,
            mapOptions: {
                maxExtent: maxBounds,
                projection: "EPSG:28992",
                theme: null
            },
            size: size,
            layers: [layer]
        });
        if (this.config.followZoom !== undefined && this.config.followZoom !== null && this.config.followZoom === false) {
            this.frameworkObject.maxRatio = 999999;
        }

        return this;
    },
    getExtComponents: function () {
        return [];
    },
    //setters for bounds, make sure it are numbers
    setLox: function (value) {
        if (isNaN(value)) {
            this.lox = null;
            return;
        }
        this.lox = Number(value);
    },
    setLoy: function (value) {
        if (isNaN(value)) {
            this.loy = null;
            return;
        }
        this.loy = Number(value);
    },
    setRbx: function (value) {
        if (isNaN(value)) {
            this.rbx = null;
            return;
        }
        this.rbx = Number(value);
    },
    setRby: function (value) {
        if (isNaN(value)) {
            this.rby = null;
            return;
        }
        this.rby = Number(value);
    },
    //make sure the heigth and width are numbers
    setHeight: function (value) {
        if (isNaN(value)) {
            this.height = null;
            return;
        } else if (!Ext.isEmpty(value) && value > 0) {
            this.height = Number(value);
        }
    },
    setWidth: function (value) {
        if (isNaN(value)) {
            this.width = null;
            return;
        } else if (!Ext.isEmpty(value) && value > 0) {
            this.width = Number(value);
        }

    }
});


