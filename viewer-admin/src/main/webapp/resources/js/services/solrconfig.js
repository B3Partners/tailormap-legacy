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

Ext.define('vieweradmin.components.SolrConfig', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "zoekbronnen",
        solrInitialized: false,
        addtoindexurl: "",
        removefromindexurl: ""
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.SolrConfig.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_solrconfig');
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
                id: 'featureSourceName',
                text: "Bronnaam",
                dataIndex: 'featureSourceName',
                flex: 1
            },{
                id: 'lastUpdated',
                text: "Laatst geüpdatet",
                dataIndex: 'lastUpdated',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'edit',
                header: '',
                dataIndex: 'id',
                width: 300,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: (function(value) {
                    var links = [
                        Ext.String.format('<a href="#" class="editobject">Bewerken</a>'),
                        Ext.String.format('<a href="#" class="removeobject">Verwijderen</a>')
                    ];
                    if(this.config.solrInitialized) {
                        links.push(
                            Ext.String.format('<a href="#" class="addtoindex">Voeg toe aan index</a>', value),
                            Ext.String.format('<a href="#" class="removefromindex">Verwijder uit index</a>', value)
                        );
                    }
                    return links.join(" | ");


                }).bind(this)
            }
        ];
    },

    cellClickListener: function(e, target, record) {
        if (target.className.indexOf("addtoindex") !== -1) {
            e.preventDefault();
            this.addToIndex(record);
        }
        if (target.className.indexOf("removefromindex") !== -1) {
            e.preventDefault();
            this.removeFromIndex(record);
        }
    },

    getGridModel: function() {
        return [
            {name: 'id', type: 'int' },
            {name: 'name', type: 'string'},
            {name: 'lastUpdated', type: 'string'},
            {name: 'featureSourceName', type: 'string'},
            {name: 'featureTypeName', type: 'string'}
        ];
    },

    removeConfirmMessage: function(record) {
        return ["Weet u zeker dat u de configuratie ", record.get("name"), " wilt verwijderen?"].join("");
    },

    getEditUrl: function(record) {
        return this.createUrl(this.config.editurl, { solrConfiguration: record.get('id') });
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { solrConfiguration: record.get('id') });
    },

    addToIndex: function (record){
        Ext.get('editFrame').dom.src = this.createUrl(this.config.addtoindexurl, { solrConfiguration: record.get('id') });
        this.grid.getSelectionModel().select(record);
        return false;

    },

    removeFromIndex: function (record){
        Ext.get('editFrame').dom.src = this.createUrl(this.config.removefromindexurl, { solrConfiguration: record.get('id') });
        this.grid.getSelectionModel().select(record);
        return false;

    }

});