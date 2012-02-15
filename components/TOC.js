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
    config: {
        groupCheck:true,
        layersChecked:true,
        showBaselayers:true,
        title: "Table of Contents"
    },
    constructor: function (config){
        viewer.components.TOC.superclass.constructor.call(this, config);
        this.initConfig(config);
        
        this.selectedContent = this.viewerController.app.selectedContent,
        this.appLayers = this.viewerController.app.appLayers,
        this.levels = this.viewerController.app.levels,
        this.services = this.viewerController.app.services,
        this.loadTree();
        this.loadInitLayers();
        
        return this;
    },
    loadTree : function(){
        Ext.QuickTips.init();
        var store = Ext.create('Ext.data.TreeStore', {
            root: {
                text: 'Root',
                expanded: true,
                checked: false,
                children: []
            }
        });
        this.panel =Ext.create('Ext.tree.Panel', {
            renderTo: this.div,
            title: this.title,
            //width: 330,
            height: "100%",
            //frame: true,
            useArrows: true,
            rootVisible: false,
            //resizable: true,
            floating: false,
            listeners:{
                itemclick:{
                    toc: this,
                    fn: this.itemClicked
                },
                checkchange:{
                    toc: this,
                    fn: this.checkboxClicked
                }
            },
            store: store
        });
    },
    loadInitLayers : function(){
        var nodes = new Array();
        for ( var i = 0 ; i < this.selectedContent.length ; i ++){
            var contentItem = this.selectedContent[i];
            if(contentItem.type ==  "level"){
                var level = this.addLevel(contentItem.id);
                nodes.push(level);
            }else if(contentItem.type == "appLayer"){
                var layer = this.addLayer(contentItem.id);
                nodes.push(layer);
            }
        }
        this.insertLayer(nodes);
    },
    addLevel : function (levelId){
        var nodes = new Array();
        var level = this.levels[levelId];
        var treeNodeLayer = {
            text: level.name, 
            id: level.id,
            expanded: true,
            leaf: false,
            layerObj: {
                serviceId: level.id
            }
        };
        if(this.groupCheck){
            treeNodeLayer.checked=  false; // Todo: find children checkboxes
        }
        if(level.info != undefined){
            treeNodeLayer.qtip= "Informatie over de kaart";
            treeNodeLayer.layerObj.info = level.info;
        }
        
        if(level.children != undefined ){
            for(var i = 0 ; i < level.children.length; i++){
                nodes.push(this.addLevel(level.children[i]));
            }
        }
        
        if(level.layers != undefined ){
            for(var j = 0 ; j < level.layers.length ; j ++){
                nodes.push(this.addLayer(level.layers[j]));
            }
        }
        
        treeNodeLayer.children= nodes;
        return treeNodeLayer;
    },
    
    addLayer : function (layerId){
        var appLayerObj = this.appLayers[layerId];
        var service = this.services[appLayerObj.serviceId];
        var serviceLayer = service.layers[appLayerObj.layerName];
        var layerTitle = this.viewerController.getLayerTitle(service.id, appLayerObj.layerName); // TODO: Search title
        var treeNodeLayer = {
            text: layerTitle,
            id: appLayerObj.id,
            expanded: true,
            leaf: true,
            layerObj: {
                service: service.id,
                layerName : appLayerObj.layerName
            }
        };
        if(serviceLayer.details != undefined && serviceLayer.details ["metadata.stylesheet"] != undefined){
            treeNodeLayer.qtip= "Metadata voor de kaartlaag";
            treeNodeLayer.layerObj.metadata = serviceLayer.details ["metadata.stylesheet"];
        }
        if(this.layersChecked){
            treeNodeLayer.checked = appLayerObj.checked; // Todo: find children checkboxes
        }
        return treeNodeLayer;        
    },
    insertLayer : function (config){
        var root = this.panel.getRootNode();
        root.appendChild(config);
        root.expand()
    },
    
    /*************************  Event handlers ***********************************************************/
    
    syncLayers : function (layer, visible){
        alert("awerw");
    },
    
    checkboxClicked : function(nodeObj,checked,toc){
        var node = nodeObj.raw;
        if(node ===undefined){
            node = nodeObj.data;
        }
        var layer = node.layerObj;
    
        if(checked){
            toc.toc.viewerController.setLayerVisible(layer.service, layer.layerName, true);
            toc.toc.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_ON,this,layer);
        }else{
            toc.toc.viewerController.setLayerVisible(layer.service, layer.layerName, false);
            toc.toc.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_OFF,this,layer);
        }
    },
    
    itemClicked: function(thisObj, record, item, index, e, eOpts){
        // TODO don't fire when checkbox is clicked
        var node = record.raw;
        if(node ===undefined){
            node = record.data;
        }
        var layerName = node.text;
        if(node.leaf){
            if(node.layerObj.metadata!= undefined){
                Ext.Msg.alert('Metadata', node.layerObj.metadata);
            }
        }else if(!node.leaf){
            if(node.layerObj.info!= undefined){
                Ext.Msg.alert('Info', node.layerObj.info);
            }
        }
    }
});
