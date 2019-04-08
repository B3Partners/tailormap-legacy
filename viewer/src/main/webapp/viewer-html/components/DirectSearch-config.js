/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * Custom configuration object for DirectSearch configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define('viewer.components.CustomConfiguration', {
    extend: 'viewer.components.SearchConfiguration',
    maxSearchConfigs: 1,
    hideRemovePinConfig: true,
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {
                title: i18next.t('directsearch_config_0')
            };
        }
        configObject.hidePopupConfig = true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        var alignmentStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                ['Links-boven', 'tl'],
                ['Rechts-boven', 'tr'],
                ['Links-onder', 'bl'],
                ['Rechts-onder', 'br']
            ]
        });
        this.form.add([{
                xtype: 'textfield',
                fieldLabel: i18next.t('directsearch_config_1'),
                name: 'top',
                value: (configObject != null && configObject.top != undefined) ? configObject.top : '10',
                labelWidth:this.labelWidth
            },
            {
                xtype: 'textfield',
                fieldLabel: i18next.t('directsearch_config_2'),
                name: 'left',
                value: (configObject != null && configObject.left != undefined) ? configObject.left : '10',
                labelWidth:this.labelWidth
            },
            { 
                xtype: 'combobox',
                fieldLabel: i18next.t('directsearch_config_3'),
                name: 'alignposition',
                value: (configObject != null && configObject.alignposition != undefined) ? configObject.alignposition : 'tl',
                labelWidth: this.labelWidth,
                store: alignmentStore,
                displayField: 'name',
                valueField: 'value',
                queryMode: 'local'
            }]);
    }
});
