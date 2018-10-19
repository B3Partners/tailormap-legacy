/* 
 * Copyright (C) 2017 B3Partners B.V.
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
/* global Ext */

/**
 * ExtendedEdit component
 * Shows extended edit form (with back and next, listens to feature info event).
 * @author Meine Toonen
 */
Ext.define ("viewer.components.ExtendedEdit",{
    extend: "viewer.components.Edit",
    totalPages: 0,
    currentOptions:null,
    currentIndex:null,
    pagination:null,
    content:null,
    savedFeatureId: null,
    feature_data: [],
    currentCoords: null,
    currentLayer: null,
    initialLoad: false,
    constructor: function (conf){
        conf.isPopup = false;
        this.initConfig(conf);
        viewer.components.Edit.superclass.constructor.call(this, this.config);
        var me = this;

        this.schema = new Ext.data.schema.Schema();

        this.navigateBackButton = this.createPaginationButton('left', ___("Vorige"));
        this.navigateForwardButton = this.createPaginationButton('right', ___("Volgende"));
        this.buttons = Ext.create('Ext.toolbar.Toolbar', {
            xtype: 'toolbar',
            dock: 'bottom',
            hidden: true,
            items: [
                this.navigateBackButton,
                this.navigateForwardButton
            ]
        });

        var formItems = this.getFormItems();
        formItems.push({
            xtype: 'container',
            itemId: 'removeMessage',
            html: i18next.t('viewer_components_extendededit_0'),
            hidden: true,
            componentCls: 'alert-message success'
        });
        this.maincontainer = Ext.create('Ext.panel.Panel', {
            title: this.getPanelTitle(),
            items: [
                {
                    xtype: 'container',
                    scrollable: false,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    padding: 10,
                    items: formItems
                }
            ],
            scrollable: true,
            layout: 'fit',
            tools: this.getHelpToolConfig(),
            dockedItems: [this.buttons]
        });
        this.getContentContainer().add(this.maincontainer);
        // this.maincontainer, inputContainer, geomlabel, savebutton are used in edit component
        this.inputContainer = this.maincontainer.down('#inputPanel');
        this.geomlabel = this.maincontainer.down("#geomLabel");
        this.savebutton = this.maincontainer.down("#saveButton");
        this.buttonPanel = this.maincontainer.down("#buttonPanel");
        var editButton = this.buttonPanel.down("#editButton");
        if(editButton) {
            editButton.setVisible(false);
        }
        
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING, function () {
            this.createVectorLayer();
        }, this);

        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.selectedContentChanged, this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO, this.startEdit, this);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, this.layerSelectorInit, this);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE, this.selectedLayerChanged, this);
        return this;
    },
    layerSelectorInit: function() {
        if(this.currentLayer === null) {
            this.layerSelector.selectFirstLayer();
        } else {
            this.layerSelector.setValue(this.currentLayer);
        }
        if(this.layerSelector.getVisibleLayerCount() > 1) {
            this.layerSelector.getLayerSelector().setVisible(true);
        } else {
            this.layerSelector.getLayerSelector().setVisible(false);
        }
    },
    initAttributeInputs: function() {
        this.callParent(arguments);
        if(!this.initialLoad) {
            this.initialLoad = true;
            if(this.config.allowEdit) {
                this.edit();
            }
        }
    },
    selectedLayerChanged: function(layer) {
        this.currentLayer = layer;
    },
    createPaginationButton: function(direction, label) {
        return Ext.create('Ext.button.Button', {
            text: label,
            flex: 1,
            iconCls: 'x-fa fa-angle-double-' + direction,
            scope: this,
            handler: function() {
                this.navigate(direction);
            }
        });
    },
    
    /**
     * When a feature info starts.
     */
    startEdit: function(map, options) {
        if(!this.config.allowEdit) {
            return;
        }
        this.totalPages = 0;
        this.feature_data = [];
        var layer = this.layerSelector.getValue();
        if(!layer) {
            return;
        }
        var currentScale = this.config.viewerController.mapComponent.getMap().getScale();
        var visibleAppLayers = this.config.viewerController.getVisibleAppLayers();
        if (!this.config.viewerController.isWithinScale(layer, currentScale) || !visibleAppLayers.hasOwnProperty(layer.id)) {
            return;
        }
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.config.viewerController
        });
        var me = this;
        this.currentCoords = options.coord;
        featureInfo.editFeatureInfo(options.coord.x, options.coord.y, this.config.viewerController.mapComponent.getMap().getResolution() * (this.config.clickRadius || 4), layer, function (features) {
            me.featuresReceived(features);
        }, function (msg) {
            // me.failed(msg);
            console.error(msg);
        });
    },
    featuresReceived: function(features) {
        for(var i = 0; i < features.length; i++) {
            var featureId = null;
            if(features[i].__fid) {
                featureId = features[i].__fid;
            }
            this.feature_data.push({
                feature: features[i],
                featureId: featureId
            });
            this.totalPages++;
        }
        this.activateResultsDiv();
        this.createPagination();
        if(this.totalPages !== 0) {
            this.showPage(0, this.savedFeatureId);
            this.savedFeatureId = null;
        }
    },
    activateResultsDiv: function(){
        if(this.popup && this.totalPages > 0) {
            this.popup.show();
        }
        if(!this.config.isPopup) {
            this.config.viewerController.layoutManager.showTabComponent(this.name);
            this.config.viewerController.layoutManager.expandRegion(this.config.name);
        }
    },
    showPage: function(index, currentFeatureId){
        if(currentFeatureId) {
            for(var j = 0; j < this.feature_data.length; j++) {
                if(this.feature_data[j].featureId === currentFeatureId) {
                    index = j;
                }
            }
        }
        this.currentIndex = index;
        if(this.currentIndex < 0) {
            this.currentIndex = 0;
            index = 0;
        }
        for(var i = 0; i < this.feature_data.length; i++) {
            if(i === index) {
                this.clearFeatureAndForm();
                var feat = this.indexFeatureToNamedFeature(this.feature_data[i].feature);
                this.showAndFocusForm();
                this.handleFeature(feat);
            }
        }
        this.createPagination();
    },
    showAndFocusForm: function() {
        if(this.mode !== null) {
            this.buttonPanel.setVisible(false);
        }
        this.maincontainer.down('#removeMessage').setVisible(false);
        this.callParent([]);
    },
    createPagination: function(){
        if(this.totalPages <= 1) {
            if(!this.buttons.isHidden()) this.buttons.hide();
        } else {
            if(this.buttons.isHidden()) this.buttons.show();
            this.enableDisableButton(this.navigateBackButton, this.currentIndex === 0);
            this.enableDisableButton(this.navigateForwardButton, this.currentIndex >= (this.totalPages - 1));
        }
    },
    enableDisableButton: function(btn, disable) {
        if(disable && !btn.isDisabled()) {
            btn.setDisabled(true);
        } else if(!disable && btn.isDisabled()) {
            btn.setDisabled(false);
        }
    },
    navigate: function(direction) {
        if(direction === 'right') {
            this.showPage(this.currentIndex + 1);
        } else {
            this.showPage(this.currentIndex - 1);
        }
    },
    saveSucces: function(fid) {
        this.savedFeatureId = fid;
        var feature = this.vectorLayer.getFeature(0);
        if(feature) {
            this.currentCoords = this.vectorLayer.getFeatureGeometry(feature.id).getCentroid();
        }
        if(this.mode === "new" || this.mode === "edit") {
            this.addSuccesIconToButton(this.savebutton);
        }
        if(this.mode === "copy") {
            this.addSuccesIconToButton(this.maincontainer.down('#copyButton'));
        }
        if(this.currentCoords) {
            this.startEdit(null, { coord: this.currentCoords });
        }
        this.callParent([fid, true]);
        this.layerSelectorInit();
    },
    deleteSucces: function() {
        this.callParent([true]);
        var removeMessage = this.maincontainer.down('#removeMessage');
        removeMessage.setVisible(true);
        setTimeout(function() {
            removeMessage.setVisible(false);
        }, 5000);
    },
    addSuccesIconToButton(btn) {
        if(!btn) {
            return;
        }
        btn.setIconCls("x-fa fa-check-circle icon-green");
        setTimeout(function() {
            btn.setIconCls("");
        }, 5000);
    },
    resetForm: function () {
        this.currentCoords = null;
        this.totalPages = 0;
        this.createPagination();

        this.setFormVisible(false);
        this.buttonPanel.setVisible(true);
        this.savebutton.setText(___("Opslaan"));
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.removeAllFeatures();
        if(this.config.allowEdit) {
            this.edit();
        }
    }
});