/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
    useCheckboxes: false,
    allowLevelMove: false,
    copyChildren: true,
    returnJson: false,
    checkBackendOnMove: false,
    backendCheckUrl: '',
    checkedLayers: [],
    onlyMoveRootLevels: false,

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
        this.applyTreeScrollFix();
    },

    /**
     *  Apply fixes to the trees for ExtJS scrolling issues
     */
    applyTreeScrollFix: function() {
        var views = [];
        views.push(this.tree.getView());
        views.push(this.selectedlayers.getView());

        for(var i in views) {
            applyTreeScrollFix(views[i]);
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
            width: 325,
            height: 600,
            scroll: false,
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.addNode(record);
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
            width: 325,
            height: 600,
            scroll: false,
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.removeLayers();
                },
                itemclick: function(view, record, item, index, event, eOpts) {
                    if(me.onlyMoveRootLevels) {
                        if(record.parentNode.parentNode === null) me.disableMoveButtons(false);
                        else me.disableMoveButtons(true);
                    }
                }
            }
        });

        if(me.useCheckboxes) {
            me.selectedlayers.on('checkchange', function(record, checked) {
                var recordid = record.get('id').substring(1);
                var recordtype = record.get('type');
                if(recordtype == "layer") {
                    me.handleLayerCheckChange(record, recordid, checked);
                }
            });
        }

        Ext.create('Ext.Button', {
            renderTo: me.layerSelectionButtons,
            icon: me.moveRightIcon,
            width: 23,
            height: 22,
            listeners: {
                click: function() {
                    me.addSelectedLayers()
                },
                afterrender: function(button) {
                    me.fixButtonLayout(button);
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
                    me.removeLayers();
                },
                afterrender: function(button) {
                    me.fixButtonLayout(button);
                }
            }
        });

        me.moveUpButton = Ext.create('Ext.Button', {
            icon: me.moveUpIcon,
            width: 23,
            height: 22,
            renderTo: me.layerMoveButtons,
            listeners: {
                click: function() {
                    me.moveNode('up');
                },
                afterrender: function(button) {
                    me.fixButtonLayout(button);
                }
            }
        });

        me.moveDownButton = Ext.create('Ext.Button', {
            icon: me.moveDownIcon,
            width: 23,
            height: 22,
            renderTo: me.layerMoveButtons,
            listeners: {
                click: function() {
                    me.moveNode('down');
                },
                afterrender: function(button) {
                    me.fixButtonLayout(button);
                }
            }
        });
    },

    disableMoveButtons: function(disable) {
        var me = this;
        me.moveUpButton.setDisabled(disable);
        me.moveDownButton.setDisabled(disable);
    },

    fixButtonLayout: function(button) {
        // Dirty hack to fix icon problem
        if(Ext.isIE9) {
            Ext.Array.each(Ext.fly(button.el).query('.x-btn-inner'), function(obj) {
                obj.className = '';
            });
        }
    },

    handleLayerCheckChange: function(record, recordid, checked) {
        var me = this;
        recordid = parseInt(recordid);
        if(!checked) {
            me.selectedlayers.getRootNode().eachChild(function(rootlevel) {
                if(rootlevel.get('type') == 'level') {
                    Ext.Array.remove(rootlevel.get('checkedlayers'), recordid);
                }
            });
            Ext.Array.remove(me.checkedLayers, recordid);
        } else {
            // We are not using recordid here, but request the record id from the record because of the type-prefix
            var rootNode = me.findRootNode(record.get('id'));
            if(rootNode.get('type') == 'level') {
                var rootNodeCheckedLayers = rootNode.get('checkedlayers');
                if(!Ext.Array.contains(rootNodeCheckedLayers, recordid)) {
                    rootNodeCheckedLayers.push(recordid);
                }
            }
            if(!Ext.Array.contains(me.checkedLayers, recordid)) {
                me.checkedLayers.push(recordid);
            }
        }
    },

    findRootNode: function(recordid) {
        var me = this;
        var node = me.selectedLayersStore.getNodeById(recordid);
        if(Ext.isEmpty(node.get('parentid'))) {
            return node;
        } else {
            return me.findRootNode(node.parentNode.get('id'));
        }
    },

    moveNode: function(direction) {
        var me = this;
        var rootNode = me.selectedlayers.getRootNode();
        Ext.Array.each(me.selectedlayers.getSelectionModel().getSelection(), function(record) {
            var node = rootNode.findChild('id', record.get('id'), true);
            var sib = null;
            if(direction == 'down') {
                sib = node.nextSibling;
                if(sib !== null) {
                    rootNode.insertBefore(sib, node);
                }
            } else {
                sib = node.previousSibling;
                if(sib !== null) {
                    rootNode.insertBefore(node, sib);
                }
            }
        });
    },

    setAllNodesVisible: function(visible) {
        var me = this;
        var treeview = me.tree.getView();
        var showAllNodes = function(treeview, node) {
            var el = Ext.fly(treeview.getNodeByRecord(node));
            if(el !== null) el.setDisplayed(true);
            if(node.hasChildNodes()) {
                node.eachChild(function(childnode) {
                    showAllNodes(treeview, childnode);
                });
            }
        }
        if(!visible) {
            // !visible -> A filter is being applied
            // Save all nodes that are being filtered in hiddenNodes array
            me.hiddenNodes = me.filteredNodes;
        } else {
            // visible -> No filter is applied
            // filteredNodes = hiddenNodes, so all hidden nodes will be made visible
            me.filteredNodes = [];
            me.hiddenNodes = [];
            showAllNodes(treeview, me.tree.getRootNode());
            return;
        }
        Ext.each(me.filteredNodes, function(n) {
            var el = Ext.fly(treeview.getNodeByRecord(n));
            if (el !== null) {
                el.setDisplayed(visible);
            }
        });
        me.filteredNodes = [];
    },

    addSelectedLayers: function() {
        var me = this;
        Ext.Array.each(me.tree.getSelectionModel().getSelection(), function(record) {
            me.addNode(record);
        });
    },

    addNode: function(record) {
        var me = this;
        if(me.checkBackendOnMove && me.backendCheckUrl != '') {
            me.addToSelectionWithBackendCheck(record);
        } else {
            me.addToSelection(record);
        }
    },

    addToSelectionWithBackendCheck: function(record) {
        var me = this;
        Ext.Ajax.request({
            url: me.backendCheckUrl,
            params: {
                selectedContent: me.getSelection(),
                contentToBeSelected: Ext.JSON.encode({
                    id: record.get('id').substring(1),
                    type: record.get('type')
                })
            },
            success: function ( result, request ) {
                result = Ext.JSON.decode(result.responseText);
                if(result.result) {
                    me.addToSelection(record)
                } else {
                    Ext.MessageBox.alert("Foutmelding", result.message);
                }
            },
            failure: function() {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de laag niet kan worden toegevoegd");
            }
        });
    },

    addToSelection: function(record) {
        var me = this;
        var nodeType = record.get('type');
        if(((nodeType == "layer" || nodeType == "document") && !record.get('isVirtual')) || (me.allowLevelMove && nodeType == "level" && !me.onRootLevel(record, me.tree))) {
            var addedNode = me.selectedlayers.getRootNode().findChild('id', record.get('id'), true);
            if(addedNode === null) {
                var objData = record.raw;
                objData.text = objData.name; // For some reason text is not mapped to name when creating a new model
                objData.isLeaf = true;
                if(nodeType == "level") {
                    objData.isLeaf = false;
                    objData.checkedlayers = [];
                }
                if(me.useCheckboxes && nodeType != "level") objData.checked = false;
                var newNode = Ext.create('TreeNode', objData);
                var treenode = me.selectedlayers.getRootNode();
                if(treenode != null) {
                    treenode.appendChild(newNode);
                }
            }
        }
    },

    onRootLevel: function(record, tree) {
        var foundNode = tree.getRootNode().findChild('id', record.get('id'), false);
        if(foundNode !== null) return true;
        return false;
    },

    removeLayers: function() {
        var me = this;
        var rootNode = me.selectedlayers.getRootNode();
        Ext.Array.each(me.selectedlayers.getSelectionModel().getSelection(), function(record) {
            rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
            if(me.useCheckboxes && record.get('type') == 'level') {
                me.checkedLayers = Ext.Array.difference(me.checkedLayers, record.get('checkedlayers'));
            }
        });
    },

    getSelection: function() {
        var me = this;
        var addedLayers = '';
        if(me.returnJson) {
            addedLayers = [];
        }
        me.selectedlayers.getRootNode().eachChild(function(record) {
            if(!me.returnJson) {
                if(addedLayers != '') addedLayers += ',';
                addedLayers += record.get('id');
            } else {
                addedLayers.push({
                    'id': record.get('id').substring(1),
                    'type': record.get('type')
                });
            }
        });
        if(me.returnJson) {
            addedLayers = Ext.JSON.encode(addedLayers);
        }
        return addedLayers;
    },

    getCheckedLayers: function() {
        var me = this;
        return Ext.JSON.encode(me.checkedLayers);
    }

});