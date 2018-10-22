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
 * CurrentLocation tool
 * Gets the location by using the Geo API
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.CurrentLocation",{
    extend: "viewer.components.Component",
    button: null,
    watchId: null,
    geolocationProj: null,
    mapProj: null,
    lastPoint: null,
    MARKER_PREFIX: "CurrentLocation_",
    config: {
        interval: null,
        tooltip: i18next.t('viewer_components_currentlocation_0')
    },
    constructor: function(config){
        this.callParent(arguments);
        //set some defaults.
       
        if (this.config.interval==null || isNaN(this.config.interval)){
            this.config.interval=0;
        }        
        if (Proj4js.defs["EPSG:4326"]==undefined){
            Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ";
        }
        this.geolocationProj= new Proj4js.Proj("EPSG:4326");
        //needs to be configurable
        if (Proj4js.defs["EPSG:28992"]==undefined){
            Proj4js.defs["EPSG:28992"]= "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs";
        }
        this.mapProj= new Proj4js.Proj("EPSG:28992");
        this.createButton();
    },
    /**
     * Create the button
     */
    createButton: function(){
        //if there is a interval defined. Make the button a toggle
        var renderButton = this.config.interval==0;
        var type=viewer.viewercontroller.controller.Tool.TOGGLE;
        if (renderButton){
            type=viewer.viewercontroller.controller.Tool.BUTTON;
        }
        this.button= this.config.viewerController.mapComponent.createTool({
            type: type,
            id: this.getName(),
            displayClass: "currentLocation",
            tooltip: this.config.tooltip || null,
            viewerController: this.config.viewerController,
            preventActivationAsFirstTool: renderButton
        });
        this.config.viewerController.mapComponent.addTool(this.button);
        this.button.blocksDefaultTool = false;
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,this.buttonDown, this);
        if (this.config.interval>0){
            this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,this.buttonUp, this);
        }
    },
    buttonDown: function(){
        if (this.config.interval==0){
            this.getLocation();
        }else{
            this.startWatch();
        }
    },
    buttonUp: function(){
        this.stopWatch();
    },
    /**
     * Get the location.
     */
    getLocation: function(){
        var me = this;
        navigator.geolocation.getCurrentPosition(function(pos){
            me.locationHandler(pos);
        },function(pos){
            me.errorHandler(pos);
        });
    },
    /**
     *Start watching the position
     */
    startWatch: function(){
        var me = this;
        this.watchId = navigator.geolocation.watchPosition(function(pos){
            me.locationHandler(pos);
        },function(pos){
            me.errorHandler(pos);
        },{
            timeout: this.config.interval
        })
    },
    /**
     *Stop watching the position
     */
    stopWatch: function(){
        navigator.geolocation.clearWatch(this.watchId);
        this.config.viewerController.mapComponent.getMap().removeMarker(this.MARKER_PREFIX+this.getName());
    },
    /**
     * Handles the location
     */
    locationHandler: function(position){
        var lat = Number(position.coords.latitude);
        var lon = Number(position.coords.longitude);
        this.lastPoint = this.transformLatLon(lon,lat);
        this.config.viewerController.mapComponent.getMap().moveTo(this.lastPoint.x,this.lastPoint.y);
        this.config.viewerController.mapComponent.getMap().setMarker(this.MARKER_PREFIX+this.getName(),this.lastPoint.x,this.lastPoint.y);
    },
    /**
     * Handle errors.
     */
    errorHandler: function(error){
        var message="";
        if (error.code == error.PERMISSION_DENIED){
            message=i18next.t('viewer_components_currentlocation_1');
        }if (error.code == error.POSITION_UNAVAILABLE){
            message=i18next.t('viewer_components_currentlocation_2');
        }if (error.code == error.TIMEOUT){
            message=i18next.t('viewer_components_currentlocation_3');
        }
        this.button.deactivate();
        if (this.lastPoint!=null){
            this.config.viewerController.mapComponent.getMap().setMarker(this.MARKER_PREFIX+this.getName(),this.lastPoint.x,this.lastPoint.y);
        }
        this.config.viewerController.logger.error(i18next.t('viewer_components_currentlocation_4')+message);
    },
    transformLatLon: function(x,y){
        var point = new Proj4js.Point(x,y);
        Proj4js.transform(this.geolocationProj,this.mapProj,point);
        return point;
    }
});
