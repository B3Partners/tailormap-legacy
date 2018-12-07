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
 * @description OpenLayers Arc layer super class
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 **/
Ext.define("viewer.viewercontroller.openlayers.OpenLayersArcLayer",{
    extend: "viewer.viewercontroller.controller.ArcLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers.OpenLayersLayer"
    },
    constructor: function(config){
        viewer.viewercontroller.openlayers.OpenLayersArcLayer.superclass.constructor.call(this, config);
        this.mixins.openLayersLayer.constructor.call(this,config);
        this.initConfig(config);
        return this;
    },

    /**
     *Get the id of this layer
     */
    getId :function (){
        return this.id;
    },

    getName : function (){
        return this.options["name"];
    },

    getServer :function (){
        return this.options["server"];
    },

    getService : function (){
        return this.options["service"];
    },

    getServlet : function (){
        return this.options["servlet"];
    },

    getMapservice : function (){
        return this.options["mapservice"];
    },
    getLayers : function(){
        return this.options["layers"];
    }, 
    getLegendGraphic: function (){
        //console.log("getLegendGraphic still needs to be implemented in ArcLayer");
        return null;
    },
    setBuffer : function (radius,layer){
        console.log(i18next.t('viewer_viewercontroller_openlayers_openlayersarclayer_0'));
    },
    removeBuffer: function(layer){        
        console.log(i18next.t('viewer_viewercontroller_openlayers_openlayersarclayer_1'));
    },
    getType : function (){
        return this.mixins.openLayersLayer.getType.call(this);
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
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#destroy
     */
    destroy: function (){
        this.mixins.openLayersLayer.destroy.call(this);
    }
});

