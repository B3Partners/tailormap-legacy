/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.openlayers3.tools.StreetViewButton",{
    constructor : function(conf){
        this.initConfig(conf);
        this.conf = conf;
        conf.id = "ol-DragPan";
        conf.class = "ol-DragPan";
        conf.onlyClick = false;
        conf.actives =false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.interaction.DragPan();
        this.initTool();
    },

    activate : function(tool){
        this.conf.actives =true;
        this.frameworkObject.setActive(true);
        tool.fire(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN);
    },

    deactivate : function(tool) {
        this.conf.actives =false;
        this.frameworkObject.setActive(false);
        if(tool){
            tool.fire(viewer.viewercontroller.controller.Event.ON_EVENT_UP);
        }
    },

    initTool : function(){
        this.deactivate();
    },
    
    isActive : function(){
        return this.frameworkObject.getActive();
    }

});