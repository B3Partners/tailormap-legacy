/** 
 * Flamingomap 
 * @class 
 * @constructor
 * @description
 * 
 */

Ext.define("viewer.viewercontroller.flamingo.FlamingoMap",{
    extend: "viewer.viewercontroller.controller.Map",
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoMap.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    
    /**
     *See @link Map.getId
     */
    getId : function(){
        return this.id;
    },

    /**
     *See @link Map.getAllWMSLayers
     */
    getAllWMSLayers : function(){
        var lagen = new Array();
        for(var i = 0 ; i < this.layers.length;i++){
            if(this.layers[i] instanceof viewer.viewercontroller.flamingo.FlamingoWMSLayer){
                lagen.push(this.layers[i]);
            }
        }
        return lagen;
    },
    /**
     *See @link Map.getAllVectorLayers
     */
    getAllVectorLayers : function(){
        var lagen = new Array();
        for(var i = 0 ; i < this.layers.length;i++){
            if(this.layers[i] instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer){
                lagen.push(this.layers[i]);
            }
        }
        return lagen;
    },
    /**
     *see @link Map.remove
     */
    remove : function(){
        this.getFrameworkMap().callMethod("flamingo","killComponent",this.getId());
    },

    /**
     *Add a layer(service) to the map
     *@param layer a FlamingoLayer that needs to be added.
     *see @link Map.addLayer
     **/
    addLayer : function(layer){
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoLayer))
            throw("FlamingoMap.addLayer(): Given layer not of type FlamingoLayer");
        //call super function
        //Map.prototype.addLayer.call(this,layer);
        this.superclass.addLayer.call(this,layer);
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer)){
            this.getFrameworkMap().callMethod(this.getId(),'addLayer',layer.toXML());
        }
    },
    
    /**
     *remove the specific layer. See @link Map.removeLayer
     **/
    removeLayer:function(layer){
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoLayer))
            throw("FlamingoMap.removeLayer(): Given layer not of type FlamingoLayer");
        //call super function
        viewer.viewercontroller.controller.Map.prototype.removeLayer.call(this,layer);
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer)){
            this.getFrameworkMap().callMethod(this.getId(),'removeLayer',this.getId()+'_'+layer.getId());
        }
    },

    /**
     *see @link Map.setLayerIndex
     */
    setLayerIndex : function (layer, newIndex){
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoLayer)){
            throw("FlamingoMap.setLayerIndex(): Given layer not of type FlamingoLayer.");
        }

        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer)){
            this.getFrameworkMap().callMethod(this.getId(),"swapLayer",this.getId()+'_'+layer.getId(),newIndex);
        }
        return Map.prototype.setLayerIndex(layer,newIndex);
    },
    setLayerVisible : function (layer, visible){
        viewer.viewercontroller.controller.Map.prototype.setLayerVisible.call(this,layer,visible);
        this.getFrameworkMap(). callMethod(this.id + "_" + layer.getId(), "setVisible", visible);
    },
    /**
     * See @link Map.zoomToExtent
     */
    zoomToExtent : function (extent){
        this.getFrameworkMap().callMethod(this.getId(), "moveToExtent", extent, 0);
    },

    /**
     * See @link Map.zoomToMaxExtent
     */
    zoomToMaxExtent : function(){
        this.zoomToExtent(this.getFrameworkMap().callMethod(this.getId(), "getFullExtent"));
    },

    /**
     * See @link Map.zoomToResolution
     */
    zoomToResolution : function(resolution){
        this.getFrameworkMap().callMethod(this.getId(), "moveToScale",resolution,undefined,0);
    },
    /**
     * See @link Map.zoomToScale
     * @deprecated, use zoomToResolution because it zooms to a resolution and not a scale!
     */
    zoomToScale : function(resolution){
        this.zoomToResolution(resolution);
    },

    /**
     * see @link Map.setMaxExtent
     */
    setMaxExtent:function(extent){
        this.getFrameworkMap().callMethod(this.getId(), "setFullExtent", extent);
    },
    /**     
     *See @link Map.getFullExtent()
     */
    getMaxExtent:function(){
        var extent=this.getFrameworkMap().callMethod(this.getId(), "getFullExtent");
        return new viewer.viewercontroller.controller.Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
    },

    /**
     *See @link Map.doIdentify
     */
    doIdentify : function(x,y){
        throw("Map.doIdentify() Not implemented!");
    },

    /**
     *see @link Map.getExtent
     */
    getExtent: function(){
        var extent= this.getFrameworkMap().callMethod(this.getId(),'getExtent');
        return new viewer.viewercontroller.controller.Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
    },

    /**
     *see @link Map.update
     */
    update : function (){
        this.getFrameworkMap().callMethod(this.getId(),'update', 100, true);
    },

    /**
     *see @link Map.setMarker
     */
    setMarker : function(markerName,x,y,type){
        this.getFrameworkMap().callMethod(this.getId(),"setMarker",markerName,type,Number(x),Number(y));
    },
    /**
     *see @link Map.removeMarker
     */
    removeMarker : function(markerName){
        this.getFrameworkMap().callMethod(this.getId(),"removeMarker",markerName);
    },

    /**
     *see @link Map.getScale
     *@deprecated use: getResolution because it returns the resolution and not the scale
     */
    getScale : function (){
        return this.getResolution();
    },
    /**
     *see @link Map.getResolution
     */
    getResolution : function (){
        return this.getFrameworkMap().callMethod(this.getId(), "getScaleHint");
    },

    /**
     * see @link Map.coordinateToPixel
     */
    coordinateToPixel : function(x,y){
        return this.getFrameworkMap().callMethod(this.getId(), "coordinate2Point",{
            x: x,
            y: y
        });
    },
    /**
     * see @link Map.getCenter
     */
    getCenter : function(){
        return this.getFrameworkMap().callMethod(this.getId(), "getCenter");
    }

});
