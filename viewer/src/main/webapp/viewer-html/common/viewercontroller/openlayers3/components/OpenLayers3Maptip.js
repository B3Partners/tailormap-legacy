/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define ("viewer.viewercontroller.openlayers3.components.OpenLayers3Maptip",{
    extend: "viewer.viewercontroller.openlayers3.OpenLayers3Component",    
    map: null,
    /**
     * @constructor
     * @param {Object} conf
     * @param {type} map
     * @returns {viewer.viewercontroller.openlayers.components.OpenLayersMaptip}
     */
    constructor: function(conf,map){
        viewer.viewercontroller.openlayers3.components.OpenLayers3Maptip.superclass.constructor.call(this,conf);
        this.map = map;
        //console.log(conf);
        this.frameworkObject = new ol.interaction.Pointer({handleMoveEvent:function(evt){console.log('');},
        handleUpEvent:function(evt){console.log('pause');}
        });
        //this.frameworkObject.on('change:active', function(evt){console.log(evt);},this );
        //console.log(this.frameworkObject.handleEvent('pointermove'));
        //this.map.getFrameworkMap().addInteraction(this.frameworkObject);
        this.map.getFrameworkMap().on('click', function(evt) {
            console.log('maptip fired');
            this.map.fire(viewer.viewercontroller.controller.Event.ON_MAPTIP,evt);
        //var pixel = map.getEventPixel(evt.originalEvent);
        //displayFeatureInfo(pixel);
      },this);
        
    }
    
    
    });