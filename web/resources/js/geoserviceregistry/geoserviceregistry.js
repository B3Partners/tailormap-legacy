/* 
 * Copyright (C) 2011 B3Partners B.V.
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

Ext.Loader.setConfig({enabled:true});
Ext.require([
    'Ext.tree.*',
    'Ext.data.*'
]);

Ext.onReady(function() {
    
    // Definition of the TreeNode model. Get function is overridden, so custom
    // icons for the different types are possible
    Ext.define('TreeNode', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'id', type: 'string'},
            {name: 'children', type: 'array'},
            {name: 'name', type: 'string'},
            {name: 'type',  type: 'string'},
            {name: 'status', type: 'string'},
            {name: 'class', type: 'string'},
            {name: 'parentid', type: 'string'},
            {name: 'isLeaf', type: 'boolean'},
            // Text is used by tree, mapped to name
            {name: 'text', type: 'string', mapping: 'name'}
        ],
        get: function(fieldName) {
            var nodeType = '';
            if(fieldName == "icon") {
                nodeType = this.get('type');
                if(nodeType == "category") return foldericon;
                if(nodeType == "layer") return layericon;
                if(nodeType == "service") {
                    var nodeStatus = this.get('status');
                    if(nodeStatus == "ok") return serviceokicon;
                    if(nodeStatus == "error") return serviceerroricon;
                }
            }
            if(fieldName == "leaf") {
                return this.get('isLeaf');
            }
            // Return default value, taken from ExtJS source
            return this[this.persistenceProperty][fieldName];
        }
    });
    
    // Definition of the store, which takes care of loading the necessary json
    var treeStore = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: treeurl
        },
        defaultRootId: 'c0',
        defaultRootProperty: 'children',
        model: TreeNode,
        nodeParam: 'nodeId'
    });

    // Definition of contextmenu for categories
    var categoryMenu = new Ext.menu.Menu({
        data: {
            parent: 0,
            clickedItem: null
        },
        items: [{
            text: 'Nieuwe categorie toevoegen',
            icon: foldericon,
            listeners: {
                click: function(item, e, eOpts) {
                    addCategory(item.ownerCt.data.parent);
                }
            }
        }]
    });

    // Definition of the tree
    var tree = Ext.create('Ext.tree.Panel', {
        id: 'servicestree',
        store: treeStore,
        rootVisible: false,
        root: {
            text: "Root node",
            expanded: true
        },
        useArrows: true,
        frame: true,
        renderTo: 'tree-container',
        width: 225,
        height: 400,
        listeners: {
            itemcontextmenu: function(view, record, item, index, event, eOpts) {
                // Only show contextmenu (add new category) on category nodes
                if(record.get('type') == "category") {
                    categoryMenu.data.parent = record.get('id');
                    categoryMenu.data.clickedItem = record;
                    categoryMenu.showAt(event.getXY());
                    event.stopEvent();
                }
            },
            containercontextmenu: function(view, event, eOpts) {
                // When rightclicking in the treecontainer (not on a node) than
                // show the context menu for adding a new category
                categoryMenu.data.parent = 0;
                categoryMenu.showAt(event.getXY());
                event.stopEvent();
            },
            itemclick: function(view, record, item, index, event, eOpts) {
                var recordType = record.get('type');
                var id = record.get('id').substr(1);
                if(recordType == "category") {
                    // click on category = new service
                    Ext.get('editFrame').dom.src = geoserviceurl + '?category=' + id;
                }
                if(recordType == "service") {
                    // click on service = edit service
                    Ext.get('editFrame').dom.src = geoserviceediturl + '?service=' + id + '&category=' + record.parentNode.get('id').substr(1);
                }
                if(recordType == "layer") {
                    // click on layer = edit layer
                    Ext.get('editFrame').dom.src = layerediturl + '&layer=' + id + '&parentId=' + record.parentNode.get('id');
                }
            }
        },
        bbar: [
            "->",
            {xtype: 'button', text: 'Categorie toevoegen', handler: function() {addCategory(0)}, cls: 'x-btn-text-icon', icon: addicon}
        ]
    });
});

// Function for adding a node, should not be called directly, but trough the
// addCategory or addServiceNode functions
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
            // If it has childnodes then just append the new node
            // First expand, then append child, otherwise childnodes are replaced?
            record.expand(false, function() {
                record.appendChild(node);
            });
        }
    }
}

// Remove a treenode based in its ID
function removeTreeNode(nodeid) {
    var tree = Ext.getCmp('servicestree');
    tree.getRootNode().findChild('id', nodeid).remove();
}

// Add a category, shows a prompt dialog for the new name and adds the category
function addCategory(parentid) {
    Ext.MessageBox.show({
        title:'Nieuwe categorie toevoegen',
        msg: 'Naam van nieuwe categorie:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt:true,
        fn: function(btn, text, cBoxes){
            if(btn=='ok' && text){
                Ext.Ajax.request({
                    url: addcategoryurl,
                    params: {
                        name: text,
                        parentId: parentid
                    },
                    method: 'POST',
                    success: function ( result, request ) {
                        var objData = Ext.JSON.decode(result.responseText);
                        objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
                        var newNode = Ext.create('TreeNode', objData);
                        addNode(newNode, objData.parentid);
                    },
                    failure: function ( result, request) {
                        Ext.MessageBox.alert('Failed', result.responseText);
                    }
                });
            }
        }
    });
}

// Function to add a service node. Parameter should hold the JSON for 1 servicenode
function addServiceNode(json) {
    var objData = Ext.JSON.decode(json);
    objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
    var newNode = Ext.create('TreeNode', objData);
    addNode(newNode, objData.parentid);
}

// Function to rename a node, based in its ID
function renameNode(nodeid, newname) {
    var tree = Ext.getCmp('servicestree');
    tree.getRootNode().findChild('id', nodeid).set('text', newname);
}