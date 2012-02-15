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
        this.addEvents(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_OFF,viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_ON);
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
                checkchange:{
                    toc: this,
                    fn: this.checkboxClicked
                },
                itemclick:{
                    toc: this,
                    fn: this.itemClicked
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
            },
                    
            qtip: level.name
        };
        if(this.groupCheck){
            treeNodeLayer.checked=  false; // Todo: find children checkboxes
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
        
        var treeNodeLayer = {
            text: appLayerObj.layerName, // TODO: Search title
            id: appLayerObj.id,
            expanded: true,
            leaf: true,
            layerObj: {
                service: service.id,
                layerName : appLayerObj.layerName
            },
            qtip: appLayerObj.layerName// TODO: Search title
        };
        if(this.layersChecked){
            treeNodeLayer.checked=  appLayerObj.checked; // Todo: find children checkboxes
        }
        return treeNodeLayer;        
    },
   
    insertLayer : function (config){
        var root = this.panel.getRootNode();
        root.appendChild(config);
        root.expand()
    },

    checkboxClicked : function(nodeObj,checked,toc){
        
        if(nodeObj.data.leaf){
            toc.toc.updateParent(nodeObj,checked);
        }else{
            
        }
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
    
    updateParent : function (node, checked){
        var parent = node.parentNode;
        if(parent != null){
            parent.data.checked = checked;
            parent.updateInfo();
            this.updateParent(parent,checked);
        }
    },
    itemClicked: function(thisObj, record, item, index, e, eOpts){
        // TODO don't fire when checkbox is clicked
        var layerName = record.data.text;
        if(record.data.leaf){
        // get metadata
        }else if(!record.data.leaf){
        // get info
        }
    }
});
