/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
 * Custom configuration object for NgAttributeList configuration
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        configObject.willLoadLayers = true;

        this.form.add({
            xtype: 'numberfield',
            //fieldLabel: i18next.t('attributelist_config_maxFeatures'),
            fieldLabel: "Maximum aantal te tonen rijen",
            value: this.configObject.pageSize || 100,
            name: 'pageSize',
            labelWidth: this.labelWidth,
        });

        // this.form.add({
        //     xtype: 'combobox',
        //     //store: [[ "CSV", i18next.t('attributelist_config_0') ], [ "Json", i18next.t('attributelist_config_3') ]],
        //     store: [[ "CSV", "CSV" ], [ "Json", "GeoJson" ]],
        //     itemId: 'defaultDownload',
        //     name: 'defaultDownload',
        //     labelWidth: this.labelWidth,
        //     fieldLabel: i18next.t('attributelist_config_3'),
        //     value: this.configObject.defaultDownload || "CSV"
        // });
        // this.form.add({
        //     xtype: 'numberfield',
        //     fieldLabel: i18next.t('attributelist_config_maxFeatures'),
        //     value: this.configObject.maxFeatures || 1000,
        //     name: 'maxFeatures',
        //     labelWidth: this.labelWidth,
        // });
        // this.form.add({
        //     xtype: 'checkbox',
        //     fieldLabel: i18next.t('attributelist_config_4'),
        //     inputValue: true,
        //     name: 'autoDownload',
        //     checked: this.configObject.autoDownload || false,
        //     labelWidth: this.labelWidth
        // });
        //
        // this.form.add({
        //     xtype: 'textfield',
        //     fieldLabel: i18next.t('attributelist_config_5'),
        //     name: 'downloadParams',
        //     value: this.configObject.downloadParams,
        //     labelWidth: this.labelWidth,
        //     width: 700
        // });
        //
        // this.form.add({
        //     xtype: 'container',
        //     html: i18next.t('attributelist_config_6')
        // });
        //
        // // this.form.add({
        // //     xtype: 'checkbox',
        // //     fieldLabel: i18next.t('attributelist_config_7'),
        // //     inputValue: true,
        // //     name: 'addZoomTo',
        // //     checked: this.configObject.addZoomTo || false,
        // //     labelWidth: this.labelWidth
        // // });
        //
        // this.form.add({
        //     xtype: 'numberfield',
        //     fieldLabel: i18next.t('attributelist_config_8'),
        //     name: 'zoomToBuffer',
        //     value: this.configObject.zoomToBuffer || 10,
        //     minValue: 0,
        //     step: 10,
        //     labelWidth: this.labelWidth
        // });
        //
        // this.form.add({
        //     xtype: 'numberfield',
        //     fieldLabel: i18next.t('attributelist_config_9'),
        //     name: 'requestThreshold',
        //     value: this.configObject.requestThreshold || 2000,
        //     minValue: 0,
        //     step: 100,
        //     labelWidth: this.labelWidth
        // });
        //
        // // this.form.add({
        // //     xtype: 'checkbox',
        // //     fieldLabel: i18next.t('attributelist_config_10'),
        // //     inputValue: 'true',
        // //     name: 'showLayerSelectorTabs',
        // //     checked: this.configObject.showLayerSelectorTabs || false,
        // //     labelWidth: this.labelWidth
        // // });
        //
        // // this.form.add({
        // //     xtype: 'checkbox',
        // //     fieldLabel: i18next.t('attributelist_config_11'),
        // //     name: 'showAttributelistLinkInFeatureInfo',
        // //     value: this.configObject.showAttributelistLinkInFeatureInfo !== undefined ? this.configObject.showAttributelistLinkInFeatureInfo : false,
        // //     labelWidth: this.labelWidth
        // // });
        //
        // //this.createCheckBoxes(this.configObject.layers,{attribute:true});
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 600,
                minHeight: 300
            }
        }
    }
});



