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
    config: {
        layers:null,
        title:null,
        iconUrl:null
    },
    constructor: function (conf){        
        viewer.components.Buffer.superclass.constructor.call(this, conf);
        this.initConfig(conf);     
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
        this.popup.show();
    },
    loadWindow : function(){
        
        var config = {
            viewerController : this.viewerController,
            div: this.getContentDiv(),
            layers : this.layers
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
       // this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);
    
        this.radius = Ext.create("Ext.form.field.Text",{
            name: "straal" ,
            fieldLabel: "Straal",
            renderTo: this.getContentDiv()
        });
        
        Ext.create("Ext.button.Button",{
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
        
        Ext.create("Ext.button.Button",{
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
        var layer = this.layerSelector.getValue();
        var radius = this.radius.getValue();
        if(layer != null && radius != ""){
            //layer.setBuffer(radius, layer.options.name);
        }
    },
    removeBuffer : function(){
        var layer = this.layerSelector.getValue();
        if(layer != null){
            //layer.removeBuffer( layer.options.name);
        }
    }
});
