/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3VectorLayer",{
    extend: "viewer.viewercontroller.controller.VectorLayer",
    mixins: {
        openLayersLayer: "viewer.viewercontroller.openlayers3.OpenLayers3Layer"
    },
    point:null,
    line:null,
    polygon:null,
    circle: null,
    box:null,
    freehand:null,
    drawFeatureControls: null,
    activeDrawFeatureControl: null,
    modifyFeature:null,
    constructor : function (config){
           
    
    }
    
    
    
    
    });
    