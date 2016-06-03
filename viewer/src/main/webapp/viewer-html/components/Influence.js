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
 * Buffer component
 * Creates a influence component.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Influence",{
    extend: "viewer.components.Search",  
    panel: null,
    config: {
        layers: null,
        details: {
            minWidth: 450,
            minHeight: 250
        }
    },
    location: null,
    vectorLayer: null,
    layerSelector:null,
    removeButton: null,
    mapClickActivated: null,
    markerId: 'influence_marker',
    /**
     * Constructor for influence
     * @constructor
     */
    constructor: function (conf){     
        if(conf.searchUrl && conf.searchUrl!=""){
            conf.searchconfigs=[{
                id: 1,
                url: conf.searchUrl,
                name: conf.searchName
            }];
        }else{
            conf.searchconfigs=[];
        }
        conf.formHeight = 130;///*MobileManager.isMobile() ? 140 : */130;
        viewer.components.Influence.superclass.constructor.call(this, conf);
        var me = this;
        
        this.removeButton = this.form.query('#' + this.name+"_remove")[0];
        this.removeButton.setVisible(false);
        
        this.toolMapClick = this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.config.viewerController
        });
        Ext.mixin.Observable.capture(this.config.viewerController.mapComponent.getMap(), function(event) {
            if(event == viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO) {
                if(me.mapClickActivated) {
                    return false;
                }
            }
            return true;
        });        
        
        var config = {
            viewerController : this.config.viewerController,
            restriction : "influence",
            layers: this.config.layers
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        Ext.ComponentQuery.query('#' + this.name + 'LayerSelectorPanel')[0].add(this.layerSelector.getLayerSelector());
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
            itemId: this.name + 'LayerSelectorPanel',
            xtype: "container",
            width: '100%',
            height: 30,
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });
        itemList= formItemsBefore.concat(itemList);
        //only if there is a search button add the or label
        if (this.searchconfigs.length> 0){
            itemList.push({
                xtype: 'label',
                margin: this.margin,
                text: 'of'            
            });
        }
        itemList.push({
            xtype: 'button',
            text: 'Locatie aanwijzen op kaart',
            margin: this.margin,
            listeners: {
                click:{
                    scope: this,
                    fn: this.locationOnMap
                }
            }            
        });
        
        itemList.push({
            xtype: 'button',
            text: 'Verwijder invloedsgebied',
            margin: this.margin,
            listeners: {
                click:{
                    scope: this,
                    fn: this.removeInfluence
                }
            },
            itemId: this.name+"_remove"
        });
        
        return itemList;
    },
    /**
     * Start clicking action for the map. Hide the map and activate the click tool
     */
    locationOnMap: function(){
        this.toolMapClick.activateTool();
        this.mapClickActivated = true;
        this.popup.hide();
        if(this.results != null){
            this.results.destroy();
        }         
    },
    /**
     * Remove the influence filter and the map geom
     */
    removeInfluence: function(){
        this.removeFromMap();
        this.removeButton.setVisible(false);
        this.location=null;
        this.config.viewerController.mapComponent.getMap().removeMarker(this.markerId);
        if (this.getSelectedAppLayer()){
            this.config.viewerController.removeFilter("filter_"+this.getName(),this.getSelectedAppLayer());
        }
    },    
    /**
     * Remove the influence from the map
     */
    removeFromMap: function() {
        if (this.vectorLayer){
            this.vectorLayer.removeAllFeatures();
        }
    },
    /**
     * Triggers when there is clicked on the map with the mapclick tool
     * @param toolMapClick the tool that is used for clicking
     * @param comp options.
     */
    mapClicked : function (toolMapClick,comp){                
        this.toolMapClick.deactivateTool();        
        var me = this;
        // Only allow feature info after some time because it is raised directly
        // after this method for the same click
        window.setTimeout(function() {
            me.mapClickActivated = false;
        }, 100);
        this.layerSelector.initLayers();
        this.popup.show();
        var coords = comp.coord;
        var x = coords.x;
        var y = coords.y;        
        this.handleSearchResult({
            x: x,
            y: y
        });
    },
    /**
     * Handle the searchResult if there is clicked on one of the found results.
     * @param location the location that is found
     * @param location.x the x coord
     * @param location.y the y coord.
     */
    handleSearchResult: function (loc){
        this.location=loc;
        var radius = this.getRadius();
        //radius ==null if no layer is selected
        if (radius!=null){
            this.config.viewerController.mapComponent.getMap().setMarker(this.markerId,loc.x,loc.y);
            var zoomInRadius=radius*1.5;
            var extent = {
                minx: loc.x-zoomInRadius,
                maxx: loc.x+zoomInRadius,
                miny: loc.y-zoomInRadius,
                maxy: loc.y+zoomInRadius
            };            
            this.showInfluence(loc.x,loc.y,radius);
            this.setFilter(extent);
            this.removeButton.setVisible(true);
        }else{
            Ext.MessageBox.alert("Onvolledig", "Er is geen Kaartlaag geselecteerd");
        }        
    },
    /**
     * Create the filter and add it to the selected AppLayer.
     * If no geometryattribute available for layer, don't add the filter.
     * 
     */
    setFilter: function(extent){
        var appLayer=this.getSelectedAppLayer(); 
        var me = this;          
        if(appLayer.attributes == undefined) {   
            this.config.viewerController.getAppLayerFeatureService(appLayer).loadAttributes(appLayer,function(){
                me.setFilter();                
            },function(e){
                Ext.MessageBox.alert("Error", e);
            });
        }else{
            var radius = this.getRadius();
            var geomAttr= appLayer.geometryAttribute; 
            if (geomAttr!=undefined){
                var filter="DWITHIN(\""+geomAttr+"\", POINT("+this.location.x+" "+this.location.y+"), "+radius+", meters)";
                this.config.viewerController.setFilter(
                    Ext.create("viewer.components.CQLFilterWrapper",{
                        id: "filter_"+this.getName(),
                        cql: filter,
                        operator : "AND",
                        type: "GEOMETRY"
                    }),appLayer);
            }            
        }
        if (extent){
            setTimeout(function (){
                me.config.viewerController.mapComponent.getMap().zoomToExtent(extent);
            },1000);
        }
    },
    /**
     * Get the selected appLayer
     */
    getSelectedAppLayer: function(){
        return this.layerSelector.getSelectedAppLayer();       
    },
    /**
     * Get the radius.
     */
    getRadius: function(){
        var appLayer = this.getSelectedAppLayer();      
        if (appLayer!=null && appLayer.details!=undefined && appLayer.details.influenceradius!=undefined){
            return Number(appLayer.details.influenceradius);
        }
        return null;
    },
    /**
     * Make a WKT polygon that represents a circle
     * @param x center x point
     * @param y center y point
     * @param radius the radius of the circle
     * @param segments number of segments for the circle.
     */
    makeCircleAsPolygon: function(x,y,radius,segments){
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
    /**
     * Show the geometry on the map.
     * @param x the x coordinate of the point
     * @param y the y coordinate of the point
     * @param radius the radius of th influence
     */
    showInfluence: function(x,y,radius){   
        var geom=this.makeCircleAsPolygon(x,y,radius,32);
        this.vectorLayer.removeAllFeatures();
        var feat = Ext.create("viewer.viewercontroller.controller.Feature",{
            wktgeom: geom,
            id: "Influence_0"
        });
        this.vectorLayer.addFeature(feat);
    }
});
