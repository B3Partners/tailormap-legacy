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
 * Abstract component to add to the MapComponent.
  *@author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.controller.Component",{
    extend: "Ext.util.Observable",
    config: {
        /** @property the id of this component */
        id: null,
        /** @property a reference to the implementing object. */
        frameworkObject: null,
        /** @property the type of the object (see #statics) */
        type: -1,
        viewerController:null
    },
    /**
     * @param {Object} config A config object having, config.id, config.frameworkObject and config.type.
     * @see #config
     */
    constructor: function (config){
        this.initConfig(config);
        return this;
    },
    statics:{
        // The different types of components
        LOADING_BAR                : 1,
        SCALEBAR                   : 2,
        BORDER_NAVIGATION          : 3,
        COORDINATES                : 4,
        NAVIGATIONPANEL            : 5,
        MAPTIP                     : 6,
        LOADMONITOR                : 7,
        OVERVIEW                   : 8,
        SNAPPING                   : 9,
        KEYBOARD                   :10
    },
    /**
     *Set the component visible/invisible or enabled/disabled
     *@param vis true or false
     */
    setVisible: function (vis){
        Ext.Error.raise({msg: "setVisible() function must be implemented in implementation"});
    },

    /**
     *Overwrite the destroy function. Clear all listeners and forward to the super.destroy
     */
    destroy: function(){
        this.clearListeners();
        viewer.viewercontroller.controller.Component.superclass.destroy.call(this);
    },

    getFrameworkObject: function() {
        return this.frameworkObject;
    }
});

