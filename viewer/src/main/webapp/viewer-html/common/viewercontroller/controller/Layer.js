/**  
 * Layer
 * @class 
 * @description The superclass for all layers 
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.controller.Layer",{
    extend: "Ext.util.Observable",
    statics:{
        WMS_TYPE: "WMS",
        ARCSERVER_TYPE: "ARCSERVER",
        ARCSERVERREST_TYPE: "ARCSERVERREST",
        VECTOR_TYPE: "VECTOR",
        IMAGE_TYPE: "IMAGE",
        TILING_TYPE: "TILING"
    },
    maptips: new Array(),
    map:null,
    visible: true,
    //service id from where this layer is created
    /**@field
     *@deprecated can be found by getting the appLayer.serviceId
     **/
    serviceId: null,
    config :{
        id: null,
        options: null,
        viewerController: null,
        url:null,
        appLayerId: null,
        frameworkLayer: null,
        details: null //if not a applayer, this can hold some details / settings
    },
    /**
     * 
     * @param frameworkLayer The frameworkspecific layer
     * @param id The id of the layer
     */
    constructor: function (config){        
        this.initConfig(config);        
        this.callParent(arguments);
    },
        
    /**
     *Gets a option of this layer
     *@return the option value or null if not exists
     */
    getOption: function(optionKey){
        var availableOptions=""
        for (var op in this.options) {
            if(!this.options.hasOwnProperty(op)) {
                continue;
            }
            if (op.toLowerCase() === optionKey.toLowerCase())
                return this.options[op];
            availableOptions+=op+",";
        }
        return null;
    },  
    getFrameworkLayer: function() {
        return this.frameworkLayer || this.config.frameworkLayer;
    },
    /**
     * Because 1 layer is created per applayer (not combined) every layer has the id:
     * serviceId_appLayerName
     * To get the appLayerName the serviceId_ string needs to be removed.
     */
    getAppLayerName: function(){
        return this.config.viewerController.app.appLayers[this.appLayerId].layerName;
    },   
    /**
     *Add a maptip to the layer
     */
    addMapTip : function(maptip){
        this.maptips.push(maptip);
    },
    /**
     * set a array of maptips
     */
    setMaptips : function (maptips){
        this.maptips=maptips;
    },
    /**
     * get a array of maptips
     */
    getMaptips : function (){
        return this.maptips;
    },
    /**
     *Gets the feature by a feature type (layername)
     *@param featureType the name of the featuretype returned by the server
     *@return the maptip for this layer/featuretype or null if none found
     */
    getMapTipByFeatureType : function(featureType){
        for (var m=0; m < this.maptips.length; m++){
            if (this.maptips[m].layer == featureType ||this.maptips[m].aka == featureType){
                return this.maptips[m];
            }
        }
        return null;
    },
    /**
     * Gets the map where the layer is added.
     * @return the map
     */
    getMap: function(){
        return this.map;
    },
    /**
     * Set the map where this layer is added.
     * @param map a viewer.viewercontroller.controller.Map object.
     */
    setMap: function(map){
        this.map= map;
    },
    
    /**
     * Gets the details for this layer, if this is a layer from the register and has
     * a applayerId, the configured applayer.details are returned. Otherwise the
     * details object in this class is returned (custom layer)
     */
    getDetails: function(){
        if (this.appLayerId){
            return this.config.viewerController.app.appLayers[this.appLayerId].details;
        }else{
            return this.details;
        }
    },
    /**
     * Gets the layer type (WMS, ArcServer, ArcIms, Vector etc.)
     */
    getType: function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_0')});
    },
    /**
     *sets or overwrites a option
     */
    setOption : function(optionKey,optionValue){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_1')});
    },
    /**
     *Gets the layer that are set in this layer
     */
    getLayers: function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_2')});
    },
    /**
     * Changes the opacity of a layer.
     * @param alpha percentage: a value between 0 and 100
     */
    setAlpha : function (alpha){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_3')});
    },
    setVisible : function (visible){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_4')});
    },
    getVisible : function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_5')});
    },
    setQuery : function (query){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_6')});
    },
    /**
     * must be implemented in subclass. 
     * @see viewer.viewercontroller.ViewerController#getLayerLegendInfo
     * @return object with that gives info about the legend
     * object.name: String, server provided label for the legend of this layer
     * object.parts: Array of:
     *   label: String, label for legend part
     *   url: String, URL for image, usually provided as data: protocol base64
     *        encoded image 27x27 PNG (no label) by ArcGIS
     **/
    getLayerLegendInfo: function (){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_7')});
    },
    /**
     * Needs to return a object with the last request
     * @return array of objects with:
     *  object.url the url of the last request
     *  object.body (optional) the body of the request
     */
    getLastMapRequest: function(){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_8')});
    },
    reload: function(){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_layer_9')});
    },
    fire : function (event,options){
        this.fireEvent(event,this,options);
    },
    /**
     *Overwrite the destroy function. Clear all listeners and forward to the super.destroy
     */
    destroy: function(){
        this.clearListeners();
        viewer.viewercontroller.controller.Layer.superclass.destroy.call(this);
    }
});
