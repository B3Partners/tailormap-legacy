/* 
 * Copyright (C) 2012-2016 B3Partners B.V.
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

Ext.define('vieweradmin.components.ChooseApplication', {

    requires: [
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.util.*',
        'Ext.ux.grid.GridHeaderFilters',
        'Ext.toolbar.Paging'
    ],

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        setDefaultApplication: ""
    },

    grid: null,

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.Menu.setActiveLink('menu_kiesapplicatie');
        this.grid = this.createGrid();
    },

    createGrid: function() {
        var store = this.getStore();
        return Ext.create('Ext.grid.Panel', Ext.merge(vieweradmin.components.DefaultConfgurations.getDefaultGridConfig(), {
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
                    renderer: (function(value, metadata, record) {
                        return [
                            Ext.String.format('<a href="{0}/app/{1}{2}" target="_new">Open viewer</a>', record.get('baseUrl'), record.get('baseName'), (record.get('version') ? '/v' + record.get('version') : '')),
                            Ext.String.format('<a href="#" class="makeworkversion">Maak werkversie</a>', value),
                            Ext.String.format('<a href="{0}&application={1}">Activeren</a>', this.config.editurl, value),
                            Ext.String.format('<a href="#" class="removeobject">Verwijderen</a>', value)
                        ].join(" | ");
                    }).bind(this)
                }
            ],
            listeners: {
                cellclick: {
                    fn: function(grid, td, cellIndex, record, tr, rowIndex, e) {
                        var target = e.getTarget();
                        if(!target || !target.className) {
                            return;
                        }
                        if(target.className.indexOf("makeworkversion") !== -1) {
                            e.preventDefault();
                            this.makeWorkVersion(record);
                        }
                        if(target.className.indexOf("removeobject") !== -1) {
                            e.preventDefault();
                            this.removeObject(record);
                        }
                    },
                    scope: this
                }
            },
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
    },

    getStore: function() {
        Ext.define('TableRow', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'id', type: 'int' },
                {name: 'name', type: 'string'},
                {name: 'published', type: 'string'},
                {name: 'owner', type: 'string'}
            ]
        });
        return Ext.create('Ext.data.Store', {
            pageSize: 10,
            model: 'TableRow',
            remoteSort: true,
            remoteFilter: true,
            sorters: 'name',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: this.config.gridurl,
                reader: {
                    type: 'json',
                    root: 'gridrows',
                    totalProperty: 'totalCount'
                },
                simpleSortMode: true
            },
            listeners: {
                load: {
                    fn: function () {
                        this.grid.doLayout(); // Fix to apply filters
                    },
                    scope: this
                }
            }
        });
    },

    removeObject: function(record) {
        Ext.MessageBox.show({
            title: "Bevestiging",
            msg: "Weet u zeker dat u de applicatie " + record.get("name") + " wilt verwijderen?",
            buttons: Ext.MessageBox.OKCANCEL,
            fn: function(btn){
                if(btn === 'ok') {
                    Ext.get('editFrame').dom.src = this.config.deleteurl + '?applicationToDelete=' + record.get('id');
                    this.grid.getSelectionModel().select(record);
                }
            },
            scope: this
        });

        return false;
    },

    makeWorkVersion: function(record){
        Ext.MessageBox.show({
            title: 'Werkversie applicatie',
            msg: 'Versietoevoeging:',
            buttons: Ext.MessageBox.OKCANCEL,
            prompt: true,
            fn: function(btn, text){
                if(btn === 'ok' && text){
                    var frm = document.forms[0];
                    frm.name.value = record.get("name");
                    frm.applicationWorkversion.value=record.get("id");
                    frm.version.value=text;
                    frm.action = "makeWorkVersion";
                    frm.submit();
                }
            }
        });
        return false;
    },

    reloadGrid: function(){
        Ext.getCmp('editGrid').getStore().load();
    },

    removeActiveAppMenu: function() {
        var a = document.getElementById("activeAppMenu");
        if(a) {
            Ext.removeNode(a);
        }
    },
    
    defaultApplicationChanged : function(form){
        var id = form.value;
        // call to backendsetDefaultApplication
         Ext.Ajax.request({
            url: this.config.setDefaultApplication,
            params: {
                application: id
            },
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                // handle success (check for response.success === true
            },
            failure: function(result) {
               // Handle errors
            }
        });
    }

});