/** 
 * @class 
 * @constructor
 * @description The flamingo Tool Class 
 **/
/*
function FlamingoTool(id,flamingoObject){
    Tool.call(this,id,flamingoObject);
}
FlamingoTool.prototype = new Tool();
FlamingoTool.prototype.constructor= FlamingoTool;

FlamingoTool.prototype.setVisible = function(visibility){
    this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
}
*/

Ext.define("FlamingoTool",{
    extend: "Tool",
    constructor : function (config){
        this.initConfig(config);
        return this;
      //  this.callParent(id,flamingoObject);
    },
    setVisible: function (visibility){
        this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
    }
    
});