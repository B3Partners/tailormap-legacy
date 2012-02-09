/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
        var labelWidth = 300;
        this.form = new Ext.form.FormPanel({
            url: 'Home/SubmitForm',
            frame: false,
            title: 'Configureer dit component',
            width: 480,
            items: [{ 
                xtype: 'textfield',
                fieldLabel: 'Naam',
                name: 'title',
                value: config.title,
                labelWidth:labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kaarten en kaartlaaggroepen krijgen een vinkvak',
                inputValue: true,
                name: 'groupCheck',
                checked: config.groupCheck,
                value: config.groupCheck,
                labelWidth:labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Kaartlagen krijgen een vinkvak',
                inputValue: true,
                name: 'layersChecked',
                checked: config.layersChecked,
                value: config.layersChecked,
                labelWidth:labelWidth
            },{
                xtype: 'checkbox',
                fieldLabel: 'Achtergrondkaarten tonen',
                inputValue: true,
                name: 'showBaselayers',
                checked: config.showBaselayers,
                value: config.showBaselayers,
                labelWidth:labelWidth
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
