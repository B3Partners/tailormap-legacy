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
        var me = this;
		this.initConfig(conf);
        this.layers=new Array();
		this.currentSliderValue = this.initialTransparency;
		if(isMobile) {
            // Get new id
			var sliderid = Ext.id();
            // Create the label
            var label = document.createElement('label');
            label.innerHTML = this.name;
            // Create the container
            var sliderContainer = document.createElement('div');
            sliderContainer.className = 'slidercomponent';
            // Create + and - controls
            var sliderMinControl = document.createElement('div');
            sliderMinControl.className = 'rangecontrol minrangecontrol';
            var sliderPlusControl = document.createElement('div');
            sliderPlusControl.className = 'rangecontrol plusrangecontrol';
            // Create range input
            var sliderObj = document.createElement('input');
            sliderObj.id = sliderid; sliderObj.type = 'range'; sliderObj.min = 0; sliderObj.max = 100; sliderObj.value = this.initialTransparency;
            // Append inputs to container
			sliderContainer.appendChild(sliderMinControl); sliderContainer.appendChild(sliderObj); sliderContainer.appendChild(sliderPlusControl);
            document.getElementById(conf.sliderContainer).appendChild(label);
            document.getElementById(conf.sliderContainer).appendChild(sliderContainer);
            // Add click-hold functionality to + and - controls
            me.holdButton(sliderMinControl, 'subtract', sliderObj, 100, 2);
            me.holdButton(sliderPlusControl, 'add', sliderObj, 100, 2);
            // Add change listener to slider
            Ext.get(sliderid).addListener('change', function( evt, obj ) {
				me.sliderChanged( obj, obj.value );
			});
		} else {
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
		}
        
        this.getViewerController().mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.onAddLayer,this);
        
        return this;
    },
    onAddLayer: function(map,options){        
        var mapLayer=options.layer;  
        //only if configured with a applayer
        if (mapLayer.appLayerId){
            var appLayer = this.viewerController.app.appLayers[mapLayer.appLayerId];
            //check if this slider needs to change values for the layer
            if (Ext.Array.contains(this.selectedLayers,appLayer.id)){            
                this.layers.push(mapLayer);
				if(this.currentSliderValue) {
					this.applySlider(mapLayer,this.currentSliderValue);
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
        this.currentSliderValue = value;
		for(var i = 0 ; i< this.layers.length ;i++){
            var layer = this.layers[i];
            this.applySlider(layer,value);
        }
    },
    getExtComponents: function() {
        if(this.slider !== null) return this.slider.getId();
        return '';
    },
    holdButton: function(btn, action, target, start, speedup) {
        var t, me = this;
        var changeSliderValue = function () {
            if(action == "add" && target.value < 100) target.value++;
            else if(action == "subtract" && target.value > 0) target.value--;
            else {
                clearTimeout(t);
                return;
            }
            t = setTimeout(changeSliderValue, start);
            start = start / speedup;
            me.sliderChanged(target, target.value);
        }
        var hammer = new Hammer(btn);
        hammer.onhold = changeSliderValue;
        hammer.onrelease = function(ev) {
            clearTimeout(t);
        };
    }
});