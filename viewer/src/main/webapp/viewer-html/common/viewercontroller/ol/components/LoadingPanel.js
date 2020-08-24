/*
 * ol3-loadingpanel - v1.0.2 - 2016-10-04
 * Copyright (c) 2016 Emmanuel Blondel
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 *
 *
 * @author Emmanuel Blondel
 *
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([], function () {
            return (factory());
        });
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        factory();
    }
}(this, function () {
    /**
     * @classdesc
     * A control to display a loader image (typically an animated GIF) when
     * the map tiles are loading, and hide the loader image when tiles are
     * loaded
     *
     * @constructor
     * @extends {ol.control.Control}
     * @param {olx.control.LoadingPanelOptions} opt_options Options.
     */
    ol.control.LoadingPanel = function (opt_options) {

        var options = opt_options || {};

        this.counter = 0;

        this.visible = true;

        this.maximized = false;

        this.minimizeTimeout = null;

        this.minimizeTimeoutDelay = (options.timeOut) ? options.timeOut : null;

        this.mapListeners = [];

        this.register = false;

        this.left = (options.left) ? options.left : 0;

        this.top = (options.top) ? options.top : 40;

        var element = document.createElement('div');
        element.className = 'olControlLoadingPanel' + ' ' + 'ol-unselectable';

        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });
    };

    ol.inherits(ol.control.LoadingPanel, ol.control.Control);

    /**
     * Setup the loading panel
     */
    ol.control.LoadingPanel.prototype.setup = function () {
        this.element.style.left = this.left + 'px';
        this.element.style.top = this.top + 'px';
        this.element.style.position = 'absolute';

        var this_ = this;

        //display loading panel before render
        this.mapListeners.push(this.getMap().on('precompose', function (map, framestate) {
            if (!this_.register) {
                this_.registerLayersLoadEvents_();
            }
            //this_.show();
        }));




    };


    /**
     * Reports load progress for a source
     * @param source
     * @return true if complete false otherwise
     */
    ol.control.LoadingPanel.prototype.updateSourceLoadStatus_ = function (source) {
        return Math.round(source.loaded / source.loading * 100) == 100;
    }

    /**
     * Register layer load events
     * @param layer
     */
    ol.control.LoadingPanel.prototype.registerLayerLoadEvents_ = function (layer) {

        var me = this;
        this.register = true;
        layer.getSource().on("tileloadstart", function (e) {
            me.increaseCounter();
        });
        layer.getSource().on(["tileloadend", "tileloaderror"], function (e) {
            if (e.target.getState() == 'error')
                console.warn("Loading tile failed for resource '" + e.tile.src_ + "'");
            me.decreaseCounter();
        });

    };

    /**
     * Register layer load events
     *
     */
    ol.control.LoadingPanel.prototype.increaseCounter = function () {
        var me = this;
        var timeoutDelay = me.minimizeTimeoutDelay || 5000;
        if (this.counter > 0) {
            if (this.minimizeTimeout != null) {
                window.clearTimeout(this.minimizeTimeout);
            }
            this.minimizeTimeout = window.setTimeout(function () {
                if (me.maximized) {
                    while (me.counter > 0) {
                        me.decreaseCounter();
                    }
                }
            }, timeoutDelay);

        }
        this.counter++;
        if (this.counter > 0) {
            if (!this.maximized && this.visible) {
                this.maximizeControl();
            }
        }
    };

    ol.control.LoadingPanel.prototype.decreaseCounter = function () {
        if (this.counter > 0) {
            this.counter--;
        }
        if (this.counter == 0) {
            if (this.maximized && this.visible) {
                this.minimizeControl();
            }
        }
    };

    ol.control.LoadingPanel.prototype.registerLayersLoadEvents_ = function () {
        var groups = this.getMap().getLayers().getArray();
        for (var i = 0; i < groups.length; i++) {
            var layer = groups[i];
            if (layer instanceof ol.layer.Group) {
                var layers = layer.getLayers().getArray();
                for (var j = 0; j < layers.length; j++) {
                    var l = layers[j];
                    if (!(l instanceof ol.layer.Vector)) {
                        this.registerLayerLoadEvents_(l);
                    }
                }
            } else if (layer instanceof ol.layer.Base) {
                if (!(layer instanceof ol.layer.Vector)) {
                    this.registerLayerLoadEvents_(layer);
                }
            }
        }
    }

    /**
     * Gives a load status for the complete stack of layers
     *
     */




    ol.control.LoadingPanel.prototype.minimizeControl = function (evt) {
        this.element.style.display = "none";
        this.maximized = false;


    };

    ol.control.LoadingPanel.prototype.maximizeControl = function (evt) {
        this.element.style.display = "block";
        this.maximized = true;

    };





    /**
     * Set the map instance the control is associated with.
     * @param {ol.Map} map The map instance.
     */
    ol.control.LoadingPanel.prototype.setMap = function (map) {

        // Clean up listeners associated with the previous map
        for (var i = 0, key; i < this.mapListeners.length; i++) {
            ol.Observable.unByKey(this.mapListeners[i]);
        }

        this.mapListeners.length = 0;

        ol.control.Control.prototype.setMap.call(this, map);
        if (map)
            this.setup();

    };

}));