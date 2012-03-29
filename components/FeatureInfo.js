/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * LoadMonitor object.
 * Monitor's the loading with a loadingbar
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.FeatureInfo",{
    extend: "viewer.components.Maptip",   
    progressElement: null,
    constructor: function (conf){
        //don't call maptip constructor but that of super maptip.
        viewer.components.Maptip.superclass.constructor.call(this, conf);        
        this.initConfig(conf);   
        //make the balloon
        this.balloon = new Balloon(this.getDiv(),this.getViewerController().mapComponent,"balloonFeatureInfo",this.width,this.height);
        //show close button and dont close on mouse out.
        this.balloon.closeOnMouseOut=false;
        this.balloon.showCloseButton=true;
        var me = this;
        this.balloon.close = function(){            
            me.balloon.setContent("");
            me.balloon.hide();
            var maptips= me.viewerController.getComponentsByClassName("viewer.components.Maptip");
            for (var i =0; i < maptips.length;i++){
                if (typeof maptips[i].setEnabled == 'function'){
                    maptips[i].setEnabled(true);
                }
            }    
        }
        //listen to the on addlayer
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
         //Add event when started the identify (clicked on the map)
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.onFeatureInfoStart,this);
        return this;        
    },    
    /**
     * Event handler for when a layer is added to the map
     * @see event ON_LAYER_ADDED
     */
    onAddLayer: function(map,mapLayer){     
        if (mapLayer==null)
            return;
        if(this.isSummaryLayer(mapLayer)){            
            var appLayer=this.viewerController.app.appLayers[mapLayer.appLayerId];
            var layer = this.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
            //do server side getFeature.
            if (layer.hasFeatureType){
                this.activateServerRequest(true);
            }else{
                //listen to the onMaptipData
                mapLayer.registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA,this.onMapData,this);       
            }            
        }
    },
    activateServerRequest: function (sr){       
        if (sr==this.serverRequestEnabled){
            return;
        }
        this.serverRequestEnabled=sr;
        if (this.serverRequestEnabled){
            this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.doServerRequest,this);
            this.featureInfo=Ext.create("viewer.FeatureInfo", {viewerController: this.viewerController});
        }else{
            this.featureInfo=null;
        }
    }
    ,onFeatureInfoStart: function(){
        this.balloon.setContent("");
        this.balloon.hide();
        var maptips= this.viewerController.getComponentsByClassName("viewer.components.Maptip");
        for (var i =0; i < maptips.length;i++){
            if (typeof maptips[i].setEnabled == 'function'){
                maptips[i].setEnabled(false);
            }
        }
    }
});

