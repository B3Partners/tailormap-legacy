/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    form: null,
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        if(config == undefined || config == null){
            config = new Object();
        }

        var me=this;
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: 'Configureer dit component',
            bodyPadding: me.formPadding,
            defaults: {
                anchor: '100%'
            },
            width: me.formWidth,
            items: [{ 
                xtype: 'textfield',
                fieldLabel: 'Tooltip',
                name: 'tooltip',
                value: config.tooltip,
                labelWidth:me.labelWidth
            
            },{
                xtype: 'checkbox',
                fieldLabel: "Zet een marker na klikken",
                inputValue: false,
                name: 'useMarker',
                checked: config.useMarker !== undefined ? config.useMarker : false,
                value: false,
                labelWidth: me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel:  "Ga na gebruik naar de eerste tool",
                inputValue: false,
                name: 'nonSticky',
                checked: config.nonSticky !== undefined ? config.nonSticky : false,
                value: false,
                labelWidth: me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: "Gebruik pop-up voor streetview",
                inputValue: false,
                name: 'usePopup',
                checked: config.usePopup !== undefined ? config.usePopup : false,
                value: false,
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
                fieldLabel: "Hoogte popup",
                name: 'height',
                hidden:  config.usePopup!==undefined ? !config.usePopup : true,
                value: config.height!==undefined? config.height:"400",
                labelWidth:me.labelWidth
            },{
                id: "popupWidth",
                xtype: 'textfield',
                fieldLabel: "Breedte popup",
                name: 'width',
                hidden:  config.usePopup!==undefined ? !config.usePopup : true,
                value: config.width!==undefined? config.width:"400",
                labelWidth:me.labelWidth
            }],
            renderTo: parentid
        });      
    }
});
