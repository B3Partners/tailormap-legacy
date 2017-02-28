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
 * Marker object.
 * Add markers to map
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.Marker",{
    extend: "viewer.components.Component",
    constructor: function (conf){
        this.initConfig(conf);
		viewer.components.Marker.superclass.constructor.call(this, this.config);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.addMarker, this);
        return this;
    },
    addMarker: function() {
        var xy = this.getXY();
        if(xy !== null) {
            this.config.viewerController.mapComponent.getMap().setMarker('MarkerComponent', xy.x, xy.y);
        }
    },
    getXY: function() {
        var queryParams = Ext.urlDecode(window.location.search.substring(1));
        var xy = null;
        var x = null;
        var y = null;
        // First check if x/y is supplied using the URL
        if(queryParams.hasOwnProperty('markerX') && queryParams.markerX) {
            x = queryParams.markerX;
        }
        if(queryParams.hasOwnProperty('markerY') && queryParams.markerY) {
            y = queryParams.markerY;
        }
        // If X/Y is not present in the URL, check if they are configured for the component
        if(x === null && this.config.hasOwnProperty('markerX') && this.config.markerX) {
            x = this.config.markerX;
        }
        if(y === null && this.config.hasOwnProperty('markerY') && this.config.markerY) {
            y = this.config.markerY;
        }
        // Only show marker if X/Y is set
        if(x !== null && y !== null) {
            xy = { x: x, y: y };
        }
        return xy;
    },
    getExtComponents: function() {
        return [];
    }
});

