/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
    Ext.define('AppLevelTreeModel', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'type',  type: 'string'},
            {name: 'status', type: 'string'},
            {name: 'class', type: 'string'},
            {name: 'parentid', type: 'string'},
            {name: 'isLeaf', type: 'boolean'},
            // Text is used by tree, mapped to name
            {name: 'text', type: 'string', mapping: 'name'},
            {name: 'icon', type: 'string', convert: function(fieldName, record) {
                var nodeType = record.get('type');
                if(nodeType == "level") return imagesPath + "folder.png";
                if(nodeType == "layer") return imagesPath + "map.png";
            }},
            {name: 'leaf', type: 'boolean', mapping: 'isLeaf'}
        ]
    });

    // Definition of the store, which takes care of loading the necessary json
    var treeStore = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: actionBeans.appTree + "?tree=t"
        },
        root: {text: rootName, id: rootId, type: "level", expanded: true},
        model: AppLevelTreeModel,
        nodeParam: 'nodeId'
    });

    // Definition of contextmenu for levels
    var levelMenu = new Ext.menu.Menu({
        data: {
            clickedItem: null
        },
        items: [{
            text: 'Subniveau toevoegen',
            icon: imagesPath + "add.png",
            listeners: {
                click: function(item, e, eOpts) {
                    addSublevel(item.ownerCt.config.data.clickedItem);
                }
            }
        },{
            text: 'Verwijderen',
            icon: imagesPath + "delete.png",
            listeners: {
                click: function(item, e, eOpts) {
                    removeLevel(item.ownerCt.config.data.clickedItem);
                }
            }
        },{
            text: 'Naam wijzigen',
            listeners: {
                click: function(item, e, eOpts) {
                    changeLevelName(item.ownerCt.config.data.clickedItem)
                }
            }
        },{
            text: 'Bewerken',
            icon: imagesPath + "wrench.png",
            listeners: {
                click: function(item, e, eOpts) {
                    var record = item.ownerCt.config.data.clickedItem;
                    tree.fireEvent("itemclick", null, record);
                }
            }
        }

        ]
    });

    var appLayerMenu = new Ext.menu.Menu({
        data: {
            clickedItem: null
        },
        items: [{
            text: 'Bewerken',
            icon: imagesPath + "wrench.png",
            listeners: {
                click: function(item, e, eOpts) {
                    var record = item.ownerCt.config.data.clickedItem;
                    tree.fireEvent("itemclick", null, record);
                }
            }
        }]
    });

    // Definition of the tree
    var tree = Ext.create('Ext.tree.Panel', {
        id: 'applicationtree',
        store: treeStore,
        rootVisible: true,
        scroll: 'both',
        useArrows: true,
        frame: true,
        renderTo: 'tree-container',
        width: 325,
        height: 600,
        listeners: {
            itemcontextmenu: function(view, record, item, index, event, eOpts) {
                if(record.get('type') == "level") {
                    levelMenu.config.data.clickedItem = record;
                    levelMenu.showAt(event.getXY());
                } else {
                    appLayerMenu.config.data.clickedItem = record;
                    appLayerMenu.showAt(event.getXY());
                }
                event.stopEvent();
            },
            containercontextmenu: function(view, event, eOpts) {
                // When rightclicking in the treecontainer (not on a node) than
                // show the context menu for adding a new category
                levelMenu.config.data.parent = rootid;
                levelMenu.showAt(event.getXY());
                event.stopEvent();
            },
            itemclick: function(view, record, item, index, event, eOpts) {
                var recordType = record.get('type');
                var id = record.get('id').substr(1);
                if(recordType == "level") {
                    Ext.get('editFrame').dom.src = actionBeans.appTreeLevel + '?edit=t&level=' + id;
                }
                if(recordType == "layer") {
                    Ext.get('editFrame').dom.src = actionBeans.appTreeLayer + '?edit=t&applicationLayer=' + id; //+ '&parentId=' + record.parentNode.get('id');
                }

                // Expand tree on click
                record.set('leaf', false);
                record.set('isLeaf', false);
                record.expand(false);
            }
        },
        bbar: [{
            xtype: "label",
            text: "Gebruik het contextmenu (rechtermuisknop) om de boomstructuur te bewerken"
        }]
    });
});

