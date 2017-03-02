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

Ext.define('vieweradmin.components.ChooseApplication', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        deleteurl: "",
        itemname: "applicaties",
        setDefaultApplication: ""
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.ChooseApplication.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_kiesapplicatie');
        this.convertDefaultApplicationSelect();
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
            }, {
                id: 'published',
                text: "Gepubliceerd",
                dataIndex: 'published',
                width: 120,
                filter: {
                    xtype: 'textfield'
                }
            }, {
                id: 'mashup',
                text: "Mashup",
                dataIndex: 'mashup',
                width: 120,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'motherapplication',
                text: "Moederapplicatie",
                dataIndex: 'motherapplication',
                width: 200,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'owner',
                text: "Eigenaar",
                dataIndex: 'owner',
                width: 160,
                filter: {
                    xtype: 'textfield'
                }
            }, {
                id: 'edit',
                header: '',
                dataIndex: 'id',
                width: 375,
                sortable: false,
                hideable: false,
                menuDisabled: true,
                renderer: (function (value, metadata, record) {
                    return [
                        Ext.String.format('<a href="{0}/app/{1}{2}" target="_new">Open viewer</a>', record.get('baseUrl'), record.get('baseName'), (record.get('version') ? '/v' + record.get('version') : '')),
                        Ext.String.format('<a href="#" class="makeworkversion">Maak werkversie</a>', value),
                        Ext.String.format('<a href="{0}&application={1}">Activeren</a>', this.config.editurl, value),
                        Ext.String.format('<a href="#" class="removeobject">Verwijderen</a>', value)
                    ].join(" | ");
                }).bind(this)
            }
        ];
    },

    cellClickListener: function(e, target, record) {
        if (target.className.indexOf("makeworkversion") !== -1) {
            e.preventDefault();
            this.makeWorkVersion(record);
        }
    },

    getGridModel: function() {
        return [
            {name: 'id', type: 'int' },
            {name: 'name', type: 'string'},
            {name: 'published', type: 'string'},
            {name: 'mashup', type: 'string'},
            {name: 'motherapplication', type: 'string'},
            {name: 'owner', type: 'string'}
        ];
    },

    removeConfirmMessage: function(record) {
        return ["Weet u zeker dat u de applicatie ", record.get("name"), " wilt verwijderen?"].join("");
    },

    getRemoveUrl: function(record) {
        return this.createUrl(this.config.deleteurl, { applicationToDelete: record.get('id') });
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

    convertDefaultApplicationSelect: function() {
        var values = [];
        var defaultAppSelect = document.getElementById("defaultAppSelector");
        defaultAppSelect.style.display = 'none';
        for(var i = 0; i < defaultAppSelect.options.length; i++) {
            values.push({
                value: defaultAppSelect.options[i].value,
                label: defaultAppSelect.options[i].innerHTML
            });
        }
        var applications = Ext.create('Ext.data.Store', {
            fields: ['value', 'label'],
            data : values
        });
        Ext.create('Ext.container.Container',{
            renderTo: defaultAppSelect.parentNode,
            padding: '20 0 10 0',
            style: {
                color: '#666666'
            },
            html: 'Kies hieronder de standaard applicatie. Deze applicatie wordt geladen wanneer er bij de viewer geen applicatie wordt meegegeven.'
        });
        Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Standaard applicatie',
            store: applications,
            queryMode: 'local',
            displayField: 'label',
            valueField: 'value',
            value: defaultAppSelect.value,
            renderTo: defaultAppSelect.parentNode,
            labelWidth: 150,
            width: 375,
            listeners: {
                change: {
                    fn: function(combo, newvalue) {
                        combo.setLoading("Standaard applicatie opslaan");
                        this.defaultApplicationChanged(combo, applications.findRecord("value", newvalue));
                    },
                    scope: this
                }
            }
        });
    },
    
    defaultApplicationChanged: function (combobox, application) {
        var defaultApp, appLabel;
        if (application === null) {
            defaultApp = null;
            appLabel = 'uitgezet'
        } else {
            defaultApp = application.get('value');
            appLabel = ': "' + application.get('label') + '"';
        }
        Ext.Ajax.request({
            url: this.config.setDefaultApplication,
            params: {
                defaultApplication: defaultApp
            },
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                combobox.setLoading(false);
                if(!response.success) {
                    Ext.Msg.alert('Fout bij opslaan', 'Er is iets fout gegaan bij het opslaan van de standaard applicatie. Probeer opnieuw.');
                } else {
                    Ext.Msg.alert('Standaard applicatie opgeslagen', 'De standaard applicatie is opgeslagen. De standaard applicatie is nu' + appLabel);
                }
            },
            failure: function(result) {
                combobox.setLoading(false);
                Ext.Msg.alert('Fout bij opslaan', 'Er is iets fout gegaan bij het opslaan van de standaard applicatie. Probeer opnieuw.');
            }
        });
    }

});