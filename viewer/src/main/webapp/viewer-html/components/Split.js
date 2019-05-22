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
/* global contextPath, Ext, i18next */

/**
 * Split component.
 *
 * @todo bevat duplicate code uit Edit.js mogelijk een nieuwe superklasse
 * definieren die gezamelijke functies bevat.
 *
 * @author markprins@b3partners.nl
 */
Ext.define("viewer.components.Split", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    drawLayer: null,
    inputContainer: null,
    showGeomType: null,
    newGeomType: null,
    mode: null,
    layerSelector: null,
    toolMapClick: null,
    currentFID: null,
    geometryEditable: null,
    deActivatedTools: [],
    /** feature used for splitting. */
    splitFeature: null,
    /** feature to split. */
    toSplitFeature: null,
    config: {
        actionbeanUrl: "/viewer/action/feature/split",
        strategy: "replace",
        title: "",
        iconUrl: "",
        layers: null,
        label: "",
        cancelOtherControls: ["viewer.components.Edit", "viewer.components.Merge"],
        details: {
            minWidth: 400,
            minHeight: 250
        }
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.Split.superclass.constructor.call(this, this.config);
        this.config.actionbeanUrl = contextPath + '/action/feature/split';
        var me = this;
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,
                function (event) {
                    if (me.mode === "split" || me.mode === "select") {
                        return false;
                    }
                    return true;
                });
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_MAPTIP,
                function (event) {
                    if (me.mode === "split" || me.mode === "select") {
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
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.selectedContentChanged, this);

        this.popup.addListener('hide', this.cancel, this);
        return this;
    },
    selectedContentChanged: function () {
        if (this.vectorLayer === null) {
            this.createVectorLayer();
        } else {
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
        if (this.drawLayer === null) {
            this.createDrawVectorLayer();
        } else {
            this.config.viewerController.mapComponent.getMap().addLayer(this.drawLayer);
        }
        Ext.getCmp(this.name + "selectButton").setDisabled(false);
    },
    /**
     * create edit layer
     */
    createVectorLayer: function () {
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes: ["Circle", "Polygon", "MultiPolygon", "LineString"],
            showmeasures: false,
            editable: false,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50
            }
        });
        this.vectorLayer.addListener(
                viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,
                this.toSplitFeatureAdded,
                this);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    /**
     * create drawing layer
     */
    createDrawVectorLayer: function () {
        this.drawLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'drawVectorLayer',
            geometrytypes: ["LineString"],
            showmeasures: false,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF00FF",
                strokeopacity: 50
            }
        });
        this.drawLayer.addListener(
                viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,
                this.splitFeatureAdded,
                this);
        this.config.viewerController.registerSnappingLayer(this.drawLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.drawLayer);
    },
    toSplitFeatureAdded: function (vecLayer, feature) {
        Ext.getCmp(this.name + "drawButton").setDisabled(false);
        Ext.getCmp(this.name + "selectButton").setDisabled(true);
        Ext.getCmp(this.name + "geomLabel").setText(i18next.t('viewer_components_split_0'));
        this.showMobilePopup();
    },
    splitFeatureAdded: function (vecLayer, feature) {
        this.splitFeature = feature;
        Ext.getCmp(this.name + "drawButton").setDisabled(true);
        Ext.getCmp(this.name + "selectButton").setDisabled(true);
        Ext.getCmp(this.name + "geomLabel").setText("");
        this.showMobilePopup();
    },
    showWindow: function () {
        if (this.vectorLayer == null) {
            this.createVectorLayer();
        }
        if (this.drawLayer == null) {
            this.createDrawVectorLayer();
        }
        this.layerSelector.initLayers();
        this.popup.popupWin.setTitle(this.config.title);
        this.config.viewerController.deactivateControls(this.config.cancelOtherControls);
        this.popup.show();
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
                align: "stretch"
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
                            id: this.name + "selectButton",
                            disabled: true,
                            tooltip: i18next.t('viewer_components_split_1'),
                            text: i18next.t('viewer_components_split_2'),
                                        listeners: {
                                click: {
                                    scope: me,
                                    fn: me.select
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            id: this.name + "drawButton",
                            disabled: true,
                            tooltip: i18next.t('viewer_components_split_3'),
                            text: i18next.t('viewer_components_split_4'),
                                        listeners: {
                                click: {
                                    scope: me,
                                    fn: me.splitLijn
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
                    id: this.name + 'InputPanel',
                    border: 0,
                    xtype: "form",
                    autoScroll: true,
                    flex: 1
                }, {
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
                            tooltip: i18next.t('viewer_components_split_5'),
                            text: i18next.t('viewer_components_split_6'),
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.cancel
                                }
                            }
                        },
                        {
                            id: this.name + "saveButton",
                            tooltip: i18next.t('viewer_components_split_7'),
                            text: i18next.t('viewer_components_split_8'),
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
        this.inputContainer = Ext.getCmp(this.name + 'InputPanel');
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
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE, this.layerChanged, this);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, this.layerSelectorInit, this);
    },
    layerSelectorInit: function() {
        if(this.layerSelector.getVisibleLayerCount() === 1) {
            this.layerSelector.selectFirstLayer();
        }
    },
    layerChanged: function (appLayer, previousAppLayer, scope) {
        if (appLayer != null) {
            if (this.vectorLayer) {
                this.vectorLayer.removeAllFeatures();
            }
            this.mode = null;
            this.config.viewerController.mapComponent.getMap().removeMarker("edit");
            if (appLayer.details && appLayer.details["editfunction.title"]) {
                this.popup.popupWin.setTitle(appLayer.details["editfunction.title"]);
            }
            this.inputContainer.setLoading(i18next.t('viewer_components_split_9'));
            this.inputContainer.removeAll();
            this.loadAttributes(appLayer, previousAppLayer, scope);
            this.inputContainer.setLoading(false);
        } else {
            this.cancel();
        }
    },
    loadAttributes: function (appLayer, previousAppLayer, scope) {
        this.appLayer = appLayer;

        var me = this;
        if (scope == undefined) {
            scope = me;
        }
        if (this.appLayer != null) {

            this.featureService = this.config.viewerController.getAppLayerFeatureService(this.appLayer);

            // check if featuretype was loaded
            if (this.appLayer.attributes == undefined) {
                this.featureService.loadAttributes(me.appLayer, function (attributes) {
                    me.initAttributeInputs(me.appLayer);
                });
            } else {
                this.initAttributeInputs(me.appLayer);
            }
        }
    },
    initAttributeInputs: function (appLayer) {
        var attributes = appLayer.attributes;
        var type = "geometry";
        if (appLayer.geometryAttributeIndex != undefined || appLayer.geometryAttributeIndex != null) {
            var geomAttribute = appLayer.attributes[appLayer.geometryAttributeIndex];
            if (geomAttribute.editValues != undefined && geomAttribute.editValues != null && geomAttribute.editValues.length >= 1) {
                type = geomAttribute.editValues[0]
            } else {
                type = geomAttribute.type;
            }
            this.geometryEditable = appLayer.attributes[appLayer.geometryAttributeIndex].editable;
            if (geomAttribute.userAllowedToEditGeom !== undefined) {
                this.geometryEditable = geomAttribute.userAllowedToEditGeom;
            }
        } else {
            this.geometryEditable = false;
        }
        this.showGeomType = type;
        var possible = true;
        var tekst = "";
        switch (type) {
            case "multipolygon":
                this.showGeomType = "MultiPolygon";
                this.newGeomType = "Polygon";
                tekst = i18next.t('viewer_components_split_10');
                break;
            case "polygon":
                this.showGeomType = "Polygon";
                this.newGeomType = "Polygon";
                tekst = i18next.t('viewer_components_split_11');
                break;
            case "multilinestring":
            case "linestring":
                this.showGeomType = "LineString";
                this.newGeomType = "LineString";
                tekst = i18next.t('viewer_components_split_12');
                break;
            case "geometry":
                possible = true;
                this.newGeomType = null;
                break;
            default:
                this.newGeomType = null;
                possible = false;
                break;
        }

        var gl = Ext.getCmp(this.name + "geomLabel");
        if (possible) {
            if (this.geometryEditable) {
                if (this.newGeomType == null) {
                    tekst = i18next.t('viewer_components_split_13');
                } else {
                    Ext.getCmp(this.name + "selectButton").setDisabled(false);
                    tekst = i18next.t('viewer_components_split_14', {type: tekst});
                }
            } else {
                tekst = i18next.t('viewer_components_split_15');
            }
            gl.setText(tekst);
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                if (attribute.editable) {
                    var allowedEditable = this.allowedEditable(attribute);
                    var values = Ext.clone(attribute.editValues);
                    var input = null;
                    if (i == appLayer.geometryAttributeIndex) {
                        continue;
                    }
                    if (values == undefined || values.length == 1) {
                        var fieldText = "";
                        if (values != undefined) {
                            fieldText = values[0];
                        }
                        var options = {
                            name: attribute.name,
                            fieldLabel: attribute.editAlias || attribute.name,
                            renderTo: this.name + 'InputPanel',
                            value: fieldText,
                            disabled: true
                        };
                        if (attribute.editHeight) {
                            options.rows = attribute.editHeight;
                            input = Ext.create("Ext.form.field.TextArea", options)
                        } else {
                            input = Ext.create("Ext.form.field.Text", options);
                        }
                    } else if (values.length > 1) {
                        var allBoolean = true;
                        for (var v = 0; v < values.length; v++) {

                            var hasLabel = values[v].indexOf(":") !== -1;
                            var val = hasLabel ? values[v].substring(0, values[v].indexOf(":")) : values[v];
                            if (val.toLowerCase() !== "true" && val.toLowerCase() !== "false") {
                                allBoolean = false;
                                break;
                            }
                        }

                        Ext.each(values, function (value, index, original) {
                            var hasLabel = value.indexOf(":") !== -1;
                            var label = value;
                            if (hasLabel) {
                                label = value.substring(value.indexOf(":") + 1);
                                value = value.substring(0, value.indexOf(":"));
                            }

                            if (allBoolean) {
                                value = value.toLowerCase() === "true";
                            }
                            original[index] = {
                                id: value,
                                label: label
                            };
                        });
                        var valueStore = Ext.create('Ext.data.Store', {
                            fields: ['id', 'label'],
                            data: values
                        });
                        input = Ext.create('Ext.form.ComboBox', {
                            fieldLabel: attribute.editAlias || attribute.name,
                            store: valueStore,
                            queryMode: 'local',
                            displayField: 'label',
                            name: attribute.name,
                            renderTo: this.name + 'InputPanel',
                            valueField: 'id',
                            disabled: true
                        });
                    }
                    this.inputContainer.add(input);
                }
            }
        } else {
            gl.setText(i18next.t('viewer_components_split_16'));
            Ext.getCmp(this.name + "selectButton").setDisabled(true);
        }
    },
    mapClicked: function (toolMapClick, comp) {
        this.deactivateMapClick();
        Ext.get(this.getContentDiv()).mask(i18next.t('viewer_components_split_17'))
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
            me.failed(msg);
        });
    },
    splitLijn: function () {
        this.drawLayer.removeAllFeatures();
        this.mode = "split";
        this.hideMobilePopup();
        if (this.newGeomType != null && this.geometryEditable) {
            this.drawLayer.drawFeature("LineString");
        }
    },
    activateMapClick: function () {
        if (Array.isArray(this.deActivatedTools) && this.deActivatedTools.length === 0) {
            this.deActivatedTools = this.config.viewerController.mapComponent.deactivateTools();
        }
        this.toolMapClick.activateTool();
    },
    deactivateMapClick: function () {
        for (var i = 0; i < this.deActivatedTools.length; i++) {
            this.deActivatedTools[i].activate();
        }
        this.deActivatedTools = [];
        this.toolMapClick.deactivateTool();
    },
    save: function () {
        this.splitFeature = this.drawLayer.getActiveFeature();

        var options = {
            splitFeatureFID: this.currentFID,
            toSplitWithFeature: this.splitFeature.config.wktgeom,
            strategy: this.config.strategy,
            appLayer: this.layerSelector.getValue().id,
            application: this.config.viewerController.app.id
        };
        var extraData = this.getExtraData();
        if (extraData !== null) {
            options.extraData = extraData;
        }
        this.split(options, this.saveSucces, this.saveFailed);

    },
    split: function (options, successFunction, failureFunction) {
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
                    failureFunction(i18next.t('viewer_components_split_18') + result.status + " " + result.statusText + ": " + result.responseText, this);
                }
            }});
    },
    featuresReceived: function (features) {
        if (features.length == 1) {
            var feat = this.indexFeatureToNamedFeature(features[0]);
            this.handleFeature(feat);
        } else if (features.length == 0) {
            this.handleFeature(null);
        } else {
            // Handel meerdere features af.
            this.createFeaturesGrid(features);
        }
    },
    handleFeature: function (feature) {
        if (feature != null) {
            this.inputContainer.getForm().setValues(feature);
            this.currentFID = feature.__fid;
            if (this.geometryEditable) {
                var wkt = feature[this.appLayer.geometryAttribute];
                var feat = Ext.create("viewer.viewercontroller.controller.Feature", {
                    wktgeom: wkt,
                    id: "T_0"
                });
                this.vectorLayer.addFeature(feat);
                this.toSplitFeature = feat;
            }
        }
        this.showMobilePopup();
        Ext.get(this.getContentDiv()).unmask();
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
    /**
     * Can be overridden to disable editing in the component/js
     */
    allowedEditable: function (attribute) {
        return true;
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
    saveSucces: function (response, me) {
        me.config.viewerController.getLayer(me.layerSelector.getValue()).reload();
        Ext.MessageBox.alert(i18next.t('viewer_components_split_19'), i18next.t('viewer_components_split_20'));
        me.cancel();
    },
    saveFailed: function (msg, me) {
        Ext.Msg.alert(i18next.t('viewer_components_split_21'), msg);
        me.cancel();
    },
    cancel: function () {
        this.resetForm();
        this.popup.hide();
    },
    resetForm: function () {
        Ext.getCmp(this.name + "drawButton").setDisabled(true);
        Ext.getCmp(this.name + "selectButton").setDisabled(true);
        this.mode = null;
        this.layerSelector.clearSelection();
        Ext.getCmp(this.name + "geomLabel").setText("");
        this.inputContainer.removeAll();
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        // vector layers may be null when cancel() is called
        if (this.vectorLayer) {
            this.vectorLayer.removeAllFeatures();
        }
        if (this.drawLayer) {
            this.drawLayer.removeAllFeatures();
            this.config.viewerController.mapComponent.getMap().removeLayer(this.drawLayer);
            this.drawLayer = null;
        }
    },
    getExtComponents: function () {
        return [this.maincontainer.getId()];
    },
    createFeaturesGrid: function (features) {
        var appLayer = this.layerSelector.getValue();
        var attributes = appLayer.attributes;
        var index = 0;
        var attributeList = new Array();
        var columns = new Array();
        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (attribute.editable) {

                var attIndex = index++;
                if (i == appLayer.geometryAttributeIndex) {
                    continue;
                }
                var colName = attribute.alias != undefined ? attribute.alias : attribute.name;
                attributeList.push({
                    name: "c" + attIndex,
                    type: 'string'
                });
                columns.push({
                    id: "c" + attIndex,
                    text: colName,
                    dataIndex: "c" + attIndex,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }

        Ext.define(this.name + 'Model', {
            extend: 'Ext.data.Model',
            fields: attributeList
        });
        var store = Ext.create('Ext.data.Store', {
            pageSize: 10,
            model: this.name + 'Model',
            data: features
        });
        var me = this;
        var grid = Ext.create('Ext.grid.Panel', {
            id: this.name + 'GridFeaturesWindow',
            store: store,
            columns: columns,
            listeners: {
                itemdblclick: {
                    scope: me,
                    fn: me.itemDoubleClick
                }
            }
        });
        var container = Ext.create("Ext.container.Container", {
            id: this.name + "GridContainerFeaturesWindow",
            width: "100%",
            height: "100%",
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    id: this.name + 'GridPanelFeaturesWindow',
                    xtype: "container",
                    autoScroll: true,
                    width: '100%',
                    flex: 1,
                    items: [grid]
                }, {
                    id: this.name + 'ButtonPanelFeaturesWindow',
                    xtype: "container",
                    width: '100%',
                    height: 30,
                    items: [{
                            xtype: "button",
                            id: this.name + "SelectFeatureButtonFeaturesWindow",
                            text: i18next.t('viewer_components_split_22'),
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.selectFeature
                                }
                            }
                        },
                        {
                            xtype: "button",
                            id: this.name + "CancelFeatureButtonFeaturesWindow",
                            text: i18next.t('viewer_components_split_23'),
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.cancelSelectFeature
                                }
                            }
                        }]
                }
            ]
        });
        var window = Ext.create("Ext.window.Window", {
            id: this.name + "FeaturesWindow",
            width: 500,
            height: 300,
            layout: 'fit',
            title: i18next.t('viewer_components_split_24'),
            items: [container]
        });
        window.show();
    },
    itemDoubleClick: function (gridview, row) {
        this.featuresReceived([row.data]);
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
    },
    selectFeature: function () {
        var grid = Ext.getCmp(this.name + 'GridFeaturesWindow');
        var selection = grid.getSelectionModel().getSelection()[0];
        var feature = selection.data;
        this.featuresReceived([feature]);
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
    },
    select: function () {
        this.vectorLayer.removeAllFeatures();
        this.mode = "select";
        this.activateMapClick();
        this.hideMobilePopup();
    },
    cancelSelectFeature: function () {
        this.resetForm();
        Ext.get(this.getContentDiv()).unmask();
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
        this.showMobilePopup();
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
