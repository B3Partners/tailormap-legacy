/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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


function graph_layersArrayIndexesToAppLayerIds(config) {
    // In config.sliders the selectedLayers property for each slider
    // is an index in the config.layers array which contains the
    // app layer id (updated when app is copied).
    // Change these indexes to the the app layer id's for the
    // selection grid

    var layers = config.layers;
    Ext.Array.each(config.graphs, function(graph) {
        var newSelectedLayer = null;
        var index = graph.layer;
        if(index !== null) {
            newSelectedLayer = layers[index];
        }
        graph.layer = newSelectedLayer;
    });
}

function graph_appLayerIdsToLayersArrayIndexes(config) {
    // Change app layer id's to indexes in config.layers array

    config.layers = [];
    Ext.Array.each(config.graphs, function(graph) {
            var appLayerId = graph.layer;
            var index = Ext.Array.indexOf(config.layers, appLayerId);
            if(index === -1) {
                config.layers.push(appLayerId);
                graph.layer = config.layers.length - 1;
            } else {
                graph.layer= index;
            }
    });
}
