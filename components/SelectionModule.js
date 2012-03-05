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

Ext.define('select.TreeNode', {
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
        {name: 'checkedlayers', type: 'array'},
        // Text is used by tree, mapped to name
        {name: 'text', type: 'string', mapping: 'name'}
    ],
    get: function(fieldName) {
        var nodeType = '';
        if(fieldName == "icon") {
            nodeType = this.get('type');
            if(nodeType == "category" || nodeType == "level") return contextPath + '/viewer-html/components/resources/folder.png';
            if(nodeType == "maplevel") return contextPath + '/viewer-html/components/resources/maplevel.png';
            if(nodeType == "layer" || nodeType == "appLayer") return contextPath + '/viewer-html/components/resources/map.png';
            if(nodeType == "service") return contextPath + '/viewer-html/components/resources/serviceok.png';
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
    addedLevels: [],
    addedLevelsCount: 0,
    addedLayers: [],
    addedLayersCount: 0,
    addedServices: [],
    addedServicesCount: 0,
    rootLevel: null,
    rendered: false,
    treePanels: {
        applicationTree: {
            treePanel: null,
            treeStore: null,
            filteredNodes: [],
            hiddenNodes: []
        },
        registryTree: {
            treePanel: null,
            treeStore: null,
            filteredNodes: [],
            hiddenNodes: []            
        },
        customServiceTree: {
            treePanel: null,
            treeStore: null,
            filteredNodes: [],
            hiddenNodes: []
        },
        selectionTree: {
            treePanel: null,
            treeStore: null,
            filteredNodes: [],
            hiddenNodes: []
        }
    },
    activeTree: null,
    userServices: [],
    config: {
        name: "Selection Module",
        title: "",
        titlebarIcon : "",
        tooltip : ""
    },
    constructor: function (conf) {
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
        
        me.initViewerControllerData();

        me.initInterface();
        me.initTreeSelectionContainer();
        me.initTrees();
        
        if(me.config.selectGroups) {
            me.initApplicationLayers();
        }
        me.loadSelectedLayers();
        me.activeTree = me.treePanels.applicationTree.treePanel;
        
        me.popup.popupWin.on('hide', function() {
            var treeContainers = Ext.query('.selectionModuleTreeContainer');
            Ext.Array.each(treeContainers, function(treeContainer) {
                treeContainer.style.display = 'none';
            });
        });
        me.popup.popupWin.on('show', function() {
            var treeContainers = Ext.query('.selectionModuleTreeContainer');
            Ext.Array.each(treeContainers, function(treeContainer) {
                treeContainer.style.display = 'block';
            });
        });
        
        me.rendered = true;
    },
    
    initViewerControllerData: function() {
        var me = this;
        // We make a cloned reference, so we can easily edit this array and merge it to the original after clicking 'Ok'
        me.selectedContent = Ext.clone(this.viewerController.app.selectedContent);
        me.appLayers = this.viewerController.app.appLayers;
        me.levels = this.viewerController.app.levels;
        me.services = this.viewerController.app.services;
        me.rootLevel = this.viewerController.app.rootLevel;
    },
   
    renderButton: function() {
        var me = this;
        this.superclass.renderButton.call(this,{
            text: me.title,
            icon: me.titlebarIcon,
            tooltip: me.tooltip,
            handler: function() {
                me.popup.show();
                if(!me.rendered) {
                    me.initComponent();
                } else {
                    me.initViewerControllerData();
                    me.loadSelectedLayers();
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
                        defaultType: 'radio',
                        items: [
                            {id: 'radioApplication', checked: true, name: 'layerSource', boxLabel: 'Kaart', listeners: {change: function(field, newval) {me.handleSourceChange(field, newval)}}},
                            {id: 'radioRegistry', name: 'layerSource', boxLabel: 'Kaartlaag', listeners: {change: function(field, newval) {me.handleSourceChange(field, newval)}}},
                            {id: 'radioCustom', name: 'layerSource', boxLabel: 'Eigen service', listeners: {change: function(field, newval) {me.handleSourceChange(field, newval)}}},
                            {xtype: 'textfield', hidden: true, id: 'customServiceUrlTextfield', flex: 1},
                            {xtype: 'combo', store: [ ['wms','WMS'], /*['csw','CSW'],*/ ['arcims','ArcIMS'], ['arcgis','ArcGIS'] ], hidden: true, id: 'customServiceUrlSelect'},
                            {xtype: 'button', text: 'Service ophalen', hidden: true, id: 'customServiceUrlButton', handler: function() {
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
                },
                {
                    // Form above the trees with radiobuttons and textfields
                    xtype: 'form',
                    layout: {
                        type:'hbox',
                        pack:'end'
                    },
                    items: [
                            {xtype: 'button', text: 'Annuleren', handler: function() {
                                me.cancelSelection();
                            }},
                            {xtype: 'button', text: 'Opslaan', handler: function() {
                                me.saveSelection();
                            }}
                    ],
                    height: 35,
                    width: '100%',
                    padding: '5px',
                    border: 0
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
                    html: '<div id="applicationTreeContainer" class="selectionModuleTreeContainer" style="position: absolute; width: 100%; height: 100%; visibility: visible;"></div>' + 
                          '<div id="registryTreeContainer" class="selectionModuleTreeContainer" style="position: absolute; width: 100%; height: 100%; visibility: hidden;"></div>' + 
                          '<div id="customTreeContainer" class="selectionModuleTreeContainer" style="position: absolute; width: 100%; height: 100%; visibility: hidden;"></div>'
                },
                {xtype: 'container', width: 30, layout: {type: 'vbox', align: 'center'}, items: [
                    {xtype: 'container', html: '<div></div>', flex: 1},
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
                            me.removeSelectedNodes();
                        }
                    },
                    {xtype: 'container', html: '<div></div>', flex: 1}
                ]},
                {
                    xtype: 'container',
                    flex: 1,
                    html: '<div id="selectionTreeContainer" class="selectionModuleTreeContainer" style="width: 100%; height: 100%; visibility: visible;"></div>'
                },
                {xtype: 'container', width: 30, layout: {type: 'vbox', align: 'center'}, items: [
                    {xtype: 'container', html: '<div></div>', flex: 1},
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
                    {xtype: 'container', html: '<div></div>', flex: 1}
                ]}
            ],
            renderTo: 'treeSelectionContainer'
        });
    },
    
    initTrees: function() {
        var me = this;
        
        var defaultStoreConfig = {
            model: select.TreeNode,
            root: {
                text: 'Root',
                expanded: true,
                checked: false,
                children: []
            },
            proxy: {
                type: 'memory'
            }
        };
        
        var defaultTreeConfig = {
            xtype: 'treepanel',
            rootVisible: false,
            useArrows: true,
            autoScroll: true,
            width: '100%',
            height: '100%',
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.addNode(record);
                }
            }
        };

        if(me.config.selectGroups) {
            me.treePanels.applicationTree.treeStore = Ext.create('Ext.data.TreeStore', Ext.apply({}, defaultStoreConfig));
            me.treePanels.applicationTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
                treePanelType: 'applicationTree',
                store: me.treePanels.applicationTree.treeStore,
                renderTo: 'applicationTreeContainer',
                tbar: [{xtype : 'textfield', id: 'applicationTreeSearchField'},
                    {
                        xtype: 'button',
                        text: 'Zoeken',
                        handler: function() {
                            // TODO: DRY alert: filter is added to all trees with the same code, improvement needed?
                            var tree = me.treePanels.applicationTree.treePanel;
                            var textvalue = Ext.getCmp('applicationTreeSearchField').getValue();
                            //var 
                            if(textvalue === '') {
                                me.setAllNodesVisible(true, 'applicationTree');
                            } else {
                                me.setAllNodesVisible(true, 'applicationTree');
                                var re = new RegExp(Ext.escapeRe(textvalue), 'i');
                                var visibleSum = 0;
                                var filter = function(node) {// descends into child nodes
                                    if(node.hasChildNodes()) {
                                        visibleSum = 0;
                                        node.eachChild(function(childNode) {
                                            if(childNode.isLeaf()) {
                                                if(!re.test(childNode.data.text)) {
                                                    me.treePanels.applicationTree.filteredNodes.push(childNode);
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
                                            me.treePanels.applicationTree.filteredNodes.push(node);
                                        }
                                    } else if(!re.test(node.data.text)) {
                                        me.treePanels.applicationTree.filteredNodes.push(node);
                                    }
                                };
                                tree.getRootNode().cascadeBy(filter);
                                me.setAllNodesVisible(false, 'applicationTree');
                            }
                        }
                    }
                ]
            }));
        }
        
        if(me.config.selectLayers) {
            var serviceStore = Ext.create("Ext.data.TreeStore", {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: actionBeans["geoserviceregistry"]
                },
                defaultRootId: 'c0',
                defaultRootProperty: 'children',
                model: select.TreeNode,
                nodeParam: 'nodeId'
            });    

            me.treePanels.registryTree.treeStore = serviceStore;
            me.treePanels.registryTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
                treePanelType: 'registryTree',
                store: me.treePanels.registryTree.treeStore,
                renderTo: 'registryTreeContainer',
                tbar: [{xtype : 'textfield', id: 'registryTreeSearchField'},
                    {
                        xtype: 'button',
                        text: 'Zoeken',
                        handler: function() {
                            var tree = me.treePanels.registryTree.treePanel;
                            var textvalue = Ext.getCmp('registryTreeSearchField').getValue();
                            //var 
                            if(textvalue === '') {
                                me.setAllNodesVisible(true, 'registryTree');
                            } else {
                                me.setAllNodesVisible(true, 'registryTree');
                                var re = new RegExp(Ext.escapeRe(textvalue), 'i');
                                var visibleSum = 0;
                                var filter = function(node) {// descends into child nodes
                                    if(node.hasChildNodes()) {
                                        visibleSum = 0;
                                        node.eachChild(function(childNode) {
                                            if(childNode.isLeaf()) {
                                                if(!re.test(childNode.data.text)) {
                                                    me.treePanels.registryTree.filteredNodes.push(childNode);
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
                                            me.treePanels.registryTree.filteredNodes.push(node);
                                        }
                                    } else if(!re.test(node.data.text)) {
                                        me.treePanels.registryTree.filteredNodes.push(node);
                                    }
                                };
                                tree.getRootNode().cascadeBy(filter);
                                me.setAllNodesVisible(false, 'registryTree');
                            }
                        }
                    }
                ]
            }));
        }
        
        if(me.config.selectOwnServices) {
            me.treePanels.customServiceTree.treeStore = Ext.create('Ext.data.TreeStore', Ext.apply({}, defaultStoreConfig));
            me.treePanels.customServiceTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
                treePanelType: 'customServiceTree',
                store: me.treePanels.customServiceTree.treeStore,
                renderTo: 'customTreeContainer',
                tbar: [{xtype : 'textfield', id: 'customServiceTreeSearchField'},
                    {
                        xtype: 'button',
                        text: 'Zoeken',
                        handler: function() {
                            var tree = me.treePanels.customServiceTree.treePanel;
                            var textvalue = Ext.getCmp('customServiceTreeSearchField').getValue();
                            //var 
                            if(textvalue === '') {
                                me.setAllNodesVisible(true, 'customServiceTree');
                            } else {
                                me.setAllNodesVisible(true, 'customServiceTree');
                                var re = new RegExp(Ext.escapeRe(textvalue), 'i');
                                var visibleSum = 0;
                                var filter = function(node) {// descends into child nodes
                                    if(node.hasChildNodes()) {
                                        visibleSum = 0;
                                        node.eachChild(function(childNode) {
                                            if(childNode.isLeaf()) {
                                                if(!re.test(childNode.data.text)) {
                                                    me.treePanels.customServiceTree.filteredNodes.push(childNode);
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
                                            me.treePanels.customServiceTree.filteredNodes.push(node);
                                        }
                                    } else if(!re.test(node.data.text)) {
                                        me.treePanels.customServiceTree.filteredNodes.push(node);
                                    }
                                };
                                tree.getRootNode().cascadeBy(filter);
                                me.setAllNodesVisible(false, 'customServiceTree');
                            }
                        }
                    }
                ]
            }));
        }
        
        me.treePanels.selectionTree.treeStore = Ext.create('Ext.data.TreeStore', Ext.apply({}, defaultStoreConfig));
        me.treePanels.selectionTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply(defaultTreeConfig, {
            treePanelType: 'selectionTree',
            store: me.treePanels.selectionTree.treeStore,
            renderTo: 'selectionTreeContainer',
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.removeSelectedNodes();
                }
            },
            tbar: null
        }));
    },

    setAllNodesVisible: function(visible, treePanelName) {
        var me = this;
        if(!visible) {
            // !visible -> A filter is being applied
            // Save all nodes that are being filtered in hiddenNodes array
            me.treePanels[treePanelName].hiddenNodes = me.treePanels[treePanelName].filteredNodes;
        } else {
            // visible -> No filter is applied
            // filteredNodes = hiddenNodes, so all hidden nodes will be made visible
            me.treePanels[treePanelName].filteredNodes = me.treePanels[treePanelName].hiddenNodes;
            me.treePanels[treePanelName].hiddenNodes = [];
        }
        Ext.each(me.treePanels[treePanelName].filteredNodes, function(n) {
            var el = Ext.fly(me.treePanels[treePanelName].treePanel.getView().getNodeByRecord(n));
            if (el !== null) {
                el.setDisplayed(visible);
            }
        });
        me.treePanels[treePanelName].filteredNodes = [];
    },

    initApplicationLayers: function() {
        var me = this;
        var levels = [];
        var rootLevel = me.levels[me.rootLevel];
        if(Ext.isDefined(rootLevel.children)) {
            for(var i = 0 ; i < rootLevel.children.length; i++) {
                var l = me.addLevel(rootLevel.children[i], true, false);
                if(l !== null) {
                    levels.push(l);
                }
            }
        }
        me.insertTreeNode(levels, me.treePanels.applicationTree.treePanel);
    },

    loadSelectedLayers: function() {
        var me = this;
        var nodes = [];
        
        var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
        // First remove all current children, could be a reload of the screen
        rootNode.removeAll(false);
        
        for ( var i = 0 ; i < me.selectedContent.length ; i ++){
            var contentItem = me.selectedContent[i];
            if(contentItem.type ==  "level") {
                var level = me.addLevel(contentItem.id, false, false);
                if(level != null){
                    nodes.push(level);
                }
            } else if(contentItem.type == "appLayer"){
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
        // Create a leaf node when a level has layers (even if it has children)
        if(Ext.isDefined(level.layers)) {
            treeNodeLayer.type = 'maplevel';
            treeNodeLayer.id = 'm' + level.id;
            showChildren = false;
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
        treeNodeLayer.type = 'appLayer';
        return treeNodeLayer;
    },
    
    createNode: function (nodeid, nodetext, serviceid, leaf) {
        return {
            text: nodetext,
            name: nodetext,
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
        var registryTreeContainer = Ext.get('registryTreeContainer');
        var customTreeContainer = Ext.get('customTreeContainer');
        
        if(newval) {
            customServiceUrlTextfield.setVisible(false);
            customServiceUrlSelect.setVisible(false);
            customServiceUrlButton.setVisible(false);
            applicationTreeContainer.setStyle('visibility', 'hidden');
            registryTreeContainer.setStyle('visibility', 'hidden');
            customTreeContainer.setStyle('visibility', 'hidden');
            if(field.id == 'radioApplication') {
                applicationTreeContainer.setStyle('visibility', 'visible');
                me.activeTree = me.treePanels.applicationTree.treePanel;
            }
            if(field.id == 'radioRegistry') {
                registryTreeContainer.setStyle('visibility', 'visible');
                me.activeTree = me.treePanels.registryTree.treePanel;
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
        var rootNode = me.treePanels.customServiceTree.treePanel.getRootNode();
        // First remove all current children
        rootNode.removeAll(true);
        // Create service node
        var userServiceId = 'us' + (++me.addedServicesCount);
        userService.id = userServiceId;
        if(!Ext.isDefined(userService.serviceName)) userService.serviceName = userService.name;
        me.userServices[userServiceId] = userService;
        var serviceNode = me.createNode('s' + userServiceId, userService.name, null, false);
        serviceNode.type = 'service';
        serviceNode.children = me.createCustomNodesList(userService.topLayer, userServiceId);
        me.insertTreeNode(serviceNode, me.treePanels.customServiceTree.treePanel);
    },
    
    createCustomNodesList: function(node, userServiceId) {
        var me = this;
        var treeNode = null;
        var hasChildren = Ext.isDefined(node.children);
        if(!node.virtual) {
            var leaf = true;
            if(hasChildren && node.children.length > 0) leaf = false;
            var layerId = 'usl' +  + (++me.addedLayersCount);
            treeNode = me.createNode('l' + layerId, node.title, null, leaf);
            treeNode.origData.layerName = node.name;
            treeNode.type = 'appLayer';
            treeNode.origData.userService = userServiceId;
        }
        if(hasChildren && node.children.length > 0) {
            var childnodes = [];
            for(var i = 0 ; i < node.children.length; i++) {
                var l = me.createCustomNodesList(node.children[i], userServiceId);
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
                    me.switchContent(node, sib);
                }
            } else {
                sib = node.previousSibling;
                if(sib !== null) {
                    rootNode.insertBefore(node, sib);
                    me.switchContent(node, sib);
                }
            }
        });
    },
    
    switchContent: function(node1, node2) {
        var me = this;
        var contentNode1 = null;
        var contentNode1Index = 0;
        var contentNode2 = null;
        var contentNode2Index = 0;
        var origDataNode1 = me.getOrigData(node1);
        var nodeType1 = me.getNodeType(node1);
        var origDataNode2 = me.getOrigData(node2);
        var nodeType2 = me.getNodeType(node2);
        nodeType1 = (nodeType1 == "maplevel") ? "level" : nodeType1;
        nodeType2 = (nodeType2 == "maplevel") ? "level" : nodeType2;
        Ext.Array.each(me.selectedContent, function(content, index) {
            if(content.id == origDataNode1.id && content.type == nodeType1) {
                contentNode1 = content;
                contentNode1Index = index;
            }
            if(content.id == origDataNode2.id && content.type == nodeType2) {
                contentNode2 = content;
                contentNode2Index = index;
            }
        });
        if(contentNode1 !== null && contentNode2 !== null) {
            me.selectedContent[contentNode1Index] = contentNode2;
            me.selectedContent[contentNode2Index] = contentNode1;
        }
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
        var nodeType = me.getNodeType(record);
        if(nodeType == "appLayer" || nodeType == "layer" || (nodeType == "maplevel" && !me.onRootLevel(record, me.activeTree))) {
            var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
            var recordOrigData = me.getOrigData(record);
            var recordid = record.get('id');
            if(nodeType == "layer") {
                recordid = 'rl' + recordid;
            }
            var searchNode = rootNode.findChild('id', recordid, false);
            if(searchNode == null) {
                var objData = record.raw;
                if(rootNode !== null) {
                    if(nodeType == "appLayer") {
                        // Own service
                        var customService = Ext.clone(me.userServices[recordOrigData.userService]);
                        customService.status = 'new';
                        me.addService(customService);
                        me.addedLayers.push({
                            background: false,
                            checked: true,
                            id: recordOrigData.id,
                            layerName: recordOrigData.layerName,
                            serviceId: customService.id,
                            status: 'new'
                        });
                        me.selectedContent.push({
                            id: recordOrigData.id,
                            type: 'appLayer'
                        });
                    }
                    else if(nodeType == "maplevel") {
                        // Added from application
                        me.addedLevels.push({id:recordOrigData.id,status:'new'});
                        me.selectedContent.push({
                            id: recordOrigData.id,
                            type: 'level'
                        });
                    }
                    else if(nodeType == "layer") {
                        // Added from registry
                        var service = me.findService(record);
                        objData = null;
                        if(service != null) {
                            service.status = 'new';
                            me.addService(service);
                            me.addedLayers.push({
                                background: false,
                                checked: true,
                                id: recordid,
                                layerName: record.raw.layerName,
                                serviceId: service.id,
                                status: 'new'
                            });
                            me.selectedContent.push({
                                id: recordid,
                                type: 'appLayer'
                            });
                            objData = me.createNode(recordid, record.get('name'), service.id, true);
                            objData.type = 'appLayer';
                            objData.origData.userService = service.id;
                        }
                    }
                    if(objData != null) rootNode.appendChild(objData);
                }
            }
        }
    },
    
    findService: function(record) {
        var me = this;
        var parentNode = record.parentNode;
        // Root level reached and no service found
        if(parentNode == null) return null;
        if(me.getNodeType(parentNode) == "service") {
            return parentNode.raw.service;
        } else {
            return me.findService(parentNode);
        }
    },
    
    addService: function(customService) {
        var me = this;
        var added = false;
        Ext.Array.each(me.addedServices, function(addedService) {
            if(addedService.id == customService.id) {
                added = true;
            }
        });
        Ext.Array.each(me.services, function(service) {
            if(service.id == customService.id) {
                added = true;
            }
        });
        if(!added) me.addedServices.push(customService);
    },
    
    removeSelectedNodes: function() {
        var me = this;
        var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
        Ext.Array.each(me.treePanels.selectionTree.treePanel.getSelectionModel().getSelection(), function(record) {
            var nodeType = me.getNodeType(record);
            var recordOrigData = me.getOrigData(record);
            if(recordOrigData.service == null) {
                // Own service
                me.removeLayer(recordOrigData.id, null);
                me.removeService(recordOrigData.userService);
            }
            else if(nodeType == "maplevel" || nodeType == "level") {
                // Added from application
                me.removeLevel(recordOrigData.id, null);
            }
            else if(nodeType == "appLayer") {
                // Added from registry or application
                me.removeLayer(recordOrigData.id, null);
                me.removeService(recordOrigData.userService);
            }
            rootNode.removeChild(rootNode.findChild('id', record.get('id'), true));
        });
    },
    
    removeService: function(serviceid) {
        var me = this;
        var addedServices = [];
        var totalLayers = 0;
        if(serviceid != null) {
            Ext.Array.each(me.addedLayers, function(addedLayer) {
                if(addedLayer.serviceId == serviceid) totalLayers++;
            });
        }
        if(totalLayers == 0) {
            Ext.Array.each(me.addedServices, function(addedService) {
                if(addedService.id != serviceid) {
                    addedServices.push(addedService);
                }
            });
            me.addedServices = addedServices;
        }
    },
    
    removeLayer: function(layerid) {
        var me = this;
        var addedLayers = [];
        Ext.Array.each(me.addedLayers, function(addedLayer) {
            if(addedLayer.id != layerid) {
                addedLayers.push(addedLayer);
            }
        });
        var selectedContent = [];
        Ext.Array.each(me.selectedContent, function(content) {
            if(!(content.id == layerid && content.type == "appLayer")) {
                selectedContent.push(content);
            }
        });
        me.selectedContent = selectedContent;
        me.addedLayers = addedLayers;
    },
    
    removeLevel: function(levelid) {
        var me = this;
        var addedLevels = [];
        Ext.Array.each(me.addedLevels, function(addedLevel) {
            if(addedLevel.id != levelid) {
                addedLevels.push(addedLevel);
            }
        });
        var selectedContent = [];
        Ext.Array.each(me.selectedContent, function(content) {
            if(!(content.id == levelid && content.type == "level")) {
                selectedContent.push(content);
            }
        });
        me.selectedContent = selectedContent;
        me.addedLevels = addedLevels;
    },
    
    cancelSelection: function() {
        var me = this;
        // Remove layers, levels and services with status = new, a.k.a. not added to the selectedContent
        Ext.Array.each(me.addedLayers, function(addedLayer) {
            if(addedLayer.status == 'new') {
                me.removeLayer(addedLayer.id);
            }
        });
        
        Ext.Array.each(me.addedLevels, function(addedLevel) {
            if(addedLevel.status == 'new') {
                me.removeLevel(addedLevel.id);
            }
        });
        Ext.Array.each(me.addedServices, function(addedService) {
            if(addedService.status == 'new') {
                me.removeService(addedService.id);
            }
        });
        me.popup.hide();
    },
    
    saveSelection: function() {
        var me = this;
        Ext.Array.each(me.addedServices, function(addedService) {
            if(addedService.status == 'new') {
                addedService.status = 'added';
                me.viewerController.addService(addedService);
            }
        });
        Ext.Array.each(me.addedLevels, function(addedLevel) {
            if(addedLevel.status == 'new') {
                addedLevel.status = 'added';
            }
        });
        Ext.Array.each(me.addedLayers, function(addedLayer) {
            if(addedLayer.status == 'new') {
                addedLayer.status = 'added';
                me.viewerController.addAppLayer(addedLayer);
            }
        });
        me.viewerController.setSelectedContent(me.selectedContent);
        me.popup.hide();
    },
    
    getNodeType: function(record) {
        if(Ext.isDefined(record.raw) && Ext.isDefined(record.raw.type)) return record.raw.type;
        if(Ext.isDefined(record.data) && Ext.isDefined(record.data.type)) return record.data.type;
        return null;
    },
    
    getOrigData: function(record) {
        if(Ext.isDefined(record.raw) && Ext.isDefined(record.raw.origData)) return record.raw.origData;
        if(Ext.isDefined(record.data) && Ext.isDefined(record.data.origData)) return record.data.origData;
        return null;
    },
    
    onRootLevel: function(record, tree) {
        var foundNode = tree.getRootNode().findChild('id', record.get('id'), false);
        if(foundNode !== null) return true;
        return false;
    }
    
});