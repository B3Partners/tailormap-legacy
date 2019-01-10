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
 * Custom configuration object for AttributeList configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 * @author Eddy Scheper
 */
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);        
        //this.createCheckBoxes(this.configObject.layers);
        this.addFormItems(configObject);
    },
    addFormItems: function(){
        var me =this;        
        this.form.add([{
                xtype: "label",
                text: i18next.t('print_config_0'),
                style: "font-weight: bold;"                
            },{                           
                xtype: 'radiogroup',
                columns: 1,
                vertical: true,
                name: "orientation",
                items: [{
                    boxLabel: i18next.t('print_config_1'), 
                    name: 'orientation', 
                    inputValue: 'landscape', 
                    checked: me.configObject.orientation=="landscape"
                },{
                    boxLabel: i18next.t('print_config_2'), 
                    name: 'orientation', 
                    inputValue: 'portrait', 
                    checked: !(me.configObject.orientation=="landscape")
                }]
            },
            {
                xtype: "label",
                text: i18next.t('print_config_3'),
                style: "font-weight: bold;"
            },
            {
                xtype: 'container',
                layout: 'hbox',
                defaults: {
                    margin: '0 3px 0 0'
                },
                items: [
                    {
                        xtype: "checkbox",
                        name: "useA5",
                        checked: me.configObject.useA5 || false,
                        boxLabel: i18next.t('print_config_4')
                    },
                    {
                        xtype: "checkbox",
                        name: "useA4",
                        checked: me.configObject.useA4 || true,
                        boxLabel: i18next.t('print_config_5')
                    },
                    {
                        xtype: "checkbox",
                        name: "useA3",
                        checked: me.configObject.useA3 || true,
                        boxLabel: i18next.t('print_config_6')
                    },
                    {
                        xtype: "checkbox",
                        name: "useA2",
                        checked: me.configObject.useA2 || false,
                        boxLabel: i18next.t('print_config_A2')
                    },
                    {
                        xtype: "checkbox",
                        name: "useA1",
                        checked: me.configObject.useA1 || false,
                        boxLabel: i18next.t('print_config_A1')
                    },
                    {
                        xtype: "checkbox",
                        name: "useA0",
                        checked: me.configObject.useA0 || false,
                        boxLabel: i18next.t('print_config_7')
                    }
                ]
            },
            {
                xtype: "label",
                text: i18next.t('print_config_8'),
                style: "font-weight: bold;"                
            },{
                xtype: "combo",
                fields: ['value','text'],
                value: me.configObject.default_format ? me.configObject.default_format : "a4",
                name: "default_format",
                emptyText: i18next.t('print_config_9'),
                store: [
                    ["a5","A5"],
                    ["a4","A4"],
                    ["a3","A3"],
                    ["a0","A0"]
                ],
                width : 75
            },{
                xtype: "label",
                text: i18next.t('print_config_10'),
                style: "font-weight: bold;"                
            },{
                xtype: "checkbox",
                name: "legend",
                checked: me.configObject.legend,
                boxLabel: i18next.t('print_config_11')
            },{
                xtype: "label",
                text: i18next.t('print_config_12'),
                style: "font-weight: bold;"                
            },{
                xtype: "textfield",
                name: "max_imagesize",
                value: me.configObject.max_imagesize ? me.configObject.max_imagesize :"2048"
            },{
//                xtype: "label",
//                text: i18next.t('print_config_13'),
//                style: "font-weight: bold;"
//            },{
//                xtype: "checkbox",
//                name: "showPrintRtf",
//                checked: me.configObject.showPrintRtf ? me.configObject.showPrintRtf : true,
//                boxLabel: i18next.t('print_config_14')
//            },{
                xtype: "label",
                text: i18next.t('print_config_15'),
                style: "font-weight: bold;"                
            },{
                xtype: "checkbox",
                name: "overview",
                checked: me.configObject.overview ? me.configObject.overview : false,
                boxLabel: i18next.t('print_config_16')
            }
            ,{
                xtype: "label",
                text: i18next.t('print_config_17'),
                style: "font-weight: bold;"                
            },{
                xtype: "combo",
                fields: ['value','text'],
                value: me.configObject.mailPrint ? me.configObject.mailPrint : "cantMail",
                name: "mailPrint",
                emptyText: i18next.t('print_config_18'),
                store: [
                    ["canAlsoMail",i18next.t('print_config_19')],
                    ["cantMail",i18next.t('print_config_20')],
                    ["canOnlyMail",i18next.t('print_config_21')]
                ],
                listeners:{
                    change:{
                        scope: this,
                        fn: function(obj, newValue) {
                            var enable = newValue !== "cantMail";
                            if (enable) {
                                Ext.getCmp("fromAddress").show();
                                Ext.getCmp("fromName").show();
                            } else {
                                Ext.getCmp("fromAddress").hide();
                                Ext.getCmp("fromName").hide();

                            }
                        }
                    }
                },
                width : 254
            },
           {
                xtype: "textfield",
                name: "fromAddress",
                id: "fromAddress",
                value: me.configObject.fromAddress ? me.configObject.fromAddress :"",
                fieldLabel: i18next.t('print_config_22'),
                hidden: me.configObject.mailPrint === "cantMail"
            },{
                xtype: "textfield",
                name: "fromName",
                id: "fromName",
                value: me.configObject.fromName ? me.configObject.fromName : i18next.t('print_config_23'),
                fieldLabel: i18next.t('print_config_24'),
                hidden: me.configObject.mailPrint === "cantMail"
            }
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 550,
                minHeight: 515
            }
        }
    }
});

