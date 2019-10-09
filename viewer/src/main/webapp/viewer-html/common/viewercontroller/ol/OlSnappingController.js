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

Ext.define("viewer.viewercontroller.ol.OlSnappingController", {
    extend: "viewer.viewercontroller.controller.SnappingController",

    frameworkLayer: null,
    frameworkControl: null,
    style:null,
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

    frameworkMap: null,

    constructor: function (config) {
        viewer.viewercontroller.ol.OlSnappingController.superclass.constructor.call(this, config);
        
        this.frameworkMap = this.config.viewerController.mapComponent.getMap().getFrameworkMap();

        this.config.viewerController.mapComponent.getMap().addListener(
                viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,
                this.layerAdded, this);
        this.config.viewerController.mapComponent.getMap().addListener(
                viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT,
                this.changedExtent, this);
        
        var c = ol.color.asArray(config.style.fillColor);
        var fillColor = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + config.style.fillOpacity + ')';
        c = ol.color.asArray(config.style.strokeColor);
        var strokeColor = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + config.style.strokeOpacity + ')';
        var strokeStyle = new ol.style.Stroke({
            color: strokeColor,
            width: config.style.strokeWidth,

        });
        var fillStyle = new ol.style.Fill({
            color: fillColor
        });
        
        this.style = new ol.style.Style({
            stroke:strokeStyle,
            fill:fillStyle,
            image: new ol.style.Circle({
                    fill: fillStyle,
                    stroke: strokeStyle,
                    radius: 5
                })
        });
        
        return this;
    },
    getLayer: function (name, map) {
        var layers = map.getLayers();

        for (var i = 0; i < layers.getLength(); i++) {

            if (name == layers.item(i).get('id')) {
                return layers.item(i);
            }
        }
    },
    parseFeatures: function (data) {
        // note the scope here! "this" is actually not "me" but a composite of "me" and "appLayer"
        var geometryAttributeIndex = this.appLayer.geometryAttributeIndex;
        var lName = this.me.getlayerName(this.appLayer);

        if(this.me.frameworkLayer == null){
            // create a primitive OL vector layer
            this.me.frameworkLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: this.me.style
            }
            );
            this.me.snapLayers.push(this.me.frameworkLayer);
            this.me.frameworkMap.addLayer(this.me.frameworkLayer);
        }

        var feats = [];
        var olGeom, wkt;
        var wktFormat = new ol.format.WKT();
        data.forEach(function (element, index, array) {
            // test for keys in element, some WFS just return all attributes anyway..
            if (Object.keys(element).length > 2 &&
                    !(Object.keys(element).length === 3 && Object.keys(element)[2] === 'related_featuretypes')) {
                wkt = element[Object.keys(element)[geometryAttributeIndex]];
            } else {
                wkt = element[Object.keys(element)[1]];
            }
            olGeom = wktFormat.readGeometry(wkt);
            olGeom.getExtent();
            var olFeature = new ol.Feature();
            olFeature.setGeometry(olGeom);
            feats.push(olFeature);
        });       
        this.me.frameworkLayer.getSource().addFeatures(feats);
        this.me.activate();
    },

    changedExtent: function (map, extent) {
        this.frameworkLayer.getSource().clear();
        var tempSnapLayers = this.snapLayers;
        this.snapLayers = [];
        for (var i = 0; i < tempSnapLayers.length; i++) {
            this.addAppLayer(tempSnapLayers[i]);
        }
    },

    addAppLayer: function (appLayer) {
        var me = this;
        // lookup feature source
        this.snapLayers.push(appLayer);
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

    getlayerName: function (appLayer) {
        return appLayer.id;
    },

    loadAttributes: function (geomAttribute, featureService, appLayer) {
        var me = this;
        var extent = me.config.viewerController.mapComponent.getMap().getExtent();
        extent = this.toWKT(extent);
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
            filter: "INTERSECTS(" + geomAttribute.name + ", " + extent + ")"
        }, {
            /* we need access to appLayer.id and this in processing the response */
            me: me,
            appLayer: appLayer
        });
    },

    layerAdded: function (map, options) {
            // volgens mij hoeven we hier niets mee in OL 5
    },

    removeLayer: function (appLayer) {
        
        this.frameworkLayer.getSource().clear();
        var tempSnapLayers = this.snapLayers;
        this.snapLayers = [];
        for(var i = 0; i < tempSnapLayers.length; i++){
            var layer = tempSnapLayers[i];
            if(layer.layerName !== appLayer.layerName){
                this.addAppLayer(layer);
            }
        }     
    },

    toWKT: function (extent) {
        var wkt = "POLYGON((";
        wkt += extent.minx + " " + extent.miny + ", ";
        wkt += extent.maxx + " " + extent.miny + ", ";
        wkt += extent.maxx + " " + extent.maxy + ", ";
        wkt += extent.minx + " " + extent.maxy + ", ";
        wkt += extent.minx + " " + extent.miny + "))";
        return wkt;
    },

    removeAll: function () {
        this.frameworkLayer.getSource().clear();
        this.snapLayers = [];
        this.deactivate();
    },

    activate: function () {
        if(this.frameworkControl == null){
            this.frameworkControl = new ol.interaction.Snap({source: this.frameworkLayer.getSource()});
            this.config.viewerController.mapComponent.getMap().getFrameworkMap().addInteraction(this.frameworkControl);
        }
        
        this.frameworkControl.setActive(true);
        
    },
    deactivate: function () {
        this.frameworkControl.setActive(false);
    },

    getAppLayer: function (name) {
        var id = name.substring(this.snapLayers_prefix.length);
        return (this.config.viewerController.getAppLayerById(id));
    }

});