/*
 * Copyright (C) 2015 B3Partners B.V.
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

/**
 * SelectionModule Menu component
 * Creates a context menu to be used with the selection module.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

Ext.define("viewer.components.SelectionModuleMenu", {
    config: {
        selectionModule: null
    },
    levelMenu: null,
    constructor: function (config) {
        this.initConfig(config);
        this.createMenus();
    },
    createMenus: function () {
        this.levelMenu = new Ext.menu.Menu({
            data: {
                clickedItem: null
            },
            items: [{
                    text: 'Voeg niveau toe',
                    // icon: imagesPath + "wrench.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                this.config.selectionModule.createAndAddLevel(this.levelMenu.config.data.clickedItem);
                            },
                            scope: this
                        }
                    }
                },
                {
                    text: 'Naam wijzigen',
                    // icon: imagesPath + "wrench.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                this.editName(this.levelMenu.config.data.clickedItem);
                            },
                            scope: this
                        }
                    }
                }]
        });
    },
    handleClick: function (record, event) {
        this.levelMenu.showAt(event.getXY());
        this.levelMenu.config.data.clickedItem = record;
    },
    editName: function (record) {
        var me = this;
        Ext.MessageBox.show({
            title: 'Naam wijzigen',
            msg: 'Naam van niveau:',
            buttons: Ext.MessageBox.OKCANCEL,
            prompt: true,
            value: record.data.text,
            fn: function (btn, text, cBoxes) {
                if (btn === 'ok' && text) {
                    record.set("text", text);
                    var levelId = record.data.origData.id;
                    var level = me.config.selectionModule.levels[levelId];
                    level.name = text;
                    // Don't edit the viewerController.app.levels directly (it's a reference). Only edit that when clicking ok in the main selectionmodule window.
                }
            }
        });
    }
});