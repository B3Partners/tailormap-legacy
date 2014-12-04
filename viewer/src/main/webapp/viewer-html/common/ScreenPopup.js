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
 * ScreenPopup
 * A generic component to which can render itself
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.ScreenPopup",{
    popupWin:null,
    config:{
        title: "",
        showOnStartup: null,
        details:{
            x: 100,
            y: 100,
            width : 400,
            height: 600,
            changeablePosition:true,
            changeableSize:true,
            items:null,
            position : 'center',
            useExtLayout: false
        }
    },
    component: null,
    currentOrientation: null,
    constructor: function (conf){
        var me = this;
        this.initConfig(conf);
        var config = {
            title: this.config.title || 'Titel',
            closable: true,
            closeAction: 'hide',
            hideMode: 'offsets',
            width: ("" + this.config.details.width).indexOf('%') !== -1 ? this.config.details.width : parseInt(this.config.details.width),
            height: ("" + this.config.details.height).indexOf('%') !== -1 ? this.config.details.height : parseInt(this.config.details.height),
            resizable: "true" == ""+this.config.details.changeableSize,
            draggable: "true" == ""+this.config.details.changeablePosition,
            layout: 'fit',
            modal: false,
            renderTo: Ext.getBody(),
            autoScroll: true
        };
        if(this.config.details.position == 'fixed' && !MobileManager.isMobile()) {
            var wrapper = Ext.get('wrapper');
            config.x = parseInt(this.config.details.x) + wrapper.getX();
            config.y = parseInt(this.config.details.y) + wrapper.getY();
        }
        
        if(MobileManager.isMobile()) {
            config.modal = true;
            config.width = '90%';
            config.height = '90%';
            config.draggable = false;
            config.resizable = false;
            this.currentOrientation = MobileManager.getOrientation();
        }
		
        if(this.config.details && this.config.details.items){
            config.items = this.config.details.items;
            config.bodyStyle= { background: '#fff'};
        }else if(this.config.details && this.config.details.useExtLayout) {
            config.bodyStyle= { background: '#fff'};
        } else {
            var con = document.createElement('div');
            con.style.height=  "100%";
            con.style["background"] = "#FFFFFF";
            con.style.width=  "100%";
            config.contentEl = con;
        }
        
        // Only if 'showHelpButton' configuration is present and not set to "false" we will show the help button
        if(this.config && this.config.hasOwnProperty('showHelpButton') && this.config.showHelpButton !== "false") {
            config.tools = [{
                type:'help',
                handler: function(event, toolEl, panel){
                    conf.viewerController.showHelp(conf);
                }
            }];
        }
        if(config.resizable) {
            config.resizable = {
                listeners: {
                    'beforeresize': function() {
                        me.disableBody();
                    },
                    'resize': function() {
                        me.enableBody();
                    }
                }
            };
        }
        this.popupWin = Ext.create('Ext.window.Window', config);
        if(this.config.showOnStartup){
            this.popupWin.show();
        }
        if(config.draggable){
            this.popupWin.addListener("dragstart",this.disableBody,this);
            this.popupWin.addListener("dragend",this.enableBody,this);
        }
        /*if(config.resizable){
            this.popupWin.resizer.addListener("beforeresize",this.disableBody,this);
            this.popupWin.resizer.addListener("resize",this.enableBody,this);
        }*/
        this.popupWin.addListener('hide', function() {
            if(me.component) {
                me.component.setButtonState('normal', true);
            }
            me.enableBody();
        });
        this.popupWin.addListener('show', function() {
            if(me.component) {
                me.component.setButtonState('click', true);
            }
            if(MobileManager.isMobile()) {
                if(MobileManager.getOrientation() !== me.currentOrientation) {
                    me.currentOrientation = MobileManager.getOrientation();
                    setTimeout(function() { me.component.resizeScreenComponent() }, 0);
                }
                me.popupWin.mon(Ext.getBody(), 'click', function(el, e){
                    me.popupWin.close();
                }, me, { delegate: '.x-mask' });
            }
        });
        return this;
    },
    setComponent: function(component) {
        this.component = component;
    },
    getContentId : function (){
        return this.popupWin.contentEl.id;
    },
    getContentContainer: function() {
        return this.popupWin;
    },
    show : function(){
        this.popupWin.show();
    },
    hide : function(){
        this.popupWin.hide();
    },
    disableBody : function (){
        Ext.getBody().mask();
    },
    enableBody : function(){
        Ext.getBody().unmask()
    },
    setIconClass: function(iconCls) {
        this.popupWin.setIconCls(iconCls);
    },
    isVisible: function() {
        return this.popupWin.isVisible();
    },
    resizePopup: function() {
        if(MobileManager.isMobile() && this.isVisible()) {
    		// Set size in pixels to 90%/90% of the viewportwidth / height
    		this.popupWin.setSize(Ext.Element.getViewportWidth() * .9, Ext.Element.getViewportHeight() * .9);
			// Reset position so popup remains centered
			this.popupWin.setPosition(Ext.Element.getViewportWidth() * .05, Ext.Element.getViewportHeight() * .05);
    		// doLayout on the window
            this.popupWin.updateLayout();
			// Set the current orientation so when closing and opening popup while maintaining orientation it is not resized again
			this.currentOrientation = MobileManager.getOrientation();
        }
    },
    setWindowTitle : function(title){
        this.popupWin.setTitle(title);
    }
});