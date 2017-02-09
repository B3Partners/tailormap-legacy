/* 
 * Copyright (C) 2017 B3Partners B.V.
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
/* global Ext */

/**
 * FeatureInfo component
 * Shows feature info.
 * @author Meine Toonen
 */
Ext.define ("viewer.components.ExtendedFeatureInfo",{
    extend: "viewer.components.FeatureInfo",
    currentdata:null,
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
        
        var div = new Ext.Element(document.createElement("div"));
        this.origDiv = Ext.get(this.getContentDiv());
        this.origDiv.appendChild(div);
        
        if(!this.config.hasSharedPopup && this.config.title){
            var title = new Ext.Element(document.createElement("div"));
            title.addCls("extended_feature_info_title");
            title.insertHtml("beforeEnd",this.config.title);
            title.insertHtml("beforeEnd","<hr>");
            div.appendChild(title);
        }
        
        this.content = new Ext.Element(document.createElement("div"));
        div.appendChild(this.content);

        this.pagination = new Ext.Element(document.createElement("div"));
        this.pagination.addCls("extended_feature_info_pagination");
        div.appendChild(this.pagination);
        
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onLayerRemoved,this);
         //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfoStart,this);
        //listen to a extent change
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT, this.onChangeExtent,this);
            document.getElementById(this.getDiv()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        if(this.config.hasSharedPopup){
      //      document.getElementById(this.popup.getContentId()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        }
        return this;
    },
    
    /**
     * When a feature info starts.
     */
    onFeatureInfoStart: function(){
        this.content.setHtml("");
        this.currentData = [];
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
                this.currentData.push(newData);
            }
        }
        this.currentOptions = options;
        this.worldPosition = options.coord;
        this.config.viewerController.mapComponent.getMap().setMarker("featureInfoMarker",options.coord.x,options.coord.y);
        
        if(this.popup){
            this.popup.show();
        }
        this.createPagination(this.currentLayer);
        if(data[0].requestId === this.currentRequestId){
            this.showPage(0);
        }
    },
    
    showPage: function(index){
        this.currentIndex = index;
        this.content.setHtml("");
        var data = this.currentData[index];
        var components = this.createInfoHtmlElements([data], this.currentOptions);
        this.content.append(components);
        this.createPagination();
    },
    createPagination: function(){
        this.pagination.setHtml("");
        var me = this;
        var data = this.currentData;
        var numPages = data.length;
        
        if (this.currentIndex > 0) {
            var prevElem = document.createElement("a");
            prevElem.href = 'javascript: void(0)';
            var prev = new Ext.Element(prevElem);
            prev.addListener("click",
                    function (evt, el, o) {
                        me.showPage(this.currentIndex - 1);
                    },
                    this);
            prev.insertHtml("beforeEnd", "Vorige");
            this.pagination.appendChild(prev);
        } else {
            this.pagination.insertHtml("beforeEnd", "Vorige");
        }
        this.pagination.insertHtml("beforeEnd", " | ");

        if (this.currentIndex < (numPages - 1)) {
            var nextElem = document.createElement("a");
            nextElem.href = 'javascript: void(0)';
            var next = new Ext.Element(nextElem);
            next.addListener("click",
                    function (evt, el, o) {
                        me.showPage(this.currentIndex + 1);
                    },
                    this);
            next.insertHtml("beforeEnd", "Volgende");
            this.pagination.appendChild(next);
        } else {
            this.pagination.insertHtml("beforeEnd", "Volgende");
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