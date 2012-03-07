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
 * Print component
 * Creates a AttributeList component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Print",{
    extend: "viewer.components.Component",  
    panel: null,
    config:{
        name: "Print",
        title: "",
        titlebarIcon : "",
        tooltip : "",
        default_format: null,
        orientation: null,
        legend: null
    },
    constructor: function (conf){                
        viewer.components.Print.superclass.constructor.call(this, conf);
        this.initConfig(conf);    
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.title,
            icon: me.titlebarIcon,
            tooltip: me.tooltip
        });
        me.buttonClick();        
        return this;
    },
    buttonClick: function(){
        this.popup.show();
        this.createForm();
    },
    createForm: function(){
        var me = this;
        me.panel = Ext.create('Ext.panel.Panel', {
            frame: false,
            bodyPadding: 5,
            width: "100%",
            height: "100%",
            renderTo: me.getContentDiv(),
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
                
            },            
            items: [{
                //top container (1)
                xtype: 'container',
                height: 200,
                items: [{
                    
                }]                
            },{
                //bottom container (2)
                xtype: 'container',
                layout: {
                    type: 'column'
                },
                width: '100%',
                items: [{
                    //bottom left (3)
                    xtype: 'container',
                    columnWidth: 0.4,
                    items: [{                        
                        xtype: "label",
                        text: "Titel"
                    },{
                        xtype: 'textfield',
                        width: '100%',                        
                        name: 'title',
                        value: "titel"
                    },{                        
                        xtype: "label",
                        text: "Subtitel"
                    },{
                        xtype: 'textfield',
                        name: 'subtitle',
                        value: "Sub titel"
                    },{                        
                        xtype: "label",
                        text: "Optionele Tekst"
                    },{
                        xtype: 'textfield',
                        name: 'extraTekst',
                        value: ""
                    }]
                },{
                    //bottom right (4)
                    xtype: 'container',
                    columnWidth: 0.6,
                    items: [{
                        //kwality row (5)
                        xtype: 'container',                        
                        width: '100%',
                        items: [{                        
                            xtype: "label",
                            text: "Kwaliteit"
                        },{
                            xtype: 'container',
                            layout: {
                                type: 'column'
                            },
                            width: '100%',
                            items: [{
                                xtype: 'slider',
                                value: 50,
                                increment: 10,
                                minValue: 0,
                                maxValue: 100,
                                columnWidth: 1
                            },{
                                xtype: 'button',
                                text: '<',
                                width: 30
                            }]
                        }]
                    },{
                        // (6)
                        xtype: 'container',
                        layout: {type: 'column'},
                        items: [{
                            //(7)
                            xtype: 'container',
                            columnWidth: 0.5,        
                            items: [{                                
                                xtype: 'label',
                                text: 'Orientatie'
                            },{
                                xtype: 'radiogroup',
                                name: "orientation", 
                                width: 125,
                                items: [{
                                    boxLabel: 'Liggend', 
                                    name: 'orientation', 
                                    inputValue: 'landscape', 
                                    checked: me.getOrientation()=='landscape'
                                },{
                                    boxLabel: 'Staand', 
                                    name: 'orientation', 
                                    inputValue: 'portrait', 
                                    checked: me.getOrientation()=='portrait' 
                                }]                            
                            },{
                                xtype: 'checkbox',
                                name: 'legenda',
                                checked: me.getLegend(),
                                boxLabel: 'Legenda toevoegen'
                            }]                        
                        },{
                            //(8)
                            xtype: 'container',
                            columnWidth: 0.5,
                            items: [{
                                xtype: 'label',  
                                text: "Pagina formaat"  
                            },{
                                xtype: 'combo',                                
                                store: [['a4','A4'],['a3','A3']],
                                width: 100,
                                value: me.getDefault_format()
                            },{
                                xtype: 'label',  
                                text: "Kaart draaien"  
                            },{
                                xtype: 'slider',
                                value: 0,
                                increment: 1,                                
                                minValue: 0,
                                maxValue: 360,
                                width: 100,
                                tipText: function(tumb){
                                    return tumb.value+"º";
                                }
                            }] 
                        }]
                    }]                        
                }]
            }]
        });
        /*this.form=new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,          
            items: [{ 
                xtype: 'container',
                layout: {type: 'hbox'},
                items: [{
                        xtype: 'container',
                        //layout: {type: 'vbox'},
                        items: [{                     
                            xtype: 'textfield',
                            fieldLabel: 'Titel',
                            name: 'title',
                            value: config.title,
                            labelWidth:me.labelWidth,
                            width: 500
                        },{                        
                            xtype: 'textfield',
                            fieldLabel: 'Titelbalk icoon',
                            name: 'iconUrl',
                            value: config.iconUrl,
                            labelWidth:me.labelWidth,
                            width: 500,
                            listeners: {
                                blur: function(textField,options){
                                    me.onIconChange(textField,options);
                                }
                            }
                        }]                    
                    },{
                        xtype: "image",
                        id: "iconImage",
                        src: iconurl,
                        style: {"margin-left": "100px"}
                    }]
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Tooltip',
                name: 'tooltip',
                value: config.tooltip,
                labelWidth:me.labelWidth,
                width: 700
            }],
            renderTo: this.parentId//(2)
        });*/
    }
});

