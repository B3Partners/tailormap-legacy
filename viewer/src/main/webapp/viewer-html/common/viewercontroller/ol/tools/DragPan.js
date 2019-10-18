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



/* global ol, Ext */

Ext.define("viewer.viewercontroller.ol.tools.DragPan", {

    constructor: function (conf) {
        this.initConfig(conf);
        this.conf = conf;
        conf.id = "ol-DragPan";
        conf.displayClass = "olControlDragPan";
        conf.onlyClick = false;
        conf.actives = false;
        this.mapComponent = conf.viewerController.mapComponent;
        this.kinec = undefined;

        if (conf.enableKinetic) {
            this.kinec = new ol.Kinetic(-0.01, 0.1, 200);
        }

        this.frameworkObject = new ol.interaction.DragPan({
            kinetic: this.kinec
        });
        this.initTool();
    },

    activate: function () {
        this.conf.actives = true;
        this.frameworkObject.setActive(true);
    },

    deactivate: function () {
        this.conf.actives = false;
        this.frameworkObject.setActive(false);
    },

    initTool: function () {
        this.deactivate();
    },

    isActive: function () {
        return this.frameworkObject.getActive();
    }

});