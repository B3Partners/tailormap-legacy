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
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        var me = this;
        this.form = new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            defaultType: 'textfield',
            items: [{                  
                fieldLabel: i18next.t('divider_config_0'),
                name: 'title',
                value: this.configObject.title !== null && this.configObject.title !== undefined ? this.configObject.title : i18next.t('divider_config_1'),
                labelWidth: me.labelWidth,
                width: 500
            },{                        
                fieldLabel: i18next.t('divider_config_2'),
                name: 'margin',
                value: this.configObject.margin || "3px 0 3px 0",
                labelWidth: me.labelWidth,
                width: 400                   
            },{
                fieldLabel: i18next.t('divider_config_3'),
                name: 'padding',
                value: this.configObject.padding || "5px",
                labelWidth: me.labelWidth,
                width: 400
            },{
                xtype: 'colorfield',
                fieldLabel: i18next.t('divider_config_4'),
                name: 'backgroundColor',
                value: this.configObject.backgroundColor || "transparent",
                labelWidth: me.labelWidth
            },{
                fieldLabel: i18next.t('divider_config_5'),
                name: 'border',
                value: this.configObject.border || "1px 0 1px 0",
                labelWidth: me.labelWidth,
                width: 400
            },{
                xtype: 'colorfield',
                fieldLabel: i18next.t('divider_config_6'),
                name: 'borderColor',
                value: this.configObject.borderColor || "D0D0D0",
                labelWidth: me.labelWidth
            },{
                xtype: 'colorfield',
                fieldLabel: i18next.t('divider_config_7'),
                name: 'textColor',
                value: this.configObject.textColor || "000000",
                labelWidth: me.labelWidth
            },{
                xtype: "combo",
                fields: ['value', 'text'],
                value: this.configObject.fontWeight || "bold",
                name: "fontWeight",
                fieldLabel: i18next.t('divider_config_8'),
                labelWidth: me.labelWidth,
                store: [
                    ["normal", i18next.t('divider_config_9')],
                    ["bold", i18next.t('divider_config_10')]
                ],
                width : 400
            }],
            renderTo: parentId
        });
        
        return this;
    }
});