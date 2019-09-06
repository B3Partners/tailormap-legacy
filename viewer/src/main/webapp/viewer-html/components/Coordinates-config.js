/* 
 * Copyright (C) 2012-2019 B3Partners B.V.
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
 * Custom configuration object for Coordinates configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define('viewer.components.CustomConfiguration', {
    extend: 'viewer.components.ConfigObject',
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        var alignmentStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'label',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                [ i18next.t('coordinates_config_4'), 'tl' ],
                [ i18next.t('coordinates_config_5'), 'tr' ],
                [ i18next.t('coordinates_config_6'), 'bl' ],
                [ i18next.t('coordinates_config_7'), 'br' ]
            ]
        });
        this.form=new Ext.form.FormPanel({
            frame: false,
            bodyPadding: this.formPadding,
            width: this.formWidth,
            items: [
                {
                    xtype: 'numberfield',
                    fieldLabel: i18next.t('coordinates_config_0'),
                    name: 'decimals',
                    value: (configObject != null && configObject.decimals != undefined) ? configObject.decimals : 2,
                    labelWidth:this.labelWidth
                },
                {
                    xtype: 'textfield',
                    fieldLabel: i18next.t('coordinates_config_1'),
                    name: 'top',
                    value: (configObject != null && configObject.top != undefined) ? configObject.top : '10',
                    labelWidth:this.labelWidth
                },
                {
                    xtype: 'textfield',
                    fieldLabel: i18next.t('coordinates_config_2'),
                    name: 'left',
                    value: (configObject != null && configObject.left != undefined) ? configObject.left : '10',
                    labelWidth:this.labelWidth
                },
                {
                    xtype: 'combobox',
                    fieldLabel: i18next.t('coordinates_config_3'),
                    name: 'alignposition',
                    value: (configObject != null && configObject.alignposition != undefined) ? configObject.alignposition : 'br',
                    labelWidth: this.labelWidth,
                    store: alignmentStore,
                    displayField: 'label',
                    valueField: 'value',
                    queryMode: 'local'
                }
            ],
            renderTo: this.parentId
        });
    }
});
