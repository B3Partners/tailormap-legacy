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
            title: i18next.t('viewer_components_customconfiguration_221'),
            bodyPadding: me.formPadding,
            defaults: {
                anchor: '100%'
            },
            width: me.formWidth,
            items: [{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_222'),
                name: 'title',
                value: this.configObject.title,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_223'),
                inputValue: true,
                name: 'groupCheck',
                checked: this.configObject.groupCheck !== undefined ? this.configObject.groupCheck : true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_224'),
                inputValue: true,
                name: 'layersChecked',
                checked: this.configObject.layersChecked !== undefined ? this.configObject.layersChecked: true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_225'),
                inputValue: true,
                name: 'showBaselayers',
                checked: this.configObject.showBaselayers !== undefined ? this.configObject.showBaselayers: true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_226'),
                inputValue: true,
                name: 'showLeafIcon',
                checked: this.configObject.showLeafIcon !== undefined ? this.configObject.showLeafIcon : true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_227'),
                inputValue: true,
                name: 'showNodeIcon',
                checked: this.configObject.showNodeIcon !== undefined ? this.configObject.showNodeIcon : true,
                // value: true,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_228'),
                name: 'zoomToScaleText',
                value: this.configObject.zoomToScaleText? this.configObject.zoomToScaleText:"Zoom to scale",
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_229'),
                inputValue: true,
                name: 'expandOnStartup',
                checked: this.configObject.expandOnStartup !== undefined ? this.configObject.expandOnStartup : true,
                // value: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_230'),
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
                        fieldLabel: i18next.t('viewer_components_customconfiguration_231'),
                        name: 'showAllLayersOn',
                        inputValue: true,
                        checked: this.configObject.showAllLayersOn!==undefined? this.configObject.showAllLayersOn:false,
                        // value: true,
                        labelWidth: me.labelWidth,
                        boxLabel: i18next.t('viewer_components_customconfiguration_232')
                    },{
                        xtype: 'checkbox',
                        name: 'showAllLayersOff',
                        inputValue: true,
                        checked: this.configObject.showAllLayersOff!==undefined? this.configObject.showAllLayersOff:false,
                        // value: true,
                        boxLabel: i18next.t('viewer_components_customconfiguration_233'),
                        style: {
                            marginLeft: "20px"
                        }
                    }
                ]
            },
            { 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_234'),
                name: 'toggleAllLayersOnText',
                value: this.configObject.toggleAllLayersOnText? this.configObject.toggleAllLayersOnText:"All layers on",
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_235'),
                name: 'toggleAllLayersOffText',
                value: this.configObject.toggleAllLayersOffText? this.configObject.toggleAllLayersOffText:"All layers off",
                labelWidth:me.labelWidth
            },{                           
                xtype: 'radiogroup',
                vertical: true,
                fieldLabel: i18next.t('viewer_components_customconfiguration_236'),
                name: "initToggleAllLayers",
                labelWidth: me.labelWidth,
                items: [{
                    boxLabel: i18next.t('viewer_components_customconfiguration_237'), 
                    name: 'initToggleAllLayers', 
                    inputValue: true, 
                    checked: me.configObject.initToggleAllLayers
                },{
                    boxLabel: i18next.t('viewer_components_customconfiguration_238'), 
                    name: 'initToggleAllLayers', 
                    inputValue: false, 
                    checked: !me.configObject.initToggleAllLayers
                }]
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_239'),
                inputValue: true,
                name: 'showAfterSelectedContentChange',
                checked: this.configObject.showAfterSelectedContentChange !== undefined ? this.configObject.showAfterSelectedContentChange : false,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: i18next.t('viewer_components_customconfiguration_240'),
                inputValue: true,
                name: 'persistCheckedLayers',
                checked: this.configObject.persistCheckedLayers !== undefined ? this.configObject.persistCheckedLayers : false,
                labelWidth:me.labelWidth
            }],
            renderTo: parentId
        });      
    }
});
