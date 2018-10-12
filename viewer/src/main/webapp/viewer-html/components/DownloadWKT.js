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

Ext.define("viewer.components.DownloadWKT", {
    extend: "viewer.components.Component",
    vectorLayer: null,
    config: {
        types: null
    },
    /**
     * @constructor
     * creating a DownloadWKT module.
     */
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.DownloadWKT.superclass.constructor.call(this, this.config);
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
        this.iconPath=FlamingoAppLoader.get('contextPath')+"/viewer-html/components/resources/images/drawing/";
    },
    showWindow: function () {
        if (!this.maincontainer) {
            this.createComponents();
        }
        this.popup.show();
    },
    createComponents: function () {

        if (this.vectorLayer === null) {
            this.createVectorLayer();
        }
        var states = Ext.create('Ext.data.Store', {
            fields: ['type', 'label'],
            data: this.config.types
        });

        this.maincontainer = new Ext.form.FormPanel({
            id: this.config.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            padding: 4,
            border: 0,
            renderTo: this.getContentDiv(),
            items: [
                {
                    fieldLabel: i18next.t('viewer_components_downloadwkt_0'),
                    store: states,
                    queryMode: 'local',
                    displayField: 'label',
                    name: "type",
                    valueField: 'type',
                    xtype: "combobox",
                    margin: '0 0 2 0'
                }, {
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_downloadwkt_1'),
                    allowBlank: false,
                    name: 'filename',
                    id: 'filename',
                    margin: '0 0 2 0'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_downloadwkt_2'),
                    allowBlank: false,
                    name: 'mailaddress',
                    id: 'mailaddress',
                    margin: '0 0 2 0'
                },
                {
                    xtype: 'container',
                    layout: "hbox",
                    items: [{
                            xtype: "button",
                            text: i18next.t('viewer_components_downloadwkt_3'),
                            flex:1,
                            id: this.config.name + 'drawPolygon',
                            icon: this.iconPath+"shape_polygon_red.png",
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: function () {
                                        this.vectorLayer.removeAllFeatures();
                                        this.vectorLayer.drawFeature("Polygon");
                                    }
                                }
                            }
                        }, {
                            xtype: 'button',
                            flex:1,
                            id: this.config.name + 'drawBox',
                            text: i18next.t('viewer_components_downloadwkt_4'),
                            icon: this.iconPath+"shape_square_red.png",
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: function () {
                                        this.vectorLayer.removeAllFeatures();
                                        this.vectorLayer.drawFeature("Box");
                                    }
                                }
                            }
                        }, {
                            xtype: 'button',
                            icon: this.iconPath + "delete.png",
                            tooltip: i18next.t('viewer_components_downloadwkt_5'),
                            flex:1,
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: function () {
                                        this.vectorLayer.removeAllFeatures();
                                    }
                                }
                            }
                        }]
                },
                {
                    xtype: "button",
                    text: i18next.t('viewer_components_downloadwkt_6'),
                    id: this.config.name + 'submit',
                    listeners: {
                        click: {
                            scope: this,
                            fn: this.submit
                        }
                    }
                }
            ]
        });
    },
    submit: function () {
        var params = this.maincontainer.getForm().getValues();
        params.application = FlamingoAppLoader.get("appId");
        var features = new Array();
        var fs = this.vectorLayer.getAllFeatures(true);
        for (var featurekey in fs) {
            if (fs.hasOwnProperty(featurekey)) {
                var feature = fs[featurekey];
                features.push(feature.toJsonObject());
            }
        }



        params.wkt = Ext.JSON.encode(features);
        Ext.Ajax.request({
            url: actionBeans.wkt,
            params: params,
            scope: this,
            success: function (result) {
                var response = Ext.JSON.decode(result.responseText);
                if (response.success) {
                    Ext.MessageBox.alert(i18next.t('viewer_components_downloadwkt_7'), i18next.t('viewer_components_downloadwkt_8'));
                } else {
                    this.config.viewerController.logger.error(result);
                    Ext.MessageBox.alert('Fout', response.message);
                }
            },
            failure: function (result) {
                this.config.viewerController.logger.error(result);
                var response = Ext.JSON.decode(result.responseText);
                Ext.MessageBox.alert('Fout', response.message);
            }
        });
    },
    getExtComponents: function () {
        return [this.maincontainer.getId()];
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