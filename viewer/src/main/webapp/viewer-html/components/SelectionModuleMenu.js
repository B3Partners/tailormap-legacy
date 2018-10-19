/*
 * Copyright (C) 2015 B3Partners B.V.
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
    layerMenu: null,
    constructor: function (config) {
        this.initConfig(config);
        this.createMenus();
    },
    createMenus: function () {
 
        this.levelMenu = new Ext.menu.Menu({
            data: {
                clickedItem: null
            },
            items: [
                {
                    text: i18next.t('viewer_components_selectionmodulemenu_0'),
                    icon: FlamingoAppLoader.get('contextPath') + "/resources/images/add.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                var me = this;
                                var f = function(name){
                                    me.config.selectionModule.createAndAddLevel(me.levelMenu.config.data.clickedItem, name);
                                };
                                this.editName("",f);
                            },
                            scope: this
                        }
                    }
                },
                {
                    text: i18next.t('viewer_components_selectionmodulemenu_1'),
                    icon: FlamingoAppLoader.get('contextPath') + "/resources/images/delete.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                var record = this.levelMenu.config.data.clickedItem;
                                var me = this;
                                me.record = record;
                                Ext.Msg.show({
                                    title: i18next.t('viewer_components_selectionmodulemenu_2'),
                                    message: ___("Weet u zeker dat u de geselecteerde map wilt verwijderen?"),
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.QUESTION,
                                    fn: function (btn) {
                                        if (btn === 'yes') {
                                            me.config.selectionModule.removeNodes(me.record);
                                        }
                                    }
                                });
                            },
                            scope: this
                        }
                    }
                },
                {
                    text: i18next.t('viewer_components_selectionmodulemenu_3'),
                    icon: FlamingoAppLoader.get('contextPath') + "/resources/images/wrench.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                var record = this.levelMenu.config.data.clickedItem;
                                var me = this;
                                var f = function (name) {
                                    record.set("text", name);
                                    var levelId = record.data.origData.id;
                                    var level = me.config.selectionModule.levels[levelId];
                                    level.name = name;
                                };
                                this.editName(this.levelMenu.config.data.clickedItem.data.text,f, ___("map"));
                            },
                            scope: this
                        }
                    }
                }
            ]
        });

        this.layerMenu = new Ext.menu.Menu({
            data: {
                clickedItem: null
            },
            items: [
                {
                    text: i18next.t('viewer_components_selectionmodulemenu_4'),
                    icon: FlamingoAppLoader.get('contextPath') + "/resources/images/delete.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                var record = this.levelMenu.config.data.clickedItem;
                                var me = this;
                                me.record = record;
                                Ext.Msg.show({
                                    title: i18next.t('viewer_components_selectionmodulemenu_5'),
                                    message: ___("Weet u zeker dat u de geselecteerde kaartlaag wilt verwijderen?"),
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.QUESTION,
                                    fn: function (btn) {
                                        if (btn === 'yes') {
                                            me.config.selectionModule.removeNodes(me.record);
                                        }
                                    }
                                });
                            },
                            scope: this
                        }
                    }
                },
                {
                    text: i18next.t('viewer_components_selectionmodulemenu_6'),
                    icon: FlamingoAppLoader.get('contextPath') + "/resources/images/wrench.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                var record = this.levelMenu.config.data.clickedItem;
                                var me = this;
                                var f = function (name) {
                                    record.set("text", name);
                                    var levelId = record.data.origData.id;
                                    var level = me.config.selectionModule.levels[levelId];
                                    level.name = name;
                                };
                                this.editName(this.layerMenu.config.data.clickedItem.data.text,f, ___("kaartlaag"));
                            },
                            scope: this
                        }
                    }
                }
            ]
        });
    },
    handleClick: function (record, event) {
        var menu = this.getMenu(record);
        menu.showAt(event.getXY());
        menu.config.data.clickedItem = record;
    },
    getMenu : function (record){
        var isLayer = record !== null && record.data.leaf;
        var menu = isLayer ? this.layerMenu : this.levelMenu;
        return menu;
    },
    closeAllMenus: function() {
        this.layerMenu.hide();
        this.levelMenu.hide();
    },
    editName: function (initialText,okFunction, type) {
        var me = this;
        var newLevel = typeof type === "undefined";
        Ext.MessageBox.show({
            title: newLevel ? ___("Nieuwe map aanmaken") : ___("Naam wijzigen"),
            msg: i18next.t('viewer_components_selectionmodulemenu_7') + (newLevel ? ___("nieuwe map") : type) +':',
            buttons: Ext.MessageBox.OKCANCEL,
            prompt: true,
            value: initialText,// record.data.text,
            fn: function (btn, text, cBoxes) {
                if (btn === 'ok' && text) {
                    okFunction(text);
                }
            }
        });
    }
});