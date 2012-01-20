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
    'Ext.data.*',
    'Ext.tab.*',
    'Ext.panel.*'
]);

Ext.onReady(function() {
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
    
    // Definition of the store, which takes care of loading the necessary json
    var selectedLayersStore = Ext.create('Ext.data.TreeStore', {
        model: TreeNode,
        nodeParam: 'levelId',
        defaultRootId: levelid,
        defaultRootProperty: 'children',
        autoLoad: true,
        folderSort: true,
        proxy: {
            type: 'ajax',
            url: selectedlayersurl
        }
    });
    
    // Definition of the tree
    // Array containing current filter
    var filteredNodes = [];
    // Array containing nodes which are hidden before
    var hiddenNodes = [];
    // Timeout container
    var filterTimer = 0;
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
        renderTo: 'servicetree-container',
        width: 225,
        height: 400,
        listeners: {
            itemdblclick: function(view, record, item, index, event, eOpts) {
                addToSelection(record);
            }
        },
        tbar: [
            {
                xtype : 'textfield',
                emptyText : 'Type to search...',
                enableKeyEvents : true,
                listeners : {
                    focus : {
                        fn : function(view, record, item, index, even) {
                            if(this.getValue("Type to search...")) {
                                this.setValue("");
                                setAllNodesVisible(true);
                            }
                        }
                    },
                    keyup : {
                        fn : function() {
                            var textvalue = this.getValue();
                            if(filterTimer !== 0) {
                                clearTimeout(filterTimer);
                            }
                            filterTimer = window.setTimeout(function() {
                                if(textvalue === '') {
                                    setAllNodesVisible(true);
                                } else {
                                    var re = new RegExp(Ext.escapeRe(textvalue), 'i');
                                    var visibleSum = 0;
                                    var filter = function(node) {// descends into child nodes
                                        if(node.hasChildNodes()) {
                                            visibleSum = 0;
                                            node.eachChild(function(childNode) {
                                                if(childNode.isLeaf()) {
                                                    if(!re.test(childNode.data.text)) {
                                                        filteredNodes.push(childNode);
                                                    } else {
                                                        visibleSum++;
                                                    }
                                                } else if(!childNode.hasChildNodes() && re.test(childNode.data.text)) {// empty folder, but name matches
                                                    visibleSum++;
                                                } else {
                                                    filter(childNode);
                                                }
                                            });
                                            if(visibleSum === 0 && !re.test(node.data.text)) {
                                                filteredNodes.push(node);
                                            }
                                        } else if(!re.test(node.data.text)) {
                                            filteredNodes.push(node);
                                        }
                                    };
                                    tree.getRootNode().cascadeBy(filter);
                                    setAllNodesVisible(false);
                                }
                            }, 500);
                        }
                    }
                }
            }
        ]
    });
    
    var selectedlayers = Ext.create('Ext.tree.Panel', {
        id: 'selectedlayerstree',
        store: selectedLayersStore,
        rootVisible: false,
        root: {
            text: "Root node",
            expanded: true
        },
        useArrows: true,
        frame: true,
        renderTo: 'selected-layers',
        width: 225,
        height: 400,
        listeners: {
            itemdblclick: function(view, record, item, index, event, eOpts) {
                var rootNode = selectedlayers.getRootNode();
                Ext.Array.each(selectedlayers.getSelectionModel().getSelection(), function(record) {
                    rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
                });
            }
        }
    });
    
    Ext.create('Ext.Button', {
        renderTo: 'layerselection-buttons',
        icon: moverighticon,
        width: 23,
        height: 22,
        listeners: {
            click: function() {
                Ext.Array.each(tree.getSelectionModel().getSelection(), function(record) {
                    addToSelection(record);
                });
            }
        }
    });
    
    Ext.create('Ext.Button', {
        renderTo: 'layerselection-buttons',
        icon: movelefticon,
        width: 23,
        height: 22,
        listeners: {
            click: function() {
                var rootNode = selectedlayers.getRootNode();
                Ext.Array.each(selectedlayers.getSelectionModel().getSelection(), function(record) {
                    rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
                });
            }
        }
    });
    
    Ext.create('Ext.Button', {
        icon: moveupicon,
        width: 23,
        height: 22,
        renderTo: 'layermove-buttons',
        listeners: {
            click: function() {
                var rootNode = selectedlayers.getRootNode();
                Ext.Array.each(selectedlayers.getSelectionModel().getSelection(), function(record) {
                    var node = rootNode.findChild('id', record.get('id'), true);
                    var sib = node.previousSibling;
                    if(sib !== null) {
                        rootNode.insertBefore(node, sib);
                    }
                });
            }
        }
    });
    
    Ext.create('Ext.Button', {
        icon: movedownicon,
        width: 23,
        height: 22,
        renderTo: 'layermove-buttons',
        listeners: {
            click: function() {
                var rootNode = selectedlayers.getRootNode();
                Ext.Array.each(selectedlayers.getSelectionModel().getSelection(), function(record) {
                    var node = rootNode.findChild('id', record.get('id'), true);
                    var sib = node.nextSibling;
                    if(sib !== null) {
                        rootNode.insertBefore(sib, node);
                    }
                });
            }
        }
    });
    
    var tabconfig = [{
        contentEl:'rights-tab', 
        title: 'Rechten'
    },{
        contentEl:'documents-tab', 
        title: 'Documenten'
    },{
        contentEl:'context-tab', 
        title: 'Context'
    }];
    if(layersAllowed) {
        tabconfig.unshift({
            contentEl:'tree-tab', 
            title: 'Kaarten'
        });
    }
    Ext.createWidget('tabpanel', {
        renderTo: 'tabs',
        width: '100%',
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        layoutOnTabChange: true,
        items: tabconfig
    });

    function setAllNodesVisible(visible) {
        if(!visible) {
            // !visible -> A filter is being applied
            // Save all nodes that are being filtered in hiddenNodes array
            hiddenNodes = filteredNodes;
        } else {
            // visible -> No filter is applied
            // filteredNodes = hiddenNodes, so all hidden nodes will be made visible
            filteredNodes = hiddenNodes;
            hiddenNodes = [];
        }
        Ext.each(filteredNodes, function(n) {
            var el = Ext.fly(tree.getView().getNodeByRecord(n));
            if (el !== null) {
                el.setDisplayed(visible);
            }
        });
        filteredNodes = [];
    }

    function addToSelection(record) {
        if(record.get('type') == "layer") {
            var addedNode = selectedlayers.getRootNode().findChild('id', record.get('id'), true);
            if(addedNode === null) {
                var objData = record.raw;
                objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
                objData.isLeaf = true;
                objData.draggable = true;
                var newNode = Ext.create('TreeNode', objData);
                var treenode = selectedlayers.getRootNode();
                if(treenode != null) {
                    treenode.appendChild(newNode);
                }
            }
        }
    }
    
    Ext.get('levelform').on('submit', function() {
        var addedLayers = '';
        selectedlayers.getRootNode().eachChild(function(record) {
            if(addedLayers != '') addedLayers += ',';
            addedLayers += record.get('id');
        });
        Ext.fly('selectedlayersinput').set({value:addedLayers});
    });
});