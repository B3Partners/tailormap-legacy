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

Ext.define('vieweradmin.components.User', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "gebruikers"
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.User.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_gebruikers');
    },

    getGridColumns: function() {
        return [
            {
                id: 'username',
                text: i18next.t('viewer_admin_user_0'),
                dataIndex: 'username',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'organization',
                text: i18next.t('viewer_admin_user_1'),
                dataIndex: 'organization',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                },
                sortable: false
            },{
                id: 'position',
                text: i18next.t('viewer_admin_user_2'),
                dataIndex: 'position',
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
            {name: 'id', type: 'string'},
            {name: 'username', type: 'string'},
            {name: 'organization', type: 'string'},
            {name: 'position', type: 'string'}
        ];
    },

    removeConfirmMessage: function(record) {
        return ["Weet u zeker dat u de gebruiker ", record.get("username"), " wilt verwijderen?"].join("");
    },

    getEditUrl: function(record) {
        return this.createUrl(this.config.editurl, { user: record.get('id') });
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { user: record.get('id') });
    }

});