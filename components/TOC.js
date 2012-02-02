Ext.define ("viewer.components.TOC",{
    extend: "viewer.components.Component",
    panel: null,
    config: {
        name: "Table of Contents",
        naam: ""
    },
    constructor: function (config){
        viewer.components.TOC.superclass.constructor.call(this, config);
        this.addEvents(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_OFF,viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_ON);
        this.initConfig(config);
        this.loadTree();
        this.loadInitLayers();
        return this;
    },
    loadTree : function(){
   
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
            title: "Table of Contents",
            //width: 330,
            height: "100%",
            frame: true,
            useArrows: true,
            rootVisible: false,
            resizable: true,
            floating: false,
            listeners:{
                checkchange:{
                    toc: this,
                    fn: this.checkboxClicked
                }
            },
            store: store
        });
    },
    loadInitLayers : function(){
        var layers = this.viewerController.app.rootLevel;
        var b = this.loadChildren(layers.children);
        this.insertLayer(b);
        var a = 0;
    },
    loadChildren : function (child){
        var boom = new Array();
        
        for ( var i = 0 ; i < child.length ; i++){
            var level = child[i];
            /*{ text: "homework", expanded: true, 
                        children: [
                            { text: "book report", leaf: true }] */
            var configObj = {
                text: level.name,
                expanded: true,
                checked: level.checked
            }
            if(level.layers.length != 0){
                
            }
            
            if(level.children != undefined){
                configObj.children = this.loadChildren(level.children);
            }
          //  this.insertLayer(configObj);
            
            
            boom.push(configObj);
        }
        return boom;
    },
    insertLayer : function (laag){
        /*var treeNode = {
            text: laag.text,
            checked: laag.checked,
            expanded: laag.expanded,
            leaf: true
        };*/
       
        var root = this.panel.getRootNode();
        root.appendChild(laag);
        root.expand()
    },
/*
    createLayer : function (JSONConfig){
        var ogcOptions = {
            exceptions: "application/vnd.ogc.se_inimage",
            srs: "EPSG:28992",
            version: "1.1.1",
            name: JSONConfig.name,
            server:JSONConfig.server, 
            servlet:JSONConfig.servlet,
            mapservice:JSONConfig.mapservice,
            visibleids:JSONConfig.name,
            noCache: false // TODO: Voor achtergrond kaartlagen wel cache gebruiken
        };
        var options = {
            timeout: 30,
            retryonerror: 10,
            id:JSONConfig.id,
            ratio: 1,
            showerrors: true,
            initService: true
        }; 
        var mapservice = JSONConfig.mapservice;
        var servlet = JSONConfig.servlet;
        var name = JSONConfig.name;
        var server = JSONConfig.server;
        options["isBaseLayer"]=false;
        
        return this.viewerController.mc.createArcIMSLayer(name,server,servlet,mapservice, ogcOptions, options);
    },
*/
    checkboxClicked : function(nodeObj,checked,toc){
        var node = nodeObj.raw;
        if(node ===undefined){
            node = nodeObj.data;
        }
        var layer = node.layerObj;
    
        if(checked){
            var laag = toc.toc.createLayer(node.layerConfig);
            toc.toc.viewerController.mc.getMap().addLayer(laag);
            nodeObj.data.layerObj = laag;
            nodeObj.updateInfo();
            toc.toc.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_ON,this,laag);
        }else{
            toc.toc.viewerController.mc.getMap().removeLayer(layer)
            toc.toc.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_OFF,this,layer);
        }
    }
});
