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
 * BorderNavigation
 * Creates a Bordernavigation component in the framework 
 * of the MapComponent
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.BorderNavigation",{
    extend : "viewer.components.Component",
    bordernavigation : null,
    defaultTooltips: {
        tooltip_pan_right: i18next.t('viewer_components_bordernavigation_0'),
        tooltip_pan_left: i18next.t('viewer_components_bordernavigation_1'),
        tooltip_pan_up: i18next.t('viewer_components_bordernavigation_2'),
        tooltip_pan_down: i18next.t('viewer_components_bordernavigation_3')
    },
    constructor : function (conf){
        this.initConfig(conf);
		viewer.components.BorderNavigation.superclass.constructor.call(this,conf);

        conf.id = conf.name;
        conf.type = viewer.viewercontroller.controller.Component.BORDER_NAVIGATION;
        // Set default tooltips of not configured
        for(var tooltip in this.defaultTooltips) if(this.defaultTooltips.hasOwnProperty(tooltip)) {
            if(!conf.hasOwnProperty(tooltip)) conf[tooltip] = this.defaultTooltips[tooltip];
        }

        this.bordernavigation = this.config.viewerController.mapComponent.createComponent(conf);
        this.config.viewerController.mapComponent.addComponent(this.bordernavigation);

        return this;
    },
    getExtComponents : function (){
        return [];
    },
    resizeScreenComponent : function (){
        this.bordernavigation.resize();
    }
});


