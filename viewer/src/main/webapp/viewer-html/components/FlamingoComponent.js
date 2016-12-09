/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * FlamingoComponent
 * Creates a Custom Flamingo component with the given xml.
 * With this all custom Flamingo-mc objects can be added.
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.FlamingoComponent",{
    extend: "viewer.components.Component",
    config:{
        name: "FlamingoComponent",
        xml : ""
    },
    constructor: function (conf){        
        this.initConfig(conf);
		viewer.components.FlamingoComponent.superclass.constructor.call(this, this.config);
        if (!FlamingoAppLoader.get("viewerController").mapComponent instanceof viewer.viewercontroller.FlamingoMapComponent){
            Ext.Error.raise({msg: "Can't add FlamingoComponent to a non flamingo viewer."});
        }
        FlamingoAppLoader.get("viewerController").mapComponent.addComponentXml(conf.xml);
        return this;
    },
    getExtComponents: function() {
        return [];
    }
});

