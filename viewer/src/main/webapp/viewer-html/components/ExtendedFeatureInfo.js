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
 * FeatureInfo component
 * Shows feature info.
 * @author Meine Toonen
 */
Ext.define ("viewer.components.ExtendedFeatureInfo",{
    extend: "viewer.components.FeatureInfo",
    totalPages: 0,
    currentOptions:null,
    currentIndex:null,
    pagination:null,
    content:null,
    
    constructor: function (conf){  
        //don't call maptip constructor but that of super maptip.
        this.initConfig(conf);
        viewer.components.Maptip.superclass.constructor.call(this, this.config);
        this.showMaxFeaturesText = false;
        this.config.clickRadius = this.config.clickRadius ? this.config.clickRadius : 4;
        this.config.moreLink = null;

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
        this.panel = Ext.create('Ext.panel.Panel', {
            title: title,
            items: [],
            autoScroll: true,
            dockedItems: [this.buttons],
            listeners: {
                render: function(panel) {
                    this.panel.getEl().dom.addEventListener('click', this.relatedFeaturesListener.bind(this));
                },
                scope: this
            }
        });
        this.getContentContainer().add(this.panel);
        
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onLayerRemoved,this);
         //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfoStart,this);
        //listen to a extent change
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT, this.onChangeExtent,this);
        if(this.config.hasSharedPopup){
      //      document.getElementById(this.popup.getContentId()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        }
        return this;
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
    onFeatureInfoStart: function(){
        this.panel.removeAll(true);
        this.totalPages = 0;
        this.setMaptipEnabled(false);
    },
    /**
     * 
     */
    onDataReturned: function(options){
        var data = options.data;
        if (!data) {
            return;
        }
        
        if(data[0].requestId === this.currentRequestId){
            this.currentLayer = data[0].appLayer.id;
        }
        this.currentOptions = options;
        this.worldPosition = options.coord;
        for(var i = 0 ; i < data.length ;i++){
            var d = data[i];
            for(var j = 0 ; j < d.features.length ; j++){
                var feature = d.features[j];
                var newData = {
                    appLayer: d.appLayer,
                    featureType : d.featureType,
                    features : [feature],
                    moreFeaturesAvailable: d.moreFeatureAvailable,
                    requestId: d.requestId,
                    request: d.request
                };
                this.addPage(newData);
                this.totalPages++;
            }
        }
        this.config.viewerController.mapComponent.getMap().setMarker("featureInfoMarker",options.coord.x,options.coord.y);

        this.activateResultsDiv();
        this.createPagination(this.currentLayer);
        if(data[0].requestId === this.currentRequestId){
            this.showPage(0);
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
    addPage: function(data) {
        var components = this.createInfoHtmlElements([data], this.currentOptions);
        var contentEl = new Ext.Element(document.createElement('div'));
        contentEl.append(components);
        var container = Ext.create('Ext.container.Container', {
            contentEl: contentEl,
            hidden: false,
            listeners: {
                beforedestroy: function() {
                    // Manually destroy element: solves errors from Ext's garbage collector
                    contentEl.destroy();
                    this.setHtml('');
                }
            }
        });
        this.panel.add(container);
    },
    showPage: function(index){
        this.currentIndex = index;
        if(this.currentIndex < 0) {
            this.currentIndex = 0;
        }
        var pages = this.panel.query('container');
        for(var i = 0; i < pages.length; i++) {
            if(i === index && pages[i].isHidden()) {
                pages[i].setHidden(false);
            } else if(i !== index) {
                pages[i].setHidden(true);
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
    /**
     *Called when extent is changed, recalculate the position
     */
    onChangeExtent : function(map,options){        
       /* if (this.worldPosition && options.extent){
            if (options.extent.isIn(this.worldPosition.x,this.worldPosition.y)){
                this.balloon.setPositionWorldCoords(this.worldPosition.x,this.worldPosition.y,false,this.getBrowserZoomRatio());
            }else{
                this.balloon.hide();
            }
        }*/
    },
    /**
     * 
     */
     setMaptipEnabled: function (enable){        
        var maptips= this.config.viewerController.getComponentsByClassName("viewer.components.Maptip");
        for (var i =0; i < maptips.length;i++){
            if (typeof maptips[i].setEnabled == 'function'){
                maptips[i].setEnabled(enable);
            }
        } 
     }
});