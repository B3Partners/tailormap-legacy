/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define ("viewer.viewercontroller.openlayers3.components.OpenLayers3LoadMonitor",{
    extend: "viewer.viewercontroller.openlayers3.OpenLayers3Component",    
    config:{
        top:null,
        left:null,
        timeout:null
    },
    
    constructor: function (conf){    
        viewer.viewercontroller.openlayers3.components.OpenLayers3LoadMonitor.superclass.constructor.call(this, conf);
        // Make the control and add it to the openlayersmap
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        console.log(conf);
        this.frameworkObject = new ol.control.LoadingPanel({
            timeOut: this.config.timeout,
            left:this.config.left,
            top:this.config.top
        });
        map.addControl(this.frameworkObject);
        
       
        
        return this;
    },
 
    getExtComponents: function() {
        return [];
    }
    
});