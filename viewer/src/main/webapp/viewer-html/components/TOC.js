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
/**
 * TOC component
 * Creates a Table of comtents Component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.TOC",{
    extend: "viewer.components.Component",
    panel: null,
    buttonBar: null,
    selectedContent : null,
    appLayers :  null,
    service : null,
    levels : null,
    backgroundLayers: null,
    popup:null,
    qtips:null,
    toggleAllLayersState:true,
    config: {
        groupCheck:true,
        layersChecked:true,
        showBaselayers:true,
        title: "Table of Contents",
        showLeafIcon: true,
        showNodeIcon: true,
        zoomToScaleText: "Zoom to scale",
        expandOnStartup: true,
        toggleAllLayersOnText: 'All layers on',
        toggleAllLayersOffText: 'All layers off',
        initToggleAllLayers: true,
        showAllLayersOff: false,
        showAllLayersOn: false
    },
    constructor: function (config){
        viewer.components.TOC.superclass.constructor.call(this, config);
        this.initConfig(config);
        /*backwards compatible, if 'showToggleAllLayers' is configured in the past
        both toggle all layers buttons must be shown*/
        if (config.showToggleAllLayers!==undefined){
            this.showAllLayersOff=config.showToggleAllLayers;
            this.showAllLayersOn=config.showToggleAllLayers;
        }   
        this.toggleAllLayersState = this.initToggleAllLayers;
        this.loadTree();
        this.loadInitLayers();
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this);
        this.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_FINISHED_CHANGE_EXTENT,this.extentChanged,this);
        this.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);
        return this;
    },
    /**
     *  Apply fixes to the trees for ExtJS scrolling issues
     */
    applyTreeScrollFix: function() {
        var view = this.panel.getView();
        view.getEl().setStyle({
            overflow: 'auto',
            overflowX: 'hidden'
        });
        // From ext-all-debug, r77661 & r77663
        // Seems to recalculate body and applies correct heights so scrollbars can be shown
        view.panel.doComponentLayout();
        view.panel.getLayout().layout();
    },
    // Build the tree
    loadTree : function(){        
        // Get the current state of the map
        this.backgroundLayers = new Array();
        this.selectedContent = this.viewerController.app.selectedContent;
        this.appLayers = this.viewerController.app.appLayers;
        this.levels = this.viewerController.app.levels;
        this.services = this.viewerController.app.services;
        var me = this;
        Ext.QuickTips.init();
        this.qtips = new Array();
        var store = Ext.create('Ext.data.TreeStore', {
            root: {
                text: 'Root',
                expanded: me.expandOnStartup,
                checked: false,
                children: []
            }
        });
        
        store.addListener("beforeexpand",this.beforeExpand, this);
        store.addListener("expand",this.onExpand,this);
        
        var title = "";
        if(this.title && !this.viewerController.layoutManager.isTabComponent(this.name)) title = this.title;
        
        var tools = [];
        // If no config is present for 'showHelpButton' or 'showHelpButton' is "true" we will show the help button
        if(this.config && (!this.config.hasOwnProperty('showHelpButton') || this.config.showHelpButton !== "false")) {
            tools = [{
                type:'help',
                handler: function(event, toolEl, panel){
                    me.viewerController.showHelp(me.config);
                }
            }];
        }
        
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
                            text: me.toggleAllLayersState ? me.toggleAllLayersOnText:me.toggleAllLayersOffText,
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
        
        this.panel =Ext.create('Ext.tree.Panel', {
            renderTo: this.getContentDiv(),
            title: title,
            height: "100%",
            scroll: false,
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
                }
            },
            store: store,
            tools: tools,
            dockedItems: dockedItems
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
        
        var map = this.viewerController.mapComponent.getMap();
        var scale = map.getResolution();
        this.checkScaleLayer(this.panel.getRootNode(),scale);
        
        this.registerQtips();
        // Apply the scroll fix when all layers are added
        this.applyTreeScrollFix();
    },
    // Add a level to the tree, and load all it's levels and applayers
    addLevel : function (levelId){
        var nodes = new Array();
        var level = this.levels[levelId];
        if(level.background && !this.showBaselayers){
            return null;
        }
        var levelId = "level-"+level.id;
        var expand = this.expandOnStartup;
        if (level.background){
            expand=false;
        }
        var treeNodeLayer = {
            text: '<span id="span_'+levelId+'">'+level.name+'</span>', 
            id: levelId,
            expanded: expand,
            expandable: !level.background,
            collapsible: !level.background,
            leaf: false,
            background: level.background,
            layerObj: {
                serviceId: level.id
            }
        };
        if(!this.showNodeIcon){
            treeNodeLayer.iconCls='no_treenode_icon';
        }
        if(this.groupCheck){
            treeNodeLayer.checked=  false;
        }
        if(level.info != undefined){
            this.addQtip("Informatie over de kaart", 'span_'+levelId);
            treeNodeLayer.layerObj.info = level.info;
        }
        if(level.url!= undefined){
            this.addQtip("Informatie over de kaart", 'span_'+levelId);
            treeNodeLayer.layerObj.url = level.url;
        }
        
        var childsChecked = 0;
        var totalChilds = 0;
        
        if(level.children != undefined ){
            for(var i = 0 ; i < level.children.length; i++){
                var l = this.addLevel(level.children[i]);
                if(l.node != null) {
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
        if(this.groupCheck) {
            var tristate = this.updateTriStateClass(null, childsChecked, totalChilds);
            if(tristate === 1) {
                treeNodeLayer.checked = true;
            }
            else if (tristate === 0) {
                treeNodeLayer.cls = 'tristatenode';
            }
        }
        treeNodeLayer.children= nodes;
        var node = {
            node: treeNodeLayer,
            tristate: tristate
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
        var service = this.services[appLayerObj.serviceId];
        var serviceLayer = service.layers[appLayerObj.layerName];
        var layerTitle = appLayerObj.alias;
        var layerId = "layer-"+appLayerObj.id;
        var me = this;
        var treeNodeLayer = {
            text: '<span id="span_'+ layerId+'">'+layerTitle +'</span>',
            id: layerId,
            expanded: me.expandOnStartup,
            leaf: true,
            background: appLayerObj.background,
            layerObj: {
                service: service.id,
                layerName : appLayerObj.layerName,
                appLayer: appLayerObj
            }
        };
        if (!this.showLeafIcon){
            treeNodeLayer.iconCls='no_treenode_icon';
        }
        if(serviceLayer === undefined){
            return null;
        }
        if(serviceLayer.details != undefined){
            if(serviceLayer.details ["metadata.stylesheet"] !== undefined){
                this.addQtip("Metadata voor de kaartlaag", 'span_'+layerId);
                treeNodeLayer.layerObj.metadata = serviceLayer.details ["metadata.stylesheet"];
            }
            
            if(serviceLayer.details ["download.url"] != undefined){
                this.addQtip("Metadata voor de kaartlaag", 'span_'+layerId);
                treeNodeLayer.layerObj.download = serviceLayer.details ["download.url"];
            }
            
        }
        var retChecked = false;
        if(this.layersChecked){
            treeNodeLayer.checked = appLayerObj.checked;
            retChecked = appLayerObj.checked;
        } else if(appLayerObj.checked) {
            treeNodeLayer.hidden_check = appLayerObj.checked;
            retChecked = appLayerObj.checked;
        }        
        return {
            node: treeNodeLayer,
            checked: retChecked
        };
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
                text: "Achtergrond", 
                id: this.name + "Achtergrond",
                expanded: this.expandOnStartup,
                expandable: true,
                collapsible : true,
                leaf: false,
                background: false,
                checked : false,
                children: nodesArray
            };
            var tristate = this.updateTriStateClass(null, childsChecked, totalChilds);
            if(tristate === 1) {
                background.checked = true;
            }
            else if (tristate === 0) {
                background.cls = 'tristatenode';
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
                Ext.getCmp("toggleAllLayersButton").setText(this.toggleAllLayersState ? this.toggleAllLayersOnText:this.toggleAllLayersOffText);
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
        if (this.qtips.length > 0){
            var me = this;
            setTimeout(function(){
                me.registerQtips();
            },500);
        }
    },
    insertLayer : function (config){
        var root = this.panel.getRootNode();
        root.appendChild(config);
        root.expand();
    },
    getAppLayerId : function (name){
        // Not the correct way to get the applayerID TODO: Fix it
        for ( var i in this.appLayers){
            var appLayer = this.appLayers[i];
            if(appLayer.layerName=== name){
                return "layer-"+appLayer.id;
            }
        }
        return null;
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
    
    updateTriStateClass: function(node, totalChecked, totalNodes) {
        var tristate = 0;
        if(!this.groupCheck) return tristate;
        if(totalChecked === 0) {
            tristate = -1;
        } else if(totalChecked === totalNodes) {
            tristate = 1;
        }
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
            if(me.layersChecked || (childNode.hasChildNodes() && me.groupCheck)) childNode.set('checked', checked);
            else {
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
            if(Ext.isDefined(node.data.checked)) return node.data.checked;
            if(Ext.isDefined(node.data.hidden_check)) return node.data.hidden_check;
        }
        if(Ext.isDefined(node.raw)) {
            if(Ext.isDefined(node.raw.checked)) return node.raw.checked;
            if(Ext.isDefined(node.raw.hidden_check)) return node.raw.hidden_check;
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
        var node = this.panel.getRootNode().findChild("id",nodeId,true);
        if (node){
            node.set('checked', vis);
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
                this.viewerController.setLayerVisible(layer.appLayer, true);
            }else{
                this.viewerController.setLayerVisible(layer.appLayer, false);
            }
        }
    },
    /*************************  Event handlers ***********************************************************/
     
    checkboxClicked : function(nodeObj,checked,toc){
        this.updateMap(nodeObj, checked);
        this.setTriState(nodeObj);
        
        var scale = this.viewerController.mapComponent.getMap().getScale();
        
        this.checkScaleLayer(nodeObj,scale);
    },
    // Open the popup with the metadata/info of the level/applayer
    itemClicked: function(thisObj, record, item, index, e, eOpts){
        if(e.target.nodeName.toUpperCase() === "INPUT" ||
            e.target.className === "toc-zoomtoscale-text"){
            return;
        }
        var node = record.raw;
        if(node ===undefined){
            node = record.data;
        }
        this.viewerController.layerClicked(node.layerObj);
    },
    // Entrypoint for when the selected content is changed: destroy the current tree and rebuild it.
    selectedContentChanged : function (){
        this.panel.destroy();
        this.loadTree();
        this.loadInitLayers();
    },
    extentChanged : function (map,obj){
        var scale = map.getScale(obj.extent);
        this.checkScaleLayer(this.panel.getRootNode(),scale);
    },
    checkScaleLayer : function (child,scale){
        if(child.isLeaf()){
            var layerObj = null;
            if(child.raw && child.raw.layerObj) layerObj = child.raw.layerObj;
            if(child.data && child.data.layerObj) layerObj = child.data.layerObj;
            var record = this.panel.getView().getNodeByRecord(child);
            // Check for not existing/visible layers (ie. layers in (background) levels 
            if(record != null){
                var extElement = Ext.fly(record);
                //if(this.isInScale(scale, layer.minScale, layer.maxScale)){
                var spanEl = Ext.get("span_"+child.data.id);
                if (this.viewerController.isWithinScale(layerObj.appLayer,scale)){
                    extElement.removeCls("toc-outofscale");
                    extElement.addCls("toc-inscale");
                    spanEl.parent().removeCls('toc-zoomtoscale');
                }else{
                    extElement.removeCls("toc-inscale");
                    extElement.addCls( "toc-outofscale");
                    if (child.data.checked){
                        var parent =spanEl.parent();
                        parent.addCls('toc-zoomtoscale');    
                        var ztsId="span_"+child.data.id+"_zoomtoscale";
                        var zts=Ext.get(ztsId);
                        //if ZoomToScale object !exists create one.
                        if (!zts){
                            parent.insertHtml("beforeEnd",'<br/>');
                            var newSpan = document.createElement("span");
                            newSpan.id=ztsId;
                            newSpan.innerHTML=this.zoomToScaleText;
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
        this.viewerController.zoomToLayer(this.viewerController.getAppLayerById(layerObj.id));
    },
    // Override function so tree-scroll-fix can be applied
    doResize: function() {
        var me = this;
        me.panel.doLayout();
        me.applyTreeScrollFix();
    }
});
