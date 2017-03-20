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
    removeIcon: removeicon || '',
    unremoveIcon: unremoveicon || '',
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
    deletedRecords: [],
    onlyMoveRootLevels: false,
    useDeleteButton: false,
    useArrowLeftAsDelete: false,

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
            selModel: {
                mode: "MULTI"
            },
            viewConfig: this.getViewConfig('collection'),
            useArrows: true,
            frame: true,
            renderTo: me.treeContainer,
            width: 325,
            height: 600,
            autoScroll: true,
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
                        keyup :  function(textfield, e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var timeout = 500;
                            if(e.getKey() === Ext.event.Event.RETURN) {
                                timeout = 0;
                            }
                            var textvalue = this.getValue();
                            if(me.filterTimer !== 0) {
                                clearTimeout(me.filterTimer);
                            }
                            me.filterTimer = window.setTimeout(function() {
                                me.setAllNodesVisible(true);
                                if(textvalue !== '') {
                                    var re = new RegExp(Ext.String.escapeRegex(textvalue), 'i');
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
                            }, timeout);
                            return false;
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
            selModel: {
                mode: "MULTI"
            },
            viewConfig: this.getViewConfig('selection'),
            useArrows: true,
            frame: true,
            renderTo: me.selectedLayersContainer,
            width: 325,
            height: 600,
            autoScroll: true,
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.removeNodes([ record ]);
                },
                itemclick: function(view, record, item, index, event, eOpts) {
                    var disableButtons = false;
                    if(me.onlyMoveRootLevels && !me.onlyRootLevels(me.selectedlayers.getSelectionModel().getSelection())) {
                        disableButtons = true;
                    }
                    me.disableMoveButtons(disableButtons);
                    if(me.deleteButton) me.deleteButton.setIcon(record.get("isRemoved") === true ? me.unremoveIcon : me.removeIcon);
                }
            }
        });

        if(me.useCheckboxes) {
            me.selectedlayers.on('checkchange', function(record, checked) {
                var recordid = record.get('id').substring(1);
                var recordtype = record.get('type');
                if(recordtype === "layer") {
                    me.handleLayerCheckChange(record, recordid, checked);
                }
            });
        }

        Ext.create('Ext.Button', {
            renderTo: me.layerSelectionButtons,
            icon: me.moveRightIcon,
            width: 23,
            height: 22,
            cls: 'plain-button',
            listeners: {
                click: function() {
                    me.addNodes(me.tree.getSelectionModel().getSelection());
                }
            }
        });

        Ext.create('Ext.Button', {
            renderTo: me.layerSelectionButtons,
            icon: me.moveLeftIcon,
            width: 23,
            height: 22,
            cls: 'plain-button',
            listeners: {
                click: function() {
                    me.removeNodes(me.selectedlayers.getSelectionModel().getSelection());
                }
            }
        });

        me.moveUpButton = Ext.create('Ext.Button', {
            icon: me.moveUpIcon,
            width: 23,
            height: 22,
            renderTo: me.layerMoveButtons,
            cls: 'plain-button',
            listeners: {
                click: function() {
                    me.moveNodes('up');
                }
            }
        });

        me.moveDownButton = Ext.create('Ext.Button', {
            icon: me.moveDownIcon,
            width: 23,
            height: 22,
            renderTo: me.layerMoveButtons,
            cls: 'plain-button',
            listeners: {
                click: function() {
                    me.moveNodes('down');
                }
            }
        });

        if(this.useDeleteButton && !this.useArrowLeftAsDelete) {
            me.deleteButton = Ext.create('Ext.Button', {
                icon: me.removeIcon,
                width: 23,
                height: 22,
                renderTo: me.layerMoveButtons,
                cls: 'plain-button',
                listeners: {
                    click: function() {
                        me.markRemoved();
                    }
                }
            });
        }
    },
    
    getViewConfig: function(treeType) {
        var me = this;
        return {
            plugins: {
                ptype: 'treeviewdragdrop',
                appendOnly: false,
                allowContainerDrops: true,
                allowParentInserts: true,
                sortOnDrop: true
            },
            getRowClass: function(record, index, rowParams, store) {
                var hasParentRemoved = false;
                var parent = record.parentNode;
                while(parent && !hasParentRemoved) {
                    if(parent.get("isRemoved") === true) {
                        hasParentRemoved = true;
                    }
                    parent = parent.parentNode;
                }
                return record.get('isRemoved') || hasParentRemoved ? 'removed' : '';
            },
            listeners: {
                // beforedrop is executed when node is dropped on container (so not on another node but on 'empty' space'
                beforedrop: function(targetNode, data, overModel, dropPosition, dropHandlers, eOpts) {
                    // We cancel the drop (do not append the actual layers because we still need some validation)
                    dropHandlers.cancelDrop();
                    // We are in the selection tree && target and dragged node are both in same tree
                    if(treeType === 'selection' && targetNode.offsetParent === data.item.offsetParent) {
                        // If moveOnlyRootLevels is configured, check if we only selected root levels,
                        // else return false
                        if(me.onlyMoveRootLevels && !me.onlyRootLevels(data.records)) {
                            return false;
                        }
                        me.moveNodesToPosition(data, dropPosition === 'after');
                        return true;
                    }
                    // Add/remove layers
                    me.handleDrag(treeType, data);
                }
            }  
        };
    },
    
    /**
     * Add/Remove layers after drag
     */
    handleDrag: function(treeType, data) {
        if(treeType === 'collection') {
            // Manually remove all layers which we dragged to other tree
            this.removeNodes(data.records);
        }
        if(treeType === 'selection') {
            // Manually move all layers which we dragged to other tree
            this.addNodes(data.records);
        }
    },
    
    onlyRootLevels: function(records) {
        for(var i = 0; i < records.length; i++) {
            if(records[i].parentNode.parentNode !== null) {
                return false;
            }
        }
        return true;
    },

    disableMoveButtons: function(disable) {
        var me = this;
        me.moveUpButton.setDisabled(disable);
        me.moveDownButton.setDisabled(disable);
    },

    handleLayerCheckChange: function(record, recordid, checked) {
        var me = this;
        recordid = parseInt(recordid);
        if(!checked) {
            me.selectedlayers.getRootNode().eachChild(function(rootlevel) {
                if(rootlevel.get('type') === 'level') {
                    Ext.Array.remove(rootlevel.get('checkedlayers'), recordid);
                }
            });
            Ext.Array.remove(me.checkedLayers, recordid);
        } else {
            // We are not using recordid here, but request the record id from the record because of the type-prefix
            var rootNode = me.findRootNode(record.get('id'));
            if(rootNode.get('type') === 'level') {
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

    markRemoved: function() {
        var selection = this.selectedlayers.getSelectionModel().getSelection();
        var recordid;
        var recordtype;
        var removeIdx = -1;
        for(var i = 0; i < selection.length; i++) {
            recordid = parseInt(selection[i].get('id').substring(1), 10);
            recordtype = selection[i].get('type');
            removeIdx = -1;
            for(var j = 0; j < this.deletedRecords.length; j++) {
                if(this.deletedRecords[j].id === recordid && this.deletedRecords[j].type === recordtype) {
                    removeIdx = j;
                }
            }
            if(removeIdx === -1) {
                selection[i].set("isRemoved", true);
                this.deletedRecords.push({ id: recordid, type: recordtype })
                if(this.deleteButton) this.deleteButton.setIcon(this.unremoveIcon);
            } else {
                selection[i].set("isRemoved", false);
                this.deletedRecords.splice(removeIdx, 1);
                if(this.deleteButton) this.deleteButton.setIcon(this.removeIcon);
            }
            if(!selection[i].get("leaf") && selection[i].get("expanded")) {
                selection[i].collapse();
                selection[i].expand();
            }
        }
    },

    moveNodes: function(direction) {
        var me = this;
        var rootNode = me.selectedlayers.getRootNode();
        var selection = me.selectedlayers.getSelectionModel().getSelection();
        var allNodes = rootNode.childNodes;
        var doSort = true;
        // First check if we are going to sort (we do not sort when the first item is selected and direction = up
        // or we do not sort when last item is selected and direction = down
        for(var i = 0; i < selection.length; i++) {
            var index = this.findIndex(allNodes, selection[i]);
            if((index === 0 && direction === 'up') || (index === (allNodes.length - 1) && direction === 'down')) {
                doSort = false;
            }
        }
        // If no sorting, return
        if(!doSort) {
            return;
        }
        // Sort selection by index
        selection.sort((function sortOnIndex(a, b) {
            var indexA = this.findIndex(allNodes, a);
            var indexB = this.findIndex(allNodes, b);
            return indexA - indexB;
        }).bind(this));
        // We manually sort because this is much faster than moving the nodes directly in the tree
        if(direction === 'down') {
            // Moving down we iterate back
            for(var i = (selection.length - 1); i >= 0; i--) {
                var index = this.findIndex(allNodes, selection[i]);
                this.moveNodeInArray(allNodes, index+1, index);
            }
        } else {
            // Moving up we iterate forward
            for(var i = 0; i < selection.length; i++) {
                var index = this.findIndex(allNodes, selection[i]);
                this.moveNodeInArray(allNodes, index-1, index);
            }
        }
        this.sortNodes(allNodes);
    },
    
    moveNodesToPosition: function(data, below) {
        var rootNode = this.selectedlayers.getRootNode();
        var allNodes = rootNode.childNodes;
        // Get the targetIndex
        var targetIndex = this.findIndex(allNodes, data.event.position.record);
        if(below) {
            targetIndex++;
        }
        // Sort records by index
        data.records.sort((function sortOnIndex(a, b) {
            var indexA = this.findIndex(allNodes, a);
            var indexB = this.findIndex(allNodes, b);
            if(below) {
                return indexA - indexB;
            }
            return indexA - indexB;
        }).bind(this));
        for(var i = 0; i < data.records.length; i++) {
            var current = this.findIndex(allNodes, data.records[i]);
            this.moveNodeInArray(allNodes, (current < targetIndex ? targetIndex - 1 : targetIndex), current);
            targetIndex++;
        }
        this.sortNodes(allNodes);
    },
    
    sortNodes: function(allNodes) {
        // Set indexes
        for(var i = 0; i < allNodes.length; i++) {
            allNodes[i].set('index', i);
        }
        // Sort indexes
        this.selectedlayers.getStore().sort('index', 'ASC');
    },
    
    findIndex: function(allNodes, node) {
        for(var i = 0; i < allNodes.length; i++) {
            if(allNodes[i].get('id') === node.get('id')) {
                return i;
            }
        }
        return -1;
    },
    
    moveNodeInArray: function(list, to, from) {
        list.splice(to, 0, list.splice(from, 1)[0]);
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
        };
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

    addNodes: function(records) {
        var me = this;
        Ext.Array.each(records, function(record) {
            me.addNode(record);
        });
    },

    addNode: function(record) {
        var me = this;
        if(me.checkBackendOnMove && me.backendCheckUrl !== '') {
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
                    me.addToSelection(record);
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
        if(((nodeType === "layer" || nodeType === "document") && !record.get('isVirtual')) || (me.allowLevelMove && nodeType === "level" && !me.onRootLevel(record, me.tree))) {
            var addedNode = me.selectedlayers.getRootNode().findChild('id', record.get('id'), true);
            if(addedNode === null) {
                var objData = this.copyNode(record);
                var expandAfter = objData.children && objData.children.length && !objData.isLeaf;
                var newNode = Ext.create('TreeNode', objData);
                var treenode = me.selectedlayers.getRootNode();
                if(treenode) {
                    treenode.appendChild(newNode);
                    if(expandAfter) {
                        newNode.expand();
                    }
                }
            }
        }
    },
    
    copyNode: function(record) {
        var nodeType = record.get('type');
        var objData = {
            id: record.get('id'),
            isLeaf: nodeType !== "level",
            leaf: nodeType !== "level",
            text: record.get('name'),
            name: record.get('name'),
            type: nodeType
        };
        if(nodeType === "level") {
            objData.checkedlayers = [];
            if(record.childNodes && record.childNodes.length) {
                objData.children = [];
                for(var i = 0; i < record.childNodes.length; i++) {
                    objData.children.push(this.copyNode(record.childNodes[i]));
                }
            }
        } else {
            if(this.useCheckboxes) {
                objData.checked = false;
            }
        }
        return objData;
    },

    onRootLevel: function(record, tree) {
        var foundNode = tree.getRootNode().findChild('id', record.get('id'), false);
        if(foundNode !== null) return true;
        return false;
    },

    removeNodes: function(records) {
        var me = this;
        if(me.useArrowLeftAsDelete) {
            this.markRemoved();
            return;
        }
        var rootNode = this.selectedlayers.getRootNode();
        Ext.Array.each(records, function(record) {
            rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
            if(me.useCheckboxes && record.get('type') === 'level') {
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
                if(addedLayers !== '') addedLayers += ',';
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
    },

    getRemovedRecords: function() {
        return Ext.JSON.encode(this.deletedRecords);
    }

});