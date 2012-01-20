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

// bouw van componentspecifieke configuratievelden
var form;
function ConfigSource(parentId, config){
    if(config === undefined){
        config = new Object();
    }
    form = new Ext.form.FormPanel({ //(1)
        renderTo: parentId, //(2)
        url: 'Home/SubmitForm',
        frame: false,
        title: 'Configureer dit component',
        width: 300,
        items: [{ //(3)
            xtype: 'textfield',
            fieldLabel: 'Naam',
            name: 'naam',
            value: config.naam
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Nummer',
            name: 'nummer',
            value: config.nummer
        }]
    });
        
}

function getConfig() {
    var config = {
        id: componentData.id,
        name: componentData.name,
        containerID: componentData.region,
        className: componentData.className,
        jsonConfig : form.getValues()
    };
    
    var configFormObject = Ext.get("configObject");
    configFormObject.dom.value = JSON.stringify( config);
}
