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
 * TransparencySlider component
 * Creates a TransparencySlider component. It uses the Slider component..
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

Ext.define ("viewer.components.TransparencySlider",{
    extend: "viewer.components.Component",
    config:{
        title:null,
        sliders : [],
        sliderForUserAdded: null,
        sliderForUserAddedText: null,
        sliderForUserAddedInitTransparency: 0

    },
    sliderObjects : [],

    constructor: function (conf){
        viewer.components.TransparencySlider.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        if(this.config.layers != null) {
            transparencySlider_layersArrayIndexesToAppLayerIds(this.config);
        }

        var me = this;
        var title = "";
        if(this.config.title && !this.viewerController.layoutManager.isTabComponent(this.name)) title = this.config.title;
        var tools = [];
        // If no config is present for 'showHelpButton' or 'showHelpButton' is "true" we will show the help button
        if(this.config && (!this.config.hasOwnProperty('showHelpButton') || this.config.showHelpButton !== "false")) {
            tools = [{
                type:'help',
                handler: function(event, toolEl, panel){
                    me.viewerController.showHelp(me.config);
                }
            }];
        }
        this.panel = Ext.create('Ext.panel.Panel', {
            renderTo: this.getContentDiv(),
            title: title,
            height: "100%",
            html: '<div id="' + this.name + 'slidersContainer" style="width: 100%; height: 100%; padding: 10px; overflow: auto;"></div>',
            tools: tools
        });
        conf.sliderContainer = this.name + 'slidersContainer';

        for(var i = 0 ; i < this.sliders.length ; i ++){

            var config = Ext.Object.merge(conf, this.sliders[i]);
            var slider =Ext.create("viewer.components.Slider", config);
            this.sliderObjects.push(slider);
        }

        if(this.sliderForUserAdded){
            var me =this;
            var c = {
                selectedLayers:[],
                initSelectedContent: JSON.parse(JSON.stringify( this.viewerController.app.selectedContent)),
                name: this.sliderForUserAddedText ? this.sliderForUserAddedText :"Overige",
                initialTransparency: this.sliderForUserAddedInitTransparency
            }
            c = Ext.Object.merge(conf, c);
            var s =Ext.create("viewer.components.NonInitLayerSlider", c);
            this.sliderObjects.push(s);
        }
        return this;
    },

    getExtComponents: function() {
        var components = [ this.panel.getId() ];
        for(var slider in this.sliderObjects) {
            components.push(this.sliderObjects[slider].getExtComponents());
        }
        return components;
    }
});

