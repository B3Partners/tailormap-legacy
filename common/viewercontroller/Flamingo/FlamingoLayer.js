/** The FlamingLayer Class **/

/**  
 * @constructor
 * @augments Layer
 * @description The superclass for all flamingolayers 
 * @param id The id of the layer
 * @param options The options to be given to the layer
 * @param flamingoObject The flamingo object of the layer
 * 
 */

Ext.define("viewer.viewercontroller.flamingo.FlamingoLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    constructor :function (config){
        FlamingoLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    
    toXML : function(){
        throw("FlamingoLayer.toXML(): .toXML() must be made!");
    },

    getTagName : function(){
        throw("FlamingoLayer.getTagName: .getTagName() must be made!");
    },
    getOption: function(optionKey){
        var availableOptions=""
        for (var op in this.options){
            if (op.toLowerCase()==optionKey.toLowerCase())
                return this.options[op];
            availableOptions+=op+",";
        }
        return null;
    },
    setOption : function(optionKey,optionValue){
        this.options[optionKey]=optionValue;
    },
    getId : function(){
        return this.id;
    }
});
/*
function FlamingoLayer(id,options,flamingoObject){
    if (id==null){
        id="";
    }
    this.id=id;
    this.options=options;
    Layer.call(this,flamingoObject,id);
}
FlamingoLayer.prototype = new Layer();
FlamingoLayer.prototype.constructor = FlamingoLayer;

FlamingoLayer.prototype.getId = function(){
    return this.id;
}

FlamingoLayer.prototype.toXML = function(){
    throw("FlamingoLayer.toXML(): .toXML() must be made!");
}

FlamingoLayer.prototype.getTagName = function(){
    throw("FlamingoLayer.getTagName: .getTagName() must be made!");
}
*/
/**
*Gets a option of this layer
*@return the option value or null if not exists
*//*
FlamingoLayer.prototype.getOption = function(optionKey){
    var availableOptions=""
    for (var op in this.options){
        if (op.toLowerCase()==optionKey.toLowerCase())
            return this.options[op];
        availableOptions+=op+",";
    }
    return null;
}*/
/**
*sets or overwrites a option
*//*
FlamingoLayer.prototype.setOption = function(optionKey,optionValue){
    this.options[optionKey]=optionValue;
}*/