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
 * Custom configuration object for Overview
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.createForm(this.configObject);
        return this;
    },
    createForm: function(config){
        //to make this accessible in object
        var me=this;
        var positionStore = Ext.create('Ext.data.Store', {
            fields: ['type', 'label'],
            data :
                [
                {"type":"upperleft", "label": i18next.t('viewer_components_customconfiguration_321')},
                {"type":"upperright", "label": i18next.t('viewer_components_customconfiguration_322')},
                {"type":"lowerleft", "label": i18next.t('viewer_components_customconfiguration_323')},
                {"type":"lowerright", "label": i18next.t('viewer_components_customconfiguration_324')}
                ]
        });
        this.form=new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            height: '100%',
            autoScroll:true,
            hideMode : 'offsets',
            items: [
                /* FLAMINGO FLASH, NOT USED ANYMORE
            {
                xtype: 'container',
                name : 'overviewPopupConfig',
                id: 'overviewPopupConfig',
                items: [
                {
                    xtype: "label",
                    text: i18next.t('viewer_components_customconfiguration_134'),
                    style: "font-weight: bold;"
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_135'),
                    name: 'picNormal',
                    value: config.picNormal,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_136'),
                    name: 'picOver',
                    value: config.picOver,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_137'),
                    name: 'picSelected',
                    value: config.picSelected,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_138'),
                    name: 'picLeft',
                    value: config.picLeft,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_139'),
                    name: 'picTop',
                    value: config.picTop,
                    labelWidth:me.labelWidth
                }
                ]
            },
            */
            {
                xtype: "label",
                text: i18next.t('viewer_components_customconfiguration_140'),
                style: "font-weight: bold;"
            },
            { 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_141'),
                name: 'width',
                value: config.width,
                labelWidth:me.labelWidth
            },
            { 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_142'),
                name: 'height',
                value: config.height,
                labelWidth:me.labelWidth
            },
            {
                fieldLabel: i18next.t('viewer_components_customconfiguration_143'), 
                store: positionStore,
                xtype: 'combobox',
                name: 'position', 
                id: 'editvalues', 
                queryMode: 'local',
                displayField: 'label',
                valueField: 'type',
                emptyText: i18next.t('viewer_components_customconfiguration_144'),
                value: config.position,
                labelWidth:me.labelWidth
            }
            ,{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_145'),
                name: 'url',
                value: config.url,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('viewer_components_customconfiguration_146'),
                name: 'layers',
                value: config.layers,
                labelWidth:me.labelWidth
            },{
                xtype: "checkbox",
                checked: config.hasOwnProperty('followZoom') ? config['followZoom'] : true,
                name: "followZoom",
                fieldLabel: i18next.t('viewer_components_customconfiguration_147'),
                labelWidth:me.labelWidth
            },{ 
                xtype:'container',
                margin: 5,
                title: i18next.t('viewer_components_customconfiguration_148'),
                collapsible: false,
                defaultType: 'textfield',
                layout: 'column', 
                items:[
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_149'),
                    name: 'lox',
                    value: config.lox,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_150'),
                    name: 'loy',
                    value: config.loy,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_151'),
                    name: 'rbx',
                    value: config.rbx,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('viewer_components_customconfiguration_152'),
                    name: 'rby',
                    value: config.rby,
                    labelWidth:50,
                    margin: 5,
                    width:150
                }]
            }],
            renderTo: this.parentId
        });     
    }    
});