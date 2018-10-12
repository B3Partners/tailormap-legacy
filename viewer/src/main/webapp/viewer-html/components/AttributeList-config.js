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
 * Custom configuration object for AttributeList configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);

        this.form.add({
            xtype: 'combobox',
            store: [[ "CSV", "csv" ], [ "XLS", "Excel" ], [ "SHP", "Shape" ]],
            itemId: 'defaultDownload',
            name: 'defaultDownload',
            labelWidth: this.labelWidth,
            fieldLabel: i18next.t('viewer_components_customconfiguration_0'),
            value: this.configObject.defaultDownload || "SHP"
        });

        this.form.add({
            xtype: 'checkbox',
            fieldLabel: i18next.t('viewer_components_customconfiguration_1'),
            inputValue: true,
            name: 'autoDownload',
            checked: this.configObject.autoDownload || false,
            labelWidth: this.labelWidth
        });

        this.form.add({
            xtype: 'textfield',
            fieldLabel: i18next.t('viewer_components_customconfiguration_2'),
            name: 'downloadParams',
            value: this.configObject.downloadParams,
            labelWidth: this.labelWidth,
            width: 700
        });

        this.form.add({
            xtype: 'container',
            html: i18next.t('viewer_components_customconfiguration_3')
        });

        this.form.add({
            xtype: 'checkbox',
            fieldLabel: i18next.t('viewer_components_customconfiguration_4'),
            inputValue: true,
            name: 'addZoomTo',
            checked: this.configObject.addZoomTo || false,
            labelWidth: this.labelWidth
        });

        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('viewer_components_customconfiguration_5'),
            name: 'zoomToBuffer',
            value: this.configObject.zoomToBuffer || 10,
            minValue: 0,
            step: 10,
            labelWidth: this.labelWidth
        });

        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('viewer_components_customconfiguration_6'),
            name: 'requestThreshold',
            value: this.configObject.requestThreshold || 2000,
            minValue: 0,
            step: 100,
            labelWidth: this.labelWidth
        });
        
        this.form.add({
            xtype: 'checkbox',
            fieldLabel: i18next.t('viewer_components_customconfiguration_7'),
            inputValue: 'true',
            name: 'showLayerSelectorTabs',
            checked: this.configObject.showLayerSelectorTabs || false,
            labelWidth: this.labelWidth
        });

        this.form.add({
            xtype: 'checkbox',
            fieldLabel: i18next.t('viewer_components_customconfiguration_8'),
            name: 'showAttributelistLinkInFeatureInfo',
            value: this.configObject.showAttributelistLinkInFeatureInfo !== undefined ? this.configObject.showAttributelistLinkInFeatureInfo : false,
            labelWidth: this.labelWidth
        });

        this.createCheckBoxes(this.configObject.layers,{attribute:true});
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



