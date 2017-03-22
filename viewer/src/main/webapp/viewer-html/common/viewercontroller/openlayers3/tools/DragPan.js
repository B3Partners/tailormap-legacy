/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.tools.DragPan",{

    constructor : function(conf){
        conf.id = "ol-DragPan";
        conf.class = "ol-DragPan";
        conf.onlyClick = false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.interaction.DragPan();
        this.initTool();
    },

    activate : function(){
        this.frameworkObject.setActive(true);
    },

    deactivate : function() {
        this.frameworkObject.setActive(false);
    },

    initTool : function(){
        this.deactivate();
    }

});