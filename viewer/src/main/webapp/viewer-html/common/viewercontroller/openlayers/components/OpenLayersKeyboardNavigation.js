/* 
 * Copyright (C) 2014 Vicrea Solutions B.V.
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
 * OpenLayers KeyboardNavigation Component
 * Creates a KeyboardNavigation component for OpenLayers, so the map can be navigated by keyboard
 * only.
 * @author <a href="mailto:f.steggink@vicrea.nl">Frank Steggink</a>
 */ 
Ext.define ("viewer.viewercontroller.openlayers.components.OpenLayersKeyboardNavigation",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersComponent",
    
    constructor: function (conf){        
        //arguments.push();
        this.callParent(arguments);
        this.frameworkObject=new OpenLayers.Control.KeyboardDefaults();
        return this;
    }
});


