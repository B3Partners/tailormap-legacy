/* 
 * Copyright (C) 2018 B3Partners B.V.
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

Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null) {
            configObject = {};
        }

        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.addForm(configObject);
        var urls = configObject.urls;
        if (urls !== null && urls !== undefined) {
            for (var i = 0; i < urls.length; i++) {
                this.createRow(urls[i]);
            }
        }
    },
    addForm: function () {
        this.form.add({
            xtype: "panel",
            height: 250,
            width: '100%',
            title: "Links",
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            scrollable: true,
            tbar: [
                "->",
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-plus-circle',
                    text: 'Link toevoegen',
                    listeners: {
                        click: function () {
                            this.createRow({label: '', url: ''});
                        },
                        scope: this
                    }
                }
            ],
            name: "urlcontainer",
            itemId: "urlcontainer"
        },
        {
            xtype: "container",
            html: "In het veld veld 'URL' kunnen verschillende variabelen gebruikt worden om parameters mee te geven. \n\
                Dit zijn [MINX], [MINY], [MAXX], [MAXY], [X], [Y], [BBOX], [X_WGS84], [Y_WGS84]."
        }
        );
    },
    createRow: function (urlconfig) {
        var config = {
            xtype: "container",
            layout: {
                type: "hbox",
                align: "stretch"
            },
            defaults: {
                margin: '0 5 2 0'
            },
            items: [{
                    name: "label",
                    fieldLabel: "Label",
                    value: urlconfig.label,
                    xtype: 'textfield',
                    labelWidth: 50,
                    flex: 1
                }, {
                    name: "url",
                    fieldLabel: "URL",
                    value: urlconfig.url,
                    xtype: 'textfield',
                    labelWidth: 30,
                    flex: 1
                }, {
                    xtype: "button",
                    text: " X ",
                    listeners: {
                        click: function (btn) {
                            var container = btn.up('.panel');
                            container.remove(btn.up('.container'));
                        }
                    }
                }]
        };

        var urlscontainer = Ext.ComponentQuery.query("#urlcontainer")[0];
        urlscontainer.add(config);
    },

    getConfiguration: function () {
        var config = viewer.components.CustomConfiguration.superclass.getConfiguration.call(this);
        var values = this.form.getForm().getValues();
        var labels = values.label;
        var urls = values.url;
        if (urls.constructor !== Array) {
            urls = [values.url];
            labels = [values.label];
        }

        var urlConfigs = [];
        config.urls = urlConfigs;
        for (var i = 0; i < urls.length; i++) {
            urlConfigs.push({
                url: urls[i],
                label: labels[i]
            });
        }
        return config;
    }
});