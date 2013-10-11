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
 * LayerContext component
 * Creates a LayerContext component
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.LayerContext",{
    extend: "viewer.components.Component",
    container: null,
    htmlContainer: null,
    linksContainer: null,
    config:{
        name: "Informatie kaartlaag",
        title: "",
        titlebarIcon : ""
    },
    /**
     * @constructor
     * creating a layercontext module.
     */
    constructor: function (conf){
        conf.isPopup = true;
        viewer.components.LayerContext.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_CLICKED,this.layerClicked,this);
        return this;
    },
    layerClicked: function(layerObj) {
        // Check if any data is present
        if(
            typeof layerObj.metadata !== 'undefined' ||
            typeof layerObj.download !== 'undefined' ||
            (   typeof layerObj.appLayer !== 'undefined' &&
                typeof layerObj.appLayer.details !== 'undefined' &&
                typeof layerObj.appLayer.details.context !== 'undefined'
            )
        ) {
            this.renderWindow(layerObj);
        }
    },
    renderWindow: function(layerObj) {
        if(this.container === null) {
            this.htmlContainer = Ext.create('Ext.container.Container', {
                width: '100%',
                flex: 1,
                padding: '0 0 5 0',
                margin: '0 0 5 0',
                border: '0 0 1 0',
                style: {
                    borderColor: '#E0E0E0',
                    borderStyle: 'solid',
                    borderWidth: '0 0 1px 0'
                }
            });
            this.linksContainer = Ext.create('Ext.container.Container', {
                width: '100%',
                height: 20,
                layout: 'hbox'
            });
            this.container = Ext.create('Ext.container.Container', {
                width: '100%',
                height: '100%',
                padding: 5,
                border: 0,
                renderTo: this.getContentDiv(),
                layout: 'vbox',
                items: [
                    this.htmlContainer,
                    this.linksContainer
                ]
            });
        }
        this.linksContainer.removeAll();
        this.htmlContainer.removeAll();
        if(typeof layerObj.metadata !== 'undefined') {
            this.linksContainer.add({
                xtype: 'box',
                html: '<a target="_BLANK" href="' + layerObj.metadata + '">Metadata</a>',
                height: 20,
                width: 80
            });
        }
        if(typeof layerObj.download !== 'undefined') {
            this.linksContainer.add({
                xtype: 'box',
                html: '<a target="_BLANK" href="' + layerObj.download + '">Downloadlink</a>',
                height: 20,
                width: 80
            });
        }
        if( typeof layerObj.appLayer !== 'undefined' &&
            typeof layerObj.appLayer.details !== 'undefined' &&
            typeof layerObj.appLayer.details.context !== 'undefined'
        ) {
            this.htmlContainer.add({
                xtype: 'box',
                html: layerObj.appLayer.details.context,
                height: '100%',
                width: '100%'
            });
        }
        if(!this.popup.popupWin.isVisible()) {
            this.popup.show();
        }
    },
    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
    /*
     * 
        console.log(node);
        if(node.layerObj.metadata!= undefined || node.layerObj.download!= undefined ){
            var config = {
                details:{
                    width : 700,
                    height: 500
                },
                title: "Metadata"
            };

            if(this.popup != null){
                this.popup.hide();
            }

            var html = "";
            if(node.layerObj.metadata != undefined){
                html += "<a target='_BLANK' href='" +node.layerObj.metadata + "'>Metadata</a>";
            }
            if(node.layerObj.download != undefined){
                if(html != ""){
                    html += "<br/>";
                }
                html += "<a target='_BLANK' href='" +node.layerObj.download+ "'>Downloadlink</a>";
            }
            this.popup = Ext.create("viewer.components.ScreenPopup",config);
            var panelConfig={
                renderTo : this.popup.getContentId(),
                frame: false,
                html: html
            };
            Ext.create ("Ext.panel.Panel",panelConfig);
            this.popup.show();
        }
     */
});

