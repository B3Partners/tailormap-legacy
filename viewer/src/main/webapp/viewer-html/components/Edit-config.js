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
Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null) {
            configObject = {};
        }
        configObject.showLabelconfig = true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.createCheckBoxes(this.configObject.layers, {editable: true});

        this.form.add([
            {
                xtype: 'numberfield',
                fieldLabel: 'Klik nauwkeurigheid',
                name: 'clickRadius',
                value: this.configObject.clickRadius !== undefined ? this.configObject.clickRadius : 4,
                labelWidth: this.labelWidth,
                style: {
                    marginRight: "70px"
                }
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Bewerken toestaan',
                name: 'allowEdit',
                value: this.configObject.allowEdit !== undefined ? this.configObject.allowEdit : true,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Verwijderen toestaan',
                name: 'allowDelete',
                value: this.configObject.allowDelete !== undefined ? this.configObject.allowDelete : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Kopiëren toestaan',
                name: 'allowCopy',
                value: this.configObject.allowCopy !== undefined ? this.configObject.allowCopy : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Nieuw toestaan',
                name: 'allowNew',
                value: this.configObject.allowNew !== undefined ? this.configObject.allowNew : true,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Link toevoegen in Feature Info',
                name: 'showEditLinkInFeatureInfo',
                value: this.configObject.showEditLinkInFeatureInfo !== undefined ? this.configObject.showEditLinkInFeatureInfo : false,
                labelWidth: this.labelWidth
            }
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 400,
                minHeight: 250
            }
        };
    }
});

