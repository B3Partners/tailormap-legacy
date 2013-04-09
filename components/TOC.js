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
 * Overview component
 * Creates a overview map
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.TOC",{
    extend: "viewer.components.Component",
    panel: null,
    selectedContent : null,
    appLayers :  null,
    service : null,
    levels : null,
    backgroundLayers: null,
    popup:null,
    qtips:null,
    config: {
        groupCheck:true,
        layersChecked:true,
        showBaselayers:true,
        title: "Table of Contents",
        showLeafIcon: true
    },
    constructor: function (config){
        viewer.components.TOC.superclass.constructor.call(this, config);
        this.initConfig(config);
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
        Ext.QuickTips.init();
        this.qtips = new Array();
        var store = Ext.create('Ext.data.TreeStore', {
            root: {
                text: 'Root',
                expanded: true,
                checked: false,
                children: []
            }
        });
        
        store.addListener("beforeexpand",this.beforeExpand, this);
        
        var title = "";
        if(this.title && !this.viewerController.layoutManager.isTabComponent(this.name)) title = this.title;        
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
            store: store
        });
    },
    // Start the treetraversal
    loadInitLayers : function(){
        var nodes = new Array();
        for ( var i = 0 ; i < this.selectedContent.length ; i ++){
            var contentItem = this.selectedContent[i];
            if(contentItem.type ==  "level"){
                var level = this.addLevel(contentItem.id);
                if(level != null){
                    nodes.push(level.node);
                }
            }else if(contentItem.type == "appLayer"){
                var layer = this.addLayer(contentItem.id);
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
        var treeNodeLayer = {
            text: '<span id="span_'+levelId+'">'+level.name+'</span>', 
            id: levelId,
            expanded: !level.background,
            expandable: !level.background,
            collapsible: !level.background,
            leaf: false,
            background: level.background,
            layerObj: {
                serviceId: level.id
            }
        };
        if(this.groupCheck){
            treeNodeLayer.checked=  false;
        }
        if(level.info != undefined){
            this.addQtip("Informatie over de kaart", 'span_'+levelId);
            treeNodeLayer.layerObj.info = level.info;
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
        var treeNodeLayer = {
            text: '<span id="span_'+ layerId+'">'+layerTitle +'</span>',
            id: layerId,
            expanded: true,
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
        if(serviceLayer.details != undefined){
            if(serviceLayer.details ["metadata.stylesheet"] != undefined){
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
                expanded: true,
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
    registerQtips : function (){
        for (var i = 0; i < this.qtips.length; i++) {
            var qtip = this.qtips[i];
            Ext.tip.QuickTipManager.register({
                target: qtip.target,
                text: qtip.text
            });
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
    insertLayer : function (config){
        var root = this.panel.getRootNode();
        root.appendChild(config);
        root.expand();
    },
    getAppLayerId : function (name){
        // Not the correct way to get the applayerID TODO: Fix it
        for ( var i in this.appLayers){
            var appLayer = this.appLayers[i];
            if(appLayer.layerName== name){
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
        if(totalChecked == 0) {
            tristate = -1;
        } else if(totalChecked == totalNodes) {
            tristate = 1;
        }
        if(node != null) {
            if(tristate == -1) {
                node.data.tristate = -1;
                node.set('cls', '');
                node.set('checked', false);
            } else if(tristate == 1) {
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
        if(e.target.nodeName.toUpperCase() === "INPUT"){
            return;
        }
        var node = record.raw;
        if(node ===undefined){
            node = record.data;
        }
        var layerName = node.text;
        if(node.leaf){
            if(node.layerObj.metadata!= undefined || node.layerObj.download!= undefined ){
                var config = {
                    details:{
                        width : 700,
                        height: 500
                    },
                    title: "Metadata"
                };
                
                if(this.popup != null){
                    this.popup.hide();
                }
                
                var html = "";
                if(node.layerObj.metadata != undefined){
                    html += "<a target='_BLANK' href='" +node.layerObj.metadata + "'>Metadata</a>";
                }
                if(node.layerObj.download != undefined){
                    if(html != ""){
                        html += "<br/>";
                    }
                    html += "<a target='_BLANK' href='" +node.layerObj.download+ "'>Downloadlink</a>";
                }
                this.popup = Ext.create("viewer.components.ScreenPopup",config);
                var panelConfig={
                    renderTo : this.popup.getContentId(),
                    frame: false,
                    html: html
                };
                Ext.create ("Ext.panel.Panel",panelConfig);
                this.popup.show();
            }
        }else if(!node.leaf){
            if(node.layerObj.info!= undefined){
                if(this.popup != null){
                    this.popup.hide();
                }
                var config = {
                    details:{
                        width : 700,
                        frame: false,
                        height: 500
                    },
                    title: "Info"
                };
                
                this.popup = Ext.create("viewer.components.ScreenPopup",config);
                var panelConfig={
                    renderTo : this.popup.getContentId(),
                    html: node.layerObj.info
                };
                var panel = Ext.create ("Ext.panel.Panel",panelConfig);
                this.popup.show();
            }
        }
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
                if (this.viewerController.isWithinScale(layerObj.appLayer,scale)){
                    extElement.removeCls("toc-outofscale");
                    extElement.addCls("toc-inscale");
                }else{
                    extElement.removeCls("toc-inscale");
                    extElement.addCls( "toc-outofscale");
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
    // Override function so tree-scroll-fix can be applied
    doResize: function() {
        var me = this;
        me.panel.doLayout();
        me.applyTreeScrollFix();
    }
});
