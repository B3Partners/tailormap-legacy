/*
 * Copyright (C) 2012-2015 B3Partners B.V.
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
 * Edit component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.Edit", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    inputContainer: null,
    showGeomType: null,
    newGeomType: null,
    mode: null,
    layerSelector: null,
    toolMapClick: null,
    editingLayer: null,
    currentFID: null,
    geometryEditable: null,
    deActivatedTools: [],
    config: {
        title: "",
        iconUrl: "",
        tooltip: "",
        layers: null,
        label: "",
        allowDelete: false
    },
    constructor: function (conf) {
        viewer.components.Edit.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;

        Ext.mixin.Observable.capture(this.config.viewerController.mapComponent.getMap(), function (event) {
            if (event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO
                    || event == viewer.viewercontroller.controller.Event.ON_MAPTIP) {
                if (me.mode == "new" || me.mode == "edit" || me.mode == "delete") {
                    return false;
                }
            }
            return true;
        });

        if (this.config.layers != null) {
            this.config.layers = Ext.Array.filter(this.config.layers, function (layerId) {
                // XXX must check editAuthorized in appLayer
                // cannot get that from this layerId
                return true;
            });
        }
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
        return this;
    },
    selectedContentChanged: function () {
        if (this.vectorLayer == null) {
            this.createVectorLayer();
        } else {
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },
    createVectorLayer: function () {
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes: ["Circle", "Polygon", "MultiPolygon", "Point", "LineString"],
            showmeasures: false,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50
            }
        });
        this.config.viewerController.registerSnappingLayer(this.vectorLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    showWindow: function () {
        if (this.vectorLayer == null) {
            this.createVectorLayer();
        }
        this.layerSelector.initLayers();
        this.popup.popupWin.setTitle(this.config.title);
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
                    items: [{
                            xtype: 'button',
                            id: this.name + "newButton",
                            disabled: true,
                            tooltip: "Nieuw",
                            text: "Nieuw",
                            componentCls: 'mobileLarge',
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.createNew
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            id: this.name + "editButton",
                            tooltip: "Bewerk",
                            componentCls: 'mobileLarge',
                            disabled: true,
                            text: "Bewerk",
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.edit
                                }
                            }
                        },
                        {
                            xtype: 'button',
                            id: this.name + "deleteButton",
                            tooltip: "Verwijder",
                            componentCls: 'mobileLarge',
                            disabled: true,
                            text: "Verwijder",
                            listeners: {
                                click: {
                                    scope: me,
                                    fn: me.deleteFeature
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
                    width: '100%',
                    flex: 1
                }, {
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
                            tooltip: "Opslaan",
                            text: "Opslaan",
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

        if (!this.config.allowDelete) {
            Ext.getCmp(this.name + "deleteButton").destroy();
        }

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
    },
    layerChanged: function (appLayer, previousAppLayer, scope, afterLoadAttributes) {
        if (appLayer != null) {
            this.vectorLayer.removeAllFeatures();
            this.mode = null;
            this.config.viewerController.mapComponent.getMap().removeMarker("edit");
            if (appLayer.details && appLayer.details["editfunction.title"]) {
                this.popup.popupWin.setTitle(appLayer.details["editfunction.title"]);
            }
            this.inputContainer.setLoading("Laadt attributen...");
            this.inputContainer.removeAll();
            this.loadAttributes(appLayer, previousAppLayer, scope, afterLoadAttributes);
            this.inputContainer.setLoading(false);
        } else {
            this.cancel();
        }
    },
    loadAttributes: function (appLayer, previousAppLayer, scope, afterLoadAttributes) {
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
                    if (afterLoadAttributes) {
                        afterLoadAttributes.call(scope);
                    }
                });
            } else {
                this.initAttributeInputs(me.appLayer);
                if (afterLoadAttributes) {
                    afterLoadAttributes.call(scope);
                }
            }
        }
    },
    initAttributeInputs: function (appLayer) {
        var attributes = appLayer.attributes;
        var type = "geometry";
        if (appLayer.geometryAttributeIndex != undefined || appLayer.geometryAttributeIndex != null) {
            var geomAttribute = appLayer.attributes[appLayer.geometryAttributeIndex];
            if (geomAttribute.editValues != undefined && geomAttribute.editValues != null && geomAttribute.editValues.length >= 1) {
                type = geomAttribute.editValues[0];
            } else {
                type = geomAttribute.type;
            }
            this.geometryEditable = appLayer.attributes[appLayer.geometryAttributeIndex].editable;
        } else {
            this.geometryEditable = false;
        }
        this.showGeomType = type;
        var possible = true;
        var tekst = "";
        var tekstGeom = "";
        switch (type) {
            case "multipolygon":
                this.showGeomType = "MultiPolygon";
                this.newGeomType = "Polygon";
                tekstGeom = "vlak";
                break;
            case "polygon":
                this.showGeomType = "Polygon";
                this.newGeomType = "Polygon";
                tekstGeom = "vlak";
                break;
            case "multipoint":
            case "point":
                this.showGeomType = "Point";
                this.newGeomType = "Point";
                tekstGeom = "punt";
                break;
            case "multilinestring":
            case "linestring":
                this.showGeomType = "LineString";
                this.newGeomType = "LineString";
                tekstGeom = "lijn";
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
                Ext.getCmp(this.name + "editButton").setDisabled(false);
                if (this.config.allowDelete) {
                    Ext.getCmp(this.name + "deleteButton").setDisabled(false);
                }
                if (this.newGeomType == null) {
                    tekst = "Geometrie mag alleen bewerkt worden";
                } else {
                    Ext.getCmp(this.name + "newButton").setDisabled(false);
                    tekst = 'Bewerk een ' + tekstGeom + " op de kaart";
                    if (this.config.allowDelete) {
                        tekst = 'Verwijder een ' + tekstGeom + " uit de kaart";
                    }
                }
            } else {
                tekst = 'Geometrie mag niet bewerkt worden.';
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
                            disabled: !allowedEditable
                        };
                        if (attribute.editHeight) {
                            options.rows = attribute.editHeight;
                            input = Ext.create("Ext.form.field.TextArea", options);
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
                            disabled: !allowedEditable
                        });
                    }
                    this.inputContainer.add(input);
                    Ext.getCmp(this.name + "editButton").setDisabled(false);
                }
            }
        } else {
            gl.setText("Geometrietype onbekend. Bewerken niet mogelijk.");
            Ext.getCmp(this.name + "editButton").setDisabled(true);
            Ext.getCmp(this.name + "newButton").setDisabled(true);
            if (this.config.allowDelete) {
                Ext.getCmp(this.name + "deleteButton").setDisabled(true);
            }
        }
    },
    setInputPanel: function (feature) {
        this.inputContainer.getForm().setValues(feature);
    },
    mapClicked: function (toolMapClick, comp) {
        this.deactivateMapClick();
        Ext.get(this.getContentDiv()).mask("Haalt features op...");
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
            me.failed(msg);
        });
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
            }
        }
        Ext.get(this.getContentDiv()).unmask();
    },
    failed: function (msg) {
        Ext.Msg.alert('Mislukt', msg);
        Ext.get(this.getContentDiv()).unmask();
    },
    createNew: function () {
        this.vectorLayer.removeAllFeatures();
        this.inputContainer.getForm().reset();
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.mode = "new";
        if (this.newGeomType != null && this.geometryEditable) {
            this.vectorLayer.drawFeature(this.newGeomType);
        }
    },
    edit: function () {
        this.vectorLayer.removeAllFeatures();
        this.mode = "edit";
        this.activateMapClick();
    },
    deleteFeature: function () {
        if (this.config.allowDelete) {
            this.vectorLayer.removeAllFeatures();
            this.mode = "delete";
            this.activateMapClick();
            Ext.getCmp(this.name + "saveButton").setText("Verwijderen");
        }
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
    save: function () {
        if (this.mode === "delete") {
            this.remove();
            return;
        }

        var feature = this.inputContainer.getValues();

        if (this.geometryEditable) {
            if (this.vectorLayer.getActiveFeature()) {
                var wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
                feature[this.appLayer.geometryAttribute] = wkt;
            }
        }
        if (this.mode == "edit") {
            feature.__fid = this.currentFID;
        }
        var me = this;
        try {
            feature = this.changeFeatureBeforeSave(feature);
        } catch (e) {
            me.failed(e);
            return;
        }

        me.editingLayer = this.config.viewerController.getLayer(this.layerSelector.getValue());
        Ext.create("viewer.EditFeature", {
            viewerController: this.config.viewerController
        }).edit(
                me.editingLayer,
                feature,
                function (fid) {
                    me.saveSucces(fid);
                }, function (error) {
            me.failed(error);
        });
    },
    remove: function () {
        if (!this.config.allowDelete || !this.geometryEditable) {
            Ext.Msg.alert('Mislukt', "Verwijderen is niet toegestaan.");
            return;
        }

        var feature = this.inputContainer.getValues();
        feature.__fid = this.currentFID;

        var me = this;
        try {
            feature = this.changeFeatureBeforeSave(feature);
        } catch (e) {
            me.failed(e);
            return;
        }
        me.editingLayer = this.config.viewerController.getLayer(this.layerSelector.getValue());
        Ext.create("viewer.EditFeature", {
            viewerController: this.config.viewerController
        }).remove(
                me.editingLayer,
                feature,
                function (fid) {
                    me.deleteSucces();
                }, function (error) {
            me.failed(error);
        });
    },
    /**
     * Can be overwritten to add some extra feature attributes before saving the
     * feature.
     * @return the changed feature
     */
    changeFeatureBeforeSave: function (feature) {
        return feature;
    },
    /**
     * Can be overwritten to disable editing in the component/js
     */
    allowedEditable: function (attribute) {
        return true;
    },
    saveSucces: function (fid) {
        this.editingLayer.reload();
        this.currentFID = fid;
        Ext.Msg.alert('Gelukt', "Het feature is aangepast.");
        this.cancel();
    },
    deleteSucces: function () {
        this.editingLayer.reload();
        this.currentFID = null;
        Ext.Msg.alert('Gelukt', "Het feature is verwijderd.");
        this.cancel();
    },
    saveFailed: function (msg) {
        Ext.Msg.alert('Mislukt', msg);
    },
    cancel: function () {
        this.resetForm();
        this.popup.hide();
    },
    resetForm: function () {
        Ext.getCmp(this.name + "editButton").setDisabled(true);
        Ext.getCmp(this.name + "newButton").setDisabled(true);
        if (this.config.allowDelete) {
            Ext.getCmp(this.name + "deleteButton").setDisabled(true);
        }
        Ext.getCmp(this.name + "saveButton").setText("Opslaan");
        this.mode = null;
        this.layerSelector.combobox.select(null);
        Ext.getCmp(this.name + "geomLabel").setText("");
        this.inputContainer.removeAll();
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.removeAllFeatures();
    },
    getExtComponents: function () {
        return [this.maincontainer.getId()];
    },
    createFeaturesGrid: function (features) {
        var appLayer = this.layerSelector.getSelectedAppLayer();
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
                            text: "Bewerk geselecteerd feature",
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
                            text: "Annuleren",
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
            title: "Kies één feature",
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
    cancelSelectFeature: function () {
        this.resetForm();
        Ext.get(this.getContentDiv()).unmask();
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
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
            if (attributes[i].name === appLayer.geometryAttribute) {
                // if the editing of the geometry attribute is disabled at
                // the layer level skip a level in the conversion map
                if (!this.geometryEditable) {
                    index++;
                }
            }
            if (attributes[i].editable) {
                map["c" + index] = attributes[i].name;
                index++;
            }
        }
        return map;
    }
});
