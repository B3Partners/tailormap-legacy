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
 * GoogleNavigation component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.tools.GoogleNavigation",{
    extend: "viewer.components.tools.Tool",
    config:{
        name: "Google Navigation",
        navigationPanel : true
    },
    navComp: null,
    constructor: function (conf){   
        //copy the configuration before it's changed.
        var confNav ={};
        Ext.apply(confNav,conf);
        
        viewer.components.tools.GoogleNavigation.superclass.constructor.call(this, conf);
        this.initConfig(conf); 
        conf.type = viewer.viewercontroller.controller.Tool.DEFAULT;
        this.initTool(conf);
        if (this.getNavigationPanel()){  
            confNav.name += "_navPan",
            this.navComp=Ext.create("viewer.components.NavigationPanel",confNav);
        }
        return this;
    }
});