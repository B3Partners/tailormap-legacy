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
 * BufferLayer component
 * Creates a BufferLayer component
 * This calls a buffer function in an ArcIMS or ArcGis layer (the latter is yet untested).
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.BufferLayer",{
    extend: "viewer.components.Component",
    combobox: null,
    radius:null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        label: ""
    },
    constructor: function (conf){        
        viewer.components.BufferLayer.superclass.constructor.call(this, conf);
        this.initConfig(conf);     
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.tooltip,
            label: me.config.label
        });      
        this.loadWindow();
        return this;
    },
    buttonClick : function (){
        this.popup.show();
    },
    loadWindow : function(){
        var layers = [];
        for( var i = 0 ; i < this.config.layers.length;i++){
            var layer = this.config.viewerController.getLayerByLayerId(this.config.layers[i]);
            layers.push({
                id: layer.serviceId+"_"+layer.options.name,
                title: layer.options.name,
                layer: layer
            });
        }
        var layerStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'title','layer'],
            data : layers
        });

        this.combobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Kies kaartlaag',
            emptyText: layers.length === 0 ? 'Geen lagen beschikbaar' : 'Maak uw keuze',
            disabled: layers.length === 0,
            store: layerStore,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'layer',
            renderTo: this.getContentDiv()
        });
        this.radius = Ext.create("Ext.form.field.Text",{
            name: "straal" ,
            fieldLabel: "Straal",
            renderTo: this.getContentDiv()
        });
        
        this.button1 = Ext.create("Ext.button.Button",{
            name: "buffer" ,
            text: "Buffer",
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    fn: this.buffer
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
        var layer = this.combobox.getValue();
        var radius = this.radius.getValue();
        if(layer != null && radius != ""){
            layer.setBuffer(radius, layer.options.name);
        }
		if(MobileManager.isMobile()) {
			this.popup.hide();
		}
    },
    removeBuffer : function(){
        var layer = this.combobox.getValue();
        if(layer != null){
            layer.removeBuffer( layer.options.name);
        }
		if(MobileManager.isMobile()) {
			this.popup.hide();
		}
    },
    getExtComponents: function() {
        return [
            this.combobox.getId(),
            this.radius.getId(),
            this.button1.getId(),
            this.button2.getId()
        ];
    }
});
