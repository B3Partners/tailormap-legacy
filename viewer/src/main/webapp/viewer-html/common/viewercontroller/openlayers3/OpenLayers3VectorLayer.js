/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



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
        this.draw = new ol.interaction.Draw({type:'Point'});
        this.maps = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var index  = this.config.viewerController.mapComponent.getMap().getFrameworkMap().getLayers().getLength() +1;
        this.source = new ol.source.Vector();           
                
        this.styles = new ol.style.Style({
                fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#32ff44',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#32ff44'
                })
            })
            });
        
        this.frameworkLayer = new ol.layer.Vector({
            zIndex:index,
            source: this.source
        });

        this.select = new ol.interaction.Select({
            layers:[this.frameworkLayer],
            style: this.styles
        });

        this.modify = new ol.interaction.Modify({
        features: this.select.getFeatures()
        });  
        
      this.select.on('select',this.activeFeatureChanged,this);
      this.source.on('addfeature',this.featureAdded,this );
      this.modify.on('modifyend',this.featureModified,this);
      
      this.maps.addInteraction(this.select);
      this.maps.addInteraction(this.modify);
      this.select.setActive(false);
        
      this.type=viewer.viewercontroller.controller.Layer.VECTOR_TYPE;
        
    },
    removeAllFeatures : function(){
        
        this.source.clear();
        this.maps.removeInteraction(this.draw);
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
        return this.source.getFeatureById(featureId);
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
    addFeature : function(feature){
        var features = new Array();
        features.push(feature);
        this.addFeatures(features);
        
    },
    addFeatures : function(features){
       var olFeatures = new Array();
       console.log('lengte'+features.length);
        for(var i = 0 ; i < features.length ; i++){
            var feature = features[i];
            var olFeature = this.toOpenLayersFeature(feature);
            console.log('ja');
            console.log(olFeature);
            olFeatures.push(olFeature);
           // olFeature.style = this.getCurrentStyleHash();
            // Check if framework independed feature has a label. If so, set it to the style
            if (feature.config.label) {
                //olFeature.style['label'] = feature.config.label;
            }
            // check if a colour was specified on the feature and set that for drawing
            if (feature.config.color) {
               // olFeature.style['fillcolor'] = feature.config.color;
                //olFeature.style['strokecolor'] = feature.config.color;
            }
        }
        console.log('jaoeheo');
        return this.source.addFeatures(olFeatures);
    },
    setLabel : function (id, label){
        if(id && label){
        var olFeature = this.source.getFeatureById(id);
        if(olFeature){
            this.reload();
        var style = olFeature.getStyle();
        style.setText(new ol.style.Text({text:label}));
        olFeature.setStyle(style);
    }
        if(this.tempStyle){
        this.tempStyle.setText(new ol.style.Text({text:label}));
    }
        }
    },
    /**
     ** Note: subclasses should call this method to add the keylistener.
     * @param {String} type geometry type to draw
     *
     */
    drawFeature : function(type){
        
        this.select.setActive(false);
        this.maps.removeInteraction(this.draw);
        
        this.superclass.drawFeature.call(this, type);
        if (type === "Point") {
            this.addInteraction(type);
        } else if (type === "LineString") {
            this.addInteraction(type);
            console.log('LineString')
        } else if (type === "Polygon") {
            this.addInteraction(type);
            console.log('Polygon')
        } else if (type === "Circle") {
            this.addInteraction(type);
            console.log('Circle')
        } else if (type === "Box") {
            this.addInteraction(type);
            console.log('Box')
        } else if (type === "Freehand") {
            this.addInteraction(type);
            console.log('Freehand')
        } else {
           this.config.viewerController.logger.warning("Feature type >" + type + "< not implemented!");
        }
    },
    
    addInteraction : function(type){
      this.draw = new ol.interaction.Draw({type:type,
      source:this.source});  
      this.maps.addInteraction(this.draw);
      this.draw.on('drawend',function(evt){
          this.select.setActive(true);
          var nstyle =new ol.style.Style({
                fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff3131',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ff3131'
                })
            })
            });
        evt.feature.setStyle(nstyle);
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
        console.log(openLayersFeature.getGeometry().getType());
        if(openLayersFeature.getGeometry().getType()=='Circle'){
             openLayersFeature.setGeometry(ol.geom.Polygon.fromCircle(openLayersFeature.getGeometry()));
        }
        var wkt = wktFormat.writeGeometry(openLayersFeature.getGeometry());
        var feature = new viewer.viewercontroller.controller.Feature(
        {
            id:openLayersFeature.getId(),
            wktgeom: wkt
        });
        if(openLayersFeature.style){
            feature.label = openLayersFeature.style.label;
            var color = openLayersFeature.style.fillColor;
            if(color.indexOf("#") !== -1){
                color = color.substring(color.indexOf("#")+1, color.length);
            }
            feature.color = color;
        }
        console.log('hier22');
        openLayersFeature.setGeometry(temp);
        console.log('hier23');
        return feature;
    }, 
    
    toOpenLayersFeature : function(feature){
        var wktFormat= new ol.format.WKT();
        var geom = wktFormat.readGeometry(feature.config.wktgeom);
        var olFeature = new ol.Feature();
        olFeature.setGeometry(geom);
        olFeature.setStyle(this.styles);
        return olFeature;
        
    },
    
    /**
     * Called when a feature is added to the vectorlayer. and fires @see viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED
     */
    
    featureAdded : function(object){
        console.log('added');
        var feature = this.fromOpenLayersFeature(object.feature);
        
        // If no stylehash is set for the feature, set it to the current settings
        //if(!object.feature.style){
            //object.feature.style = this.getCurrentStyleHash();
        //}
        this.editFeature(object.feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this,feature);
        console.log('hier');
    },
    
    editFeature : function(feature){
        var featureObject = this.fromOpenLayersFeature (feature);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,featureObject);
    },
    
    featureModified : function (evt) {
        console.log('modi');
        var featureObject = this.fromOpenLayersFeature(evt.features.getArray()[0]);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,featureObject);
    },
    
    activeFeatureChanged : function(object){
        if(!object.selected[0]){
            this.tempFeature.setStyle(this.tempStyle);
            this.styles.setText(new ol.style.Text({text:''}));
            return;
        }
        if(this.tempFeature !== null){
            this.tempFeature.setStyle(this.tempStyle);
            this.styles.setText(new ol.style.Text({text:''}));
        }
        var selected = object.selected[0];
        this.tempFeature = object.selected[0];
        this.tempStyle = object.selected[0].getStyle();
        var feature = this.fromOpenLayersFeature (object.selected[0]);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this,feature);
        this.styles.setText(selected.getStyle().getText());
        selected.setStyle(this.styles);
    },
    
    adjustStyle : function(color){
        console.log(color);
        color = '#'+color;
        if(this.tempStyle){
            this.tempStyle.getStroke().setColor(color);
        }
    },
    
    reload: function (){
        this.mixins.openLayers3Layer.reload.call(this);
    }
    
    });
   