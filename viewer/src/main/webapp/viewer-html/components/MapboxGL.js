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
        extrusionLayerId: '',
        extrusionLayerSource: '',
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
            //icon: me.config.titlebarIcon !== undefined ? me.config.titlebarIcon : 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIiA+PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLW1pdGVybGltaXQ6MS40MTQyMTsiPiAgICA8cGF0aCBkPSJNMjksMTEuMjE3bC0xMywtNi4yMTdsLTEzLDYuMjE3bDEzLDYuMjE3bDEzLC02LjIxN1pNMTYsNy4wNjNsOC42ODUsNC4xNTRsLTguNjg1LDQuMTUzYy0yLjg5NSwtMS4zODQgLTUuNzksLTIuNzY5IC04LjY4NSwtNC4xNTNsOC42ODUsLTQuMTU0Wk0yNi4zOTYsMTQuNjM1bDIuNjA0LDEuMjQ0bC0xMyw2LjIxN2wtMTMsLTYuMjE3bDIuNjA0LC0xLjI0NGwxMC4zOTYsNC45NzFsMTAuMzk2LC00Ljk3MVpNMjYuMzk2LDE5LjI5N2wyLjYwNCwxLjI0NWwtMTMsNi4yMTdsLTEzLC02LjIxN2wyLjYwNCwtMS4yNDVsMTAuMzk2LDQuOTcybDEwLjM5NiwtNC45NzJaIiBzdHlsZT0iZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlLW9wYWNpdHk6MDtmaWxsOiNmZmE1MDA7ZmlsbC1vcGFjaXR5OjEiIGlkPSJwYXRoMiIgLz4gICAgPHBhdGggZD0iTTE4LDIwLjMwNWwzLjMwNSwwbDAsLTMuMzA1bDMuMzksMGwwLDMuMzA1bDMuMzA1LDBsMCwzLjM5bC0zLjMwNSwwbDAsMy4zMDVsLTMuMzksMGwwLC0zLjMwNWwtMy4zMDUsMGwwLC0zLjM5bDAsMFoiIHN0eWxlPSJmaWxsOmN1cnJlbnRDb2xvcjtmaWxsLXJ1bGU6bm9uemVybztzdHJva2Utd2lkdGg6MXB4OyIgaWQ9InBhdGg0IiAvPiAgICA8cGF0aCBzdHlsZT0iZmlsbDojZmZhNTAwO3N0cm9rZS13aWR0aDowLjEzNTU5MzIyO2ZpbGwtb3BhY2l0eTowLjIiIGQ9Ik0gMTEuODAwMTc0LDEzLjMxNTM3NSBDIDkuNTEyNjQyNCwxMi4yMTkwMzggNy42MDkwNTY4LDExLjI4OTYzNSA3LjU2OTk4MzYsMTEuMjUwMDM2IDcuNDk0ODY4NiwxMS4xNzM5MSAxNS43NzQ0MzMsNy4xODY0NDA3IDE2LjAwNzYxNiw3LjE4NjQ0MDcgYyAwLjA3NDg5LDAgMi4wMzA2MzUsMC45MDY3NjQ3IDQuMzQ2MDk1LDIuMDE1MDMyOCBsIDQuMjA5OTI3LDIuMDE1MDMyNSAtNC4yMTMwNzcsMi4wMTg4NjYgYyAtMi4zMTcxOTIsMS4xMTAzNzYgLTQuMjUzMTYzLDIuMDMxMTIzIC00LjMwMjE1OCwyLjA0NjEwNSAtMC4wNDg5OSwwLjAxNDk4IC0xLjk2MDY5OCwtMC44Njk3NjQgLTQuMjQ4MjI5LC0xLjk2NjEwMiB6IiBpZD0icGF0aDQ1MjgiIC8+PC9zdmc+',
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

        var width = parseInt(this.config.width);
        var height = parseInt(this.config.height);
        // var extrusionLayerSource = this.config.extrusionLayerSource;
        // var extrusionLayerId = this.config.extrusionLayerId;

        // get current map center + zoomlevel
        // note nos scale in mapbox api
        var lonlat = this.config.viewerController.mapComponent.getMap().getCenter();
        var ress = this.config.viewerController.mapComponent.getMap().getResolutions();
        var zoomLevel = ress.indexOf(this.config.viewerController.mapComponent.getMap().getResolution());
        // correct for zoomlevel offset between Mapbox and other service
        // XXX magic number
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
            var point = new Proj4js.Point(lonlat.x, lonlat.y);
            Proj4js.transform(me.mapProj, me.geolocationProj, point);
            lat = point.y;
            lon = point.x;
        }

        me._window = Ext.create('Ext.window.Window', {
            title: i18next.t('viewer_components_mapbox3d_title'),
            width: width,
            height: height,
            resizable: true,
            x: 3,
            y: 3,
            modal: true,
            layout: 'fit',
            html: '<div id="mapboxgl" style="width:100%;height:100%;"></div>' +
                '<a id="downloadLink" download="mapbox.png" href="#" style="position:relative;top:-15px;left:150px;background-color: hsla(0,0%,100%,.75);color:#000;font-weight:bolder;">' +
                i18next.t('viewer_components_mapbox3d_download') +
                '</a>'
        }).show();

        // handle window resize
        me._window.on({'resize': me._onResize, me});

        // add click handler for download link
        document.getElementById('downloadLink').onclick = function () {
            this.href = me._mapGl.getCanvas().toDataURL('image/png');
        };

        me._mapGl = new mapboxgl.Map({
            style: me.config.style,
            center: [lon, lat],
            zoom: zoomLevel,
            pitch: me.config.pitch,
            bearing: me.config.bearing,
            preserveDrawingBuffer: true,
            container: 'mapboxgl'
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

            me._mapGl.addLayer({
                    'id': me.config.extrusionLayerId,
                    'source-layer': me.config.extrusionLayerSource,
                    'source': 'composite',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        // use an 'interpolate' expression to add a smooth transition effect to the
                        // buildings as the user zooms in
                        'fill-extrusion-height': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            15,
                            0,
                            15.05,
                            ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                },
                labelLayerId
            );
        });
    },
    _onResize: function (win, newH, newW, oldH, oldW, eOpts) {
        // resize mapbox canvas
        eOpts.me._mapGl.resize();
    }
});