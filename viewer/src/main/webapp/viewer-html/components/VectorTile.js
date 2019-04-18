/* 
 * Copyright (C) 2018 B3Partners B.V.
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

/* global Ext, actionBeans, FlamingoAppLoader */

Ext.define("viewer.components.VectorTile", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    style:null,
    layer:null,
    config: {
        types: null
    },
    /**
     * @constructor
     * creating a DownloadWKT module.
     */
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.VectorTile.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function () {
                me.showWindow();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });
        this.iconPath = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/drawing/";

        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.createVectorTile, this);
    },
    showWindow: function () {
        if (!this.form) {
            this.form = new Ext.form.FormPanel({
                frame: false,
                border: 0,
               
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                padding: '5px',
                items: [{
                        xtype: "textarea",
                        name: "style",
                        id: "style",
                        height: 400,
                        value: this.config.style
                    },
                    {
                        xtype: "button",
                        text: "verander",
                        listeners:{
                            scope:this,
                            click: this.changeStyle
                        }
                    }],
                renderTo: this.getContentDiv()
            });
        }
        this.popup.show();
    },
    changeStyle: function(){
        var s = Ext.getCmp("style").getValue();
        this.style = eval(s);
        this.layer.setStyle(this.style);
    },
    createVectorTile: function () {
        if (this.vectorLayer === null) {
            this.createVectorLayer();
        }

        proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs ");

        ol.proj.proj4.register(proj4);
        var projection = ol.proj.get('EPSG:28992');

        var resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21, 0.105];
        var extentAr = [-285401.0, 22598.0, 595401.0, 903401.0];
        var maxExtent = [7700, 304000, 280000, 6200000];
        projection.setExtent(extentAr);
        var map = this.config.viewerController.mapComponent.getMap().frameworkMap;
        this.style = eval(this.config.style);
        this.layer = 
            new ol.layer.VectorTile({
                declutter: true,
                source: new ol.source.VectorTile({
                    format: new ol.format.MVT(),
                    tileGrid: new ol.tilegrid.TileGrid({
                        extent: extentAr, // projection.getExtent(),
                        resolutions: resolutions,
                        tileSize: 256
                    }),
                    projection: projection,
                    url: this.config.url

                }),
                style: this.style
            });
        map.addLayer(this.layer);
    },
    getExtComponents: function () {
        return [this.form.getId()];
    },
    createVectorLayer: function () {
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: this.config.name + 'VectorLayer',
            geometrytypes: ["Polygon"],
            showmeasures: true,
            allowselection: false,
            viewerController: this.config.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 60,
                strokecolor: "FF0000",
                strokeopacity: 65
            }
        });
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
    }

});