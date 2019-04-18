/* 
 * Copyright (C) 2018 B3Partners B.V.
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

Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
     constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.addForm(configObject);
        var types = configObject.types;
        if(types){
            for (var i = 0; i < types.length; i++) {
                this.createRow(types[i]);
            }
        }
    },
    addForm: function() {
        this.form.add({ 
                xtype: 'textfield',
                fieldLabel: "URL", //i18next.t('downloadwkt_config_0'),
                name: 'url',
                value: this.configObject.url,
                labelWidth:this.labelWidth,
                width:700
            },{ 
                xtype: 'textarea',
                fieldLabel: "Style", //i18next.t('downloadwkt_config_0'),
                name: 'style',
                value: this.configObject.style,
                labelWidth:this.labelWidth,
                width:700
            });
    }/*,
    
    getConfiguration: function(){
        var config = viewer.components.CustomConfiguration.superclass.getConfiguration.call(this);
        var values = this.form.getForm().getValues();
        var labels = values.label;
        var types = values.type;
        if(types.constructor !== Array){
            types = [values.type];
            labels = [values.label];
        }
        
        var typeconfigs = [];
        config.types = typeconfigs;
        for(var i = 0 ; i < types.length ;i++){
            typeconfigs.push({
                type: types[i],
                label: labels[i]
            });
        }
        return config;
    }*/
});