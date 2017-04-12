/*
 * Copyright (C) 2015 B3Partners B.V.
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
 *  @description Controller component for the Snapping control.
 * @author <a href="mailto:markprins@b3partners.nl">Mark Prins</a>
 *
 * @class
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersSnappingController", {
    extend: "viewer.viewercontroller.controller.SnappingController",
    /**
     * editable/drawable OpenLayers Vector layer.
     * @private
     * TODO refactor to array as each edit & draw control have their own layer
     */
    frameworkLayer: null,
    /** snapping control.*/
    frameworkControl: null,
    config: {
        style: {
            strokeColor: '#FF00FF',
            strokeOpacity: 0.5,
            strokeWidth: 1,
            pointRadius: 1,
            fillOpacity: 0.25,
            fillColor: '#FF00FF'
        },
        viewerController: null
    },
    /**
     * OpenLayers Vector layers to snap to.
     * @private
     */
    //snapLayers: [],
    /**
     * name prefix of the built-in snapLayers
     */
    //snapLayers_prefix: "snapping_",
    /**
     * OpenLayers Map.
     * @private
     */
    frameworkMap: null,
    /**
     * @constructor
     * @param {Object} config
     * @returns {viewer.viewercontroller.openlayers.OpenLayersSnappingController}
     */
    constructor: function (config) {
        viewer.viewercontroller.openlayers.OpenLayersSnappingController.superclass.constructor.call(this, config);

        this.frameworkMap = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        this.frameworkControl = new OpenLayers.Control.Snapping();

        this.config.viewerController.mapComponent.getMap().addListener(
                viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,
                this.layerAdded, this);
        this.config.viewerController.mapComponent.getMap().addListener(
                viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT,
                this.changedExtent, this);
        // this.config.viewerController.mapComponent.getMap().addListener(
        //         viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,
        //         this.layerRemoved, this);

        return this;
    },
    //    /**
    //     * @param {type} map
    //     * @param {type} options
    //     * @TODO look up the control that belongs to this appLayer and destroy it
    //     */
    //    layerRemoved: function (map, options) {
    //        if (layer.options &&
    //                Ext.Array.contains(this.config.viewerController.registeredSnappingLayers, options.layer)) {
    //            this.frameworkLayer = options.layer.getFrameworkLayer();
    //        }
    //    },
    /**
     * Attach the snapping control to the Openlayers layers of the added
     * editing or drawing layer or other layer.
     * @param {type} map
     * @param {Object} options
     */
    layerAdded: function (map, options) {
        if (options.layer &&
                Ext.Array.contains(this.config.viewerController.registeredSnappingLayers, options.layer)) {
            this.frameworkLayer = options.layer.getFrameworkLayer();
            this.frameworkControl.setLayer(this.frameworkLayer);
            this.activate();
        }
    },
    /**
     * add the snapping target.
     * @param {Object} appLayer
     */
    addAppLayer: function (appLayer) {
        var me = this;
        // lookup feature source
        var featureService = this.config.viewerController.getAppLayerFeatureService(appLayer);
        if (appLayer.attributes === undefined) {
            // find geom attribute, then load data
            featureService.loadAttributes(appLayer, function (result) {
                me.loadAttributes(appLayer.attributes[appLayer.geometryAttributeIndex], featureService, appLayer);
            });
        } else {
            me.loadAttributes(appLayer.attributes[appLayer.geometryAttributeIndex], featureService, appLayer);
        }

    },
    /**
     * fetch/load geometries.
     * @param {type} geomAttribute
     * @param {type} featureService
     * @param {Object} appLayer
     * @returns {void}
     */
    loadAttributes: function (geomAttribute, featureService, appLayer) {
        var me = this;
        var extent = me.config.viewerController.mapComponent.getMap().getExtent();
        featureService.loadFeatures(
                appLayer,
                me.parseFeatures,
                function (msg) {
                    Ext.MessageBox.alert("Foutmelding", msg);
                }, {
            store: 1,
            limit: 1000,
            arrays: 1,
            // just get geometry
            attributesToInclude: [geomAttribute.id],
            edit: false,
            graph: true,
            // only for map extent
            filter: "INTERSECTS(" + geomAttribute.name + ", " + extent.toWKT() + ")"
        }, {
            /* we need access to appLayer.id and this in processing the response */
            me: me,
            appLayer: appLayer
        });
    },
    /**
     * remove the snapping target.
     * @param {Object} appLayer
     */
    removeLayer: function (appLayer) {
        this.deactivate();
        // look up snappingLayer primitive by name/id...
        // there should only be one layer in the rLyr
        var rLyr = this.frameworkMap.getLayersByName(this.getlayerName(appLayer))[0];
        if (rLyr) {
            Ext.Array.remove(this.snapLayers, rLyr);
            this.frameworkMap.removeLayer(rLyr);
            this.frameworkControl.removeTargetLayer(rLyr);
        }
        this.activate();
    },
    /**
     * remove all snapping targets.
     */
    removeAll: function () {
        for (var i = 0; i < this.snapLayers.length; i++) {
            this.frameworkControl.removeTargetLayer(this.snapLayers[i]);
            this.frameworkMap.removeLayer(this.snapLayers[i]);
        }
        this.snapLayers = [];
        this.deactivate();
    },
    /**
     * activate snapping, if there are snapping targets
     */
    activate: function () {
        if (this.snapLayers.length > 0) {
            this.frameworkControl.activate();
        }
    },
    /**
     * deactivate snapping.
     */
    deactivate: function () {
        this.frameworkControl.deactivate();
    },
    parseFeatures: function (data) {
        // note the scope here! "this" is actually not "me" but a composite of "me" and "appLayer"
        var geometryAttributeIndex = this.appLayer.geometryAttributeIndex;
        var lName = this.me.getlayerName(this.appLayer);
        var rLyrs = this.me.frameworkMap.getLayersByName(lName);
        var olLyr;
        if (rLyrs.length > 0) {
            // there should only be one layer in the rLyr
            olLyr = rLyrs[0];
            olLyr.removeAllFeatures();
        } else {
            // create a primitive OL vector layer
            console.log(this.me);
            olLyr = new OpenLayers.Layer.Vector(
                    lName, {
                        styleMap: new OpenLayers.StyleMap({
                            'default': this.me.config.style
                        })
                    }
            );
            this.me.snapLayers.push(olLyr);
            this.me.frameworkMap.addLayers([olLyr]);
            this.me.frameworkControl.addTargetLayer(olLyr);
        }

        var feats = [];
        var olGeom, wkt;
        data.forEach(function (element, index, array) {
            // test for keys in element, some WFS just return all attributes anyway..
            if (Object.keys(element).length > 2 &&
                    !(Object.keys(element).length === 3 && Object.keys(element)[2] === 'related_featuretypes')) {
                wkt = element[Object.keys(element)[geometryAttributeIndex]];
            } else {
                wkt = element[Object.keys(element)[1]];
            }
            olGeom = OpenLayers.Geometry.fromWKT(wkt);
            olGeom.calculateBounds();
            feats.push(new OpenLayers.Feature.Vector(olGeom));
        });
        olLyr.addFeatures(feats);
        this.me.activate();
    },
    /**
     * update data after map extent change.
     * @param {type} map
     * @param {type} extent
     */
    changedExtent: function (map, extent) {
        for (var i = 0; i < this.snapLayers.length; i++) {
            this.addAppLayer(this.getAppLayer(this.snapLayers[i].name));
        }
    },
    /**
     *
     * @param {Object} appLayer
     * @returns {String} local layer name
     * @see getAppLayer
     */
    getlayerName: function (appLayer) {
        return this.snapLayers_prefix + appLayer.id;
    },
    /**
     *
     * @param {String} name local name
     * @returns {Object}
     *
     * @see getlayerName
     */
    getAppLayer: function (name) {
        var id = name.substring(this.snapLayers_prefix.length);
        return (this.config.viewerController.getAppLayerById(id));
    }
});
