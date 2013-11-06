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
 * Custom configuration object for Buffer configuration
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId,configObject){
        if (configObject === null){
            configObject = {};
        }
        this.labelWidth=200;
        configObject.showLabelconfig =true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectGroups !== undefined ? configObject.selectGroups : true,
            name: "selectGroups",
            fieldLabel: "Kaarten selecteren",
            labelWidth: this.labelWidth,
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectLayers !== undefined ? configObject.selectLayers : true,
            name: "selectLayers",
            labelWidth: this.labelWidth,
            fieldLabel: "Kaartlagen selecteren",
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectOwnServices !== undefined ? configObject.selectOwnServices : true,
            name: "selectOwnServices",
            labelWidth: this.labelWidth,
            fieldLabel: "Eigen services selecteren",
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
        this.form.add({
            xtype: "combo",
            fields: ['value', 'text'],
            value: configObject.selectCsw !== undefined ? configObject.selectCsw : true,
            name: "selectCsw",
            labelWidth: this.labelWidth,
            fieldLabel: "CSW service doorzoeken",
            store: [
                [true, "Ja"],
                [false, "Nee"]
            ]
        });
    }
});

