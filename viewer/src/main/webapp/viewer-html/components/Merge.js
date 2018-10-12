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
 * Merge component.
 * @author markprins@b3partners.nl
 */
Ext.define("viewer.components.Merge", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    toolMapClick: null,
    fidA: null,
    fidB: null,
    labelA: 'A',
    labelB: 'B',
    geometryEditable: null,
    deActivatedTools: [],
    config: {
        name: "Samenvoegen",
        tooltip: i18next.t('viewer_components_merge_0'),
        strategy: "replace",
        actionbeanUrl: "/viewer/action/feature/merge",
        layers: null,
        mergeGapDist: null,
        cancelOtherControls: ["viewer.components.Edit", "viewer.components.Split"],
        details: {
            minWidth: 450,
            minHeight: 250
        }
    },
    constructor: function (conf) {
        this.initConfig(conf);
		viewer.components.Merge.superclass.constructor.call(this, this.config);
        this.config.actionbeanUrl = FlamingoAppLoader.get('contextPath') + '/action/feature/merge';

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
                label: "${label}",
                fontSize: "x-large"
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
        this.config.viewerController.deactivateControls(this.config.cancelOtherControls);
        this.popup.show();
    },
    toMergeFeatureAdded: function (vecLayer, feature) {
        if (this.mode == "selectA") {
            Ext.getCmp(this.name + "selectBButton").setDisabled(false);
            Ext.getCmp(this.name + "selectAButton").setDisabled(true);
            Ext.getCmp(this.name + "geomLabel").setText("Selecteer " + this.labelB + " geometrie");
        } else if (this.mode == "selectB") {
            Ext.getCmp(this.name + "selectBButton").setDisabled(true);
            Ext.getCmp(this.name + "geomLabel").setText(this.labelA + " en " + this.labelB + " geometrie geselecteerd");
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
        if (Array.isArray(this.deActivatedTools) && this.deActivatedTools.length === 0) {
            this.deActivatedTools = this.config.viewerController.mapComponent.deactivateTools();
        }
        this.hideMobilePopup();
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
    hideMobilePopup: function() {
        if(viewer.components.MobileManager.isMobile()) {
            this.popup.hide();
        }
    },
    showMobilePopup: function() {
        if(viewer.components.MobileManager.isMobile()) {
            this.popup.show();
        }
    },
    /**
     * Can be overridden to add some extra data before sending the split
     * request to the server. The extradata is handled by a custom split backend.
     * @return {String} a string with extra data
     */
    getExtraData: function () {
        //eg. return "workflow_status=nieuw";
        return null;
    },
    save: function () {
        var options = {
            fidA: this.fidA,
            fidB: this.fidB,
            strategy: this.config.strategy,
            mergeGapDist: this.config.mergeGapDist,
            appLayer: this.layerSelector.getValue().id,
            application: this.config.viewerController.app.id
        };
        var extraData = this.getExtraData();
        if (extraData !== null) {
            options.extraData = extraData;
        }
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
        Ext.MessageBox.alert(i18next.t('viewer_components_merge_9'), i18next.t('viewer_components_merge_10'));
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
        featureInfo.editFeatureInfo(x, y, this.config.viewerController.mapComponent.getMap().getResolution() * 4, layer, function (response) {
            var features = response.features;
            me.featuresReceived(features);
        }, function (msg) {
            me.failed(msg, me);
        });
    },
    resetForm: function () {
        Ext.getCmp(this.name + "selectBButton").setDisabled(true);
        Ext.getCmp(this.name + "selectAButton").setDisabled(true);
        this.mode = null;
        this.layerSelector.clearSelection();
        Ext.getCmp(this.name + "geomLabel").setText("");
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        if (this.vectorLayer) {
            // vector layer may be null when cancel() is called
            this.vectorLayer.removeAllFeatures();
        }
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
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [this.layerSelector.getLayerSelector(),
                {
                    id: this.name + 'ButtonPanel',
                    xtype: "container",
                    padding: "4px",
                    items: [
                        {
                            xtype: 'button',
                            id: this.name + "selectAButton",
                            disabled: true,
                            tooltip: i18next.t('viewer_components_merge_1') + this.labelA,
                            text: i18next.t('viewer_components_merge_2') + this.labelA,
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
                            tooltip: i18next.t('viewer_components_merge_3') + this.labelB,
                            text: i18next.t('viewer_components_merge_4') + this.labelB,
                                        listeners: {
                                click: {
                                    scope: me,
                                    fn: me.selectB
                                }
                            }
                        }
                    ]
                },
                {
                    id: this.name + "geomLabel",
                    margin: 5,
                    text: '',
                    xtype: "label"
                },
                {
                    id: this.name + 'savePanel',
                    xtype: "container",
                    layout: {
                        type: 'hbox',
                        pack: 'end'
                    },
                    defaults: {
                        xtype: 'button'
                    },
                    items: [
                        {
                            id: this.name + "cancelButton",
                            tooltip: i18next.t('viewer_components_merge_5'),
                            text: i18next.t('viewer_components_merge_6'),
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.cancel
                                }
                            }
                        },
                        {
                            id: this.name + "saveButton",
                            tooltip: i18next.t('viewer_components_merge_7'),
                            text: i18next.t('viewer_components_merge_8'),
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
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, this.layerSelectorInit, this);
    },
    layerSelectorInit: function() {
        if(this.layerSelector.getVisibleLayerCount() === 1) {
            this.layerSelector.selectFirstLayer();
        }
    },
    layerChanged: function (appLayer, previousAppLayer, scope) {
        this.appLayer = appLayer;

        Ext.getCmp(this.name + "selectAButton").setDisabled(true);
        Ext.getCmp(this.name + "selectBButton").setDisabled(true);
        this.mode = null;
        this.geometryEditable = false;

        if (appLayer != null) {
            this.maincontainer.setLoading("Laadt attributen...");
            this.loadAttributes(appLayer);
        } else {
            this.cancel();
        }
    },
    loadAttributes: function (appLayer) {
        this.appLayer = appLayer;
        var me = this;
        if (this.appLayer != null) {
            this.featureService = this.config.viewerController.getAppLayerFeatureService(this.appLayer);
            // check if featuretype was loaded
            if (this.appLayer.attributes == undefined) {
                this.featureService.loadAttributes(me.appLayer, function (attributes) {
                    me.initMerge(me.appLayer);
                    me.maincontainer.setLoading(false);
                });
            } else {
                this.initMerge(me.appLayer);
                this.maincontainer.setLoading(false);
            }
        } else {
            this.cancel();
        }
    },
    initMerge: function(appLayer) {
        if (appLayer.geometryAttributeIndex != undefined) {
            this.geometryEditable = appLayer.attributes[appLayer.geometryAttributeIndex].editable;
            if (appLayer.attributes[appLayer.geometryAttributeIndex].userAllowedToEditGeom !== undefined) {
                this.geometryEditable = appLayer.attributes[appLayer.geometryAttributeIndex].userAllowedToEditGeom;
            }
            if (this.vectorLayer) {
                this.vectorLayer.removeAllFeatures();
            }
            this.mode = null;
            this.config.viewerController.mapComponent.getMap().removeMarker("edit");


            Ext.getCmp(this.name + "selectAButton").setDisabled(false);
            Ext.getCmp(this.name + "selectBButton").setDisabled(true);

            Ext.getCmp(this.name + "geomLabel").setText("Selecteer " + this.labelA + " en " + this.labelB + " geometrie");
        } else {
            Ext.getCmp(this.name + "geomLabel").setText('Geometrie mag niet bewerkt worden.');
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
                var color = (this.mode === "selectA") ? "FF0000" : "00FF00";
                this.vectorLayer.style.fillcolor = color;
                this.vectorLayer.adjustStyle();
                var feat = Ext.create("viewer.viewercontroller.controller.Feature", {
                    wktgeom: wkt,
                    id: feature.__fid,
                    label: (this.mode === "selectA") ? this.labelA : this.labelB
                });
                this.vectorLayer.addFeature(feat);
            }
        }
        this.showMobilePopup();
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
        var appLayer = this.layerSelector.getValue();
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
