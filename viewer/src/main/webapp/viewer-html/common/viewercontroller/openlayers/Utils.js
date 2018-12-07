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
 * @class
 * @description
 */
Ext.define("viewer.viewercontroller.openlayers.Utils",{
    createBounds : function(extent){
        return new OpenLayers.Bounds(extent.minx,extent.miny,extent.maxx,extent.maxy);
    },
    createExtent : function(bounds){
        return new viewer.viewercontroller.controller.Extent(bounds.left,bounds.bottom,bounds.right,bounds.top);
    }
});
/*
 * Override for buttonclick.js. Fixes issues with clicking tools in the menu on Android devices
 */
/* Copyright (c) 2006-2015 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */
/**
 * @requires OpenLayers/Events.js
 */
/**
 * Class: OpenLayers.Events.buttonclick
 * Extension event type for handling buttons on top of a dom element. This
 *     event type fires "buttonclick" on its <target> when a button was
 *     clicked. Buttons are detected by the "olButton" class.
 *
 * This event type makes sure that button clicks do not interfere with other
 *     events that are registered on the same <element>.
 *
 * Event types provided by this extension:
 * - *buttonclick* Triggered when a button is clicked. Listeners receive an
 *     object with a *buttonElement* property referencing the dom element of
 *     the clicked button, and an *buttonXY* property with the click position
 *     relative to the button.
 */
