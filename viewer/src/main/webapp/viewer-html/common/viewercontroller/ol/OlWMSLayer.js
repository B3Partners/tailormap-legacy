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

Ext.define("viewer.viewercontroller.ol.OlWMSLayer", {
    extend: "viewer.viewercontroller.controller.WMSLayer",
    mixins: {
        olLayer: "viewer.viewercontroller.ol.OlLayer"
    },
    constructor: function (config) {
        viewer.viewercontroller.ol.OlWMSLayer.superclass.constructor.call(this, config);
        this.mixins.olLayer.constructor.call(this, config);


        var sources = new ol.source.ImageWMS({
            attributions: this.config.attribution,
            url: config.options.url,
            projection: config.viewerController.mapComponent.mapOptions.projection,
            params: {LAYERS: config.options.layers,
                VERSION: this.options.version,
                SRS: this.options.srs,
                STYLES: this.options.styles,
                FORMAT: this.options.format,
                TRANSPARENT: this.options.transparent,
                TILED: false,
                REQUEST: 'GetMap'
            }
        });
        this.frameworkLayer = new ol.layer.Image({
            source: sources,
            visible: this.visible
        });

        this.type = viewer.viewercontroller.controller.Layer.WMS_TYPE;

        this.getFeatureInfoControl = null;
        this.mapTipControl = null;
    },

    setVisible: function (vis) {
        this.mixins.olLayer.setVisible.call(this, vis);
    },

    getVisible: function () {
        return this.mixins.olLayer.getVisible.call(this);
    },
    getType: function () {
        return this.mixins.olLayer.getType.call(this);
    },

    setOGCParams: function (newParams) {
        var source = this.frameworkLayer.getSource();
        source.updateParams(newParams);
    },
    /**
     *Gets the last wms request-url of this layer
     *@returns the WMS getMap Reqeust.
     */
    getLastMapRequest: function () {
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var request = [{
                url: this.getFrameworkLayer().getSource().getGetFeatureInfoUrl(map.getView().getCenter(), map.getView().getResolution(), map.getView().getProjection())
            }];
        return request;
    },

    setQuery: function (filter, sldHash, sessionId) {
        if (filter && filter.getCQL() !== "") {
            var service = this.config.viewerController.app.services[this.serviceId];
            var layer = service.layers[this.options.name];
            if (layer.details !== undefined) {
                var filterable = layer.details["filterable"];
                if (filterable !== undefined && filterable !== null) {
                    filterable = Ext.JSON.decode(filterable);
                    if (filterable) {
                        var url;
                        if (!sldHash) {
                            url = Ext.create(viewer.SLD).createURL(
                                    this.options["layers"],
                                    this.getOption("styles") || "default",
                                    null,
                                    layer.hasFeatureType ? layer.featureTypeName : null,
                                    this.config.sld ? this.config.sld.id : null,
                                    filter.getCQL());
                        } else {
                            url = Ext.create(viewer.SLD).createURLWithHash(
                                    sldHash,
                                    sessionId,
                                    this.options["layers"],
                                    this.getOption("styles") || "default");
                        }
                        this.setOGCParams({"SLD": url});
                        this.reload();
                    }
                }
            }
        } else {
            this.setOGCParams({
                "SLD": this.config.originalSldUrl || null
            });
        }
    },

    setAlpha: function (alpha) {
        this.mixins.olLayer.setAlpha.call(this, alpha);
    },

    reload: function () {
        var source = this.frameworkLayer.getSource();
        var params = source.getParams();
        params.t = new Date().getMilliseconds();
        source.updateParams(params);
        this.mixins.olLayer.reload.call(this);
    }
});