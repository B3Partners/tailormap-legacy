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
 * Controls the opacity of the layers that are not added in the 
 * selected content at the start of the application. 
 * Used by the TransparencySlider component.
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */

Ext.define("viewer.components.NonInitLayerSlider",{
    extend: "viewer.components.Slider",
    config:{
        initSelectedContent: null,
        layersInExistingSliders:null
    },
    /*constructor : function (conf){
        this.initConfig(conf);  
		viewer.components.Slider.superclass.constructor.call(this, this.config);        
        return this;
    },*/
    onAddLayer: function(map,options){
        var mapLayer=options.layer;
        if(!Ext.Array.contains(this.config.layersInExistingSliders, mapLayer.appLayerId)){
            //only if configured with a applayer
            if (mapLayer.appLayerId){
                //check if this slider needs to change values for the layer
                if(!this.isInitSelectedContent(mapLayer.appLayerId)){
                    this.layers.push(mapLayer);
                    if(this.currentSliderValue) {
                        this.applySlider(mapLayer,this.currentSliderValue);
                    }
                }
            }else{
                this.layers.push(mapLayer);
                if(this.currentSliderValue) {
                    this.applySlider(mapLayer,this.currentSliderValue);
                }
            }
        }
    },
    /**
     *Function to check if this appLayerId is in the original selected content (at startup)
     *@param appLayerId the id of the applayer that needs to be checked
     *@return true if in the original/init selected content
     */
    isInitSelectedContent: function(appLayerId){
        if (this.config.initSelectedContent){
            for (var i=0; i < this.config.initSelectedContent.length; i++){
                if (this.config.initSelectedContent[i].type=="appLayer"){
                    if (this.config.initSelectedContent[i].id==appLayerId){
                        return true;
                    }
                }else {
                    if(this.checkInitSelectedLevel(this.config.initSelectedContent[i].id,appLayerId)){
                        return true;
                    }                    
                }
            }
        }
        return false;
    },
    /**
     * Check if this level (or childs of this level) with id == levelId 
     * contains a layer with id == appLayerId
     * @param levelId the id of the level that needs to be checked
     * @param appLayerId the applayer id
     * @return true if its in, otherwise falso
     */
    checkInitSelectedLevel: function(levelId,appLayerId){
        var level = this.config.viewerController.app.levels[levelId];
        if (level.layers){
            for (var i=0; i < level.layers.length; i++){
                if (level.layers[i]==appLayerId){
                    return true;
                }
            }
        }
        if(level.children){
            for (var i =0; i < level.children.length; i++){
                if (this.checkInitSelectedLevel(level.children[i],appLayerId)){
                    return true;
                }
            }
        }
        return false;
    }
});