OpenLayers.Events.buttonclick = OpenLayers.Class({

    /**
     * Property: target
     * {<OpenLayers.Events>} The events instance that the buttonclick event will
     * be triggered on.
     */
    target: null,

    /**
     * Property: events
     * {Array} Events to observe and conditionally stop from propagating when
     *     an element with the olButton class (or its olAlphaImg child) is
     *     clicked.
     */
    events: [
        'mousedown', 'mouseup', 'click', 'dblclick',
        'touchstart', 'touchmove', 'touchend', 'keydown'
    ],

    /**
     * Property: startRegEx
     * {RegExp} Regular expression to test Event.type for events that start
     *     a buttonclick sequence.
     */
    startRegEx: /^mousedown|touchstart$/,

    /**
     * Property: cancelRegEx
     * {RegExp} Regular expression to test Event.type for events that cancel
     *     a buttonclick sequence.
     */
    cancelRegEx: /^touchmove$/,

    /**
     * Property: completeRegEx
     * {RegExp} Regular expression to test Event.type for events that complete
     *     a buttonclick sequence.
     */
    completeRegEx: /^mouseup|touchend$/,

    /**
     * Property: isDeviceTouchCapable
     * {Boolean} Tells whether the browser detects touch events.
     */
    isDeviceTouchCapable: 'ontouchstart' in window ||
    window.DocumentTouch && document instanceof window.DocumentTouch,

    /**
     * Property: startEvt
     * {Event} The event that started the click sequence
     */

    /**
     * Constructor: OpenLayers.Events.buttonclick
     * Construct a buttonclick event type. Applications are not supposed to
     *     create instances of this class - they are created on demand by
     *     <OpenLayers.Events> instances.
     *
     * Parameters:
     * target - {<OpenLayers.Events>} The events instance that the buttonclick
     *     event will be triggered on.
     */
    initialize: function(target) {
        this.target = target;
        for (var i=this.events.length-1; i>=0; --i) {
            this.target.register(this.events[i], this, this.buttonClick, {
                extension: true
            });
        }
    },

    /**
     * Method: destroy
     */
    destroy: function() {
        for (var i=this.events.length-1; i>=0; --i) {
            this.target.unregister(this.events[i], this, this.buttonClick);
        }
        delete this.target;
    },

    /**
     * Method: getPressedButton
     * Get the pressed button, if any. Returns undefined if no button
     * was pressed.
     *
     * Arguments:
     * element - {DOMElement} The event target.
     *
     * Returns:
     * {DOMElement} The button element, or undefined.
     */
    getPressedButton: function(element) {
        var depth = 3, // limit the search depth
            button;
        do {
            if(OpenLayers.Element.hasClass(element, "olButton")) {
                // hit!
                button = element;
                break;
            }
            element = element.parentNode;
        } while(--depth > 0 && element);
        return button;
    },

    /**
     * Method: ignore
     * Check for event target elements that should be ignored by OpenLayers.
     *
     * Parameters:
     * element - {DOMElement} The event target.
     */
    ignore: function(element) {
        var depth = 3,
            ignore = false;
        do {
            if (element.nodeName.toLowerCase() === 'a') {
                ignore = true;
                break;
            }
            element = element.parentNode;
        } while (--depth > 0 && element);
        return ignore;
    },

    /**
     * Method: buttonClick
     * Check if a button was clicked, and fire the buttonclick event
     *
     * Parameters:
     * evt - {Event}
     */
    buttonClick: function(evt) {
        var propagate = true,
            element = OpenLayers.Event.element(evt);

        if (element &&
            (OpenLayers.Event.isLeftClick(evt) &&
                !this.isDeviceTouchCapable ||
                !~evt.type.indexOf("mouse"))) {
            // was a button pressed?
            var button = this.getPressedButton(element);
            if (button) {
                if (evt.type === "keydown") {
                    switch (evt.keyCode) {
                        case OpenLayers.Event.KEY_RETURN:
                        case OpenLayers.Event.KEY_SPACE:
                            this.target.triggerEvent("buttonclick", {
                                buttonElement: button
                            });
                            OpenLayers.Event.stop(evt);
                            propagate = false;
                            break;
                    }
                } else if (this.startEvt) {
                    if (this.completeRegEx.test(evt.type)) {
                        var pos = OpenLayers.Util.pagePosition(button);
                        var viewportElement = OpenLayers.Util.getViewportElement();
                        var scrollTop = window.pageYOffset || viewportElement.scrollTop;
                        var scrollLeft = window.pageXOffset || viewportElement.scrollLeft;
                        pos[0] = pos[0] - scrollLeft;
                        pos[1] = pos[1] - scrollTop;

                        this.target.triggerEvent("buttonclick", {
                            buttonElement: button,
                            buttonXY: {
                                x: this.startEvt.clientX - pos[0],
                                y: this.startEvt.clientY - pos[1]
                            }
                        });
                    }
                    if (this.cancelRegEx.test(evt.type)) {
                        if (evt.touches && this.startEvt.touches &&
                            (Math.abs(evt.touches[0].olClientX - this.startEvt.touches[0].olClientX) > 4 ||
                                Math.abs(evt.touches[0].olClientY - this.startEvt.touches[0].olClientY)) > 4) {
                            delete this.startEvt;
                        }
                    }
                    OpenLayers.Event.stop(evt);
                    propagate = false;
                }
                if (this.startRegEx.test(evt.type)) {
                    this.startEvt = evt;
                    OpenLayers.Event.stop(evt);
                    propagate = false;
                }
            } else {
                propagate = !this.ignore(OpenLayers.Event.element(evt));
                delete this.startEvt;
            }
        }
        return propagate;
    }

});
/**
 * Class for creating a MouseZoom only control.
 */
OpenLayers.Control.MouseWheelZoom = OpenLayers.Class(OpenLayers.Control, {
    button: null,

    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
            );
        this.handler = new OpenLayers.Handler.MouseWheel(this,{
            'up': function(evt,delta){
                this.wheelUp(evt,delta);//this.handler.wheelZoom(evt);
            },
            'down':function(evt,delta){
                this.wheelDown(evt,delta);//this.handler.wheelZoom(evt);
            }
        });
    },
    /**      
     * Method: wheelChange
     * Copied from: @see OpenLayers.Control.Navigation#wheelChange
     * @param {Event} evt
     * @param {Integer} deltaZ
     */
    wheelChange: function(evt, deltaZ) {
        var currentZoom = this.map.getZoom();
        var newZoom = this.map.getZoom() + Math.round(deltaZ);
        newZoom = Math.max(newZoom, 0);
        newZoom = Math.min(newZoom, this.map.getNumZoomLevels());
        if (newZoom === currentZoom) {
            return;
        }
        var size    = this.map.getSize();
        var deltaX  = size.w/2 - evt.xy.x;
        var deltaY  = evt.xy.y - size.h/2;
        var newRes  = this.map.baseLayer.getResolutionForZoom(newZoom);
        var zoomPoint = this.map.getLonLatFromPixel(evt.xy);
        var newCenter = new OpenLayers.LonLat(
                            zoomPoint.lon + deltaX * newRes,
                            zoomPoint.lat + deltaY * newRes );
        this.map.setCenter( newCenter, newZoom );
    },

    /**
     * Method: wheelUp
     * Copied from: @see OpenLayers.Control.Navigation#wheelUp
     * User spun scroll wheel up
     *
     * @param {Event} evt
     * @param {Integer} delta
     */
    wheelUp: function(evt, delta) {
        this.wheelChange(evt, delta || 1);
    },

    /**
     * Method: wheelDown
     * Copied from: @see OpenLayers.Control.Navigation#wheelDown
     * User spun scroll wheel down
     *
     * @param {Event} evt
     * @param {Integer} delta
     */
    wheelDown: function(evt, delta) {
        this.wheelChange(evt, delta || -1);
    }
});

OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: counter
     * {Integer} A counter for the number of layers loading
     */
    counter: 0,

    /**
     * Property: maximized
     * {Boolean} A boolean indicating whether or not the control is maximized
    */
    maximized: false,

    /**
     * Property: visible
     * {Boolean} A boolean indicating whether or not the control is visible
    */
    visible: true,

    /**
     * Constructor: OpenLayers.Control.LoadingPanel
     * Display a panel across the map that says 'loading'.
     *
     * Parameters:
     * options - {Object} additional options.
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Function: setVisible
     * Set the visibility of this control
     *
     * Parameters:
     * visible - {Boolean} should the control be visible or not?
    */
    setVisible: function(visible) {
        this.visible = visible;
        if (visible) {
            OpenLayers.Element.show(this.div);
        } else {
            OpenLayers.Element.hide(this.div);
        }
    },

    /**
     * Function: getVisible
     * Get the visibility of this control
     *
     * Returns:
     * {Boolean} the current visibility of this control
    */
    getVisible: function() {
        return this.visible;
    },

    /**
     * APIMethod: hide
     * Hide the loading panel control
    */
    hide: function() {
        this.setVisible(false);
    },

    /**
     * APIMethod: show
     * Show the loading panel control
    */
    show: function() {
        this.setVisible(true);
    },

    /**
     * APIMethod: toggle
     * Toggle the visibility of the loading panel control
    */
    toggle: function() {
        this.setVisible(!this.getVisible());
    },

    /**
     * Method: addLayer
     * Attach event handlers when new layer gets added to the map
     *
     * Parameters:
     * evt - {Event}
    */
    addLayer: function(evt) {
        if (evt.layer) {
            evt.layer.events.register('loadstart', this, this.increaseCounter);
            evt.layer.events.register('loadend', this, this.decreaseCounter);
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register('preaddlayer', this, this.addLayer);
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.events.register('loadstart', this, this.increaseCounter);
            layer.events.register('loadend', this, this.decreaseCounter);
        }
    },

    /**
     * Method: increaseCounter
     * Increase the counter and show control
    */
    increaseCounter: function() {
        this.counter++;
        if (this.counter > 0) {
            if (!this.maximized && this.visible) {
                this.maximizeControl();
            }
        }
    },

    /**
     * Method: decreaseCounter
     * Decrease the counter and hide the control if finished
    */
    decreaseCounter: function() {
        if (this.counter > 0) {
            this.counter--;
        }
        if (this.counter == 0) {
            if (this.maximized && this.visible) {
                this.minimizeControl();
            }
        }
    },

    /**
     * Method: draw
     * Create and return the element to be splashed over the map.
     */
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },

    /**
     * Method: minimizeControl
     * Set the display properties of the control to make it disappear.
     *
     * Parameters:
     * evt - {Event}
     */
    minimizeControl: function(evt) {
        this.div.style.display = "none";
        this.maximized = false;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: maximizeControl
     * Make the control visible.
     *
     * Parameters:
     * evt - {Event}
     */
    maximizeControl: function(evt) {
        this.div.style.display = "block";
        this.maximized = true;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister('preaddlayer', this, this.addLayer);
            if (this.map.layers) {
                for (var i = 0; i < this.map.layers.length; i++) {
                    var layer = this.map.layers[i];
                    layer.events.unregister('loadstart', this,
                        this.increaseCounter);
                    layer.events.unregister('loadend', this,
                        this.decreaseCounter);
                }
            }
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.LoadingPanel"

});

