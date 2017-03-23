/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.tools.ZoomIn",{

    tempKey:null,
    constructor : function(conf){
        this.initConfig(conf);
        this.conf = conf;
        conf.tool = "zoom-in";
        conf.class = "ol-zoom-in";
        conf.id = "ol-zoom-in";
        conf.actives = false;
        conf.onlyClick =false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.interaction.DragBox();
        this.initTool(this.frameworkObject);
    },

    activate : function(){
        this.conf.actives = true;
        this.frameworkObject.setActive(true);
        
        this.tempKey = this.mapComponent.maps[0].getFrameworkMap().on('click',function(evt){  
            var crd = evt.coordinate;
            this.mapComponent.maps[0].getFrameworkMap().getView().setCenter(crd);
            this.mapComponent.maps[0].getFrameworkMap().getView().setZoom( this.mapComponent.maps[0].getFrameworkMap().getView().getZoom()+1);
        },this);
    },

    deactivate : function() {
        this.conf.actives = false;
        this.frameworkObject.setActive(false);
        ol.Observable.unByKey(this.tempKey);
    },

    initTool : function(tool){
        tool.on('boxend',function(evt){
            var x = tool.getGeometry().getExtent();
            var center = [(x[0]+x[2])/2,(x[1]+x[3])/2];
            this.mapComponent.maps[0].getFrameworkMap().getView().setCenter(center);
            this.mapComponent.maps[0].getFrameworkMap().getView().setZoom( this.mapComponent.maps[0].getFrameworkMap().getView().getZoom()+1);
        },this);
        
        this.deactivate();
    },
    isActive : function(){
        return this.frameworkObject.getActive();
    }
});