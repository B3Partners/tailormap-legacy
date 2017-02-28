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
            {name: 'name', type: 'string'},
            {name: 'description', type: 'string'},
            {name: 'editable', type: 'boolean'}
        ]
    });

    var store = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'TableRow',
        remoteSort: true,
        remoteFilter: true,
        sorters: 'name',
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
                id: 'name',
                text: "Naam",
                dataIndex: 'name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'description',
                text: "Extra informatie",
                dataIndex: 'description',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                },
                sortable: false
            },{
                id: 'edit',
                header: '',
                dataIndex: 'name',
                flex: 1,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: function(value, obj, rec) {
                    if(rec.get('editable')) {
                        return Ext.String.format('<a href="#" onclick="return editObject(\'{0}\');">Bewerken</a>', Ext.String.escape(value)) +
                               ' | ' +
                                Ext.String.format('<a href="#" onclick="return removeObject(\'{0}\');">Verwijderen</a>', Ext.String.escape(value));
                    }
                    return 'Deze groep mag niet worden bewerkt of verwijderd';
                }
            }
        ],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true,
            displayMsg: 'Groep {0} - {1} of {2}',
            emptyMsg: "Geen groepen weer te geven"
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
    Ext.get('editFrame').dom.src = editurl + '?group=' + objId;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
    return false;
}

function removeObject(objId) {
    if(deleteConfirm()){
        // How are we going to remove items? In the iframe or directly trough ajax?
        Ext.get('editFrame').dom.src = deleteurl + '?group=' + objId;
        var gridCmp = Ext.getCmp('editGrid')
        gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
        return false;
    }
}

function deleteConfirm() {
    return confirm('Weet u zeker dat u deze groep wilt verwijderen?');
}

function reloadGrid(){
    Ext.getCmp('editGrid').getStore().load();
}
