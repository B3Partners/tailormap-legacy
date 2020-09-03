/* 
 * Copyright (C) 2020 B3Partners B.V.
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
/* global Ext, i18next */

/**
 * GBI component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.AngularBridge", {
    extend: "viewer.components.Component",
    div: null,
    config: {},
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.AngularBridge.superclass.constructor.call(this, this.config);
        var me = this;

        this.initializeForm();
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,
            this.layerVisibilityChanged, this);
        return this;
    },

    initializeForm: function () {
        this.div = document.createElement("tailormap-mapbridge");
        this.div.addEventListener('moveMap', function (evt) {
            console.log("moveMap", evt);
            this.config.viewerController.mapComponent.getMap().zoomToExtent(evt.detail);
        }.bind(this));

        document.body.appendChild(this.div);
    },
    layerVisibilityChanged: function (map, event) {
        if (event.layer instanceof viewer.viewercontroller.controller.WMSLayer) {
            var appLayer = this.config.viewerController.getAppLayerById(event.layer.appLayerId);
            this.processLayerVisible(appLayer, event.visible);
        }
    },
    processLayerVisible: function (appLayer, visible) {
        var layerName = appLayer.layerName;
        if (layerName.indexOf(":") !== -1) {
            layerName = layerName.substring(layerName.indexOf(':') + 1);
        }
        var evt = {
            layername: layerName,
            visible: visible
        };
        this.div.setAttribute("layer-visibility-changed", JSON.stringify(evt));
    }

});
