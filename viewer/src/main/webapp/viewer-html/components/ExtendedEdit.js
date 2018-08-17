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
    constructor: function (conf){
        conf.isPopup = false;
        this.initConfig(conf);
        viewer.components.ExtendedEdit.superclass.constructor.call(this, this.config);
        var me = this;

        this.schema = new Ext.data.schema.Schema();

        this.navigateBackButton = this.createButton('left', 'Vorige');
        this.navigateForwardButton = this.createButton('right', 'Volgende');
        this.buttons = Ext.create('Ext.toolbar.Toolbar', {
            xtype: 'toolbar',
            dock: 'bottom',
            hidden: true,
            items: [
                this.navigateBackButton,
                this.navigateForwardButton
            ]
        });

        var title = "";
        if(this.config.title && !this.config.viewerController.layoutManager.isTabComponent(this.name) && !this.config.isPopup) {
            title = this.config.title;
        }
        this.maincontainer = Ext.create('Ext.panel.Panel', {
            title: title,
            items: [
                { xtype: 'container', items: this.getFormItems() }
            ],
            autoScroll: true,
            dockedItems: [this.buttons]
        });
        this.layerSelector.getLayerSelector().setVisible(false);
        this.getContentContainer().add(this.maincontainer);
        // this.maincontainer, inputContainer, geomlabel, savebutton are used in edit component
        this.inputContainer = this.maincontainer.down('#inputPanel');
        this.geomlabel = this.maincontainer.down("#geomLabel");
        this.savebutton = this.maincontainer.down("#saveButton");

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
    selectedLayerChanged: function(layer) {
        this.currentLayer = layer;
    },
    createButton: function(direction, label) {
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
        this.totalPages = 0;
        this.feature_data = [];
        var layer = this.layerSelector.getValue();
        if(!layer) {
            return;
        }
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.config.viewerController
        });
        var me = this;
        this.currentCoords = options.coord;
        featureInfo.editFeatureInfo(options.coord.x, options.coord.y, this.config.viewerController.mapComponent.getMap().getResolution() * 4, layer, function (features) {
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
                if (this.vectorLayer == null) {
                    this.createVectorLayer();
                }
                this.clearFeatureAndForm();
                this.mode = "edit";
                var feat = this.indexFeatureToNamedFeature(this.feature_data[i].feature);
                this.handleFeature(feat);
            }
        }
        this.createPagination();
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
        if(this.currentCoords) {
            this.startEdit(null, { coord: this.currentCoords });
        }
        this.callParent(arguments);
        this.layerSelectorInit();
    }
});