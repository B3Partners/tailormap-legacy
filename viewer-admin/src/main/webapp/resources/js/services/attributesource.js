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
            {name: 'status', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'url', type: 'string'},
            {name: 'protocol', type: 'string'}
        ]
    });

    var store = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'TableRow',
        remoteSort: true,
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

    var grid = Ext.create('Ext.grid.Panel', Ext.merge(defaultGridConfig, {
        id: 'editGrid',
        store: store,
        columns: [
            {
                id: 'status',
                text: "Status",
                dataIndex: 'status',
                flex: 1,
                renderer: function(value) {
                    if(value === "ok") {
                        return '<span class="status_ok">GOED</span>';
                    }
                    return '<span class="status_error">FOUT</span>';
                }
            },{
                id: 'name',
                text: "Naam",
                dataIndex: 'name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'url',
                text: "Bron URL",
                dataIndex: 'url',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'protocol',
                text: "Type",
                dataIndex: 'protocol',
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
                renderer: function(value) {
                    return Ext.String.format('<a href="' + editattributesurl + '?featureSourceId={0}">Attributen bewerken</a>', value) +
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return editObject(\'{0}\');">Bewerken</a>', value) +
                           ' | ' +
                           Ext.String.format('<a href="#" onclick="return removeObject(\'{0}\');">Verwijderen</a>', value);
                }
            }
        ],
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            displayInfo: true,
            displayMsg: 'Attribuutbron {0} - {1} of {2}',
            emptyMsg: "Geen attribuutbronnen weer te geven"
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
    Ext.get('editFrame').dom.src = editurl + '?featureSource=' + objId;
    var gridCmp = Ext.getCmp('editGrid')
    gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
    return false;
}

function removeObject(objId) {
    if(deleteConfirm()){
        // How are we going to remove items? In the iframe or directly trough ajax?
        Ext.get('editFrame').dom.src = deleteurl + '?featureSource=' + objId;
        var gridCmp = Ext.getCmp('editGrid')
        gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', objId));
        return false;
    }
}

function deleteConfirm() {
    return confirm('Weet u zeker dat u deze attribuutbron wilt verwijderen?');
}

function reloadGrid(){
    Ext.getCmp('editGrid').getStore().load();
}