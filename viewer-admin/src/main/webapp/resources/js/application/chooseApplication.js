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
            {name: 'id', type: 'int' },
            {name: 'name', type: 'string'},
            {name: 'published', type: 'string'},
            {name: 'owner', type: 'string'}
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

    var grid = Ext.create('Ext.grid.Panel', Ext.merge(defaultGridConfig, {
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
                id: 'published',
                text: "Gepubliceerd",
                dataIndex: 'published',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'owner',
                text: "Eigenaar",
                dataIndex: 'owner',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'edit',
                header: '',
                dataIndex: 'id',
                flex: 1,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: function(value, style, row) {
                    return Ext.String.format('<a href="#" onclick="return makeWorkVersion({0});">Maak werkversie</a>', value)                   
                        + " | " + Ext.String.format('<a href="'+ editurl + '&application=' +'{0} ">Activeren</a>', value) +
                            ' | ' +
                            Ext.String.format('<a href="#" onclick="return removeObject({0});">Verwijderen</a>', value);
                }
            }
        ],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true,
            displayMsg: 'Applicaties {0} - {1} of {2}',
            emptyMsg: "Geen applicaties weer te geven"
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
    Ext.get('editFrame').dom.src = editurl + '?application=' + objId;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
    return false;
}

function removeObject(objId) {
    var appRecord = Ext.getCmp('editGrid').store.getById(objId);
    
    Ext.MessageBox.show({
        title: "Bevestiging",
        msg: "Weet u zeker dat u de applicatie " + appRecord.get("name") + " wilt verwijderen?",
        buttons: Ext.MessageBox.OKCANCEL,
        fn: function(btn){
            if(btn=='ok'){
                Ext.get('editFrame').dom.src = deleteurl + '?applicationToDelete=' + objId;
                var gridCmp = Ext.getCmp('editGrid')
                gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
            }
        }
    });  

    return false;
}

function makeWorkVersion(objId){     
    var appRecord = Ext.getCmp('editGrid').store.getById(objId);
    Ext.MessageBox.show({
        title: 'Werkversie applicatie',
        msg: 'Versietoevoeging:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt:true,
        fn: function(btn, text){
            if(btn=='ok' && text){
                var frm = document.forms[0];
                frm.name.value = appRecord.get("name");
                frm.applicationWorkversion.value=objId;
                frm.version.value=text;
                frm.action = "makeWorkVersion";
                frm.submit();
            }
        }
    });  
    return false;
}

function reloadGrid(){
Ext.getCmp('editGrid').getStore().load();
}