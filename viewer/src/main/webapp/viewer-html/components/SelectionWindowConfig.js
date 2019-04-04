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
 * Abstract selection window configuration file.
 * Creates a form that is used for most of the selection windows.
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.SelectionWindowConfig",{
    extend: "viewer.components.ConfigObject",
    constructor: function (parentId, configObject, configPage) {
        viewer.components.SelectionWindowConfig.superclass.constructor.call(this, parentId, configObject, configPage);
        //Create the form.                 
        this.createForm(this.configObject);    
        //this.createCheckBoxes(this.configObject.layers);*/
    },
    createForm: function(config){
        console.log(this);
        //to make this accessible in object
        var me=this;
        var iconurl = config.iconUrl;
        var label = config.label;
        var showLabelconfig = config.showLabelconfig === true;
        var hidePopupConfig = config.hidePopupConfig === true;
        if(Ext.isEmpty(iconurl) || !Ext.isDefined(iconurl)) iconurl = null;
        if(Ext.isEmpty(label) || !Ext.isDefined(label)) label = "";
        var hidden = {};
        if(this.configPage._metadata.hidden){
            hidden = this.configPage._metadata.hidden;
        }
        this.form=new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            /*defaults: {
                anchor: '100%'
            },*/
            items: hidePopupConfig ? [] : [{
                xtype: 'container',
                layout: {type: 'hbox'},
                items: [{
                        xtype: 'container',
                        //layout: {type: 'vbox'},
                        items: [{                     
                            xtype: 'textfield',
                            fieldLabel: i18next.t('general_components_selectionwindowconfig_0'),
                            name: 'title',
                            value: config.title,
                            labelWidth:me.labelWidth,
                            width: 700
                        },{                        
                            xtype: 'textfield',
                            fieldLabel: i18next.t('general_components_selectionwindowconfig_1'),
                            name: 'iconUrl',
                            value: config.iconUrl,
                            hidden: hidden.iconUrl === "true" ? true:false,
                            labelWidth:me.labelWidth,
                            width: 700,
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
                fieldLabel: i18next.t('general_components_selectionwindowconfig_2'),
                name: 'tooltip',
                value: config.tooltip,
                hidden: hidden.tooltip === "true" ? true:false,
                labelWidth:me.labelWidth,
                width: 700
            }],
            renderTo: this.parentId//(2)
        });
        if(showLabelconfig) {
            this.form.add({ 
                xtype: 'textfield',
                fieldLabel: i18next.t('general_components_selectionwindowconfig_3'),
                name: 'label',
                value: label,
                hidden: hidden.label === "true" ? true:false,
                labelWidth: me.labelWidth,
                width: 700
            });
        }
    },
    onIconChange: function(textField,options){
        //Ext.get("#iconImage").el.dom.src = textField.getValue();
        var iconurl = textField.getValue();
        if(Ext.isEmpty(iconurl) || !Ext.isDefined(iconurl)) iconurl = null;
        Ext.getCmp("iconImage").el.dom.src = iconurl;
    }
});