/**
 * Create a Click controller
*/
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control,{
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        pixelTolerance: 10,
        'stopSingle': false,
        'stopDouble': false
    },
    /**
     *
     * @param {Object} options having:
     *        options.handlerOptions: options passed to the OpenLayers.Handler.Click,
     *        options.click the function that is called on a single click (optional),
     *        options.dblclick the function that is called on a dubble click (optional)
     * @returns {OpenLayers.Control.Click}
     */
    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        Ext.apply(this.handlerOptions,options.handlerOptions);
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );
        if (options.click){
            this.onClick=options.click;
        }
        if (options.dblclick){
            this.onDblclick=options.dblclick;
        }
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.onClick,
                pixelTolerance: 10,
                'dblclick': this.onDblclick
            }, this.handlerOptions
        );
    },
    onClick: function(evt) {
    },
    onDblclick: function(evt) {
    }
});

function handleResponse(xy, request, url,layerNames,styleNames) {
    if(!this.cache ){
        this.cache = new Object();
    }
    if(!this.cache[url]){

        this.cache[url] = new Object();
        this.cache[url].features = new Array();
        this.cache[url].counter = 0;
    }
    this.cache[url].counter++;
    var doc = request.responseXML;
    if(!doc || !doc.documentElement) {
        doc = request.responseText;
    }
    var features = this.format.read(doc);
    this.cache[url].features = this.cache[url].features.concat(features);
    for ( var i = 0 ; i < features.length ;i++){
        features[i].layerNames = layerNames;
        features[i].styleNames = styleNames;
        features[i].url = url;
    }
    if (this.drillDown === false) {
        this.triggerGetFeatureInfo(request, xy, features,layerNames,styleNames);
    } else {
        this._requestCount++;
        if (this.output === "object") {
            this._features = (this._features || []).concat(
                {url: url, features: features}
            );
        } else {
        this._features = (this._features || []).concat(features);
        }
        //if (this._requestCount === this._numRequests) {
        if (request._headers.total === this.cache[url].counter) {
            this.cache[url].counter = 0;
            this.triggerGetFeatureInfo(request, xy, this.cache[url].features, layerNames,styleNames);
            delete this._features;
            delete this._requestCount;
            delete this.cache[url];
            delete this._numRequests;
        }
    }
}

/**
 * Method: request
 * Sends a GetFeatureInfo request to the WMS
 *
 * Parameters:
 * clickPosition - {<OpenLayers.Pixel>} The position on the map where the
 *     mouse event occurred.
 * options - {Object} additional options for this method.
 *
 * Valid options:
 * - *hover* {Boolean} true if we do the request for the hover handler
 */
function requestWmsGFI(clickPosition, options) {
    var layers = this.findLayers();
    if (layers.length == 0) {
        this.events.triggerEvent("nogetfeatureinfo");
        // Reset the cursor.
        OpenLayers.Element.removeClass(this.map.viewPortDiv, "olCursorWait");
        return;
    }

    options = options || {};
    if (this.drillDown === false) {
        var wmsOptions = this.buildWMSOptions(this.url, layers,
                clickPosition, layers[0].params.FORMAT);
        var request = OpenLayers.Request.GET(wmsOptions);

        if (options.hover === true) {
            this.hoverRequest = request;
        }
    } else {
        this._requestCount = 0;
        this._numRequests = 0;
        this.features = [];
        // group according to service url to combine requests
        var services = {}, url;
        for (var i = 0, len = layers.length; i < len; i++) {
            var layer = layers[i];
            var service, found = false;
            url = OpenLayers.Util.isArray(layer.url) ? layer.url[0] : layer.url;
            if (url in services) {
                services[url].push(layer);
            } else {
                this._numRequests++;
                services[url] = [layer];
            }
        }
        var layers;
        for (var url in services) {
            layers = services[url];
            for (var i = 0; i < layers.length; i++) {
                var wmsOptions = this.buildWMSOptions(url, [layers[i]],
                        clickPosition, layers[0].params.FORMAT);
                wmsOptions.headers = new Object();
                wmsOptions.headers.total = layers.length;
                wmsOptions.headers.index = i;
                OpenLayers.Request.GET(wmsOptions);
            }
        }
    }
}

