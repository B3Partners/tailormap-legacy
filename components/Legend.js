/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * Creates the legend of the current switched on layers.
 * This legend uses a queue to load the images.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Legend",{
    extend: "viewer.components.Component",
    queue : null,
    legends : null,
    config:{
        // name: "Legend",
        title: "Legend",
        titlebarIcon : "",
        tooltip : ""
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
            html: '<div id="' + this.name + 'legendContainer" style="width: 100%; height: 100%; padding: 10px; overflow: auto;"></div>'
        });
        
        this.legendContainer = document.getElementById(this.name + 'legendContainer');
        this.legendContainer.style.overflow = "auto";
        
        this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);
        
        this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.layerRemoved,this);
        this.start();
        return this;
    },
    // Construct the list of images to be retrieved by the queue
    makeLegendList : function (){
        var visibleLayers = this.viewerController.getVisibleLayerIds();
        this.legends = new Array();
        for(var i = 0 ; i<visibleLayers.length;i++){
            var id = visibleLayers[i];
            var service = id.substring(0,id.indexOf("_"));
            var layerName = id.substring(id.indexOf("_")+1);
            //will change if the layers are combined.
            layerName=layerName.replace(""+service+"_","");
            var url = this.viewerController.getLayerLegendImage(service,layerName);
            if (url!=null){
                var legend = {
                    src: url,
                    title: layerName,
                    id: id
                };
                this.legends.push(legend);
            }
        }
    },
    // Handler for changes to the visibility of layers
    layerVisibilityChanged : function (map,object ){
        var layer = object.layer;
        var vis = object.visible;
        if(vis){
            this.addLayer(layer);
        }else{
           this.removeLayer(layer.id);
        }
    },
    // Called when a layer is added
    addLayer : function (layer){
        var serviceId = layer.serviceId;
        var layerName = layer.getAppLayerName();// TODO: not yet correct
        var url = this.viewerController.getLayerLegendImage(serviceId,layerName);
        if (url!=null){
            var legend = {
                src: url,
                title: layerName,
                id: serviceId  + "_"+ layerName
            };
            this.queue.addItem(legend);
        }
    },
    layerRemoved : function(map, object){
        var layer = object.layer;
        if(layer != null){
            this.removeLayer(layer.getId());
        }
    },
    removeLayer: function (layerName){
        var id = layerName+"-div";
        var node =document.getElementById(id);
        if (node!=null){
            this.legendContainer.removeChild(node);
        }
    },
    // Start the legend: make a list of images to be retrieved, make a queue and start it
    start : function (){
        this.makeLegendList();
        var config ={
            legends: this.legends, 
            queueSize: 1,
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
        this.legendimg.onerror=this.treeImageError;
        this.legendimg.imgObj = this;
        this.legendimg.onload=this.treeImageOnload;
        
        this.legendimg.className = 'treeLegendImage';
        this.legendimg.src = this.item.src;
    },
    treeImageOnload : function (){
        this.imgObj.queue.imageLoaded(this.imgObj.legendimg,this.imgObj.item);
    },
    treeImageError :function (){
        this.imgObj.queue.queueSize++;
    }
});