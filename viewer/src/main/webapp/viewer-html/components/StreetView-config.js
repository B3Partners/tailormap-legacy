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
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    form: null,
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        var me=this;
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: i18next.t('viewer_components_customconfiguration_215'),
            bodyPadding: me.formPadding,
            defaults: {
                anchor: '100%'
            },
            width: me.formWidth,
            items: [{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_216'),
                name: 'tooltip',
                value: this.configObject.tooltip || ___("Streetview"),
                labelWidth:me.labelWidth
            
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_217'),
                inputValue: true,
                name: 'useMarker',
                checked: this.configObject.useMarker !== undefined ? this.configObject.useMarker : false,
                labelWidth: me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel:  ___("Ga na gebruik naar de eerste tool"),
                inputValue: true,
                name: 'nonSticky',
                checked: this.configObject.nonSticky !== undefined ? this.configObject.nonSticky : false,
                labelWidth: me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_218'),
                inputValue: true,
                name: 'usePopup',
                checked: this.configObject.usePopup !== undefined ? this.configObject.usePopup : false,
                labelWidth: me.labelWidth,
                listeners: {
                    change: function(obj, val) {
                        Ext.getCmp("popupHeight").setVisible(val);
                        Ext.getCmp("popupWidth").setVisible(val);
                    }
                }
            }, {
                id: "popupHeight",
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_219'),
                name: 'height',
                hidden:  this.configObject.usePopup !== undefined ? !this.configObject.usePopup : true,
                value: this.configObject.height !== undefined? this.configObject.height:"400",
                labelWidth:me.labelWidth
            },{
                id: "popupWidth",
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_220'),
                name: 'width',
                hidden:  this.configObject.usePopup !== undefined ? !this.configObject.usePopup : true,
                value: this.configObject.width !== undefined? this.configObject.width:"400",
                labelWidth:me.labelWidth
            }],
            renderTo: parentId
        });      
    }
});
