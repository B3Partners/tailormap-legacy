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
 * Coordinates
 * Creates a Coordinates component in the framework
 * of the MapComponent. Shows the mouse coords when hovering the map
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Coordinates",{
    extend: "viewer.components.Component",
    constructor: function (conf){
        if (!conf){
            conf={};
        }if (!conf.decimals){
            conf.decimals=2;
        }
        viewer.components.Coordinates.superclass.constructor.call(this, conf);
        this.initConfig(conf);

        conf.id=conf.name;
        conf.type=viewer.viewercontroller.controller.Component.COORDINATES;

        var comp = this.viewerController.mapComponent.createComponent(conf);
        this.viewerController.mapComponent.addComponent(comp);

        return this;
    },
    getExtComponents: function() {
        return [];
    }
});


