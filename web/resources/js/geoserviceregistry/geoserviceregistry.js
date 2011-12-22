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
    
    Ext.define('TreeNode', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'children', type: 'array' },
            { name: 'name', type: 'string' },
            { name: 'type',  type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'class', type: 'string' },
            { name: 'parentid', type: 'string' },
            { name: 'hasChildren', type: 'boolean' },
            
            // Text is used by tree, mapped to name
            { name: 'text', type: 'string', mapping: 'name' }
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
                // default?
                }
            // default?
            }
            if(fieldName == "leaf") {
                nodeType = this.get('type');
                if(nodeType == "category" && !this.get('hasChildren')) return true;
                if(nodeType == "layer" && this.get('children') == undefined) return true;
                return false;
            }
            
            // From ExtJS source
            return this[this.persistenceProperty][fieldName];
        }
    });
    
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

    var tree = Ext.create('Ext.tree.Panel', {
        store: treeStore,
        rootVisible: false,
        root: {
            text: "Root node",
            expanded: true
        },
        useArrows: true,
        frame: true,
        //title: 'Services',
        renderTo: 'tree-container',
        width: 225,
        height: 400,
        listeners: {
            itemcontextmenu: function(view, record, item, index, event, eOpts) {
                if(record.get('type') == "category") {
                    categoryMenu.data.parent = record.get('id');
                    categoryMenu.data.clickedItem = record;
                    categoryMenu.showAt(event.getXY());
                    event.stopEvent();
                }
            },
            containercontextmenu: function(view, event, eOpts) {
                categoryMenu.data.parent = 0;
                categoryMenu.showAt(event.getXY());
                event.stopEvent();
            },
            itemclick: function(view, record, item, index, event, eOpts) {
                var recordType = record.get('type');
                if(recordType == "category") {
                    // click on category = new service
                    Ext.get('editFrame').dom.src = geoserviceediturl + '&parentId=' + record.get('id');
                }
                if(recordType == "service") {
                    // click on service = edit service
                    Ext.get('editFrame').dom.src = geoserviceediturl + '&serviceId=' + record.get('id') + '&parentId=' + record.parentNode.get('id');
                }
                if(recordType == "layer") {
                    // click on layer = edit layer
                    Ext.get('editFrame').dom.src = layerediturl + '&layer=' + record.get('id') + '&parentId=' + record.parentNode.get('id');
                }
            }
        },
        bbar: [
            "->",
            { xtype: 'button', text: 'Categorie toevoegen', handler: function() { addCategory(0) }, cls: 'x-btn-text-icon', icon: addicon }
        ]
    });
    
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
    
    function addNode(node, parentid) {
        var record = null;
        if(parentid == '0' || parentid == 'c0') {
            record = tree.getRootNode();
        } else {
            record = tree.getRootNode().findChild('id', parentid);
        }
        // First expand, then append child, otherwise childnodes are replaced?
        record.expand(false, function() {
            record.appendChild(node);
        });
    }
    
    /* function addServiceNode(json, parentid) {
        var objData = Ext.JSON.decode(json);
        objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
        var newNode = Ext.create('TreeNode', objData);
    } */
    
});