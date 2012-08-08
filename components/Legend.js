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
 * Legend
 * 
 * Shows legends for layers.
 * 
 * To prevent starvation of available HTTP requests for loading maps, this 
 * component limits the concurrent loading of legend images.
 * 
 * Legend images which use the data: protocol are not queued.
 * 
 * XXX are WMS getlegendgraphics requested again when unchecked and then checked?
 * XXX same for selectedcontentchange
 */
Ext.define("viewer.components.Legend", {
    extend: "viewer.components.Component",
    
    appLayerOrder: null,
    
    /*
    queue: null,
    legends: null,    
    initLegends: null,
    */
    config: {
        title: "Legend",
        titlebarIcon: "",
        tooltip: "",
        showBackground: false
    },
    constructor: function (conf){
        viewer.components.Legend.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        
        var title = "";
        if(this.config.title && !this.viewerController.layoutManager.isTabComponent(this.name)) title = this.config.title;
        this.panel = Ext.create('Ext.panel.Panel', {
            renderTo: this.getContentDiv(),
            title: title,
            height: "100%",
            html: '<div id="' + this.name + 'legendContainer" class="legend"></div>'
        });
        
        this.legendContainer = document.getElementById(this.name + 'legendContainer');
        
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.onLayersInitialized,this);
        
        // DISABLED OLD CODE
        //this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this);
        //this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);
        //this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.layerRemoved,this);
        
        //this.start();
        
        // TODO hide legend for layer on event
        
        // TODO recreate legend on selected content change
        
        return this;
    },
    
    onLayersInitialized: function() {
        console.log("received layers initialized event, creating legend");
        this.createLegendForSelectedContent();
    },
    
    createLegendForSelectedContent: function() {
        var me = this;
        
        var index = 0;
        me.appLayerOrder = {};
        
        this.viewerController.traverseSelectedContent(
            Ext.emptyFn,
            function(appLayer) {
                me.appLayerOrder[appLayer.id] = index++;
                
                if(!this.showBackground && appLayer.background) {
                    return;
                }
                
                if(appLayer.checked) {
                    me.createLegendForAppLayer(appLayer);
                }
            }
        );
    },

    createLegendForAppLayer: function(appLayer) {
        console.log("create legend for appLayer " + appLayer.alias +", order " + this.appLayerOrder[appLayer.id]);
        var me = this;
        this.viewerController.getLayerLegendInfo(
            appLayer,
            function(al, legend) {
                console.log("legend info received for appLayer " + al.alias, legend);
                
                // TODO use queue to prevent starvation of HTTP requests for 
                // map requests which should have priority
                
                var divLayer = document.createElement("div");
                divLayer.className = "layer";
                divLayer.data = appLayer.id;
                var divName = document.createElement("div");
                divName.className = "name";
                divName.innerHTML = Ext.htmlEncode(appLayer.alias);
                divLayer.appendChild(divName);

                if(legend.url) {
                    var img = document.createElement("img");
                    img.src = legend.url;
                    var divImage = document.createElement("div");
                    divImage.className = "image";
                    divImage.appendChild(img);
                    divLayer.appendChild(divImage);
                } else {
                    for(var i in legend.parts) {
                        var part = legend.parts[i];
                        var img = document.createElement("img");
                        img.src = part.url;
                        // TODO onload of image set label line-height to image heightr
                        var divImage = document.createElement("div");
                        divImage.className = "image";
                        divImage.appendChild(img);
                        divLayer.appendChild(divImage);
                        var divLabel = document.createElement("div");
                        divLabel.className = "label";
                        divLabel.innerHTML = Ext.htmlEncode(part.label);
                        divLayer.appendChild(divLabel);                        
                    }
                }
                // TODO use order to insert element at correct position
                me.legendContainer.appendChild(divLayer);
            },
            Ext.emptyFn
        );
    },
    
    // Construct the list of images to be retrieved by the queue
    makeLegendList : function (){
        this.initLegends = new Array();        
    },
    // Handler for changes to the visibility of layers
    layerVisibilityChanged : function (map,object ){
        var layer = object.layer;
        var vis = object.visible;
        if(vis){
            this.addLayer(layer);
        }else{
            this.removeLayer(layer);
        }
    },
    /**
     * Called when a layer is added
     * @param layer a viewer.viewercontroller.controller.Layer
     */
    addLayer : function (layer){
        var appLayer=this.viewerController.getAppLayerById(layer.appLayerId);
        var layerName = layer.getAppLayerName();
        /*if already added return; Still use serviceId_layerName because only one of the layer
        graphics must be added*/
        if(this.legends[layer.appLayerId]){
            return;
        }        
        //show backgrounds == false then don't show backgrounds.
        if (!this.getShowBackground()){
            if (appLayer.background){
                return;
            }
        }
        var url = this.viewerController.getLayerLegendImage(appLayer);
        if (url!=null){
            var legend = {
                src: url,
                title: layerName,
                id: layer.appLayerId
            };
            this.legends[layer.appLayerId]=true;
            this.queue.addItem(legend);
        }
    },
    layerRemoved : function(map, object){
        var layer = object.layer;
        if(layer != null){
            this.removeLayer(layer);
        }
    },
    removeLayer: function (layer){
        var appLayerId = layer.appLayerId;
        var id = appLayerId+"-div";
        var node =document.getElementById(id);
        if (node!=null){
            this.legendContainer.removeChild(node);
        }
        if (this.legends[appLayerId]){
            delete this.legends[appLayerId];
        }
    },
    // Start the legend: make a list of images to be retrieved, make a queue and start it
    start : function (){
        this.makeLegendList();
        var config ={
            legends: this.initLegends, 
            queueSize: 2,
            div: this.legendContainer
        };
        this.queue = Ext.create("viewer.components.ImageQueue",config);
        this.queue.load();
    },
    
    getExtComponents: function() {
        return [ this.panel.getId() ];
    }
});
/**
 * ImageQueue: A queue to load images
 */
