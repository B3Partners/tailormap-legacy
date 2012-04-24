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
        selectedLayers: null,
        name : null,
        title: null,
        initialTransparency: 0
    },
    constructor : function (conf){
        viewer.components.Slider.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.layers=new Array();
        this.slider = Ext.create('Ext.slider.Single', {
            width: 200,
            value: this.initialTransparency,
            increment: 1,
            fieldLabel: this.name,
            labelAlign: "top",
            minValue: 0,
            maxValue: 100,
            renderTo: conf.sliderContainer,
            listeners:{
                change: {                    
                    fn: this.sliderChanged,
                    scope: this
                }
            }
        });
        
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        
        return this;
    },
    onAddLayer: function(map,options){        
        var mapLayer=options.layer;  
        //only if configured with a applayer
        if (mapLayer.appLayerId){
            var appLayer = this.viewerController.app.appLayers[mapLayer.appLayerId];
            //check if this slider needs to change values for the layer
            var serviceLayer=this.viewerController.app.services[appLayer.serviceId].layers[appLayer.layerName];
            if (Ext.Array.contains(this.selectedLayers,serviceLayer.id)){            
                this.layers.push(mapLayer);
                if(this.slider){
                    this.applySlider(mapLayer,this.slider.getValue());
                }
            }
        }
    },
    /**
     * Apply the slider to the given layer.
     * @param mapLayer a viewer.viewercontroller.controller.Layer
     */
    applySlider: function(mapLayer,value) {
        mapLayer.setAlpha(value);
    },
    /**
     * Slider changed.
     */
    sliderChanged: function (slider,value){       
        for(var i = 0 ; i< this.layers.length ;i++){
            var layer = this.layers[i];
            this.applySlider(layer,value);
        }
    },
    getExtComponents: function() {
        return this.slider.getId();
    }    
});