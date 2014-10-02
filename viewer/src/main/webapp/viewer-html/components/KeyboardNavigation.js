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
 * KeyboardNavigation
 * Creates a KeyboardNavigation component in the framework 
 * of the MapComponent
 * @author <a href="mailto:f.steggink@vicrea.nl">Frank Steggink</a>
 */
Ext.define("viewer.components.KeyboardNavigation",{
    extend : "viewer.components.Component",
    keyboardnavigation : null,
    constructor : function (conf){
        viewer.components.KeyboardNavigation.superclass.constructor.call(this,conf);
        this.initConfig(conf);

        conf.id = conf.name;
        conf.type = viewer.viewercontroller.controller.Component.KEYBOARD_NAVIGATION;

        this.keyboardnavigation = this.viewerController.mapComponent.createComponent(conf);
        this.viewerController.mapComponent.addComponent(this.keyboardnavigation);

        return this;
    },
    getExtComponents : function (){
        return [];
    }
});


