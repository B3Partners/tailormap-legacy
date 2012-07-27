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
 * @class 
 * @constructor
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.OpenLayersImageLayer",{
    extend: "viewer.viewercontroller.controller.ImageLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersImageLayer.superclass.constructor.call(this, config);
        var ex = Ext.create("viewer.viewercontroller.controller.Extent",this.extent);
        var width = this.viewerController.mapComponent.getMap().getWidth();
        var height = this.viewerController.mapComponent.getMap().getHeight();
        this.initConfig(config);
           this.frameworkLayer = new OpenLayers.Layer.Image(
                this.name,
                this.url,
                new OpenLayers.Bounds(ex.minx, ex.miny,ex.maxx, ex.maxy),
                new OpenLayers.Size(width,height),
                this.options
            );
            
    },
    setUrl: function(url){
        this.url=url;
    },
    setExtent: function (extent){
        this.extent=extent;
    },
    
    /******** overwrite functions to make use of the mixin functions **********/    
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.openLayersLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.openLayersLayer.setAlpha.call(this,alpha);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#addListener
     */
    addListener: function (event,handler,scope){
        this.mixins.openLayersLayer.addListener.call(this,event,handler,scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#removeListener
     */
    removeListener: function (event,handler,scope){
        this.mixins.openLayersLayer.removeListener.call(this,event,handler,scope);
    }
});