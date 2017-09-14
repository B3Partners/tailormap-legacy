/*
 * Copyright (C) 2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Configuration object utils for FeatureReport configuration.
 *
 * @author Mark Prins
 */
Ext.define("viewer.components.FeatureReportUtil", {
    /**
     * change layerindexes for FeatureReport component.
     * 
     * @param {Object} config configObject
     */
    layersArrayIndexesToAppLayerIds: function (config) {
        if (config.legendLayers) {
            for (var i = 0; i < config.legendLayers.length; i++) {
                var appLayerIdx = config.legendLayers[i];
                config.legendLayers[i] = config.layers[appLayerIdx];
            }
        }
        if (config.reportLayers) {
            for (var i = 0; i < config.reportLayers.length; i++) {
                var appLayerIdx = config.reportLayers[i];
                config.reportLayers[i] = config.layers[appLayerIdx];
            }
        }
    },
    /**
     * Change app layer id's to indexes in config.layers array for FeatureReport component.
     *
     * @param {Object} config configObject
     */
    appLayerIdToLayerIndex: function (config) {
        config.layers = [];
        for (var i = 0; i < config.legendLayers.length; i++) {
            var appLayerId = config.legendLayers[i];
            var index = Ext.Array.indexOf(config.layers, appLayerId);
            if (index === -1) {
                config.layers.push(appLayerId);
                config.legendLayers[i] = config.layers.length - 1;
            } else {
                config.legendLayers[i] = index;
            }
        }

        for (var i = 0; i < config.reportLayers.length; i++) {
            var appLayerId = config.reportLayers[i];
            var index = Ext.Array.indexOf(config.layers, appLayerId);
            if (index === -1) {
                config.layers.push(appLayerId);
                config.reportLayers[i] = config.layers.length - 1;
            } else {
                config.reportLayers[i] = index;
            }
        }
    }
});
