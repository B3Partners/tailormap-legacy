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

Ext.define("viewer.viewercontroller.ol.OlTool", {
    extend: "viewer.viewercontroller.controller.Tool",
    controls: null,
    enabledEvents: null,
    constructor: function (conf, tool) {
        viewer.viewercontroller.ol.OlTool.superclass.constructor.call(this, conf);
        this.olTool = tool;
        if (tool.frameworkObject) {
            this.frameworkObject = tool.frameworkObject;
        }
        this.controls = new Array();
        this.enabledEvents = new Object();
        this.setTool(conf);
        conf.active = true;
        this.overwriteStyle(conf);
        return this;
    },

    setTool: function (conf) {
        var me = this;
        me.conf = conf;
        this.panelTool = document.createElement('div');
        this.panelTool.className = "svg-tool " + conf.displayClass + 'ItemInactive';
        this.panelTool.title = (conf.tooltip) ? conf.tooltip : "";
        this.panelTool.id = conf.id;
        var appSprite = this.viewerController.getApplicationSprite();
        if (conf.displayClass) {
            var spriteLink = appSprite + "#icon-" + conf.displayClass.toLowerCase();
        }
        this.panelTool.innerHTML = [
            '<div class="svg-click-area"></div>', // An extra transparent DIV is added to fix issue where button could not be clicked in IE
            '<svg role="img" title=""><use xlink:href="' + spriteLink + '"/></svg>'
        ].join('');
        this.panelTool.addEventListener("click", function () {
            me.activateTool();
        }, me);
    },

    activateTool: function () {
        this.conf.viewerController.mapComponent.activateTool(this);
    },

    overwriteStyle: function (conf) {
        if (conf.active) {
            this.panelTool.className = "svg-tool " + conf.displayClass + 'ItemActive svg-tool-active';
        } else {
            this.panelTool.className = "svg-tool " + conf.displayClass + 'ItemInactive';
        }
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
            if (this.enabledEvents[olSpecificEvent]) {
                this.enabledEvents[olSpecificEvent]++;
            } else {
                this.enabledEvents[olSpecificEvent] = 1;
                this.frameworkObject.on(olSpecificEvent, this, this.handleEvent);
            }

        }
        viewer.viewercontroller.ol.OlTool.superclass.addListener.call(this, event, handler, scope);
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
                    this.frameworkObject.un(olSpecificEvent, this, this.handleEvent);
                }
            }
        }
        viewer.viewercontroller.ol.OlTool.superclass.removeListener.call(this, event, handler, scope);
    },

    activate: function () {
        this.olTool.activate(this);
        if (!this.conf.onlyClick) {
            this.conf.active = true;
            this.overwriteStyle(this.conf);
        }
    },

    deactivate: function () {
        this.olTool.deactivate(this);
        if (!this.conf.onlyClick) {
            this.conf.active = false;
            this.overwriteStyle(this.conf);
        }
    },

    isActive: function () {
        return this.olTool.isActive();
    },
    handleEvent: function (event) {
        var eventName = this.config.viewerController.mapComponent.getGenericEventName(event.type);
        if (!eventName) {
            eventName = event;
        }
        this.fire(eventName, {});
    }
});