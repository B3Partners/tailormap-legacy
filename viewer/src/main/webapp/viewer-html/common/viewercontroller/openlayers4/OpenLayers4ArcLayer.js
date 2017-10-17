/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers4.OpenLayers4ArcLayer",{
    extend: "viewer.viewercontroller.controller.ArcLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers4.OpenLayers4Layer"
    },
    constructor: function(config){
        viewer.viewercontroller.openlayers4.OpenLayers4ArcLayer.superclass.constructor.call(this, config);
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
        console.log("OpenLayersArcLayer.setBuffer: .setBuffer() must be made!");
    },
    removeBuffer: function(layer){        
        console.log("OpenLayersArcLayer.removeBuffer: .removeBuffer() must be made!");
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
