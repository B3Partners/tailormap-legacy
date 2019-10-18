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

Ext.define("viewer.viewercontroller.ol.OlArcServerLayer", {
    extend: "viewer.viewercontroller.ol.OlArcLayer",
    constructor: function (config) {

        //todo check if this is the right way for arclayer 
        Ext.Error.raise({msg: "OlArcServerLayer not supported yet in OL5"});
        
        viewer.viewercontroller.ol.OlArcServerLayer.superclass.constructor.call(this, config);
        var source = new ol.source.TileArcGISRest({
            projection: config.viewerController.mapComponent.mapOptions.projection,
            params: {
                LAYERS: "show:" + config.layers,
                TRANSPARENT: true
            },
            url: config.url + "/export",
            ratio: config.ratio
        });
        this.frameworkLayer = new ol.layer.Tile({
            source: source,
            visible: config.visible,
            opacity: this.config.opacity !== undefined ? this.config.opacity : 1

        });

        this.type = viewer.viewercontroller.controller.Layer.ARCSERVERREST_TYPE;
    },

    getLastMapRequest: function () {
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var r = this.getFrameworkLayer().getSource().getTileUrlFunction();
        var crd = [];
        crd[0] = map.getView().getZoom();
        crd[1] = map.getView().getCenter()[0];
        crd[2] = map.getView().getCenter()[1];
        var request = [{
                url: r(crd, 1, map.getView().getProjection())
            }];
        return request;
    },

    setQuery: function (filter) {
        var me = this;
        var cql = filter !== null ? filter.getCQL() : "";
        if (cql !== "") {
            var f = function (ids, colName) {
                // Hack: An empty query returns all the features
                var query = "-1";
                if (ids.length !== 0) {
                    query = colName + " IN(" + ids.join(",") + ")";
                }
                me.getFrameworkLayer().setLayerFilter(me.layers, query);
                //me.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setDefinitionQuery", query,me.config.options.name);
                setTimeout(function () {
                    me.reload();
                }, 500);
            };
            var util = Ext.create("viewer.ArcQueryUtil");
            util.cqlToArcFIDS(cql, this.appLayerId, f, function (msg) {
                me.getViewerController().logger.error(msg);
            });
        } else {
            me.getFrameworkLayer().setLayerFilter(me.layers, null);
            setTimeout(function () {
                me.reload();
            }, 500);
        }
    }


});