/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol */

Ext.define("viewer.viewercontroller.OpenLayersMap3Component",{
    extend: "viewer.viewercontroller.MapComponent",
    view: null, 
    config:{
        theme: "flamingo"
    },
    constructor:function(viewerController, domId, config){
        this.domId = Ext.id();
        var container = document.createElement('div');
        container.id = this.domId;
        container.style.height = '100%';
        container.style.width = '100%';
        document.getElementById(domId).appendChild(container);
        
        this.view = new ol.View({
          center: ol.proj.fromLonLat([-0.12755, 51.507222]),
          zoom: 6
        });        
        viewer.viewercontroller.OpenLayersMap3Component.superclass.constructor.call(this, viewerController,domId,config);
        var map = new ol.Map({
        target: this.domId,
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        loadTilesWhileAnimating: true,
        view: this.view
      });
       
      this.test();
      
    },
    
    initEvents : function(){
        console.log("dit werkt !");
    },
    
    test : function(){
        this.view.animate({
          center: ol.proj.fromLonLat([12.5, 41.9]),
          duration: 10000,
          easing: this.elastic
        });
    },
    
    elastic : function(t){
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }
    
});