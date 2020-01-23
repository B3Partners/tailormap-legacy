/* 
 * Copyright (C) 2013 B3Partners B.V.
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
 * A button which enables the user to download the current map (extent and layers) as an image.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.DownloadMap",{
    extend: "viewer.components.Print",
    config:{
        tooltip : null
    },
    iconUrl_up: null,
    iconUrl_over: null,
    button: null,
    lastImageUrl: "",
    constructor: function (conf){        
        this.hasButton = false;
        this.initConfig(conf);
        viewer.components.tools.DownloadMap.superclass.constructor.call(this, this.config);
        
        if(!this.hideOwnButton){
            if(this.isPopup){
                var me = this;
                this.renderButton({
                    text: me.title,
                    tooltip: me.config.tooltip,
                    label: me.label,
                    handler: function() {
                        me.buttonDown();
                    }
                });
            }else{
                this.button= this.config.viewerController.mapComponent.createTool({
                    type: viewer.viewercontroller.controller.Tool.BUTTON,
                    displayClass: this.viewerController.hasSvgSprite() ? "toolsdownloadmap" : "downloadMap",
                    tooltip: this.config.tooltip || null,
                    viewerController: this.config.viewerController
                });
                this.config.viewerController.mapComponent.addTool(this.button);
                this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN, this.buttonDown, this);
            }
        }
        return this;
    },
    /**
     * When the button is hit 
     */
    buttonDown: function () {
        var properties = this.getProperties();
        this.combineImageService.downloadImage(Ext.JSON.encode(properties), this.imageSuccess.bind(this), this.imageFailure);
    },
    /**
     * Download image with given filename.
     * @param {type} blob image
     * @param {type} filename name to save
     */
    imageSuccess: function (blob, filename) {
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    getProperties: function() {
        var properties = {};
        properties.appId = this.config.viewerController.app.id;
        var mapProperties = this.getMapValues();
        Ext.apply(properties, mapProperties);
        return properties;
    },
    /**
     * Called when the image download errors.
     * @param error the error message
     */
    imageFailure: function(error){
        Ext.Msg.alert('Error', error);
    }
});