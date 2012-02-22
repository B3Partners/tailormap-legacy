/**  
 * Layer
 * @class 
 * @constructor
 * @description The superclass for all layers 
 * @param frameworkLayer The frameworkspecific layer
 * @param id The id of the layer
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.controller.Layer",{
    extend: "Ext.util.Observable",
    events: [],
    maptips: new Array(),
    map:null,
    visible: false,
    //service id from where this layer is created
    serviceId: 0,
    config :{
        id: "id",
        frameworkObject: new Object(),
        options: new Object()
    },
    constructor: function (config){
        this.initConfig(config);
    },
    
    /**
     * Get's the frameworklayer: the viewer specific layer.
     */
    getFrameworkLayer : function(){
        return this.frameworkLayer;
    },
    /**
     *Gets a option of this layer
     *@return the option value or null if not exists
     */
    getOption: function(optionKey){
        var availableOptions=""
        for (var op in this.options){
            if (op.toLowerCase()==optionKey.toLowerCase())
                return this.options[op];
            availableOptions+=op+",";
        }
        return null;
    },
    /**
     *sets or overwrites a option
     */
    setOption : function(optionKey,optionValue){
        throw("Layer.getOption() Not implemented! Must be implemented in sub-class");
    },

    /**
     *Get the id of this layer
     */
    getId :function (){
        return this.id;
    },
    /**
     *Gets the layer that are set in this layer
     */
    getLayers: function (){
        Ext.Error.Raise({msg: "Get layers must be implemented by implementation"});
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
    setAlpha : function (alpha){
        throw("Layer.setAlpha() Not implemented! Must be implemented in sub-class");
    },
    fire : function (event,options){
        this.fireEvent(event,this,options);
    },

    registerEvent : function (event,handler){
        this.addListener(event,handler);
    },
    setVisible : function (visible){
        throw("Layer.setVisible() Not implemented! Must be implemented in sub-class");
    },
    getLegendGraphic : function () {
        throw("Layer.getLegendImage() Not implemented! Must be implemented in sub-class");
    }

});
