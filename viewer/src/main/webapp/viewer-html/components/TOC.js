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
/**
 * TOC component
 * Creates a Table of comtents Component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

Ext.define('Maps', {
    extend: 'Ext.data.TreeModel',
    fields: [
        // Added convert function to icon
        {name: 'icon', type: 'string', convert: function(fieldName, record) {
            if(record.get('leaf')) {
                return FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/map.png';
            }
            return FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/folder.png';
        }}
    ]
});

Ext.define ("viewer.components.TOC",{
    extend: "viewer.components.Component",
    panel: null,
    buttonBar: null,
    selectedContent : null,
    appLayers :  null,
    service : null,
    levels : null,
    backgroundLayers: null,
    // popup:null,
    qtips:null,
    toggleAllLayersState:true,
    config: {
        label: null,
        iconUrl: null,
        tooltip: null,
        groupCheck:true,
        layersChecked:true,
        showBaselayers:true,
        title: i18next.t('viewer_components_toc_0'),
        showLeafIcon: true,
        showNodeIcon: true,
        zoomToScaleText: i18next.t('viewer_components_toc_6'),
        expandOnStartup: true,
        toggleAllLayersOnText: i18next.t('viewer_components_toc_7'),
        toggleAllLayersOffText: i18next.t('viewer_components_toc_8'),
        initToggleAllLayers: true,
        showAllLayersOff: false,
        showAllLayersOn: false,
        expandOnEnabledLayer:false,
        persistCheckedLayers: false
    },
    constructor: function (config){
        config.details.useExtLayout = true;
        this.initConfig(config);
		viewer.components.TOC.superclass.constructor.call(this, this.config);
        /*backwards compatible, if 'showToggleAllLayers' is configured in the past
        both toggle all layers buttons must be shown*/
        if (config.showToggleAllLayers!==undefined){
            this.showAllLayersOff=config.showToggleAllLayers;
            this.showAllLayersOn=config.showToggleAllLayers;
        }
        this.toggleAllLayersState = this.config.initToggleAllLayers;
        if(!this.config.persistCheckedLayers) {
            // If the configuration option was set in the past but is turned off, remove old saved state
            this.config.viewerController.removeSavedCheckedState();
        }
        this.renderPromise = new Ext.Deferred();
        this.renderButton();
        this.loadTree();
        this.loadInitLayers();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT,this.extentChanged,this);
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);
        return this;
    },
    // Build the tree
    loadTree : function(){
        // Get the current state of the map
        this.backgroundLayers = new Array();
        this.selectedContent = this.config.viewerController.app.selectedContent;
        this.appLayers = this.config.viewerController.app.appLayers;
        this.levels = this.config.viewerController.app.levels;
        this.services = this.config.viewerController.app.services;
        var me = this;
        Ext.QuickTips.init();
        this.qtips = new Array();
        var store = Ext.create('Ext.data.TreeStore', {
            model: 'Maps',
            root: {
                text: i18next.t('viewer_components_toc_1'),
                expanded: me.config.expandOnStartup,
                checked: false,
                children: []
            }
        });

        store.addListener("nodebeforeexpand",this.beforeExpand, this);
        store.addListener("nodeexpand",this.onExpand,this);

        var dockedItems = [];
        if(this.showAllLayersOn || this.showAllLayersOff){
            dockedItems = [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    layout: {
                        pack: 'end'
                    },
                    items: [
                        {
                            id: 'toggleAllLayersButton',
                            text: me.toggleAllLayersState ? me.config.toggleAllLayersOnText:me.config.toggleAllLayersOffText,
                            listeners: {
                                click: {
                                    fn: function(){me.toggleAllLayers();},
                                    element: 'el'
                                }
                            }
                        }
                    ]
                }
            ];
        }

        this.panel = Ext.create('Ext.tree.Panel', {
            title: this.getPanelTitle(),
            height: "100%",
            scrollable: true,
            useArrows: true,
            rootVisible: false,
            floating: false,
            listeners:{
                itemclick:{
                    toc: this,
                    fn: this.itemClicked,
                    scope: this
                },
                checkchange:{
                    toc: this,
                    fn: this.checkboxClicked,
                    scope: this
                },
                afterrender: {
                    scope: this,
                    fn: function() {
                        this.renderPromise.resolve();
                    }
                }
            },
            store: store,
            tools: this.getHelpToolConfig(),
            dockedItems: dockedItems
        });
        var parent = this.getContentContainer();
        parent.add(this.panel);
    },
    renderButton: function() {
        var me = this;
        if(!this.config.isPopup) {
            return;
        }
        viewer.components.TOC.superclass.renderButton.call(this,{
            text: i18next.t('viewer_components_toc_2'),
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label,
            handler: function() {
                me.popup.show();
            }
        });
    },
    // Start the treetraversal
    loadInitLayers : function(){
        var nodes = new Array();
        for ( var i = 0 ; i < this.selectedContent.length ; i ++){
            var contentItem = this.selectedContent[i];
            if(contentItem.type ===  "level"){
                var level = this.addLevel(contentItem.id);
                if(level != null){
                    nodes.push(level.node);
                }
            }else if(contentItem.type === "appLayer"){
                var layer = this.addLayer(contentItem.id);
                if(layer === null){
                    continue;
                }
                nodes.push(layer.node);
            }
        }
        // Create background
        this.createBackgroundLevel(nodes);
        this.insertLayer(nodes);
        
        // Large tree's where not rendered properly all the time. This fixes this issue
        // See https://github.com/flamingo-geocms/flamingo/issues/391
        this.panel.getView().refreshView();

        var map = this.config.viewerController.mapComponent.getMap();
        var scale = map.getResolution();
        this.checkScaleLayer(this.panel.getRootNode(),scale);

        this.registerQtips();
    },
    isExpanded : function(level , triState){
        var expand = this.config.expandOnStartup;
        if(this.config.expandOnEnabledLayer && triState >= 0){
            expand = true;
        }
        if (level.background) {
            expand = false;
        }

        return expand;
    },
    // Add a level to the tree, and load all it's levels and applayers
    addLevel : function (levelId){
        var nodes = new Array();
        var level = this.levels[levelId];
        if(!level || level.background && !this.config.showBaselayers || level.removed){
            return null;
        }
        var levelId = "level-"+level.id;
        var treeNodeLayer = {
            text: Ext.String.format('<span id=\"span_{0}\">{1}</span>', levelId, level.name),
            // id: levelId,
            expandable: !level.background,
            collapsible: !level.background,
            leaf: false,
            background: level.background,
            // nodeId: levelId,
            layerObj: {
                nodeId: levelId,
                serviceId: level.id
            }
        };
        if(!this.config.showNodeIcon){
            treeNodeLayer.iconCls='no_treenode_icon';
        }
        if(this.config.groupCheck){
            treeNodeLayer.checked=  false;
        }
        if(level.info != undefined){
            this.addQtip(i18next.t('viewer_components_toc_9'), 'span_'+levelId);
            treeNodeLayer.layerObj.info = level.info;
        }
        if(level.url!= undefined){
            this.addQtip(i18next.t('viewer_components_toc_10'), 'span_'+levelId);
            treeNodeLayer.layerObj.url = level.url;
        }

        var childsChecked = 0;
        var totalChilds = 0;

        if(level.children != undefined ){
            for(var i = 0 ; i < level.children.length; i++){
                var l = this.addLevel(level.children[i]);
                if(l !== null && l.node != null) {
                    totalChilds++;
                    if(l.tristate === 0) {
                        totalChilds++;
                        childsChecked++;
                    } else if(l.tristate === 1) {
                        childsChecked++;
                    }
                    nodes.push(l.node);
                }
            }
        }
        if(level.layers != undefined ){
            for(var j = 0 ; j < level.layers.length ; j ++){
                var layer = this.addLayer(level.layers[j]);
                if(layer === null){
                    continue;
                }
                totalChilds++;
                if(layer.checked) childsChecked++;
                nodes.push(layer.node);
            }
        }
        if(this.config.groupCheck) {
            var tristateClass = this.updateTriStateClass(null, childsChecked, totalChilds);
            if(tristateClass === 1) {
                treeNodeLayer.checked = true;
            }
            else if (tristateClass === 0) {
                treeNodeLayer.cls = 'tristatenode';
            }
        }
        var triState = this.calculateTriState(childsChecked, totalChilds);

        var expand = this.isExpanded(level, triState);
        treeNodeLayer.layerObj.children = nodes;
        treeNodeLayer.expanded = expand;
        var node = {
            node: treeNodeLayer,
            tristate: triState
        };
        if(level.background){
            this.addToBackground(node);
            return null;
        }else{
            return node;
        }
    },
    // Add a layer to the level
    addLayer : function (layerId){
        var appLayerObj = this.appLayers[layerId];
        if(!appLayerObj || appLayerObj.removed){
            return null;
        }
        var service = this.services[appLayerObj.serviceId];
        var serviceLayer = service.layers[appLayerObj.layerName];
        var layerTitle = appLayerObj.alias;
        var layerId = "layer-"+appLayerObj.id;
        var me = this;
        var treeNodeLayer = {
            text: Ext.String.format('<span id=\"span_{0}\">{1}</span>', layerId, layerTitle),
            // id: layerId,
            expanded: me.config.expandOnStartup,
            leaf: true,
            background: appLayerObj.background,
            // nodeId: layerId,
            layerObj: {
                nodeId: layerId,
                service: service.id,
                layerName : appLayerObj.layerName,
                appLayer: appLayerObj
            }
        };
        if (!this.config.showLeafIcon){
            treeNodeLayer.iconCls='no_treenode_icon';
        }
        if(serviceLayer === undefined){
            return null;
        }
        if(serviceLayer.details != undefined){
            if(serviceLayer.details ["metadata.stylesheet"] !== undefined){
                this.addQtip(i18next.t('viewer_components_toc_11'), 'span_'+layerId);
                treeNodeLayer.layerObj.metadata = serviceLayer.details ["metadata.stylesheet"];
            }

            if(serviceLayer.details ["download.url"] != undefined){
                this.addQtip(i18next.t('viewer_components_toc_12'), 'span_'+layerId);
                treeNodeLayer.layerObj.download = serviceLayer.details ["download.url"];
            }

        }
        var retChecked = false;
        var defaultChecked = this.config.viewerController.getLayerChecked(appLayerObj);
        if(this.config.layersChecked){
            treeNodeLayer.checked = defaultChecked;
            retChecked = defaultChecked;
        } else if(defaultChecked) {
            treeNodeLayer.hidden_check = defaultChecked;
            retChecked = defaultChecked;
        }
        if(this.config.persistCheckedLayers) {
            this.config.viewerController.saveCheckedState(appLayerObj, retChecked);
        }
        return {
            node: treeNodeLayer,
            checked: retChecked
        };
    },
    getRenderPromise: function() {
        return this.renderPromise.promise;
    },
    addToBackground : function (node){
        this.backgroundLayers.push(node);
    },
    createBackgroundLevel : function (nodes){
        if(this.backgroundLayers.length > 0){
            var nodesArray = new Array();
            var childsChecked = 0;
            var totalChilds = 0;
            for(var i = 0 ; i < this.backgroundLayers.length; i++){
                var l = this.backgroundLayers[i];
                if(l.node != null) {
                    totalChilds++;
                    if(l.tristate === 0) {
                        totalChilds++;
                        childsChecked++;
                    } else if(l.tristate === 1) {
                        childsChecked++;
                    }
                    nodesArray.push(l.node);
                }
            }
            var background = {
                text: i18next.t('viewer_components_toc_5'),
                // id: this.name + "Achtergrond",
                expanded: this.config.expandOnStartup,
                expandable: true,
                collapsible : true,
                leaf: false,
                background: false,
                layerObj: {
                    children: nodesArray
                }
            };
            if (this.config.groupCheck) {
                var tristate = this.updateTriStateClass(null, childsChecked, totalChilds);
                if (tristate === 1) {
                    background.checked = true;
                }
                else if (tristate === 0) {
                    background.cls = 'tristatenode';
                } else if (tristate === -1) {
                    background.checked = false;
                }
            }
            nodes.push(background);
        }
    },
    addQtip : function(text, target){
        var qtip = new Object();
        qtip.text = text;
        qtip.target = target;
        this.qtips.push(qtip);
    },
    setLayerQtip: function (text,layerId){
        this.setQtip(text,"span_layer-"+layerId);
    },
    setLevelQtip: function (text,levelid){
        this.setQtip(text,"span_level-"+levelid);
    },
    setQtip: function (text,target){
        if (document.getElementById(target)){
            Ext.tip.QuickTipManager.register({
                target: target,
                text: text
            });
        }else{
            this.qtips.push({target:target,text:text});
        }
    },
    registerQtips : function (){
        var newQtips = [];
        for (var i = 0; i < this.qtips.length; i++) {
            var qtip = this.qtips[i];
            if (document.getElementById(qtip.target)){
                Ext.tip.QuickTipManager.register({
                    target: qtip.target,
                    text: qtip.text
                });
            }else{
                newQtips.push(qtip);
            }
        }
        this.qtips=newQtips;
    },
    /**
     * Toggle All layers in the TOC
     */
    toggleAllLayers: function (){
        this.updateTreeNodes = [];
        this.checkChildNodes(this.panel.getRootNode(),this.toggleAllLayersState);
        for(var i = 0; i < this.updateTreeNodes.length; i++) {
            this.updateMap(this.updateTreeNodes[i], this.toggleAllLayersState);
        }
        //only toggle when the new state button must be shown
        if (this.toggleAllLayersState && this.showAllLayersOff ||
            !this.toggleAllLayersState && this.showAllLayersOn){
            this.toggleAllLayersState = !this.toggleAllLayersState;

            if (Ext.get("toggleAllLayersButton")){
                Ext.getCmp("toggleAllLayersButton").setText(this.toggleAllLayersState ? this.config.toggleAllLayersOnText:this.config.toggleAllLayersOffText);
            }
        }
    },
    // Fix for not expanding backgroundlayers: not expandable nodes don't have expand button, but doubleclick does expand
    beforeExpand : function (node){
        if(node.data.background){
            return false;
        }else{
            return true;
        }
    },
    /**
     * Is called when a node is expanding.
     * Call register quickTips after a small timeout to make sure the element is
     * created in the DOM
     */
    onExpand: function(node){
        var me = this;
        setTimeout(function() {
            me.config.viewerController.fireEvent(viewer.viewercontroller.controller.Event.TOC_EXPANDED, node);
        }, 0);
        if (this.qtips.length > 0){
            setTimeout(function(){
                me.registerQtips();
            },500);
        }
    },
    insertLayer : function (config){
        var root = this.panel.getRootNode(),
            me = this;
        Ext.Array.each(config, function(node) {
           me.insertNode(root, node);
        });
        root.expand();
    },
    // Appending the whole tree at once gave issues in ExtJS 4.2.1
    // when there where sub-sub-childs present. Looping over childs,
    // and adding them manually seems to fix this
    insertNode: function(parentNode, insertNode) {
        var me = this,
            newParentNode = parentNode.appendChild(insertNode);
        if(insertNode.layerObj.children) {
            Ext.Array.each(insertNode.layerObj.children, function(childNode) {
                me.insertNode(newParentNode, childNode);
            });
        }
    },

    setTriState: function(node) {
        var me = this;
        var checked = me.getNodeChecked(node);
        var updateTree = false;
        if(node.hasChildNodes()) {
            // It is a folder
            updateTree = true;
            me.updateTreeNodes = [];
            me.checkChildNodes(node, checked);
            if(checked) {
                me.updateTriStateClass(node, 1, 1);
            } else {
                me.updateTriStateClass(node, 0, 1);
            }
        }
        if(node.parentNode.parentNode != null) {
            me.updateTriState(node.parentNode);
        }
        // After the tree has been updated, update the map with all nodes involved
        if(updateTree) {
            for(var i = 0; i < me.updateTreeNodes.length; i++) {
                me.updateMap(me.updateTreeNodes[i], checked);
            }
        }
    },

    updateTriState: function(node) {
        var me = this;
        var totalChecked = 0;
        var totalNodes = 0;
        node.eachChild(function(childNode) {
            totalNodes++;
            if(me.getNodeChecked(childNode)) totalChecked++;
            /* If a child node has a tristate, the parent should also have a tristate,
             * thus we are adding extra nodes in the counter so the total number of nodes
             * and the number of checked nodes is always unequal and there is always a "checked" node,
             * for explanation why this is done, see the updateTriStateClass function for how the tristate is determined */
            if(me.hasTriState(childNode)) {
                totalNodes = totalNodes + 2;
                totalChecked++;
            }
        });
        me.updateTriStateClass(node, totalChecked, totalNodes);
        if(node.parentNode.parentNode != null) {
            me.updateTriState(node.parentNode);
        }
    },
    calculateTriState : function(totalChecked, totalNodes){
        var tristate = 0;
        if(totalChecked === 0) {
            tristate = -1;
        } else if(totalChecked === totalNodes) {
            tristate = 1;
        }
        return tristate;
    },

    updateTriStateClass: function(node, totalChecked, totalNodes) {
        var tristate = 0;
        if(!this.config.groupCheck){
            return tristate;
        }
        tristate = this.calculateTriState(totalChecked, totalNodes);

        if(node != null) {
            if(tristate === -1) {
                node.data.tristate = -1;
                node.set('cls', '');
                node.set('checked', false);
            } else if(tristate === 1) {
                node.data.tristate = 1;
                node.set('cls', '');
                node.set('checked', true);
            } else {
                node.data.tristate = 0;
                node.set('cls', 'tristatenode');
                node.set('checked', false);
            }
        }
        return tristate;
    },

    checkChildNodes: function(node, checked) {
        var me = this;
        node.eachChild(function(childNode) {
            if((!childNode.hasChildNodes() && me.config.layersChecked) || (childNode.hasChildNodes() && me.config.groupCheck)){
                childNode.set('checked', checked);
            }else {
                childNode.set('hidden_check', checked);
            }
            me.updateTreeNodes.push(childNode);
            if(childNode.hasChildNodes()) {
                childNode.set('cls', '');
                me.checkChildNodes(childNode, checked);
            }
        });
    },

    getNodeChecked: function(node) {
        if(Ext.isDefined(node.data)) {
            if(node.data.checked !== undefined && node.data.checked !== null) return node.data.checked;
            if(node.data.hidden_check !== undefined && node.data.hidden_check !== null) return node.data.hidden_check;
        }
        if(Ext.isDefined(node.raw)) {
            if(node.raw.checked !== undefined && node.raw.checked !== null) return node.raw.checked;
            if(node.raw.hidden_check !== undefined && node.raw.hidden_check !== null) return node.raw.hidden_check;
        }
        return false;
    },

    hasTriState: function(node) {
        if(Ext.isDefined(node.data) && Ext.isDefined(node.data.tristate)) {
            if(node.data.tristate === 0) return true;
        }
        return false;
    },

    layerVisibilityChanged : function (map,object){
        var layer = object.layer;
        var vis = object.visible;
        var nodeId = "layer-" + layer.appLayerId;
        var node = this.panel.getRootNode().findChildBy(function(node){
            return (node.data.layerObj.nodeId === nodeId);
        }, this, true);
        if (node){
            if (this.config.layersChecked || (node.hasChildNodes() && this.config.groupCheck)){
                 node.set('checked', vis);
            }else {
                node.set('hidden_check', vis);
            }
            this.setTriState(node);
        }
    },

    updateMap: function(nodeObj, checked) {
        if(nodeObj.isLeaf()){
            var node = nodeObj.raw;
            if(node ===undefined){
                node = nodeObj.data;
            }
            var layer = node.layerObj;
            if(checked){
                this.config.viewerController.setLayerVisible(layer.appLayer, true);
            }else{
                this.config.viewerController.setLayerVisible(layer.appLayer, false);
            }
            if(this.config.persistCheckedLayers) {
                this.config.viewerController.saveCheckedState(layer.appLayer, checked);
            }
        }
    },

    getTree: function() {
        return this.panel;
    },

    /*************************  Event handlers ***********************************************************/

    checkboxClicked : function(nodeObj,checked,toc){
        this.updateMap(nodeObj, checked);
        this.setTriState(nodeObj);

        var scale = this.config.viewerController.mapComponent.getMap().getScale();

        this.checkScaleLayer(nodeObj,scale);
    },
    // Open the popup with the metadata/info of the level/applayer
    itemClicked: function(thisObj, record, item, index, e, eOpts){
        if(e.target.nodeName.toUpperCase() === "INPUT" ||
            e.target.className === "toc-zoomtoscale-text" ||
            e.target.className.indexOf("tree-checkbox") !== -1){
            return;
        }
        var node = record.raw;
        if(node ===undefined){
            node = record.data;
        }
        this.config.viewerController.layerClicked(node.layerObj);
    },
    // Entrypoint for when the selected content is changed: destroy the current tree and rebuild it.
    selectedContentChanged : function (){
        this.panel.destroy();
        this.loadTree();
        this.loadInitLayers();
        // Activate component (only applies when in tabs and not a popup and when configured so
        if(this.config.hasOwnProperty('showAfterSelectedContentChange') && this.config.showAfterSelectedContentChange && !this.config.isPopup && this.config.viewerController.layoutManager.isTabComponent(this.name)) {
            this.config.viewerController.layoutManager.showTabComponent(this.name)
        }
    },
    extentChanged : function (map,obj){
        var scale = map.getScale(obj.extent);
        this.checkScaleLayer(this.panel.getRootNode(),scale);
    },
    checkScaleLayer : function (child,scale){
        if(child.isLeaf()){
            var layerObj = null;
            if(child.data && child.data.layerObj) layerObj = child.data.layerObj;
            // if(child.raw && child.raw.layerObj) layerObj = child.raw.layerObj;
            var record = null;
            if(this.panel.getView().el) {
                record = this.panel.getView().getNodeByRecord(child);
            }
            // Check for not existing/visible layers (ie. layers in (background) levels
            if(record != null){
                var extElement = Ext.fly(record);
                //if(this.isInScale(scale, layer.minScale, layer.maxScale)){
                var spanEl = document.getElementById("span_"+layerObj.nodeId);
                var ztsId= ("span_"+child.data.id+"_zoomtoscale").replace(/\./g, '_');
                        var zts=Ext.get(ztsId);
                if(spanEl === null) {
                    return;
                }
                if (this.config.viewerController.isWithinScale(layerObj.appLayer,scale)){
                    extElement.removeCls("toc-outofscale");
                    extElement.addCls("toc-inscale");
                    if(zts){
                        zts.remove();
                    }
                }else{
                    extElement.removeCls("toc-inscale");
                    extElement.addCls( "toc-outofscale");
                    if (child.data.checked){
                        var parent = Ext.get(spanEl.parentNode);
                        parent.addCls('toc-zoomtoscale');
                        //if ZoomToScale object !exists create one.
                        if (!zts){
                            var newSpan = document.createElement("span");
                            newSpan.id=ztsId;
                            newSpan.innerHTML=this.config.zoomToScaleText;
                            zts = new Ext.Element(newSpan);
                            zts.addCls("toc-zoomtoscale-text");
                            var me = this;
                            zts.addListener("click",
                                function (evt,el,o){
                                    me.zoomToScale(layerObj.appLayer);
                                },
                                this);
                            parent.appendChild(zts);
                        }
                    }
                }
            }
        }else{
            for ( var i = 0 ; i < child.childNodes.length ; i++){
                var childNode = child.childNodes[i];
                this.checkScaleLayer (childNode, scale);
            }
        }

    },
    getExtComponents: function() {
        return [ this.panel.getId() ];
    },
    zoomToScale: function(layerObj){
        this.config.viewerController.zoomToLayer(this.config.viewerController.getAppLayerById(layerObj.id));
    },
    // Override function so tree-scroll-fix can be applied
    doResize: function() {
        var me = this;
        me.panel.updateLayout();
    }
});
