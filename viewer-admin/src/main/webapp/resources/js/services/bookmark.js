
Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', uxpath);
Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.ux.grid.GridHeaderFilters',
    'Ext.toolbar.Paging'
]);

Ext.onReady(function () {

    Ext.define('TableRow', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'int'},
            {name: 'application.name', type: 'string'},
            {name: 'createdAt', type: 'string'}
        ]
    });

    var store = Ext.create('Ext.data.Store', {
        pageSize: 10,
        model: 'TableRow',
        remoteSort: true,
        remoteFilter: true,
        sorters: 'id',
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
            load: function () {
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
                id: 'applicationname',
                text: "Applicatie",
                dataIndex: 'application.name',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            }, {
                id: 'createdAt',
                text: "Datum",
                dataIndex: 'createdAt',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            }, {
                id: 'delete',
                header: '',
                dataIndex: 'id',
                flex: 1,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: function (value, style, row) {
                    return Ext.String.format('<a href="#" onclick="return deleteBookmark({0});">Verwijderen</a>', value);
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


function reloadGrid() {
    Ext.getCmp('editGrid').getStore().load();
}

function deleteBookmark(id) {
    var appRecord = Ext.getCmp('editGrid').store.getById(id);
    Ext.MessageBox.show({
        title: "Bevestiging",
        msg: "Weet u zeker dat u de bookmark voor applicatie " + appRecord.get("application.name") + " wilt verwijderen?",
        buttons: Ext.MessageBox.OKCANCEL,
        fn: function (btn) {
            if (btn == 'ok') {
                 Ext.get('editFrame').dom.src = deleteurl + '&bookmark=' + id;
                //document.location.href = deleteurl + '&bookmark=' + id;
                var gridCmp = Ext.getCmp('editGrid')
                gridCmp.getSelectionModel().select(gridCmp.getStore().find('id', id));
            }
        }
    });

    return false;
}