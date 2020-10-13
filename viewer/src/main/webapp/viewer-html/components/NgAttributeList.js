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
 * HTML component
 * Creates an Angular AttributeList component
 * @author <a href="mailto:eddy.scheper@aris.nl">Eddy Scheper</a>
 */
Ext.define ("viewer.components.NgAttributeList",{
    extend: "viewer.components.Component",
    container: null,
    config: {
        layers:null,
        title: "",
        iconUrl:null,
        tooltip:null,
        label: "",
        defaultDownload: "Json",
        autoDownload: false,
        downloadParams: "",
        addZoomTo: false,
        pageSize: 100,
        zoomToBuffer: 10,
        showLayerSelectorTabs: false,
        showAttributelistLinkInFeatureInfo: false,
        requestThreshold: 2000,
        details: {
            minWidth: 600,
            minHeight: 300
        }
    },
    featureExtentService: null,
    map: null,
    markerId: "ng-attributelist-marker",
    constructor: function (conf){
        this.initConfig(conf);
		viewer.components.NgAttributeList.superclass.constructor.call(this, this.config);
        var me = this;
        this.renderButton({
            handler: function() {
                // var deferred = me.createDeferred();
                me.div.setAttribute("showwindow","");
                // return deferred.promise;
            },
            text: me.config.title,
            //text: "Angular AttributeList",
            //icon: "",
            tooltip: "Angular Attributen Lijst",
            //label: ""
            label: me.config.label
        });
        this.map = this.config.viewerController.mapComponent.getMap();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,
            this.initialize,this);
        return this;
    },
    // Voor het icon.
    getBaseClass : function() {
        return "viewercomponentsAttributeList";
    },
    initialize: function(){
        // Create form div.
        this.div = document.createElement("tailormap-attributelist-form");

        // Copy needed component config settings.
        var config = {};
        config.pageSize = this.config.pageSize;
        this.div.setAttribute("config", JSON.stringify(config));

        // Add event handler.
        this.div.addEventListener('pageChange', function(){
            console.log("pageChange");
            this.hideMarker()
        }.bind(this));

        // Add event handler.
        this.div.addEventListener('panelClose', function(){
            this.hideMarker()
        }.bind(this));

        // Add event handler.
        this.div.addEventListener('rowClick', function(evt){
            console.log("rowClick",evt);
            console.log("rowClick",evt.detail);
            this.showMarker(evt.detail.layerId, evt.detail.feature);
            //this.zoomToFeature(evt.detail.layerId, evt.detail.feature);
        }.bind(this));

        // Add event handler.
        this.div.addEventListener('tabChange', function(){
            this.hideMarker()
        }.bind(this));

        // Add to body.
        document.body.appendChild(this.div);
    },
    getExtComponents: function() {
        return [ this.container.getId() ];
    },
    showMarker: function(layerId,feature) {
        // Hide current marker.
        this.map.removeMarker(this.markerId);
        // Show new marker.
        if (this.featureExtentService === null) {
            this.featureExtentService = Ext.create('viewer.FeatureExtent');
        }
        var appLayer = this.config.viewerController.getAppLayerById(layerId);
        //var zoomToBuffer = this.config.zoomToBuffer;
        var zoomToBuffer = 0;
        this.featureExtentService.getExtentForFeatures(
            feature.__fid,
            appLayer,
            zoomToBuffer,
            (function (extent) {
                var x = extent.minx + (extent.maxx - extent.minx) / 2;
                var y = extent.miny + (extent.maxy - extent.miny) / 2;
                console.log([x,y]);
                this.map.setMarker(this.markerId, x, y, 'default');
            }).bind(this),
            function(msg) {
                console.log(msg);
            }
        );
    },
    hideMarker: function() {
        this.map.removeMarker(this.markerId);
    },
    zoomToFeature: function(layerId,feature) {
        if (this.featureExtentService === null) {
            this.featureExtentService = Ext.create('viewer.FeatureExtent');
        }
        var appLayer = this.config.viewerController.getAppLayerById(layerId);
        this.featureExtentService.getExtentForFeatures(
            feature.__fid,
            appLayer,
            this.config.zoomToBuffer,
            (function (extent) {
                var e = Ext.create("viewer.viewercontroller.controller.Extent",
                                   extent.minx, extent.miny, extent.maxx, extent.maxy);
                this.config.viewerController.mapComponent.getMap().zoomToExtent(e);
            }).bind(this),
           function(msg) {
                console.log(msg);
            }
        );
    }
});
