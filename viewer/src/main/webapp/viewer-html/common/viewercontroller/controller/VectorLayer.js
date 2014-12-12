/*
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Abstract component to for vectorlayers
  *@author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.viewercontroller.controller.VectorLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    config: {
        //@field Array of allowed geometry types on this layer. Possible values: "Point,LineString,Polygon,MultiPolygon,Circle"
        geometrytypes: null,
        //@field true/false show measures of the drawing object
        showmeasures: null,
        //@field true/false if true the point's in this layer can be dragged.
        editable: true,
        //@field name of the label
        labelPropertyName: null,
        //@field the style
        style: {
            //@field (0x000000 – 0xFFFFFF, default: 0xFF0000 ) Fill color. Not applicable to point or line string geometries.
            fillcolor: "0xFF0000",
            //@field (0 – 100, default: 100) Fill opacity. A value of 0 means completely transparent. Not applicable to point or line string geometries. If a feature's geometry is not completely transparent, a click on its fill will make the feature the active feature. If the geometry is completely transparent the user's mouse will click right through it.
            fillopacity: 50,
            //@field (0x000000 – 0xFFFFFF, default: 0xFF0000) Stroke color.
            strokecolor: "0xFF0000",
            //@field (0 – 100, default: 100) Stroke opacity. A value of 0 means completely transparent.
            strokeopacity: 100
        },
        colorPrefix:null
    },
    constructor : function (config){
        viewer.viewercontroller.controller.VectorLayer.superclass.constructor.call(this, config);
    },
    removeAllFeatures : function(){
        Ext.Error.raise({msg: "VectorLayer.removeAllFeatures() Not implemented! Must be implemented in sub-class"});
    },
    removeFeature : function (feature){
        Ext.Error.raise({msg: "VectorLayer.removeFeature() Not implemented! Must be implemented in sub-class"});
    },
    getActiveFeature : function(){
        Ext.Error.raise({msg: "VectorLayer.getActiveFeature() Not implemented! Must be implemented in sub-class"});
    },
    getFeature : function(id){
        Ext.Error.raise({msg: "VectorLayer.getFeature() Not implemented! Must be implemented in sub-class"});
    },
    getFeatureById : function (featureId){
        Ext.Error.raise({msg: "VectorLayer.getFeatureById() Not implemented! Must be implemented in sub-class"});
    },
    getAllFeatures : function(){
        Ext.Error.raise({msg: "VectorLayer.getAllFeatures() Not implemented! Must be implemented in sub-class"});
    },
    addFeature : function(feature){
        Ext.Error.raise({msg: "VectorLayer.addFeature() Not implemented! Must be implemented in sub-class"});
    },
    addFeatures : function(features){
        Ext.Error.raise({msg: "VectorLayer.addFeatures() Not implemented! Must be implemented in sub-class"});
    },
    drawFeature : function(type){
        Ext.Error.raise({msg: "VectorLayer.drawFeature() Not implemented! Must be implemented in sub-class"});
    },
    stopDrawing : function(){
        Ext.Error.raise({msg: "VectorLayer.stopDrawing() Not implemented! Must be implemented in sub-class"});
    }
});