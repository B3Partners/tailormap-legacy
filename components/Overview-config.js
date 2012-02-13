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
            items: [{ 
                xtype: 'textfield',
                fieldLabel: 'Tooltip',
                name: 'tooltip',
                value: config.tooltip,
                labelWidth:me.labelWidth
            },{
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
                    inputValue: 'poup' , 
                    checked: true
                },
                {
                    boxLabel: 'Toon overzichtskaart als vak in kaart', 
                    name: 'position', 
                    inputValue: 'inmap'                  
                }
                ]
            },
            {
                xtype: "label",
                text: "Breedte",
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
    },
    /**
     * Must return the configuration that is set by the user.
     * 
     */
    getConfiguration: function(){
        var config=viewer.components.CustomConfiguration.superclass.getConfiguration.call(this); 
        for( var i = 0 ; i < this.form.items.length ; i++){
            //if its a radiogroup get the values with the function and apply the values to the config.
            if ("container"==this.form.items.get(i).xtype){
                var c = this.form.items.get(i);
                for( var j = 0 ; j < c.items.length ; j ++){
                    var cname = c.items.get(j).name;
                    var cval = c.items.get(j).value;
                    config[cname] = cval;
                }
            }
        }
        return config;
    }
            
});