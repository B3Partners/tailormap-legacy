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
        /* backwards compatible of the toggle layers button configuration*/
        if (this.configObject.showToggleAllLayers !== undefined){
            this.configObject.showAllLayersOn = this.configObject.showToggleAllLayers;
            this.configObject.showAllLayersOff = this.configObject.showToggleAllLayers;
        }
        var me=this;
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: i18next.t('toc_config_0'),
            bodyPadding: me.formPadding,
            defaults: {
                anchor: '100%'
            },
            width: me.formWidth,
            items: [{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('toc_config_1'),
                name: 'title',
                value: this.configObject.title,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_2'),
                inputValue: true,
                name: 'groupCheck',
                checked: this.configObject.groupCheck !== undefined ? this.configObject.groupCheck : true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_3'),
                inputValue: true,
                name: 'layersChecked',
                checked: this.configObject.layersChecked !== undefined ? this.configObject.layersChecked: true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_4'),
                inputValue: true,
                name: 'showBaselayers',
                checked: this.configObject.showBaselayers !== undefined ? this.configObject.showBaselayers: true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_5'),
                inputValue: true,
                name: 'showLeafIcon',
                checked: this.configObject.showLeafIcon !== undefined ? this.configObject.showLeafIcon : true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_6'),
                inputValue: true,
                name: 'showNodeIcon',
                checked: this.configObject.showNodeIcon !== undefined ? this.configObject.showNodeIcon : true,
                // value: true,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('toc_config_7'),
                name: 'zoomToScaleText',
                value: this.configObject.zoomToScaleText? this.configObject.zoomToScaleText:i18next.t('toc_config_8'),
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_9'),
                inputValue: true,
                name: 'expandOnStartup',
                checked: this.configObject.expandOnStartup !== undefined ? this.configObject.expandOnStartup : true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_10'),
                inputValue: false,
                name: 'expandOnEnabledLayer',
                checked: this.configObject.expandOnEnabledLayer !== undefined ? this.configObject.expandOnEnabledLayer : false,
                // value: false,
                labelWidth:me.labelWidth
            },{
                xtype: 'container',
                layout: {
                    type : 'hbox'
                },
                items: [
                    {
                        xtype: 'checkbox',
                        fieldLabel: i18next.t('toc_config_11'),
                        name: 'showAllLayersOn',
                        inputValue: true,
                        checked: this.configObject.showAllLayersOn!==undefined? this.configObject.showAllLayersOn:false,
                        // value: true,
                        labelWidth: me.labelWidth,
                        boxLabel: i18next.t('toc_config_12')
                    },{
                        xtype: 'checkbox',
                        name: 'showAllLayersOff',
                        inputValue: true,
                        checked: this.configObject.showAllLayersOff!==undefined? this.configObject.showAllLayersOff:false,
                        // value: true,
                        boxLabel: i18next.t('toc_config_13'),
                        style: {
                            marginLeft: "20px"
                        }
                    }
                ]
            },
            { 
                xtype: 'textfield',
                fieldLabel: i18next.t('toc_config_14'),
                name: 'toggleAllLayersOnText',
                value: this.configObject.toggleAllLayersOnText? this.configObject.toggleAllLayersOnText:i18next.t('toc_config_15'),
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('toc_config_16'),
                name: 'toggleAllLayersOffText',
                value: this.configObject.toggleAllLayersOffText? this.configObject.toggleAllLayersOffText:i18next.t('toc_config_17'),
                labelWidth:me.labelWidth
            },{                           
                xtype: 'radiogroup',
                vertical: true,
                fieldLabel: i18next.t('toc_config_18'),
                name: "initToggleAllLayers",
                labelWidth: me.labelWidth,
                items: [{
                    boxLabel: i18next.t('toc_config_19'), 
                    name: 'initToggleAllLayers', 
                    inputValue: true, 
                    checked: me.configObject.initToggleAllLayers
                },{
                    boxLabel: i18next.t('toc_config_20'), 
                    name: 'initToggleAllLayers', 
                    inputValue: false, 
                    checked: !me.configObject.initToggleAllLayers
                }]
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_21'),
                inputValue: true,
                name: 'showAfterSelectedContentChange',
                checked: this.configObject.showAfterSelectedContentChange !== undefined ? this.configObject.showAfterSelectedContentChange : false,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('toc_config_22'),
                inputValue: true,
                name: 'persistCheckedLayers',
                checked: this.configObject.persistCheckedLayers !== undefined ? this.configObject.persistCheckedLayers : false,
                labelWidth:me.labelWidth
            }],
            renderTo: parentId
        });      
    }
});
