/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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

/* global Ext */

Ext.define('vieweradmin.components.Bookmark', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "bookmarks"
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.Bookmark.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_bookmarks');
    },

    getGridColumns: function() {
        return [
            {
                id: 'applicationname',
                text: i18next.t('viewer_admin_bookmark_0'),
                dataIndex: 'application.name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'code',
                text: i18next.t('viewer_admin_bookmark_1'),
                dataIndex: 'code',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            }, {
                id: 'createdAt',
                text: i18next.t('viewer_admin_bookmark_2'),
                dataIndex: 'createdAt',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'edit',
                header: '',
                dataIndex: 'id',
                width: 100,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: function(value) {
                    return [
                        Ext.String.format('<a href="#" class="removeobject">' + i18next.t('viewer_admin_bookmark_3') + '</a>')
                    ].join(" | ");
                }
            }
        ];
    },

    getGridModel: function() {
        return [
            {name: 'id', type: 'int'},
            {name: 'application.name', type: 'string'},
            {name: 'code', type: 'string'},
            {name: 'createdAt', type: 'string'}
        ];
    },

    removeConfirmMessage: function(record) {
        return i18next.t('viewer_admin_bookmark_4', {name:record.get("application.name")});
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { bookmark: record.get('id') });
    }

});