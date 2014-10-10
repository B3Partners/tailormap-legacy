/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * Cyclorama component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Cyclorama",{
    extend: "viewer.components.Component",
    config:{
    },
    constructor: function (conf){
        viewer.components.Cyclorama.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        // Registreer voor layerinitialized
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initComp, this);
        return this;
    },
    initComp : function(){
        console.log("layers initialized");
        var appLayer = this.viewerController.getAppLayerById(this.config.layers);
        var mapLayer = this.viewerController.getLayer(appLayer);
        mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, this.onFeatureInfo,this);
    },
    onFeatureInfo: function (appLayer,event){
        if(appLayer.id === this.layers && event.features){
            if(event.features.length >1 ){
                this.showOptions(event.features);
            }else if(event.features.length === 1){
                this.openGlobespotter(event.features[0]);
            }
        }
    },
    showOptions : function(features){
        // laat meerdere opties zien
        // klik is open globespotter
    },
    openGlobespotter : function(feature){
        // Get link from backend
    },
    linkReceived: function(link){
        // Open popup
    }
});