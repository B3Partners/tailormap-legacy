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
 * Custom configuration object for LayerSwitch configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    constructor: function (parentId, configObject, configPage) {
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        var me = this;
        
        var alignmentStore = Ext.create('Ext.data.ArrayStore', {
            autoDestroy: true,
            idIndex: 0,
            fields: [{
                name: 'name',
                type: 'string'
            }, {
                name: 'value',
                type: 'string'
            }],
            data: [
                ['Links-boven', 'tl'],
                ['Rechts-boven', 'tr'],
                ['Links-onder', 'bl'],
                ['Rechts-onder', 'br']
            ]
        });
        
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
                fieldLabel: 'Top/bottom positie',
                name: 'top',
                value: this.configObject.top || '5',
                labelWidth:me.labelWidth
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Linker/rechter positie',
                name: 'left',
                value: this.configObject.left || '5',
                labelWidth:me.labelWidth
            },
            { 
                xtype: 'combobox',
                fieldLabel: 'Uitlijning',
                name: 'alignposition',
                value: this.configObject.alignposition || 'tl',
                labelWidth: me.labelWidth,
                store: alignmentStore,
                displayField: 'name',
                valueField: 'value',
                queryMode: 'local'
            }],
            renderTo: parentId
        });
        return this;
    },
    getConfiguration: function(){
        var config = new Object();
        for( var i = 0 ; i < this.form.items.length ; i++){
            config[this.form.items.get(i).name] = this.form.items.get(i).value;
        }
        return config;
    }
});