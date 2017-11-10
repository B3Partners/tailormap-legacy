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
        label: '',
        labelOutlineColor: '',
        labelOutlineWidth: '',
        labelAlign: '',
        fontSize: '',
        fontColor: '',
        rotation: 0,
        labelXOffset: 0,
        labelYOffset: 0,
        fillColor: '',
        fillOpacity: 0,
        strokeColor: '',
        strokeOpacity: 0,
        strokeDashstyle: '',
        strokeWidth: 0,
        graphicName: '',
        pointRadius: 0
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
            if(this.config[prop] !== '' && this.config[prop] !== 0) {
                props[prop] = this.config[prop];
            }
        }
        return props;
    },

    set: function(prop, value) {
        this.config[prop] = value;
    }

});