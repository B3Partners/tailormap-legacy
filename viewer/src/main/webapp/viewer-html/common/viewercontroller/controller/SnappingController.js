/*
 * Copyright (C) 2015 B3Partners B.V.
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
 * @description Controller component for the Snapping control.
 * @author <a href="mailto:markprins@b3partners.nl">Mark Prins</a>
 *
 * @class
 */
Ext.define("viewer.viewercontroller.controller.SnappingController", {
    extend: "viewer.viewercontroller.controller.Component",
    config: {
        mapComponent: null,
        options: null,
        style: null
    },
    frameworkLayer: null,
    frameworkControl: null,
    /**
     * framework native layers to snap to.
     * @private
     */
    snapLayers: [],
    /**
     * name prefix of the built-in snapLayers
     */
    snapLayers_prefix: "snapping_",
    constructor: function (config) {
        viewer.viewercontroller.controller.SnappingController.superclass.constructor.call(this, config);
        config.id = config.name;
        config.type = viewer.viewercontroller.controller.Component.SNAPPING;

        this.initConfig(config);
        return this;
    },
    /**
     * add the snapping target.
     * @param {type} snappingLayer
     */
    addAppLayer: function (appLayer) {
        Ext.Error.raise({msg: "SnappingController.addAppLayer() Not implemented! Must be implemented in sub-class"});
    },
    /**
     * remove all snapping targets.
     */
    removeAll: function () {
        Ext.Error.raise({msg: "SnappingController.removeAll() Not implemented! Must be implemented in sub-class"});
    },
    /**
     * remove the snapping target.
     * @param {type} snappingLayer
     */
    removeLayer: function (appLayer) {
        Ext.Error.raise({msg: "SnappingController.removeLayer() Not implemented! Must be implemented in sub-class"});
    },
    /**
     * activate snapping, if there are snapping targets.
     */
    activate: function () {
        Ext.Error.raise({msg: "SnappingController.activate() Not implemented! Must be implemented in sub-class"});
    }
});