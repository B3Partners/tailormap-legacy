/**
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
/**
 * Abstract component
 * For using a popup, set this.isPopup = true.
 * For rendering to the popup, use the this.popup.getContentId() function
 * The icon can be rendered to this.getDiv()
 *
 */
Ext.define("viewer.components.Component",{
    extend: "Ext.util.Observable",
    events: null,
    popup: null,
    config: {
        name: "naam",
        div: new Object(),
        viewerController: null,
        isPopup : false,
        hasSharedPopup:false,
        regionName: ""
    },
    defaultButtonWidth: 46,
    defaultButtonHeight: 46,
    forceState: false,
    /**
    * @constructs
    * @param config.name {String} the unique name of the object
    * @param config.div {DomElement} the div where the component must be placed
    * @param config.viewerController {ViewerController} a reference to the ViewerController
    * @param config.isPopup {Boolean} Indicates whether or not to render this component to a popup
    */
    constructor: function(config){
        var me = this;
        me.initConfig(config);
        me.createIconStylesheet();
        if(me.isPopup){
            me.popup = Ext.create("viewer.components.ScreenPopup",config);
            me.popup.setComponent(me);
            me.popup.popupWin.addListener("resize", function() {
                me.doResize();
            });
            me.popup.setIconClass(me.getPopupIcon());
        }
        if(me.name && me.title) {
            me.viewerController.layoutManager.setTabTitle(me.name, me.title);
        }
        me.events = [];
        return me;
    },
    /**
      *Returns the id of the content div.
     */
    getContentDiv : function (){
        if(this.isPopup){
            return this.popup.getContentId();
        }else{
            return this.div;
        }
    },
    /**
     * Renders a button in the div (holder)
     * if a titlebarIcon is set, its used to generate in the button. Otherwise the title or name.
     * @param options.handler the handler function called when the button is clicked.
     * @param options.text the text in the button
     * @param options.icon the url to a  icon for this button.
     * @param options.tooltip the tooltip for this button.
     */
    renderButton: function(options) {
        var me = this,
            appSprite = me.viewerController.getApplicationSprite(),
            buttonIcon = null,
            buttonText = "",
            buttonCls = '',
            buttonWidth = me.defaultButtonWidth,
            baseClass = this.getBaseClass(),
            useSprite = false;

        me.options = options;
        if(options.icon) {
            buttonIcon = options.icon;
        } else if(appSprite != null) {
            buttonCls = 'applicationSpriteClass buttonDefaultClass_normal ' + baseClass + '_normal';
            useSprite = true;
        } else {
            buttonText = (options.text || (me.name || ""));
            buttonWidth = 'autoWidth';
        }

        me.button = Ext.create('Ext.button.Button', {
            text: buttonText,
            cls: buttonCls,
            renderTo: me.div,
            scale: "large",
            icon: buttonIcon,
            tooltip: options.tooltip || null,
            handler: function() {
                if(me.popup && me.popup.isVisible()) {
                    me.popup.hide();
                } else {
                    options.handler();
                }
            },
            width: buttonWidth,
            height: me.defaultButtonHeight,
            enableToggle: true,
            style: {
                height: me.defaultButtonHeight + 'px'
            },
            listeners: {
                click: function(button) {
                    me.setButtonState('click');
                },
                mouseover: function(button) {
                    me.setButtonState('hover');
                },
                mouseout: function(button) {
                    me.setButtonState('normal');
                }
            }
        });
    },
    
    setButtonState: function(state, forceState) {
        var me = this,
            appSprite = me.viewerController.getApplicationSprite(),
            button = me.button,
            baseClass = this.getBaseClass();
        
        if (!me.options || !me.button){
            return;
        }
        if(!me.options.icon && appSprite != null && (!me.forceState || forceState)) {
            if(state == 'hover') {
                button.removeCls(baseClass + '_normal');
                button.removeCls(baseClass + '_click');
                button.removeCls('buttonDefaultClass_click');
                button.removeCls('buttonDefaultClass_normal');
                button.addCls('buttonDefaultClass_hover');
                button.addCls(baseClass + '_hover');
            }
            else if(state == 'click') {
                button.removeCls(baseClass + '_normal');
                button.removeCls(baseClass + '_hover');
                button.removeCls('buttonDefaultClass_normal');
                button.removeCls('buttonDefaultClass_hover');
                button.addCls('buttonDefaultClass_click');
                button.addCls(baseClass + '_click');
            }
            else {
                button.removeCls(baseClass + '_click');
                button.removeCls(baseClass + '_hover');
                button.removeCls('buttonDefaultClass_click');
                button.removeCls('buttonDefaultClass_hover');
                button.addCls('buttonDefaultClass_normal');
                button.addCls(baseClass + '_normal');
            }
        }
        if(state == 'click' && (!me.forceState || forceState) && !button.pressed) {
            button.toggle();
        } else if((!me.forceState || forceState) && button.pressed) {
            button.toggle();
        }
        
        // If state is forced previously (me.forceState = true) than disable me.forceState again,
        // else set me.forceState = true so hovers etc. won't change the state
        if(forceState && me.forceState) me.forceState = false;
        else if(forceState && !me.forceState) me.forceState = forceState;
    },
    
    getBaseClass: function() {
        return this.$className.replace(/\./g, '');
    },
    
    getPopupIcon: function() {
        var baseClassName = this.getBaseClass();
        if(this.config.titlebarIcon) {
            // We need to give a CSS class, so if in image is set, we are creating a new stylesheet... Improve??
            var className = baseClassName + '_popupicon';
            Ext.util.CSS.createStyleSheet('.' + className + ' { background-image: url(\'' + this.config.titlebarIcon + '\') !important; }', baseClassName + 'iconStyle');
            return className;
        }
        return 'applicationSpriteClassPopup ' + baseClassName + '_popup';
    },

    createIconStylesheet: function() {
        // Creation of the icons stylesheet with all info regarding the sprite
        var me = this,
            appSprite = me.viewerController.getApplicationSprite();

        if(appSprite !== null && !document.getElementById('appSpriteStyle')) {
            var spriteConfig = {
                gridSize: 55,
                imageSize: 44,
                popupImageSize: 16, // Popups render 16x16 icons
                columnConfig: {
                    normal: 3,
                    hover: 2,
                    click: 1
                },
                rowConfig: {
                    'viewercomponentsSelectionModule': 2,
                    'viewercomponentsLegend': 3,
                    'viewercomponentsBuffer': 4,
                    'viewercomponentsDataSelection': 5,
                    'viewercomponentsSearch': 6,
                    'viewercomponentsEdit': 7,
                    'viewercomponentsDrawing': 8,
                    'viewercomponentsBookmark': 9,
                    'viewercomponentsTransparencySlider': 10,
                    'viewercomponentsInfluenceImage': 11,
                    'viewercomponentsRelatedDocuments': 12,
                    'viewercomponentsAttributeList': 13,
                    'viewercomponentsPrint': 15
                },
                menuIconPosition: {
                    x: 561
                },
                paddingCorrection: 3
            };
            var styleContent  = '.applicationSpriteClass button { background-image: url(\'' + appSprite + '\') !important; width: 100%; height: 100%; } ';
                styleContent += '.applicationSpriteClassPopup { background-image: url(\'' + appSprite + '\') !important; } ';
                styleContent += ' .buttonDefaultClass_normal button { background-position: -' + ((spriteConfig.columnConfig.normal - 1) * spriteConfig.gridSize) + 'px 0px; } ';
                styleContent += ' .buttonDefaultClass_hover button { background-position: -' + ((spriteConfig.columnConfig.hover - 1) * spriteConfig.gridSize) + 'px 0px; } ';
                styleContent += ' .buttonDefaultClass_click button { background-position: -' + ((spriteConfig.columnConfig.click - 1) * spriteConfig.gridSize) + 'px 0px; } ';

            var innerImageOffset = (spriteConfig.imageSize / 2) - (spriteConfig.popupImageSize / 2);
            Ext.Object.each(spriteConfig.rowConfig, function(compClassName, row) {
                Ext.Object.each(spriteConfig.columnConfig, function(state, col) {
                // Button style
                styleContent += ' .' + compClassName + '_' + state + ' button { ' +
                                'background-position: -' + (((col - 1) * spriteConfig.gridSize) + spriteConfig.paddingCorrection) + 'px -' + (((row - 1) * spriteConfig.gridSize) + spriteConfig.paddingCorrection) + 'px !important; ' +
                                '}';
                });
                // Popupwindow style
                styleContent += ' .' + compClassName + '_popup { ' +
                                'background-position: -' + (spriteConfig.menuIconPosition.x + innerImageOffset) + 'px -' + (((row - 1) * spriteConfig.gridSize) + innerImageOffset) + 'px !important; ' +
                                '}';
            });
            Ext.util.CSS.createStyleSheet(styleContent, 'appSpriteStyle');
        }
    },
    /**
     * Bind an event to this component
     * @param event {String} The type of event to listen for
     * @param handler {Function} The method the event invokes
     * @param scope {Object}(optional) The scope in which to execute the handler function. The handler function's "this" context.
     * @param options {Object} (optional) An object containing handler configuration properties.
     * @see Ext.util.Observable
     */
    bind : function(event,handler,scope,options){
        this.addListener(event,handler,options);
    },    

    isTool: function() {
        // How can we check if the component is a tool?
        return (this.superclass && this.superclass.$className && (this.superclass.$className == 'viewer.viewercontroller.controller.Tool' || this.superclass.$className == 'viewer.components.tools.JSButton'));
    },

    resizeScreenComponent: function() {
        if(!this.isTool() && !this.isPopup) {
            this.doResize();
        }
		if(isMobile && this.isPopup) {
			this.popup.resizePopup();
			this.doResize();
		}
    },

    doResize: function() {
        var me = this;
        if(me.getExtComponents) {
            var extComponents = me.getExtComponents();
            for(var i = 0; i < extComponents.length; i++) {
                var comp = Ext.getCmp(extComponents[i]);
                if(comp!=undefined && comp != null) {
                    if(comp.doLayout) comp.doLayout();
                    else if(comp.forceComponentLayout) comp.forceComponentLayout();
                }
            }
        } else {
            // if(!this.isTool()) console.log('Component ' + this.$className + ' should implement the getExtComponents function to be able to resize contents', this);
        }
    }
});
