/**
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
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
/**
 * Abstract component
 * For using a popup, set this.config.isPopup = true.
 * For rendering to the popup, use the this.popup.getContentId() function
 * The icon can be rendered to this.getDiv()
 *
 */
Ext.define("viewer.components.Component",{
    extend: "Ext.util.Observable",
    statics: {
        parseBooleanValue: function(val) {
            if (val === true || val === false) {
                return val;
            }
            return ("true" === val);
        }
    },
    events: null,
    popup: null,
    config: {
        name: "naam",
        div: new Object(),
        viewerController: null,
        isPopup : false,
        hasSharedPopup:false,
        regionName: "",
        containerId: ''
    },
    defaultButtonWidth: 46,
    defaultButtonHeight: 46,
    forceState: false,
    haveSprite: false,
    /**
    * @constructs
    * @param {Object} config configuration object
    * @property config.name {String} the unique name of the object
    * @property config.div {DomElement} the div where the component must be placed
    * @property config.viewerController {ViewerController} a reference to the ViewerController
    * @property config.isPopup {Boolean} Indicates whether or not to render this component to a popup
    */
    constructor: function(config){
        var me = this;
        viewer.components.Component.superclass.constructor.call(this, config);
        me.initConfig(config);
        me.createIconStylesheet();
        var screenAreas = ['header', 'leftmargin_top', 'leftmargin_bottom', 'rightmargin_top', 'rightmargin_bottom', 'footer'];
        if(!me.config.hasOwnProperty('isPopup')) {
            me.config.isPopup = true;
        }
        if(config.hasOwnProperty('regionName') && Ext.Array.indexOf(screenAreas, config.regionName) !== -1) {
            me.config.isPopup = false;
        }
        if(me.config.isPopup) {
            if(this.viewerController.hasSvgSprite() && !this.config.iconUrl) {
                config.popupIcon = this.getSvgIcon();
            } else {
                config.iconCls = this.getPopupIcon();
            }
            me.popup = Ext.create("viewer.components.ScreenPopup", config);
            me.popup.setComponent(me);
            me.popup.popupWin.addListener("resize", function() {
                me.doResize();
            });
        }
        if(me.config.name && me.title) {
            me.config.viewerController.layoutManager.setTabTitle(me.config.name, me.title);
        }
        me.events = [];
        me.addContainerClass();
        return me;
    },
    addContainerClass: function() {
        var myClassname = this.$className || "";
        var containerCls = [
            myClassname.toLowerCase().replace(/\./ig, "").replace(/viewercomponents/ig, ""),
            "-component-container"
        ].join("");
        var container = this.getContentContainer();
        if(container) {
            container.addCls(containerCls);
        }
    },
    /**
      *Returns the id of the content div.
     */
    getContentDiv : function (){
        if(this.config.isPopup){
            return this.popup.getContentId();
        }else{
            return this.config.div;
        }
    },

    getContentContainer: function() {
        if(this.config.isPopup) {
            return this.popup.getContentContainer();
        }
        return Ext.getCmp(this.config.containerId);
    },

    /**
     * Renders a button in the div (holder).
     * if a titlebarIcon is set, its used to generate in the button. Otherwise the title or name.
     *
     * @param {Object} options config options for the button
     * @property options.handler the handler function called when the button is clicked.
     * @property options.text the text in the button
     * @property options.icon the url to a  icon for this button.
     * @property options.tooltip the tooltip for this button.
     */
    renderButton: function(options) {
        var me = this,
            buttonIcon = null,
            buttonText = "",
            buttonCls = '',
            buttonWidth = me.defaultButtonWidth,
            baseClass = this.getBaseClass(),
            showLabel = false
            buttonHtml = "";

        if(!me.config.isPopup) return;

        var hasDefinedSpriteIcon = options.icon && options.icon.charAt(0) === "#";
        me.options = options;
        if(options.icon && !hasDefinedSpriteIcon) {
            buttonIcon = options.icon;
            buttonCls = "customIconButton";
        } else if(me.haveSprite) {
            buttonCls = 'applicationSpriteClass buttonDefaultClass_normal ' + baseClass + '_normal';
            if(this.config.viewerController.hasSvgSprite()) {
                buttonHtml = this.getSvgIcon(hasDefinedSpriteIcon ? options.icon : null);
                buttonCls += ' svg-button';
            }
        } else {
            buttonText = (options.text || (me.config.name || ""));
            buttonWidth = 'autoWidth';
        }

        // Only show label if there is an icon or a sprite (and a label is set)
        if((options.icon || me.haveSprite) && options.label) showLabel = true;

        var buttonListeners = {
            click: function(button) {
                me.setButtonState('click');
            }
        };
        if(!viewer.components.MobileManager.hasTouch()) {
            buttonListeners["mouseover"] = function(button) {
                me.setButtonState('hover');
            };
            buttonListeners["mouseout"] = function(button) {
                me.setButtonState('normal');
            };
        }

        me.button = Ext.create('Ext.button.Button', {
            text: buttonText,
            cls: buttonCls,
            html: buttonHtml,
            renderTo: (showLabel ? null : me.config.div),
            scale: "large",
            icon: buttonIcon,
            tooltip: options.tooltip || null,
            maskElement: "el",
            handler: function() {
                if(me.button.isMasked()) {
                    // Component is loading
                    return;
                }
                if(me.popup && me.popup.isVisible()) {
                    me.popup.hide();
                } else {
                    me.button.setLoading(true);
                    setTimeout(function() {
                        var promise = options.handler();
                        if(me.isPromise(promise)) {
                            promise.always(function() {
                                me.button.setLoading(false);
                            });
                        } else {
                            setTimeout(function() {
                                me.button.setLoading(false);
                            }, 0);
                        }
                    }, 0);
                }
            },
            width: buttonWidth,
            height: me.defaultButtonHeight,
            enableToggle: true,
            style: {
                height: me.defaultButtonHeight + 'px'
            },
            listeners: buttonListeners,
            preventDefault: !viewer.components.MobileManager.hasTouch()
        });

        if(showLabel) {
            var textDimensions = Ext.util.TextMetrics.measure(me.config.div, options.label, buttonWidth);
            Ext.create('Ext.container.Container', {
                renderTo: me.config.div,
                height: me.defaultButtonHeight + textDimensions.height + 3, // Button height + text height + text padding
                margin: 3,
                layout: {
                    type: 'vbox',
                    align: 'center',
                    shrinkToFit: false
                },
                style: {
                    display: 'inline-block',
                    'vertical-align': 'top'
                },
                items: [
                    me.button,
                    {
                        xtype: 'container',
                        html: options.label,
                        style: {
                            'padding-top': '3px',
                            'text-align': 'center'
                        }
                    }
                ]
            });
        }
    },

    getHelpToolConfig: function() {
        var tools = [];
        if(this.config && this.config.hasOwnProperty('showHelpButton') && this.config.showHelpButton !== "false") {
            tools = [{
                type: 'help',
                tooltip: i18next.t('viewer_components_svgheader_1'),
                scope: this,
                handler: function(event, toolEl, panel){
                    this.config.viewerController.showHelp(this.config);
                }
            }];
        }
        return tools;
    },

    getPanelTitle: function() {
        var title = "";
        if(this.config.title && !this.config.viewerController.layoutManager.isTabComponent(this.name) && !this.config.isPopup) {
            title = this.config.title;
        }
        return title;
    },

    getSvgIcon: function(iconCls) {
        var appSprite = this.config.viewerController.getApplicationSprite();
        var baseClass = this.getBaseClass().replace("viewercomponents", "").toLowerCase();
        var spriteCls = '#icon-' + baseClass;
        if(iconCls) {
            spriteCls = iconCls;
        }
        return [
            '<div class="svg-click-area"></div>', // An extra transparent DIV is added to fix issue where button could not be clicked in IE
            '<svg role="img" title=""><use xlink:href="', appSprite, spriteCls,'"/></svg>'
        ].join('');
    },

    setButtonState: function(state, forceState) {
        var me = this,
            button = me.button,
            baseClass = this.getBaseClass();

        if (!me.options || !me.button){
            return;
        }
        if(!me.options.icon && me.haveSprite && (!me.forceState || forceState)) {
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
        if(this.config.iconUrl) {
            // We need to give a CSS class, so if in image is set, we are creating a new stylesheet... Improve??
            var className = baseClassName + '_popupicon';
            Ext.util.CSS.createStyleSheet('.' + className + ' { background-image: url(\'' + this.config.iconUrl + '\') !important; }', baseClassName + 'iconStyle');
            return className;
        }
        return 'applicationSpriteClassPopup ' + baseClassName + '_popup';
    },

    /**
     * Dynamically create a stylesheet for icons on component buttons using a
     * sprite, if the stylesheet not already exists.
     *
     * The classes created for standard component icons and the position in the
     * sprite are hardcoded here.
     *
     * Updates this.haveSprite.
     */
    createIconStylesheet: function() {
        var me = this;

        if(this.viewerController.hasSvgSprite()) {
            me.haveSprite = true;
            return;
        }

        var SPRITE_STYLE = "appSpriteStyle";

        if(document.getElementById(SPRITE_STYLE) != null) {
            // style was already created by a previous component and is available
            me.haveSprite = true;
            return;
        }

        var appSprite = me.config.viewerController.getApplicationSprite();

        if(Ext.isEmpty(appSprite)) {
            me.haveSprite = false;
            return;
        }
        me.haveSprite = true;

        // Prepend context path for relative URLs
        if(appSprite.indexOf("://") == -1) {
            // By accident a fixed context path was put in the default value for
            // the sprite url in many apps which does not work for other
            // context paths
            if(appSprite.indexOf("/viewer/") == 0) {
                appSprite = appSprite.substring(7);
            }
            if(!appSprite.charAt(0) == "/") {
                appSprite = "/" + appSprite;
            }
            appSprite = FlamingoAppLoader.get('contextPath') + appSprite;
        }

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
                'viewercomponentsPrint': 15,
                'viewercomponentstoolsDownloadMap': 16,
                'viewercomponentsSpatialFilter': 17,
                'viewercomponentsGraph': 18,
                'viewercomponentsTOC': 19,
                'viewercomponentsSnapping': 20,
                'viewercomponentsSplit': 21,
                'viewercomponentsMerge': 22
            },
            menuIconPosition: {
                x: 561
            },
            paddingCorrection: 3,
            xOffset: 354
        };
        var styleContent  = '.applicationSpriteClass .x-btn-button { background-image: url(\'' + appSprite + '\') !important; position: absolute; left: 2px; top: 2px; bottom: 2px; right: 2px; } ';
            styleContent += '.applicationSpriteClassPopup { background-image: url(\'' + appSprite + '\') !important; } ';
            styleContent += ' .buttonDefaultClass_normal .x-btn-button { background-position: -' + ((spriteConfig.columnConfig.normal - 1) * spriteConfig.gridSize) + 'px 0px; } ';
            styleContent += ' .buttonDefaultClass_hover .x-btn-button { background-position: -' + ((spriteConfig.columnConfig.hover - 1) * spriteConfig.gridSize) + 'px 0px; } ';
            styleContent += ' .buttonDefaultClass_click .x-btn-button { background-position: -' + ((spriteConfig.columnConfig.click - 1) * spriteConfig.gridSize) + 'px 0px; } ';

        var innerImageOffset = (spriteConfig.imageSize / 2) - (spriteConfig.popupImageSize / 2);
        Ext.Object.each(spriteConfig.rowConfig, function(compClassName, row) {
            Ext.Object.each(spriteConfig.columnConfig, function(state, col) {
            // Button style
            styleContent += ' .' + compClassName + '_' + state + ' .x-btn-button { ' +
                            'background-position: -' + (((col - 1) * spriteConfig.gridSize) + spriteConfig.paddingCorrection + spriteConfig.xOffset) + 'px -' + (((row - 1) * spriteConfig.gridSize) + spriteConfig.paddingCorrection) + 'px !important; ' +
                            '}';
            });
            // Popupwindow style
            styleContent += ' .' + compClassName + '_popup { ' +
                            'background-position: -' + (spriteConfig.menuIconPosition.x - innerImageOffset -(spriteConfig.popupImageSize/2) )+ 'px -' + (((row - 1) * spriteConfig.gridSize) + innerImageOffset) + 'px !important; ' +
                            '}';
        });
        Ext.util.CSS.createStyleSheet(styleContent, SPRITE_STYLE);
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
        if(!this.isTool() && !this.config.isPopup) {
            this.doResize();
        }
		if(viewer.components.MobileManager.isMobile() && this.config.isPopup) {
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
                if(comp !== undefined && comp !== null) {
                    if(comp.updateLayout) comp.updateLayout();
                    // else if(comp.updateLayout) comp.updateLayout();
                    // else if(comp.forceComponentLayout) comp.forceComponentLayout();
                }
            }
        } else {
            // if(!this.isTool()) console.log('Component ' + this.$className + ' should implement the getExtComponents function to be able to resize contents', this);
        }
    },
    /**
     * Implement when there is a state for this component that must me included in the bookmark url
     * @param {Boolean} shortUrl true if the settings are used for the short url. If false, the state is used
     * in the plain url.
     * @return must return a object with key value pairs. Return null if the component has no state for the bookmark
     */
    getBookmarkState: function(shortUrl){
        return null;
    },
    /**
     * Implement to load the variables (created with 'getBookmarkState' or entered in the url) from the bookmark or via the url in the component
     * @param {Object} state an object that is created with 'getBookmarkState' or a value from the url. This is an unprocessed object. The implementation should know what to
     * expect (ie. should it be decoded).
     */
    loadVariables: function(state){
        return;
    },

    /**
     *  Handle promises
     */

    /**
     * @type Ext.Deferred
     */
    currentDeferred: null,

    createDeferred: function() {
        this.currentDeferred = new Ext.Deferred();
        // When we create a promise, make sure to clean up in case something goes wrong
        window.setTimeout((function() {
            this.cleanupDeferred();
        }).bind(this), 30 * 1000);
        return this.currentDeferred;
    },

    resolveDeferred: function() {
        if(!this.isPromise(this.currentDeferred)) {
            return;
        }
        this.currentDeferred.resolve.apply(this.currentDeferred, ["success"].concat(arguments));
    },

    rejectDeferred: function() {
        if(!this.isPromise(this.currentDeferred)) {
            return;
        }
        this.currentDeferred.reject.apply(this.currentDeferred, ["error"].concat(arguments));
    },

    isPromise: function(promise) {
        return promise && (promise instanceof Ext.promise.Promise || promise instanceof Ext.Deferred);
    },

    cleanupDeferred: function() {
        if(!this.isPromise(this.currentDeferred)) {
            return;
        }
        this.currentDeferred.reject("timeout");
    }

});
