/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * BufferObject component
 * Creates a BufferObject component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.BufferObject",{
    extend: "viewer.components.Component",
    layerSelector:null,
    radius:null,
    tmc:null,
    vectorLayer:null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        label: ""
    },
    constructor: function (conf){
        viewer.components.BufferObject.superclass.constructor.call(this, conf);
        this.initConfig(conf);

        this.tmc =this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name,
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.viewerController
        });
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        });
        this.loadWindow();
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this );
        return this;
    },
    selectedContentChanged : function (){
        if(this.vectorLayer == null){
            this.createVectorLayer();
        }else{
            this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },
    buttonClick : function (){
        this.layerSelector.initLayers();
        if(this.vectorLayer == null){
            this.createVectorLayer();
        }
        this.popup.show();
    },
    createVectorLayer : function(){
        this.vectorLayer=this.viewerController.mapComponent.createVectorLayer({
              id: 'boVectorLayer',
              name:'boVectorLayer',
              geometrytypes:["Circle","Polygon"],
              showmeasures:false,
                  style: {
                  fillcolor: "0xFF0000",
                  fillopacity: 50,
                  strokecolor: "0xFF0000",
                  strokeopacity: 100
              }
          });
          this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    },
    loadWindow : function(){

        var config = {
            viewerController : this.viewerController,
            div: this.getContentDiv(),
            layers : this.layers,
            restriction: "bufferable"
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);

        this.radius = Ext.create("Ext.form.field.Text",{
            name: "straal" ,
            fieldLabel: "Straal",
            renderTo: this.getContentDiv()
        });

        this.button1 = Ext.create("Ext.button.Button",{
            name: "selectObject" ,
            text: "Selecteer object op de kaart",
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    //fn: this.buffer
                    fn : this.addWktToMapcomponent
                }
            }
        });

        this.button2 = Ext.create("Ext.button.Button",{
            name: "removeBuffer" ,
            text: "Huidige buffer verwijderen",
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    fn: this.removeBuffer
                }
            }
        });
    },
    buffer : function (){
        this.tmc.activateTool();
    },
    mapClicked : function (toolMapClick,comp){
        this.tmc.deactivateTool();
        var coords = comp.coord;
        var x = coords.x;
        var y = coords.y;
        //console.log("xy", x,y);
        wkt ="POLYGON((98914.7905763337 576961.290540899,101360.775481459 488905.833956381,166179.375467285 487071.345277537,174128.826408943 570234.832051804,146611.496226281 610593.582986375,98914.7905763337 576961.290540899))";
        var feature = Ext.create("viewer.viewercontroller.controller.Feature",{id: 1, wkt: wkt});
        this.vectorLayer.addFeature(feature);
    },
    addWktToMapcomponent : function (wkt){
        this.tmc.activateTool();

    },
    removeBuffer : function (){
        this.vectorLayer.removeAllFeatures();
    },
    getExtComponents: function() {
        return Ext.Array.merge(
            this.layerSelector.getExtComponents(),
            [
                this.radius.getId(),
                this.button1.getId(),
                this.button2.getId()
            ]
        );
    }
});
