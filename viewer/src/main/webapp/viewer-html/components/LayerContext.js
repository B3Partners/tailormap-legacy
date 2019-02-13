/* 
 * Copyright (C) 2012 B3Partners B.V.
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
        name: i18next.t('viewer_components_layercontext_0'),
        title: "",
        titlebarIcon : "",
        tooltip: null,
        details: {
            minWidth: 400,
            minHeight: 250
        }
    },
    /**
     * @constructor
     * creating a layercontext module.
     */
    constructor: function (conf){
        conf.isPopup = true;
        this.initConfig(conf);
		viewer.components.LayerContext.superclass.constructor.call(this, this.config);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYER_CLICKED,this.layerClicked,this);
        
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this);
        
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING,function(){
            this.selectedContentChanged();
        },this);
        
        return this;
    },
    layerClicked: function(layerObj) {
        // Check if any data is present
        if(
            typeof layerObj.metadata !== 'undefined' ||
            typeof layerObj.download !== 'undefined' ||
            typeof layerObj.info !== 'undefined' ||
            typeof layerObj.url !== 'undefined' ||
            (
                typeof layerObj.appLayer !== 'undefined' &&
                typeof layerObj.appLayer.details !== 'undefined' &&
                (
                    typeof layerObj.appLayer.details.context !== 'undefined' ||
                    typeof layerObj.appLayer.details.metadataurl !== 'undefined'
                )
            )
        ) {
            this.renderWindow(layerObj);
        }
    },
    renderWindow: function(layerObj) {
        if(this.container === null) {
            this.htmlContainer = Ext.create('Ext.container.Container', {
                flex: 1,
                padding: '0 0 5 0',
                margin: '0 0 5 0',
                border: '0 0 1 0',
                style: {
                    borderColor: '#E0E0E0',
                    borderStyle: 'solid',
                    borderWidth: '0 0 1px 0'
                },
                layout: 'fit',
                autoScroll: true
            });
            this.linksContainer = Ext.create('Ext.container.Container', {
                height: 20,
                layout: 'hbox'
            });
            this.container = Ext.create('Ext.container.Container', {
                width: '100%',
                height: '100%',
                padding: 5,
                border: 0,
                renderTo: this.getContentDiv(),
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.htmlContainer,
                    this.linksContainer
                ]
            });
        }
        this.linksContainer.removeAll();
        this.htmlContainer.removeAll();
        if(typeof layerObj.metadata !== 'undefined' || typeof layerObj.url !== 'undefined' ) {
            var url =  typeof layerObj.url !== 'undefined' ? layerObj.url : layerObj.metadata;
            this.linksContainer.add({
                xtype: 'box',
                html: { tag: "a", target: "_blank", href: url, html: i18next.t('viewer_components_layercontext_1') },
                height: 20,
                width: 80
            });
        }
        if(typeof layerObj.download !== 'undefined') {
            this.linksContainer.add({
                xtype: 'box',
                html: { tag: "a", target: "_blank", href: layerObj.download, html: i18next.t('viewer_components_layercontext_2') },
                height: 20,
                width: 80
            });
        }
        if( typeof layerObj.appLayer !== 'undefined' &&
            typeof layerObj.appLayer.details !== 'undefined' &&
            typeof layerObj.appLayer.details.context !== 'undefined'
        ) {
            this.htmlContainer.add({
                xtype: 'container',
                autoScroll: true,
                html: layerObj.appLayer.details.context
            });
        }
        
        if(typeof layerObj.info !== 'undefined'){
             this.htmlContainer.add({
                xtype: 'container',
                autoScroll: true,
                html: layerObj.info
            });
        }
        var appLayerHasMetadaturl = ( typeof layerObj.appLayer !== 'undefined' &&
                (typeof layerObj.appLayer.details !== 'undefined' && typeof layerObj.appLayer.details.metadataurl !== 'undefined' ));
        
        if(appLayerHasMetadaturl || typeof layerObj.url !== 'undefined' && (typeof layerObj.info === 'undefined' || layerObj.info === '<br>' ) ){
            var url = appLayerHasMetadaturl ? layerObj.appLayer.details.metadataurl : layerObj.url;
            var browserPopupWindow = window.open(url, 'name', 'height='+this.config.details.height + ',width=' + this.config.details.width + ',location=no,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes');
            browserPopupWindow.focus();
        }else{
            if(!this.popup.popupWin.isVisible()) {
                this.popup.show();
            }
        }
    },
    selectedContentChanged: function(){
        var me = this;
        if (this.config.tooltip){
            var tocs= this.config.viewerController.getComponentsByClassName("viewer.components.TOC");
            this.config.viewerController.traverseSelectedContent(function(){}, function(layer) {
                var serviceLayer = me.config.viewerController.getServiceLayer(layer);
                if( (   serviceLayer && serviceLayer.details &&
                        (serviceLayer.details ["metadata.stylesheet"] || serviceLayer.details ["download.url"])) ||  
                    (   typeof layer.details !== 'undefined' &&
                        typeof layer.details.context !== 'undefined'
                    )
                ){
                    for (var i = 0; i < tocs.length; i++){
                        tocs[i].setLayerQtip(me.config.tooltip,layer.id);
                    }
                }
            });
        }
    },
    getExtComponents: function() {
        return [ (this.container !== null) ? this.container.getId() : '' ];
    }
});

