/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * Slider 
 * Controls the opacity of the layers. Used by the TransparencySlider component.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

Ext.define("viewer.components.Slider",{
    extend: "viewer.components.Component",
    slider: null,
    layers : null,
    config:{
        selectedLayers: [],
        name : "",
        initialTransparency: 75
    },
    constructor : function (conf){
        viewer.components.Slider.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.slider = Ext.create('Ext.slider.Single', {
            width: 200,
            value: this.initialTransparency,
            increment: 1,
            fieldLabel: this.name,
            labelAlign: "top",
            minValue: 0,
            maxValue: 100,
            renderTo: this.div,
            listeners:{
                change: {                    
                    fn: this.sliderChanged,
                    scope: this
                }
            }
        });
        var selectedLayers = this.selectedLayers;
        if(this.layers == null){
            this.layers = new Array();
        }
        for( var i = 0 ; i < selectedLayers.length;i++){
            this.layers.push(this.viewerController.getLayerByLayerId(this.selectedLayers[i]));
        }
        return this;
    },
    sliderChanged: function (slider,value){
        for(var i = 0 ; i< this.layers.length ;i++){
            var layer = this.layers[i];
            layer.setAlpha(value);
        }
    }
});