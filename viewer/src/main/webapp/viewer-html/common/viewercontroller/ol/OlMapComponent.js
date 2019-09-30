/* 
 * Copyright (C) 2019 B3Partners B.V.
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

/* global ol, Ext, proj4, MapComponent */

Ext.define("viewer.viewercontroller.OlMapComponent", {
    extend: "viewer.viewercontroller.MapComponent",
    
    historyExtents: null,
    mapOptions: null,
    // References to the dom object of the content top and -bottom.
    contentTop: null,
    selectedTool: null,
    contentBottom: null,
    config: {
        theme: "flamingo"
    },
    constructor: function (viewerController, domId, config) {

        this.selectedTool = [];
        this.domId = Ext.id();
        var container = document.createElement('div');
        container.id = this.domId;
        container.style.height = '100%';
        container.style.width = '100%';
        document.getElementById(domId).appendChild(container);
        historyExtents = {index:0,
            extents:[],
            update:true
        };

        viewer.viewercontroller.OlMapComponent.superclass.constructor.call(this, viewerController, domId, config);
        var resolutions;
        if (config && config.resolutions) {
            var rString = (config.resolutions).split(",");
            resolutions = [];
            for (var i = 0; i < rString.length; i++) {
                var res = Number(rString[i]);
                if (!isNaN(res)) {
                    resolutions.push(res);
                }
            }
        } else {
            resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21, 0.105];
        }
        var extentAr = [-285401.0, 22598.0, 595401.0, 903401.0];
        var maxExtent = [7700, 304000, 280000, 62000];

        proj4.defs(this.projection, this.projectionString);
        ol.proj.proj4.register(proj4);
        var projection = ol.proj.get(this.projection);

        projection.setExtent(extentAr);


        this.mapOptions = {
            projection: projection,
            maxExtent: maxExtent,
            resolution: 512,
            resolutions: resolutions,
            extentAr: extentAr
        };

        var me = this;
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING, function () {
            setTimeout(function () {
                me.checkTools();
            }, 10);
        }, this);
        return this;
    },

    checkTools: function () {
        var enable = true;
        if (this.getTools().length !== 0) {
            var tools = this.getTools();
            for (var i = 0; i < tools.length; i++) {
                var tool = tools[i];
                if (tool.blocksDefaultTool) {
                    enable = false;
                }
            }
        }

        if (enable) {
            var defaultTool = new viewer.viewercontroller.ol.tools.OlDefaultTool({
                viewerController: this.viewerController,
                id: 'defaultTool'
            });
            this.addTool(defaultTool);
            defaultTool.setVisible(false);
            defaultTool.activate();
        }
    },

    initEvents: function () {
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_DOWN]                                      = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_EVENT_UP]                                        = "deactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_CAPABILITIES]                                = "onGetCapabilities";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE]                                 = "onConfigComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED]                                   = "addfeature";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CLICK]                                           = "click";
        this.eventList[viewer.viewercontroller.controller.Event.ON_SET_TOOL]                                        = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE]                     = "onUpdateComplete";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LOADING_START]                                   = "loadstart";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LOADING_END]                                     = "loadend";
        this.eventList[viewer.viewercontroller.controller.Event.ON_MEASURE]                                         = "measure";
        this.eventList[viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT]                          = "moveend";
        this.eventList[viewer.viewercontroller.controller.Event.ON_CHANGE_EXTENT]                                   = "move";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED]                                   = "remove";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_ADDED]                                     = "add";
        this.eventList[viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO]                                = "getfeatureinfo";
        this.eventList[viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED]                        = "change:visible";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ACTIVATE]                                        = "activate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_DEACTIVATE]                                      = "deactivate";
        this.eventList[viewer.viewercontroller.controller.Event.ON_ZOOM_END]                                        = "zoomend";
    },

    getPanel: function () {
        return this.panel;
    },

    createMap: function (id, options) {
        options = Ext.merge(this.mapOptions, options);
        options.mapComponent = this;
        options.viewerController = this.viewerController;
        options.domId = this.domId;
        var openLayers5Map = Ext.create("viewer.viewercontroller.ol.OpenLayers5Map", options);
        return openLayers5Map;
    },

    createTilingLayer: function (name, url, options) {
        options.name = name;
        options.url = url;
        options.viewerController = this.viewerController;
        if (options.alpha !== undefined) {
            options.opacity = options.alpha / 100;
        }
        var tmsLayer = new viewer.viewercontroller.ol.OlTilingLayer(options);
        return tmsLayer;
    },

    createImageLayer: function (name, url, bounds) {
        if (bounds.minx) {
            bounds = [bounds.minx, bounds.miny, bounds.maxx, bounds.maxy];
        }
        var imageLayer = Ext.create("viewer.viewercontroller.ol.OlImageLayer", {
            id: name,
            url: url,
            extent: bounds,
            frameworkLayer: this.viewerObject,
            viewerController: this.viewerController
        });

        return imageLayer;
    },

    createVectorLayer: function (options) {
        if (options === undefined) {
            options = new Object();
            options["isBaseLayer"] = false;
        } else {
            if (options["isBaseLayer"] === undefined) {
                options["isBaseLayer"] = false;
            }
        }

        return Ext.create("viewer.viewercontroller.ol.OlVectorLayer", options);
    },

    createWMSLayer: function (name, wmsurl, ogcParams, config) {
        config.options = new Object();
        config.options["id"] = null;
        config.options["isBaseLayer"] = true;
        config.options["transitionEffect"] = "resize";
        config.options["events"] = new Object();
        config.options["visibility"] = ogcParams["visible"];
        config.options["name"] = name;
        config.options["url"] = wmsurl;
        // TODO: still needed?
        for (var key in ogcParams) {
            config.options[key] = ogcParams[key];
        }
        config.ogcParams = ogcParams;
        config.viewerController = this.viewerController;
        config.options.url = wmsurl;
        if (config.alpha !== undefined) {
            config.options.opacity = (config.alpha / 100);
        }
        if (config.ratio !== undefined) {
            config.options.ratio = config.ratio;
        }

        var wmsLayer = Ext.create("viewer.viewercontroller.ol.OlWMSLayer", config);
        return wmsLayer;
    },

    createArcServerLayer: function (name, url, options, viewerController) {
        options.name = name;
        options.url = url;
        options.viewerController = viewerController;
        if (options.alpha !== undefined) {
            options.opacity = options.alpha / 100;
        }
        var arcServer = Ext.create("viewer.viewercontroller.ol.OlArcServerLayer", options);
        return arcServer;
    },

    addMap: function (map) {
        if (!(map instanceof viewer.viewercontroller.ol.OpenLayers5Map)) {
            Ext.Error.raise({msg: "The given map is not of the type 'OlMap'"});
        }
        if (this.maps.length >= 1)
            Ext.Error.raise({msg: "Multiple maps not supported yet"});
        this.maps.push(map);

        this.createMenus(this.mapOptions.options.top, this.mapOptions.options.bottom);

    },

    getMap: function () {
        return this.maps[0];
    },

    createMenus: function (top, bottom) {
        // Make a panel div in order to:
        // 1. catch mouseclicks/touch events to the panel (when a misclick is done) so it doesn't propagate to the map (and trigger some other controls)
        // 2. make it possible to place the toolbar out of the map
        // 3. make it possible to place scalebar/mouseposition/etc. out of the map

        // Div container for content
        var container = document.getElementById(this.domId);
        container.style.position = "absolute";

        // Top menu
        var mapEl = Ext.get(this.getMap().frameworkMap.getViewport());
        var currentHeight = mapEl.getHeight();
        mapEl.dom.style.position = "absolute";

        var topHeight;
        if (top.indexOf("%") === -1) {
            currentHeight -= top;
            topHeight = top;
        } else {
            var percent = top.substring(0, top.indexOf("%"));
            var heightInPixels = currentHeight / 100 * percent;
            currentHeight -= heightInPixels;
            topHeight = heightInPixels;
        }
        container.style.top = topHeight + 'px';

        // Bottom menu
        var bottomHeight;
        if (bottom.indexOf("%") === -1) {
            bottomHeight = bottom;
            currentHeight -= bottom;
        } else {
            var percent = bottom.substring(0, bottom.indexOf("%"));
            var heightInPixels = currentHeight / 100 * percent;
            bottomHeight = heightInPixels;
            currentHeight -= heightInPixels;
        }

        container.style.height = currentHeight + 'px';

        // Make divs
        this.contentTop = document.createElement('div');
        this.contentTop.id = 'content_top';

        var topStyle = this.contentTop.style;
        var topLayout = this.viewerController.getLayout('top_menu');
        if (topLayout.height) {
            topStyle.background = topLayout.bgcolor;
            topStyle.height = topLayout.height + topLayout.heightmeasure;
        }

        // Give it a higher z-index than the map to render it on top of the map
        mapEl.dom.style.zIndex = 100;
        topStyle.zIndex = mapEl.dom.style.zIndex + 1;

        this.contentTop.setAttribute("class", "olControlPanel");
        container.parentNode.insertBefore(this.contentTop, container);

        // Make content_bottom
        if (bottomHeight && parseInt(bottomHeight) > 0) {
            this.contentBottom = document.createElement('div');
            this.contentBottom.id = "content_bottom";
            var bottomStyle = this.contentBottom.style;
            var bottomLayout = this.viewerController.getLayout('content_bottom');
            bottomStyle.height = bottomHeight + "px";
            bottomStyle.background = bottomLayout.bgcolor;
            bottomStyle.top = currentHeight + parseInt(topHeight) + "px";
            bottomStyle.position = "relative";
            container.parentNode.appendChild(this.contentBottom);
        }
        this.getMap().updateSize();
    },

    createComponent: function (config) {
        var type = config.type;
        var comp = null;
        if (type === viewer.viewercontroller.controller.Component.LOADMONITOR) {
            comp = Ext.create("viewer.viewercontroller.ol.components.OlLoadMonitor", config);
        } else if (type === viewer.viewercontroller.controller.Component.OVERVIEW) {
            comp = Ext.create("viewer.viewercontroller.ol.components.OlOverview", config);
        } else if (type === viewer.viewercontroller.controller.Component.NAVIGATIONPANEL) {
            var panZoomBar = new ol.control.panZoomBar({imgPath: "/openlayers/img/",
                slider: true,
                ownmap: this,
                left: config.left,
                top: config.top});
            comp = Ext.create("viewer.viewercontroller.ol.OlComponent", config, panZoomBar);
        } else if (type === viewer.viewercontroller.controller.Component.COORDINATES) {
            var options = {numDigits: config.decimals};
            if (this.contentBottom) {
                options.div = this.contentBottom;
            }
            config.cssClass = "ol-mouse-position";
            config.defaultAlignPosition = "tr";
            comp = Ext.create("viewer.viewercontroller.ol.OlComponent", config, new ol.control.MousePosition({projection: config.projection,
                target: options.target,
                undefinedHTML: 'outside',
                coordinateFormat: ol.coordinate.createStringXY(options.numDigits)}));
        } else if (type === viewer.viewercontroller.controller.Component.SCALEBAR) {
            var frameworkOptions = {};
            frameworkOptions.bottomOutUnits = '';
            frameworkOptions.bottomInUnits = '';
            if (!Ext.isEmpty(config.units)) {
                frameworkOptions.topOutUnits = config.units;
            }
            if (this.contentBottom) {
                frameworkOptions.target = this.contentBottom;
                config.cssClass = "olControlScale";
            }
            comp = Ext.create("viewer.viewercontroller.ol.OlComponent", config,
                    new ol.control.ScaleLine());
        } else if (type === viewer.viewercontroller.controller.Component.MAPTIP) {
            comp = Ext.create("viewer.viewercontroller.ol.components.OlMaptip", config, this.getMap());
        } else if (type === viewer.viewercontroller.controller.Component.SNAPPING) {
            comp = Ext.create("viewer.viewercontroller.ol.OlSnappingController", config);
        } else if (type === viewer.viewercontroller.controller.Component.KEYBOARD) {
            this.getMap().getFrameworkMap().addInteraction(new ol.interaction.KeyboardPan());
            this.getMap().getFrameworkMap().addInteraction(new ol.interaction.KeyboardZoom());
        } else {
            this.viewerController.logger.warning("Framework specific component with type " + type + " not yet implemented!");
        }

        return comp;
    },

    addComponent: function (component) {
        if (Ext.isEmpty(component)) {
            this.viewerController.logger.warning("Empty component added to OpenLayersMapComponent. \nProbably not yet implemented");
        } else {
            //add the component to the map
            this.getMap().getFrameworkMap().addControl(component.getFrameworkObject());
            //component.getFrameworkObject().activate();
            component.doAfterAdd();
        }
    },

    createTool: function (conf) {
        var me = this;
        var type = conf.type;
        conf.viewerController = this.viewerController;
        var frameworkOptions = {};
        if (conf.frameworkOptions) {
            frameworkOptions = conf.frameworkOptions;
        }
        //pass the tool tip to the framework object.
        if (conf.tooltip) {
            frameworkOptions.title = conf.tooltip;
        }

        if (type === viewer.viewercontroller.controller.Tool.ZOOMIN_BOX) {
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.ZoomIn(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.ZOOMOUT_BUTTON) {//3,
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.ZoomOutButton(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.FULL_EXTENT) {//21,
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.FullExtent(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.PAN) {//7,
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.DragPan(conf));

        } else if (type === viewer.viewercontroller.controller.Tool.SUPERPAN) {//5,
            conf.enableKinetic = true;
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.DragPan(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.MEASURELINE || type === viewer.viewercontroller.controller.Tool.MEASUREAREA) {
            conf.typ = (conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? 'LineString' : 'Polygon');
            conf.displayClass = (conf.type === viewer.viewercontroller.controller.Tool.MEASURELINE ? 'olControlMeasure' : 'olControlMeasureArea');
            var t = new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.Measure(conf));
            return t;
        } else if (conf.type === viewer.viewercontroller.controller.Tool.BUTTON) {
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.ToolButton(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.GET_FEATURE_INFO) {
            //return new viewer.viewercontroller.ol.tools.OlIdentifyTool(conf);
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.OlIdentifyTool(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.MAP_CLICK) {//22
            return Ext.create("viewer.viewercontroller.ol.ToolMapClick", conf);
        } else if (type === viewer.viewercontroller.controller.Tool.DEFAULT) {//15,
            return new viewer.viewercontroller.ol.tools.OlDefaultTool(conf);
        } else if (conf.type === viewer.viewercontroller.controller.Tool.MAP_TOOL) {
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.StreetViewButton(conf));
        } else if (type === viewer.viewercontroller.controller.Tool.PREVIOUS_EXTENT) {//19, 20
            conf.displayClass  = "olcontrolnavigationhistoryprevious";
            me.getMap().addListener(viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT, me.addExtentForHistory, me);
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.PrevExtent(conf));
        }  else if (type === viewer.viewercontroller.controller.Tool.NEXT_EXTENT) {//19, 20
            conf.displayClass  = "olcontrolnavigationhistorynext";
            me.getMap().addListener(viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT, me.addExtentForHistory, me);
            return new viewer.viewercontroller.ol.OlTool(conf, new viewer.viewercontroller.ol.tools.NextExtent(conf));
        }
    },

    addTool: function (tool) {
        if (this.maps.length === 0) {
            Ext.Error.raise({msg: "No map in MapComponent!"});
        }
        if (tool instanceof Array) {
            for (var i = 0; i < tool.length; i++) {
                this.getMap().getFrameworkMap().addControl(tool[i].getFrameworkTool());
                this.addTool(tool[i]);
                MapComponent.prototype.addTool.call(this, tool[i]);
            }
        }
        this.panel = this.contentTop;
        this.panel.appendChild(tool.panelTool);
        if (!tool.onlyClick && tool.frameworkObject) {
            this.maps[0].getFrameworkMap().addInteraction(tool.frameworkObject);
        }

        if (!(tool instanceof Array)) {
            this.superclass.addTool.call(this, tool);
            //check if this is the first tool, activate it.
            if (tool.getVisible()) {
                var toolsVisible = 0;
                for (var i = 0; i < this.tools.length; i++) {
                    if (this.tools[i].getVisible()) {
                        toolsVisible++;
                    }
                }
                if (toolsVisible === 1) {
                    this.activateTool(tool);
                }
            }
        }
    },

    activateTool: function (tool, first) {
        if (first) {
            tool = this.tools[0];
        }
        var tools = this.tools;
        if (!tool.onlyClick) {
            for (var i = 0; i < tools.length; i++) {
                var t = tools[i];
                t.deactivate();
            }
        }
        var t = tool;
        t.activate();
    },

    getWidth: function () {
        var m = this.getMap();
        if (m) {
            return m.getWidth();
        }
        return null;
    },
    /**
     * @see viewer.viewercontroller.MapComponent#getHeight
     */
    getHeight: function () {
        var m = this.getMap();
        if (m) {
            return m.getHeight();
        }
        return null;
    },

    setCursor: function (show, cursor) {
        if (show) {
            Ext.get(this.domId).dom.style.cursor = cursor;
        } else {
            Ext.get(this.domId).dom.style.cursor = "default";
        }
    },

    compareExtent: function (ext1, ext2) {
        return ol.extent.equals(ext1, ext2);
    },

    addExtentForHistory: function (map, options) {
        if (!this.historyExtents) {
            this.historyExtents = {index: 0,
                extents: []
            };
        }
        this.getMap().getExtent();
        if (this.historyExtents.update) {
            this.historyExtents.extents.push(options.extent);
            this.historyExtents.index = this.historyExtents.extents.length - 1;
        } else {
            this.historyExtents.update = true;
        }
    }
});