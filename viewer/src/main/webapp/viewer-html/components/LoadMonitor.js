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
 * LoadMonitor object.
 * Monitor's the loading with a loadingbar
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.LoadMonitor",{
    extend: "viewer.components.Component",
    loadMonitor:null,
    constructor: function (conf){
        //default values:
        conf.left = conf.left === undefined ? 5 : conf.left;
        conf.top = conf.top === undefined ? 50 : conf.top;
        conf.timeout = conf.timeout == undefined? 60000 : conf.timeout;
        
        this.initConfig(conf);        
		viewer.components.LoadMonitor.superclass.constructor.call(this, this.config);
        
        conf.id=conf.name;
        conf.type=viewer.viewercontroller.controller.Component.LOADMONITOR;
        
        this.loadMonitor = this.config.viewerController.mapComponent.createComponent(conf);
        this.config.viewerController.mapComponent.addComponent(this.loadMonitor);
        
        return this;
    },
    getExtComponents: function() {
        return [];
    }
});

