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
 * FeatureReport component.
 * @author Mark Prins
 */
Ext.define("viewer.components.FeatureReport", {
    extend: "viewer.components.Print",
    config: {
        title: "FeatureReport",
        legendLayers: null,
        reportLayers: null,
        template: "FeatureReport.xsl",
        subTitle: ""
    },
    legendLayerList: null,
    activatedLayerList: null,
    subTitle: null,
    mixins: ['viewer.components.FeatureReportUtil'],

    /**
     * @constructor
     */
    constructor: function (conf) {
        viewer.components.FeatureReport.superclass.constructor.call(this, conf);

        this.layersArrayIndexesToAppLayerIds(this.config);

        var me = this;
        var requestParams = {};
        requestParams[this.config.restriction] = true;
        requestParams["appId"] = FlamingoAppLoader.get('appId');
        requestParams["layers"] = me.config.legendLayers;
        requestParams["hasConfiguredLayers"] = true;
        Ext.Ajax.request({
            url: actionBeans["layerlist"],
            params: requestParams,
            success: function (result, request) {
                me.legendLayerList = Ext.JSON.decode(result.responseText);
                console.debug('legendLayerList', me.legendLayerList);
            },
            failure: function (a, b, c) {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden opgehaald");
            }
        });


        requestParams["layers"] = me.config.reportLayers;
        Ext.Ajax.request({
            url: actionBeans["layerlist"],
            params: requestParams,
            success: function (result, request) {
                me.activatedLayerList = Ext.JSON.decode(result.responseText);
                console.debug('activatedLayerList', me.activatedLayerList);

                // register with featureinfo components
                var infoComponents = me.viewerController.getComponentsByClassName("viewer.components.FeatureInfo");
                for (var i = 0; i < infoComponents.length; i++) {
                    infoComponents[i].registerExtraLink(
                            me,
                            function (feature, appLayer) {
                                me.handleAction(feature, appLayer);
                            },
                            me.config.title,
                            me.activatedLayerList
                            );
                }
            },
            failure: function (a, b, c) {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden opgehaald");
            }
        });

        me.createForm();
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO, this.onFeatureInfoStart, this);
        return this;
    },
    /**
     * track the click location.
     * @param {type} a ignored
     * @param {type} click
     */
    onFeatureInfoStart: function (a, click) {
        this.featureInfoClick = click;
    },
    /**
     *
     * @returns {Array} of legend urls to send to the backend
     */
    getLegendsToPrint: function () {
        var legendsToPrint = [];
        var me = this;
        for (var l = 0; l < me.legendLayerList.length; l++) {
            this.config.viewerController.getLayerLegendInfo(
                    me.legendLayerList[l],
                    function (a, b) {
                        legendsToPrint.push(b);
                    }),
                    function () {
                        Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden");
                    };
        }
        return legendsToPrint;
    },

    /**
     * @override
     * @param {type} action
     * @returns {IbisFactsheetAnonym$0.getAllProperties.properties}
     */
    getAllProperties: function (action) {
        var properties = {
            action: action,
            title: this.config.title,
            subtitle: this.subTitle,
            mailTo: "",
            remark: "",
            xsltemplate: this.config.template,
            includeLegend: true,
            legendUrl: this.getLegendsToPrint(),
            quality: this.getMapQuality(),
            appId: appId
        };
        // Process registered extra info callbacks
        //        var extraInfos = [];
        //        for (var i = 0; i < this.extraInfoCallbacks.length; i++) {
        //            var entry = this.extraInfoCallbacks[i];
        //            var extraInfo = {
        //                className: Ext.getClass(entry.component).getName() + '.' + entry.callback.$name,
        //                componentName: entry.component.name,
        //                info: entry.callback(this.factsheetFeature)
        //            };
        //            extraInfos.push(extraInfo);
        //        }
        properties.extra = [];

        if (this.shouldAddOverview()) {
            var overviews = this.getOverviews();
            if (overviews.length > 0) {
                var overview = overviews[0];
                var url = overview.config.url;
                properties.overview = new Object();
                properties.overview.overviewUrl = url;
                properties.overview.extent = overview.config.lox + "," + overview.config.loy + "," + overview.config.rbx + "," + overview.config.rby;
                properties.overview.protocol = url.toLowerCase().indexOf("getmap") > 0 ? 'WMS' : 'IMAGE';
            }
        }

        return properties;
    },

    /**
     * Create the print form.
     * @override
     */
    createForm: function () {
        this.printForm = Ext.create('Ext.form.Panel', {
            url: actionBeans["featureReport"],
            visible: false,
            standardSubmit: true,
            items: [{
                    xtype: "hidden",
                    name: "printparams",
                    id: this.name + 'formParams'
                }, {
                    xtype: "hidden",
                    name: "appLayer",
                    id: this.name + 'formappLayer'
                }, {
                    xtype: "hidden",
                    name: "fid",
                    id: this.name + 'formFid'
                }
            ]
        });
    },
    /**
     * Called from the featureinfo popup that we registered with.
     *
     * @param {type} feature selected feature
     * @param {type} appLayer
     * @returns void
     */
    handleAction: function (feature, appLayer) {
        Ext.getCmp(this.name + 'formappLayer').setValue(appLayer.id);
        Ext.getCmp(this.name + 'formFid').setValue(feature.__fid);

        // use the summary title of the featureinfo
        if (appLayer.details['summary.title']) {
            for (var key in feature) {
                if (!feature.hasOwnProperty(key)) {
                    continue;
                }
                var regex = new RegExp("\\[" + key + "\\]", "g");
                var value = String(feature[key]);
                value = appLayer.details['summary.title'].replace(regex, value);
            }
            this.subTitle = this.config.subTitle + ' ' + value;
        } else {
            this.subTitle = this.config.subTitle + ' feature id:' + feature.__fid;
        }

        var mapvalues = this.getMapValues();
        var properties = this.getAllProperties("savePDF");

        mapvalues.geometries.push({
            _wktgeom: 'POINT(' + this.featureInfoClick.coord.x + ' ' + this.featureInfoClick.coord.y + ')',
            color: 'FF00FF',
            label: 'klik lokatie',
            strokeWidth: 2
        });

        Ext.merge(mapvalues, properties);
        this.submitSettings(mapvalues);
    },

    /**
     * Called when the PDF request can be submitted.
     *
     * @param {Object} mapvalues an object containg data for the form to be posted to the printservice
     * @override
     */
    submitSettings: function (mapvalues) {
        Ext.getCmp(this.name + 'formParams').setValue(Ext.JSON.encode(mapvalues));
        console.debug("submitting form values: ", this.printForm.getValues());
        this.printForm.submit({
            // target: '_self'
            target: '_blank'
        });
    }
});
