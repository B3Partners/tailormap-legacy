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
        viewer.components.ExtendedFeatureInfo.superclass.constructor.call(this, this.config);
        this.showMaxFeaturesText = false;
        this.config.clickRadius = this.config.clickRadius ? this.config.clickRadius : 4;
        this.config.moreLink = null;
        
        var div = new Ext.Element(document.createElement("div"));
        this.origDiv = Ext.get(this.getContentDiv());
        this.origDiv.appendChild(div);
        this.content = new Ext.Element(document.createElement("div"));
        div.appendChild(this.content);
        
        this.pagination = new Ext.Element(document.createElement("div"));
        this.pagination.addCls("extended_feature_info_pagination");
        div.appendChild(this.pagination);
        
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
            this.currentData [d.appLayer.id ] = d;
            
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
        //var data = this.data[0].features[index];
        var cur = this.currentData[this.currentLayer];
        var newData = {
            appLayer: cur.appLayer,
            featureType : cur.featureType,
            features : cur.features,
            moreFeaturesAvailable: cur.moreFeatureAvailable,
            requestId: cur.requestId,
            request: cur.request
        };
        var newFeature = newData.features[index];
        newData.features = [newFeature];
        var components = this.createInfoHtmlElements([newData], this.currentOptions);
        this.content.append(components);
        this.createPagination(this.currentLayer);
    },
    createPagination: function(applayerId){
        this.pagination.setHtml("");
        var me = this;
        var data = this.currentData[applayerId];
        var numPages = data.features.length;
        
        if(this.currentIndex > 0){
            var prevElem = document.createElement("a");
            prevElem.href = 'javascript: void(0)';
            var prev = new Ext.Element(prevElem);
            prev.addListener("click",
                    function (evt, el, o) {
                        me.showPage(this.currentIndex -1);
                    },
                    this);
            prev.insertHtml("beforeEnd", "Vorige");
            this.pagination.appendChild(prev);  
        }else{
            this.pagination.insertHtml("beforeEnd", "Vorige");
        }
        this.pagination.insertHtml ( "beforeEnd", " | ");
        
        if(this.currentIndex < (numPages -1)){
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
        }else{
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