/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

Ext.onReady(function() {

    // Definition of the TreeNode model. Get function is overridden, so custom
    // icons for the different types are possible
    Ext.define('GeoServiceTreeModel', {
        extend: 'Ext.data.TreeModel',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'type',  type: 'string'},
            {name: 'status', type: 'string'},
            {name: 'class', type: 'string'},
            {name: 'parentid', type: 'string'},
            {name: 'isLeaf', type: 'boolean'},
            {name: 'isVirtual', type: 'boolean'},
            // Text is used by tree, mapped to name
            {name: 'text', type: 'string', mapping: 'name'},
            {name: 'icon', type: 'string', convert: function(fieldName, record) {
                var nodeType = record.get('type');
                if(nodeType == "category") return imagesPath + "folder.png";
                if(nodeType == "layer") return imagesPath + "map.png";
                if(nodeType == "service") {
                    var nodeStatus = record.get('status');
                    if(nodeStatus == "ok") return imagesPath + "serviceok.png";
                    if(nodeStatus == "error") return imagesPath + "serviceerror.png";
                }
            }},
            {name: 'leaf', type: 'boolean', mapping: 'isLeaf'}
        ]
    });
    
    // Weird encoding issue
    if(rootName === "Categori√´n") {
        rootName = "Categorieën";
    }
    
    // Definition of the store, which takes care of loading the necessary json
    var treeStore = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: actionBeans["tree"]
        },
        root: {
            text: rootName,
            id: "c0",
            type: "category",
            expanded: true
        },
        model: 'GeoServiceTreeModel',
        nodeParam: 'nodeId'
    });

    // Definition of contextmenu for categories
    var categoryMenu = Ext.create('Ext.menu.Menu', {
        data: {
            clickedItem: null
        },
        items: [{
            text: 'Subcategorie toevoegen',
            icon: imagesPath + "add.png",
            listeners: {
                click: function(item, e, eOpts) {
                    addSubcategory(item.ownerCt.config.data.clickedItem);
                }
            }
        },
        {
            text: 'Categorie verwijderen',
            icon: imagesPath + "delete.png",
            listeners: {
                click: function(item, e, eOpts) {
                    removeCategory(item.ownerCt.config.data.clickedItem);
                }
            }
        },
        { xtype: "menuseparator"},
        {
            text: 'Naam wijzigen',
            listeners: {
                click: function(item, e, eOpts) {
                    changeCategoryName(item.ownerCt.config.data.clickedItem);
                }
            }
        },
        { xtype: "menuseparator"},
        {
            text: 'Service toevoegen',
            icon: imagesPath + "serviceok.png",
            listeners: {
                click: function(item, e, eOpts) {
                    var record = item.ownerCt.config.data.clickedItem;
                    Ext.get('editFrame').dom.src = actionBeans["service"] + '?addForm=t&category=' + record.get('id').substr(1);
                }
            }
        },
        {
            text: 'CSW service doorzoeken',
            icon: imagesPath + "serviceok.png",
            listeners: {
                click: function(item, e, eOpts) {
                    var record = item.ownerCt.config.data.clickedItem;
                    Ext.get('editFrame').dom.src = actionBeans["csw"] + '?addForm=t&category=' + record.get('id').substr(1);
                }
            }
        }
        ],
        renderTo: Ext.getBody()
    });

    var editMenu = Ext.create('Ext.menu.Menu', {
        data: {
            record: null
        },
        items: [{
            text: 'Bewerken',
            icon: imagesPath + "wrench.png",
            listeners: {
                click: function(item, e, eOpts) {
                    var record = item.ownerCt.config.data.record;
                    tree.fireEvent("itemclick", null, record);
                }
            }
        }
        ],
        renderTo: Ext.getBody()
    });

    // Definition of the tree
    var tree = Ext.create('Ext.tree.Panel', {
        id: 'servicestree',
        store: treeStore,
        rootVisible: true,
        useArrows: true,
        frame: true,
        renderTo: 'tree-container',
        width: 330,
        height: 600,
        scroll: 'both',
        listeners: {
            itemcontextmenu: function(view, record, item, index, event, eOpts) {
                console.log(categoryMenu, editMenu);
                if(record.get('type') == "category") {
                    categoryMenu.config.data.clickedItem = record;
                    categoryMenu.showAt(event.getXY());
                } else {
                    editMenu.config.data.record = record;
                    editMenu.showAt(event.getXY());
                }
                event.stopEvent();
            },
            containercontextmenu: function(view, event, eOpts) {
                // When rightclicking in the treecontainer (not on a node) then
                // show the context menu for the root category
                categoryMenu.config.data.clickedItem = tree.getRootNode();
                categoryMenu.showAt(event.getXY());
                event.stopEvent();
            },
            itemclick: function(view, record, item, index, event, eOpts) {
                var recordType = record.get('type');
                var id = record.get('id').substr(1);

                if(recordType == "category") {
                    // click on category = new service
                    Ext.get('editFrame').dom.src = "about:blank";
                }
                if(recordType == "service") {
                    // click on service = edit service
                    Ext.get('editFrame').dom.src = actionBeans["service"] + '?edit=t&service=' + id + '&category=' + record.parentNode.get('id').substr(1);
                }
                if(recordType == "layer") {
                    // click on layer = edit layer
                    Ext.get('editFrame').dom.src = actionBeans["layer"] + '?layer=' + id + '&parentId=' + record.parentNode.get('id');
                }

                // Expand tree on click
                record.set("isLeaf", false);
                record.expand(false);
            }
        },
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                { xtype: 'container', html: "Gebruik het contextmenu (rechtermuisknop) om de categoriën te bewerken" }
            ]
        }]
    });
});

