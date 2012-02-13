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
 * Abstract selection window configuration file.
 * Creates a form that is used for most of the selection windows.
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.SelectionWindowConfig",{
    extend: "viewer.components.ConfigObject",
    form: null,
    constructor: function (parentId,configObject){
        viewer.components.SelectionWindowConfig.superclass.constructor.call(this, parentId,configObject);        
        //Create the form.              
        this.createForm(this.configObject);        
        //this.createCheckBoxes(this.configObject.layers);*/
    },
    createForm: function(config){
        //to make this accessible in object
        var me=this;
        this.form=new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            defaults: {
                anchor: '100%'
            },
            items: [{ 
                xtype: 'textfield',
                fieldLabel: 'Titel',
                name: 'title',
                value: config.title,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Titelbalk icoon',
                name: 'iconUrl',
                value: config.iconUrl,
                labelWidth:me.labelWidth
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Tooltip',
                name: 'tooltip',
                value: config.tooltip,
                labelWidth:me.labelWidth
            }],
            renderTo: this.parentId//(2)
        });     
    },
       
    getConfiguration: function(){
        var config=viewer.components.SelectionWindowConfig.superclass.getConfiguration.call(this);
        for( var i = 0 ; i < this.form.items.length ; i++){
            config[this.form.items.get(i).name] = this.form.items.get(i).value;
        }
        return config;
    }
});

