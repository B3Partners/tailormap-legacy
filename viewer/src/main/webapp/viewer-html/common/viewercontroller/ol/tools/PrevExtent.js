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

Ext.define("viewer.viewercontroller.ol.tools.PrevExtent", {

    constructor: function (conf) {
        this.initConfig(conf);
    },

    activate: function () {
        var index = this.viewerController.mapComponent.historyExtents.index;
        this.viewerController.mapComponent.historyExtents.update = false;
        var extent = this.viewerController.mapComponent.historyExtents.extents[index];
        this.viewerController.mapComponent.getMap().zoomToExtent(extent);
        if (index !== 0) {
            this.viewerController.mapComponent.historyExtents.index = index - 1;
        }
    },

    deactivate: function () {

    }
});