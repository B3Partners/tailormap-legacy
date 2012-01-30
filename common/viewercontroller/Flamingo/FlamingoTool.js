/** 
 * @class 
 * @constructor
 * @description The flamingo Tool Class 
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    constructor : function (config){
        viewer.viewercontroller.flamingo.FlamingoTool.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    setVisible: function (visibility){
        this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
    }
    
});