/**
 * Method: buildWMSOptions
 * Build an object with the relevant WMS options for the GetFeatureInfo request
 *
 * Parameters:
 * url - {String} The url to be used for sending the request
 * layers - {Array(<OpenLayers.Layer.WMS)} An array of layers
 * clickPosition - {<OpenLayers.Pixel>} The position on the map where the mouse
 *     event occurred.
 * format - {String} The format from the corresponding GetMap request
 */
function buildWMSOptions(url, layers, clickPosition, format) {
    var layerNames = [], styleNames = [];
    for (var i = 0, len = layers.length; i < len; i++) {
        if (layers[i].params.LAYERS != null) {
            layerNames = layerNames.concat(layers[i].params.LAYERS);
            if(this.getStyleNames(layers[i]) !== null && this.getStyleNames(layers[i]) !== ""){
                styleNames = styleNames.concat(this.getStyleNames(layers[i]));
            }
        }
    }
    var firstLayer = layers[0];
    // use the firstLayer's projection if it matches the map projection -
    // this assumes that all layers will be available in this projection
    var projection = this.map.getProjection();
    var layerProj = firstLayer.projection;
    if (layerProj && layerProj.equals(this.map.getProjectionObject())) {
        projection = layerProj.getCode();
    }
    var params = OpenLayers.Util.extend({
        service: "WMS",
        version: firstLayer.params.VERSION,
        request: "GetFeatureInfo",
        exceptions: firstLayer.params.EXCEPTIONS,
        bbox: this.map.getExtent().toBBOX(null,
            firstLayer.reverseAxisOrder()),
        feature_count: this.maxFeatures,
        height: this.map.getSize().h,
        width: this.map.getSize().w,
        format: format,
        info_format: firstLayer.params.INFO_FORMAT || this.infoFormat
    }, (parseFloat(firstLayer.params.VERSION) >= 1.3) ?
        {
            crs: projection,
            i: parseInt(clickPosition.x),
            j: parseInt(clickPosition.y)
        } :
        {
            srs: projection,
            x: parseInt(clickPosition.x),
            y: parseInt(clickPosition.y)
        }
    );
    if (layerNames.length != 0) {
        params = OpenLayers.Util.extend({
            layers: layerNames,
            query_layers: layerNames,
            styles: styleNames
        }, params);
    }
    OpenLayers.Util.applyDefaults(params, this.vendorParams);
    return {
        url: url,
        params: OpenLayers.Util.upperCaseObject(params),
        extra: layerNames,
        callback: function(request) {
            this.handleResponse(clickPosition, request, url, layerNames,styleNames);
        },
        proxy: OpenLayers.ProxyHost + "serviceId=" + firstLayer.serviceId + "&url=",
        scope: this
    };
}

