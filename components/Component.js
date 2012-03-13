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
        viewerController: new Object(),
        isPopup : false,
        hasSharedPopup:false
    }, 
    /**
    * @constructs
    * @param config.name {String} the unique name of the object
    * @param config.div {DomElement} the div where the component must be placed
    * @param config.viewerController {ViewerController} a reference to the ViewerController
    * @param config.isPopup {Boolean} Indicates whether or not to render this component to a popup
    * @param config.hasSharedPopup {Boolean} Indicates if this component should render itself to the shared popup
    */
    constructor: function(config){
        var me = this;
        me.initConfig(config);
        if(me.isPopup){
            if(me.hasSharedPopup){
                 // TODO render to sharedpopup div id (is maybe a tabid)
            }else{
                me.popup = Ext.create("viewer.components.ScreenPopup",config);
                me.popup.popupWin.addListener("resize", function() {
                    if(me.getExtComponents) {
                        var extComponents = me.getExtComponents();
                        for(var i = 0; i < extComponents.length; i++) {
                            var comp = Ext.getCmp(extComponents[i]);
                            if(comp !== null) {
                                comp.doLayout();
                            }
                        }
                    }
                });
            }
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
        var me = this;
        Ext.create('Ext.button.Button', {
            text: (options.icon == '' ? (options.text || (me.name || "")) : ''),
            renderTo: me.div,
            scale: "large",
            icon: options.icon || null,
            tooltip: options.tooltip || null,
            handler: options.handler
        });
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
    }
});
