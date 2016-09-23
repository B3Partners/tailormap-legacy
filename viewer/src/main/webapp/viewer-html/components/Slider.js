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
        var me = this;
        this.initConfig(conf);
        this.layers=new Array();
        this.currentSliderValue = this.config.initialTransparency;

        var sliderConfig = {
            width: 200,//MobileManager.isMobile() ? '100%' : 200,
            value: this.config.initialTransparency,
            increment: 10,
            fieldLabel: this.config.name,
            labelAlign: "top",
            minValue: 0,
            maxValue: 100,
            listeners:{
                change: {                    
                    fn: this.sliderChanged,
                    scope: this
                }
            }
        };
        if(!conf.parentContainer) {
            sliderConfig.renderTo = conf.sliderContainer;
        }
        this.slider = Ext.create('Ext.slider.Single', sliderConfig);
        if(conf.parentContainer) {
            conf.parentContainer.add(this.slider);
        }

        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.onRemoveLayer,this);
        
        return this;
    },
    onAddLayer: function(map,options){        
        var mapLayer=options.layer;  
        //only if configured with a applayer
        if (mapLayer.appLayerId){
            var appLayer = this.config.viewerController.app.appLayers[mapLayer.appLayerId];
            //check if this slider needs to change values for the layer
            if (Ext.Array.contains(this.config.selectedLayers,appLayer.id)){            
                this.layers.push(mapLayer);
                if(this.currentSliderValue) {
                    this.applySlider(mapLayer,this.currentSliderValue);
                }
            }
        }
    },
    
    onRemoveLayer : function (map, options){
        var mapLayer = options.layer;
        for( var i = 0 ; i < this.layers.length ;i++){
            if(mapLayer.id == this.layers[i].id){
                this.layers.splice(i,1);
                break;
            }
        }
    },
    /**
     * Apply the slider to the given layer.
     * @param mapLayer a viewer.viewercontroller.controller.Layer
     */
    applySlider: function(mapLayer,value) {
        mapLayer.setAlpha(100-value);
    },
    /**
     * Slider changed.
     */
    sliderChanged: function (slider,value) {       
        this.currentSliderValue = value;
        for(var i = 0 ; i< this.layers.length ;i++){
            var layer = this.layers[i];
            this.applySlider(layer,value);
        }
    },
    getExtComponents: function() {
        return this.slider.getId();
    }
});