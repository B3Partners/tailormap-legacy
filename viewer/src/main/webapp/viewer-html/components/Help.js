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
Ext.define ("viewer.components.Help",{
    extend: "viewer.components.Component",
    container: null,
    showAsPopup: false,
    config:{
        name: ___("Help"),
        title: i18next.t('viewer_components_help_0'),
        titlebarIcon : "",
        defaultText: "",
        details: {
            minWidth: 400,
            minHeight: 250,
            useExtLayout: true
        }
    },
    /**
     * @constructor
     * creating a layercontext module.
     */
    constructor: function (conf){
        if(conf.regionName === 'content') {
            conf.isPopup = true;
            this.showAsPopup = true;
            //never show helpbutton for help window
            conf.showHelpButton=false;
        }
        this.initConfig(conf);
		viewer.components.Help.superclass.constructor.call(this, this.config);
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_HELP, this.showHelp, this);
        this.renderWindow(null);
        return this;
    },
    showHelp: function(componentConfig) {
        this.renderWindow(componentConfig);
        if(this.popup && this.popup.popupWin) {
            if(!this.popup.popupWin.isVisible()) {
                this.popup.show();
            }
        }
    },
    renderWindow: function(componentConfig) {
        if(this.container === null) {
            var config = {
                padding: 0,
                border: 0,
                autoScroll: true
            };
            if(!this.showAsPopup) {
                config.title = this.config.title;
            }
            this.container = Ext.create(this.showAsPopup ? 'Ext.container.Container' : 'Ext.panel.Panel', config);
            this.getContentContainer().add(this.container);
        }
        this.container.removeAll();
        if( componentConfig !== null && typeof componentConfig.helpUrl !== 'undefined') {
            this.container.add({
                xtype: 'box',
                autoEl: {
                    tag: 'iframe',
                    src: componentConfig.helpUrl,
                    frameBorder: 0,
                    style: 'border: 0 none;'
                }
            });
        } else if( componentConfig !== null && typeof componentConfig.helpText !== 'undefined') {
            this.container.add({
                xtype: 'box',
                margin: 5,
                html: componentConfig.helpText
            });
        } else {
            this.container.add({
                xtype: 'box',
                margin: 5,
                html: this.config.defaultText
            });
        }
        //if popup: hide scrollbars when external url, if no url: autoScroll
        if (this.popup && this.popup.popupWin){    
            if( componentConfig !== null && typeof componentConfig.helpUrl !== 'undefined') {            
                this.popup.popupWin.setAutoScroll(false);
            }else{
                this.popup.popupWin.setAutoScroll(false);
            }
        }
    },
    getExtComponents: function() {
        return [ (this.container !== null) ? this.container.getId() : '' ];
    }
});

