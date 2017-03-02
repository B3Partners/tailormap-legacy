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
 * Creates a JSButton with the given configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.viewercontroller.controller.ToolMapClick",{
    extend: "viewer.viewercontroller.controller.Tool",
    id: null,
    config:{
        name: null
    },
    /**
     *@constructor
     *@see viewer.viewercontroller.controller.Tool#constructor
     *@param {Object} conf Extra options:
     *@property conf.name the name
     *@property conf.handler the handling object. 2 values needed:
     *@property conf.handler.fn the function that is called when clicked on the map with this tool.
     * The given function is called with 2 arguments:
     * tool: this tool
     * result: a result object with .coord object that has a .x and .y  as world coords.
     * Optional the result object can also have a x or y as screen pixels.
     *@property conf.handler.scope the scope of the function
     */    
    constructor: function (conf){              
        viewer.viewercontroller.controller.ToolMapClick.superclass.constructor.call(this, conf);
        return this;
    },
   
    activateTool : function(){
        Ext.Error.raise({msg: "ToolMapClick.activateTool() Not implemented! Must be implemented in sub-class"});
    },
    deactivateTool : function(){
        Ext.Error.raise({msg: "ToolMapClick.deactivateTool() Not implemented! Must be implemented in sub-class"});
    }
});
