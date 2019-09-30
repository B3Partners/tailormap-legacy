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

/* global Ext */

Ext.define("viewer.viewercontroller.ol.OlLayer", {
    config: {
        name: null
    },
    enabledEvents: null,
    events: null,
    type: null,
    alpha: 100,
    constructor: function (config) {
        this.initConfig(config);
        this.enabledEvents = new Object();
        this.events = new Object();
        return this;
    },

    setVisible: function (visible) {
        this.visible = visible;
        if (this.frameworkLayer !== null) {
            this.frameworkLayer.setVisible(visible);
        }
    },

    reload: function () {
        this.getFrameworkLayer().getSource().refresh();
    },
    getType: function () {
        return this.type;
    },

    addListener: function (event, handler, scope) {
        var olSpecificEvent = this.config.viewerController.mapComponent.getSpecificEventName(event);
        if (olSpecificEvent) {
            if (!scope) {
                scope = this;
            }
            /* Add event to OpenLayers Layer only once, to prevent multiple fired events.    
             * count the events for removing the listener again.
             */
            if (!olSpecificEvent === "addfeature") {
                if (this.enabledEvents[olSpecificEvent]) {
                    this.enabledEvents[olSpecificEvent]++;
                } else {
                    this.enabledEvents[olSpecificEvent] = 1;

                    this.frameworkLayer.on(olSpecificEvent, this.handleEvent, this);
                }
            }
        }
        viewer.viewercontroller.controller.Layer.superclass.addListener.call(this, event, handler, scope);
    },

    removeListener: function (event, handler, scope) {
        var olSpecificEvent = this.config.viewerController.mapComponent.getSpecificEventName(event);
        if (olSpecificEvent) {
            if (!scope) {
                scope = this;
            }
            /* Remove event from OpenLayers Layer if the number of events == 0
             * If there are no listeners for the OpenLayers event, remove the listener.             
             */
            if (this.enabledEvents[olSpecificEvent]) {
                this.enabledEvents[olSpecificEvent]--;
                if (this.enabledEvents[olSpecificEvent] <= 0) {
                    this.enabledEvents[olSpecificEvent] = 0;
                    this.frameworkLayer.un(olSpecificEvent, this.handleEvent, this);
                }
            }
        }
        viewer.viewercontroller.controller.Layer.superclass.removeListener.call(this, event, handler, scope);
    },

    handleEvent: function (event) {
        var options = new Object();
        options.layer = this.map.getLayerByOpenLayersId(event.element.id);
        options.feature = this.fromOpenLayersFeature(event.feature);
        var eventName = this.config.viewerController.mapComponent.getGenericEventName(event.type);
        if (!eventName) {
            eventName = event;
        }
        this.fireEvent(eventName, options);
    },

    getVisible: function () {
        if (this.frameworkLayer !== null) {
            return this.frameworkLayer.getVisible();
        }
        return null;
    },

    setAlpha: function (alpha) {
        this.alpha = alpha;
        if (this.frameworkLayer) {
            this.frameworkLayer.setOpacity(alpha / 100);
        }
    },

    getAlpha: function () {
        return this.alpha;
    }

});