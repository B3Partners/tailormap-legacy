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
    toolMapClick:null,
    formConfigs:null,
    vectorLayer: null,
    config: {
        layers:[],
        configUrl:null
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.GBI.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function() {
                var deferred = me.createDeferred();
                me.showWindow();
             
                return deferred.promise;
            },
            text: "me.config.title"
        });
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,
            this.initialize,this);
        return this;
    },
    initialize: function(){
        this.initializeForm();
        this.createVectorLayer();
        this.toolMapClick =  this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.config.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
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
            mustCreateVertices:true,
            allowselection:true,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50
            }
        });
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this.geometryDrawn, this);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    initializeForm: function(){
        this.div = document.createElement("tailormap-wegvak-popup");
        this.div.addEventListener('wanneerPopupClosed', function(evt){
            console.log("wanneerPopupClosed", evt.detail);
            this.vectorLayer.removeAllFeatures();
            this.config.viewerController.mapComponent.getMap().update();
        }.bind(this));


        this.div.addEventListener('startGeometryDrawing', function(e){this.startDrawingGeometry(e.detail);}.bind(this));

        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,
            this.layerVisibilityChanged,this);

        this.div.setAttribute("config", JSON.stringify(this.formConfigs));
        document.body.appendChild(this.div);

        var visibleAppLayers = this.config.viewerController.getVisibleAppLayers();
        for(var key in visibleAppLayers){
            var appLayer = this.config.viewerController.getAppLayerById(key);
            this.processLayerVisible(appLayer, true);
        }
    },
    layerVisibilityChanged: function(map,event) {
        if(event.layer instanceof viewer.viewercontroller.controller.WMSLayer) {
            var appLayer = this.config.viewerController.getAppLayerById(event.layer.appLayerId);
            this.processLayerVisible(appLayer, event.visible);
        }
            },
    processLayerVisible: function(appLayer, visible){
        var layerName = appLayer.layerName;
        if(layerName.indexOf(":") !== -1){
            layerName = layerName.substring(layerName.indexOf(':') + 1);
            }
        var evt = {
            layername : layerName,
            visible: visible
        };
        this.div.setAttribute("layer-visibility-changed", JSON.stringify(evt));
    },
    startDrawingGeometry: function(event){
        this.vectorLayer.drawFeature(event.type);
    },
    geometryDrawn: function(vectorLayer, feature){
        this.div.setAttribute("geometry-drawn", feature.config.wktgeom);
    },
    mapClicked : function(tool, comp){
        var coords = comp.coord;
        var x = parseInt(coords.x);
        var y = parseInt(coords.y);
        var scale = 25;

        var json = {
            x: x,
            y: y,
            scale: scale
        };
        var visibleLayers = this.config.viewerController.getAppLayerById(this.config.layers[0]);
        this.div.setAttribute("visible-layers", this.stringifyAppLayer(visibleLayers));
        this.div.setAttribute("map-clicked", JSON.stringify(json));
    },
    
    stringifyAppLayer: function(al){
        var culledObject = {
            id: al.id,
            layername: al.layername,
            serviceId: al.serviceId,
            attributes: al.attributes
        };
        var stringified = JSON.stringify([culledObject]);
        return stringified;
    },
    failed: function(msg) {
        Ext.MessageBox.alert(i18next.t('viewer_components_graph_5'), i18next.t('viewer_components_graph_6'));
    }
});
