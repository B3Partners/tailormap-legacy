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
                fieldLabel: 'Naam',
                name: 'title',
                value: config.title,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kaarten en kaartlaaggroepen krijgen een vinkvak',
                inputValue: true,
                name: 'groupCheck',
                checked: config.groupCheck? config.groupCheck : true,
                value: config.groupCheck? config.groupCheck : true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kaartlagen krijgen een vinkvak',
                inputValue: true,
                name: 'layersChecked',
                checked: config.layersChecked? config.layersChecked: true,
                value: config.layersChecked? config.layersChecked: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Achtergrondkaarten tonen',
                inputValue: true,
                name: 'showBaselayers',
                checked: config.showBaselayers? config.showBaselayers: true,
                value: config.showBaselayers? config.showBaselayers: true,
                labelWidth:me.labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Algemeen icoon voor kaartlaag tonen',
                inputValue: true,
                name: 'showLeafIcon',
                checked: config.showLeafIcon? config.showLeafIcon:true,
                value: config.showLeafIcon? config.showLeafIcon:true,
                labelWidth:me.labelWidth
            }],
        
            renderTo: parentid//(2)
        });      
    },
    getConfiguration: function(){
        var config = new Object();
        for( var i = 0 ; i < this.form.items.length ; i++){
            config[this.form.items.get(i).name] = this.form.items.get(i).value;
        }
        return config;
    }
});
