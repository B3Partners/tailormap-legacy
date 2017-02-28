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
/* global Ext */

/**
 * Cyclorama component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Cyclorama",{
    extend: "viewer.components.tools.Tool",
    toolMapClick:null,
    deActivatedTools:null,
    window:null,
    optionWindow:null,
    imageIdName:null,
    isDirect:null,
    config:{
    },
    constructor: function (conf){
        this.initConfig(conf);
	viewer.components.Cyclorama.superclass.constructor.call(this, this.config);
        
        
        this.button = this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_TOOL,
            id: this.getName(),
            name: this.getName(),
            tooltip: this.config.tooltip || null,
            displayClass: !!this.config.iconUrl ? "Cyclorama-" + Ext.id() : "streetView",
            //displayClass: !!this.config.iconUrl ? "Cyclorama-" + Ext.id() : "Cyclorama",
            viewerController: this.config.viewerController,
            iconUrl: this.config.iconUrl || null
        });
        
        this.config.viewerController.mapComponent.addTool(this.button);
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN, this.buttonDown, this);
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP, this.buttonUp, this);
        // Registreer voor layerinitialized
        
        // Registreer voor layerinitialized
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initComp, this);
       
        return this;
    },
    initComp : function() {
        if(!this.config.layers) {
            return;
        }
        this.toolMapClick =  this.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name + "toolMapClick",
            handler:{
                fn: this.mapClicked,
                scope:this
            },
            viewerController: this.config.viewerController
        });
        if (this.config.layers === "-666") { // Gebruik van directe cyclomediaservice
            this.imageIdName = "imageId";
            this.isDirect = true;
        } else {
            this.isDirect = false;
            var appLayer = this.viewerController.getAppLayerById(this.config.layers);
            var attributes;
            if (appLayer) {
                attributes = appLayer.attributes;
            }
            var me = this;
            function processAttributes(attributes) {
                for (var i = 0; i < attributes.length; i++) {
                    if (attributes[i].id === me.config.imageIdAttribute) {
                        me.imageIdName = attributes[i].name;
                        break;
                    }
                }
            }
            if (!attributes) {
                this.viewerController.app.appLayers[this.config.layers].featureService.loadAttributes(appLayer, processAttributes);
            } else {
                processAttributes(appLayer.attributes);
            }
        }
    },
    processResponse: function (response){
        if(response.features.length >1 ){
            this.showOptions(response.features);
        }else if(response.features.length === 1){
            this.openGlobespotter(response.features[0]);
        }
    },
    showOptions : function(features){
        var store = Ext.create('Ext.data.Store', {
            fields:[this.imageIdName],
            data:{'items':features},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    rootProperty: 'items'
                }
            }
        });

        var grid = Ext.create('Ext.grid.Panel', {
            store: store,
            columns: [
                { header: 'Image id',  dataIndex: this.imageIdName,flex:1 }
            ],
            listeners:{
                itemdblclick:{
                    scope:this,
                    fn:function(grid,item){
                        this.openGlobespotter(item.data);
                    }
                }
            }
        });

        if(this.optionWindow){
            this.optionWindow.destroy();
        }
        this.optionWindow = Ext.create('Ext.window.Window', {
            title: "Maak een keuze uit de verschillende foto's",
            height: 200,
            width: 400,
            layout: 'fit',
            items: grid
        }).show();
    },
    openGlobespotter : function(feature){
        var params = {
            imageId: feature[this.imageIdName],
            appId: appId,
            accountId: this.config.keyCombo
        };
        Ext.Ajax.request({
            url: actionBeans["cyclorama"],
            params: params,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                this.linkReceived(response);
            },
            failure: function(result) {
               this.viewerController.logger.error(result);
            }
        });

    },
    linkReceived: function(response){
         // Get link from backend
        var width = parseInt(this.config.width);
        var height = parseInt(this.config.height);
        if(this.window){
            this.window.destroy();
        }
        this.window = Ext.create('Ext.window.Window', {
            title: "Cyclorama rondkijk foto's",
            height: height,
            resizable: false,
            width: width,
            layout: 'fit',
            html:
                ' <div>' +
                    ' <object id="Globespotter" name="TID">' +
                        ' <param name="allowScriptAccess" value="always" />' +
                        ' <param name="allowFullScreen" value="true" />' +
                    '<embed src="https://globespotter.cyclomedia.com/v2/api/bapi/viewer_bapi.swf"' +
                            ' quality="high" bgcolor="#888888"' +
                            ' width="' + (width - 12) + '" height="' + (height - 33)+
                            ' type="application/x-shockwave-flash"' +
                            ' allowScriptAccess="always"' +
                            ' allowfullscreen="true"' +
                            ' FlashVars="&APIKey=' + response.apiKey + '&imageid=' + response.imageId + '&MapSRSName=EPSG:28992&TID=' + response.tid + '">' +
                        ' </embed>' +
                    ' </object>' +
                '</div>'
        }).show();
    },
    mapClicked: function (tool, event) {
        var me = this;
        var coords = event.coord;
        var x = coords.x;
        var y = coords.y;
        var radius=4*Math.ceil(this.config.viewerController.mapComponent.getMap().getResolution());
        
        if(this.isDirect){
            var params = {
                directRequest: true,
                x: parseInt(x),
                y: parseInt(y),
                offset: radius,
                appId: appId,
                accountId: this.config.keyCombo
            };

            var width = parseInt(this.config.width);
            var height = parseInt(this.config.height);
            var href = actionBeans["cyclorama"] + "?"+ Ext.urlEncode(params);
            window.open(href, "cyclorama", 'width=' + width + ',height='+ height+',scrollbars=yes'); 
        }else{

            var appLayer = this.viewerController.getAppLayerById(this.config.layers);
            var attributes = [];
            attributes.push(this.config.imageIdAttribute);
            attributes.push(this.config.imageDescriptionAttribute);

            var extraParams = {
                attributesToInclude: attributes,
                graph: true
            };
            this.viewerController.mapComponent.getMap().setMarker("edit", x, y);
            var featureInfo = Ext.create("viewer.FeatureInfo", {
                viewerController: me.viewerController
            });
            featureInfo.layersFeatureInfo(x, y, radius, [appLayer], extraParams,function(response){
                for ( var i = 0 ; i < response.length; i++){
                    var resp = response[i];
                    if(parseInt( resp.request.appLayer) === parseInt(me.config.layers)){
                        me.processResponse(resp, resp.request.appLayer);
                    }
                }

            }, function(error){
                   this.viewerController.logger.error(error);
            },me);
        }
    },
        /**
     *The next functions will synchronize the button and the tool.
     */
    /**
     * When the button is hit and toggled true
     * @param button the button
     * @param object the options.        
     */
    buttonDown: function (button, object) {
        this.toolMapClick.activateTool();

        this.config.viewerController.mapComponent.setCursor(true, "crosshair");
    },
    /**
     * When the button is hit and toggled false
     */
    buttonUp: function (button, object) {
        this.config.viewerController.mapComponent.setCursor(false);
        if (this.config.useMarker) {
            this.config.viewerController.mapComponent.getMap().removeMarker(this.markerName);
        }
        this.toolMapClick.deactivateTool();
    }

});
