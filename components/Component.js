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
        isPopup : false
    }, 
    /**
    * @constructs
    * @param config.name {String} the unique name of the object
    * @param config.div {DomElement} the div where the component must be placed
    * @param config.viewerController {ViewerController} a reference to the ViewerController
    */
    constructor: function(config){
        this.initConfig(config);
        if(this.isPopup){
            this.popup = Ext.create("viewer.components.ScreenPopup",config);
        }
        this.events = [];
        return this;
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
