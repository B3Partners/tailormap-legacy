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
            position : 'center'
        }
    },
    component: null,
    currentOrientation: null,
    constructor: function (conf){
        var me = this;
        this.initConfig(conf);
        var config = {
            title: this.title || 'Titel',
            closable: true,
            closeAction: 'hide',
            hideMode: 'offsets',
            width: parseInt(this.details.width),
            height: parseInt(this.details.height),
            resizable: "true" == ""+this.details.changeableSize,
            draggable: "true" == ""+this.details.changeablePosition,
            layout: 'fit',
            modal: false,
            renderTo: Ext.getBody(),
            autoScroll: true
        };
        if(this.details.position == 'fixed' && !MobileManager.isMobile()) {
            var wrapper = Ext.get('wrapper');
            config.x = parseInt(this.details.x) + wrapper.getX();
            config.y = parseInt(this.details.y) + wrapper.getY();
        }

        if(MobileManager.isMobile()) {
            config.modal = true;
            config.width = '90%';
            config.height = '90%';
            config.draggable = false;
            config.resizable = false;
            this.currentOrientation = MobileManager.getOrientation();
        }

        if(this.details.items){
            config.items = this.details.items;
            config.bodyStyle= { background: '#fff'};
        }else{
            var con = document.createElement('div');
            con.style.height=  "100%";
            con.style["background"] = "#FFFFFF";
            con.style.width=  "100%";
            config.contentEl = con;
        }

        // If no config is present for 'showHelpButton' or 'showHelpButton' is "true" we will show the help button
        if(conf && (conf.hasOwnProperty('showHelpButton') && (conf.showHelpButton === "true" || conf.showHelpButton===true))) {
            config.tools = [{
                type:'help',
                handler: function(event, toolEl, panel){
                    conf.viewerController.showHelp(conf);
                }
            }];
        }

        this.popupWin = Ext.create('Ext.window.Window', config);
        if(this.showOnStartup){
            this.popupWin.show();
        }
        if(config.draggable){
            this.popupWin.addListener("dragstart",this.disableBody,this);
            this.popupWin.addListener("dragend",this.enableBody,this);
        }
        if(config.resizable){
            this.popupWin.resizer.addListener("beforeresize",this.disableBody,this);
            this.popupWin.resizer.addListener("resize",this.enableBody,this);
        }
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
                if(config.modal) MobileManager.closePopupOnTapMask(me.popupWin);
            }
        });
		if(MobileManager.isMobile() && MobileManager.hasHammer()) {
			// Hide the window on double tapping the header
			var hammer = new Hammer(document.getElementById(me.popupWin.header.id));
			hammer.ondoubletap = function(ev) {
				me.hide();
			};
		}
        return this;
    },
    setComponent: function(component) {
        this.component = component;
    },
    getContentId : function (){
        return this.popupWin.contentEl.id;
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
            this.popupWin.doLayout();
			// Set the current orientation so when closing and opening popup while maintaining orientation it is not resized again
			this.currentOrientation = MobileManager.getOrientation();
        }
    },
    setWindowTitle : function(title){
        this.popupWin.setTitle(title);
    }
});