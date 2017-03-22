/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.tools.Measure",{

    constructor : function(conf){
        conf.id = "measure";
        conf.class = "ol-Measure";
        conf.onlyClick = false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.interaction.Draw({type:conf.typ});
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