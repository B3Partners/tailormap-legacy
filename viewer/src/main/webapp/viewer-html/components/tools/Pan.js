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
 * Pan Tool component
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.tools.Pan",{
    extend: "viewer.components.tools.Tool",
    config:{
        name: "pan",
        tooltip: "Pan"
    },
    constructor: function (conf){        
        this.initConfig(conf);
		viewer.components.tools.Pan.superclass.constructor.call(this, this.config);
        conf.type = viewer.viewercontroller.controller.Tool.PAN;        
        this.initTool(conf);
        return this;
    }
});