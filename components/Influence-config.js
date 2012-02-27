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
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    constructor: function (parentId,configObject){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);        
        this.form.add([{
            xtype: "label",
            text: "Zoekingang",
            style: "font-weight: bold;"
        },{
            xtype: 'textfield',
            fieldLabel: 'Naam',
            name: 'searchName',
            value: (configObject != null && configObject.searchName != undefined) ? configObject.searchName : '',
            labelWidth:this.labelWidth
        },
        { 
            xtype: 'textfield',
            fieldLabel: 'URL',
            name: 'searchUrl',
            value: (configObject != null && configObject.searchUrl != undefined) ? configObject.searchUrl : '',
            columnWidth : 0.5,
            labelWidth:this.labelWidth
        }]
        );
        if(configObject != null) {
            this.createCheckBoxes(configObject.layers,{
                "influence" :true
            });
        }
    }
});

