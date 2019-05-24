/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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
/* global Ext, viewer, i18next, actionBeans, FlamingoAppLoader, Proj4js */

/**
 * Edit component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author mprins
 */
Ext.define("viewer.components.Edit", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    inputContainer: null,
    geomlabel: null,
    savebutton: null,
    pixelTolerance:0,
    showGeomType: null,
    newGeomType: null,
    tekstGeom: 'feature',
    mode: null,
    layerSelector: null,
    toolMapClick: null,
    editingLayer: null,
    currentFID: null,
    geometryEditable: null,
    deActivatedTools: [],
    schema: null,
    editLinkInFeatureInfoCreated: false,
    afterLoadAttributes: null,
    filterFeatureId: null,
    lastUsedValues:null,
    // Boolean to check if window is hidden temporarily for mobile mode
    mobileHide: false,
    config: {
        title: "",
        iconUrl: "",
        tooltip: "",
        layers: null,
        label: "",
        clickRadius: 4,
        allowDelete: false,
        allowCopy: false,
        allowNew: true,
        allowEdit: true,
        cancelOtherControls: ["viewer.components.Merge", "viewer.components.Split"],
        formLayout: 'anchor',
        showEditLinkInFeatureInfo: false,
        editHelpText: "",
        isPopup: true,
        rememberValuesInSession:false,
        showSplitButton:false,
        showMergeButton:false,
        showSnappingButton:false,
        details: {
            minWidth: 400,
            minHeight: 250,
            useExtLayout: true
        }
    },
    editLblClass: 'editCmpLbl',
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.Edit.superclass.constructor.call(this, this.config);
        var me = this;

        Ext.mixin.Observable.capture(this.config.viewerController.mapComponent.getMap(), function (event) {
            if (event === viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO
                    || event === viewer.viewercontroller.controller.Event.ON_MAPTIP) {
                if (me.mode === "new" || me.mode === "edit" || me.mode === "delete" || me.mode === "copy") {
                    return false;
                }
            }
            return true;
        });

        if (this.config.layers !== null) {
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
            handlerOptions: {pixelTolerance:me.pixelTolerance},
            handler: {
                fn: this.mapClicked,
                scope: this
            },
            viewerController: this.config.viewerController
        });
        this.schema = new Ext.data.schema.Schema();
        this.lastUsedValues = {};        
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,this.loadWindow,this);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.selectedContentChanged, this);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,this.createVectorLayerTimeout, this);
        
        return this;
    },
    createVectorLayerTimeout: function () {
        setTimeout(this.createVectorLayer.bind(this),0);
    },
    createVectorLayer: function () {
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes: ["Circle", "Polygon", "MultiPolygon", "Point", "LineString"],
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
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED, function () {
            this.showAndFocusForm();
        }, this);
        this.config.viewerController.registerSnappingLayer(this.vectorLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    showWindow: function () {
        if (this.vectorLayer === null) {
           this.createVectorLayer();
        }
        this.mobileHide = false;
        this.layerSelector.initLayers();
        if(this.config.isPopup) {
            this.popup.popupWin.setTitle(this.config.title);
        }
        this.config.viewerController.deactivateControls(this.config.cancelOtherControls);
        this.setFormVisible(false);
        this.untoggleButtons();
        var buttons = this.maincontainer.down("#buttonPanel").query("button");
        if (buttons.length === 1 && !buttons[0].isDisabled() && !viewer.components.MobileManager.isMobile()) {
            buttons[0].fireEvent("click", buttons[0]);
        }
        if(this.config.isPopup) {
            this.popup.show();
            this.popup.popupWin.addListener('hide', function () {
                this.cancel();
            }.bind(this));
        }
    },
    loadWindow: function () {
        this.maincontainer = Ext.create(!this.config.isPopup ? 'Ext.panel.Panel' : 'Ext.container.Container', {
            id: this.name + 'Container',
            title: this.getPanelTitle(),
            style: {
                backgroundColor: 'White'
            },
            padding: 10,
            items: [
                {
                    xtype: 'container',
                    scrollable: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: this.getFormItems()
                }
            ],
            scrollable: true,
            layout: 'fit',
            tools: this.getHelpToolConfig()
        });
        this.getContentContainer().add(this.maincontainer);
        this.inputContainer = this.maincontainer.down('#inputPanel');
        this.geomlabel = this.maincontainer.down("#geomLabel");
        this.buttonPanel = this.maincontainer.down("#buttonPanel");
        this.savebutton = this.maincontainer.down("#saveButton");
        this.editHelpLabel = this.maincontainer.down("#editHelpLabel");
    },
    getFormItems: function() {
        this.createLayerSelector();
        var bottomButtons = this.copyDeleteButtons();
        bottomButtons.push(
            {
                itemId: "cancelButton",
                text: i18next.t('viewer_components_edit_0'),
                listeners: {
                    click: {
                        scope: this,
                        fn: this.cancel
                    }
                }
            },
            {
                itemId: "saveButton",
                text: i18next.t('viewer_components_edit_1'),
                listeners: {
                    click: {
                        scope: this,
                        fn: this.save
                    }
                }
            }
        );
        var formItems = [
            this.layerSelector.getLayerSelector(),
            {
                itemId: 'buttonPanel',
                xtype: "container",
                items: this.createEditButtons()
            },
            {
                itemId: 'externalButtonContainer',
                xtype: "container",
                items: this.createExternalButtons()
            },
            {
                itemId: "geomLabel",
                margin: '5 0',
                html: '',
                xtype: "container"
            },
            {
                itemId: "geomToggle",
                margin: '5 0',
                xtype: "container",
                hidden: true,
                items: [
                    {
                        html: i18next.t("viewer_components_edit_geomtoggle_label"),
                        xtype: "container",
                        margin: '0 0 5 0',
                    },
                    {
                        xtype: "segmentedbutton",
                        allowMultiple: false,
                        items: [{
                            itemId: "geomToggle_polygon",
                            text: i18next.t("viewer_components_edit_geomtoggle_polygon"),
                            tooltip: i18next.t("viewer_components_edit_geomtoggle_polygontooltip"),
                            pressed: true
                        },{
                            itemId: "geomToggle_circle",
                            text: i18next.t("viewer_components_edit_geomtoggle_circle"),
                            tooltip: i18next.t("viewer_components_edit_geomtoggle_circletooltip")
                        }],
                        listeners: {
                            toggle: function(container, button, pressed) {
                                if (button.getItemId() === "geomToggle_polygon") {
                                    this.newGeomType = "Polygon"
                                }
                                if (button.getItemId() === "geomToggle_circle") {
                                    this.newGeomType = "Circle"
                                }
                                this.vectorLayer.removeAllFeatures();
                                this.vectorLayer.drawFeature(this.newGeomType);
                            },
                            scope: this
                        }
                    }
                ]
            },
            {
                itemId: 'inputPanel',
                border: 0,
                xtype: "form",
                scrollable: true,
                flex: 1,
                layout: this.config.formLayout,
                hidden: true
            },
            {
                itemId: 'savePanel',
                xtype: "container",
                defaults: {
                    xtype: 'button'
                },
                items: bottomButtons,
                hidden: true
            }
        ];
        if(this.config.editHelpText) {
            formItems.splice(0, 0, {
                itemId: "editHelpLabel",
                margin: '0 0 10 0',
                html: this.config.editHelpText,
                xtype: "container"
            });
        }
        return formItems;
    },
    createEditButtons: function () {
        var buttons = [];
        if (this.config.allowNew) {
            buttons.push(this.createButton("newButton", i18next.t('viewer_components_edit_2'), this.createNew, true));
        }
        if (this.config.allowEdit) {
            buttons.push(this.createButton("editButton", i18next.t('viewer_components_edit_3'), this.edit, true));
        }
       
        return buttons;
    },
    createExternalButtons:function(){
        var buttons = [];
        
        var showSplit = this.config.viewerController.getComponentsByClassName("viewer.components.Split").length > 0 && this.config.showSplitButton;
        var showMerge = this.config.viewerController.getComponentsByClassName("viewer.components.Merge").length > 0 && this.config.showMergeButton;
        var showSnapping = this.config.viewerController.getComponentsByClassName("viewer.components.Snapping").length > 0 && this.config.showSnappingButton;
        if(showSplit){
            buttons.push(
                {xtype: 'button',itemId: 'splitButton',text: i18next.t('viewer_components_edit_46'),listeners: {click: {scope: this,
                    fn: function () {
                        var c = this.config.viewerController.getComponentsByClassName("viewer.components.Split");
                        if (c.length > 0) {
                            c[0].showWindow();
                        }
                    }}}
                });
        }
        if(showMerge){
            buttons.push(
             {xtype: 'button',itemId: 'mergeButton',text: i18next.t('viewer_components_edit_47'),listeners: {click: {scope: this,
                fn: function () {
                    var c = this.config.viewerController.getComponentsByClassName("viewer.components.Merge");
                    if (c.length > 0) {
                        c[0].showWindow();
                    }
                }}}
            });
        }
        if (showSnapping) {
            buttons.push({
                xtype: 'button',
                itemId: 'snappingButton',
                text: "Snapping aan",
                listeners: {
                    click: {
                        scope: this,
                        fn: function (btn) {
                            var c = this.config.viewerController.getComponentsByClassName("viewer.components.Snapping");
                            if (c.length > 0) {
                                if(btn.getText() === "Snapping aan"){
                                    c[0].enableAllLayers(true);
                                    btn.setText("Snapping uit");
                                }else{
                                    c[0].enableAllLayers(false);
                                    btn.setText("Snapping aan");
                                }
                            }
                        }
                    }
                }
            });
        }
        return buttons;
    },
    gpsLocation: null,
    gpsWindow:null,
    trace: null,
    currentPoint:null,
    prevMode:null,
    firstZoom:true,
    traceWindow: function () {
        this.trace = [];
        this.prevMode = this.mode;
        this.mode = "trace";
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        if (!this.gpswindow) {
            var me = this;
            var config = this.config;
            config.interval = 1000;
            config.hideButton = true;
            config.locationRetrieved = function(point){
                me.locationRetrieved(point);
            };
            this.gpsLocation = Ext.create("viewer.components.CurrentLocation", config);
            var items = [
                {
                    id: "lockTracepoint" + this.name,
                    xtype: "button",
                    text:  i18next.t('viewer_components_edit_trace_lockcoord_unlocked'),
                    enableToggle:true,
                    listeners: {
                        toggle: {
                            scope: this,
                            fn: function (btn,state) {
                                if(state){
                                    btn.setText(i18next.t(('viewer_components_edit_trace_lockcoord_locked')));
                                    me.gpsLocation.stopWatch(state);
                                }else{
                                    me.gpsLocation.startWatch();
                                    btn.setText(i18next.t(('viewer_components_edit_trace_lockcoord_unlocked')));
                                }
                            }
                        }
                    }
                },
                {
                    xtype: "button",
                    text:  i18next.t('viewer_components_edit_trace_selectcoord'),
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.usePointForTrace
                        }
                    }
                },{
                    xtype: "button",
                    text:  i18next.t('viewer_components_edit_trace_resetcoord'),
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.resetTrace
                        }
                    }
                },{
                    xtype: "button",
                    text: i18next.t('viewer_components_edit_trace_savecoord'),
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.traceFinished
                        }
                    }
                },{
                    xtype: "button",
                    text:i18next.t('viewer_components_edit_0'),
                    listeners: {
                        click: {
                            scope: this,
                            fn: function () {
                                this.resetTrace();
                                this.cancel();
                                this.maincontainer.setLoading(false);
                                this.gpswindow.hide();
                            }
                        }
                    }
                },
                {
                    xtype: "container",
                    name: "coordinates" + this.config.name,
                    itemId: "coordinates" + this.config.name,
                    html: "coords: 12.1, 16.6"
                }
            ];
            
            this.gpswindow = Ext.create("Ext.window.Window", {
                id: this.name + "gpsWindow",
                width: 330,
                height: 100,
                title: i18next.t('viewer_components_edit_trace_gpswindow_title'),
                items: items,
                closable:false,
                listeners: {
                    show:{
                        scope:this,
                        fn: this.resetTrace                        
                    }
                }
            });
        }
        if(this.popup){
            var pos = this.popup.getPosition();
            var x = this.popup.getWidth() + pos[0];
            var y = pos[1];
            this.gpswindow.setPosition(x,y);
        }
        this.vectorLayer.removeAllFeatures();
        this.gpswindow.show();
        this.gpsLocation.startWatch();
        this.maincontainer.setLoading(i18next.t('viewer_components_edit_trace_gpswindow_loadingmessage'));
    },
    resetTrace:function(){
        this.trace = [];
        this.gpsLocation.removeMarkers();
        this.vectorLayer.removeAllFeatures();
    },
    traceFinished: function(){
        this.gpswindow.hide();
        this.gpsLocation.stopWatch();
        this.maincontainer.setLoading(false);
        this.mode = this.prevMode;
        this.showAndFocusForm();
    },
    locationRetrieved:function(val){
        this.currentPoint = val;
        var dec = 10;
        var value = "x: " + Math.round(dec* val.x )/dec+ ", y:" + Math.round(val.y *dec ) /dec + ". " + i18next.t('viewer_components_edit_trace_accuracy') +": " + val.accuracy;
        this.gpswindow.getComponent("coordinatesedit1").setHtml(value);
        if(this.firstZoom){
            this.firstZoom = false;
            this.config.viewerController.mapComponent.getMap().zoomToResolution(3);
            this.config.viewerController.mapComponent.getMap().moveTo(val.x,val.y);
        }
    },
    usePointForTrace:function(){
        this.trace.push(this.currentPoint);
        
        var geom;
        if(this.trace.length === 1){
            geom = "POINT (" + this.trace[0].x + " " + this.trace[0].y + ")";
        }else{
            geom = "LINESTRING (";
            for(var i = 0 ; i < this.trace.length ; i++){
                var p = this.trace[i].x + " " + this.trace[i].y;
                geom += p;
                geom += ",";
            }
            geom = geom.substring(0, geom.length -2);
            geom += ")";
        }
        
        var feature = Ext.create("viewer.viewercontroller.controller.Feature", {wktgeom:geom});
        this.vectorLayer.removeAllFeatures();
        this.vectorLayer.addFeature(feature);
        this.gpsLocation.startWatch();
        var btn = Ext.getCmp("lockTracepoint" + this.name);
        btn.setText(i18next.t(('viewer_components_edit_trace_lockcoord_unlocked')));
                                
    },
    copyDeleteButtons: function() {
        var buttons = [];
        if (this.config.allowCopy) {
            buttons.push(this.createButton("copyButton", i18next.t('viewer_components_edit_4'), this.copy));
        }
        if (this.config.allowDelete) {
            buttons.push(this.createButton("deleteButton", i18next.t('viewer_components_edit_5'), this.deleteFeature));
        }
        return buttons;
    },
    createButton: function (itemid, label, fn, allowToggle) {
        return {
            xtype: 'button',
            itemId: itemid,
            componentCls: allowToggle ? 'button-toggle' : '',
            disabled: true,
            text: label,
            listeners: {
                click: {
                    scope: this,
                    fn: function (btn) {
                        if(allowToggle) {
                            btn.addCls("active-state");
                        }
                        fn.call(this);
                    }
                }
            }
        };
    },
    getButtonAllowed: function (itemid) {
        var configKey = {
            "newButton": this.config.allowNew,
            "copyButton": this.config.allowCopy,
            "editButton": this.config.allowEdit,
            "deleteButton": this.config.allowDelete
        };
        return configKey[itemid];
    },
    setButtonDisabled: function (itemid, disabled) {
        if (!this.getButtonAllowed(itemid)) {
            return;
        }
        var button = this.maincontainer.down("#" + itemid);
        if (button)
            button.setDisabled(disabled);
    },
    showAndFocusForm: function () {
        if(this.mode === null || this.mode === "trace") {
            return;
        }
        var buttons = this.maincontainer.down("#buttonPanel").query("button");
        if (buttons.length === 1) {
            this.buttonPanel.setVisible(false);
        }
        this.showMobilePopup();
        this.setFormVisible(true);
        this.toggleGeomToggleForm(false);
        var firstField = this.inputContainer.down("field");
        if(firstField) {
            firstField.focus();
        }
        this.geomlabel.setHtml("");
        this.untoggleButtons();
    },
    setFormVisible: function (visible) {
        this.inputContainer.setVisible(visible);
        this.maincontainer.down("#savePanel").setVisible(visible);
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
    layerSelectorInit: function (evt) {
        if (this.layerSelector.getVisibleLayerCount() === 1) {
            this.layerSelector.selectFirstLayer();
        }
        if (this.config.showEditLinkInFeatureInfo) {
            this.createFeatureInfoLink(evt.layers);
        }
        if(this.layerSelector.getVisibleLayerCount() > 1) {
            this.layerSelector.getLayerSelector().setVisible(true);
        } else {
            this.layerSelector.getLayerSelector().setVisible(false);
        }
    },
    createFeatureInfoLink: function (editableLayers) {
        if (this.editLinkInFeatureInfoCreated) {
            return;
        }
        var infoComponents = this.viewerController.getComponentsByClassNames(["viewer.components.FeatureInfo", "viewer.components.ExtendedFeatureInfo"]);
        var appLayers = [];
        Ext.each(editableLayers, function (record) {
            var appLayer = this.viewerController.getAppLayerById(record.id);
            if(appLayer){
                appLayers.push(appLayer);
            }
        }, this);
        for (var i = 0; i < infoComponents.length; i++) {
            infoComponents[i].registerExtraLink(
                    this,
                    function (feature, appLayer, coords) {
                        this.handleFeatureInfoLink(feature, appLayer, coords);
                    }.bind(this),
                    this.config.title || i18next.t('viewer_components_edit_6'),
                    appLayers
                    );
        }
        this.editLinkInFeatureInfoCreated = true;
    },
    handleFeatureInfoLink: function (feature, appLayer, coords) {
        // Show the window
        if(this.config.isPopup) {
            this.showWindow();
        }
        // Add event handler to get features for coordinates
        this.afterLoadAttributes = function () {
            this.afterLoadAttributes = null;
            this.filterFeatureId = feature.getAttribute('__fid');
            this.mode = "edit";
            this.config.viewerController.mapComponent.getMap().setMarker("edit", coords.x, coords.y);
            this.getFeaturesForCoords(coords);
        };
        // Check if the appLayer is selected already
        // If the layer is already selected, fire layerChanged ourself
        var selectedAppLayer = this.layerSelector.getValue();
        if (selectedAppLayer && selectedAppLayer.id === parseInt(appLayer.id, 10)) {
            this.layerChanged(appLayer);
            return;
        }
        // Find and select layerselector record
        this.layerSelector.getStore().each(function (record) {
            if (parseInt(record.get('layerId'), 10) === parseInt(appLayer.id, 10)) {
                this.layerSelector.setValue(record);
            }
        }, this);
    },
    layerChanged: function (appLayer) {
        this.buttonPanel.setVisible(true);
        if (appLayer != null) {
            if (this.vectorLayer) {
                this.vectorLayer.removeAllFeatures();
            }
            this.mode = null;
            this.config.viewerController.mapComponent.getMap().removeMarker("edit");
            if (appLayer.details && appLayer.details["editfunction.title"] && this.config.isPopup) {
                this.popup.popupWin.setTitle(appLayer.details["editfunction.title"]);
            }
            this.inputContainer.setLoading(i18next.t('viewer_components_edit_7'));
            this.inputContainer.removeAll();
            this.loadAttributes(appLayer);
            this.inputContainer.setLoading(false);
            // Make form invisible first, New or Edit has to be clicked first
            this.setFormVisible(false);
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
                    me.initAttributeInputs(me.appLayer);
                });
            } else {
                this.initAttributeInputs(me.appLayer);
            }
        }
        if (this.afterLoadAttributes !== null) {
            this.afterLoadAttributes.call(this);
        }
    },
    initAttributeInputs: function (appLayer) {
        var attributes = appLayer.attributes;
        var type = "geometry";
        if (appLayer.geometryAttributeIndex !== undefined || appLayer.geometryAttributeIndex !== null) {
            var geomAttribute = appLayer.attributes[appLayer.geometryAttributeIndex];
            if (geomAttribute.editValues !== undefined && geomAttribute.editValues !== null && geomAttribute.editValues.length >= 1) {
                type = geomAttribute.editValues[0];
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
        var showTrace = false;
        var tekst = "";
        switch (type) {
            case "multipolygon":
                this.showGeomType = "MultiPolygon";
                this.newGeomType = "Polygon";
                this.tekstGeom = i18next.t('viewer_components_edit_8');
                break;
            case "polygon":
                this.showGeomType = "Polygon";
                this.newGeomType = "Polygon";
                this.tekstGeom = i18next.t('viewer_components_edit_9');
                break;
            case "multipoint":
            case "point":
                this.showGeomType = "Point";
                this.newGeomType = "Point";
                this.tekstGeom = i18next.t('viewer_components_edit_10');
                break;
            case "linestringtrace":
                showTrace = true;
                this.tekstGeom = i18next.t('viewer_components_edit_11');
                this.newGeomType = "LineString";
                break;
            case "multilinestring":
            case "linestring":
                this.showGeomType = "LineString";
                this.newGeomType = "LineString";
                this.tekstGeom = i18next.t('viewer_components_edit_11');
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

        if (possible) {
            if (this.geometryEditable) {
                this.setButtonDisabled("editButton", false);
                this.setButtonDisabled("deleteButton", false);
                this.setButtonDisabled("copyButton", false);
                if (this.newGeomType === null) {
                    tekst = i18next.t('viewer_components_edit_12');
                } else {
                    this.setButtonDisabled("newButton", false);
                    tekst = "";
                    if (this.config.allowDelete) {
                        tekst = "";
                    }
                }
            } else {
                tekst = i18next.t('viewer_components_edit_13');
            }
            this.geomlabel.setHtml(tekst);
            var groupedInputs = {};
            var nonGrouped = [];
            if (showTrace) {
               nonGrouped.push({
                    xtype: 'button',
                    itemId: 'traceButton',
                    text: "Trace",
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.traceWindow
                        }
                    }
                });
            }
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                if (appLayer.featureType && attribute.featureType === appLayer.featureType && attribute.editable) {
                    var values = Ext.clone(attribute.editValues);
                    var input = null;
                    if (i === appLayer.geometryAttributeIndex) {
                        continue;
                    }
                    if (attribute.valueList !== "dynamic" && (values === undefined || values.length === 1)) {
                        input = this.createStaticInput(attribute, values);
                    } else if (attribute.valueList === "dynamic" || (values && values.length > 1)) {
                        input = this.createDynamicInput(attribute, values);
                    }
                    if(attribute.folder_label) {
                        if(!groupedInputs.hasOwnProperty(attribute.folder_label)) {
                            groupedInputs[attribute.folder_label] = Ext.create('Ext.form.FieldSet', {
                                title: attribute.folder_label,
                                collapsible: true,
                                collapsed: true,
                                bodyPadding: 10,
                                items: []
                            });
                        }
                        groupedInputs[attribute.folder_label].add(input);
                    } else {
                        nonGrouped.push(input);
                    }
                    this.setButtonDisabled("editButton", false);
                }
            }
            var useUpload = viewer.components.Component.parseBooleanValue(appLayer.details["editfeature.uploadDocument"]);
            if(useUpload && appLayer.details["editfeature.uploadDocument.types"]){
                var types = Ext.JSON.decode(appLayer.details["editfeature.uploadDocument.types"]);
                for(var i = 0 ; i < types.length ; i++){
                    var t = types[i];
                    var container = this.createFileForm(t,true);
                    nonGrouped.push(container);
                }
                this.setButtonDisabled("editButton", false);
            }
            this.inputContainer.add(nonGrouped);
            for(var label in groupedInputs) if(groupedInputs.hasOwnProperty(label)) {
                this.inputContainer.add(groupedInputs[label]);
            }
        } else {
            this.geomlabel.setHtml(i18next.t('viewer_components_edit_14'));
            this.setButtonDisabled("editButton", true);
            this.setButtonDisabled("newButton", true);
            this.setButtonDisabled("deleteButton", true);
            this.setButtonDisabled("copyButton", true);
        }
    },
    createFileForm: function(t, makeUpload){
        var items = [];
        if(makeUpload){
            items.push(this.createUploadBox(t, 0));
        }
        var container =new Ext.form.FormPanel({
            title: t,
            border: 0,
            id: "uploadContainer" + t,
            name: "uploadContainer" + t,
            collapsable: false,
            items:items
        });
        return container;
    },
    createUploadBox: function(t, index){
        var me = this;
        var file = Ext.create('Ext.form.field.File', {
            label: i18next.t('viewer_components_edit_15'),
            name: 'files[' + index + "]",
            width: "70%",
            id: "uploadedFile" + t + index,
            labelClsExtra: this.editLblClass,
            listeners:{
                change: function(fld,value){
                    var newValue = value.replace(/C:\\fakepath\\/g, '');
                    fld.setRawValue(newValue);
                    var container = Ext.getCmp("uploadContainer" + t);
                    var size = container.items.length;
                    var upload = this.createUploadBox(t,size);
                    container.insert(size,upload);
                },
                scope:this
            }
        });
        return file;
    },
    createStaticInput: function (attribute, values) {
        var fieldText = "";
        if (typeof values !== 'undefined') {
            fieldText = values[0];
        }
        var disallowNull = attribute.hasOwnProperty('disallowNullValue') && attribute.disallowNullValue;
        var options = {
            name: attribute.name,
            fieldLabel: attribute.editAlias || attribute.alias || attribute.name,
            value: fieldText,
            disabled: !this.allowedEditable(attribute),
            labelClsExtra: this.editLblClass,
            allowBlank: !disallowNull
        };
        var input;
        if (attribute.editHeight) {
            options.height = attribute.editHeight;
            input = Ext.create("Ext.form.field.TextArea", options);
        } else {
            input = Ext.create("Ext.form.field.Text", options);
        }
        if (attribute.type === 'date') {
            // Flamingo uses new SimpleDateFormat("dd-MM-yyyy HH:mm:ss") in
            // FeatureToJson#formatValue eg. 14-11-2013 00:00:00
            // Ext uses PHP conventions! see:
            // https://docs.sencha.com/extjs/5.1/5.1.0-apidocs/#!/api/Ext.Date
            options.format = 'd-m-Y';
            options.altFormats = 'd-m-y|d-M-Y';
            // ISO 8601 (local time + UTC offset)
            options.submitFormat = 'c';
            input = Ext.create("Ext.form.field.Date", options);
        }

        if (attribute.disableUserEdit) {
            input.setReadOnly(true);
            input.addCls("x-item-disabled");
        }

        return input;
    },
    createDynamicInput: function (attribute, values) {
        var disallowNull = attribute.hasOwnProperty('disallowNullValue') && attribute.disallowNullValue;
        var valueStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'label']
        });
        if (values && values.length > 1) {
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
            valueStore.setData(values);
        } else {
            // attributes.valueList === "dynamic"
            var reqOpts = {
                featureType: attribute.valueListFeatureType,
                attributes: [attribute.valueListValueName, attribute.valueListLabelName],
                maxFeatures: 1000,
                getKeyValuePairs: 't'
            };
            var proxy = Ext.create('Ext.data.proxy.Ajax', {
                url: actionBeans.unique,
                model: valueStore.model,
                extraParams: reqOpts,
                limitParam: '',
                reader: {
                    type: 'json',
                    rootProperty: 'valuePairs',
                    transform: {
                        fn: function (data) {
                            // transform and sort the data
                            var valuePairs = [];
                            Ext.Object.each(data.valuePairs, function (key, value, object) {
                                valuePairs.push({
                                    id: key,
                                    label: value
                                });
                            });
                            valuePairs = valuePairs.sort(function (a, b) {
                                if (a.label < b.label)
                                    return -1;
                                if (a.label > b.label)
                                    return 1;
                                return 0;
                            });
                            return {
                                success: data.success,
                                valuePairs: valuePairs
                            };
                        },
                        scope: this
                    }
                }
            });
            valueStore.setProxy(proxy);
            valueStore.load();
        }

        var input = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: attribute.editAlias || attribute.alias || attribute.name,
            store: valueStore,
            queryMode: 'local',
            displayField: 'label',
            name: attribute.name,
            id: attribute.name,
            valueField: 'id',
            allowBlank: !disallowNull,
            disabled: !this.allowedEditable(attribute),
            editable: !(attribute.hasOwnProperty('allowValueListOnly') && attribute.allowValueListOnly),
            labelClsExtra: this.editLblClass
        });
        
        //when device is mobile dont allow the touchend event. This will activate a field that is lying under the dropdown picker(ul)
        if (viewer.components.MobileManager.isMobile()) {
            input.on('focusenter', function () {
                if (!input.eventInit) {
                    var pickerList = document.getElementById(attribute.name + "-picker-listEl");
                    if (!pickerList) {
                        return;
                    }
                    pickerList.addEventListener('touchend', function (e) {
                        e.preventDefault();
                    }, false);
                    input.eventInit = true;
                }
            });
        }
        
        if (disallowNull) {
            try {
                if (valueStore.loadCount !== 0) { // if store is loaded already load event is not fired anymore
                    input.select(valueStore.getAt(0));
                } else {
                    valueStore.on('load', function () {
                        input.select(valueStore.getAt(0));
                    });
                }
            } catch (e) {
            }
        }

        if (attribute.disableUserEdit) {
            input.setReadOnly(true);
            input.addCls("x-item-disabled");
        }

        return input;
    },
    setInputPanel: function (feature) {
        this.inputContainer.getForm().setValues(feature);
    },
    selectedContentChanged: function () {
        if (this.vectorLayer === null) {
            this.createVectorLayer();
        } else {
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },
    mapClicked: function (toolMapClick, comp) {
        this.deactivateMapClick();
        this.showMobilePopup();
        if (this.mode === "new") {
            return;
        }
        this.getContentContainer().mask(i18next.t('viewer_components_edit_16'));
        var coords = comp.coord;
        this.config.viewerController.mapComponent.getMap().setMarker("edit", coords.x, coords.y);
        this.getFeaturesForCoords(coords);
    },
    getFeaturesForCoords: function (coords) {
        var layer = this.layerSelector.getValue();
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.config.viewerController
        });
        var me = this;
        featureInfo.editFeatureInfo(coords.x, coords.y, this.config.viewerController.mapComponent.getMap().getResolution() * (this.config.clickRadius || 4), layer, function (response) {
            var features = response.features;
            me.featuresReceived(features);
        }, function (msg) {
            me.failed(msg);
        });
    },
    featuresReceived: function (features) {
        if (features.length === 0) {
            this.handleFeature(null);
            return;
        }
        // A feature filter has been set, filter the right feature from the result set
        if (this.filterFeatureId !== null) {
            for (var i = 0; i < features.length; i++) {
                if (features[i].__fid === this.filterFeatureId) {
                    this.handleFeature(this.indexFeatureToNamedFeature(features[i]));
                    this.filterFeatureId = null; // Remove filter after first use
                    return;
                }
            }
            // Filtered Feature is not found
        }
        if (features.length === 1) {
            var feat = this.indexFeatureToNamedFeature(features[0]);
            this.handleFeature(feat);
        } else {
            // Handel meerdere features af.
            this.createFeaturesGrid(features);
        }
    },
    handleFeature: function (feature) {
        if (feature != null) {
            this.inputContainer.getForm().setValues(feature);
            if (this.mode === "copy") {
                this.currentFID = null;
            } else {
                this.currentFID = feature.__fid;
            }

            if(viewer.components.Component.parseBooleanValue(this.appLayer.details["editfeature.uploadDocument"])){
                var uploads = feature["__UPLOADS__"];
                for(var key in uploads){
                    if(uploads.hasOwnProperty(key)){
                        var files = uploads[key];
                        var container = Ext.getCmp("uploadContainer" + key);
                        if(!container){
                            container = this.createFileForm(key, false);
                            this.inputContainer.add(container);
                        }
                        for(var i = 0 ; i <files.length;i++){
                            var file = files[i];
                            var remover = Ext.create('Ext.container.Container', {
                                name: "fileremover-"+file.id,
                                id: "fileremover-"+file.id,
                                layout: {
                                    type: 'hbox'
                                },
                                items: [{
                                    xtype: 'label',
                                    text: file.filename
                                },{
                                    xtype: "button",
                                    text: i18next.t('viewer_components_edit_17'),
                                    listeners:{
                                        scope:this,
                                        click:function(button){
                                            var owner = button.ownerCt;
                                            var id = owner.id;
                                            var fileId = id.substring(id.lastIndexOf("-")+1);

                                            Ext.Msg.show({
                                                title: i18next.t('viewer_components_edit_18'),
                                                msg: i18next.t('viewer_components_edit_19'),
                                                fn: function(button) {
                                                    if (button === 'yes') {
                                                        Ext.Ajax.request({
                                                            url: actionBeans["file"],
                                                            scope: this,
                                                            params: {
                                                                removeUpload: true,
                                                                upload: fileId,
                                                                appLayer: this.appLayer.id,
                                                                application: FlamingoAppLoader.get("appId")
                                                            },
                                                            success: function(result) {
                                                                var response = Ext.JSON.decode(result.responseText);
                                                                if (response.success) {
                                                                    var removerId = "fileremover-" + response.uploadid;
                                                                    var remover = Ext.getCmp(removerId);
                                                                    remover.ownerCt.remove(remover);
                                                                } else {

                                                                    Ext.MessageBox.alert(i18next.t('viewer_components_edit_20'), i18next.t('viewer_components_edit_21') + response.message);
                                                                }
                                                            },
                                                            failure: function(result) {
                                                                if(failureFunction != undefined) {
                                                                    failureFunction(i18next.t('viewer_components_edit_22') + result.status + " " + result.statusText + ": " + result.responseText);
                                                                }
                                                            }
                                                        });

                                                    }
                                                },
                                                scope: this,
                                                buttons: Ext.Msg.YESNO,
                                                buttonText: {
                                                    no: i18next.t('viewer_components_edit_23'),
                                                    yes: i18next.t('viewer_components_edit_24')
                                                },
                                                icon: Ext.Msg.WARNING
                                            });
                                        }
                                    }

                                }]
                            });
                            container.insert(0,remover);
                        }
                    }
                }
            }
            if (this.geometryEditable) {
                var wkt = feature[this.appLayer.geometryAttribute];
                var feat = Ext.create("viewer.viewercontroller.controller.Feature", {
                    wktgeom: wkt,
                    id: "T_0"
                });
                this.vectorLayer.addFeature(feat);
            } else {
                this.showAndFocusForm();
            }
        }
        this.getContentContainer().unmask();
    },
    failed: function (msg) {
        Ext.Msg.alert(i18next.t('viewer_components_edit_25'), msg);
        this.getContentContainer().unmask();
    },
    /**
     * clear any loaded feature from the form and the map.
     */
    clearFeatureAndForm: function () {
        this.toggleGeomToggleForm(false);
        this.vectorLayer.removeAllFeatures();
        this.inputContainer.getForm().reset();
        this.currentFID = null;
        this.setFormVisible(false);
    },
    createNew: function () {
        this.hideMobilePopup();
        this.clearFeatureAndForm();
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.mode = "new";
        var trace = this.showGeomType === "linestringtrace";
        if(trace){
            this.traceWindow();
        }else if (this.newGeomType !== null && this.geometryEditable) {
            this.geomlabel.setHtml(i18next.t('viewer_components_edit_26', {tekstGeom: this.tekstGeom}));
            this.vectorLayer.drawFeature(this.newGeomType);
            this.toggleGeomToggleForm(this.newGeomType === "Circle" || this.newGeomType === "Polygon");
        }
        this.savebutton.setText(i18next.t('viewer_components_edit_27'));
        this.untoggleButtons("newButton");
        if(this.config.rememberValuesInSession){
            this.populateFormWithPreviousValues();
        }
    },
    toggleGeomToggleForm: function(show) {
        Ext.ComponentQuery.query("#geomToggle")[0].setVisible(show);
    },
    populateFormWithPreviousValues: function(){
        var feature = this.lastUsedValues[this.layerSelector.getValue().id];
        this.inputContainer.getForm().setValues(feature);
    },
    edit: function () {
        this.hideMobilePopup();
        this.clearFeatureAndForm();
        this.geomlabel.setHtml(i18next.t('viewer_components_edit_28', {tekstGeom: this.tekstGeom}));
        this.mode = "edit";
        this.activateMapClick();
        this.savebutton.setText(i18next.t('viewer_components_edit_29'));
        this.untoggleButtons("editButton");
    },
    copy: function () {
        this.mode = "copy";
        this.save();
    },
    deleteFeature: function () {
        if (!this.config.allowDelete) {
            return;
        }
        Ext.MessageBox.confirm(i18next.t('viewer_components_edit_30'), i18next.t('viewer_components_edit_31'), function(btn, text){
            if (btn === 'yes') {
                this.remove();
            }
        }, this);
    },
    untoggleButtons: function (filter) {
        var buttons = ["newButton", "editButton","splitButton"];
        var itemid;
        var button;
        for (var i = 0; i < buttons.length; i++) {
            itemid = buttons[i];
            if (filter === itemid || !this.getButtonAllowed(itemid)) {
                continue;
            }
            button = this.maincontainer.down("#" + itemid);
            if (button)
                button.removeCls("active-state");
        }
    },
    activateMapClick: function () {
        if(!this.toolMapClick) {
            return;
        }
        if (Array.isArray(this.deActivatedTools) && this.deActivatedTools.length === 0) {
            this.deActivatedTools = this.config.viewerController.mapComponent.deactivateTools();
        }
        this.toolMapClick.activateTool();
    },
    deactivateMapClick: function () {
        if(!this.toolMapClick) {
            return;
        }
        for (var i = 0; i < this.deActivatedTools.length; i++) {
            this.deActivatedTools[i].activate();
        }
        this.deActivatedTools = [];
        this.toolMapClick.deactivateTool();
        this.showAndFocusForm();
    },
    hideMobilePopup: function() {
        if(this.config.isPopup && viewer.components.MobileManager.isMobile()) {
            this.mobileHide = true;
            this.popup.hide();
        }
    },
    showMobilePopup: function() {
        if(this.config.isPopup && viewer.components.MobileManager.isMobile()) {
            this.mobileHide = false;
            this.popup.show();
        }
    },
    save: function () {
        if(this.mode === null) {
            return;
        }

        if (this.mode === "delete") {
            this.remove();
            return;
        }

        if (!this.inputContainer.isValid()) {
            return;
        }

        var me = this;
        var feature = this.inputContainer.getValues();
        me.editingLayer = this.config.viewerController.getLayer(this.layerSelector.getValue());
        var applayerId = me.editingLayer.getId();
        this.lastUsedValues [applayerId] = feature;

        if (this.geometryEditable) {
            if (this.vectorLayer.getActiveFeature()) {
                var wkt = this.vectorLayer.getActiveFeature().config.wktgeom;
                feature[this.appLayer.geometryAttribute] = wkt;
            }
            if(!feature[this.appLayer.geometryAttribute]) {
                return;
            }
        }
        if (this.mode === "edit") {
            feature.__fid = this.currentFID;
        }
        if (this.mode === "copy") {
            this.currentFID = null;
            delete feature.__fid;
        }
        try {
            feature = this.changeFeatureBeforeSave(feature);
        } catch (e) {
            me.failed(e);
            return;
        }
        var ef = this.getEditFeature();
        ef.edit(
                me.editingLayer,
                feature,
                function (fid) {
                    me.saveSucces(fid);
                    me.config.viewerController.fireEvent(viewer.viewercontroller.controller.Event.ON_EDIT_SUCCESS, me.editingLayer, feature);
                }, function (error) {
            me.failed(error);
        });
    },
    getEditFeature: function(){
        return Ext.create("viewer.EditFeature", {
            viewerController: this.config.viewerController
        });
    },
    remove: function () {
        if (!this.config.allowDelete || !this.geometryEditable) {
            Ext.MessageBox.alert(i18next.t('viewer_components_edit_32'), i18next.t('viewer_components_edit_33'));
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
            viewerController: this.config.viewerController,
            actionbeanUrl: actionBeans["editfeature"]+"?delete"
        }).remove(
                me.editingLayer,
                feature,
                function (fid) {
                    me.deleteSucces();
                    me.config.viewerController.fireEvent(viewer.viewercontroller.controller.Event.ON_EDIT_REMOVE_SUCCESS, me.editingLayer, feature);
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
    saveSucces: function (fid, skipSuccessMessage) {
        var me = this;
        var messageFunction = function(extratext) {
            var msg = i18next.t('viewer_components_edit_34');
            if(extratext) {
                msg += " " + extratext;
            }
            if(!skipSuccessMessage) {
                Ext.Msg.alert("Gelukt", msg);
            }
            me.cancel();
        };

        this.editingLayer.reload();
        this.currentFID = fid;
        var isUploading = false;
        if (viewer.components.Component.parseBooleanValue(this.appLayer.details["editfeature.uploadDocument"]) && this.appLayer.details["editfeature.uploadDocument.types"]) {
            var types = Ext.JSON.decode(this.appLayer.details["editfeature.uploadDocument.types"]);
            for (var i = 0; i < types.length; i++) {
                var t = types[i];
                var form = Ext.getCmp("uploadContainer" + t);
                var hasFile = false;
                for (var j = 0; j < form.items.length; j++) {
                    var inputEl = form.items.get(j).fileInputEl;
                    if (inputEl) {

                        var file = inputEl.dom.files[0];
                        if (file) {
                            hasFile = true;
                            break;
                        }
                    }
                }
                me.messageFunction = messageFunction;
                if (hasFile) {
                    isUploading = true;
                    form.submit({
                        scope: this,
                        url: actionBeans["file"],
                        waitMsg: i18next.t('viewer_components_edit_35'),
                        waitTitle: i18next.t('viewer_components_edit_36'),
                        params: {
                            uploadFile: true,
                            fid: fid,
                            type: t,
                            appLayer: this.appLayer.id,
                            application: FlamingoAppLoader.get('appId')
                        },
                        success: function (response) {
                            var resp = Ext.decode(response.responseText, true);
                            me.messageFunction(i18next.t('viewer_components_edit_37'));
                        },
                        failure: function () {
                            Ext.MessageBox.alert(i18next.t('viewer_components_edit_38'), i18next.t('viewer_components_edit_39'));
                        }
                    });
                }
            }
        }


        if (!isUploading) {
            messageFunction();
        }
    },
    deleteSucces: function (skipSuccessMessage) {
        this.editingLayer.reload();
        this.currentFID = null;
        if(!skipSuccessMessage) {
            Ext.MessageBox.alert(i18next.t('viewer_components_edit_40'), i18next.t('viewer_components_edit_41'));
        }
        this.cancel();
    },
    saveFailed: function (msg) {
        Ext.Msg.alert("Mislukt", msg);
    },
    cancel: function () {
        if(this.mobileHide) {
            return;
        }
        this.resetForm();
        if(this.config.isPopup) {
            this.popup.hide();
        }
    },
    resetForm: function () {
        this.savebutton.setText(i18next.t('viewer_components_edit_42'));
        this.mode = null;
        this.geomlabel.setHtml("");
        this.setFormVisible(false);
        this.buttonPanel.setVisible(true);
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.toggleGeomToggleForm(false);
        if (this.vectorLayer) {
            // vector layer may be null when cancel() is called
            this.vectorLayer.removeAllFeatures();
        }
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

        var modelName = this.name + appLayer.id + 'Model';
        if (!this.schema.hasEntity(modelName)) {
            Ext.define(modelName, {
                extend: 'Ext.data.Model',
                fields: attributeList,
                schema: this.schema
            });
        }

        var store = Ext.create('Ext.data.Store', {
            pageSize: 10,
            model: modelName,
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
                            text: i18next.t('viewer_components_edit_43'),
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
                            text: i18next.t('viewer_components_edit_44'),
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
            title: i18next.t('viewer_components_edit_45'),
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
        this.getContentContainer().unmask();
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
            if (attributes[i].name === appLayer.geometryAttribute && attributes[i].editable) {
                // if the editing of the geometry attribute is disabled at
                // the layer level (using a "G!B Geometrie NIET Bewerken" group)
                // skip a level in the conversion map
                if (attributes[i].userAllowedToEditGeom !== undefined) {
                    if (!attributes[i].userAllowedToEditGeom) {
                        index++;
                        continue;
                    }
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
