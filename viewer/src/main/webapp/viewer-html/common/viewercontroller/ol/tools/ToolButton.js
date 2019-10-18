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

Ext.define("viewer.viewercontroller.ol.tools.ToolButton", {

    constructor: function (conf) {
        this.initConfig(conf);
        this.conf = conf;
        var frameworkOptions = {};
        frameworkOptions.type = conf.type;
        conf.id = "loc";
        conf.onlyClick = true;

        if (conf.displayClass) {
            frameworkOptions.displayClass = conf.displayClass;
        } else {
            frameworkOptions.displayClass = "olButton_" + conf.id;
        }
        this.mapComponent = conf.viewerController.mapComponent;
        this.frameworkObject = new ol.control.Control(frameworkOptions);
    },

    activate: function (tool) {
        tool.fire(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN);
    },

    deactivate: function () {
        //only click can't be deactivated
    },

    isActive: function () {
        return false;
    }

});