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
/**
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.ConfigObject",
    constructor: function (parentid,config){
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentid,config);
        if(config === null) config = {};
        var me = this;
        this.form = new Ext.form.FormPanel({
            frame: false,
            bodyPadding: me.formPadding,
            width: me.formWidth,
            defaultType: 'textfield',
            items: [{
                fieldLabel: 'Titel',
                name: 'title',
                value: config.title !== null && config.title !== undefined ? config.title : "Titel",
                labelWidth: me.labelWidth,
                width: 500
            },{
                fieldLabel: 'Marge',
                name: 'margin',
                value: config.margin || "3px 0 3px 0",
                labelWidth: me.labelWidth,
                width: 400
            },{
                fieldLabel: 'Padding',
                name: 'padding',
                value: config.padding || "5px",
                labelWidth: me.labelWidth,
                width: 400
            },{
                xtype: 'colorfield',
                fieldLabel: 'Kleur',
                name: 'backgroundColor',
                value: config.backgroundColor || "transparent",
                labelWidth: me.labelWidth
            },{
                fieldLabel: 'Dikte van rand',
                name: 'border',
                value: config.border || "1px 0 1px 0",
                labelWidth: me.labelWidth,
                width: 400
            },{
                xtype: 'colorfield',
                fieldLabel: 'Kleur van rand',
                name: 'borderColor',
                value: config.borderColor || "D0D0D0",
                labelWidth: me.labelWidth
            },{
                xtype: 'colorfield',
                fieldLabel: 'Tekstkleur',
                name: 'textColor',
                value: config.textColor || "000000",
                labelWidth: me.labelWidth
            },{
                xtype: "combo",
                fields: ['value', 'text'],
                value: config.fontWeight || "bold",
                name: "fontWeight",
                fieldLabel: "Tekst opmaak",
                labelWidth: me.labelWidth,
                store: [
                    ["normal", "Normaal"],
                    ["bold", "Vet gedrukt"]
                ],
                width : 400
            }],
            renderTo: this.parentId
        });

        return this;
    }
});