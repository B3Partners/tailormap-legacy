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
 * Graph component
 * Creates a Graph component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.Graph", {
    extend: "viewer.components.Component",
    panel: null,
    initialized:false,
    config: {
        title: null,
        iconUrl: null,
        tooltip: null,
        label: null,
        graphs:null
    },
    constructor: function(conf) {
        viewer.components.Graph.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;
        this.renderButton({
            handler: function() {
                // me.buttonClick();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        });
        // Make hook for Returned feature infos
        // Stub for development
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initialize,this);
        //this.
        // Make hook for onaddlayers
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.addLayer,this);
        return this;
    },
    initialize : function(){
        this.initialized = true;
        var layer = this.viewerController.mapComponent.getMap().getLayer(3);// gemeente
        
        
        this.addLayer(null,{layer:layer});
    },
    addLayer : function(layer,options){
        if (this.initialized) {
            var mapLayer = options.layer;
            mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, this.featureInfoReturned, this);
        }
    },
    featureInfoReturned : function (layer,options){
        this.loadGraph(layer);
    },
    loadGraph : function (appLayer){
        this.popup.show();
        this.popup.setWindowTitle(appLayer.alias);
        // Create store
        // Create graph
        
    },
    getExtComponents: function() {
        return [];
    }
});
