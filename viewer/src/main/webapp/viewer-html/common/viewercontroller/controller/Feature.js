/* global Ext */

/**
 * @class
 * @param id The id of the Feature
 * @param wkt The wkt describing the Feature
 * @description The generic class for defining a feature. A feature consists of a id and a wkt.
 *           Convenience methods for converting from and to viewerspecific features.
 */
Ext.define("viewer.viewercontroller.controller.Feature",{
    config:{
        id:null,
        wktgeom:null,
        color:null,
        label:null,
        style: null,
        attributes: {}
    },
    /**
     * @param {Object} config
     * @constructor
     */
    constructor: function (config){
        this.initConfig(config);
        if(!this.label){
            this.label = "";
        }
        if(config.style){
            this.style = Ext.create("viewer.viewercontroller.controller.FeatureStyle", config.style);
        }
    },
    
    setStyle: function (style){
        this.style = style;
    },

    /**
     * @returns {FeatureStyle|null}
     */
    getStyle: function() {
        return this.style;
    },

    getAttributes: function() {
        return this.config.attributes;
    },

    /**
     * Function to get the JSON representation for this feature object.
     * @return {Object} this feature as an object
     */
    toJsonObject : function (){
        var json = {};
        json.id = this._id;
        json.wktgeom = this._wktgeom;
        json.label = this.label;
        json.style = this.style.getProperties();
        return json;
    },
    /**
     * get the extent of this feature, only works for 2D space.
     * @return {viewer.viewercontroller.controller.Extent} The extent of this feature (or null when there is valid geometry)
     */
    getExtent: function () {
        if (this._wktgeom === null) {
            return null;
        }
        var regex = /(\d+[\.]?\d*)/g;
        var vertices = (this._wktgeom).match(regex);
        if (vertices === null) {
            return null;
        }
        var xcoords = [];
        var ycoords = [];
        for (var i = 0; i < vertices.length; i++) {
            if (i % 2 === 0) {
                xcoords.push(parseFloat(vertices[i]));
            } else {
                ycoords.push(parseFloat(vertices[i]));
            }
        }
        return Ext.create('viewer.viewercontroller.controller.Extent',
            Ext.Array.min(xcoords),
            Ext.Array.min(ycoords),
            Ext.Array.max(xcoords),
            Ext.Array.max(ycoords));
    }
});
