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

Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', uxpath);
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.ux.grid.GridHeaderFilters',
    'Ext.toolbar.Paging'
]);

Ext.onReady(function(){

    Ext.define('TableRow', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'string'},
            {name: 'username', type: 'string'},
            {name: 'organization', type: 'string'},
            {name: 'position', type: 'string'}
        ]
    });

    var store = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'TableRow',
        remoteSort: true,
        remoteFilter: true,
        sorters: 'username',
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: gridurl,
            reader: {
                type: 'json',
                root: 'gridrows',
                totalProperty: 'totalCount'
            },
            simpleSortMode: true
        },
        listeners: {
            load: function() {
                // Fix to apply filters
                Ext.getCmp('editGrid').doLayout();
            }
        }
    });

    var grid = Ext.create('Ext.grid.Panel', Ext.merge(vieweradmin.components.DefaultConfgurations.getDefaultGridConfig(), {
        id: 'editGrid',
        store: store,
        columns: [
            {
                id: 'username',
                text: "Naam",
                dataIndex: 'username',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'organization',
                text: "Organisatie",
                dataIndex: 'organization',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                },
                sortable: false
            },{
                id: 'position',
                text: "Functie",
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
                flex: 1,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: function(value) {
                    return Ext.String.format('<a href="#" onclick="return editObject(\'{0}\');">Bewerken</a>', Ext.String.escape(value)) +
                           ' | ' +
                            Ext.String.format('<a href="#" onclick="return removeObject(\'{0}\');">Verwijderen</a>', Ext.String.escape(value));
                },
                sortable: false
            }
        ],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true,
            displayMsg: 'Gebruikers {0} - {1} of {2}',
            emptyMsg: "Geen gebruikers weer te geven"
        }),
        plugins: [ 
            Ext.create('Ext.ux.grid.GridHeaderFilters', {
                enableTooltip: false
            })
        ],
        renderTo: 'grid-container'
    }));
    
});



function editObject(objId) {
    Ext.get('editFrame').dom.src = editurl + '?user=' + objId;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
    return false;
}

function removeObject(objId) {
    if(deleteConfirm()){
        // How are we going to remove items? In the iframe or directly trough ajax?
        Ext.get('editFrame').dom.src = deleteurl + '?user=' + objId;
        var gridCmp = Ext.getCmp('editGrid')
        gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
        return false;
    }
}

function deleteConfirm() {
    return confirm('Weet u zeker dat u deze gebruiker wilt verwijderen?');
}

function reloadGrid(){
    Ext.getCmp('editGrid').getStore().load();
}