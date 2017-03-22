/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3Layer",{        
    config:{
        name: null
    },
    constructor :function (config){        
        this.initConfig(config);
        this.enabledEvents = new Object();
        this.events = new Object();
        return this;
    },
    
    setVisible : function (visible){
        this.visible=visible;
        if (this.frameworkLayer!=null){
            this.frameworkLayer.setVisible(visible);
        }
    }
    });