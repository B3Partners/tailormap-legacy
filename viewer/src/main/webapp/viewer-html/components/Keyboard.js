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
 * Keyboard navigation
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * This tool enables the usage of the keyboard for navigation.
 * @author <a href="mailto:meinetoonen.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Keyboard",{
    extend: "viewer.components.Component",
    keyboardTool:null,
    config:{
        name: "keyboard",
        tooltip: "Keyboard navigation"
    },
    constructor: function (conf){        
        this.initConfig(conf);
		viewer.components.Keyboard.superclass.constructor.call(this, this.config);
        this.keyboardTool = new OpenLayers.Control.KeyboardDefaults();
        this.viewerController.mapComponent.getMap().getFrameworkMap().addControl(this.keyboardTool);
        return this;
    }
});