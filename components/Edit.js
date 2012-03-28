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
    geomType:null,
    mode:null,
    toolMapClick:null,
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
            geometrytypes:["Circle","Polygon","Point","LineString"],
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
            id: this.name,
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
                    tooltip: "Bewerk",
                    text: "Bewerk",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.edit
                        }
                    }
                },
                {
                    id : "geomLabel",
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
            layers: this.layers,
            div: this.name + 'LayerSelectorPanel'
        };
        var ls = Ext.create("viewer.components.LayerSelector",config);
        ls.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  
    },
    layerChanged : function (item){
        this.vectorLayer.removeAllFeatures();
        this.mode=null;
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        
        this.inputContainer.setLoading("Laad attributen...");
        this.inputContainer.removeAll();
        var appLayer = this.viewerController.getApplayer(item.serviceId, item.name);
        
        this.loadAttributes(appLayer);
        this.inputContainer.setLoading(false);
    },
    loadAttributes: function(appLayer) {
        // this.clear();
        
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
            type = geomAttribute.type;
        }
        this.geomType = type;
        var possible = true;
        var tekst = "";
        switch(type){
            case "multipolygon":
            case "polygon":
                this.geomType = "Polygon";
                tekst = "vlak";
                break;
            case "multipoint":
            case "point":
                this.geomType = "Point";
                tekst = "punt";
                break;
            case "multilinestring":
            case "linestring":
                this.geomType = "LineString";
                tekst = "lijn";
                break;
            case "geometry":
            default:
                this.geomType = null;
                possible = false;
                break;
        }
        
        var gl = Ext.getCmp("geomLabel");
        if(possible){
            tekst=  'Bewerk het ' + tekst + " op de kaart";
            gl.setText(tekst);

            for(var i= 0 ; i < attributes.length ;i++){
                var attribute = attributes[i];
                if(attribute.editable){
                    var values = attribute.editValues;
                    var input = null;
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
                            original[index] = {id: value};
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
            gl.setText("Geometrietype onbekend. Editten niet mogelijk.");
        }
    },
    setInputPanel : function (feature){
        this.inputContainer.getForm().setValues(feature);
    },
    mapClicked : function (toolMapClick,comp){
         this.toolMapClick.deactivateTool();
        var coords = comp[1];
        var x = coords.x;
        var y = coords.y;
        this.viewerController.mapComponent.getMap().setMarker("edit",x,y);
        var resolution = this.viewerController.mapComponent.getMap().getResolution();
        var feature = {
            omtrek : "Erg groot, namelijk Noord Holland",
            code : "2012",
            wktgeom: "POLYGON((98914.7905763337 576961.290540899,101360.775481459 488905.833956381,166179.375467285 487071.345277537,174128.826408943 570234.832051804,146611.496226281 610593.582986375,98914.7905763337 576961.290540899))"
        }
        this.featureSelected(feature);
    },
    createNew : function(){
        this.vectorLayer.removeAllFeatures();
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        this.mode = "new";
        if(this.geomType != null){
            this.vectorLayer.drawFeature(this.geomType);
        }
    },
    edit : function(){
        this.vectorLayer.removeAllFeatures();
        this.mode = "edit";
        this.toolMapClick.activateTool();
    },
    featureSelected : function (feature){
        this.inputContainer.getForm().setValues(feature);
        var feat = Ext.create("viewer.viewercontroller.controller.Feature",{
            wktgeom: feature.wktgeom,
            id: "T_0"
        });
        this.vectorLayer.addFeature(feat);
    },
    save : function(){
        var feature =this.inputContainer.getValues();
        var wkt =  this.vectorLayer.getActiveFeature().wktgeom;
        feature.wktgeom = wkt;
    },
    cancel : function (){
        this.mode=null;
        this.inputContainer.removeAll();
        this.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.removeAllFeatures();
        this.popup.hide();
    },
    getExtComponents: function() {
        return [ this.maincontainer.getId() ];
    }
});
