/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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
/**
 * @class
 * @description The generic class for defining the feature style
 */
Ext.define("viewer.viewercontroller.controller.FeatureStyle", {

    config: {
        label: null,
        labelOutlineColor: null,
        labelOutlineWidth: null,
        labelAlign: null,
        fontSize: null,
        fontColor: null,
        rotation: null,
        labelXOffset: null,
        labelYOffset: null,
        fillColor: null,
        fillOpacity: null,
        strokeColor: null,
        strokeOpacity: null,
        strokeDashstyle: null,
        strokeWidth: null,
        graphicName: null,
        pointRadius: null
    },

    /**
     * @param {Object} config
     * @constructor
     */
    constructor: function (config){
        this.initConfig(config);
    },

    /**
     * Gets all properties which have a non-default value
     * @returns {{}}
     */
    getProperties: function() {
        var props = {};
        for(var prop in this.config) if(this.config.hasOwnProperty(prop)) {
            if(this.config[prop] !== null) {
                props[prop] = this.config[prop];
            }
        }
        return props;
    },

    set: function(prop, value) {
        this.config[prop] = value;
    }

});