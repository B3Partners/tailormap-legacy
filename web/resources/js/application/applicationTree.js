/* 
 * Copyright (C) 2012 B3Partners B.V.
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
                if(nodeType == "level") return foldericon;
                if(nodeType == "layer") return layericon;
            }
            if(fieldName == "leaf") {
                return this.get('isLeaf');
            }
            // Return default value, taken from ExtJS source
            return this[this.persistenceProperty][fieldName];
        }
    });
    
    // Override van TreeStore to fix load function, used to refresh tree node
    Ext.define('Ext.ux.b3p.TreeStore', {
        extend: 'Ext.data.TreeStore',
        load: function(options) {
            options = options || {};
            options.params = options.params || {};
            var me = this,
                node = options.node || me.tree.getRootNode(),
                root;
            if (!node) {
                node = me.setRootNode({
                    expanded: true
                });
            }
            if (me.clearOnLoad) {
                node.removeAll(false);
            }
            Ext.applyIf(options, {
                node: node
            });
            options.params[me.nodeParam] = node ? node.getId() : 'root';
            if (node) {
                node.set('loading', true);
            }
            return me.callParent([options]);
        }
    });
    
    // Definition of the store, which takes care of loading the necessary json
    var treeStore = Ext.create('Ext.ux.b3p.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: treeurl
        },
        defaultRootId: 'n'+rootid,
        defaultRootProperty: 'children',
        model: TreeNode,
        nodeParam: 'nodeId'
    });

    // Definition of contextmenu for categories
    var levelMenu = new Ext.menu.Menu({
        data: {
            parent: 0,
            clickedItem: null
        },
        items: [{
            text: 'Nieuw niveau toevoegen',
            icon: foldericon,
            listeners: {
                click: function(item, e, eOpts) {
                    addLevel(item.ownerCt.data.parent);
                }
            }
        }]
    });

    // Definition of the tree
    var tree = Ext.create('Ext.tree.Panel', {
        id: 'applicationtree',
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
                // Only show contextmenu (add new level) on level nodes
                if(record.get('type') == "level") {
                    levelMenu.data.parent = record.get('id');
                    levelMenu.data.clickedItem = record;
                    levelMenu.showAt(event.getXY());
                    event.stopEvent();
                }
            },
            containercontextmenu: function(view, event, eOpts) {
                // When rightclicking in the treecontainer (not on a node) than
                // show the context menu for adding a new category
                levelMenu.data.parent = rootid;
                levelMenu.showAt(event.getXY());
                event.stopEvent();
            },
            itemclick: function(view, record, item, index, event, eOpts) {
                var recordType = record.get('type');
                var id = record.get('id').substr(1);
                if(recordType == "level") {
                    Ext.get('editFrame').dom.src = levelurl + '?level=' + id;
                }
                if(recordType == "layer") {
                    Ext.get('editFrame').dom.src = layerurl + '?applicationLayer=' + id; //+ '&parentId=' + record.parentNode.get('id');
                }
            }
        },
        bbar: [
            "->",
            {xtype: 'button', text: 'Niveau toevoegen', handler: function() {addLevel(rootid)}, cls: 'x-btn-text-icon', icon: addicon}
        ]
    });
});

// Function for adding a node, should not be called directly, but trough the
// addCategory or addServiceNode functions
function addNode(node, parentid) {
    var record = null;
    var tree = Ext.getCmp('applicationtree');
    if(parentid == rootid || parentid == 'n'+rootid) {
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
    var tree = Ext.getCmp('applicationtree');
    tree.getRootNode().findChild('id', nodeid, true).remove();
}

// Add a category, shows a prompt dialog for the new name and adds the category
function addLevel(parentid) {
    Ext.MessageBox.show({
        title:'Nieuw niveau toevoegen',
        msg: 'Naam van nieuwe niveau:',
        buttons: Ext.MessageBox.OKCANCEL,
        prompt:true,
        fn: function(btn, text, cBoxes){
            if(btn=='ok' && text){
                Ext.Ajax.request({
                    url: addlevelurl,
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
    var tree = Ext.getCmp('applicationtree');
    tree.getRootNode().findChild('id', nodeid, true).set('text', newname);
}

function refreshNode(nodeid) {
    var tree = Ext.getCmp('applicationtree');
    var treeStore = tree.getStore();
    var record = treeStore.getNodeById(nodeid)
    // Set isLeaf false so if node did not have children before, it would
    // correctly expand when children are added
    record.set('isLeaf', false);
    treeStore.load({
        node: record,
        clearOnLoad: true
    });
}