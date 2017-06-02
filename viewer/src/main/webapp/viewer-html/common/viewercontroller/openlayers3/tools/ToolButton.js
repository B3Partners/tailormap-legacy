/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.openlayers3.tools.ToolButton",{
    
    constructor : function(conf){
        this.initConfig(conf);
        this.conf = conf;
        var frameworkOptions ={};
        frameworkOptions.type=conf.type;
        conf.id = "loc";
        conf.class = conf.displayClass;
        conf.onlyClick = true;
            
        if(conf.displayClass){
            frameworkOptions.displayClass = conf.displayClass;
        }else{
            frameworkOptions.displayClass ="olButton_"+conf.id;
        }
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.Control(frameworkOptions);
    },

    activate : function(tool){ 
        tool.fire(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN);
    },

    deactivate : function() {
        //only click can't be deactivated
    },
    
    isActive : function(){
        return false;
    }

});