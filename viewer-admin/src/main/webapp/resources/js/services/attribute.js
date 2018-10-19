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

Ext.define('vieweradmin.components.Attributes', {

    extend: "Ext.ux.b3p.CrudGrid",

    config: {
        gridurl: "",
        editurl: "",
        itemname: "attributen",
        getfeaturetypesurl: ""
    },

    constructor: function(config) {
        this.initConfig(config);
        vieweradmin.components.Attributes.superclass.constructor.call(this, this.config);
        vieweradmin.components.Menu.setActiveLink('menu_attributen');
        this.addListeners();
    },

    addListeners: function() {
        var featureSourceId = Ext.get('featureSourceId');
        var simpleFeatureTypeId = Ext.get('simpleFeatureTypeId');
        featureSourceId.on('change', function() {
            this.featureSourceChange(featureSourceId);
        }, this);
        simpleFeatureTypeId.on('change', function() {
            this.simpleFeatureTypeChange(simpleFeatureTypeId);
        }, this);
        // Init with change, because a certain select value can be preselected
        this.featureSourceChange(featureSourceId);
    },

    featureSourceChange: function(featureSourceId) {
        var selectedValue = parseInt(featureSourceId.getValue());

        var simpleFeatureTypeId = document.getElementById('simpleFeatureTypeId');
        this.removeChilds(simpleFeatureTypeId);
        simpleFeatureTypeId.appendChild(this.getOption(-1, ___("Kies..."), true));

        if(selectedValue != -1) {
            Ext.Ajax.request({
                url: this.config.getfeaturetypesurl,
                scope:this,
                params: {
                    featureSourceId: selectedValue
                },
                success: function ( result, request ) {
                    result = Ext.JSON.decode(result.responseText);
                    Ext.Array.each(result, function(item) {
                        simpleFeatureTypeId.appendChild(this.getOption(item.id, item.name, false));
                    }, this);
                },
                failure: function() {
                    Ext.MessageBox.alert(i18next.t('viewer_admin_attribute_3'), i18next.t('viewer_admin_attribute_4'));
                }
            });
            var gridStore = this.getStore();
            gridStore.proxy.extraParams.featureSourceId = selectedValue;
            // Go back to page 1 and reload store
            gridStore.load({params: {
                start: 0,
                page: 1,
                limit: 10
            }});
            gridStore.loadPage(1, {limit:10});
        }
    },

    getOption: function(value, text, selected) {
        var option = document.createElement('option');
        option.value = value;
        option.innerHTML = text;
        if(selected) {
            option.selected = true;
        }
        return option;
    },

    removeChilds: function(el) {
        if (el.hasChildNodes()) {
            while (el.childNodes.length >= 1) {
                el.removeChild(el.firstChild);
            }
        }
    },

    simpleFeatureTypeChange: function(simpleFeatureTypeId) {
        var gridStore = this.getStore();
        gridStore.proxy.extraParams.simpleFeatureTypeId = simpleFeatureTypeId.getValue();
        // Go back to page 1 and reload store
        gridStore.load({params: {
            start: 0,
            page: 1,
            limit: 10
        }});
        gridStore.loadPage(1, {limit:10});
    },

    getGridColumns: function() {
        return [
            {
                id: 'alias',
                text: i18next.t('viewer_admin_attribute_0'),
                dataIndex: 'alias',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'attribute',
                text: i18next.t('viewer_admin_attribute_1'),
                dataIndex: 'attribute',
                flex: 1,
                filter: {
                    xtype: 'textfield'
                }
            },{
                id: 'type',
                text: i18next.t('viewer_admin_attribute_2'),
                dataIndex: 'type',
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
                    return Ext.String.format('<a href="#" class="editobject">' + ___("Bewerken") + '</a>');
                }
            }
        ];
    },

    getGridModel: function() {
        return [
            {name: 'id', type: 'int' },
            {name: 'alias', type: 'string'},
            {name: 'attribute', type: 'string'},
            {name: 'type', type: 'string'}
        ];
    },

    getStoreExtraParams: function() {
        return {
            simpleFeatureTypeId: -1
        }
    },

    getEditUrl: function(record) {
        return this.createUrl(this.config.editurl, { attribute: record.get('id') });
    }

});
