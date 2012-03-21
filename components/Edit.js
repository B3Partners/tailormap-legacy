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
        this.loadWindow();
        return this;
    },
    loadWindow : function (){
        var me =this;
        Ext.create('Ext.container.Container', {
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
                xtype: "container",
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
        
        this.inputContainer.setLoading("Laad attributen...");
        /* for( var i = 0 ; i < inputPanel.items.length ; i++){
            var citem = inputPanel.items[i];
            citem.remove();
        }*/
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
        if(appLayer.geometryAttributeIndex){
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
                    var input = Ext.create("Ext.form.field.Text",{
                        name: attribute.name,
                        fieldLabel: attribute.editAlias || attribute.name,
                        renderTo: this.name + 'InputPanel'
                    });
                    this.inputContainer.add(input);

                }
            }
        }else{
            gl.setText("Geometrietype onbekend. Editten niet mogelijk.");
        }
    },
    createNew : function(){
        if(this.geomType != null){
            this.vectorLayer.drawFeature(this.geomType);
        }
    },
    edit : function(){
        
    },
    save : function(){
        
    },
    cancel : function (){
        
    }

    
});
