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

Ext.define('vieweradmin.components.Group', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "groepen"
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.Group.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_gebruikersgroepen');
    },

    getGridColumns: function() {
        return [
            {
                id: 'name',
                text: i18next.t('viewer_admin_group_0'),
                dataIndex: 'name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'description',
                text: i18next.t('viewer_admin_group_1'),
                dataIndex: 'description',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                },
                sortable: false
            },{
                id: 'edit',
                header: '',
                dataIndex: 'id',
                width: 200,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: function(value, obj, record) {
                    if(!record.get('editable')) {
                        return 'Deze groep mag niet worden bewerkt of verwijderd';
                    }
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
            {name: 'name', type: 'string'},
            {name: 'description', type: 'string'},
            {name: 'editable', type: 'boolean'}
        ];
    },

    removeConfirmMessage: function(record) {
        return ["Weet u zeker dat u de groep ", record.get("name"), " wilt verwijderen?"].join("");
    },

    getEditUrl: function(record) {
        return this.createUrl(this.config.editurl, { group: record.get('name') });
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { group: record.get('name') });
    }

});