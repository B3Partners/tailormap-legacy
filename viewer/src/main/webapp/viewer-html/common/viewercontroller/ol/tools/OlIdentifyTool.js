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


/* global Ext, ol, actionBeans */

Ext.define("viewer.viewercontroller.ol.tools.OlIdentifyTool", {
    extend: "viewer.viewercontroller.ol.OlTool",
    map: null,
    deactivatedControls: null,
    wmsGetFeatureInfoControl: null,
    wmsGetFeatureInfoFormat: "application/vnd.ogc.gml",
    useWMSGetFeatureInfo: null,
    active: false,
    layersToAdd: [],
    config: {
        maxFeatures: 1000
    },

    /**
     * Constructor
     * @param conf the configuration object
     */
    constructor: function (conf) {
        this.useWMSGetFeatureInfo = true;

        conf.id = conf.tooltip;
        conf.displayClass = "olControlIdentify";
        conf.onlyClick = false;
        conf.actives = false;


        this.mapComponent = conf.viewerController.mapComponent;
        viewer.viewercontroller.ol.tools.OlIdentifyTool.superclass.constructor.call(this, conf, this);
        this.map = this.config.viewerController.mapComponent.getMap();

        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED, this.onAddLayer, this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED, this.onRemoveLayer, this);

        return this;
    },

    setUseWMSGetFeatureInfo: function (layer, options) {
        var me = this;
        if (this.useWMSGetFeatureInfo) {
            var frameworkLayer = layer.getFrameworkLayer();
            if (frameworkLayer.getVisible()) {
                var frameworkMap = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
                var url = frameworkLayer.getSource().getGetFeatureInfoUrl([options.coord.x, options.coord.y],
                        frameworkMap.getView().getResolution(),
                        frameworkMap.getView().getProjection(),
                        {INFO_FORMAT: this.wmsGetFeatureInfoFormat, REQUEST: 'GetFeatureInfo', FEATURE_COUNT: me.config.maxFeatures});
            }

            var url = actionBeans.proxy + "/wms?url=" + url + "&serviceId=" + layer.serviceId;
            var parser = new ol.format.WFS();
            Ext.Ajax.request({
                url: url,

                success: function (response, opts) {
                    var features = parser.readFeatures(response.responseText);
                    if (features.length > 0) {
                        options.features = features;
                        options.response = response;
                        options.layer = layer;
                        me.raiseOnDataEvent(options);
                    }
                },

                failure: function (response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                }
            });
        }
    },
    /**
     * Called when a layer is added
     * @param map
     * @param options
     */
    onAddLayer: function (map, options) {
        var mapLayer = options.layer;
        if (mapLayer === null || !(mapLayer instanceof viewer.viewercontroller.controller.WMSLayer)) {
            return;
        }
        var details = mapLayer.getDetails();
        //something to show?
        if (details !== undefined &&
                (!Ext.isEmpty(details["summary.description"]) ||
                        !Ext.isEmpty(details["summary.image"]) ||
                        !Ext.isEmpty(details["summary.link"]) ||
                        !Ext.isEmpty(details["summary.title"]))) {
            var doClientWms = true;
            if (mapLayer.appLayerId) {
                var appLayer = this.config.viewerController.app.appLayers[mapLayer.appLayerId];
                var confServiceLayer = this.config.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
                //do server side getFeature.
                if (confServiceLayer.hasFeatureType) {
                    doClientWms = false;
                }
            }
            if (doClientWms) {
                this.layersToAdd.push(mapLayer);
            }

        }
    },
    activate: function () {
        var me = this;
        this.conf.actives = true;
        this.tempKey = this.mapComponent.maps[0].getFrameworkMap().on('singleclick', function (evt) {
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
            me.handleClick(me, options);
        }, this);
    },

    deactivate: function () {
        this.conf.actives = false;
        ol.Observable.unByKey(this.tempKey);

    },

    isActive: function () {
        return this.conf.actives;
    },

    handleClick: function (tool, options) {
        if (this.layersToAdd.length > 0) {
            for (var i = 0; i < this.layersToAdd.length; i++) {
                this.setUseWMSGetFeatureInfo(this.layersToAdd[i], options);
            }
        }
        this.map.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO, options);
    },

    //called when wms layers return data.           
    raiseOnDataEvent: function (evt) {
        var options = new Object();
        options.x = evt.x;
        options.y = evt.y;
        var coord = new Object();
        coord.x = evt.coord.x;
        coord.y = evt.coord.y;
        options.coord = coord;
        var featuresByLayer = new Object();
        for (var i = 0; i < evt.features.length; i++) {

            var feature = evt.features[i];
            var appLayer = evt.layer;
            var layerName = appLayer.config.options.name;
            if (!featuresByLayer.hasOwnProperty(appLayer.id)) {
                featuresByLayer[appLayer.id] = new Object();
            }
            if (!featuresByLayer[appLayer.id].hasOwnProperty(layerName)) {
                featuresByLayer[appLayer.id][layerName] = new Object();
                featuresByLayer[appLayer.id][layerName].appLayerObj = appLayer;
                featuresByLayer[appLayer.id][layerName].features = new Array();
            }
            featuresByLayer[appLayer.id][layerName].features.push(feature.values_);
        }
        for (var applayer in featuresByLayer) {
            options.data = [];
            var groupedLayers = featuresByLayer[applayer];
            var appLayer = null;
            for (var lName in groupedLayers) {
                var features = groupedLayers[lName].features;
                var response = {
                    request: {
                        appLayer: applayer,
                        serviceLayer: lName
                    },
                    features: features,
                    appLayer: groupedLayers[lName].appLayerObj
                };
                appLayer = groupedLayers[lName].appLayerObj;
                options.data.push(response);
            }
            appLayer.fire(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, options);
        }
    },

    /**
     * Called when a layer is removed
     * @param map
     * @param options
     */
    onRemoveLayer: function (map, options) {
        var mapLayer = options.layer;
        if (mapLayer === null
                || !(mapLayer instanceof viewer.viewercontroller.controller.WMSLayer)) {
            return;
        }
        this.removeWmsClientLayer(mapLayer);

    },

    removeWmsClientLayer: function (mapLayer) {
        var layer = mapLayer.getFrameworkLayer();

        if (this.layersToAdd !== null) {
            this.layersToAdd = Ext.Array.remove(this.layersToAdd, layer);
        }
    }
});