/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global ol */

Ext.define("viewer.viewercontroller.openlayers3.Utils",{
    createBounds : function(extent){
        return [Number(extent.minx),Number(extent.miny),Number(extent.maxx),Number(extent.maxy)];
    },
    createExtent : function(bounds){
        return new viewer.viewercontroller.controller.Extent(bounds.left,bounds.bottom,bounds.right,bounds.top);
    }
});