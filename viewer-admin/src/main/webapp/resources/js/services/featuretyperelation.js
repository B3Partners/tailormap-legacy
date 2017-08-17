/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
Ext.define('vieweradmin.components.FeaturetypeRelation', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "relaties",
        editattributesurl: ""
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.FeaturetypeRelation.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_relation');
    },

    getGridColumns: function() {
        return [
            {
                id: 'featuretype',
                text: "Feature type",
                dataIndex: 'featuretype',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'foreignFeaturetype',
                text: "In relatie met",
                dataIndex: 'foreignFeaturetype',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'edit',
                header: '',
                dataIndex: 'id',
                width: 200,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: (function(value) {
                    return [
                        Ext.String.format('<a href="#" class="editobject">Bewerken</a>'),
                        Ext.String.format('<a href="#" class="removeobject">Verwijderen</a>')
                    ].join(" | ");
                }).bind(this)
            }
        ];
    },

    getGridModel: function() {
        return [
            {name: 'id', type: 'int' },
            {name: 'featuretype', type: 'string'},
            {name: 'foreignFeaturetype', type: 'string'}
        ];
    },

    removeConfirmMessage: function(record) {
        return ["Weet u zeker dat u deze relatie wilt verwijderen?"].join("");
    },

    getEditUrl: function(record) {
        return this.createUrl(this.config.editurl, { relation: record.get('id') });
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { relation: record.get('id') });
    }

});