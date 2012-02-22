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
        viewer.viewercontroller.flamingo.FlamingoLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    
    toXML : function(){
        throw("FlamingoLayer.toXML(): .toXML() must be made!");
    },

    getTagName : function(){
        throw("FlamingoLayer.getTagName: .getTagName() must be made!");
    },
    setOption : function(optionKey,optionValue){
        this.options[optionKey]=optionValue;
    },
    getId : function(){
        return this.id;
    },
    setAlpha : function (alpha){
        viewerController.mapComponent.getMap().getFrameworkMap().callMethod(viewerController.mapComponent.getMap().getId() +"_"+ this.getId(),"setAlpha",alpha)
    }
});