// Function for adding a node, should not be called directly, but trough the
// addCategory or addServiceNode functions
function addNode(node, parentid, callback) {
    var record = null;
    var tree = Ext.getCmp('applicationtree');
    if(parentid == rootId || parentid == 'n'+rootId) {
        record = tree.getRootNode();
    } else {
        record = tree.getRootNode().findChild('id', parentid, true);
    }
    if(record != null) {
        if(record.isLeaf()) {
            // If the parent is currently a Leaf, then setting it to false
            // and expanding it will load the added childnode from backend
            record.set('leaf', false);
            record.set('isLeaf', false);
            record.expand(/*recursive=*/false, function() {
                if(callback) {
                    callback();
                }
            });
        } else {
            // If it has childnodes then just append the new node
            // First expand, then append child, otherwise childnodes are replaced?

            record.expand(false, function() {
                // Sometimes node is being expanded even is isLeaf() is true
                // Do not add record twice
                if(record.findChild("id", node.data.id) == null) {

                    // New layer always added at bottom
                    if(node.data.id.charAt(0) == "s") {
                        record.appendChild(node);
                    } else {
                        // Add as last level before services
                        var firstAppLayer = null;
                        record.eachChild(function(child) {
                            if(firstAppLayer == null && child.data.id.charAt(0) == "s") {
                                firstAppLayer = child;
                            }
                        });
                        record.insertBefore(node, firstAppLayer);
                    }
                } else {
                    //console.log("child already exists even though parent was a leaf!");
                }
                if(callback) {
                    callback();
                }
            });
        }
    }
}

// Remove a treenode based in its ID
function removeTreeNode(nodeid) {
    var tree = Ext.getCmp('applicationtree');
    tree.getRootNode().findChild('id', nodeid, true).remove();
}

// Add a category, shows a prompt dialog for the new name and adds the category
function addSublevel(record) {
    Ext.MessageBox.show({
        title:'Nieuw niveau toevoegen',
        msg: 'Naam van nieuw niveau:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt: true,
        fn: function(btn, text, cBoxes){
            if(btn=='ok' && text){
                Ext.Ajax.request({
                    url: actionBeans.appTree + "?addLevel=t",
                    params: {
                        name: text,
                        parentId: record.data.id
                    },
                    method: 'POST',
                    success: function ( result, request ) {
                        var objData = Ext.JSON.decode(result.responseText);
                        objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
                        var newNode = Ext.create('AppLevelTreeModel', objData);
                        addNode(newNode, objData.parentid, function() {
                            Ext.getCmp("applicationtree").fireEvent("itemclick", null, newNode);
                        });
                    },
                    failure: function ( result, request) {
                        Ext.MessageBox.alert('Failed', result.responseText);
                    }
                });
            }
        }
    });
}


function changeLevelName(record) {

    Ext.MessageBox.show({
        title:'Naam wijzigen',
        msg: 'Naam van niveau:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt:true,
        value: record.data.text,
        fn: function(btn, text, cBoxes){
            if(btn=='ok' && text){

                Ext.Ajax.request({
                    url: actionBeans.appTreeLevel,
                    params: {
                        saveName: true,
                        "level.name": text,
                        level: record.data.id.substring(1)
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

function removeLevel(record) {
    if(record.data && record.data.name === "Achtergrond"){
        Ext.MessageBox.alert("Foutmelding", 'Vast niveau "Achtergrond" niet toegestaan om te verwijderen.');
    }else{
        Ext.MessageBox.show({
            title: "Niveau verwijderen",
            msg: "Weet u zeker dat u het niveau " + record.data.text + " wilt verwijderen?",
            buttons: Ext.MessageBox.OKCANCEL,
            fn: function(btn){
                if(btn==='ok'){

                    Ext.Ajax.request({
                        url: actionBeans.appTreeLevel,
                        params: {
                            deleteAjax: true,
                            level: record.data.id.substring(1)
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
}

// Function to add a service node. Parameter should hold the JSON for 1 servicenode
function addServiceNode(json) {
    var objData = Ext.JSON.decode(json);
    objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
    var newNode = Ext.create('AppLevelTreeModel', objData);
    addNode(newNode, objData.parentid);
}

// Function to rename a node, based in its ID
function renameNode(nodeid, newname) {
    var tree = Ext.getCmp('applicationtree');
    tree.getRootNode().findChild('id', nodeid, true).set('text', newname);
}

function refreshNode(nodeid) {
    var tree = Ext.getCmp('applicationtree');
    var treeStore = tree.getStore();
    var record = treeStore.getNodeById(nodeid)
    // Set isLeaf false so if node did not have children before, it would
    // correctly expand when children are added
    record.set('leaf', false);
    record.set('isLeaf', false);
    treeStore.load({
        node: record,
        clearOnLoad: true
    });
}