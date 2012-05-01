/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    htmlEditor: null,
    constructor: function (parentid,configObject){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,configObject);
        this.createForm(this.configObject);
        return this;
    },
    createForm: function(config){
        //to make this accessible in object
        var me=this;
        this.form=new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            height: '100%',
            autoScroll:true,
            hideMode : 'offsets',
            items: [{
                xtype: "label",
                text: "Layout",
                style: "font-weight: bold;"
            },
            {
                xtype: 'radiogroup',
                columns: 1,
                vertical: true,
                labelWidth:350,
                items: [{
                    boxLabel: 'Toon overzichtskaart in popup', 
                    name: 'position',
                    inputValue: 'popup', 
                    checked: config.position == 'popup',
                    listeners:{
                        change :{ 
                            fn : function (obj, checked){
                                var c = Ext.get("overviewPopupConfig");
                                c.setVisible(checked);
                            },
                            scope : this
                        }
                    }
                },
                {
                    boxLabel: 'Toon overzichtskaart als vak in kaart', 
                    name: 'position', 
                    checked : config.position == 'inmap',
                    inputValue: 'inmap'
                }
                ]
            },
            {
                xtype: 'container',
                hidden: config.position == 'inmap',
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
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Links',
                name: 'left',
                value: config.left,
                labelWidth:me.labelWidth
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'Boven',
                name: 'top',
                value: config.top,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Onder',
                name: 'bottom',
                value: config.bottom,
                labelWidth:me.labelWidth
            },
            { 
                xtype: 'textfield',
                fieldLabel: 'Rechts',
                name: 'right',
                value: config.right,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: 'URL naar achtergrondkaart (afbeelding, WMS-request of swf)',
                name: 'url',
                value: config.url,
                labelWidth:me.labelWidth
            },{ 
                xtype:'container',
                //columnWidth: 0.5,
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
            renderTo: this.parentId//(2)
        });     
    }    
});