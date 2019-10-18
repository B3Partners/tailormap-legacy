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

/* global ol, Ext */

Ext.define("viewer.viewercontroller.ol.OlTilingLayer", {
    extend: "viewer.viewercontroller.controller.TilingLayer",
    mixins: {
        olLayer: "viewer.viewercontroller.ol.OlLayer"
    },
    constructor: function (config) {
        viewer.viewercontroller.ol.OlTilingLayer.superclass.constructor.call(this, config);

        if (!Ext.Array.contains(["TMS", "WMTS"], this.getProtocol())) {
            throw new Error("OpenLayers 5 TilingLayer currently does not support tiling protocol " + this.getProtocol());
        }

        this.mixins.olLayer.constructor.call(this, config);

        this.type = viewer.viewercontroller.controller.Layer.TILING_TYPE;
        this.utils = Ext.create("viewer.viewercontroller.ol.Utils");

        var opacity = this.config.opacity !== undefined ? this.config.opacity : 1;
        var options = {
            serverResolutions: this.resolutions,
            type: this.extension,
            transitionEffect: opacity === 1 ? "resize" : null,
            visibility: this.visible === undefined ? true : this.visible,
            opacity: this.config.opacity !== undefined ? this.config.opacity : 1,
            attribution: this.config.attribution
        };
        if (this.getTileWidth() && this.getTileHeight()) {
            options.tileSize = [this.getTileWidth(), this.getTileHeight()];
        }
        var projExtent = config.viewerController.mapComponent.mapOptions.projection.getExtent();
        options.tileOrigin = ol.extent.getTopLeft(projExtent);
        if (this.serviceEnvelope) {
            var serviceEnvelopeTokens = this.serviceEnvelope.split(",");
            var x = Number(serviceEnvelopeTokens[0]);
            var y = Number(serviceEnvelopeTokens[1]);
            //if arcgisrest/wmts the origin y is top left. (maxy)
            if (this.getProtocol() === "ArcGisRest" || this.getProtocol() === "WMTS") {
                y = Number(serviceEnvelopeTokens[3]);
            }
            options.maxExtent = [Number(serviceEnvelopeTokens[0]), Number(serviceEnvelopeTokens[1]), Number(serviceEnvelopeTokens[2]), Number(serviceEnvelopeTokens[3])];
            options.tileOrigin = [x,y];

        }
        if (this.resolutions) {
            options.maxResolution = this.resolutions[0];
        }
        if (this.getProtocol() === "TMS") {
            var t = this.url;
            var version = null;
            var layerName = null;
            if (this.url.lastIndexOf("/") === this.url.length - 1) {
                this.url = this.url.substring(0, this.url.length - 1);
            }
            var urlTokens = this.url.split("/");
            layerName = urlTokens[urlTokens.length - 1];
            version = urlTokens[urlTokens.length - 2];
            urlTokens.splice(urlTokens.length - 2, 2);
            this.url = urlTokens.join("/") + "/";

            //set TMS tiling options.
            options.serviceVersion = version;
            options.layername = layerName;
            var tmsSource = new ol.source.XYZ({
                crossOrigin: "Anonymous",
                attributions: options.attribution,
                projection: config.viewerController.mapComponent.mapOptions.projection,
                url: t + '/{z}/{x}/{-y}.png'
            });
            this.frameworkLayer = new ol.layer.Tile({
                source: tmsSource,
                opacity: options.opacity,
                extent: options.maxExtent,
                visible: options.visibility


            }, options);
        } else if (this.getProtocol() === "WMTS") {
            options.url = this.url;
            options.style = this.config.style;
            options.layer = this.config.name;
            options.matrixSet = this.config.matrixSet.identifier;
            var matrix = this.getMatrix(this.config.matrixSet.matrices);
            options.format = this.extension;

            //needed for print
            if (this.config.matrixSet.bbox) {
                var bbox = this.config.matrixSet.bbox;
                this.serviceEnvelope = bbox.minx + "," + bbox.miny + "," + bbox.maxx + "," + bbox.maxy;
            }

            var grid = new ol.tilegrid.WMTS({
                extent: options.maxExtent,
                origins: matrix.origins,
                resolutions: matrix.serverRes,
                matrixIds: matrix.matrixIds,
                tileSizes: matrix.tileSizes
            });
            var source = new ol.source.WMTS({
                tileGrid: grid,
                projection: config.viewerController.mapComponent.mapOptions.projection,
                layer: options.layer,
                style: options.style,
                format: options.format,
                matrixSet: options.matrixSet,
                url: options.url
            });
            this.frameworkLayer = new ol.layer.Tile({
                source: source,
                opacity: options.opacity,
                extent: options.maxExtent,
                visible: options.visibility
            });
        }
    },

    setVisible: function (vis) {
        this.mixins.olLayer.setVisible.call(this, vis);
    },

    getVisible: function () {
        return this.mixins.olLayer.getVisible.call(this);
    },

    getMatrix: function (matrices) {
        var convertRatio = 1 / 0.00028;
        var serverRes = [];
        var matrixIds = [];
        var origins = [];
        var tileSizes = [];
        for (var i = 0; i < matrices.length; i++) {
            var matrix = matrices[i];
            var topLeft = matrix.topLeftCorner;
            var x = topLeft.substring(0, topLeft.indexOf(" "));
            var y = topLeft.substring(topLeft.indexOf(" ") + 1);
            matrixIds[i] = matrix.identifier;
            serverRes.push(parseFloat(matrix.scaleDenominator) / convertRatio);
            origins[i] = [parseFloat(x), parseFloat(y)];
            tileSizes[i] = [matrix.tileWidth, matrix.tileHeight];
        }
        return {
            matrixIds: matrixIds,
            serverRes: serverRes,
            origins: origins,
            tileSizes: tileSizes

        };
    },
    addListener: function (event, handler, scope) {
        this.mixins.olLayer.addListener.call(this, event, handler, scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#removeListener
     */
    removeListener: function (event, handler, scope) {
        this.mixins.olLayer.removeListener.call(this, event, handler, scope);
    },

    getType: function () {
        return this.mixins.olLayer.getType.call(this);
    },

    getLastMapRequest: function () {
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var r = this.getFrameworkLayer().getSource().getTileUrlFunction();
        var mapcenter = map.getView().getCenter();
        var crd = this.getFrameworkLayer().getSource().getTileGrid().getTileCoordForCoordAndResolution(mapcenter, map.getView().getResolution());
        var request = [{
                extent: this.getFrameworkLayer().getSource().getTileGrid().getTileCoordExtent(crd),
                url: r(crd, 1, map.getView().getProjection())
            }];
        return request;

    },
    setAlpha: function (alpha) {
        if (this.frameworkLayer) {
            this.frameworkLayer.transitionEffect = alpha < 100 ? null : "resize";
        }
        this.mixins.olLayer.setAlpha.call(this, alpha);
    },
    getLayers: function () {
        return this.frameworkLayer.options.layername;
    }
});
        