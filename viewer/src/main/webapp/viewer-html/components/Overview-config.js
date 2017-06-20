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
                {"type":"upperleft", "label":"Linksboven"},
                {"type":"upperright", "label":"Rechtsboven"},
                {"type":"lowerleft", "label":"Linksonder"},
                {"type":"lowerright", "label":"Rechtsonder"}
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
            {
                xtype: 'container',
                name : 'overviewPopupConfig',
                id: 'overviewPopupConfig',
                items: [
                {
                    xtype: "label",
                    text: "Instellingen knop voor overviewkaart",
                    style: "font-weight: bold;"
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'Plaatje normaal',
                    name: 'picNormal',
                    value: config.picNormal,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'Plaatje over',
                    name: 'picOver',
                    value: config.picOver,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'Plaatje geselecteerd',
                    name: 'picSelected',
                    value: config.picSelected,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'Positie links',
                    name: 'picLeft',
                    value: config.picLeft,
                    labelWidth:me.labelWidth
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'Positie boven',
                    name: 'picTop',
                    value: config.picTop,
                    labelWidth:me.labelWidth
                }
                ]
            },
            {
                xtype: "label",
                text: "Afmetingen",
                style: "font-weight: bold;"
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'Breedte',
                name: 'width',
                value: config.width,
                labelWidth:me.labelWidth
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'Hoogte',
                name: 'height',
                value: config.height,
                labelWidth:me.labelWidth
            },
            {
                fieldLabel: 'Positie', 
                store: positionStore,
                xtype: 'combobox',
                name: 'position', 
                id: 'editvalues', 
                queryMode: 'local',
                displayField: 'label',
                valueField: 'type',
                emptyText:'Maak uw keuze',
                value: config.position,
                labelWidth:me.labelWidth
            }
            ,{ 
                xtype: 'textfield',
                fieldLabel: 'URL naar achtergrondkaart (afbeelding, WMS-request of swf)',
                name: 'url',
                value: config.url,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Layers (optioneel)',
                name: 'layers',
                value: config.layers,
                labelWidth:me.labelWidth
            },{
                xtype: "checkbox",
                checked: config.hasOwnProperty('followZoom') ? config['followZoom'] : true,
                name: "followZoom",
                fieldLabel: "Volg zoomen",
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'WMTS',
                name: 'LAYERTYPE_WMTS',
                checked: me.config.type = 'WMTS',
                labelWidth:me.labelWidth,
                value: false
            },{ 
                xtype:'container',
                margin: 5,
                title: 'Extentie van de afbeelding',
                collapsible: false,
                defaultType: 'textfield',
                layout: 'column', 
                items:[
                { 
                    xtype: 'textfield',
                    fieldLabel: 'lo-x',
                    name: 'lox',
                    value: config.lox,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'lo-y',
                    name: 'loy',
                    value: config.loy,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'rb-x',
                    name: 'rbx',
                    value: config.rbx,
                    labelWidth:50,
                    margin: 5,
                    width:150
                },
                { 
                    xtype: 'textfield',
                    fieldLabel: 'rb-y',
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