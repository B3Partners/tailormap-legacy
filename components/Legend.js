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
        /*legends.push({
            src:"http://wallshq.com/wp-content/uploads/original/2011_06/19_764-green-abstract-background_WallsHQ.com_.jpg", 
            title: "1"
        });
        legends.push({
            src:"http://www.chakraplein.nl/images/aap.jpg",
            title: "2"
        });
        legends.push({
            src:"http://blog.hipenhandig.nl/wp-content/uploads/2011/02/doutzen-kroes.jpg", 
            title: "3"
        });
        legends.push({
            src:"http://www.corvanvliet.nl/wp-content/uploads/2011/10/boom1.jpg",
            title: "4"
        });
        legends.push({
            src:"http://2.bp.blogspot.com/-h7vM7nbVnSs/TjAFE7TwvsI/AAAAAAAABOo/FdXHbIW3HPY/s1600/Background-Images-1.jpg",
            title: "5"
        });
        legends.push({
            src:"http://www.dvd-ppt-slideshow.com/images/ppt-background/background-3.jpg",
            title: "6"
        });
        */
        
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
                title: layerName
            };
            this.legends.push(legend);
        }
    },
    start : function (){
        this.makeLegendList();
        var config ={
            legends: this.legends, 
            queueSize: 1,
            div: this.div
        };
        this.queue = Ext.create("viewer.components.ImageQueue",config);
        this.queue.startLoading();
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
    
    startLoading : function (){
        for( var i = 0 ;i < this.queueSize; i++){
            var item = this.legends[i];
            if(item == undefined){
                return;
            }
            var config = {
                item: item,
                id : i,
                queue: this,
                div : this.div
            };
            var image = Ext.create("viewer.components.Image",config);
            this.removeLegend (item);
            image.loadImage();
        }
    },
    imageLoaded : function (img,item){
        // update legends
        this.startLoading();
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
        console.log("start loading" + this.item.title);
        var plek = document.getElementById(this.div);
        this.legendimg = document.createElement("img");
        plek.appendChild(this.legendimg);
        this.legendimg.name = this.item.title;        
        this.legendimg.alt = "Legenda " + this.item.title;
        this.legendimg.onerror=this.treeImageError;
        this.legendimg.imgObj = this;
        this.legendimg.onload=this.treeImageOnload;
        
        this.legendimg.className = 'treeLegendImage';
        this.legendimg.src = this.item.src;
    },
    treeImageOnload : function (){
        console.log("loading finished:" + this.imgObj.item.title);
        this.imgObj.queue.imageLoaded(this.imgObj.legendimg,this.imgObj.item);
    },
    treeImageError :function (a,b,c){
        alert("FOUT: ",a);
    }
});