/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * Edit component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Edit",{
    extend: "viewer.components.Component",
    vectorLayer:null,
    inputContainer:null,
    showGeomType:null,
    newGeomType:null,
    mode:null,
    layerSelector:null,
    toolMapClick:null,
    currentFID:null,
    geometryEditable:null,
    config:{
        title: "",
        iconUrl: "",
        tooltip: "",
        layers:null
    },
    constructor: function (conf){        
        viewer.components.Edit.superclass.constructor.call(this, conf);
        this.initConfig(conf);        
        var me = this;
        this.renderButton({
            handler: function(){
                me.popup.show();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip
        });
          
        this.vectorLayer=this.viewerController.mapComponent.createVectorLayer({
            id: this.name + 'VectorLayer',
            name: this.name + 'VectorLayer',
            geometrytypes:["Circle","Polygon","MultiPolygon","Point", "LineString"],
            showmeasures:false,
            style: {
                fillcolor: "0xFF0000",
                fillopacity: 50,
                strokecolor: "0xFF0000",
                strokeopacity: 50
            }
        });
        this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        
        this.toolMapClick = Ext.create ("viewer.components.tools.ToolMapClick",{
            id: this.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.viewerController
        });
        this.loadWindow();
        return this;
    },
    loadWindow : function (){
        var me =this;
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [{
                id: this.name + 'LayerSelectorPanel',
                xtype: "container",
                padding: "4px",
                width: '100%',
                height: 36
            },
            {
                id: this.name + 'ButtonPanel',
                xtype: "container",
                padding: "4px",
                width: '100%',
                height: 36,
                items:[
                {
                    xtype: 'button',
                    id: this.name +"newButton",
                    disabled: true,
                    tooltip: "Nieuw",
                    text: "Nieuw",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.createNew
                        }
                    }
                },
                {
                    xtype: 'button',
                    id : this.name + "editButton",
                    tooltip: "Bewerk",
                    disabled: true,
                    text: "Bewerk",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.edit
                        }
                    }
                },
                {
                    id : this.name + "geomLabel",
                    margin: 5,
                    text: '',
                    xtype: "label"
                }
                ]
            },
            {
                id: this.name + 'InputPanel',
                border: 0,
                xtype: "form",
                autoScroll: true,
                width: '100%',
                flex: 1
            },{
                id: this.name + 'savePanel',
                xtype: "container",
                width: '100%',
                height: 25,
                items:[
                {
                    xtype: 'button',
                    id : this.name + "cancelButton",
                    tooltip: "Annuleren",
                    text: "Annuleren",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.cancel
                        }
                    }
                },
                {
                    xtype: 'button',
                    id : this.name + "saveButton",
                    tooltip: "Opslaan",
                    text: "Opslaan",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.save
                        }
                    }
                }
                ]
            }
            ]
        });
        this.inputContainer =  Ext.getCmp(this.name + 'InputPanel');
        
        var config = {
            viewerController : this.viewerController,
            restriction : "hasConfiguredLayers",
            id : this.name + "layerSelector",
            layers: this.layers,
            div: this.name + 'LayerSelectorPanel'
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  
    },
    layerChanged : function (item){
        if(item != null){
            this.vectorLayer.removeAllFeatures();
            this.mode=null;
            this.viewerController.mapComponent.getMap().removeMarker("edit");

            this.inputContainer.setLoading("Laad attributen...");
            this.inputContainer.removeAll();
            var appLayer = this.viewerController.getApplayer(item.serviceId, item.name);
            this.loadAttributes(appLayer);
            this.inputContainer.setLoading(false);
        }
    },
    loadAttributes: function(appLayer) {
        this.appLayer = appLayer;
        
        var me = this;
        
        if(this.appLayer != null) {
            
            this.featureService = this.viewerController.getAppLayerFeatureService(this.appLayer);
            
            // check if featuretype was loaded
            if(this.appLayer.attributes == undefined) {
                this.featureService.loadAttributes(me.appLayer, function(attributes) {
                    me.initAttributeInputs(me.appLayer);
                });
            } else {
                this.initAttributeInputs(me.appLayer);
            }    
        }
    },
    initAttributeInputs : function (appLayer){
        var attributes = appLayer.attributes;
        var type = "geometry";
        if(appLayer.geometryAttributeIndex != undefined || appLayer.geometryAttributeIndex != null ){
            var geomAttribute = appLayer.attributes[appLayer.geometryAttributeIndex];
            if(geomAttribute.editValues != undefined && geomAttribute.editValues !=null && geomAttribute.editValues.length >= 1){
                type = geomAttribute.editValues[0]
            }else{
                type = geomAttribute.type;
            }
            this.geometryEditable = appLayer.attributes[appLayer.geometryAttributeIndex].editable;
        }else{
            this.geometryEditable = false;
        }
        this.showGeomType = type;
        var possible = true;
        var tekst = "";
        switch(type){
            case "multipolygon":
                this.showGeomType = "MultiPolygon";
                this.newGeomType = "Polygon";
                tekst = "vlak";
                break;
            case "polygon":
                this.showGeomType = "Polygon";
                this.newGeomType = "Polygon";
                tekst = "vlak";
                break;
            case "multipoint":
            case "point":
                this.showGeomType = "Point";
                this.newGeomType = "Point";
                tekst = "punt";
                break;
            case "multilinestring":
            case "linestring":
                this.showGeomType = "LineString";
                this.newGeomType = "LineString";
                tekst = "lijn";
                break;
            case "geometry":
                possible = true;
                this.newGeomType = null;
                break;
            default:
                this.geomType = null;
                possible = false;
                break;
        }
        
        var gl = Ext.getCmp( this.name +"geomLabel");
        if(possible){
            Ext.getCmp(this.name +"editButton").setDisabled(false);
            if(this.newGeomType != null){
                Ext.getCmp(this.name +"newButton").setDisabled(false);
                tekst = "Geometrie mag alleen bewerkt worden";
            }else{ 
                if(this.geometryEditable){
                    tekst = 'Bewerk een ' + tekst + " op de kaart";
                }else{
                    tekst = 'Geometrie mag niet bewerkt worden.';
                }
            }
            gl.setText(tekst);

            for(var i= 0 ; i < attributes.length ;i++){
                var attribute = attributes[i];
                if(attribute.editable){
                    var values = attribute.editValues;
                    var input = null;
                    if(i == appLayer.geometryAttributeIndex){
                        continue;
                    }
                    if(values == undefined || values.length == 1){
                        var fieldText = "";
                        if(values!= undefined){
                            fieldText = values[0];
                        }
                        input = Ext.create("Ext.form.field.Text",{
                            name: attribute.name,
                            fieldLabel: attribute.editAlias || attribute.name,
                            renderTo: this.name + 'InputPanel',
                            value:  fieldText
                        });
                    }else if (values.length > 1){
                        Ext.each(values,function(value,index,original){
                            original[index] = {
                                id: value
                            };
                        });
                        var valueStore = Ext.create('Ext.data.Store', {
                            fields: ['id'],
                            data : values
                        });

                        input = Ext.create('Ext.form.ComboBox', {
                            fieldLabel: attribute.editAlias || attribute.name,
                            store: valueStore,
                            queryMode: 'local',
                            displayField: 'id',
                            name:attribute.name,
                            valueField: 'id'
                        });
                    }
                    this.inputContainer.add(input);
                }
            }
        }else{
            gl.setText("Geometrietype onbekend. Bewerken niet mogelijk.");
            Ext.getCmp(this.name +"editButton").setDisabled(true);
            Ext.getCmp(this.name +"newButton").setDisabled(true);
        }
    },
    setInputPanel : function (feature){
        this.inputContainer.getForm().setValues(feature);
    },
    mapClicked : function (toolMapClick,comp){
        this.toolMapClick.deactivateTool();
        Ext.get(this.getContentDiv()).mask("Haalt features op...")
        var coords = comp[1];
        var x = coords.x;
        var y = coords.y;
        
        var layerObj = this.layerSelector.getValue();
        var layer = this.viewerController.getApplayer(layerObj.serviceId, layerObj.name);
        this.viewerController.mapComponent.getMap().setMarker("edit",x,y);
        var featureInfo = Ext.create("viewer.FeatureInfo", {
            viewerController: this.viewerController
        });
        var me =this;
        featureInfo.editFeatureInfo(x,y,this.viewerController.mapComponent.getMap().getResolution(),layer, function (features){
            me.featuresReceived(features);
        },this.failed);
    },
    featuresReceived : function (features){
        if(features.length == 1){
            var feat = this.indexFeatureToNamedFeature(features[0]);
            this.handleFeature(feat);
        }else if(features.length == 0){
            this.handleFeature(null);
        } else{
            // Handel meerdere features af.
            this.createFeaturesGrid(features);
        }
    },
    handleFeature : function (feature){
        if(feature != null){
            this.inputContainer.getForm().setValues(feature);
            this.currentFID = feature.__fid;
            if(this.geometryEditable){
                var wkt = feature[this.appLayer.geometryAttribute];
                var feat = Ext.create("viewer.viewercontroller.controller.Feature",{
                    wktgeom: wkt,
                    id: "T_0"
                });
                this.vectorLayer.addFeature(feat);
            }
        }
        Ext.get(this.getContentDiv()).unmask()
    },
    failed : function (msg){
        Ext.Msg.alert('Mislukt',msg);
        Ext.get(this.getContentDiv()).unmask()
    },
    createNew : function(){
        this.vectorLayer.removeAllFeatures();
        this.inputContainer.getForm().reset()
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        this.mode = "new";
        if(this.newGeomType != null && this.geometryEditable){
            this.vectorLayer.drawFeature(this.newGeomType);
        }
    },
    edit : function(){
        this.vectorLayer.removeAllFeatures();
        this.mode = "edit";
        this.toolMapClick.activateTool();
    },
    save : function(){
        var feature =this.inputContainer.getValues();
        
        if(this.geometryEditable){
            var wkt =  this.vectorLayer.getActiveFeature().wktgeom;
            feature[this.appLayer.geometryAttribute] = wkt;
        }
        if(this.mode == "edit"){
            feature.__fid = this.currentFID;
        }
        
        var layerObj = this.layerSelector.getValue();
        var layer = this.viewerController.getApplayer(layerObj.serviceId, layerObj.name);
        Ext.create("viewer.EditFeature", {
            viewerController: this.viewerController
        })
        .edit(
            layer,
            feature,
            this.saveSucces, 
            this.failed);
    },
    saveSucces : function (fid){
        Ext.Msg.alert('Gelukt',"Het feature is aangepast.");
        this.currentFID = fid;
        this.viewerController.mapComponent.getMap().update();
    },
    saveFailed : function (msg){
        Ext.Msg.alert('Mislukt',msg);
    },
    cancel : function (){
        this.resetForm();
        this.popup.hide();
    },
    resetForm : function (){
        Ext.getCmp(this.name +"editButton").setDisabled(true);
        Ext.getCmp(this.name +"newButton").setDisabled(true);
        this.mode=null;
        this.layerSelector.combobox.select(null);
        Ext.getCmp( this.name +"geomLabel").setText("");
        this.inputContainer.removeAll();
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.removeAllFeatures();
    },
    getExtComponents: function() {
        return [ this.maincontainer.getId() ];
    },
    createFeaturesGrid : function (features){
        var appLayer = this.layerSelector.getSelectedAppLayer();
        var attributes = appLayer.attributes;
        var index = 0;
        var attributeList = new Array();
        var columns = new Array();
        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            if(attribute.editable){
                
                var attIndex = index++;
                if(i == appLayer.geometryAttributeIndex){
                    continue;
                }
                var colName = attribute.alias != undefined ? attribute.alias : attribute.name;
                attributeList.push({
                    name: "c" + attIndex,
                    type : 'string'
                });
                columns.push({
                    id: "c" +attIndex,
                    text:colName,
                    dataIndex: "c" + attIndex,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }
        
        Ext.define(this.name + 'Model', {
            extend: 'Ext.data.Model',
            fields: attributeList
        });
     
        var store = Ext.create('Ext.data.Store', {
            pageSize: 10,
            model: this.name + 'Model',
            data:features
        });
        
        var me =this;
        var grid = Ext.create('Ext.grid.Panel',  {
            id: this.name + 'GridFeaturesWindow',
            store: store,
            columns: columns,
            listeners:{
                itemdblclick:{
                    scope: me,
                    fn: me.itemDoubleClick
                }
            }
        });
        var container = Ext.create("Ext.container.Container",{
            id: this.name + "GridContainerFeaturesWindow",
            width: "100%",
            height: "100%",
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items:[
            {
                id: this.name + 'GridPanelFeaturesWindow',
                xtype: "container",
                autoScroll: true,
                width: '100%',
                flex: 1,
                items:[grid]
            },{
                id: this.name + 'ButtonPanelFeaturesWindow',
                xtype: "container",
                width: '100%',
                height: 30,
                items:[{
                    xtype: "button",
                    id: this.name + "SelectFeatureButtonFeaturesWindow",
                    text: "Bewerk geselecteerd feature",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.selectFeature
                        }
                    }
                },
                {
                    xtype: "button",
                    id: this.name + "CancelFeatureButtonFeaturesWindow",
                    text: "Annuleren",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.cancelSelectFeature
                        }
                    }
                }]
            }
            ]
        });
        
        var window = Ext.create("Ext.window.Window",{
            id: this.name + "FeaturesWindow",
            width: 500,
            height: 300,
            layout: 'fit',
            title: "Kies één feature",
            items: [container]
        });
        
        window.show();
    },
    itemDoubleClick : function (gridview,row){
        this.featuresReceived ([row.data]);
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
    },
    selectFeature :function() {
        var grid = Ext.getCmp('edit1Grid');
        var selection = grid.getSelectionModel().getSelection()[0];
        var feature = selection.data;
        this.featuresReceived ([feature]);
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
    },
    cancelSelectFeature : function (){
        this.resetForm();
        Ext.get(this.getContentDiv()).unmask()
        Ext.getCmp(this.name + "FeaturesWindow").destroy();
    },
    indexFeatureToNamedFeature : function (feature){
        var map = this.makeConversionMap();
        var newFeature = {};
        for (var key in feature){
            var namedIndex = map[key];
            var value = feature[key];
            if(namedIndex != undefined){
                newFeature[namedIndex] = value;
            }else{
                newFeature[key] = value;
            }
        }
        return newFeature;
    },
    makeConversionMap : function (){
        var appLayer = this.layerSelector.getSelectedAppLayer();
        var attributes = appLayer.attributes;
        var map = {};
        var index = 0;
        for (var i = 0 ; i < attributes.length ;i++){
            if(attributes[i].editable){
                map["c"+index] = attributes[i].name;
                index++;
            }
        }
        return map;
    }
});
