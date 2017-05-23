/**
 * change layerindexes for FeatureReport component.
 * @param {Object} config configObject
 */
function FeatureReport__layersArrayIndexesToAppLayerIds(config) {
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
}

/**
 * Change app layer id's to indexes in config.layers array for FeatureReport component.
 * @param {Object} config configObject
 */
function FeatureReport__appLayerIdToLayerIndex(config) {
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
