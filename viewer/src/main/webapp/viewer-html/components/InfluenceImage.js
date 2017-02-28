/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Buffer component
 * Creates a influenceImage component.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.InfluenceImage",{
    extend: "viewer.components.Influence",
    combineImageService: null,
    imageLayer: null,
    /**
     * Constructor for influenceImage
     * @constructor
     */
    constructor: function (conf){               
        this.initConfig(conf);  
		viewer.components.InfluenceImage.superclass.constructor.call(this, this.config);
        if (this.vectorLayer!=null){
            this.config.viewerController.mapComponent.getMap().removeLayer(this.vectorLayer);
            delete this.vectorLayer;
        }
        this.combineImageService = Ext.create("viewer.CombineImage",{});
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this );
        var me = this;
        this.popup.popupWin.addListener("show",function(){
            me.layerSelector.initLayers();
        },this);
        return this;
    },
    selectedContentChanged : function (){
        if(this.imageLayer){
            this.config.viewerController.mapComponent.getMap().addLayer(this.imageLayer);
        }
        if(this.vectorLayer){
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },
    /**
     * Show the geometry on the map.
     * @param x the x coordinate of the point
     * @param y the y coordinate of the point
     * @param radius the radius of th influence
     * @see viewer.components.Influence#showGeometry
     */
    showInfluence: function(x,y,radius){  
        var geom=this.makeCircleAsPolygon(x,y,radius,32);
        var properties={};
        //make bbox around the point
        var minx=Number(x-radius);
        var maxx=Number(x+radius);
        var miny=Number(y-radius)
        var maxy=Number(y+radius);
        properties.bbox = minx+","+miny+","+maxx+","+maxy;        
        //image size
        properties.width = 800;
        properties.height = 800;
        properties.geometries=[{wktgeom: geom}];
        //do image request
        var me = this;
        this.combineImageService.getImageUrl(Ext.JSON.encode(properties),function(url){
            me.addImage(url,new viewer.viewercontroller.controller.Extent(properties.bbox));
            },this.imageFailure);        
    },
    /**
     * Add the image as influence area.
     * @param imageUrl the image url
     * @param bbox the bbox for this image (as new viewer.viewercontroller.controller.Extent)
     */
    addImage: function(imageUrl,bbox){                
        if (!this.imageLayer){
            this.imageLayer = this.config.viewerController.mapComponent.createImageLayer(this.name + "ImageLayer", imageUrl, bbox);
            this.config.viewerController.mapComponent.getMap().addLayer(this.imageLayer);
        }else{            
            this.imageLayer.setUrl(imageUrl);
            this.imageLayer.setExtent(bbox);
            this.imageLayer.setVisible(true);
            this.imageLayer.reload();
        }
    },
    /**
     * 
     */
    imageFailure: function(error){
        console.log(error);
    },
    /**
     * 
     */
    removeFromMap: function(){
        if (this.imageLayer){
            this.imageLayer.setVisible(false);
        }
    }
});