// Function for adding a node, should not be called directly, but trough the
// addSubcategory or addServiceNode functions
function addNode(node, parentid) {
    var record = null;
    var tree = Ext.getCmp('servicestree');
    if(parentid == '0' || parentid == 'c0') {
        record = tree.getRootNode();
    } else {
        record = tree.getRootNode().findChild('id', parentid, true);
    }
    if(record != null) {
        if(record.isLeaf()) {
            // If the parent is currently a Leaf, then setting it to false
            // and expanding it will load the added childnode from backend

            record.set('isLeaf', false);
            record.expand(false);
        } else {
            //console.log("addNode: record is expanded, appending child");

            // If it has childnodes then just append the new node
            // First expand, then append child, otherwise childnodes are replaced?

            record.expand(false, function() {
                // Sometimes node is being expanded even is isLeaf() is true
                // Do not add record twice
                if(record.findChild("id", node.data.id) == null) {

                    // New service always added at bottom
                    if(node.data.id.charAt(0) == "s") {
                        record.appendChild(node);
                    } else {
                        // Add as last category before services
                        var firstService = null;
                        record.eachChild(function(child) {
                            if(firstService == null && child.data.id.charAt(0) == "s") {
                                firstService = child;
                            }
                        });
                        record.insertBefore(node, firstService);
                    }
                } else {
                    //console.log("child already exists even though parent was a leaf!");
                }
            });
        }
    }
}

// Remove a treenode based in its ID
function removeTreeNode(nodeid) {
    var tree = Ext.getCmp('servicestree');
    tree.getRootNode().findChild('id', nodeid, true).remove();
}

// Add a category, shows a prompt dialog for the new name and adds the category
function addSubcategory(record) {
    Ext.MessageBox.show({
        title: 'Nieuwe categorie toevoegen',
        msg: 'Naam van nieuwe categorie:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt:true,
        fn: function(btn, text, cBoxes){
            if(btn=='ok' && text){
                Ext.Ajax.request({
                    url: actionBeans["category"],
                    params: {
                        addSubcategory: true,
                        name: text,
                        nodeId: record.data.id
                    },
                    method: 'POST',
                    success: function ( result, request ) {
                        var response = Ext.JSON.decode(result.responseText);

                        if(response.success) {
                            var node = response.node;
                            node.text = node.name; // For some reason text is not mapped to name when creating a new model
                            var newNode = Ext.create('GeoServiceTreeModel', node);
                            addNode(newNode, node.parentid);
                        } else {
                            Ext.MessageBox.alert("Fout", response.error);
                        }
                    },
                    failure: function ( result, request) {
                        Ext.MessageBox.alert("Fout", result.responseText);
                    }
                });
            }
        }
    });
}

function changeCategoryName(record) {

    Ext.MessageBox.show({
        title:'Naam wijzigen',
        msg: 'Naam van categorie:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt:true,
        value: record.data.text,
        fn: function(btn, text, cBoxes){
            if(btn=='ok' && text){

                Ext.Ajax.request({
                    url: actionBeans["category"],
                    params: {
                        saveCategory: true,
                        name: text,
                        nodeId: record.data.id
                    },
                    method: 'POST',
                    success: function(result) {
                        var response = Ext.JSON.decode(result.responseText);

                        if(response.success) {
                            record.set("text", response.name);
                        } else {
                            Ext.MessageBox.alert("Fout", response.error);
                        }
                    },
                    failure: function (result) {
                        Ext.MessageBox.alert("Fout", result.responseText);
                    }
                });
            }
        }
    });
}

function removeCategory(record) {
    Ext.MessageBox.show({
        title: "Categorie verwijderen",
        msg: "Weet u zeker dat u de categorie " + record.data.text + " wilt verwijderen?",
        buttons: Ext.MessageBox.OKCANCEL,
        fn: function(btn){
            if(btn=='ok'){

                Ext.Ajax.request({
                    url: actionBeans["category"],
                    params: {
                        removeCategory: true,
                        nodeId: record.data.id
                    },
                    method: 'POST',
                    success: function(result) {
                        var response = Ext.JSON.decode(result.responseText);

                        if(response.success) {
                            record.remove();
                            Ext.get('editFrame').dom.src = "about:blank";
                        } else {
                            Ext.MessageBox.alert("Fout", response.error);
                        }
                    },
                    failure: function (result) {
                        Ext.MessageBox.alert("Fout", result.responseText);
                    }
                });
            }
        }
    });
}

// Function to add a service node. Parameter should hold the JSON for 1 servicenode
function addServiceNode(service) {
    service.text = service.name; // For some reason text is not mapped to name when creating a new model
    var newNode = Ext.create('GeoServiceTreeModel', service);
    addNode(newNode, service.parentid);
}

function updateServiceNode(service) {
    service.text = service.name; // For some reason text is not mapped to name when creating a new model
    
    var tree = Ext.getCmp('servicestree');
    
    var oldNode = tree.getRootNode().findChild('id', service.id, true);
    var parent = oldNode.parentNode;
    if(oldNode !== null) {
        var newNode = Ext.create('GeoServiceTreeModel', service);
        parent.insertBefore(newNode, oldNode);
        oldNode.remove();
        parent.collapse(false, function() {
            parent.expand();
            newNode.expand();
        });
    }
}

// Function to rename a node, based in its ID
function renameNode(nodeid, newname) {
    var tree = Ext.getCmp('servicestree');
    var node = null;
    if(nodeid == tree.getRootNode().getId()) {
        node = tree.getRootNode();
    } else {
        node = tree.getRootNode().findChild("id", nodeid, true);
    }
    if(node != null) {
        node.set("text",newname);
    }
}