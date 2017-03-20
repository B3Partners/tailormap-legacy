/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Abstract component to for vectorlayers.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author mprins
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
            //@field (0 – 100, default: 50) Fill opacity. A value of 0 means completely transparent. Not applicable to point or line string geometries. If a feature's geometry is not completely transparent, a click on its fill will make the feature the active feature. If the geometry is completely transparent the user's mouse will click right through it.
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
    /**
     ** Note: subclasses should call this method to add the keylistener.
     * @param {String} type geometry type to draw
     *
     */
    drawFeature : function(type){
        // listen for certain key-press events in the document to undo editing
        var me = this;
        Ext.getDoc().on('keydown', me._keyListener, me);
    },
    /**
     * Note: subclasses should call this method to remove the added keylistener.
     */
    stopDrawing: function () {
        // remove the previously added key listener
        var me = this;
        Ext.getDoc().un('keydown', me._keyListener, me);
    },
    /**
     * handle CTRL-Z, CTRL-Y and ESC keydown.
     * @param {Ext.event.Event} evt the Ext.event.Event
     * @param {Ext.dom.Element} t the targett (not used)
     * @param {Object} eOpts any options from the addListener call (not used)
     */
    _keyListener: function (evt, t, eOpts) {
        //var me = this;
        switch (evt.keyCode) {
            case 90: // z
                if (evt.metaKey || evt.ctrlKey) {
                    this.undoSketch();
                }
                break;
            case 89: // y
                if (evt.metaKey || evt.ctrlKey) {
                    this.redoSketch();
                }
                break;
            case 27: // esc
                this.cancelSketch();
                break;
        }
    },
    /** handle CTRL-Z key when drawing. */
    undoSketch: function () {
        Ext.Error.raise({msg: "VectorLayer.undoSketch() Not implemented! Must be implemented in sub-class"});
    },
    /** handle CTRL-Y key when drawing. */
    redoSketch: function () {
        Ext.Error.raise({msg: "VectorLayer.redoSketch() Not implemented! Must be implemented in sub-class"});
    },
    /** handle ESC key when drawing. */
    cancelSketch: function () {
        Ext.Error.raise({msg: "VectorLayer.cancelSketch() Not implemented! Must be implemented in sub-class"});
    }
});
