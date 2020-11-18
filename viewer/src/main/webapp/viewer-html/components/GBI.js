/* 
 * Copyright (C) 2020 B3Partners B.V.
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
/* global Ext, i18next */

/**
 * GBI component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.GBI", {
    extend: "viewer.components.Component",
    div: null,
    divController: null,
    toolMapClick: null,
    formConfigs: null,
    vectorLayer: null,
    highlightLayer: null,
    config: {
        configUrl: null
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.GBI.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function () {
                var deferred = me.createDeferred();
                me.showWindow();

                return deferred.promise;
            },
            text: "me.config.title"
        });
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,
            this.initialize, this);
        return this;
    },
    initialize: function () {
        this.createVectorLayer();
        this.initializeForm();
        this.toolMapClick = this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.config.name + "toolMapClick",
            handler: {
                fn: this.mapClicked,
                scope: this
            },
            viewerController: this.config.viewerController
        });
        this.toolMapClick.activateTool();
    },
    createVectorLayer: function () {
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes: ["Polygon", "Point", "LineString"],
            showmeasures: false,
            mustCreateVertices: true,
            allowselection: true,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50
            }
        });

        this.highlightLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'HighlighVectorLayer',
            geometrytypes: ["Polygon", "Point", "LineString"],
            showmeasures: false,
            mustCreateVertices: false,
            allowselection: false,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "0000FF",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50
            }
        });
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.highlightLayer);
    },
    initializeForm: function () {
        this.divController = document.createElement("tailormap-workflow-controller");
        this.divController.setAttribute("vector-layer-id", this.vectorLayer.getId());
        this.divController.setAttribute("highlight-layer-id", this.highlightLayer.getId());
        this.divController.addEventListener('wanneerPopupClosed', this.popupClosed.bind(this));
        document.body.appendChild(this.divController);
    },
    popupClosed: function (evt) {
        this.vectorLayer.removeAllFeatures();
        this.highlightLayer.removeAllFeatures();
        this.config.viewerController.mapComponent.getMap().update();
    },
    startDrawingGeometry: function (event) {
        this.vectorLayer.drawFeature(event.type);
    },
  
    addFeatureToLayer: function(event){
        this.vectorLayer.readGeoJSON(event.geometrie);
    },
    
    highlight: function (event) {
        var geojson = event.detail.geojson;
        if (geojson) {
            this.highlightLayer.readGeoJSON(geojson);
        }
    },
    mapClicked: function (tool, comp) {
        var coords = comp.coord;
        var x = parseInt(coords.x);
        var y = parseInt(coords.y);
        var scale = this.config.viewerController.mapComponent.getMap().getResolution() * 4;

        var json = {
            x: x,
            y: y,
            scale: scale
        };
        this.divController.setAttribute("map-clicked", JSON.stringify(json));
    },
    failed: function (msg) {
        Ext.MessageBox.alert(i18next.t('viewer_components_graph_5'), i18next.t('viewer_components_graph_6'));
    }
});
