/**
 * @class 
 * @constructor
 * @param id The id of the Feature
 * @param wkt The wkt describing the Feature
 * @description
 * The generic class for defining a feature. A feature consists of a id and a wkt. Convenience methods for converting from and to viewerspecific features.
 */
Ext.define("viewer.viewercontroller.controller.Feature",{
    config:{
        id:null,
        wktgeom:null,
        color:null,
        label:null
    },
    constructor: function (config){
        this.initConfig(config);
        if(this.label == null){
            this.label = "";
        }
       // this.wktParser = new OpenLayers.Format.WKT();
    },

    
    
    /**
     * Function to get the JSON representation for this feature object.
     */
    toJsonObject : function (){
        var json = {};
        json.id = this.id;
        json.wktgeom = this._wktgeom;
        json.color = this.color;
        json.label = this.label;
        return json;
    }

});