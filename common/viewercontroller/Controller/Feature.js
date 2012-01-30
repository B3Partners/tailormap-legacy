/**
 * @class 
 * @constructor
 * @param id The id of the Feature
 * @param wkt The wkt describing the Feature
 * @description
 * The generic class for defining a feature. A feature consists of a id and a wkt. Convenience methods for converting from and to viewerspecific features.
 */
Ext.define("viewer.viewercontroller.controller.Feature",{
    constructor: function (id,wkt){
        
        this.id = id;
        this.wkt = wkt;
       // this.wktParser = new OpenLayers.Format.WKT();
    },
    
    getId : function(){
        return this.id;
    },

    getWkt : function(){
        return this.wkt;
    },

    /**
     * Converts this feature to a OpenLayersFeature
     * @return The OpenLayerstype feature
     */
    toOpenLayersFeature : function(){
        throw ("Not yet implemented");
       // var olFeature = this.wktParser.read(this.getWkt());
       // return olFeature;
    },

    /**
     * Helper function: Converts the given OpenLayers Feature to the generic feature.
     * @param openLayersFeature The OpenLayersFeature to be converted
     * @return The generic feature
     */
    fromOpenLayersFeature : function(openLayersFeature){
        var feature = new viewer.viewercontroller.controller.Feature(openLayersFeature.id,openLayersFeature.geometry.toString());
        return feature;
    },

    /**
     * Converts this feature to a FlamingoFeature
     * @return The Flamingotype feature
     */
    toFlamingoFeature : function(){
        var flFeature = new Object();
        flFeature["id"]= this.getId();
        flFeature["wktgeom"] = this.getWkt();
        return flFeature;
    },

    /**
     * Helper function: Converts the given Flamingo Feature to the generic feature.
     * @param flamingoFeature The FlamingoFeature to be converted
     * @return The generic feature
     */
    fromFlamingoFeature : function(flamingoFeature){
        var feature = new viewer.viewercontroller.controller.Feature(flamingoFeature["id"],flamingoFeature["wktgeom"]);
        return feature;
    }

});