Ext.define ("viewer.components.ImageQueue",{
    loadedLegends : null,
    config :{
        legends : null,
        queueSize : null,
        div : null
    },
    /**
    * @constructs
    * @param config.legends {Array} The legends to load
    * @param config.div {DomElement} the div where the images must be placed
    * @param config.queueSize {Number} How many images may be loaded at the same time
    */
    constructor : function (config){
        this.initConfig(config);
    },
    addItem : function (item){
        this.legends.push(item);
        this.load();
    },
    // Make the queue fill up all slots from the legends
    load : function (){
        while(this.queueSize > 0){
            var item = this.legends[0];
            if(item == undefined){
                return;
            }
            this.queueSize--;
            var config = {
                item: item,
                id : item.id,
                queue: this,
                div : this.div
            };
            var image = Ext.create("viewer.components.Image",config);
            this.removeLegend (item);
            image.loadImage();
        }
    },
    // Called when an image is ready loading
    imageLoaded : function (img,item){
        this.queueSize++;
        this.load();
    },
    
    removeLegend : function (item){
        for (var i = 0 ; i < this.legends.length ;i++){
            var legend = this.legends[i];
            if(legend.src == item.src){
                this.legends.splice(i,1);
                break;
            }
        }
    }
});

Ext.define("viewer.components.Image",{
    legendimg : null,
    config :{
        item : null,
        queue : null,
        div : null
    },
    constructor : function (config){
        this.initConfig(config);
    },
    /**
     * Start loading
     */
    loadImage: function (){
        var div = document.createElement("div");
        div.id = this.item.id + "-div";
        div.innerHTML = "<h3>"+ this.item.title+"</h3>";
        this.div.appendChild(div);
        this.legendimg = document.createElement("img");
        div.appendChild(this.legendimg);
        this.legendimg.name = this.item.title;
        this.legendimg.id = this.item.id;
        this.legendimg.alt = "Legenda " + this.item.title;
        this.legendimg.imgObj = this;        
        this.legendimg.onabort=this.treeImageError;
        this.legendimg.onerror=this.treeImageError;
        this.legendimg.onload=this.treeImageOnload;
        
        this.legendimg.className = 'treeLegendImage';
        this.legendimg.src = this.item.src;
    },
    /**
     * If images is loaded
     */
    treeImageOnload : function (){
        this.imgObj.queue.imageLoaded(this.imgObj.legendimg,this.imgObj.item);
    },
    /**
     * Called when images has error.
     */
    treeImageError :function (){  
        this.imgObj.queue.queueSize++;
    }
});