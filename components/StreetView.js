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
 * StreetView component
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.StreetView",{
    extend: "viewer.components.Component",
    config:{
        name: "Street View",
        title: "",
        titlebarIcon : "",
        tooltip : ""
    },
    /*this.roundImgPath=contextPath+"/viewer-html/components/resources/images/maptip/round.png";
    this.arrowImgPath=contextPath+"/viewer-html/components/resources/images/maptip/arrow.png";*/
    iconUrl_up: null,
    iconUrl_over: null,
    iconUrl_sel: null,
    iconUrl_dis: null,
    toolMapClick: null,
    button: null,
    url: "",
    constructor: function (conf){        
        viewer.components.tools.StreetView.superclass.constructor.call(this, conf);
        this.initConfig(conf);   
        
        this.iconUrl_up= contextPath+"/viewer-html/components/resources/images/streetview/streetview_up.png";
        this.iconUrl_over= contextPath+"/viewer-html/components/resources/images/streetview/streetview_over.png";
        this.iconUrl_sel= contextPath+"/viewer-html/components/resources/images/streetview/streetview_down.png";
        this.iconUrl_dis= contextPath+"/viewer-html/components/resources/images/streetview/streetview_up.png";
        
        this.toolMapClick = this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name,
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.viewerController
        });
        
        this.toolMapClick.addListener(viewer.viewercontroller.controller.Event.ON_ACTIVATE,this.onActivate,this);
        this.toolMapClick.addListener(viewer.viewercontroller.controller.Event.ON_DEACTIVATE,this.onDeactivate,this);
        
        this.button= this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.TOGGLE,
            name: this.getName(),
            iconUrl_up: this.iconUrl_up,
            iconUrl_over: this.iconUrl_over,
            iconUrl_sel: this.iconUrl_sel,
            iconUrl_dis: this.iconUrl_dis,
            enabled: false,
            selected:false,
            tooltip: this.config.tooltip || null,
            viewerController: this.viewerController
        });
        
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,this.buttonDown, this);
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,this.buttonUp, this);
        
        //TODO don't set SRS hardcoded        
		Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs";
		Proj4js.defs["EPSG:4236"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ";
        
        this.url="http://maps.google.nl/maps?q=[y],[x]&z=16&layer=c&cbll=[y],[x]&cbp=12,0,,0,0";
        return this;
    },
    mapClicked : function (toolMapClick,comp){        
        var coords = comp[1];
        var x = coords.x;
        var y = coords.y;
        var point = this.transformLatLon(x,y);
        var newUrl = ""+this.url;
        newUrl=newUrl.replace(/\[x\]/g, point.x);
        newUrl=newUrl.replace(/\[y\]/g, point.y);
        window.open(newUrl);
    },
    transformLatLon : function(x,y){
        var dest = new Proj4js.Proj("EPSG:4236");
        //TODO don't set SRS hardcoded
        var source = new Proj4js.Proj("EPSG:28992");
        var point = new Proj4js.Point(x,y);
        Proj4js.transform(source,dest,point);
        return point;
    },
    /**
     *The next functions will synchronize the button and the tool.
     */
    /**
     * When the button is hit and toggled true
     * @param button the button
     * @param object the options.        
     */
    buttonDown : function(button,object){        
        this.toolMapClick.activateTool();
    },
    /**
     * When the button is hit and toggled false
     */
    buttonUp: function(button,object){
        this.toolMapClick.deactivateTool();
    },    
    /**
     * raised when the tool is activated.
     */    
    onActivate: function (){
        this.button.setSelectedState(true);
    },
    /**
     * raised when the tool is deactivated.
     */
    onDeactivate: function(){
        this.button.setSelectedState(false);
    }
});