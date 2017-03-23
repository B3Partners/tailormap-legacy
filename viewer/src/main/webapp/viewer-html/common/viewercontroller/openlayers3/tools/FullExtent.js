/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.tools.FullExtent",{

    constructor : function(conf){
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "max-extent";
        conf.class = "ol-zoom-MaxExtent";
        conf.id = "max-extent";
        conf.actives = false;
        conf.onlyClick =true;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.ZoomToExtent();
    },

    activate : function(){
        var extent = this.mapComponent.maps[0].getFrameworkMap().getView().getProjection().getExtent();
        this.mapComponent.maps[0].getFrameworkMap().getView().fit(extent,this.mapComponent.maps[0].getFrameworkMap().getSize());
    },

    deactivate : function() {
        //only click can't be deactivated
    },
    
    isActive : function(){
        return false;
    }

});