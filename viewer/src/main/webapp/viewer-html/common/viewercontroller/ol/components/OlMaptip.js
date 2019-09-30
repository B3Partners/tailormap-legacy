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


/* global Ext, ol */

Ext.define("viewer.viewercontroller.ol.components.OlMaptip", {
    extend: "viewer.viewercontroller.ol.OlComponent",
    map: null,
    timerId: null,
    delay: 500,
    /**
     * @constructor
     * @param {Object} conf
     * @param {type} map
     * @returns {viewer.viewercontroller.openlayers.components.OpenLayersMaptip}
     */
    constructor: function (conf, map) {
        viewer.viewercontroller.ol.components.OlMaptip.superclass.constructor.call(this, conf);
        this.map = map;
        var me = this;
        this.frameworkObject = new ol.interaction.Pointer();
        this.map.getFrameworkMap().on('pointermove', function (evt) {
            me.clearTimer();
            me.timerId = window.setTimeout(function () {
                me.onPause(evt);
            }, this.delay);
        }, this);

    },

    clearTimer: function () {
        if (this.timerId !== null) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        }
    },

    onPause: function (evt) {
        var crd = evt.coordinate;
        var pix = evt.pixel;

        var options = {
            x: pix[0],
            y: pix[1],
            coord: {
                x: crd[0],
                y: crd[1]
            }
        };
        this.map.fire(viewer.viewercontroller.controller.Event.ON_MAPTIP, options);
    }
});