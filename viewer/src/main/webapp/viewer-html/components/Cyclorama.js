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
 * Cyclorama component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Cyclorama",{
    extend: "viewer.components.Component",
    window:null,
    config:{
    },
    constructor: function (conf){
        viewer.components.Cyclorama.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        // Registreer voor layerinitialized
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, this.initComp, this);
        return this;
    },
    initComp : function(){
        console.log("layers initialized");
        var appLayer = this.viewerController.getAppLayerById(this.config.layers);
        var mapLayer = this.viewerController.getLayer(appLayer);
        mapLayer.addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO_DATA, this.onFeatureInfo,this);
    },
    onFeatureInfo: function (appLayer,event){
        if(appLayer.id === parseInt(this.config.layers) && event.features){
            if(event.features.length >1 ){
                this.showOptions(event.features);
            }else if(event.features.length === 1){
                this.openGlobespotter(event.features[0]);
            }
        }
    },
    showOptions : function(features){
        this.openGlobespotter(features[0]);
        // laat meerdere opties zien
        // klik is open globespotter
    },

              /*  <!-- Test API: https://www.globespotter.nl/api/test/viewer_bapi.swf -->
                <!-- 2.1 API: https://www.globespotter.nl/v2/api/bapi/viewer_bapi.swf -->
                <!-- 2.6 API: https://globespotter.cyclomedia.com/v26/api/viewer_api.swf -->
*/
    openGlobespotter : function(feature){
        var params = {
            imageId: feature[this.config.imageIdAttribute] ,
            appId: appId,
            accountId: this.config.keyCombo
        };
        Ext.Ajax.request({
            url: actionBeans["cyclorama"],
            params: params,
            scope: this,
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);
                var a = 0;
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
                            ' <embed src="https://www.globespotter.nl/v2/api/bapi/viewer_bapi.swf"' +
                                ' quality="high" bgcolor="#888888"' +
                                ' width="' + (width - 10) + '" height="' + (height - 10)+
                                ' type="application/x-shockwave-flash"' +
                                ' allowScriptAccess="always"' +
                                ' allowfullscreen="true"' +
                                ' FlashVars="&APIKey=' + response.apiKey + '&imageid=' + response.imageId + '&MapSRSName=EPSG:28992&TID=' + response.tid + '">' +
                            ' </embed>' +
                        ' </object>' +
                    '</div>'
        }).show();
    }
});