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
 *Abstract tool component
 */
Ext.define ("viewer.components.tools.Tool",{
    extend: "viewer.components.Component",    
    tool: null,
    constructor: function (conf){        
        viewer.components.tools.Tool.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        return this;
    },
    /**
     * Init the tool and add it to the mapcomponent
     */
    initTool: function(conf){ 
        //MapComponent is working with ids instead of names
        conf.id=conf.name;
        //Let the Mapcomponent create the specific tool
        tool = viewerController.mc.createTool(conf);   
        if (tool==null){
            throw new Error("Tool not initialized! Initialize the tool before the addTool");            
        }
        //Add the tool
        viewerController.mc.addTool(tool);
    }    
});
