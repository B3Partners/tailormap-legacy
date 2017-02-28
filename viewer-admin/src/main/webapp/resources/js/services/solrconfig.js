/* 
 * Copyright (C) 2013 B3Partners B.V.
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
    //'Ext.grid.*',
    //'Ext.data.*',
    //'Ext.util.*',
    'Ext.ux.grid.GridHeaderFilters'//,
   // 'Ext.toolbar.Paging'
]);

Ext.onReady(function(){

    Ext.define('SearchConfigTableRow', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'int' },
            {name: 'name', type: 'string'},
            {name: 'lastUpdated', type: 'string'},
            {name: 'featureSourceName', type: 'string'},
            {name: 'featureTypeName', type: 'string'}
            
        ]
    });

    var searchConfigStore = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'SearchConfigTableRow',
        remoteSort: false,
        remoteFilter: true,
        sorters: 'name',
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
        store: searchConfigStore,
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
                flex: 1,
                hideable: false,
                menuDisabled: true,
                renderer: function(value) {
                    if(solrInitialized){
                        return Ext.String.format('<a href="#" onclick="return editObject(\'{0}\');">Bewerken</a>', value) +
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return removeObject(\'{0}\');">Verwijderen</a>', value) +
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return addToIndex(\'{0}\');">Voeg toe aan index</a>', value)+
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return removeFromIndex(\'{0}\');">Verwijder uit index</a>', value);
                    }else{
                        
                        return Ext.String.format('<a href="#" onclick="return editObject(\'{0}\');">Bewerken</a>', value) +
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return removeObject(\'{0}\');">Verwijderen</a>', value);
                    }
                },
                sortable: false
            }
        ],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: searchConfigStore,
            displayInfo: true,
            displayMsg: 'Zoekbronnen {0} - {1} of {2}',
            emptyMsg: "Geen zoekbronnen weer te geven"
        }),
        plugins: [ 
            Ext.create('Ext.ux.grid.GridHeaderFilters', {
                enableTooltip: false
            })
        ],
        renderTo: 'grid-container'
    }));
    
});

function editObject(id){
    Ext.get('editFrame').dom.src = editurl + '&solrConfiguration=' + id;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', id));
    return false;
}


function removeObject(objId) {
    if(deleteConfirm()){
        Ext.get('editFrame').dom.src = deleteurl + '&solrConfiguration=' + objId;
        var gridCmp = Ext.getCmp('editGrid')
        gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
        return false;
    }
}

function deleteConfirm() {
    return confirm('Weet u zeker dat u deze configuratie wilt verwijderen?');
}

function reloadGrid(){
    Ext.getCmp('editGrid').getStore().load();
}

function addToIndex(objId){
    Ext.get('editFrame').dom.src = addToIndexUrl + '&solrConfiguration=' + objId;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
    return false;
    
}

function removeFromIndex(objId){
    Ext.get('editFrame').dom.src = removeFromIndexUrl + '&solrConfiguration=' + objId;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
    return false;
    
}