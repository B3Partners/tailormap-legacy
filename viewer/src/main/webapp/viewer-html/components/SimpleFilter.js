/*
 * Copyright (C) 2012-2015 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Ext */

Ext.define("viewer.components.SimpleFilter", {
    extend: "viewer.components.Component",
    container: null,
    config: {
        filters: null,
        layers: null,
        name: null,
        title: ""
    },
    simpleFilters:null,
    allFilters:null,
    constructor: function (conf) {
        this.initConfig(conf);
		viewer.components.SimpleFilter.superclass.constructor.call(this, this.config);
        this.simpleFilters = [];
        this.allFilters = [];

        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.layersInitialized, this);

        var renderInPanel = false;
        var opts = {};
        if(this.config.title || (this.config.hasOwnProperty('showHelpButton') && this.config.showHelpButton !== "false")) {
            renderInPanel = true;
            opts = {
                title: this.getPanelTitle(),
                tools: this.getHelpToolConfig(),
                padding: 0,
                border: 0
            };
        }

        var containerContentId = Ext.id();
        this.container = Ext.create(renderInPanel ? 'Ext.panel.Panel' : 'Ext.container.Container', Ext.Object.merge(opts, {
            width: '100%',
            height: '100%',
            renderTo: this.div,
            html: Ext.String.format('<div class="simple-filter-wrapper" id="{0}"></div>', containerContentId)
        }));

        var me = this;
        Ext.Array.each(this.config.filters, function(filter, index) {
            var className = filter["class"];
            var appLayerId = me.config.layers[filter.appLayerId];
            var newFilter = Ext.create(className, {
                appLayerId: appLayerId, // convert from index to actual appLayerId
                attributeName: filter.attributeName,
                filterConfig: filter.config,
                container: containerContentId,
                simpleFilter: me,
                name: me.config.name + "_" + index,
                viewerController: me.viewerController
            });
            if(newFilter instanceof viewer.components.sf.SimpleFilter){
                me.simpleFilters.push(newFilter);
            }
            me.allFilters.push({
                filter: newFilter,
                appLayerId: appLayerId
            });
        });
        Ext.Array.each(this.simpleFilters, function (child) {
            Ext.Array.each(me.simpleFilters, function (parent) {
                if(child.config.filterConfig.linkedFilter === parent.config.filterConfig.id){
                    child.parentFilterInstance = parent;
                    parent.childFilters.push(child);
                    parent.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,function(){
                        child.handleLinkedfilterChanged();
                    },child);
                }
            });
        });
        return this;
    },

    layersInitialized: function() {
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED, this.layerVisibilityChanged,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED, this.layerVisibilityChanged,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED, this.layerVisibilityChanged,this);
        this.layerVisibilityChanged();
    },

    getFilterById:function(filterId){
        for(var i = 0; i < this.allFilters.length; i++) {
            if(this.allFilters.filter.filterConfig.id === filterId){
                return this.allFilters.filter;
            }
        }
        return null;
    },
    // Handler for changes to the visibility of layers
    layerVisibilityChanged: function() {
        var visibleLayers = this.config.viewerController.getVisibleLayers(true);
        for(var i = 0; i < this.allFilters.length; i++) {
            var appLayerId = this.allFilters[i].appLayerId;
            // Always set visible when there is no appLayerId
            var visible = true;
            if(appLayerId) {
                // Cast to appLayerId to string
                appLayerId = "" + appLayerId;
                // Set visible when the appLayerId is in the visibile layers array
                visible =  visibleLayers.indexOf(appLayerId) !== -1;
            }
            this.allFilters[i].filter.setVisible(visible);
        }
    },

    getDiv: function() {
        return this.container;
    },

    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});


