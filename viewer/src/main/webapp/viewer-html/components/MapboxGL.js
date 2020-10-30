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
/**
 * MapboxGL component.
 * @author markprins@b3partners.nl
 */
Ext.define("viewer.components.MapboxGL", {
    extend: "viewer.components.Component",
    config: {
        name: i18next.t('viewer_components_mapbox3d_name'),
        tooltip: i18next.t('viewer_components_mapbox3d_tooltip'),
        title: i18next.t('viewer_components_mapbox3d_title'),
        iconUrl: '',
        style: '',
        accessToken: '',
        pitch: 45,
        zoom: 16,
        bearing: 0,
        extrusionSource: '',
        extrusionSourceLayer: '',
        fullscreenBtn: true
    },
    _window: null,
    _mapGl: null,
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.MapboxGL.superclass.constructor.call(this, conf);

        this.renderButton();

        this.mapProj = new Proj4js.Proj(this.viewerController.projection);
        this.geolocationProj = new Proj4js.Proj("EPSG:4326");

        mapboxgl.accessToken = this.config.accessToken;

        return this;
    },

    renderButton: function () {
        var me = this;
        this.superclass.renderButton.call(this, {
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label,
            handler: function () {
                me.openWindow();
            }
        });
    },
    openWindow: function () {
        var me = this;
        if (me._window) {
            me._window.destroy();
        }
        if (me._mapGl) {
            me._mapGl.remove();
        }

        // get current map center + zoomlevel
        // Note: no scale in mapbox api
        var lonlat = this.config.viewerController.mapComponent.getMap().getCenter();
        var ress = this.config.viewerController.mapComponent.getMap().getResolutions();
        var zoomLevel = ress.indexOf(this.config.viewerController.mapComponent.getMap().getResolution());
        // correct for zoomlevel offset between Mapbox and other services
        // XXX magic number 4
        zoomLevel = zoomLevel + 4;
        if (zoomLevel < 0) {
            zoomLevel = me.config.zoom;
        }

        // default utrecht
        var lat = 52.119069;
        var lon = 5.042663;
        if (me.mapProj.srsCode === "EPSG:4326") {
            // if EPSG:4326 use as is
            lat = lonlat.lat;
            lon = lonlat.lon;
        } else if (me.mapProj.srsCode === "EPSG:28992") {
            // if EPSG:28992 transform to wgs84
            var _point = new Proj4js.Point(lonlat.x, lonlat.y);
            Proj4js.transform(me.mapProj, me.geolocationProj, _point);
            lat = _point.y;
            lon = _point.x;
        }

        me._window = Ext.create('Ext.window.Window', {
            title: i18next.t('viewer_components_mapbox3d_title'),
            width: me.config.width,
            height: me.config.height,
            resizable: true,
            x: 3,
            y: 3,
            modal: true,
            layout: 'fit',
            html: '<div id="mapboxgl" style="width:100%;height:100%;"></div>' +
                '<a id="mapboxDownloadLink" download="mapbox.png" href="#">' +
                i18next.t('viewer_components_mapbox3d_download') +
                '</a>'
        }).show();

        // handle window resize
        me._window.on({'resize': me._onResize, me});

        // add click handler for download link
        document.getElementById('mapboxDownloadLink').onclick = function () {
            this.href = me._mapGl.getCanvas().toDataURL('image/png');
        };

        me._mapGl = new mapboxgl.Map({
            style: me.config.style,
            center: [lon, lat],
            zoom: zoomLevel,
            pitch: me.config.pitch,
            bearing: me.config.bearing,
            preserveDrawingBuffer: true,
            container: 'mapboxgl',
            transformRequest: (url, resourceType) => {
                // resourceType:
                //     tile json = Source
                //     pbf = Tile
                if (/*resourceType === 'Source' && */url.indexOf('omgevingsserver.nl/') > -1) {
                    return {
                        url: url,
                        headers: {'Authorization': 'Bearer ' + me.config.apiKey},
                        // Include cookies for cross-origin requests
                        // credentials: 'include'
                    }
                }
            }
        });
        me._mapGl.addControl(new mapboxgl.NavigationControl({visualizePitch: true}), 'top-left');
        me._mapGl.addControl(new mapboxgl.ScaleControl());
        if (me.config.fullscreenBtn) {
            me._mapGl.addControl(new mapboxgl.FullscreenControl());
        }

        me._mapGl.on('load', function () {
            // Insert the layer beneath any symbol layer.
            var layers = me._mapGl.getStyle().layers;
            var labelLayerId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            if (me.config.extrusionSource.indexOf('omgevingsserver.nl/') > -1) {
                me._addOmgevingsServerLayer({
                    id: me.config.name + me.config.extrusionSourceLayer,
                    source: me.config.extrusionSource,
                    'source-layer': me.config.extrusionSourceLayer,
                }, labelLayerId);
            } else {
                me._addMapboxLayer({
                    id: me.config.name + me.config.extrusionSourceLayer,
                    source: me.config.extrusionSource,
                    'source-layer': me.config.extrusionSourceLayer,
                }, labelLayerId);
            }

        });
    },
    /**
     * Add an omgevingsserver vector layer to the Mapbox map.
     * @param {Object} mbLyrOpts
     * @param {String} beforeId
     * @private
     *
     * @see #_addMapboxLayer
     */
    _addOmgevingsServerLayer(mbLyrOpts, beforeId) {
        this._mapGl.addLayer({
                id: mbLyrOpts['id'],
                source: {
                    type: "vector",
                    // "https://b3partners.omgevingsserver.nl/vector-tiles/data/panden-map.json"
                    url: mbLyrOpts['source']
                },
                // pand
                'source-layer': mbLyrOpts['source-layer'],
                'type': 'fill-extrusion',
                paint: {
                    'fill-extrusion-color': '#6f5117',
                    'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'hoogte']],
                    'fill-extrusion-opacity': 1
                }
            },
            beforeId
        );
    },
    /**
     * Add a Mapbox style layer to the Mapbox map.
     * @param {Object} mbLyrOpts
     * @param {String} beforeId
     * @private
     *
     * @see https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/
     */
    _addMapboxLayer(mbLyrOpts, beforeId) {
        if (this._mapGl) {
            this._mapGl.addLayer({
                    'id': mbLyrOpts['id'],
                    // composite'
                    'source': mbLyrOpts['source'],
                    // building
                    'source-layer': mbLyrOpts['source-layer'],
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#81ff6b',
                        // use an 'interpolate' expression to add a smooth transition effect to the buildings as the user zooms in
                        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
                        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                beforeId
            );
        }
    },
    /**
     * rezize event handler.
     *
     * @param win This window
     * @param {Number} newH New height
     * @param {Number} newW New width
     * @param {Number} oldH Old height
     * @param {Number} oldW Old width
     * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
     * @private
     */
    _onResize: function (win, newH, newW, oldH, oldW, eOpts) {
        // resize mapbox canvas
        eOpts.me._mapGl.resize();
    }
});