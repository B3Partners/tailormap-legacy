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

var DOTS_PER_INCH = 72;
var INCHES_PER_UNIT = {
    m: 39.3701
};

Ext.define("viewer.viewercontroller.ol.Utils", {
    createBounds: function (extent) {
        return [Number(extent.minx), Number(extent.miny), Number(extent.maxx), Number(extent.maxy)];
    },
    createExtent: function (bounds) {
        return new viewer.viewercontroller.controller.Extent(bounds[0], bounds[1], bounds[2], bounds[3]);
    },
    getScaleFromResolution: function (resolution, units) {
        if (units === null) {
            units = "degrees";
        }
        var scale = resolution * INCHES_PER_UNIT[units] *
                DOTS_PER_INCH;
        return scale;

    }
});