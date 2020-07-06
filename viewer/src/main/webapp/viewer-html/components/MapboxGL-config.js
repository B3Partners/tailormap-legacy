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
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null) {
            configObject = {};
        }
        configObject.showLabelconfig = true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);

        this.form.add({
            xtype: 'textfield',
            fieldLabel: i18next.t('mapbox3d_config_accessToken'),
            value: this.configObject.accessToken || '',
            name: 'accessToken',
            labelWidth: this.labelWidth,
            width: 700
        });
        this.form.add({
            xtype: 'textfield',
            fieldLabel: i18next.t('mapbox3d_config_style'),
            value: this.configObject.style || '',
            name: 'style',
            labelWidth: this.labelWidth,
            width: 700
        });
        this.form.add({
            xtype: 'textfield',
            fieldLabel: i18next.t('mapbox3d_config_extrusionLayerId'),
            // 3d-buildings
            value: this.configObject.extrusionLayerId || '',
            name: 'extrusionLayerId',
            labelWidth: this.labelWidth,
            width: 700
        });
        this.form.add({
            xtype: 'textfield',
            fieldLabel: i18next.t('mapbox3d_config_extrusionLayerSource'),
            // building
            value: this.configObject.extrusionLayerSource || '',
            name: 'extrusionLayerSource',
            labelWidth: this.labelWidth,
            width: 700
        });
        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('mapbox3d_config_pitch'),
            value: this.configObject.pitch || 45,
            name: 'pitch',
            minValue: 0,
            maxValue: 60,
            labelWidth: this.labelWidth
        });
        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('mapbox3d_config_zoom'),
            value: this.configObject.zoom || 16,
            name: 'zoom',
            minValue: 0,
            maxValue: 24,
            labelWidth: this.labelWidth
        });
        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('mapbox3d_config_bearing'),
            value: this.configObject.bearing || 0,
            name: 'bearing',
            minValue: 0,
            maxValue: 359,
            labelWidth: this.labelWidth
        });
        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('mapbox3d_config_width'),
            value: this.configObject.width || 800,
            name: 'width',
            labelWidth: this.labelWidth
        });
        this.form.add({
            xtype: 'numberfield',
            fieldLabel: i18next.t('mapbox3d_config_height'),
            value: this.configObject.height || 600,
            name: 'height',
            labelWidth: this.labelWidth
        });
        this.form.add({
            xtype: 'checkbox',
            fieldLabel: i18next.t('mapbox3d_config_fullscreenBtn'),
            value: this.configObject.fullscreenBtn !== undefined ? this.configObject.fullscreenBtn : true,
            name: 'fullscreenBtn',
            labelWidth: this.labelWidth
        });

    },
    getDefaultValues: function () {
        return {
            details: {
                minWidth: 450,
                minHeight: 250
            }
        }
    }
});