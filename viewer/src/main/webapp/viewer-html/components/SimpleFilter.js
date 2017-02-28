/*
 * Copyright (C) 2012-2015 B3Partners B.V.
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

Ext.define("viewer.components.SimpleFilter", {
    extend: "viewer.components.Component",
    container: null,
    config: {
        filters: null,
        layers: null,
        name: null,
        title: ""
    },
    simpleFilters:null,
    constructor: function (conf){
        this.initConfig(conf);
		viewer.components.SimpleFilter.superclass.constructor.call(this, this.config);
        this.simpleFilters = [];

        var containerContentId = Ext.id();
        this.container = Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            renderTo: this.div,
            html: '<div class="simple-filter-wrapper" id="' + containerContentId + '"></div>'
        });

        var me = this;
        Ext.Array.each(this.config.filters, function(filter, index) {
            var className = filter["class"];
            var newFilter = Ext.create(className, {
                appLayerId: me.config.layers[filter.appLayerId], // convert from index to actual appLayerId
                attributeName: filter.attributeName,
                filterConfig: filter.config,
                container: containerContentId,
                simpleFilter: me,
                name: me.config.name + "_" + index,
                viewerController: me.viewerController
            });
            if(newFilter instanceof viewer.components.sf.SimpleFilter){
                me.simpleFilters.push(newFilter);
            }
        });
        return this;
    },
    
    getDiv: function() {
        return this.container;
    },

    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});


