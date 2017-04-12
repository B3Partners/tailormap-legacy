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
Ext.define("viewer.viewercontroller.openlayers.OpenLayersWMSLayer",{
    extend: "viewer.viewercontroller.controller.WMSLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor : function (config){
        viewer.viewercontroller.openlayers.OpenLayersWMSLayer.superclass.constructor.call(this,config);
        this.mixins.openLayersLayer.constructor.call(this,config);

        this.options.visibility = this.visible;
        this.options.singleTile=true;
        this.options.transitionEffect = "resize";
        this.options.attribution = this.config.attribution;
        this.frameworkLayer = new OpenLayers.Layer.WMS(this.options.name,this.url,this.ogcParams,this.options);

        this.type=viewer.viewercontroller.controller.Layer.WMS_TYPE;

        this.getFeatureInfoControl=null;
        this.mapTipControl=null;
    },

    /**
    *Gets the last wms request-url of this layer
    *@returns the WMS getMap Reqeust.
    */
    getLastMapRequest : function(){
        var request=[{
            url: this.getFrameworkLayer().getURL(this.getFrameworkLayer().map.getExtent())
        }];
        return request;

    },

    getLayers : function(){
        return this.getFrameworkLayer().options.layers;
    },
    /**
     * Implementation of setUrl in Layer
     * @see viewer.viewercontroller.controller.Layer#setUrl
     */
    setUrl: function(url){
        this.url=url;
        if (this.getFrameworkLayer()){
            this.getFrameworkLayer().setUrl(url);
        }
    },
    /**
    *Set a OGC-WMS param and refresh the layer
    */
    setOGCParams: function(newParams){
        this.getFrameworkLayer().mergeNewParams(newParams);
    },
    /**
    *Get Feature
    */
    setGetFeatureInfoControl : function(controller){
        this.getFeatureInfoControl=controller;
    },

    getGetFeatureInfoControl : function(){
        return this.getFeatureInfoControl;
    },
    /**
    *Maptip:
    */
    setMapTipControl : function(controller){
        this.mapTipControl=controller;
    },

    getMapTipControl : function(){
        return this.mapTipControl;
    },
    setQuery : function (filter, sldHash, sessionId){
        if(filter && filter.getCQL() != ""){
            var service = this.config.viewerController.app.services[this.serviceId];
            var layer = service.layers[this.options.name];
            if(layer.details != undefined){
                var filterable =layer.details["filterable"];
                if(filterable != undefined && filterable != null ){
                    filterable = Ext.JSON.decode(filterable);
                    if(filterable){
                        var url;
                        if(!sldHash){
                            url = Ext.create(viewer.SLD).createURL(
                                this.options["layers"],
                                this.getOption("styles") || "default",
                                null,
                                layer.hasFeatureType ? layer.featureTypeName : null,
                                this.config.sld ? this.config.sld.id : null,
                                filter.getCQL());
                        }else{
                            url = Ext.create(viewer.SLD).createURLWithHash(
                                sldHash,
                                sessionId,
                                this.options["layers"],
                                this.getOption("styles") || "default");
                        }
                        this.setOGCParams({"SLD": url});
                        this.reload();
                    }
                }
            }
        }else{
            this.setOGCParams({
                "SLD": this.config.originalSldUrl || null
            });
        }
    },

    /******** overwrite functions to make use of the mixin functions **********/
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
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#getType
     */
    getType : function (){
        return this.mixins.openLayersLayer.getType.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#destroy
     */
    destroy: function (){
        this.mixins.openLayersLayer.destroy.call(this);
    }
});
