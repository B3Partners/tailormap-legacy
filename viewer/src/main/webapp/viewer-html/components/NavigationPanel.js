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
 * Navigation Panel
 * Creates a Navigation Panel component in the framework 
 * of the MapComponent
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.NavigationPanel",{
    extend: "viewer.components.Component",    
    
    config: {
        top:null,
        left:null
    },
    constructor: function (conf){ 
        conf.top = conf.top === undefined ? 20 : conf.top;
        conf.left = conf.left === undefined ? 0 : conf.left;
        this.initConfig(conf);
		viewer.components.NavigationPanel.superclass.constructor.call(this, this.config);
        conf.id = conf.name;
        conf.type = viewer.viewercontroller.controller.Component.NAVIGATIONPANEL;
        var comp = this.config.viewerController.mapComponent.createComponent(conf);
        this.config.viewerController.mapComponent.addComponent(comp);
        return this;
    },
    getExtComponents: function() {
        return [];
    }
});

