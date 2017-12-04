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
 * ScreenPopup
 * A generic component to which can render itself
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

Ext.define ("viewer.components.SvgHeader", {
    extend: "Ext.panel.Header",
    xtype: 'svgpanelheader',
    constructor: function (conf) {
        conf.iconCls = 'svg-icon-header';
        viewer.components.SvgHeader.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.addListener('afterrender', function(cmp, eOpts) {
            var icon = cmp.el.dom.querySelector('.svg-icon-header');
            icon.innerHTML = conf.svgIcon;
        });
    }
});

Ext.define ("viewer.components.ScreenPopup",{
    extend: "Ext.util.Observable",
    popupWin:null,
    config:{
        title: "",
        showOnStartup: null,
        details:{
            x: 100,
            y: 100,
            width : 400,
            height: 600,
            minWidth: null,
            minHeight: null,
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
        viewer.components.ScreenPopup.superclass.constructor.call(this, conf);
        this.initConfig(conf);

        var config = {
            title: this.config.title || 'Titel',
            closable: true,
            closeAction: 'hide',
            hideMode: 'offsets',
            width: ("" + this.config.details.width).indexOf('%') !== -1 ? this.config.details.width : parseInt(this.config.details.width),
            height: ("" + this.config.details.height).indexOf('%') !== -1 ? this.config.details.height : parseInt(this.config.details.height),
            resizable: this.parseBooleanValue(this.config.details.changeableSize),
            draggable: this.parseBooleanValue(this.config.details.changeablePosition),
            layout: 'fit',
            modal: false,
            renderTo: Ext.getBody(),
            scrollable: true,
            constrainHeader: true,
            iconCls: this.config.iconCls || "",
            bodyStyle: {},
            cls: "screen-popup"
        };
        
        if(this.config.popupIcon) {
            config.header = {
                xtype: 'svgpanelheader',
                svgIcon: this.config.popupIcon
            };
        }

        var isMobile = viewer.components.MobileManager.isMobile();
        if(isMobile) {
            config.modal = true;
            config.width = '100%';
            config.height = '100%';
            config.draggable = false;
            config.resizable = false;
            if(this.config.details.minWidth) {
                config.bodyStyle.minWidth = this.config.details.minWidth + "px";
            }
            if(this.config.details.minHeight) {
                config.bodyStyle.minHeight = this.config.details.minHeight + "px";
            }
            this.currentOrientation = viewer.components.MobileManager.getOrientation();
        }

        if(this.config.details.minWidth && !isMobile) {
            config.minWidth = this.config.details.minWidth;
            if(!conf.details.width) {
                config.width = this.config.details.minWidth;
            }
        }
        if(this.config.details.minHeight && !isMobile) {
            config.minHeight = this.config.details.minHeight;
            if(!conf.details.height) {
                config.height = this.config.details.minHeight;
            }
        }

        if(this.config.details && this.config.details.items){
            config.items = this.config.details.items;
            config.bodyStyle.background = '#fff';
        }else if(this.config.details && this.config.details.useExtLayout) {
            config.bodyStyle.background = '#fff';
        } else {
            var con = document.createElement('div');
            con.style.height = "100%";
            con.style.position = "absolute";
            con.style["background"] = "#FFFFFF";
            con.style.width=  "100%";
            config.contentEl = con;
        }

        // Only if 'showHelpButton' configuration is present and not set to "false" we will show the help button
        if(this.config && this.config.hasOwnProperty('showHelpButton') && this.config.showHelpButton !== "false" && this.config.showHelpButton !== false) {
            config.tools = [{
                type: 'help',
                tooltip: 'Help',
                margin: '0 28 0 0',
                handler: function(event, toolEl, panel){
                    conf.viewerController.showHelp(conf);
                }
            }];
        }
        if(config.resizable) {
            config.resizable = {
                listeners: {
                    'beforeresize': {
                        fn: function() {
                            this.disableBody();
                        },
                        scope: this
                    },
                    'resize': {
                        fn: function() {
                            this.enableBody();
                        },
                        scope: this
                    }
                }
            };
        }

        this.popupWin = Ext.create('Ext.window.Window', config);
        if(this.config.showOnStartup){
            this.popupWin.show();
        }

        var positionChanged = false;
        if(config.draggable){
            this.popupWin.addListener("dragstart", function() {
                this.disableBody();
            }, this);
            this.popupWin.addListener("dragend", function() {
                this.enableBody();
                positionChanged = true;
            }, this);
        }
        this.popupWin.addListener('hide', function() {
            if(this.component) {
                this.component.setButtonState('normal', true);
            }
            this.enableBody();
            this.fireEvent("hide",this);
        }, this);
        this.popupWin.addListener('show', function() {
            if (conf.viewerController) {
                conf.viewerController.registerPopupShow(this.popupWin);
            }
            if(this.component) {
                this.component.setButtonState('click', true);
            }
            if(viewer.components.MobileManager.isMobile()) {
                if(viewer.components.MobileManager.getOrientation() !== this.currentOrientation) {
                    this.currentOrientation = viewer.components.MobileManager.getOrientation();
                    setTimeout(function() { this.component.resizeScreenComponent() }, 0);
                }
            } else if(this.config.details.position === 'fixed' && !positionChanged) {
                // Align popupWindow
                var pos = [parseInt(this.config.details.x), parseInt(this.config.details.y)];
                var alignment = 'tl';
                if(this.config.details.alignposition) {
                    alignment = this.config.details.alignposition;
                }
                if(alignment.substr(0, 1) === 'b') {
                    pos[1] = pos[1] * -1;
                }
                if(alignment.substr(1) === 'r') {
                    pos[0] = pos[0] * -1;
                }
                this.popupWin.alignTo(Ext.get('wrapper'), [alignment, alignment].join('-'), pos);
            }
        }, this);

        // IOS fix, see http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        // This is especially an issue when loading Flamingo in an iframe
        this.popupWin.getEl().dom.addEventListener('touchstart', function(){});

        return this;
    },
    parseBooleanValue: function(val) {
        if (val === true || val === false) {
            return val;
        }
        return ("true" === val);
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
    show : function() {
        this.popupWin.show();
        this.popupWin.zIndexManager.bringToFront(this.popupWin);
    },
    hide : function(){
        this.popupWin.hide();
    },
    disableBody : function (){
        var mask = Ext.getBody().mask();
        mask.on('click', this.enableBody, this);
        mask.setZIndex(this.popupWin.getEl().getZIndex() - 1);
    },
    enableBody : function(){
        Ext.getBody().unmask();
    },
    setIconClass: function(iconCls) {
        this.popupWin.setIconCls(iconCls);
    },
    isVisible: function() {
        return this.popupWin.isVisible();
    },
    resizePopup: function() {
        if(viewer.components.MobileManager.isMobile() && this.isVisible()) {
            // Set size in pixels to 100% of the viewportwidth / height
            this.popupWin.setSize(Ext.Element.getViewportWidth(), Ext.Element.getViewportHeight());
            // Reset position so popup remains centered
            this.popupWin.setPosition(0, 0);
            // doLayout on the window
            this.popupWin.updateLayout();
            // Set the current orientation so when closing and opening popup while maintaining orientation it is not resized again
            this.currentOrientation = viewer.components.MobileManager.getOrientation();
        }
    },
    setWindowTitle : function(title){
        this.popupWin.setTitle(title);
    }
});
