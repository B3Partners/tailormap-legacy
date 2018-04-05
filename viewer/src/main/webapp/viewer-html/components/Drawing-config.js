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
 * Custom configuration object for HTML configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.form.add({ 
                xtype: 'colorfield',
                fieldLabel: 'Kleur',
                name: 'color',
                value: this.configObject.color,
                labelWidth:this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Heractiveer de vorige tools',
                name: 'reactivateTools',
                value: this.configObject.reactivateTools !== undefined ? this.configObject.reactivateTools : false,
                labelWidth: this.labelWidth
            });
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 340,
                minHeight: 500
            }
        };
    }
});

