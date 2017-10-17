/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global ol */

Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3VectorLayer",{
    extend: "viewer.viewercontroller.controller.VectorLayer",
    mixins: {
        openLayers3Layer: "viewer.viewercontroller.openlayers3.OpenLayers3Layer"
    },
    draw:null,
    point:null,
    line:null,
    polygon:null,
    circle: null,
    source:null,
    box:null,
    tempFeature:null,
    tempStyle:null,
    idNumber:0,
    freehand:null,
    drawFeatureControls: null,
    activeDrawFeatureControl: null,
    modifyFeature:null,
    constructor : function (config){
        config.colorPrefix = '#';
        viewer.viewercontroller.openlayers3.OpenLayers3VectorLayer.superclass.constructor.call(this, config);
        this.mixins.openLayers3Layer.constructor.call(this,config);
        this.defColor = this.colorPrefix + config.style['fillcolor'];
        
        this.draw = new ol.interaction.Draw({type:'Point'});
        this.drawBox =  new ol.interaction.DragBox({
           condition: ol.events.condition.noModifierKeys,
           style: new ol.style.Style({
           stroke: new ol.style.Stroke({
           color: [0, 0, 255, 1]
           })
           })
       });
        this.maps = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var index  = this.config.viewerController.mapComponent.getMap().getFrameworkMap().getLayers().getLength() +1;
        this.source = new ol.source.Vector();           
        
        var selectFill = new ol.style.Fill({
            color: this.colorPrefix + config.style['fillcolor']
        });
        var selectStroke = new ol.style.Stroke({
            color: '#FF0000',
            width: 2
        });
        this.selectStyle = new ol.style.Style({
            image: new ol.style.Circle({
            fill: selectFill,
            stroke: selectStroke,
            radius: 6
        }),
        fill: selectFill,
        stroke: selectStroke
        });
        
        this.frameworkLayer = new ol.layer.Vector({
            zIndex:index,
            source: this.source
        });

        this.select = new ol.interaction.Select({
            layers:[this.frameworkLayer],
            style: this.selectStyle
        });

        this.modify = new ol.interaction.Modify({
        features: this.select.getFeatures()
        });  
        
      this.select.getFeatures().on('add',this.activeFeatureChanged,this);
      this.source.on('addfeature',this.featureAdded,this );
      this.modify.on('modifyend',this.featureModified,this);
      this.drawBox.on('boxend', function(evt){
           var geom = evt.target.getGeometry();
           var feat = new ol.Feature({geometry: geom});
           this.source.addFeature(feat);
           this.drawBox.setActive(false);
       },this);
     
      this.maps.addInteraction(this.drawBox);
      this.maps.addInteraction(this.select);
      this.maps.addInteraction(this.modify);
      this.select.setActive(false);
      this.drawBox.setActive(false);
        
      this.type=viewer.viewercontroller.controller.Layer.VECTOR_TYPE;
        
    },
    
    getCurrtentStyle : function(){
        var color = ol.color.asArray(this.colorPrefix+ this.style['fillcolor']);
            color = color.slice();
            color[3] = 0.2;
        var featureFill = new ol.style.Fill({
            //color: this.colorPrefix+ this.style['strokecolor']
            color:color
        });
        var featureStroke = new ol.style.Stroke({
            color: this.colorPrefix+ this.style['fillcolor'],
            width: 3,
            opacity: 0.5
        });
        var featureStyle = new ol.style.Style({
            image: new ol.style.Circle({
            fill: featureFill,
            stroke: featureStroke,
            radius: 5
        }),
        fill: featureFill,
        stroke: featureStroke
        });
        return featureStyle;   
    },
    removeAllFeatures : function(){
        this.select.getFeatures().clear();
        this.source.clear();
        this.maps.removeInteraction(this.draw);
        this.drawBox.setActive(false);
    },
    removeFeature : function (feature){    
        var olFeature = this.source.getFeatureById(feature.getId());
        this.select.getFeatures().clear();
        this.source.removeFeature(olFeature);
    },
    getFeature : function(id){
        Ext.Error.raise({msg: "VectorLayer.getFeature() Not implemented! Must be implemented in sub-class"});
    },
    getFeatureById : function (featureId){
        return this.fromOpenLayersFeature(this.source.getFeatureById(featureId));
    },
    getAllFeatures : function(){
        var olFeatures = this.source.getFeatures();
        var features = new Array();
        for(var i = 0 ; i < olFeatures.length;i++){
            var olFeature = olFeatures[i];
            var feature = this.fromOpenLayersFeature(olFeature);
            features.push(feature);
        }
        return features;
    },
    
    getActiveFeature : function(){        
        var olFeature = this.select.getFeatures().item(0);
        if (olFeature){
            var feature = this.fromOpenLayersFeature(olFeature);
            return feature;
        }else{
            return null;
        }
    },
    
    addFeature : function(feature){
        var features = new Array();
        features.push(feature);
        this.addFeatures(features);
        
    },
    addFeatures : function(features){
       var olFeatures = new Array();
        for(var i = 0 ; i < features.length ; i++){
            var feature = features[i];
            var olFeature = this.toOpenLayersFeature(feature);
            olFeatures.push(olFeature);
            olFeature.setStyle(this.getCurrtentStyle());
            if (feature.config.label) {
                olFeature.getStyle().setText(new ol.style.Text({text:feature.config.label}));
            }
            // check if a colour was specified on the feature and set that for drawing
            if (feature.config.color) {
                olFeature.getStyle().getStroke().setColor(this.colorPrefix +feature.config.color);
                var color = ol.color.asArray(this.colorPrefix+feature.config.color);
                color = color.slice();
                color[3] = 0.2;
                olFeature.getStyle().getFill().setColor(color);
            }
        }
        return this.source.addFeatures(olFeatures);
    },
    setLabel : function (id, label){
        var olFeature = this.source.getFeatureById(id);
        if(olFeature){
            if(label){
                olFeature.getStyle().setText(new ol.style.Text({text:label}));
            }
            else{
                olFeature.getStyle().setText(new ol.style.Text({text:''}));
            }
            //this.selectStyle.setText(new ol.style.Text({text:label}));
            //this.source.refresh();
            //this.selectStyle.setText(new ol.style.Text({text:''}));
        }
    },
    /**
     ** Note: subclasses should call this method to add the keylistener.
     * @param {String} type geometry type to draw
     *
     */
    drawFeature : function(type){
        this.drawBox.setActive(false);
        this.select.setActive(false);
        this.maps.removeInteraction(this.draw);
        
        this.superclass.drawFeature.call(this, type);
        if (type === "Point") {
            this.addInteraction(type,false);
        } else if (type === "LineString") {
            this.addInteraction(type,false);
        } else if (type === "Polygon") {
            this.addInteraction(type,false);
        } else if (type === "Circle") {
            this.addInteraction(type,false);
        } else if (type === "Box") {
            this.drawBox.setActive(true);
        } else if (type === "Freehand") {
            this.addInteraction("Polygon",true);
        } else {
           this.config.viewerController.logger.warning("Feature type >" + type + "< not implemented!");
        }
    },
    
    addInteraction : function(type,free){
        this.draw = new ol.interaction.Draw({type:type,
        source:this.source,
        freehand:free
        });  
        this.maps.addInteraction(this.draw);
        this.draw.on('drawend',function(evt){
            this.select.setActive(true);
            evt.feature.setId("OpenLayers_Feature_Vector_"+this.idNumber);
            //this.select.setActive(true);
            this.idNumber++;
            this.maps.removeInteraction(this.draw);},this);
    },

    /**
     * Note: subclasses should call this method to remove the added keylistener.
     */
    stopDrawing: function () {
        // remove the previously added key listener
        var me = this;
        Ext.getDoc().un('keydown', me._keyListener, me);
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
    },
    
    /**
     * Helper function: Converts the given OpenLayers Feature to the generic feature.
     * @param openLayersFeature The OpenLayersFeature to be converted
     * @return The generic feature
     */
    fromOpenLayersFeature : function(openLayersFeature){
        var wktFormat= new ol.format.WKT();
        var temp =openLayersFeature.getGeometry();
        if(openLayersFeature.getGeometry().getType()=='Circle'){
             openLayersFeature.setGeometry(ol.geom.Polygon.fromCircle(openLayersFeature.getGeometry()));
        }
        var wkt = wktFormat.writeGeometry(openLayersFeature.getGeometry());
        var feature = new viewer.viewercontroller.controller.Feature(
        {
            id:openLayersFeature.getId(),
            wktgeom: wkt
        });
        if(openLayersFeature.getStyle()){
            if(openLayersFeature.getStyle().getText()){
                feature.label = openLayersFeature.getStyle().getText().getText();
            }
            var color = openLayersFeature.getStyle().getFill().getColor();
            if(color.indexOf("#") !== -1){
                color = color.substring(color.indexOf("#")+1, color.length);
            }
            feature.color = color;
        }
        openLayersFeature.setGeometry(temp);
        return feature;
    }, 
    
    toOpenLayersFeature : function(feature){
        var wktFormat= new ol.format.WKT();
        var geom = wktFormat.readGeometry(feature.config.wktgeom);
        console.log(feature);
        console.log(geom);
        var olFeature = new ol.Feature();
        olFeature.setGeometry(geom);
        olFeature.setStyle(this.getCurrtentStyle(feature.config.color));
        olFeature.getStyle().setText(new ol.style.Text({text:feature.config.label}));
        olFeature.setId(feature.config.id);
        return olFeature;
    },
    
    /**
     * Called when a feature is added to the vectorlayer. and fires @see viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED
     */
    
    featureAdded : function(object){
        this.select.getFeatures().clear();
        this.select.getFeatures().push(object.feature);
        var feature = this.fromOpenLayersFeature(object.feature);
        
        // If no stylehash is set for the feature, set it to the current settings
        if(!object.feature.getStyle()){
            object.feature.setStyle(this.getCurrtentStyle());
        }
        this.editFeature(object.feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this,feature);
    },
    
    editFeature : function(feature){
        //this.select.getFeatures().clear();
        //this.select.getFeatures().push(feature);
        var featureObject = this.fromOpenLayersFeature(feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,featureObject);
    },
    
    featureModified : function (evt) {
        var featureObject = this.fromOpenLayersFeature(evt.features.getArray()[0]);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,featureObject);
    },
    
    activeFeatureChanged : function(object){
        //object.element.setStyle(this.selectStyle);
        var feature = this.fromOpenLayersFeature(object.element);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,feature);
    },
    
    adjustStyle : function(){

    },
    
    getVisible: function(){
        return this.mixins.openLayers3Layer.getVisible.call(this);
    },
    
    reload: function (){
        this.mixins.openLayers3Layer.reload.call(this);
    },
    getType : function (){
        return this.mixins.openLayers3Layer.getType.call(this);
    }
    
    });
   