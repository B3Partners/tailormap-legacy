/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

Ext.define('vieweradmin.components.Geoservice', {

    requires: [
        'Ext.tree.*',
        'Ext.data.*'
    ],

    config: {
        layers: [],
        imagesPath: ""
    },

    constructor: function(config) {
        this.initConfig(config);
        this.filterEmptyLayers();
        this.createTree();
    },

    filterEmptyLayers: function() {
        var layers = this.config.layers;
        for(var i = layers.length - 1; i >= 0; i--) {
            var applications = layers[i].children;
            for(var j = applications.length - 1; j >= 0; j--) {
                if(applications[j].children.length === 0) {
                    applications.splice(j, 1);
                }
            }
            if(applications.length === 0) {
                layers.splice(i, 1);
            }
        }
    },

    createTree: function() {
        Ext.define('GeoserviceApplicationModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'itemid', type: 'string'},
                {name: 'type',  type: 'string'},
                {name: 'icon', type: 'string', convert: (function(fieldName, record) {
                    var nodeType = record.get('type');
                    if(nodeType == "application") return this.config.imagesPath + "application.png";
                    if(nodeType == "level") return this.config.imagesPath + "folder.png";
                    if(nodeType == "layer") return this.config.imagesPath + "map.png";
                }).bind(this)}
            ]
        });
        var orderStore = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: this.config.layers
            },
            model: GeoserviceApplicationModel
        });
        Ext.create('Ext.tree.Panel', {
            store: orderStore,
            rootVisible: false,
            selModel: { mode: "SINGLE" },
            useArrows: true,
            frame: true,
            width: 600,
            height: 200,
            autoScroll: true,
            margin: 0,
            border: 0,
            renderTo: document.querySelector(".geoservice-tree-container")
        });
    }

});