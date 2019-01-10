/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




Ext.define("viewer.viewercontroller.ol.OlSnappingController", {
    extend: "viewer.viewercontroller.controller.SnappingController",
    /**
     * editable/drawable OpenLayers Vector layer.
     * @private
     * TODO refactor to array as each edit & draw control have their own layer
     */
    frameworkLayer: null,
    /** snapping control.*/
    frameworkControl: null,
    config: {
        style: {
            strokeColor: '#FF00FF',
            strokeOpacity: 0.5,
            strokeWidth: 1,
            pointRadius: 1,
            fillOpacity: 0.25,
            fillColor: '#FF00FF'
        },
        viewerController: null
    },
    /**
     * OpenLayers Vector layers to snap to.
     * @private
     */
    //snapLayers: [],
    /**
     * name prefix of the built-in snapLayers
     */
    //snapLayers_prefix: "snapping_",
    /**
     * OpenLayers Map.
     * @private
     */
    frameworkMap: null,
    /**
     * @constructor
     * @param {Object} config
     * @returns {viewer.viewercontroller.openlayers.OpenLayersSnappingController}
     */
    constructor: function (config) {
        viewer.viewercontroller.ol.OlSnappingController.superclass.constructor.call(this, config);

        this.frameworkMap = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        this.frameworkControl = new ol.interaction.Snap({source:this.frameworkLayer});

        this.config.viewerController.mapComponent.getMap().addListener(
                viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,
                this.layerAdded, this);
        this.config.viewerController.mapComponent.getMap().addListener(
                viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT,
                this.changedExtent, this);
        // this.config.viewerController.mapComponent.getMap().addListener(
        //         viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,
        //         this.layerRemoved, this);

        return this;
    },
    getLayer : function(name,map){
        var layers = map.getLayers();

        for(var i =0; i < layers.getLength();i++){

            if(name == layers.item(i).get('id')){
                return layers.item(i); 
            }
        }
    },
    parseFeatures: function (data) {
           // note the scope here! "this" is actually not "me" but a composite of "me" and "appLayer"
        var geometryAttributeIndex = this.appLayer.geometryAttributeIndex;
        var lName = this.me.getlayerName(this.appLayer);

        var rLyrs = this.me.getLayer(lName,this.me.frameworkMap);
        if (rLyrs.length > 0) {
            // there should only be one layer in the rLyr
            this.frameworkLayer = rLyrs[0];
            this.frameworkLayer.removeAllFeatures();
        } else {
            // create a primitive OL vector layer
            this.frameworkLayer = new ol.layer.Vector({
                    source: new ol.source.Vector()
                }                    
            );
            this.me.snapLayers.push(this.frameworkLayer);
            this.me.frameworkMap.addLayer(this.frameworkLayer);
            //this.me.frameworkControl.addTargetLayer(olLyr);
        }

        var feats = [];
        var olGeom, wkt;
        var wktFormat = new ol.format.WKT();
        data.forEach(function (element, index, array) {
            // test for keys in element, some WFS just return all attributes anyway..
            if (Object.keys(element).length > 2 &&
                    !(Object.keys(element).length === 3 && Object.keys(element)[2] === 'related_featuretypes')) {
                wkt = element[Object.keys(element)[geometryAttributeIndex]];
            } else {
                wkt = element[Object.keys(element)[1]];
            }
            olGeom = wktFormat.readGeometry(wkt);
            olGeom.getExtent();
            var olFeature = new ol.Feature();
            olFeature.setGeometry(olGeom);
            feats.push(olFeature);
        });
        this.frameworkLayer.getSource().addFeatures(feats);
        this.me.activate();
    },
    
    changedExtent: function (map, extent) {
        for (var i = 0; i < this.snapLayers.length; i++) {
            //this.addAppLayer(this.getAppLayer(this.snapLayers[i].name));
        }
    },
    
    addAppLayer: function (appLayer) {
        var me = this;
        // lookup feature source
        var featureService = this.config.viewerController.getAppLayerFeatureService(appLayer);
        if (appLayer.attributes === undefined) {
            // find geom attribute, then load data
            featureService.loadAttributes(appLayer, function (result) {
                me.loadAttributes(appLayer.attributes[appLayer.geometryAttributeIndex], featureService, appLayer);
            });
        } else {
            me.loadAttributes(appLayer.attributes[appLayer.geometryAttributeIndex], featureService, appLayer);
        }

    },
    
    getlayerName: function (appLayer) {
        return appLayer.id;
    },
    
    loadAttributes: function (geomAttribute, featureService, appLayer) {
        var me = this;
        var extent = me.config.viewerController.mapComponent.getMap().getExtent();
        extent = this.toWKT(extent);
        featureService.loadFeatures(
                appLayer,
                me.parseFeatures,
                function (msg) {
                    Ext.MessageBox.alert("Foutmelding", msg);
                }, {
            store: 1,
            limit: 1000,
            arrays: 1,
            // just get geometry
            attributesToInclude: [geomAttribute.id],
            edit: false,
            graph: true,
            // only for map extent
            filter: "INTERSECTS(" + geomAttribute.name + ", " + extent + ")"
        }, {
            /* we need access to appLayer.id and this in processing the response */
            me: me,
            appLayer: appLayer
        });
    },
    
    layerAdded: function (map, options) {
        if (options.layer &&
                Ext.Array.contains(this.config.viewerController.registeredSnappingLayers, options.layer)) {
            this.frameworkLayer = options.layer.getFrameworkLayer();
            //this.frameworkControl.setLayer(this.frameworkLayer);
            this.activate();
        }
    },
    
    removeLayer: function (appLayer) {
        this.deactivate();
        // look up snappingLayer primitive by name/id...
        // there should only be one layer in the rLyr
        var rLyr = this.frameworkMap.getLayersByName(this.getlayerName(appLayer))[0];
        if (rLyr) {
            Ext.Array.remove(this.snapLayers, rLyr);
            this.frameworkMap.removeLayer(rLyr);
            this.frameworkControl.removeTargetLayer(rLyr);
        }
        this.activate();
    },
    
    toWKT: function (extent){
        var wkt="POLYGON((";
        wkt+=extent[0]+" "+extent[1]+", ";
        wkt+=extent[2]+" "+extent[1]+", ";
        wkt+=extent[2]+" "+extent[3]+", ";
        wkt+=extent[0]+" "+extent[3]+", ";
        wkt+=extent[0]+" "+extent[1]+"))";
        return wkt;
    },

    
    removeAll: function () {
        for (var i = 0; i < this.snapLayers.length; i++) {
            this.frameworkControl.removeTargetLayer(this.snapLayers[i]);
            this.frameworkMap.removeLayer(this.snapLayers[i]);
        }
        this.snapLayers = [];
        this.deactivate();
    },
    
    activate: function () {
        if (this.snapLayers.length > 0) {
            this.frameworkControl.setActive(true);
        }
    },
    deactivate: function () {
        this.frameworkControl.setActive(false);
    },
    
     getAppLayer: function (name) {
        var id = name.substring(this.snapLayers_prefix.length);
        return (this.config.viewerController.getAppLayerById(id));
    }

});