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
                    displayClass: "downloadMap",
                    tooltip: this.config.tooltip || null,
                    viewerController: this.config.viewerController
                });
                this.config.viewerController.mapComponent.addTool(this.button);

                this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,this.buttonDown, this);
            }
        }
        return this;
    },
    /**
     * When the button is hit 
     * @param button the button
     * @param object the options.        
     */
    buttonDown : function(button,object){        
        var properties = this.getProperties();
        this.combineImageService.getImageUrl(Ext.JSON.encode(properties),this.imageSuccess.bind(this),this.imageFailure);
    },
    imageSuccess: function(imageUrl){        
        if(Ext.isEmpty(imageUrl) || !Ext.isDefined(imageUrl)) imageUrl = null;
        if(imageUrl === null) document.getElementById('previewImg').innerHTML = 'Afbeelding laden mislukt';
        else {
            this.lastImageUrl = imageUrl;
            var result = window.open(imageUrl, '_blank');
            if(!result) {
                // Popup is probably blocked, show message box to show URL and button to open image
                this.showDownloadWindow();
            }
        }
    },
    showDownloadWindow: function() {
        var imageUrl = this.lastImageUrl;
        Ext.Msg.show({
            title: i18next.t('viewer_components_tools_downloadmap_0'),
            message: [
                'De afbeelding van de kaart is beschikbaar via',
                '<br /><br />',
                '<input type="text" value="', imageUrl, '" style="width: 100%;" class="ext-style" />',
                '<br /><br />',
                'Klik op "Openen" om de afbeelding in een nieuw venster te openen'
            ].join(''),
            buttonText: { ok: "Openen", cancel: "Sluiten" },
            icon: Ext.Msg.INFO,
            fn: function(btn) {
                if (btn === 'ok') {
                    window.open(imageUrl, '_blank');
                }
            }
        });

    },
    getProperties: function() {
        var properties = {};
        /*properties.angle = this.rotateSlider.getValue();
        properties.quality = this.qualitySlider.getValue();*/
        properties.appId = this.config.viewerController.app.id;
        var mapProperties = this.getMapValues();
        Ext.apply(properties, mapProperties);
        return properties;
    },
    /**
     *Called when the imageUrl is unsuccesfully returned
     *@param error the error message
     */
    imageFailure: function(error){
        console.log(error);
    }
});