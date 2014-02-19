/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * OpenLayers Overview component
 * Creates a Overview component for OpenLayers
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.viewercontroller.openlayers.components.OpenLayersOverview",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersComponent",    
    config:{
        top:null,
        left:null,
        url:null,
        layers:null,
        position:null,
        height: null,
        width: null,
        lox: null,
        loy: null,
        rbx: null,
        rby: null,
        followZoom:null
    },
    
    constructor: function (conf){        
        this.height = 300;
        this.width= 300;
        viewer.viewercontroller.openlayers.components.OpenLayersOverview.superclass.constructor.call(this, conf);
        
        if (Ext.isEmpty(this.url)){
            throw new Error("No URL set for Overview component, unable to load component");
        }
        var maxBounds =this.viewerController.mapComponent.getMap().frameworkMap.maxExtent;
        var bounds;
        if (this.getLox()!=null && this.getLoy()!=null && this.getRbx()!=null && this.getRby()!=null
            && this.getLox()!=this.getRbx() && this.getLoy() != this.getRby()){            
            bounds = new OpenLayers.Bounds(this.getLox(),this.getLoy(),this.getRbx(),this.getRby());
        }else{
            bounds= maxBounds;
        }
        var size=new OpenLayers.Size(""+this.width,""+this.height);
        var layer =  new OpenLayers.Layer.Image(
            "OverviewLaag", 
            this.url,
            bounds,
            size
        );
        
        this.frameworkObject = new OpenLayers.Control.OverviewMap({
            maximized: true,
            mapOptions: {
                maxExtent: maxBounds,
                projection: "EPSG:28992"
            },
            size: size,
            layers: [layer]
        });
        if(this.followZoom !== undefined && this.followZoom !== null && this.followZoom ===false){
            this.frameworkObject.maxRatio= 999999;
        }

        return this;
    },
    
    getExtComponents: function() {
        return [];
    },
    
    //setters for bounds, make sure it are numbers
    setLox: function (value){
        if (isNaN(value)){
            this.lox=null;
            return;
        }
        this.lox = Number(value);
    },
    setLoy: function (value){
        if (isNaN(value)){
            this.loy=null;
            return;
        }
        this.loy = Number(value);
    },
    setRbx: function (value){
        if (isNaN(value)){
            this.rbx=null;
            return;
        }
        this.rbx = Number(value);
    },
    setRby: function (value){
        if (isNaN(value)){
            this.rby=null;
            return;
        }
        this.rby = Number(value);
    },
    //make sure the heigth and width are numbers
    setHeight: function (value){
        if (isNaN(value)){
            this.height=null;
            return;
        }else if (!Ext.isEmpty(value) && value > 0){
            this.height = Number(value);
        }
    },
    setWidth: function (value){
        if (isNaN(value)){
            this.width=null;
            return;
        }else if (!Ext.isEmpty(value) && value > 0){
            this.width = Number(value);
        }
        
    }
});


