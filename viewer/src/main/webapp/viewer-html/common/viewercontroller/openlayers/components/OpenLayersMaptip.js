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
 * OpenLayersMaptip component
 * Creates a Maptip component for OpenLayers
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.viewercontroller.openlayers.components.OpenLayersMaptip",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersComponent",    
    map: null,
    /**
     * @constructor
     * @param {Object} conf
     * @param {type} map
     * @returns {viewer.viewercontroller.openlayers.components.OpenLayersMaptip}
     */
    constructor: function(conf,map){
        viewer.viewercontroller.openlayers.components.OpenLayersMaptip.superclass.constructor.call(this,conf);
        this.map=map;
        this.frameworkObject= new OpenLayers.Control();
        var me =this;
        this.frameworkObject.handler= new OpenLayers.Handler.Hover(
            this.frameworkObject,{
                //the handlers:
                pause: function (object){
                    me.onPause(object);
                },
                move: this.onMove
            },{
                //the options:
                delay: conf.maptipdelay,
                pixelTolerance: null,
                stopMove: false
            }
        );
    },
    getFrameworkObject: function() {
        return this.frameworkObject;
    },
    onPause: function(object){         
        var lonLat = this.map.getFrameworkMap().getLonLatFromViewPortPx(object.xy);
        /**
         * @field
         * Occurs when the map wants a maptip.
         * @property map the map where this event occured
         * @property options.x x in pixels on the screen
         * @property options.y y in pixels on the screen
         * @property options.coord.x the x coord in world coords
         * @property options.coord.y the y coord in world coords
         */
        var options={
            x: object.xy.x,
            y: object.xy.y,
            coord: {
                x: lonLat.lon,
                y: lonLat.lat
            }
        }
        this.map.fire(viewer.viewercontroller.controller.Event.ON_MAPTIP,options);
    },
    /**
     * @see viewercontroller.controller.Component#setVisible
     */
    setVisible: function(vis){
        if (vis){
            this.frameworkObject.activate();
        }else{
            this.frameworkObject.deactivate();
        }
    }
});