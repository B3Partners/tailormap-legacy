Ext.define ("viewer.components.TOC",{
    extend: "viewer.components.Component",
    panel: null,
    config: {
        name: "",
        naam: "Table of Contents"
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
            title: this.naam,
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
        var layers = this.viewerController.app.rootLevel;
        this.loadChildren(layers.children);
    },
    loadChildren : function (child){        
        for ( var i = 0 ; i < child.length ; i++){
            var level = child[i];
            for ( var j = 0 ; j < level.layers.length; j++){
                var laag = level.layers[j];
                var treeNode = {
                    text: laag.layerName,
                    checked: laag.checked,
                    id: laag.id,
                    expanded: true,
                    leaf: true,
                    layerObj: {
                        service: laag.service,
                        layerName : laag.layerName
                    },
                    qtip: laag.layerName
                };
                this.insertLayer(treeNode);
            }
            if( level.children != undefined){
                this.loadChildren (level.children);
            }
        }
    },
    insertLayer : function (config){
        var layer = this.createLayer(config.layerObj);
        config.layerObj = layer;
        var root = this.panel.getRootNode();
        root.appendChild(config);
        root.expand()
    },
    
    createLayer : function (JSONConfig){
        
        /*var ogcOptions = {
            exceptions: "application/vnd.ogc.se_inimage",
            srs: "EPSG:28992",
            version: "1.1.1",
            name: JSONConfig.layerName,
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
        
        return this.viewerController.mapComponent.createArcIMSLayer(name,server,servlet,mapservice, ogcOptions, options);*/
        
        var layerUrl = JSONConfig.service.url;// "http://osm.kaartenbalie.nl/wms/mapserver?";
    
        var options={
            timeout: 30,
            retryonerror: 10,
            getcapabilitiesurl: JSONConfig.service.url,// layerUrl,
            ratio: 1,
            showerrors: true,
            initService: true
        };

        var ogcOptions={
            format: "image/png",
            transparent: true,
            exceptions: "application/vnd.ogc.se_inimage",
            srs: "EPSG:28992",
            version: "1.1.1",
            layers:JSONConfig.layerName,
            query_layers: JSONConfig.layerName,
            styles: "",
            noCache: false
        };
        options["isBaseLayer"]=false;
        return this.viewerController.mapComponent.createWMSLayer(JSONConfig.layerName,layerUrl , ogcOptions, options);
    },

    checkboxClicked : function(nodeObj,checked,toc){
        var node = nodeObj.raw;
        if(node ===undefined){
            node = nodeObj.data;
        }
        var layer = node.layerObj;
    
        if(checked){
            toc.toc.viewerController.mapComponent.getMap().addLayer(layer);
            nodeObj.updateInfo();
            toc.toc.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_ON,this,layer);
        }else{
            toc.toc.viewerController.mapComponent.getMap().removeLayer(layer)
            toc.toc.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYER_SWITCHED_OFF,this,layer);
        }
    },
    itemClicked: function(thisObj, record, item, index, e, eOpts){
        var layerName = record.data.text;
    }
});
