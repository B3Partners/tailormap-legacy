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
 * Legend: Shows legends for layers.
 *
 * XXX Determine if many WMS legend graphic requests cause starvation of
 * available HTTP requests for loading maps so we should limit the concurrent
 * loading of legend images (legend images which use the data: protocol should
 * not be queued).
 *
 * When legend info cannot be shown for an appLayer it is not shown, no
 * placeholders are displayed. If the layer cannot be shown because of an error
 * the logger should show messages.
 *
 * @author Matthijs Laan, B3Partners
 */
Ext.define("viewer.components.Legend", {
    extend: "viewer.components.Component",

    /**
     * Legend data keyed by appLayer id
     * Object properties:
     * order: When traversing the tree, assign an order to appLayers for display
     *  in a flat list. This should be the z-order for the appLayers on the map.
     * waitingForInfo: Whether info for the legend has been requested and is
     *   being waited for. If true the element is null. If false and element is
     *   null, no info has been requested yet.
     * element: DOM element for the legend
     */
    legends: null,

    /**
     * Sparse array containing DOM elements for legends indexed by the z-order
     * of the appLayer.
     * Used to find the DOM element to insertBefore() new legend elements.
     * Contains object with appLayer and element properties so we can also find
     * the appLayer by order.
     */
    orderedElements: null,

    config: {
        title: "Legenda",
        titlebarIcon: "",
        tooltip: "",
        margin: "0px",
        showBackground: false
    },
    constructor: function (conf){
        viewer.components.Legend.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;

        var css = "\
/* Styling for legends, see for example:\
 * http://jsfiddle.net/ZVUBv/1/ \
 */\
\
.legend {\
    padding: {0};\
    width: 100%;\
    height: 100%;\
    overflow: auto;\
}\
\
.legend .layer {\
    clear: left;\
}\
\
.legend .layer .name {\
    font-weight: bold;\
}\
\
.legend .layer .image {\
    clear: left;\
    float: left;\
    padding-right: 3px;\
}\
\
.legend .layer .label {\
    line-height: 31px; /* center single-line label vertically to align to image */\
    white-space: nowrap;\
}";
        css = Ext.String.format(css, this.margin);
        Ext.util.CSS.createStyleSheet(css, "legend");

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
            html: '<div id="' + this.name + 'legendContainer" class="legend"></div>',
            tools: tools
        });

        this.legendContainer = document.getElementById(this.name + 'legendContainer');

        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.onLayersInitialized,this);
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.onSelectedContentChange,this);
        this.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.onLayerVisibilityChanged,this);

        return this;
    },

    getExtComponents: function() {
        return [ this.panel.getId() ];
    },

    onLayersInitialized: function() {
        this.initLegend();
    },

    onSelectedContentChange: function() {
        this.resetLegend();
        this.initLegend();
    },

    onLayerVisibilityChanged: function(map, object) {
        var layer = object.layer;
        var vis = object.visible;
        var appLayer = this.getViewerController().app.appLayers[layer.appLayerId];

        // When appLayer is non-existing (ie. vectorlayeres, imagelayers,etc.), return.
        if(!appLayer){
            return;
        }

        if(this.legends == null) {
            // layersInitialized event not yet received, ignore
            return;
        }

        var legend = this.legends[appLayer.id];

        if(!legend) {
            // Happens when a new layer is added to selectedcontent using
            // ViewerController.setSelectedContent()
            // onSelectedContentChange() will be called later
            return;
        }

        if(legend.element != null) {
            Ext.fly(legend.element).setVisible(vis);
        } else if(legend.waitingForInfo) {
            // do nothing - visibility is checked again when info is received
        } else {
            this.createLegendForAppLayer(appLayer);
        }

    },

    resetLegend: function() {
        while(this.legendContainer.firstChild) {
            Ext.removeNode(this.legendContainer.firstChild);
        }
        this.legends = null;
        this.orderedElements = null;
    },

    initLegend: function() {
        var me = this;

        me.legends = {};
        me.orderedElements = [];

        var index = 0;

        this.viewerController.traverseSelectedContent(
            Ext.emptyFn,
            function(appLayer) {
                if(appLayer && appLayer.id) {
                    me.legends[appLayer.id] = {
                        order: index++,
                        waitingForInfo: false,
                        element: null
                    };

                    me.createLegendForAppLayer(appLayer);
                }
            }
        );
    },

    /**
     * This function also does the check whether a legend should be visible
     * before the legend is actually created. This way the check can be in once
     * place instead of before each call to this function.
     */
    createLegendForAppLayer: function(appLayer) {
        var me = this;

        if(!this.showBackground && appLayer.background
        || !appLayer.checked) {
            return;
        }

        //console.log("get legend info for appLayer " + appLayer.alias);

        var legend = this.legends[appLayer.id];

        if(legend.waitingForInfo || legend.element) {
            // should never happen
            return;
        }
        legend.waitingForInfo = true;

        // TODO if necessary with a large legend, use a queue to prevent
        // starvation of HTTP requests for map requests which should have
        // priority

        this.viewerController.getLayerLegendInfo(
            appLayer,
            function(appLayer, legendInfo) {
                me.onLayerLegendInfo(appLayer, legendInfo);
            },
            Ext.emptyFn
        );
    },

    onLayerLegendInfo: function(appLayer, legendInfo) {

        var legend = this.legends[appLayer.id];
        //console.log("legend info received for appLayer " + appLayer.alias + ", order " + legend.order, legendInfo);

        legend.waitingForInfo = false;

        // if layer was turned off since we requested the legend info, do not
        // create an element (the info should be from cache next time the layer
        // is turned on, so do not create an invisible legend element)
        //
        // Test this by calling this function with setTimeout() in
        // createLegendForAppLayer and turn the layer off before this function
        // is called
        if(!appLayer.checked) {
            //console.log("appLayer " + appLayer.alias + " was unchecked since requesting legend info! not creating legend");
            return;
        }

        var legendElement = this.createLegendElement(appLayer, legendInfo);

        legend.element = legendElement;
        this.orderedElements[legend.order] = {
            appLayer: appLayer,
            element: legendElement
        };

        var indexAfter = this.findElementAfter(this.orderedElements, legend.order);
        var legendAfter = indexAfter == null ? null : this.orderedElements[indexAfter].element;
        //console.log("for appLayer " + appLayer.alias + " with order " + legend.order + ", insert before order " + indexAfter +
        //    (legendAfter == null ? " (append at end)" : " (before " + this.orderedElements[indexAfter].appLayer.alias + ")")
        //);

        this.legendContainer.insertBefore(legendElement, legendAfter);
    },

    createLegendElement: function(al, legendInfo) {
        var divLayer = document.createElement("div");
        divLayer.className = "layer";
        var divName = document.createElement("div");
        divName.className = "name";
        divName.innerHTML = Ext.htmlEncode(al.alias);
        divLayer.appendChild(divName);

        var img, divImage;
        Ext.Array.each(legendInfo.parts, function(part) {
            divImage = document.createElement("div");
            var divLabel = document.createElement("div");

            img = document.createElement("img");
            img.src = part.url;
            img.onload = function() {
                //console.log("legend image for label " + divLabel.innerHTML + " loaded, height " + this.height);
                divLabel.style.lineHeight = (this.height + 4) + "px";
            };

            divImage.className = "image";
            divImage.appendChild(img);
            divLayer.appendChild(divImage);
            if (part.label && legendInfo.parts.length > 1){
                divLabel.className = "label";
                divLabel.innerHTML = Ext.htmlEncode(part.label);
                divLayer.appendChild(divLabel);
            }
        });
        Ext.fly(divLayer).setVisibilityMode(Ext.Element.DISPLAY);
        return divLayer;
    },

    /**
     * Finds the smallest index in the (sparse) array that is greater than the
     * given search index.
     * If no indexes are greater than search, null is returned.
     * If the array is empty, null is returned.
     */
    findElementAfter: function(a, search) {
        if(!(a instanceof Array)) {
            throw "findElementAfter only works on arrays";
        }
        if(a.length === 0) {
            return null;
        }

        for(var i in a) {
            if(!a.hasOwnProperty(i)) {
                continue;
            }
            if(i > search) {
                return i;
            }
        }
        return null;
    }
});
