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

Ext.define('vieweradmin.components.ApplicationTreeLayerAttributes', {

    requires: [
        'Ext.tree.*',
        'Ext.data.*'
    ],

    attributeOrderTree: null,
    attributeOrderContextmenu: null,
    attributeOrderSelectedRecord: null,
    toggleState: true,

    config: {
        attributes: [],
        imagePath: ""
    },

    constructor: function(config) {
        this.initConfig(config);
        this.createTree();
    },

    createTree: function() {
        var orderStore = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: this.parseAttributesAsTree()
            }
        });
        this.attributeOrderContextmenu = this.getAttributeOrderContextmenu();
        this.attributeOrderTree = Ext.create('Ext.tree.Panel', {
            store: orderStore,
            rootVisible: false,
            selModel: { mode: "SINGLE" },
            useArrows: true,
            frame: true,
            width: 325,
            autoScroll: true,
            margin: 10,
            viewConfig: {
                plugins: {
                    ptype: 'treeviewdragdrop',
                    allowContainerDrops: true,
                    allowParentInserts: true,
                    sortOnDrop: true
                },
                listeners: {
                    beforedrop: function(targetNode, data, recordOver, dropPosition, dropHandlers, eOpts) {
                        // You cannot drag a folder in a folder, 1 level deep only
                        var dragInFolder = dropPosition === "append" && recordOver.get("leaf") === false;
                        // If recordOver has parent and that parent has a parent the record is inside a folder
                        // Cancel drop in that case if the dragged item is also a folder (no folder-in-folder)
                        if(recordOver.parentNode && recordOver.parentNode.parentNode) {
                            dragInFolder = true;
                        }
                        if(data.records[0].get("leaf") === false && dragInFolder) {
                            dropHandlers.cancelDrop();
                            return false;
                        }
                        return true;
                    }
                }
            },
            listeners: {
                itemcontextmenu: {
                    fn: function(view, record, item, index, event, eOpts) { this.handleContextmenu(event, record); },
                    scope: this
                },
                containercontextmenu: {
                    fn: function(view, event, eOpts) { this.handleContextmenu(event, null); },
                    scope: this
                }
            },
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    layout: {
                        pack: 'end'
                    },
                    items: [
                        {
                            id: 'toggleAllLayersButton',
                            text: i18next.t('viewer_admin_attributes_0'),
                            listeners: {
                                click: {
                                    fn: function() { this.toggleAttributesChecked(); },
                                    scope: this
                                }
                            }
                        }
                    ]
                }
            ]
        });
        return [ this.attributeOrderTree ];
    },

    parseAttributesAsTree: function() {
        var childmodels = [];
        var attribute;
        var parent;
        for(var i = 0; i < this.config.attributes.length; i++) {
            attribute = this.config.attributes[i];
            parent = null;
            // attribute has folder_label, so is part of a folder
            if(attribute.hasOwnProperty("folder_label") && attribute.folder_label) {
                // find the parent in the current set
                parent = this.findParent(childmodels, attribute.folder_label);
                // parent not, found, create new folder
                if(parent === null) {
                    childmodels.push({
                        text: attribute.folder_label,
                        leaf: false,
                        children: [],
                        expanded: true
                    });
                    // get the newly created parent
                    parent = this.findParent(childmodels, attribute.folder_label);
                }
            }
            // parent = null, so not part of a folder, list of attributes = parent
            if(parent === null) {
                parent = childmodels;
            }
            parent.push({
                attributeid: this.config.attributes[i].id,
                longname: this.config.attributes[i].longname,
                text: this.config.attributes[i].alias || this.config.attributes[i].name,
                leaf: true,
                checked: this.config.attributes[i].visible
            });
        }
        return childmodels;
    },

    findParent: function(childmodels, parentLabel) {
        var parent = null;
        for(var j = 0; j < childmodels.length; j++) {
            if(!childmodels[j].leaf && childmodels[j].text === parentLabel) {
                parent = childmodels[j].children;
            }
        }
        return parent;
    },

    toggleAttributesChecked: function() {
        this.attributeOrderTree.getStore().each(function(record) {
            if(record.get("leaf") === true) {
                record.set("checked", this.toggleState);
            }
        }, this);
        this.toggleState = !this.toggleState;
    },

    handleContextmenu: function(event, record) {
        this.attributeOrderContextmenu.query("#removeFolder")[0].setVisible(record && record.get("leaf") === false);
        this.attributeOrderContextmenu.query("#changeName")[0].setVisible(record && record.get("leaf") === false);
        this.attributeOrderSelectedRecord = record;
        this.attributeOrderContextmenu.showAt(event.getXY());
        event.stopEvent();
    },

    getAttributeOrderContextmenu: function() {
        return new Ext.menu.Menu({
            items: [
                {
                    itemId: "createFolder",
                    text: i18next.t('viewer_admin_attributes_1'),
                    icon: this.config.imagePath + "add.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                // Create folder
                                function okCallback(text) {
                                    this.attributeOrderTree.getStore().getRoot().appendChild({
                                        text: text,
                                        leaf: false,
                                        children: []
                                    });
                                }
                                this.editAttributeFolderName(true, okCallback, "", this);
                            },
                            scope: this
                        }
                    }
                },
                {
                    itemId: "removeFolder",
                    text: i18next.t('viewer_admin_attributes_2'),
                    icon: this.config.imagePath + "delete.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                if(this.attributeOrderSelectedRecord === null) {
                                    return;
                                }
                                Ext.Msg.show({
                                    title: i18next.t('viewer_admin_attributes_3'),
                                    message: 'Weet u zeker dat u de geselecteerde map wilt verwijderen?',
                                    buttons: Ext.Msg.YESNO,
                                    icon: Ext.Msg.QUESTION,
                                    fn: function (btn) {
                                        if (btn === 'yes') {
                                            var children = this.attributeOrderSelectedRecord.get("children");
                                            var folderIndex = this.attributeOrderTree.getStore().indexOf(this.attributeOrderSelectedRecord);
                                            var root = this.attributeOrderTree.getStore().getRoot();
                                            for(var i = 0; i < children.length; i++) {
                                                root.insertChild(folderIndex + i, children[i]);
                                            }
                                            this.attributeOrderTree.getStore().remove(this.attributeOrderSelectedRecord);
                                        }
                                    },
                                    scope: this
                                });
                            },
                            scope: this
                        }
                    }
                },
                {
                    itemId: "changeName",
                    text: i18next.t('viewer_admin_attributes_4'),
                    icon: this.config.imagePath + "wrench.png",
                    listeners: {
                        click: {
                            fn: function (item, e, eOpts) {
                                if(this.attributeOrderSelectedRecord === null) {
                                    return;
                                }
                                function okCallback(text) {
                                    this.attributeOrderSelectedRecord.set("text", text);
                                }
                                this.editAttributeFolderName(false, okCallback, this.attributeOrderSelectedRecord.get("text"), this);
                            },
                            scope: this
                        }
                    }
                }
            ]
        });
    },

    editAttributeFolderName: function(newLevel, okFunction, initialText, scope) {
        Ext.MessageBox.show({
            title: newLevel ? 'Nieuwe map aanmaken' : 'Naam wijzigen',
            msg: i18next.t('viewer_admin_attributes_5') + (newLevel ? "nieuwe map" : "map") +':',
            buttons: Ext.MessageBox.OKCANCEL,
            prompt: true,
            value: initialText,
            fn: function (btn, text, cBoxes) {
                if (btn === 'ok' && text) {
                    okFunction.call(scope, text);
                }
            }
        });
    },

    getItems: function() {
        return [ this.attributeOrderTree ];
    },

    getJson: function() {
        var attributes = [];
        var orderindex = 0;
        this.attributeOrderTree.getStore().each(function(record) {
            if(record.get("leaf") === true) {
                attributes.push({
                    attribute_id: record.get("attributeid"),
                    checked: record.get("checked"),
                    longname: record.get("longname"),
                    // if record has only 1 parent ( = root ) do not set folder_label, otherwise parent = custom folder
                    folder_label: record.parentNode && !record.parentNode.parentNode ? "" : record.parentNode.get("text"),
                    order: orderindex++
                })
            }
        }, this);
        return attributes;
    }

});