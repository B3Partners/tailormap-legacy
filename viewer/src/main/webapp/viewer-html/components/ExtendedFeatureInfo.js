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
/**
 * FeatureInfo component
 * Shows feature info.
 * @author Meine Toonen
 */
Ext.define ("viewer.components.ExtendedFeatureInfo",{
    extend: "viewer.components.FeatureInfo",   
    content:null,
    
    constructor: function (conf){  
        //don't call maptip constructor but that of super maptip.
        this.initConfig(conf);
        this.config.clickRadius = this.config.clickRadius ? this.config.clickRadius : 4;
        this.content = Ext.get(this.getContentDiv());
        viewer.components.ExtendedFeatureInfo.superclass.constructor.call(this, this.config);
        
        //this.onResize();
        //listen to the on addlayer
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onLayerRemoved,this);
         //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfoStart,this);
        //listen to a extent change
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT, this.onChangeExtent,this);
      /*  document.getElementById(this.getDiv()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        if(this.popup){
            document.getElementById(this.popup.getContentId()).addEventListener('click', this.relatedFeaturesListener.bind(this));
        }*/
        return this;
    },
    
    /**
     * When a feature info starts.
     */
    onFeatureInfoStart: function(){
        /*this.balloon.setContent("");
        this.balloon.hide();*/
        this.setMaptipEnabled(false);
    },
    /**
     * 
     */
    onDataReturned: function(options){
        var data = options.data;
        
      /*  this.lastPosition.x = options.x;
        this.lastPosition.y = options.y;
        this.worldPosition = options.coord;*/
        //alert(layer);
        var me = this;
        var data = options.data;
        var components = [];
        if (!data) {
            return;
        }
        components = this.createInfoHtmlElements(data, options);
        this.content.append(components);
        this.popup.show();
        /*var found=false;
        var data = options.data;
        for (var layerIndex in data) {
            if(!data.hasOwnProperty(layerIndex)){
                continue;
            }
            var layer=data[layerIndex];
            for (var index in layer.features) {
                if(layer.features.hasOwnProperty(index)) {
                    found = true;
                    break;
                }
            }
            if(found){
                break;
            }
        }
        if (!found){
            this.setMaptipEnabled(true);
        }
        this.callParent(arguments);*/
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