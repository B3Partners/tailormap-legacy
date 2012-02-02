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

Ext.define('Ext.ux.b3p.TreeSelection', {
        
    treeUrl: treeurl || '',
    defaultRootIdTree: 'c0',
    nodeParamTree: 'nodeId',
    selectedLayersUrl: selectedlayersurl || '',
    defaultRootIdSelectedLayers: levelid || '',
    nodeParamSelectedLayers: 'levelId',
    moveRightIcon: moverighticon || '',
    moveLeftIcon: movelefticon || '',
    moveUpIcon: moveupicon || '',
    moveDownIcon: movedownicon || '',
    treeContainer: 'servicetree-container',
    selectedLayersContainer: 'selected-layers',
    layerSelectionButtons: 'layerselection-buttons',
    layerMoveButtons: 'layermove-buttons',
    autoShow: true,

    constructor: function(config) {
        Ext.apply(this, config || {});
        Ext.apply(this, {
            filteredNodes: [],
            hiddenNodes: [],
            filterTimer: 0
        });
        if(this.autoShow) {
            this.show();
        }
    },

    show: function() {
        var me = this;
        // Definition of the store, which takes care of loading the necessary json
        me.treeStore = Ext.create('Ext.data.TreeStore', {
            model: 'TreeNode',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: me.treeUrl
            },
            defaultRootId: me.defaultRootIdTree,
            defaultRootProperty: 'children',
            nodeParam: me.nodeParamTree
        });

        // Definition of the store, which takes care of loading the necessary json
        me.selectedLayersStore = Ext.create('Ext.data.TreeStore', {
            model: 'TreeNode',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: me.selectedLayersUrl
            },
            defaultRootId: me.defaultRootIdSelectedLayers,
            defaultRootProperty: 'children',
            nodeParam: me.nodeParamSelectedLayers
        });

        me.tree = Ext.create('Ext.tree.Panel', {
            store: me.treeStore,
            rootVisible: false,
            root: {
                text: "Root node",
                expanded: true
            },
            useArrows: true,
            frame: true,
            renderTo: me.treeContainer,
            width: 225,
            height: 400,
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.addToSelection(record);
                }
            },
            tbar: [
                {
                    xtype : 'textfield',
                    emptyText : 'Type to search...',
                    enableKeyEvents : true,
                    listeners : {
                        keyup : {
                            fn : function() {
                                var textvalue = this.getValue();
                                if(me.filterTimer !== 0) {
                                    clearTimeout(me.filterTimer);
                                }
                                me.filterTimer = window.setTimeout(function() {
                                    if(textvalue === '') {
                                        me.setAllNodesVisible(true);
                                    } else {
                                        var re = new RegExp(Ext.escapeRe(textvalue), 'i');
                                        var visibleSum = 0;
                                        var filter = function(node) {// descends into child nodes
                                            if(node.hasChildNodes()) {
                                                visibleSum = 0;
                                                node.eachChild(function(childNode) {
                                                    if(childNode.isLeaf()) {
                                                        if(!re.test(childNode.data.text)) {
                                                            me.filteredNodes.push(childNode);
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
                                                    me.filteredNodes.push(node);
                                                }
                                            } else if(!re.test(node.data.text)) {
                                                me.filteredNodes.push(node);
                                            }
                                        };
                                        me.tree.getRootNode().cascadeBy(filter);
                                        me.setAllNodesVisible(false);
                                    }
                                }, 500);
                            }
                        }
                    }
                }
            ]
        });

        me.selectedlayers = Ext.create('Ext.tree.Panel', {
            store: me.selectedLayersStore,
            rootVisible: false,
            root: {
                text: "Root node",
                expanded: true
            },
            useArrows: true,
            frame: true,
            renderTo: me.selectedLayersContainer,
            width: 225,
            height: 400,
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    var rootNode = me.selectedlayers.getRootNode();
                    Ext.Array.each(me.selectedlayers.getSelectionModel().getSelection(), function(record) {
                        rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
                    });
                }
            }
        });

        Ext.create('Ext.Button', {
            renderTo: me.layerSelectionButtons,
            icon: me.moveRightIcon,
            width: 23,
            height: 22,
            listeners: {
                click: function() {
                    Ext.Array.each(me.tree.getSelectionModel().getSelection(), function(record) {
                        me.addToSelection(record);
                    });
                }
            }
        });

        Ext.create('Ext.Button', {
            renderTo: me.layerSelectionButtons,
            icon: me.moveLeftIcon,
            width: 23,
            height: 22,
            listeners: {
                click: function() {
                    var rootNode = me.selectedlayers.getRootNode();
                    Ext.Array.each(me.selectedlayers.getSelectionModel().getSelection(), function(record) {
                        rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
                    });
                }
            }
        });

        Ext.create('Ext.Button', {
            icon: me.moveUpIcon,
            width: 23,
            height: 22,
            renderTo: me.layerMoveButtons,
            listeners: {
                click: function() {
                    var rootNode = me.selectedlayers.getRootNode();
                    Ext.Array.each(me.selectedlayers.getSelectionModel().getSelection(), function(record) {
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
            icon: me.moveDownIcon,
            width: 23,
            height: 22,
            renderTo: me.layerMoveButtons,
            listeners: {
                click: function() {
                    var rootNode = me.selectedlayers.getRootNode();
                    Ext.Array.each(me.selectedlayers.getSelectionModel().getSelection(), function(record) {
                        var node = rootNode.findChild('id', record.get('id'), true);
                        var sib = node.nextSibling;
                        if(sib !== null) {
                            rootNode.insertBefore(sib, node);
                        }
                    });
                }
            }
        });
    },

    setAllNodesVisible: function(visible) {
        var me = this;
        if(!visible) {
            // !visible -> A filter is being applied
            // Save all nodes that are being filtered in hiddenNodes array
            me.hiddenNodes = me.filteredNodes;
        } else {
            // visible -> No filter is applied
            // filteredNodes = hiddenNodes, so all hidden nodes will be made visible
            me.filteredNodes = me.hiddenNodes;
            me.hiddenNodes = [];
        }
        Ext.each(me.filteredNodes, function(n) {
            var el = Ext.fly(me.tree.getView().getNodeByRecord(n));
            if (el !== null) {
                el.setDisplayed(visible);
            }
        });
        me.filteredNodes = [];
    },

    addToSelection: function(record) {
        var me = this;
        if(record.get('type') == "layer" || record.get('type') == "document") {
            var addedNode = me.selectedlayers.getRootNode().findChild('id', record.get('id'), true);
            if(addedNode === null) {
                var objData = record.raw;
                objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
                objData.isLeaf = true;
                objData.draggable = true;
                var newNode = Ext.create('TreeNode', objData);
                var treenode = me.selectedlayers.getRootNode();
                if(treenode != null) {
                    treenode.appendChild(newNode);
                }
            }
        }
    },

    getSelection: function() {
        var me = this;
        var addedLayers = '';
        me.selectedlayers.getRootNode().eachChild(function(record) {
            if(addedLayers != '') addedLayers += ',';
            addedLayers += record.get('id');
        });
        return addedLayers;
    },
    
    getCheckedLayers: function() {
        var me = this;
        var records = me.selectedLayers.getView().getChecked();
        var checkedLayers = '';
        Ext.Array.each(records, function(rec){
            if(checkedLayers != '') checkedLayers += ',';
            checkedLayers += rec.get('id');
        });
        return checkedLayers;
    }
    
});