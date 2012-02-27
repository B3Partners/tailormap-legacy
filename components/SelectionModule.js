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
/**
 * SelectionModule component
 * Creates a SelectionModule component to build a tree
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */

Ext.define('TreeNode', {
    extend: 'Ext.data.NodeInterface',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'children', type: 'array'},
        {name: 'name', type: 'string'},
        {name: 'type',  type: 'string'},
        {name: 'status', type: 'string'},
        {name: 'class', type: 'string'},
        {name: 'parentid', type: 'string'},
        {name: 'isLeaf', type: 'boolean'},
        {name: 'checkedlayers', type: 'array'},
        // Text is used by tree, mapped to name
        {name: 'text', type: 'string', mapping: 'name'}
    ],
    get: function(fieldName) {
        var nodeType = '';
        if(fieldName == "icon") {
            nodeType = this.get('type');
            if(nodeType == "category" || nodeType == "level") return contextPath + '/viewer-html/components/resources/map.gif';
            if(nodeType == "layer" || nodeType == "appLayer") return contextPath + '/viewer-html/components/resources/folder.gif';
            if(nodeType == "service") return contextPath + '/viewer-html/components/resources/serviceok.gif';
        }
        if(fieldName == "leaf") {
            return this.get('isLeaf');
        }
        // Return default value, taken from ExtJS source
        return this[this.persistenceProperty][fieldName];
    }
});

