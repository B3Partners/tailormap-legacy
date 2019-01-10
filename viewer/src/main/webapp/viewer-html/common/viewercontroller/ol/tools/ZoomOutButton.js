/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.ol.tools.ZoomOutButton",{

    constructor : function(conf){
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "zoom-out";
        conf.class = "olControlZoomOut";
        conf.id = "ol-zoom-out";
        conf.active = false;
        conf.onlyClick =true;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.Zoom();
    },

    activate : function(){
            this.mapComponent.maps[0].getFrameworkMap().getView().setZoom( this.mapComponent.maps[0].getFrameworkMap().getView().getZoom()-1);        
    },

    deactivate : function() {
        //only click can't be deactivated
    },
    isActive : function(){
        return false;
    }

});