// https://github.com/openlayers/openlayers/issues/929#issuecomment-28795011
OpenLayers.Layer.Grid.prototype.initGriddedTiles = function(bounds) {
    this.clearTileQueue();

    // work out mininum number of rows and columns; this is the number of
    // tiles required to cover the viewport plus at least one for panning

    var viewSize = this.map.getSize();
    var minRows = Math.ceil(viewSize.h/this.tileSize.h) +
                  Math.max(1, 2 * this.buffer);
    var minCols = Math.ceil(viewSize.w/this.tileSize.w) +
                  Math.max(1, 2 * this.buffer);

    var origin = this.getTileOrigin();
    var resolution = this.getServerResolution();

    var tileLayout = this.calculateGridLayout(bounds, origin, resolution);

    var tileoffsetx = Math.round(tileLayout.tileoffsetx); // heaven help us
    var tileoffsety = Math.round(tileLayout.tileoffsety);

    var tileoffsetlon = tileLayout.tileoffsetlon;
    var tileoffsetlat = tileLayout.tileoffsetlat;

    var tilelon = tileLayout.tilelon;
    var tilelat = tileLayout.tilelat;

    var startX = tileoffsetx;
    var startLon = tileoffsetlon;

    var rowidx = 0;

    var layerContainerDivLeft = parseInt(this.map.layerContainerDiv.style.left);
    var layerContainerDivTop = parseInt(this.map.layerContainerDiv.style.top);

    var tileData = [], center = this.map.getCenter();
    do {
        var row = this.grid[rowidx++];
        if (!row) {
            row = [];
            this.grid.push(row);
        }

        tileoffsetlon = startLon;
        tileoffsetx = startX;
        var colidx = 0;

        do {
            if(!colidx) tileoffsetlon = startLon;
            var tileBounds =
                new OpenLayers.Bounds(tileoffsetlon,
                                      tileoffsetlat,
                                      tileoffsetlon + tilelon,
                                      tileoffsetlat + tilelat);

            var x = tileoffsetx;
            x -= layerContainerDivLeft;

            var y = tileoffsety;
            y -= layerContainerDivTop;

            var px = new OpenLayers.Pixel(x, y);
            var tile = row[colidx++];
            if (!tile) {
                tile = this.addTile(tileBounds, px);
                this.addTileMonitoringHooks(tile);
                row.push(tile);
            } else {
                tile.moveTo(tileBounds, px, false);
            }
            var tileCenter = tileBounds.getCenterLonLat();
            tileData.push({
                tile: tile,
                distance: Math.pow(tileCenter.lon - center.lon, 2) +
                    Math.pow(tileCenter.lat - center.lat, 2)
            });

            tileoffsetlon += tilelon;
            tileoffsetx += this.tileSize.w;
        } while ((tileoffsetlon <= bounds.right + tilelon * this.buffer)
                 || colidx < minCols);

        tileoffsetlat -= tilelat;
        tileoffsety += this.tileSize.h;
    } while((tileoffsetlat >= bounds.bottom - tilelat * this.buffer)
            || rowidx < minRows);

    //shave off exceess rows and colums
    this.removeExcessTiles(rowidx, colidx);

    // store the resolution of the grid
    this.gridResolution = this.getServerResolution();

    //now actually draw the tiles
    tileData.sort(function(a, b) {
        return a.distance - b.distance;
    });
    for (var i=0, ii=tileData.length; i<ii; ++i) {
        tileData[i].tile.draw();
    }
};


// Override Cluster strategy to only create clusters for features within map
// bounds, and thus also recluster on panning
// http://acuriousanimal.com/blog/2012/10/09/improved-performance-on-the-animatedcluster-for-openlayers/
// http://acuriousanimal.com/blog/2013/02/08/animatedcluster-pan-related-bug-fixed/

OpenLayers.Strategy.Cluster.prototype.cluster = function(event) {

    if((!event || event.zoomChanged || (event.type == "moveend" && !event.zoomChanged)) && this.features) {
        this.resolution = this.layer.map.getResolution();
        var clusters = [];
        var feature, clustered, cluster;
        var screenBounds = this.layer.map.getExtent();
        for(var i=0; i<this.features.length; ++i) {
            feature = this.features[i];
            if(feature.geometry) {
                if(!screenBounds.intersectsBounds(feature.geometry.getBounds())) {
                    continue;
                }
                clustered = false;
                for(var j=clusters.length-1; j>=0; --j) {
                    cluster = clusters[j];
                    if(this.shouldCluster(cluster, feature)) {
                        this.addToCluster(cluster, feature);
                        clustered = true;
                        break;
                    }
                }
                if(!clustered) {
                    clusters.push(this.createCluster(this.features[i]));
                }
            }
        }
        this.clustering = true;
        this.layer.removeAllFeatures();
        this.clustering = false;
        if(clusters.length > 0) {
            if(this.threshold > 1) {
                var clone = clusters.slice();
                clusters = [];
                var candidate;
                for(var i=0, len=clone.length; i<len; ++i) {
                    candidate = clone[i];
                    if(candidate.attributes.count < this.threshold) {
                        Array.prototype.push.apply(clusters, candidate.cluster);
                    } else {
                        clusters.push(candidate);
                    }
                }
            }
            this.clustering = true;
            // A legitimate feature addition could occur during this
            // addFeatures call.  For clustering to behave well, features
            // should be removed from a layer before requesting a new batch.
            this.layer.addFeatures(clusters);
            this.clustering = false;
        }
        this.clusters = clusters;
    }
};


