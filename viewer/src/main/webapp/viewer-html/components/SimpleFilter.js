/* 
 * Copyright (C) 2012-2014 B3Partners B.V.
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

Ext.define("viewer.components.sf.Slider", {
    
    config: {
        appLayerId: null,
        attributeName: null,
        config: null,
        container: null,
        simpleFilter: null
    },
    
    constructor: function(conf) {
        this.initConfig(conf);
        console.log("init " + this.self.getName(), this);
    }
});

Ext.define("viewer.components.SimpleFilter", {
    extend: "viewer.components.Component",
    container: null,
    config: {
        filters: null,
        layers: null,
        name: null
    },
    constructor: function (conf){
        viewer.components.SimpleFilter.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        console.log("config: ", conf);
        var parentDiv = Ext.get(this.div);
        
        this.container = Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            renderTo: this.div,
            autoScroll: true,
            html: 'Dit wordt het simpele filter component'
        });

        var me = this;
        Ext.Array.each(this.config.filters, function(filter) {
            Ext.create(filter.class, {
                appLayerId: me.config.layers[filter.appLayerId], // convert from index to actual appLayerId
                attributeName: filter.attributeName,
                config: filter.config,
                container: me.container,
                simpleFilter: me
            });
        });
        return this;
    },
    
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});


