/** 
 * @class 
 * @constructor
 * @description The flamingo Tool Class 
 **/
Ext.define("FlamingoTool",{
    extend: "Tool",
    constructor : function (config){
        FlamingoTool.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    setVisible: function (visibility){
        this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
    }
    
});