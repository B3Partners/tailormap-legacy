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
 * Buffer component
 * Creates a influence component.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Influence",{
    extend: "viewer.components.Search",  
    panel: null,
    config: {
        layers: null
    },
    location: null,
    vectorLayer: null,
    /**
     * Constructor for influence
     * @constructor
     */
    constructor: function (conf){        
        conf.searchconfigs=[{
            id: 1,
            url: conf.searchUrl,
            name: conf.searchName
        }];
        viewer.components.Influence.superclass.constructor.call(this, conf);
        //this.initConfig(conf);        
        this.toolMapClick = Ext.create ("viewer.components.tools.ToolMapClick",{
            id: this.name,
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.viewerController
        });
        
        this.vectorLayer=this.viewerController.mapComponent.createVectorLayer({
            id: this.name + 'VectorLayer',
            name: this.name + 'VectorLayer',
            geometrytypes:["Polygon"],
            showmeasures:false,
            editable: true,
            style: {
                fillcolor: "0xFF0000",
                fillopacity: 50,
                strokecolor: "0xFF0000",
                strokeopacity: 50
            }
        });
        this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        return this;
    },
    /**
     * Get the items for this form.
     * @overwrite
     */
    getFormItems: function(){
        var itemList=viewer.components.Influence.superclass.getFormItems.call(this);
        //the items that must be placed before the search items.
        var formItemsBefore = new Array();
        formItemsBefore.push({
            xtype: 'label',
            text: 'Selecteer Kaartlaag'
        });        
        var layers=[];
        for (var l =0; l < this.layers.length; l++){
            var layerId=this.layers[l];
            var layer = this.viewerController.getServiceLayerById(layerId);
            var title = layer.titleAlias != undefined? layer.titleAlias : layer.title;
            
            var appLayer = this.viewerController.getApplayer(layer.serviceId,layer.name);
            if (appLayer.details!=undefined && appLayer.details.influenceradius!=undefined){
                layers.push({value: appLayer.id,'show': title});
            }
        }        
        var configs = Ext.create('Ext.data.Store', {
            fields: ['value','show'],
            data : layers
        });
        formItemsBefore.push({
            xtype: 'combo',
            store: configs,
            queryMode: 'local',
            displayField: 'show',
            valueField: 'value',
            id: 'appLayers_' + this.name
        });
        itemList= formItemsBefore.concat(itemList);
        
        itemList.push({
            xtype: 'label',
            text: 'of'            
        });
        itemList.push({
            xtype: 'button',
            text: 'Locatie aanwijzen op kaart',
            listeners: {
                click:{
                    scope: this,
                    fn: this.locationOnMap
                }
            }            
        });
        
        return itemList;
    },
    /**
     * Start clicking action for the map. Hide the map and activate the click tool
     */
    locationOnMap: function(){
        this.toolMapClick.activateTool();
        this.popup.hide();
    },
    /**
     * Triggers when there is clicked on the map with the mapclick tool
     * @param toolMapClick the tool that is used for clicking
     * @param comp options.
     */
    mapClicked : function (toolMapClick,comp){                
        this.toolMapClick.deactivateTool();
        this.popup.show();
        var coords = comp[1];
        var x = coords.x;
        var y = coords.y;        
        this.handleSearchResult({x: x,y: y});
    },
    /**
     * Handle the searchResult if there is clicked on one of the found results.
     * @param location the location that is found
     * @param location.x the x coord
     * @param location.y the y coord.
     */
    handleSearchResult: function (loc){
        this.location=location;
        var radius = this.getRadius();
        //radius ==null if no layer is selected
        if (radius!=null){
            this.viewerController.mapComponent.getMap().setMarker("influence",loc.x,loc.y);
            var zoomInRadius=radius*10;
            var extent = {
                minx: loc.x-zoomInRadius,
                maxx: loc.x+zoomInRadius,
                miny: loc.y-zoomInRadius,
                maxy: loc.y+zoomInRadius
            };
            this.viewerController.mapComponent.getMap().zoomToExtent(extent);
            var wkt=this.getCircleAsPolygon(loc.x,loc.y,radius,32);
            this.showGeometry(wkt);
        }else{
            Ext.MessageBox.alert("Onvolledig", "Er is geen Kaartlaag geselecteerd");
        }
    },
    /**
     * Get the radius.
     */
    getRadius: function(){
        var appLayerId=Ext.getCmp('appLayers_' + this.name).getValue();
        if (appLayerId==null){
            return null;
        }
        var appLayer=this.viewerController.app.appLayers[appLayerId];        
        if (appLayer.details!=undefined && appLayer.details.influenceradius!=undefined){
            return Number(appLayer.details.influenceradius);
        }
        return null;
    },
    getCircleAsPolygon: function(x,y,radius,segments){
        var coordinates = new Array();
        for (var i=0; i < segments; i++){
            var rad=Math.PI/(segments/2)*i;
            var coord={
                x: radius*Math.cos(rad) + x,
                y: radius*Math.sin(rad) + y
            };
            coordinates.push(coord);
        }
        //close the ring
        coordinates.push(coordinates[0]);
        
        var wkt="POLYGON((";
        for (var i=0; i < coordinates.length; i++){
            if (i!=0){
                wkt+=",";
            }
            wkt+=coordinates[i].x+" "+coordinates[i].y
        }
        wkt+="))";
        return wkt;
    },
    showGeometry: function(geom){        
        this.vectorLayer.removeAllFeatures();
        var feat = Ext.create("viewer.viewercontroller.controller.Feature",{
            wktgeom: geom,
            id: "Influence_0"
        });
        this.vectorLayer.addFeature(feat);
    }
});
