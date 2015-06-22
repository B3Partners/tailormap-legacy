/*
 * Copyright (C) 2015 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Merge component.
 * @author markprins@b3partners.nl
 */
Ext.define("viewer.components.Merge", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    toolMapClick: null,
    fidA: null,
    fidB: null,
    geometryEditable: null,
    deActivatedTools: [],
    config: {
        name: "Samenvoegen",
        tooltip: "Features samenvoegen",
        strategy: null,
        actionbeanUrl: "/viewer/action/feature/merge",
        layers: null,
        mergeGapDist: null
    },
    constructor: function (conf) {
        viewer.components.Merge.superclass.constructor.call(this, conf);
        this.initConfig(conf);

        var me = this;
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,
                function (event) {
                    if (me.mode === "selectA" || me.mode === "selectB") {
                        return false;
                    }
                    return true;
                });
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP,
                function (event) {
                    if (me.mode === "selectA" || me.mode === "selectB") {
                        return false;
                    }
                    return true;
                });

        this.renderButton({
            handler: function () {
                me.showWindow();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });

        this.toolMapClick = this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name + "toolMapClick",
            handler: {
                fn: this.mapClicked,
                scope: this
            },
            viewerController: this.config.viewerController
        });

        this.loadWindow();
        return this;
    },
    /**
     * create selection layer.
     * @todo labeling A and B seems to fail
     */
    createVectorLayer: function () {
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes: ["Circle", "Polygon", "MultiPolygon", "LineString"],
            showmeasures: false,
            editable: false,
            viewerController: this.config.viewerController,
            labelPropertyName: "label",
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50,
                label: "${label}"
            }
        });
        this.vectorLayer.addListener(
                viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,
                this.toMergeFeatureAdded,
                this);

        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    showWindow: function () {
        if (this.vectorLayer == null) {
            this.createVectorLayer();
        }
        this.layerSelector.initLayers();
        this.popup.popupWin.setTitle(this.config.title);
        this.config.viewerController.mapComponent.deactivateTools();
        this.popup.show();
    },
    toMergeFeatureAdded: function (vecLayer, feature) {
        if (this.mode == "selectA") {
            Ext.getCmp(this.name + "selectBButton").setDisabled(false);
            Ext.getCmp(this.name + "selectAButton").setDisabled(true);
            Ext.getCmp(this.name + "geomLabel").setText("Selecteer B geometrie");
        } else if (this.mode == "selectB") {
            Ext.getCmp(this.name + "selectBButton").setDisabled(true);
            Ext.getCmp(this.name + "geomLabel").setText("A en B geometrie geselecteerd");
        }
    },
    selectB: function () {
        this.mode = "selectB";
        this.activateMapClick();
    },
    selectA: function () {
        this.mode = "selectA";
        this.vectorLayer.removeAllFeatures();
        this.activateMapClick();
    },
    activateMapClick: function () {
        this.deActivatedTools = this.config.viewerController.mapComponent.deactivateTools();
        this.toolMapClick.activateTool();
    },
    deactivateMapClick: function () {
        for (var i = 0; i < this.deActivatedTools.length; i++) {
            this.deActivatedTools[i].activate();
        }
        this.deActivatedTools = [];
        this.toolMapClick.deactivateTool();
    },
    cancel: function () {
        this.resetForm();
        this.popup.hide();
    },
    save: function () {
        var options = {
            fidA: this.fidA,
            fidB: this.fidB,
            strategy: this.config.strategy,
            mergeGapDist: this.config.mergeGapDist,
            appLayer: this.layerSelector.getSelectedAppLayer().id,
            application: this.config.viewerController.app.id
        };
        this.merge(options, this.saveSucces, this.failed);
    },
    merge: function (options, successFunction, failureFunction) {
        var me = this;
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: options,
            scope: me,
            success: function (result) {
                var response = Ext.JSON.decode(result.responseText);
                if (response.success) {
                    successFunction(response, this);
                } else {
                    if (failureFunction != undefined) {
                        failureFunction(response.error, this);
                    }
                }
            },
            failure: function (result) {
                if (failureFunction != undefined) {
                    failureFunction("Ajax request failed with status " + result.status + " "
                            + result.statusText + ": " + result.responseText, this);
                }
            }});
    },
    failed: function (msg, me) {
        Ext.Msg.alert('Mislukt', msg);
        Ext.get(me.getContentDiv()).unmask();
        me.cancel();
    },
    saveSucces: function (response, me) {
        me.config.viewerController.getLayer(me.layerSelector.getValue()).reload();
        Ext.Msg.alert('Gelukt', "De features zijn samengevoegd.");
        me.cancel();
    },
    mapClicked: function (toolMapClick, comp) {
        this.deactivateMapClick();
        Ext.get(this.getContentDiv()).mask("Haalt features op...")
        var coords = comp.coord;
        var x = coords.x;
        var y = coords.y;
        var layer = this.layerSelector.getValue();
        this.config.viewerController.mapComponent.getMap().setMarker("edit", x, y);
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.config.viewerController
        });
        var me = this;
        featureInfo.editFeatureInfo(x, y, this.config.viewerController.mapComponent.getMap().getResolution() * 4, layer, function (features) {
            me.featuresReceived(features);
        }, function (msg) {
            me.failed(msg, me);
        });
    },
    resetForm: function () {
        Ext.getCmp(this.name + "selectBButton").setDisabled(true);
        Ext.getCmp(this.name + "selectAButton").setDisabled(true);
        this.mode = null;
        this.layerSelector.combobox.select(null);
        Ext.getCmp(this.name + "geomLabel").setText("");
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.removeAllFeatures();
    },
    loadWindow: function () {
        var me = this;
        this.createLayerSelector();
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            autoScroll: true,
            layout: {
                type: 'vbox'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [this.layerSelector.combobox,
                {
                    id: this.name + 'ButtonPanel',
                    xtype: "container",
                    padding: "4px",
                    width: '280px',
                    height: MobileManager.isMobile() ? 60 : 36,
                    items: [
                        {
                            xtype: 'button',
                            id: this.name + "selectAButton",
                            disabled: true,
                            tooltip: "Kies geometrie A",
                            text: "Selecteer A",
                            componentCls: 'mobileLarge',
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.selectA
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            id: this.name + "selectBButton",
                            disabled: true,
                            tooltip: "Kies geometrie B",
                            text: "Selecteer B",
                            componentCls: 'mobileLarge',
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.selectB
                                }
                            }
                        },
                        {
                            id: this.name + "geomLabel",
                            margin: 5,
                            text: '',
                            xtype: "label"
                        }
                    ]
                },
                {
                    id: this.name + 'savePanel',
                    xtype: "container",
                    width: '100%',
                    height: MobileManager.isMobile() ? 45 : 30,
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    defaults: {
                        xtype: 'button',
                        componentCls: 'mobileLarge'
                    },
                    items: [
                        {
                            id: this.name + "cancelButton",
                            tooltip: "Annuleren",
                            text: "Annuleren",
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.cancel
                                }
                            }
                        },
                        {
                            id: this.name + "saveButton",
                            tooltip: "Samenvoegen uitvoeren",
                            text: "Samenvoegen",
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.save
                                }
                            }
                        }
                    ]
                }
            ]
        });
    },
    createLayerSelector: function () {
        var config = {
            viewerController: this.config.viewerController,
            restriction: "editable",
            id: this.name + "layerSelector",
            layers: this.config.layers,
            width: '100%'
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector", config);
        this.layerSelector.addListener(
                viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,
                this.layerChanged,
                this);
    },
    layerChanged: function (appLayer, previousAppLayer, scope) {
        this.appLayer = appLayer;
        Ext.getCmp(this.name + "selectAButton").setDisabled(true);
        Ext.getCmp(this.name + "selectBButton").setDisabled(true);
        this.mode = null;
        this.geometryEditable = false;

        if (appLayer != null) {
            if (appLayer.geometryAttributeIndex != undefined) {
                this.geometryEditable = appLayer.attributes[appLayer.geometryAttributeIndex].editable;
                this.vectorLayer.removeAllFeatures();
                this.mode = null;
                this.config.viewerController.mapComponent.getMap().removeMarker("edit");


                Ext.getCmp(this.name + "selectAButton").setDisabled(false);
                Ext.getCmp(this.name + "selectBButton").setDisabled(true);

                Ext.getCmp(this.name + "geomLabel").setText("Selecteer A en B geometrie");
            } else {
                Ext.getCmp(this.name + "geomLabel").setText('Geometrie mag niet bewerkt worden.');
            }
        } else {
            this.cancel();
        }
    },
    featuresReceived: function (features) {
        //if (features.length == 1) {
        if (features.length > 0) {
            var feat = this.indexFeatureToNamedFeature(features[0]);
            this.handleFeature(feat);
        } else if (features.length == 0) {
            this.handleFeature(null);
        } //else {
        //TODO Handle multiple features: error or just take 1st feature returned?
        //this.createFeaturesGrid(features);
        //this.failed("Er is meer dan 1 feature geselecteerd", this);
        //}
    },
    handleFeature: function (feature) {
        if (feature != null) {
            if (this.mode == "selectA") {
                this.fidA = feature.__fid;
            }
            else if (this.mode == "selectB") {
                this.fidB = feature.__fid;
            }

            if (this.geometryEditable) {
                var wkt = feature[this.appLayer.geometryAttribute];
                var feat = Ext.create("viewer.viewercontroller.controller.Feature", {
                    wktgeom: wkt,
                    id: feature.__fid,
                    // TODO dit lijkt niet te werken..
                    label: (this.mode === "selectA") ? "A" : "B",
                    color: (this.mode === "selectA") ? "#FF0000" : "#00FF00"
                });
                this.vectorLayer.addFeature(feat);
            }
        }
        Ext.get(this.getContentDiv()).unmask();
    },
    indexFeatureToNamedFeature: function (feature) {
        var map = this.makeConversionMap();
        var newFeature = {};
        for (var key in feature) {
            if (!feature.hasOwnProperty(key)) {
                continue;
            }
            var namedIndex = map[key];
            var value = feature[key];
            if (namedIndex != undefined) {
                newFeature[namedIndex] = value;
            } else {
                newFeature[key] = value;
            }
        }
        return newFeature;
    },
    makeConversionMap: function () {
        var appLayer = this.layerSelector.getSelectedAppLayer();
        var attributes = appLayer.attributes;
        var map = {};
        var index = 0;
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].editable) {
                map["c" + index] = attributes[i].name;
                index++;
            }
        }
        return map;
    }
});