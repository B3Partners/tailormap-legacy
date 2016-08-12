/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

Ext.define('vieweradmin.components.Document', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "documenten"
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.Document.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_documenten');
    },

    getGridColumns: function() {
        return [
            {
                id: 'name',
                text: "Naam",
                dataIndex: 'name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'category',
                text: "Rubriek",
                dataIndex: 'category',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'url',
                text: "Document URL",
                dataIndex: 'url',
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
                renderer: function(value) {
                    return [
                        Ext.String.format('<a href="#" class="editobject">Bewerken</a>'),
                        Ext.String.format('<a href="#" class="removeobject">Verwijderen</a>')
                    ].join(" | ");
                }
            }
        ];
    },

    getGridModel: function() {
        return [
            {name: 'id', type: 'int' },
            {name: 'name', type: 'string'},
            {name: 'category', type: 'string'},
            {name: 'url', type: 'string'}
        ];
    },

    removeConfirmMessage: function(record) {
        return ["Weet u zeker dat u het document ", record.get("name"), " wilt verwijderen?"].join("");
    },

    getEditUrl: function(record) {
        return this.createUrl(this.config.editurl, { document: record.get('id') });
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { document: record.get('id') });
    }

});