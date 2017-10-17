/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers4.tools.FullExtent",{

    constructor : function(conf){
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "max-extent";
        conf.class = "olControlZoomToMaxExtent";
        conf.id = "max-extent";
        conf.actives = false;
        conf.onlyClick =true;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.ZoomToExtent({extent:[12000,304000,280000,620000]});
    },

    activate : function(){
        //var extent = this.mapComponent.maps[0].getFrameworkMap().getView().getProjection().getExtent();
        var extent = this.mapComponent.getMap().getRestrictedExtent();
        this.mapComponent.maps[0].getFrameworkMap().getView().fit(extent,this.mapComponent.maps[0].getFrameworkMap().getSize());
    },

    deactivate : function() {
        //only click can't be deactivated
    },
    
    isActive : function(){
        return false;
    }

});