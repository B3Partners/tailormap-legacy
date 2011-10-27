/** The flamingo Tool Class **/
function FlamingoTool(id,flamingoObject){
    Tool.call(this,id,flamingoObject);
}
FlamingoTool.prototype = new Tool();
FlamingoTool.prototype.constructor= FlamingoTool;

FlamingoTool.prototype.setVisible = function(visibility){
    this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
}
