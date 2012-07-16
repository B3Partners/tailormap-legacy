/** 
 * Flamingomap 
 * @class 
 * @constructor
 * @description
 * 
 */

Ext.define("viewer.viewercontroller.flamingo.FlamingoMap",{
    extend: "viewer.viewercontroller.controller.Map",
    posAttrNames: ["left","right","top","bottom","width","height"],
    enabledEvents: new Object(),
    editMapId: null,
    gisId: 'gis',
    config: {
        options: null,
        viewerController:null
    },
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoMap.superclass.constructor.call(this, config);
        this.initConfig(config);        
        this.frameworkMap = this.mapComponent.viewerObject;
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
        //call super function
        this.superclass.addLayer.call(this,layer);
        if (layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer){
            if (this.editMapId==null){
                this.addEditMap();             
            }
            layer.setGisId(this.gisId);
            this.addLayerToGis(layer);
        }else if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer)){
            this.getFrameworkMap().callMethod(this.getId(),'addLayer',layer.toXML());
        }
    },
    addLayerToGis : function (layer){
        if(this.getFrameworkMap().callMethod("flamingo", "isLoaded",this.gisId, true)){
            this.getFrameworkMap().callMethod(this.gisId,'addLayerAsString',layer.toXML());
            layer.isLoaded=true;
        }else{
            var thisObj = this;
            setTimeout(function(){
                thisObj.addLayerToGis(layer,thisObj);
            },500);
        }
    },
    /**
     *remove the specific layer. See @link Map.removeLayer
     **/
    removeLayer:function(layer){
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer)){
            this.getFrameworkMap().callMethod(this.getId(),'removeLayer',this.getId()+'_'+layer.getId());
        } 
        //call super function
        this.superclass.removeLayer.call(this,layer);
    },
    
    addEditMap: function(){
        this.editMapId='editMap';        
        //add gis
        this.getFrameworkMap().callMethod(
            this.getMapComponent().mainContainerId,
            "addComponent",
            "<fmc:GIS xmlns:fmc='fmc' id='"+this.gisId+"' geometryeditable='true' alwaysdrawpoints='false'></fmc:GIS>");
        //add editMap
        var positionAttributesMap=this.getPositionAttributes();
        var editmapXml="<fmc:EditMap xmlns:fmc='fmc' id='"+this.editMapId+"' editable='true'";        
        for (var key in positionAttributesMap){
            editmapXml+=" "+key+"='"+positionAttributesMap[key]+"'";
        }
        editmapXml+="listento='"+this.gisId+","+this.id+"'/>";
        
        this.getFrameworkMap().callMethod(
            this.getMapComponent().mainContainerId,
            "addComponent",
            editmapXml);                
    },
    /**
     * Get layer with flamingo layer id (with mapid_ as prefix)
     */
    getLayerByFlamingoId: function(layerId){
        var l=null;
        if (layerId.indexOf(this.getId()+"_")==0){
            l=this.getLayer( (layerId.replace(this.getId() + "_" ,"")));
        }if (l==null){
            l=this.getLayer(layerId);
        }
        return l;
    },

    /**
     *see @link Map.setLayerIndex
     */
    setLayerIndex : function (layer, newIndex){        
        if (!(layer instanceof viewer.viewercontroller.flamingo.FlamingoVectorLayer)){
            this.getFrameworkMap().callMethod(this.getId(),"swapLayer",this.getId()+'_'+layer.getId(),newIndex);
        }
        return this.superclass.setLayerIndex(layer,newIndex);
    },
    setLayerVisible : function (layer, visible){
        this.superclass.setLayerVisible.call(this,layer,visible);
        layer.setVisible(visible);
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
        Ext.Error.raise({msg: "Map.doIdentify() Not implemented!"});
    },

    /**
     *see @link Map.getExtent
     */
    getExtent: function(){
        var extent= this.getFrameworkMap().callMethod(this.getId(),'getCurrentExtent');
        return new viewer.viewercontroller.controller.Extent(extent.minx,extent.miny,extent.maxx,extent.maxy);
    },

    /**
     *see @link Map.update
     */
    update : function (){
        this.getFrameworkMap().callMethod(this.getId(),'update', 100, true);
    },
    
    forceUpdate : function (){
        var me = this;
        if(!this.isUpdating()){
            this.update();
        }else{
            setTimeout( function () {me.forceUpdate();},100);
        }    
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
    getScale : function (extent){
        return this.getResolution(extent);
    },
    /**
     *see @link Map.getResolution
     */
    getResolution : function (extent){
        if(!extent){
            extent = this.getExtent();
        }
        return this.getFrameworkMap().callMethod(this.getId(), "getScale",extent);
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
     * see @see Map.getCenter
     */
    getCenter : function(){
        return this.getFrameworkMap().callMethod(this.getId(), "getCenter");
    },
    /**
     * @see Map#getWidth
     */
    getWidth : function(){
        return this.getFrameworkMap().callMethod(this.getId(), "getMovieClipWidth");
    },
    /**
     * @see Map#getHeight
     */
    getHeight : function(){
        return this.getFrameworkMap().callMethod(this.getId(), "getMovieClipHeight");
    },
    isUpdating : function(){
        return this.getFrameworkMap().callMethod(this.getId(), "isUpdating");
    },
    /**
     * returns all the position attributes configured for this element.
     * @returns object with the set positionattributes (left,bottom,widht etc.)
     */
    getPositionAttributes: function(){        
        var attr={};
        for (var i= 0; i < this.posAttrNames.length; i++){
            var attrName=this.posAttrNames[i];
            if (this.options[attrName]){
                attr[attrName]=this.options[attrName];
            }
        }
        return attr;
        
    },
    toXML: function(){
        var xml="";
        xml+="<fmc:Map";
        xml+=" xmlns:fmc=\"fmc\"";
        xml+=" id=\""+this.getId()+"\"";
        for (var key in this.options){
            xml+=" "+key+"=\""+this.options[key]+"\"";
        }
        xml+=">";
        xml+="<fmc:LayerIdentifyIcon id=\"identifyicon\"/>";
		xml+="</fmc:Map>";
        return xml;
    },
    /**
     * Overwrites the addListener function. Add's the event to allowexternalinterface of flamingo
     * so flamingo is allowed to broadcast the event.
     */
    addListener : function(event,handler,scope){
        viewer.viewercontroller.flamingo.FlamingoMap.superclass.addListener.call(this,event,handler,scope);
        //enable flamingo event broadcasting
        var flamEvent=this.mapComponent.eventList[event];
        if (flamEvent!=undefined){
            //if not enabled yet, enable
            if (this.enabledEvents[flamEvent]==undefined){
                this.getFrameworkMap().callMethod(this.mapComponent.getId(),"addAllowExternalInterface",this.getId()+"."+flamEvent);
                this.enabledEvents[flamEvent]=true;
            }
        }     
    }
});
