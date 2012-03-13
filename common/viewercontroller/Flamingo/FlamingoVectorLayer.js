/**
 * @class 
 * @constructor
 * @description The FlamingoVectorLayer class. In flamingo also known as EditMap. 
 **/

Ext.define("viewer.viewercontroller.flamingo.FlamingoVectorLayer",{
    extend: "viewer.viewercontroller.flamingo.FlamingoLayer",
    isLoaded: false,
    config: {
        //@field Array of allowed geometry types on this layer. Possible values: "Point,LineString,Polygon,MultiPolygon,Circle"
        geometrytypes: null,
        //@field true/false show measures of the drawing object
        showmeasures: null,
        //@field the style
        style: {
            //@field (0x000000 – 0xFFFFFF, default: 0xFF0000 ) Fill color. Not applicable to point or line string geometries.
            fillcolor: "0xFF0000",
            //@field (0 – 100, default: 100) Fill opacity. A value of 0 means completely transparent. Not applicable to point or line string geometries. If a feature's geometry is not completely transparent, a click on its fill will make the feature the active feature. If the geometry is completely transparent the user's mouse will click right through it.
            fillopacity: 100,
            //@field (0x000000 – 0xFFFFFF, default: 0xFF0000) Stroke color.
            strokecolor: "0xFF0000",
            //@field (0 – 100, default: 100) Stroke opacity. A value of 0 means completely transparent.
            strokeopacity: 100
        }
    },
    gisId: null,
    /**
     * Creates a vector layer
     * @constructor
     * @param config.visible visible true/false
     * @param config.geometrytypes Array of allowed geometry types on this layer. Possible values: "Point,LineString,Polygon,MultiPolygon,Circle"
     * @param config.showmeasures true/false show measures of the drawing object
     */
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoVectorLayer.superclass.constructor.call(this, config);
        this.initConfig(config);        
        return this;
    },
    
    toXML : function(){    
        var xml= "<fmc:Layer ";
        xml+= "id='"+this.id+"' ";
        xml+= "name='"+this.id+"' ";
        xml+= "visible='true' ";
        if (this.getGeometrytypes()!=null && this.getGeometrytypes().length > 0)
            xml+= "geometrytypes='"+this.getGeometrytypes().join()+"' ";
        if (this.getShowmeasures()!=null)
            xml+= "showmeasures='"+this.getShowmeasures()+"' ";
        xml+=">";
        //add style
        xml+="<fmc:Style ";
        if (this.style.fillcolor!=null)
            xml+="fillcolor='"+this.style.fillcolor+"' ";
        if (this.style.fillopacity!=null)
            xml+="fillopacity='"+this.style.fillopacity+"' ";
        if (this.style.strokecolor!=null)
            xml+="strokecolor='"+this.style.strokecolor+"' ";
        if (this.style.strokeopacity!=null)
            xml+="strokeopacity='"+this.style.strokeopacity+"' ";
        xml+="/></fmc:Layer>";
        return xml;
    },

    getLayerName : function(){
        return this.layerName;
    },

    /**
     * Removes all the features from this vectorlayer
     */
    removeAllFeatures : function(){
        var flamingoObj = this.map.getFrameworkMap();//this.getFrameworkLayer();
        flamingoObj.callMethod(this.gisId,'removeAllLayerFeatures',this.getId(),false);
    },


    /**
     * Gets the active feature from this vector layer
     * @return The active - generic type - feature from this vector layer.
     */
    getActiveFeature : function(){
        var flamingoObj = this.map.getFrameworkMap();//this.getFrameworkLayer();
        var flaFeature = flamingoObj.callMethod(this.gisId,'getActiveFeatureAsObject');

        /* No active feature; return null */
        if(flaFeature == null){
            return null;
        }
        var feature = this.fromFlamingoFeature(flaFeature);

        return feature;
    },

    /**
     * Get the feature on the given index
     * @param index The index of the feature.
     * @return The generic feature type on index
     */
    getFeature : function(index){
        return this.getAllFeatures()[index];
    },

    /**
     * Add a feature to this vector layer.
     * @param feature The generic feature to be added to this vector layer.
     */
    addFeature : function(feature){
        this.map.getFrameworkMap().callMethod(this.map.editMapId,'addFeature',this.getId(),this.toFlamingoFeature(feature));
    },

    /**
     * Gets all features on this vector layer
     * @return Array of generic features.
     */
    getAllFeatures : function(){
        //var flamingoObj = this.getFrameworkLayer();//this.getFrameworkLayer();
        var flamingoFeatures=this.map.getFrameworkMap().callMethod(this.getGisId(),"getFeaturesAsObject",false,this.getId());
        var features = new Array();
        for(var i = 0 ; i< flamingoFeatures.length ; i++){
            var flFeature = flamingoFeatures[i];
            var feature = this.fromFlamingoFeature(flFeature);
            features.push(feature);
        }
        return features;
    },

    /**
     * Orders the flamingo map to start drawing a geometry type
     * @param type the type of the geometry (Point, Polygon, LineString, MultiPolygon)
     */
    drawFeature : function(type){     
        if (this.map!=null && this.map.editMapId!=null)
           this.map.getFrameworkMap().callMethod(this.map.editMapId,"editMapDrawNewGeometry",this.getId(),type );
    },

    /* stop editing */
    stopDrawDrawFeature : function(){
        //this.getFrameworkLayer().callMethod(this.getId(),"removeEditMapCreateGeometry",this.getLayerName());
        this.map.getFrameworkMap().callMethod(this.getId(),"removeEditMapCreateGeometry",this.getLayerName());
    },
    setGisId: function(newGisId){
        this.gisId=newGisId;
    },
    getGisId: function(){
        return this.gisId;
    },

    /**
     * Helper function: Converts the given Flamingo Feature to a generic feature.
     * @param flamingoFeature The FlamingoFeature to be converted
     * @return The generic feature
     */
    fromFlamingoFeature : function(flamingoFeature){
        flamingoFeature.wkt=flamingoFeature.wktgeom;
        var feature = new viewer.viewercontroller.controller.Feature(flamingoFeature);
        return feature;
    },
    /**
     * Converts th feature to a FlamingoFeature
     * @param feature a viewer.viewercontroller.controller.Feature object
     * @return The Flamingotype feature
     */
    toFlamingoFeature : function(feature){
        var flFeature = new Object();
        flFeature["id"]= feature.getId();
        flFeature["wktgeom"] = feature.getWkt();
        return flFeature;
    }
});
