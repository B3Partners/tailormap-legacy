/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * Abstract component to add to the MapComponent.
  *@author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.controller.Component",{
    extend: "Ext.util.Observable",
    config :{
        id: "id",
        frameworkObject: new Object(),
        type: -1
    },
    constructor: function (config){
        this.initConfig(config);
        return this;
    },
    statics:{
        // The different types of tools
        LOADING_BAR                : 1,
        SCALEBAR                   : 2,
        BORDER_NAVIGATION          : 3,
        COORDINATES                : 4,
        NAVIGATIONPANEL            : 5,
        MAPTIP                     : 6
    },
    setVisible: function (vis){
        Ext.Error.raise({msg: "setVisible() function must be implemented in implementation"});
    }
    
});

