/* 
 * Copyright (C) 2014 3Partners B.V.
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
/* global Ext, contextPath, actionBeans, FlamingoAppLoader */
/**.
 * Spatial Filter component
 * This component adds the functionality of creating a spatial filter: a filter based on a drawn geometry (polygon, rectangle, circle or freeform). All features must
 * be in or partly in the drawn geometry (ie. intersects).
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.SpatialFilter",{
    extend: "viewer.components.Component",
    layerSelector:null,
    sourceLayerSelector: null,
    drawingButtonIds:null,
    vectorLayer:null,
    iconPath:null,
    features:null,
    config:{
        title: "",
        iconUrl: "",
        tooltip: "",
        layers:null,
        applyDirect:null,
        multiGeometries:null,
        label: "",
        details: {
            minWidth: 330,
            minHeight: 270
        }
    },
    constructor: function (conf){
        if(conf.applyDirect === undefined){
            conf.applyDirect = true;
        }
        
        if(conf.multiGeometries === undefined){
            conf.multiGeometries = true;
        }
        this.initConfig(conf);     
		viewer.components.SpatialFilter.superclass.constructor.call(this, this.config);
        var me = this;
        this.features = new Array();
        this.renderButton({
            handler: function(){
                me.showWindow();
            },
            text: me.config.title,
            icon: "",//"/viewer/viewer-html/components/resources/images/spatialFilter/spatialFilterButton.png",
            tooltip: me.config.tooltip,
            label: me.config.label
        });
        // Needed to untoggle the buttons when drawing is finished
        this.drawingButtonIds = {
            'polygon': Ext.id(),
            'circle': Ext.id(),
            'box': Ext.id(),
            'freehand': Ext.id()
            
        };
        this.iconPath=FlamingoAppLoader.get('contextPath')+"/viewer-html/components/resources/images/drawing/";
     
        this.loadWindow(); 
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this );
        return this;
    },

    showWindow : function(){
        if(this.vectorLayer === null){
            this.createVectorLayer();
        }
        this.layerSelector.initLayers();
        this.popup.popupWin.setTitle(this.config.title);
        this.popup.show();
    },
    
    drawGeometry: function(type){
        var appendFilter = Ext.getCmp (this.config.name + 'AppendFilter');
        if(!appendFilter.getValue()){
            this.vectorLayer.removeAllFeatures();
            this.features = new Array();
        }
        this.vectorLayer.drawFeature(type);
    },
    applyFilter: function () {
        var sourceAppLayer = this.sourceLayerSelector.getValue();
        if (Ext.Object.isEmpty(this.features) && sourceAppLayer) {

            var appLayer = this.layerSelector.getValue();
            var geomAttr = appLayer.attributes[appLayer.geometryAttributeIndex].name;
            var cql = "APPLAYER(" + geomAttr + ", " + sourceAppLayer.id + ", " + (sourceAppLayer.filter ? sourceAppLayer.filter.getCQL() : "") + ")";
            this.config.viewerController.setFilter(
                    Ext.create("viewer.components.CQLFilterWrapper", {
                        id: "filter_" + this.getName(),
                        cql: cql,
                        operator: "AND",
                        type: "APPLAYER"
                    }), appLayer);

        } else {
            var features = this.features;
            var multi = "MULTIPOLYGON (";
            var i = 0;
            for (var key in features){
                var feature = features[key].config.wktgeom;
                var coords = null;
                if(feature.indexOf("MULTIPOLYGON") !== -1){
                    coords = feature.replace("MULTIPOLYGON(","").replace(")))","))");
                }else{
                    coords = feature.replace("POLYGON", "");
                }
                if (i > 0) {
                    multi += ",";
                }
                multi += coords;
                i++;
            }
            multi += ")";
            if(i ===0){
                multi = "";
            }
            var appLayer = this.layerSelector.getValue();
            this.setFilter(multi, appLayer);
        }
    },
    setFilter: function(geometry, appLayer){
        var me = this;          
        if(appLayer.attributes === undefined || appLayer.attributes === null) {   
            this.config.viewerController.getAppLayerFeatureService(appLayer).loadAttributes(appLayer,function(){
                me.setFilter(geometry, appLayer);
            },function(e){
                Ext.MessageBox.alert("Error", e);
            });
        }else{
            var geomAttr = appLayer.geometryAttribute; 
            if (geomAttr !== undefined){
                var filter = "";
                if(geometry.length > 0){
                    filter = "INTERSECTS(" + geomAttr + ", " + geometry + ")";
                }
                this.config.viewerController.setFilter(
                    Ext.create("viewer.components.CQLFilterWrapper",{
                        id: "filter_"+this.getName(),
                        cql: filter,
                        operator : "AND",
                        type: "GEOMETRY"
                    }),appLayer);
            }            
        }
       
    },
    buffer : function(){
        Ext.getCmp(this.config.name + "BufferContainer").setLoading("Buffer berekenen...");
        var features = this.features;
        var wkts = [];
        for (var key in features){
            var wkt = features[key].config.wktgeom;
            wkts.push(wkt);
        }
        var distance = Ext.getCmp(this.config.name + "BufferDistance").getValue();
        if(distance === null || distance === 0){
            return;
        }
        var requestParams = {
            features: wkts, 
            buffer : distance
        };
        Ext.Ajax.request({
            url: actionBeans["buffergeom"],
            params: requestParams,
            method:  "POST",
            scope:this,
            success: function(result, request) {
                var response = Ext.JSON.decode(result.responseText);
                if(response.success){
                    this.features = [];
                    var features = response.features;
                    var featureObjs = [];
                    for(var i = 0 ; i < features.length ;i++){
                        var feature = Ext.create("viewer.viewercontroller.controller.Feature",{
                            wktgeom:features[i]
                        });
                        featureObjs.push(feature);
                    }
                    this.vectorLayer.removeAllFeatures();
                    this.vectorLayer.addFeatures(featureObjs);
                }else{
                    Ext.MessageBox.alert("Foutmelding", response.errorMessage);
                }
                Ext.getCmp(this.config.name + "BufferContainer").setLoading(false);
            },
            failure: function(result, request) {
                Ext.getCmp(this.config.name + "BufferContainer").setLoading(false);
                var response = Ext.JSON.decode(result.responseText);
                Ext.MessageBox.alert("Foutmelding", response.error);
            }
        });
    },
    
    // <editor-fold desc="Event handlers" defaultstate="collapsed">
    showFeatures: function(){
        var appLayer = this.sourceLayerSelector.getValue();
        var geomAttr = appLayer.attributes[appLayer.geometryAttributeIndex].id;
        var featureService = this.config.viewerController.getAppLayerFeatureService(appLayer);
        var me = this;
        me.appLayer = appLayer;
        featureService.loadFeatures(appLayer, function(features){
            var fts = [];
            for(var i = 0; i < features.length ; i++){
                var feature = features[i];
                
                var featureObject = Ext.create("viewer.viewercontroller.controller.Feature", {
                    wktgeom: feature[me.appLayer.geometryAttribute],
                    id:feature.__fid
                });
                fts.push(featureObject);
            }
            this.vectorLayer.addFeatures(fts);
        },Ext.emptyFn,{
            start:0,
            limit:5000,
            graph: true,
            attributesToInclude: [geomAttr]
        }, this);
    },
    layerChanged: function (appLayer, previousAppLayer, scope) {
        var buttons = Ext.getCmp(this.config.name +"filterButtons");
        if(appLayer !== null){
            buttons.setDisabled(false);
            this.vectorLayer.removeAllFeatures();
            this.features = [];
        }else{
            buttons.setDisabled(true);
            this.features = [];
            this.cancel();
        }
    },
      
    featureAdded : function (obj, feature){
        var applyDirect = Ext.getCmp (this.config.name + 'ApplyDirect');
        this.features[feature.getId()] = feature;
        if(applyDirect.getValue()){
            this.applyFilter();
        }
        this.toggleAll(false);
    },
    selectedContentChanged : function (){
        if(this.vectorLayer === null){
            this.createVectorLayer();
        }else{
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },
    // </editor-fold>
     
    // <editor-fold desc="Initialization methods" defaultstate="collapsed">
    loadWindow : function (){
        var me =this;
        var formItems = [];
        var formButtons = [
        {
            xtype: 'container',
            html: 'Teken: ',
            padding: '3 0 0 0',
            width: 105
        },
        {
            xtype: 'button',
            id: this.drawingButtonIds.polygon,
            icon: this.iconPath+"shape_polygon_red.png",
            componentCls: 'mobileLarge',
            tooltip: "Teken een polygoon",
            enableToggle: true,
            toggleGroup: 'drawingTools',
            margin: '0 3 0 0',
            listeners: {
                click:{
                    scope: me,
                    fn: function(){
                        me.drawGeometry("Polygon");
                    }
                }
            }
        },
        {
            xtype: 'button',
            id: this.drawingButtonIds.box,
            icon: this.iconPath+"shape_square_red.png",
            componentCls: 'mobileLarge',
            tooltip: "Teken een vierkant",
            enableToggle: true,
            toggleGroup: 'drawingTools',
            margin: '0 3 0 0',
            listeners: {
                click:{
                    scope: me,
                    fn: function(){
                        me.drawGeometry("Box");
                    }
                }
            }
        },
        {
            xtype: 'button',
            id: this.drawingButtonIds.freehand,
            icon: this.iconPath+"freehand.png",
            componentCls: 'mobileLarge',
            tooltip: "Teken een vrije vorm",
            enableToggle: true,
            toggleGroup: 'drawingTools',
            margin: '0 3 0 0',
            listeners: {
                click:{
                    scope: me,
                    fn: function(){
                        me.drawGeometry("Freehand");
                    }
                }
            }
        }];
        if(!viewer.components.MobileManager.isMobile()) {
            formButtons.push({
                xtype: 'button',
                id: this.drawingButtonIds.circle,
                icon: this.iconPath+"shape_circle_red.png",
                componentCls: 'mobileLarge',
                tooltip: "Teken een cirkel",
                enableToggle: true,
                toggleGroup: 'drawingTools',
                margin: '0 3 0 0',
                listeners: {
                    click:{
                        scope: me,
                        fn: function(){
                            me.drawGeometry("Circle");
                        }
                    }
                }
            });
        }
        formItems.push({
            xtype: 'container',
            width: "100%",
            layout: {
                type: 'hbox'
            },
            padding: '0 10 10 0',
            items: formButtons
        });
        formItems.push(
        {
            id: this.config.name + "BufferContainer",
            name: this.config.name + "BufferContainer",
            xtype: "container",
            width: "100%",
            height: 30,
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    id: this.config.name + "BufferDistance",
                    name: this.config.name + "BufferDistance",
                    xtype: "numberfield",
                    fieldLabel: "Bufferafstand",
                    minValue: 0,
                    labelWidth: 100,
                    width: 200,
                    margin: '0 3 0 0'
                },{
                    xtype: "button",
                    text: "Buffer",
                    listeners:{
                        click:{
                            scope:this,
                            fn:this.buffer
                        }
                    }
                }]
        },
        {
            xtype: "checkbox",
            boxLabel: 'Meerdere geometriën als filter',
            name: 'appendFilter',
            inputValue: this.config.multiGeometries,
            checked: this.config.multiGeometries,
            id: this.config.name + 'AppendFilter'
        },
        {
            xtype: "checkbox",
            boxLabel: 'Filter direct toepassen',
            name: 'applyDirect',
            inputValue: this.config.applyDirect,
            checked: this.config.applyDirect,
            id: this.config.name + 'ApplyDirect'
        });
        this.createLayerSelector();
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.config.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            padding: 4,
            renderTo: this.getContentDiv(),
            items: [
            this.layerSelector.getLayerSelector(),
                this.sourceLayerSelector.getLayerSelector(),
                {
                    xtype: "button",
                    label: "Laat features zien",
                    text: "Laat zien",
                   // disabled:true,
                    id: this.config.name + 'RetrieveFeaturesButton',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.showFeatures
                        }
                    }
                },
            {
                id: this.config.name + 'filterButtons',
                xtype: "container",
                disabled:true,
                autoScroll: true,
                width: '100%',
                layout:{
                    type: "vbox",
                    align: "stretch"
                },
                flex: 1,
                items: formItems
            },{
                id: this.config.name + 'ClosingPanel',
                xtype: "container",
                width: '100%',
                height: viewer.components.MobileManager.isMobile() ? 45 : 25,
                style: {
                    marginTop: '10px'
                },
                layout: {
                    type:'hbox',
                    pack:'end'
                },
                items: [
                    {xtype: 'button', text: 'Reset', componentCls: 'mobileLarge', margin: '0 1 0 0', handler: function(){
                        me.resetForm();
                    }},
                    {xtype: 'button', text: 'Toepassen', componentCls: 'mobileLarge', margin: '0 1 0 0', handler: function(){
                        me.applyFilter();
                    }},
                    {xtype: 'button', text: 'Sluiten', componentCls: 'mobileLarge', handler: function() {
                        me.resetForm();
                        me.popup.hide();
                    }}
                ]
            }]
        });
        if (this.vectorLayer === null) {
            this.createVectorLayer();
        }
        this.layerSelector.initLayers();
    },
    createLayerSelector: function(){
        var config = {
            viewerController : this.config.viewerController,
            restriction : "filterable",
            id : this.config.name + "layerSelector",
            layers: this.config.layers,
            padding: 4
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  
        var config = {
            viewerController: this.config.viewerController,
            restriction: "attribute",
            layers: this.config.layers,
            label: "Bron kaartlaag"
        };

        this.sourceLayerSelector = Ext.create("viewer.components.LayerSelector", config);
        this.sourceLayerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE, function (appLayer, b, c) {
            Ext.getCmp(this.config.name + 'RetrieveFeaturesButton').setDisabled(false);
                if (appLayer !== null && !appLayer.attributes) {
                 var featureService = this.config.viewerController.getAppLayerFeatureService(appLayer);
                   featureService.loadAttributes(appLayer);
            }
        }, this);
    },
    createVectorLayer : function (){
         this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.config.name + 'VectorLayer',
            geometrytypes:["Circle","Polygon"],
            showmeasures:false,
            allowselection: false,
            viewerController : this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 10,
                strokecolor: "FF0000",
                strokeopacity: 15
            }
        });
        this.config.viewerController.registerSnappingLayer(this.vectorLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
                
        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this.featureAdded,this);
        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this.featureAdded,this);
    },
    
    //</editor-fold>
   
    // Some helper functions here
    toggleAll : function(state){
        for ( var key in this.drawingButtonIds){
            if(!this.drawingButtonIds.hasOwnProperty(key)) {
                continue;
            }
            var el = this.drawingButtonIds[key];
            var button = Ext.getCmp(el);
            button.toggle(state);
        }
    },
    
    resetForm : function () {
        var appLayer = this.layerSelector.getValue();
        if(!appLayer) {
            return;
        }
        this.sourceLayerSelector.setValue(null);
        this.features = [];
        this.vectorLayer.removeAllFeatures();
        this.applyFilter();
    },
    getExtComponents: function() {
        return [ this.maincontainer.getId() ];
    }
});
