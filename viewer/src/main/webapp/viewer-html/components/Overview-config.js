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
                {"type":"upperleft", "label": i18next.t('overview_config_0')},
                {"type":"upperright", "label": i18next.t('overview_config_1')},
                {"type":"lowerleft", "label": i18next.t('overview_config_2')},
                {"type":"lowerright", "label": i18next.t('overview_config_3')}
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
                    text: i18next.t('overview_config_4'),
                    style: "font-weight: bold;"
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_5'),
                    name: 'picNormal',
                    value: config.picNormal,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_6'),
                    name: 'picOver',
                    value: config.picOver,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_7'),
                    name: 'picSelected',
                    value: config.picSelected,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_8'),
                    name: 'picLeft',
                    value: config.picLeft,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_9'),
                    name: 'picTop',
                    value: config.picTop,
                    labelWidth:me.labelWidth
                }
                ]
            },
            */
            {
                xtype: "label",
                text: i18next.t('overview_config_10'),
                style: "font-weight: bold;"
            },
            { 
                xtype: 'textfield',
                fieldLabel: i18next.t('overview_config_11'),
                name: 'width',
                value: config.width,
                labelWidth:me.labelWidth
            },
            { 
                xtype: 'textfield',
                fieldLabel: i18next.t('overview_config_12'),
                name: 'height',
                value: config.height,
                labelWidth:me.labelWidth
            },
            {
                fieldLabel: i18next.t('overview_config_13'), 
                store: positionStore,
                xtype: 'combobox',
                name: 'position', 
                id: 'editvalues', 
                queryMode: 'local',
                displayField: 'label',
                valueField: 'type',
                emptyText: i18next.t('overview_config_14'),
                value: config.position,
                labelWidth:me.labelWidth
            }
            ,{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('overview_config_15'),
                name: 'url',
                value: config.url,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: i18next.t('overview_config_16'),
                name: 'layers',
                value: config.layers,
                labelWidth:me.labelWidth
            },{
                xtype: "checkbox",
                checked: config.hasOwnProperty('followZoom') ? config['followZoom'] : true,
                name: "followZoom",
                fieldLabel: i18next.t('overview_config_17'),
                labelWidth:me.labelWidth
            },{ 
                xtype:'container',
                margin: 5,
                title: i18next.t('overview_config_18'),
                collapsible: false,
                defaultType: 'textfield',
                layout: 'column', 
                items:[
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_19'),
                    name: 'lox',
                    value: config.lox,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_20'),
                    name: 'loy',
                    value: config.loy,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_21'),
                    name: 'rbx',
                    value: config.rbx,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: i18next.t('overview_config_22'),
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