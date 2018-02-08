/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
    treenodes: null,
    config: {
        title: "Legenda",
        titlebarIcon: "",
        tooltip: "",
        margin: "0px",
        showBackground: false,
        infoText: "",
        showInlineLegend: false
    },
    constructor: function (conf){
        conf.details.useExtLayout = true;
        this.initConfig(conf);
        viewer.components.Legend.superclass.constructor.call(this, this.config);
        var me = this;
        
        this.config.renderLegend = this.config.regionName !== "content";
        
        if(this.config.renderLegend) {
            this.renderLegendContainer();
        }
        
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.onLayersInitialized,this);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.onSelectedContentChange,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.onLayerVisibilityChanged,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_ZOOM_END,this.onZoomEnd,this);
          
        return this;
    },

    renderLegendContainer: function() {
        // Styling for legends, see for example:  http://jsfiddle.net/ZVUBv/1/
        var css = ".legend {padding: {0}; width: 100%; height: 100%;}" +
                ".legend .layer { clear: left; }" +
                ".legend .layer .name { font-weight: bold;}" +
                ".legend .layer .image { clear: left; float: left; padding-right: 3px;}" +
                // center single-line label vertically to align to image
                ".legend .layer .label { line-height: 31px; white-space: nowrap;}";

        css = Ext.String.format(css, this.config.margin);
        Ext.util.CSS.createStyleSheet(css, "legend");
        
        var title = "";
        if(this.config.title && !this.config.viewerController.layoutManager.isTabComponent(this.name) && !this.config.isPopup) title = this.config.title;
        var tools = [];
        // Only if 'showHelpButton' configuration is present and not set to "false" we will show the help button
        if(this.config && this.config.hasOwnProperty('showHelpButton') && this.config.showHelpButton !== "false") {
            tools = [{
                type:'help',
                handler: function(event, toolEl, panel){
                    me.config.viewerController.showHelp(me.config);
                }
            }];
        }
        
        this.renderButton();

        this.legendContainer = document.createElement('div');
        this.legendContainer.className = 'legend';
        document.body.appendChild(this.legendContainer);

        var config = {
            title: title,
            height: "100%",
            tools: tools
        };

        if(this.config.infoText) {
            config.layout = {
                type: 'vbox',
                align: 'stretch'
            };
            config.items = [{
                xtype: 'container',
                html: this.config.infoText,
                padding: '0 0 5 0'
            },{
                xtype: 'container',
                contentEl: this.legendContainer,
                flex: 1,
                autoScroll: true
            }];
        } else {
            config.contentEl = this.legendContainer;
            config.autoScroll = true;
        }

        this.panel = Ext.create('Ext.panel.Panel', config);

        var parent = this.getContentContainer();
        parent.add(this.panel);
    },

    renderButton: function() {
        var me = this;
        if(!this.config.isPopup) {
            return;
        }
        viewer.components.Legend.superclass.renderButton.call(this,{
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label,
            handler: function() {
                me.popup.show();
            }
        });
    },
    
    getExtComponents: function() {
        if(!this.config.renderLegend) {
            return [];
        }
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
            if(this.config.renderLegend) Ext.fly(legend.element).setVisible(vis);
        } else if(legend.waitingForInfo) {
            // do nothing - visibility is checked again when info is received
        } else {
            this.createLegendForAppLayer(appLayer);
        }
        
        if(this.config.showInlineLegend) {
            this.appendLegendToToc(appLayer, legend.element);
        }
    },
    
    onZoomEnd: function (map) {
        if(!this.config.viewerController.layersInitialized) {
            return;
        }
        // TODO: if reset and initLegend is consuming too much, replace this with
        // refreshing the legend image src per layer
        this.resetLegend();
        this.initLegend();
        return;
    },
    
    resetLegend: function() {
        if(this.config.renderLegend) {
            while(this.legendContainer.firstChild) {
                Ext.removeNode(this.legendContainer.firstChild);
            }
        }
        this.legends = null;
        this.orderedElements = null;
        this.resetInlineLegend();
    },
    
    initLegend: function() {
        var me = this;
        
        me.legends = {};
        me.orderedElements = [];

        var index = 0;
        
        this.config.viewerController.traverseSelectedContent(
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

        if(!this.config.showBackground && appLayer.background || !this.config.showInlineLegend && !appLayer.checked) {
            return;
        }
        
        // console.debug("get legend info for appLayer ", appLayer);

        var legend = this.legends[appLayer.id];

        if(legend.waitingForInfo || legend.element) {
            // should never happen
            return;
        }
        legend.waitingForInfo = true;
        
        // TODO if necessary with a large legend, use a queue to prevent 
        // starvation of HTTP requests for map requests which should have 
        // priority
        
        var map = this.config.viewerController.mapComponent.getMap();
        var curScale = OpenLayers.Util.getScaleFromResolution(map.getResolution(), map.units);
        var legendScale = curScale;
        var serviceLayer = this.config.viewerController.getServiceLayer(appLayer);

        if (this.config.viewerController.compareToScale(appLayer, curScale, false) == -1) {
            legendScale = serviceLayer.maxScale;
        } else if (this.config.viewerController.compareToScale(appLayer, curScale, false) == 1) {
            legendScale = serviceLayer.minScale;
        }
        
        // TODO when layer is out of scale we could also decide not to show the legend for this layer

        this.config.viewerController.getLayerLegendInfo(
            appLayer,
            function(appLayer, legendInfo) {
                me.onLayerLegendInfo(appLayer, legendInfo, legendScale);
            },
            Ext.emptyFn
        );
    },
    
    onLayerLegendInfo: function(appLayer, legendInfo, legendScale) {
        
        var legend = this.legends[appLayer.id];
        // console.debug("legend info received for appLayer " + appLayer.alias + ", order " + legend.order, legendInfo);

        legend.waitingForInfo = false;

        // if layer was turned off since we requested the legend info, do not
        // create an element (the info should be from cache next time the layer
        // is turned on, so do not create an invisible legend element)
        // 
        // Test this by calling this function with setTimeout() in 
        // createLegendForAppLayer and turn the layer off before this function
        // is called
        if(!this.config.showInlineLegend && !appLayer.checked) {
            //console.log("appLayer " + appLayer.alias + " was unchecked since requesting legend info! not creating legend");
            return;
        }

        var legendElement = this.createLegendElement(appLayer, legendInfo, legendScale);
        //console.log("for appLayer " + appLayer.alias + " with order " + legend.order + ", insert before order " + indexAfter +
        //    (legendAfter == null ? " (append at end)" : " (before " + this.orderedElements[indexAfter].appLayer.alias + ")")
        //);
        
        if(appLayer.checked && this.config.renderLegend) {
            legend.element = legendElement;
            this.orderedElements[legend.order] = {
                appLayer: appLayer,
                element: legendElement
            };
            var indexAfter = this.findElementAfter(this.orderedElements, legend.order);
            var legendAfter = indexAfter == null ? null : this.orderedElements[indexAfter].element;
            this.legendContainer.insertBefore(legendElement, legendAfter);
        }
        
        if(this.config.showInlineLegend) {
            this.appendLegendToToc(appLayer, legendElement);
        }
    },

    resetInlineLegend: function() {
        this.treenodes = null;
        var tree = this.getTocTree();
        if(tree === null) {
            return;
        }
        if(tree.getEl() && tree.getEl().dom) {
            tree.getEl().dom.removeEventListener("click", this.toggleLegendImage);
        }
    },

    getTocTree: function() {
        var tocs = this.config.viewerController.getComponentsByClassName("viewer.components.TOC");
        if(tocs.length === 0) {
            return null;
        }
        return tocs[0].getTree();
    },

    loadTreeNodes: function() {
        this.treenodes = [];
        var tree = this.getTocTree();
        if(tree === null) {
            return;
        }
        var nodes = tree.getStore().query("leaf", "true").items;
        for(var i = 0; i < nodes.length; i++) {
            this.treenodes.push(nodes[i].getData());
        }
        tree.getEl().dom.addEventListener("click", this.toggleLegendImage);
    },
    
    appendLegendToToc: function(appLayer, legendElement) {
        if(this.treenodes === null) {
            this.loadTreeNodes();
        }
        if(!legendElement) {
            return;
        }
        for(var i = 0; i < this.treenodes.length; i++) {
            if(this.treenodes[i].layerObj.appLayer.id === appLayer.id) {
                this.createLegendInToc(this.treenodes[i], legendElement);
            }
        }
    },
    
    createLegendInToc: function(treenode, legendElement) {
        var el = document.getElementById("span_" + treenode.layerObj.nodeId);
        if(el) {
            if(el.parentNode.querySelector('.legend-toggle') !== null) {
                return;
            }
            var image = legendElement.querySelector(".image");
            if(image) {
                var clonedImage = image.cloneNode(true);
                clonedImage.style.display = 'none';
                var link = document.createElement('a');
                link.href = "#";
                link.className = 'legend-toggle';
                el.style.display = 'inline-block';
                el.parentNode.insertBefore(link, el);
                el.appendChild(clonedImage);
            }
        }
    },

    toggleLegendImage: function(e) {
        if(!e.target.className || e.target.className.indexOf("legend-toggle") === -1) {
            return true;
        }
        e.preventDefault();
        e.stopPropagation();
        var clonedImage = e.target.parentNode.querySelector(".image");
        if(!clonedImage) {
            return;
        }
        if(clonedImage.style.display === 'none') {
            clonedImage.style.display = 'block';
        } else {
            clonedImage.style.display = 'none';
        }
    },
    
    createLegendElement: function(al, legendInfo, legendScale) {
        var divLayer = document.createElement("div");
        divLayer.className = "layer";
        var divName = document.createElement("div");
        divName.className = "name";
        divName.innerHTML = Ext.htmlEncode(al.alias);
        divLayer.appendChild(divName);

        var img, divImage;
        function getImageSource(url) {
            // Only WMS support SCALE for legend images
            if(url.search(/service=wms/i) === -1) {
                return url;
            }
            // Append SCALE when not present
            if (url.search(/SCALE/i) === -1){
                return Ext.String.urlAppend(url, "SCALE=" + legendScale);
            }
            return url.replace(/SCALE=[0-9.,]*/i, "SCALE=" + legendScale);
        }
        var svc = this.config.viewerController.getService(al.serviceId);
        Ext.Array.each(legendInfo.parts, function(part) {
            divImage = document.createElement("div");
            var divLabel = document.createElement("div");

            img = document.createElement("img");
            if (svc && svc.useProxy) {
                img.src = actionBeans['proxy'] + '/wms?' +
                        Ext.Object.toQueryString({
                            serviceId: al.serviceId,
                            mustLogin: svc.mustLogin,
                            url: getImageSource(part.url)
                        });
            } else {
                img.src = getImageSource(part.url);
            }
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
