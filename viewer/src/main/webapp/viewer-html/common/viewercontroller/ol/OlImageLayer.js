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

/* global Ext, ol */

Ext.define("viewer.viewercontroller.ol.OlImageLayer", {
    extend: "viewer.viewercontroller.controller.ImageLayer",
    mixins: {
        OlLayer: "viewer.viewercontroller.ol.OlLayer"
    },
    constructor: function (config) {
        viewer.viewercontroller.ol.OlImageLayer.superclass.constructor.call(this, config);
        this.mixins.OlLayer.constructor.call(this, config);

        this.utils = Ext.create("viewer.viewercontroller.ol.Utils");

        this.type = viewer.viewercontroller.controller.Layer.IMAGE_TYPE;
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var width = this.config.viewerController.mapComponent.getMap().getWidth();
        var height = this.config.viewerController.mapComponent.getMap().getHeight();

        var source = new ol.source.ImageStatic({
            url: this.url,
            imageSize: [width, height],
            imageExtent: this.extent,
            projection: map.getView().getProjection()
        }
        );
        this.frameworkLayer = new ol.layer.Image({
            source: source,
            visible: this.visible
        });

    },

    setExtent: function (extent) {
        this.extent = extent;
        if (this.frameworkLayer) {
            this.frameworkLayer.extent = this.utils.createBounds(extent);
        }
    },
    
    getLastMapRequest: function () {
        return [{
                url: this.url,
                extent: this.extent
            }];
    },
    /******** overwrite functions to make use of the mixin functions **********/
    /**
     *Get the type of the layer
     */
    getType: function () {
        return this.mixins.OlLayer.getType.call(this);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    setVisible: function (vis) {
        this.mixins.OlLayer.setVisible.call(this, vis);
    },
    /**
     * @see viewer.viewercontroller.openlayers.OpenLayersLayer#setVisible
     */
    getVisible: function () {
        return this.mixins.OlLayer.getVisible.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#setAlpha
     */
    setAlpha: function (alpha) {
        this.mixins.OlLayer.setAlpha.call(this, alpha);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#reload
     */
    reload: function () {
        this.mixins.OlLayer.reload.call(this);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#addListener
     */
    addListener: function (event, handler, scope) {
        this.mixins.OlLayer.addListener.call(this, event, handler, scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#removeListener
     */
    removeListener: function (event, handler, scope) {
        this.mixins.openLayersOlLayer4Layer.removeListener.call(this, event, handler, scope);
    },
    /**
     * @see viewer.viewercontroller.OpenLayers.OpenLayersLayer#destroy
     */
    destroy: function () {
        this.mixins.OlLayer.destroy.call(this);
    }

});