Ext.define ("viewer.components.SelectionModule",{
    extend: "viewer.components.Component",
    
    // component specific config
    moveRightIcon: '',
    moveLeftIcon: '',
    moveUpIcon: '',
    moveDownIcon: '',
    selectedContent : null,
    appLayers :  null,
    levels : null,
    services : null,
    rootLevel: null,
    rendered: false,
    treePanels: {
        applicationTree: {
            treePanel: null,
            treeStore: null,
            currentState: null,
            treeNodes: []
        },
        registeryTree: {
            treePanel: null,
            treeStore: null,
            currentState: null,
            treeNodes: []
        },
        customServiceTree: {
            treePanel: null,
            treeStore: null,
            currentState: null,
            treeNodes: []
        },
        selectionTree: {
            treePanel: null,
            treeStore: null,
            currentState: null,
            treeNodes: []
        }
    },
    activeTree: null,
    userServices: [],
    config: {
        name: "Selection Module",
        title: "",
        titlebarIcon : "",
        tooltip : "",
        isPopup: true
    },
    constructor: function (conf) {
        conf.width = 700;
        conf.height = 500;
        viewer.components.SelectionModule.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.renderButton();
        return this;
    },
    initComponent: function() {
        var me = this;

        me.moveRightIcon = contextPath + '/viewer-html/components/resources/move-right.gif';
        me.moveLeftIcon = contextPath + '/viewer-html/components/resources/move-left.gif';
        me.moveUpIcon = contextPath + '/viewer-html/components/resources/move-up.gif';
        me.moveDownIcon = contextPath + '/viewer-html/components/resources/move-down.gif';
        
        me.selectedContent = this.viewerController.app.selectedContent;
        me.appLayers = this.viewerController.app.appLayers;
        me.levels = this.viewerController.app.levels;
        me.services = this.viewerController.app.services;
        me.rootLevel = this.viewerController.app.rootLevel;

        me.initInterface();
        me.initTreeSelectionContainer();
        me.initTrees();
        
        if(me.config.selectGroups) {
            me.initApplicationLayers();
        }
        me.loadSelectedLayers();
        me.activeTree = me.treePanels.applicationTree.treePanel;
        
        console.log(me);
    },
   
    renderButton: function() {
        var me = this;
        Ext.create('Ext.button.Button', {
            text: 'SelectionModule',
            renderTo: me.div,
            handler: function() {
                me.popup.show();
                if(!me.rendered) {
                    me.initComponent();
                }
            }
        });
    },

    initInterface: function() {
        var me = this;
        // Create main container
        Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: me.popup.getContentId(),
            items: [
                {
                    // Form above the trees with radiobuttons and textfields
                    xtype: 'form',
                    items: [{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        border: 0,
                        defaults: {
                            xtype: 'radio',
                            style: {
                                marginRight: '5px'
                            }
                        },
                        items: [
                            { id: 'radioApplication', checked: true, name: 'layerSource', boxLabel: 'Kaart', listeners: { change: function(field, newval) { me.handleSourceChange(field, newval) } } },
                            { id: 'radioRegistry', name: 'layerSource', boxLabel: 'Kaartlaag', listeners: { change: function(field, newval) { me.handleSourceChange(field, newval) } } },
                            { id: 'radioCustom', name: 'layerSource', boxLabel: 'Eigen service', listeners: { change: function(field, newval) { me.handleSourceChange(field, newval) } } },
                            { xtype: 'textfield', hidden: true, id: 'customServiceUrlTextfield', flex: 1 },
                            { xtype: 'combo', store: [ ['wms','WMS'], ['csw','CWS'], ['arcims','ArcIMS'], ['arcgis','ArcGIS'] ], hidden: true, id: 'customServiceUrlSelect' },
                            { xtype: 'button', text: 'Service ophalen', hidden: true, id: 'customServiceUrlButton', handler: function() {
                                var protocol = Ext.getCmp('customServiceUrlSelect').getValue();
                                if(protocol == 'csw') {
                                    // do something with CSW
                                } else {
                                    var url = Ext.getCmp('customServiceUrlTextfield').getValue();
                                    var si = Ext.create("viewer.ServiceInfo", {
                                        protocol: protocol,
                                        url: url
                                    });
                                    
                                    si.loadInfo(
                                        function(info) {
                                            me.populateCustomServiceTree(info);
                                        },
                                        function(msg) {
                                            Ext.MessageBox.alert("Foutmelding", msg);
                                        }
                                    );
                                }
                            }}
                        ]
                    }],
                    height: 35,
                    width: '100%',
                    padding: '5px',
                    border: 0
                },
                {
                    xtype: 'container',
                    flex: 1,
                    width: '100%',
                    html: '<div id="treeSelectionContainer" style="width: 100%; height: 100%;"></div>'
                }
            ]
        });
    },
    
    initTreeSelectionContainer: function() {
        var me = this;
        Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            width: '100%',
            height: '100%',
            items: [
                {
                    xtype: 'container',
                    flex: 1,
                    html: '<div id="applicationTreeContainer" style="position: absolute; width: 100%; height: 100%; visibility: visible;"></div>' + 
                          '<div id="registeryTreeContainer" style="position: absolute; width: 100%; height: 100%; visibility: hidden;"></div>' + 
                          '<div id="customTreeContainer" style="position: absolute; width: 100%; height: 100%; visibility: hidden;"></div>'
                },
                { xtype: 'container', width: 30, layout: { type: 'vbox', align: 'center' }, items: [
                    { xtype: 'container', html: '<div></div>', flex: 1 },
                    {
                        xtype: 'button',
                        icon: me.moveRightIcon,
                        width: 23,
                        height: 22,
                        handler: function() {
                            me.addSelectedLayers();
                        }
                    },
                    {
                        xtype: 'button',
                        icon: me.moveLeftIcon,
                        width: 23,
                        height: 22,
                        handler: function() {
                            me.removeLayers();
                        }
                    },
                    { xtype: 'container', html: '<div></div>', flex: 1 }
                ]},
                {
                    xtype: 'container',
                    flex: 1,
                    html: '<div id="selectionTreeContainer" style="width: 100%; height: 100%; visibility: visible;"></div>'
                },
                { xtype: 'container', width: 30, layout: { type: 'vbox', align: 'center' }, items: [
                    { xtype: 'container', html: '<div></div>', flex: 1 },
                    {
                        xtype: 'button',
                        icon: me.moveUpIcon,
                        width: 23,
                        height: 22,
                        handler: function() {
                            me.moveNode('up');
                        }
                    },
                    {
                        xtype: 'button',
                        icon: me.moveDownIcon,
                        width: 23,
                        height: 22,
                        handler: function() {
                            me.moveNode('down');
                        }
                    },
                    { xtype: 'container', html: '<div></div>', flex: 1 }
                ]}
            ],
            renderTo: 'treeSelectionContainer'
        });
    },
    
    initTrees: function() {
        var me = this;
        
        var defaultStoreConfig = {
            model: 'TreeNode',
            root: {
                text: 'Root',
                expanded: true,
                checked: false,
                children: []
            }
        };
        
        var defaultTreeConfig = {
            xtype: 'treepanel',
            rootVisible: false,
            useArrows: true,
            width: '100%',
            height: '100%',
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    console.log('dblclick');
                    me.addNode(record);
                }
            }
        };

        if(me.config.selectGroups) {
            me.treePanels.applicationTree.treeStore = Ext.create('Ext.data.TreeStore', defaultStoreConfig);
            me.treePanels.applicationTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
                treePanelType: 'applicationTree',
                store: me.treePanels.applicationTree.treeStore,
                renderTo: 'applicationTreeContainer',
                tbar: [{ xtype : 'textfield' },
                    {
                        xtype: 'button',
                        text: 'Zoeken',
                        handler: function() {
                            var tree = me.treePanels.applicationTree.treePanel;
                            me.treePanels.applicationTree.currentState = tree.getState();
                            console.log(tree.getDockedItems());
                        }
                    }
                ]
            }));
        }
        
        if(me.config.selectLayers) {
            me.treePanels.registeryTree.treeStore = Ext.create('Ext.data.TreeStore', defaultStoreConfig);
            me.treePanels.registeryTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
                treePanelType: 'registeryTree',
                store: me.treePanels.registeryTree.treeStore,
                renderTo: 'registeryTreeContainer',
                tbar: [{ xtype : 'textfield' },
                    {
                        xtype: 'button',
                        text: 'Zoeken',
                        handler: function() {
                            var tree = me.treePanels.applicationTree.treePanel;
                            me.treePanels.registeryTree.currentState = tree.getState();
                            console.log(tree.getDockedItems());
                        }
                    }
                ]
            }));
        }
        
        if(me.config.selectOwnServices) {
            me.treePanels.customServiceTree.treeStore = Ext.create('Ext.data.TreeStore', defaultStoreConfig);
            me.treePanels.customServiceTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
                treePanelType: 'customServiceTree',
                store: me.treePanels.customServiceTree.treeStore,
                renderTo: 'customTreeContainer',
                tbar: [{ xtype : 'textfield' },
                    {
                        xtype: 'button',
                        text: 'Zoeken',
                        handler: function() {
                            var tree = me.treePanels.customServiceTree.treePanel;
                            me.treePanels.customServiceTree.currentState = tree.getState();
                            console.log(tree.getDockedItems());
                        }
                    }
                ]
            }));
        }
        
        me.treePanels.selectionTree.treeStore = Ext.create('Ext.data.TreeStore', defaultStoreConfig);
        me.treePanels.selectionTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
            treePanelType: 'selectionTree',
            store: me.treePanels.selectionTree.treeStore,
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.removeLayers();
                }
            },
            renderTo: 'selectionTreeContainer'
        }));
    },
    
    initApplicationLayers: function() {
        var me = this;
        var level = me.addLevel(me.rootLevel, true, false);
        me.insertTreeNode(level, me.treePanels.applicationTree.treePanel);
    },

    loadSelectedLayers: function() {
        var me = this;
        var nodes = [];
        for ( var i = 0 ; i < me.selectedContent.length ; i ++){
            var contentItem = me.selectedContent[i];
            if(contentItem.type ==  "level"){
                var level = me.addLevel(contentItem.id, false, false);
                if(level != null){
                    nodes.push(level);
                }
            }else if(contentItem.type == "appLayer"){
                var layer = me.addLayer(contentItem.id);
                nodes.push(layer);
            }
        }
        me.insertTreeNode(nodes, me.treePanels.selectionTree.treePanel);
    },

    addLevel: function(levelId, showChildren, showLayers) {
        var me = this;
        if(!Ext.isDefined(me.levels[levelId])) {
            return null;
        }
        var level = me.levels[levelId];
        if(level.background) {
            return null;
        }
        var treeNodeLayer = me.createNode('n' + level.id, level.name, level.id, false);
        treeNodeLayer.type = 'level';
        if(Ext.isDefined(level.layers)) {
            treeNodeLayer.type = 'maplevel';
            treeNodeLayer.id = 'm' + level.id;
        }
        if(showChildren) {
            var nodes = [];
            if(Ext.isDefined(level.children)) {
                for(var i = 0 ; i < level.children.length; i++) {
                    var l = me.addLevel(level.children[i], showChildren, showLayers);
                    if(l !== null) {
                        nodes.push(l);
                    }
                }
            }
            if(Ext.isDefined(level.layers) && showLayers) {
                for(var j = 0 ; j < level.layers.length ; j ++) {
                    nodes.push(me.addLayer(level.layers[j]));
                }
            }
            treeNodeLayer.children = nodes;
        }
        return treeNodeLayer;
    },
    
    addLayer: function (layerId){
        var me = this;
        if(!Ext.isDefined(me.appLayers[layerId])) {
            return null;
        }
        var appLayerObj = me.appLayers[layerId];
        var service = me.services[appLayerObj.serviceId];
        var layerTitle = me.viewerController.getLayerTitle(service.id, appLayerObj.layerName);
        var treeNodeLayer = me.createNode('l' + appLayerObj.id, layerTitle, service.id, true);
        treeNodeLayer.origData.layerName = appLayerObj.layerName;
        treeNodeLayer.type = 'layer';
        return treeNodeLayer;
    },
    
    createNode: function (nodeid, nodetext, serviceid, leaf) {
        return {
            text: nodetext,
            id: nodeid,
            expanded: true,
            leaf: leaf,
            origData: {
                id: nodeid.substring(1),
                service: serviceid
            }
        };
    },

    insertTreeNode: function(node, treepanel) {
        var me = this;
        var root = treepanel.getRootNode();
        root.appendChild(node);
        root.expand();
    },
    
    handleSourceChange: function(field, newval) {
        var me = this;
        var customServiceUrlTextfield = Ext.getCmp('customServiceUrlTextfield');
        var customServiceUrlSelect = Ext.getCmp('customServiceUrlSelect');
        var customServiceUrlButton = Ext.getCmp('customServiceUrlButton');
        var applicationTreeContainer = Ext.get('applicationTreeContainer');
        var registeryTreeContainer = Ext.get('registeryTreeContainer');
        var customTreeContainer = Ext.get('customTreeContainer');
        
        if(newval) {
            customServiceUrlTextfield.setVisible(false);
            customServiceUrlSelect.setVisible(false);
            customServiceUrlButton.setVisible(false);
            applicationTreeContainer.setStyle('visibility', 'hidden');
            registeryTreeContainer.setStyle('visibility', 'hidden');
            customTreeContainer.setStyle('visibility', 'hidden');
            if(field.id == 'radioApplication') {
                applicationTreeContainer.setStyle('visibility', 'visible');
                me.activeTree = me.treePanels.applicationTree.treePanel;
            }
            if(field.id == 'radioRegistry') {
                registeryTreeContainer.setStyle('visibility', 'visible');
                me.activeTree = me.treePanels.registeryTree.treePanel;
            }
            if(field.id == 'radioCustom') {
                customTreeContainer.setStyle('visibility', 'visible');
                me.activeTree = me.treePanels.customServiceTree.treePanel;
                customServiceUrlTextfield.setVisible(true);
                customServiceUrlSelect.setVisible(true);
                customServiceUrlButton.setVisible(true);
            }
        }
    },
    
    populateCustomServiceTree: function(userService) {
        var me = this;
        me.userServices.push(userService);
        var rootNode = me.treePanels.customServiceTree.treePanel.getRootNode();
        // First remove all current children
        rootNode.removeAll(true);
        // Create service node
        var userServiceId = 'us' + me.userServices.length;
        var serviceNode = me.createNode('s' + userServiceId, userService.name, userServiceId, false);
        serviceNode.type = 'service';
        serviceNode.children = me.createCustomNodesList(userService.topLayer, userServiceId);
        me.insertTreeNode(serviceNode, me.treePanels.customServiceTree.treePanel);
    },
    
    createCustomNodesList: function(node, serviceid) {
        var me = this;
        var treeNode = null;
        if(!node.virtual) {
            var leaf = true;
            if(node.children.length > 0) leaf = false;
            treeNode = me.createNode('l' + Ext.id(), node.title, serviceid, leaf);
            treeNode.origData.layerName = node.name;
            treeNode.type = 'layer';
        }
        if(node.children.length > 0) {
            var childnodes = [];
            for(var i = 0 ; i < node.children.length; i++) {
                var l = me.createCustomNodesList(node.children[i], serviceid);
                if(l !== null) {
                    childnodes.push(l);
                }
            }
            if(node.virtual) return childnodes;
            treeNode.children = childnodes;
        }
        return treeNode;
    },
    
    moveNode: function(direction) {
        var me = this;
        var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
        Ext.Array.each(me.treePanels.selectionTree.treePanel.getSelectionModel().getSelection(), function(record) {
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

    addSelectedLayers: function() {
        var me = this;
        Ext.Array.each(me.activeTree.getSelectionModel().getSelection(), function(record) {
            me.addNode(record);
        });
    },
    
    addNode: function(record) {
        var me = this;
        me.addToSelection(record);
    },

    addToSelection: function(record) {
        var me = this;
        var nodeType = record.raw.type;
        if(nodeType == "layer" || (nodeType == "maplevel" && !me.onRootLevel(record, me.activeTree))) {
            var addedNode = addedNode = me.treePanels.selectionTree.treePanel.getRootNode().findChild('id', record.get('id'), true);
            if(addedNode !== null && nodeType == "maplevel") {
                addedNode = me.searchLevelChildNodes(record);
            }
            if(addedNode === null) {
                var objData = record.raw;
                var treenode = me.treePanels.selectionTree.treePanel.getRootNode();
                if(treenode !== null) {
                    treenode.appendChild(objData);
                }
            }
        }
    },
    
    searchLevelChildNodes: function(record) {
        var me = this;
        console.log(me.levels[record.raw.origData.id]);
        return null;
    },
    
    onRootLevel: function(record, tree) {
        var foundNode = tree.getRootNode().findChild('id', record.get('id'), false);
        if(foundNode !== null) return true;
        return false;
    },
    
    removeLayers: function() {
        var me = this;
        var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
        Ext.Array.each(me.treePanels.selectionTree.treePanel.getSelectionModel().getSelection(), function(record) {
            rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
        });
    }
    
});