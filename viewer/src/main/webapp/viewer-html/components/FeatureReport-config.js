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
 * Custom configuration object for FeatureReport configuration.
 * 
 * @author Mark Prins
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    mixins: ['viewer.components.FeatureReportUtil'],

    legendCheckBoxes: null,
    legendCheckPanel: null,
    /**
     * @constructor
     * @param {type} parentId
     * @param {type} configObject
     * @param {type} configPage
     * @returns void
     */
    constructor: function (parentId, configObject, configPage) {
        configObject.showLabelconfig = true;
        configObject.title = configObject.title || "FeatureReport";
        configObject.showPrintRtf = false;

        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.form.add([
            {
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_80'),
                name: 'subTitle',
                value: this.configObject.subTitle = this.configObject.subTitle || "",
                labelWidth: this.labelWidth
            }, {
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_81'),
                name: 'clickLabel',
                value: this.configObject.clickLabel = this.configObject.clickLabel || "",
                labelWidth: this.labelWidth
            }, {
                xtype: 'numberfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_82'),
                name: 'numOfRelatedFeatures',
                value: this.configObject.numOfRelatedFeatures = this.configObject.numOfRelatedFeatures || 10,
                minValue: 1,
                maxValue: 100,
                labelWidth: this.labelWidth
            }, {
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_83'),
                name: 'template',
                value: this.configObject.template = this.configObject.template || "FeatureReport.xsl",
                labelWidth: this.labelWidth
            }, {
                xtype: "checkbox",
                name: "overview",
                checked: this.configObject.overview ? this.configObject.overview : false,
                boxLabel: i18next.t('viewer_components_customconfiguration_84')
            }]);

        this.layersArrayIndexesToAppLayerIds(this.configObject);

        this.createCheckBoxes(this.configObject.reportLayers, {
            appId: this.getApplicationId(),
            filterable: true
        });

        this.createCheckBoxesLegend(this.configObject.legendLayers);
    },

    /**
     *Create a layer list with checkboxes.
     *@param checkedIds a array of id's that need to be checked at init.
     *@param requestParams the params that are send with the ajax request.
     */
    createCheckBoxesLegend: function (checkedIds, requestParams) {
        if (requestParams === undefined || requestParams === null) {
            requestParams = {};
        }

        //add the application id that needs to be send with the ajax
        requestParams.appId = this.getApplicationId();

        if (checkedIds === undefined)
            checkedIds = [];
        //create the formpanel
        var me = this;
        this.legendCheckPanel = Ext.create("Ext.form.FormPanel", {
            title: i18next.t('viewer_components_customconfiguration_85'),
            id: "legendLayerListContainer",
            style: {
                marginTop: "10px"
            },
            layout: 'fit',
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            height: me.checkPanelHeight,
            renderTo: this.parentId
        });
        this.legendCheckBoxes = Ext.create("Ext.ux.b3p.FilterableCheckboxes", {
            requestUrl: me.requestPath,
            requestParams: requestParams,
            renderTo: "legendLayerListContainer",
            checked: checkedIds,
            layerFilter: me.configObject.layerFilter
        });
    },

    getConfiguration: function () {
        var config = new Object();
        if (this.legendCheckBoxes !== null) {
            config.legendLayers = this.legendCheckBoxes.getChecked();
        }
        if (this.checkBoxes !== null) {
            config.reportLayers = this.checkBoxes.getChecked();
        }
        Ext.apply(config, this.getValuesFromContainer(this.form));

        this.appLayerIdToLayerIndex(config);
        return config;
    }
});
