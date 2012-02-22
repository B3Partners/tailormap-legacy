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
 * StreetView component
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Legend",{
    extend: "viewer.components.Component",
    queue : null,
    legends : null,
    config:{
        name: "Legend",
        title: "",
        titlebarIcon : "",
        tooltip : ""
    },
    constructor: function (conf){        
        viewer.components.Legend.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var legendContainer = document.getElementById(this.div);
      
        legendContainer.style.overflow = "auto";
        this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);
        this.start();
        return this;
    },
    makeLegendList : function (){
        var visibleLayers = this.viewerController.getVisibleLayerIds();
        this.legends = new Array();
        for(var i = 0 ; i<visibleLayers.length;i++){
            var id = visibleLayers[i];
            var service = id.substring(0,id.indexOf("_"));
            var layerName = id.substring(id.indexOf("_")+1);
            var url = this.viewerController.getLayerLegendImage(service,layerName);
            var legend = {
                src: url,
                title: layerName,
                id: id
            };
            this.legends.push(legend);
        }
    },
    layerVisibilityChanged : function (map,object ){
        var layer = object.layer;
        var vis = object.visible;
        if(vis){
            this.addLayer(layer);
        }else{
            this.removeLayer(layer);
        }
    },
    addLayer : function (layer){
        var serviceId = layer.options.serviceId;
        var layerName = layer.id;
        var url = this.viewerController.getLayerLegendImage(serviceId,layerName);
        var legend = {
            src: url,
            title: layerName,
            id: serviceId  + "_"+ layerName
        };
        this.queue.addItem(legend);
    },
    removeLayer: function (layer){
        var serviceId = layer.options.serviceId;
        var layerName = layer.id;
        var id = serviceId  + "_"+ layerName+"-div";
        var node =document.getElementById(id);
        var div = document.getElementById(this.div);
        div.removeChild(node);
    },
    start : function (){
        this.makeLegendList();
        var config ={
            legends: this.legends, 
            queueSize: 1,
            div: this.div
        };
        this.queue = Ext.create("viewer.components.ImageQueue",config);
        this.queue.load();
    }
});

Ext.define ("viewer.components.ImageQueue",{
    loadedLegends : null,
    config :{
        legends : null,
        queueSize : null,
        div : null
    },
    constructor : function (config){
        this.initConfig(config);
    },
    addItem : function (item){
        this.legends.push(item);
        this.load();
    },
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
        var plek = document.getElementById(this.div);
        var div = document.createElement("div");
        div.id = this.item.id + "-div";
        div.innerHTML = "<h3>"+ this.item.title+"</h3>";
        plek.appendChild(div);
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