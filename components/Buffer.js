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
 * Buffer component
 * Creates a Buffer component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Buffer",{
    extend: "viewer.components.Component",
    layerSelector: null,
    radius:null,
    imageLayer:null,
    colorPicker:null,
    color:null,
    config: {
        layers:null,
        title:null,
        maxFeatures:null,
        iconUrl:null,
        tooltip:null
    },
    constructor: function (conf){
        viewer.components.Buffer.superclass.constructor.call(this, conf);
        this.initConfig(conf);     
        if(this.maxFeatures == null){
            this.maxFeatures = 50;
        }
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip
        });      
        this.loadWindow();
        return this;
    },
    buttonClick : function (){
        this.layerSelector.initLayers();
        this.popup.show();
    },
    loadWindow : function(){
        this.layerSelector = Ext.create("viewer.components.LayerSelector",{
            viewerController : this.viewerController,
            div: this.getContentDiv(),
            id: this.name + "LayerSelector",
            layers : this.layers
        });    
        
        this.radius = Ext.create("Ext.form.field.Text",{
            name: "straal" ,
            id: this.name + "Radius",
            fieldLabel: "Straal"
        });
        
        this.colorPicker = Ext.create("Ext.ux.ColorField",{ 
            showText: true,
            name: 'color',
            fieldLabel : "Kleur buffer",
            id:'color' + this.name,
            listeners :{
                select : {
                    fn: this.colorChanged,
                    scope : this
                }
            }
        });
        
        this.buffer = Ext.create("Ext.button.Button",{
            name: "buffer" ,
            id: this.name + "BufferButton",
            text: "Buffer",
            listeners: {
                click:{
                    scope: this,
                    fn: this.buffer
                }
            }
        });
        
        this.remove = Ext.create("Ext.button.Button",{
            name: "removeBuffer" ,
            id : this.name + "RemoveButton",
            text: "Huidige buffer verwijderen",
            listeners: {
                click:{
                    scope: this,
                    fn: this.removeBuffer
                }
            }
        });
        
        Ext.create ("Ext.container.Container",{
            layout: 'fit',
            id: this.name +"Container",
            renderTo : this.getContentDiv(),
            items:[
                this.radius,
                this.colorPicker,
                this.buffer,
                this.remove
            ]
        });
    },
    buffer : function (){
        var layer = this.layerSelector.getValue();
        var radius = this.radius.getValue();
        if(layer != null && radius != ""){
            this.removeBuffer();
            var filterParams = null;
            if(layer.filter){
                filterParams = "&filter=" + encodeURIComponent(layer.filter.getCQL());
            }
            var bbox = this.viewerController.mapComponent.getMap().getExtent().toString();
            var width = this.viewerController.mapComponent.getMap().getWidth();
            var height = this.viewerController.mapComponent.getMap().getHeight();
            var url = absoluteURIPrefix + contextPath + "/action/Buffer";
            var attrs ="?bbox="+ bbox + "&serviceId="+ layer.serviceId+"&layerName="+ layer.layerName +"&width="+ width+"&height="+height+"&buffer="+radius+"&maxFeatures="+ this.maxFeatures;
            if(this.color != null){
                    attrs += "&color="+this.color;
            }
            url += attrs;
            if(filterParams){
                var filterUrl = url + filterParams;
                url = filterUrl;
                if(filterUrl.length > 1024){
                    this.viewerController.logger.warning("Buffertool generates url with filters that has more than 1024 characters, which can produce faulty requests in some browsers");
                }
            }
            this.imageLayer = this.viewerController.mapComponent.createImageLayer(this.name + layer.layerName+"ImageLayer", url, bbox);
            this.viewerController.mapComponent.getMap().addLayer(this.imageLayer);
        }
    },
    removeBuffer : function(){
        var map = this.viewerController.mapComponent.getMap();
        var layer = this.layerSelector.getValue();
        if(layer != null){
            var mapLayer = map.getLayer(this.name + layer.layerName+"ImageLayer");
            if(mapLayer!=null){
                map.removeLayer(mapLayer);
            }
        }
    },
    getExtComponents: function() {
        return Ext.Array.merge(
            this.layerSelector.getExtComponents(),
            [
                this.radius.getId(),
                this.buffer.getId(),
                this.remove.getId()
            ]
        );
    },
    colorChanged : function (color){
        this.color = color;
    }
});
