/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
        this.mixins.openLayersLayer.constructor.call(this,config);
        
        this.utils = Ext.create("viewer.viewercontroller.openlayers.Utils");
        
        this.type=viewer.viewercontroller.controller.Layer.IMAGE_TYPE;
        
        var width = this.config.viewerController.mapComponent.getMap().getWidth();
        var height = this.config.viewerController.mapComponent.getMap().getHeight();
        
        if (this.options==null){
            this.options={};
        }
        /* set the displayOutsideMaxExtent and alwaysInRange because the extent is the maxextent
         * and the image is not visible.
        * @see: http://dev.openlayers.org/docs/files/OpenLayers/Layer/Image-js.html#OpenLayers.Layer.Image.extent
        */
        if (this.options.maxExtent==undefined){
            this.options.displayOutsideMaxExtent=true;
            this.options.alwaysInRange=true;
        }
        //set the start visibility
        this.options.visibility = this.visible;
        
        var me=this;
        this.frameworkLayer = new OpenLayers.Layer.Image(
             this.name,
             this.url,
             this.utils.createBounds(this.extent),
             new OpenLayers.Size(width,height),
             me.options
         );
            
    },
    /**
     * @see viewer.viewercontroller.controller.ImageLayer#setExtent
     */
    setExtent: function (extent){
        this.extent=extent;
        if(this.frameworkLayer){
            this.frameworkLayer.extent=this.utils.createBounds(extent)
        }
    },
    
    setUrl: function(newUrl){
        viewer.viewercontroller.openlayers.OpenLayersImageLayer.superclass.setUrl.call(this,newUrl);
        if (this.frameworkLayer){
            this.frameworkLayer.setUrl(newUrl);
        }
        
    },
    /**
     *@see viewer.viewercontroller.controller.Layer#getLastMapRequest
     */
    getLastMapRequest: function(){
        return [{
            url: this.url,
            extent: this.extent
        }];
    },
    /******** overwrite functions to make use of the mixin functions **********/    
    /**
     *Get the type of the layer
     */
    getType : function (){
        return this.mixins.openLayersLayer.getType.call(this);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.openLayersLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    getVisible: function(){        
        return this.mixins.openLayersLayer.getVisible.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.openLayersLayer.setAlpha.call(this,alpha);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#reload
     */
    reload: function (){
        this.mixins.openLayersLayer.reload.call(this);
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
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#destroy
     */
    destroy: function (){
        this.mixins.openLayersLayer.destroy.call(this);
    }
});
