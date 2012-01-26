/* 
 * Copyright (C) 2012 B3Partners B.V.
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

Ext.require(['*']);
Ext.onReady(function() {
    
    // Default regions
    var defaultRegions = {
        header: {region: 'north'},
        leftmargin_top: {region:'west', subregion:'north'},
        leftmargin_bottom: {region:'west', subregion:'south'},
        left_menu: {region:'center', subregion:'west'},
        top_menu: {region:'center', subregion:'north'},
        center: {region:'center', subregion:'center'},
        right: {region:'east'},
        popupwindow: {},
        rightmargin_top: {region:'east', subregion:'north'},
        rightmargin_bottom: {region:'east', subregion:'south'},
        footer: {region:'south'}
    };
    
    // State manager, disable in development, enable in production?
    // Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
    var layout = app.layout;
    var layoutItems = {};
    Ext.Object.each(layout, function(regionid, regionconfig) {
        console.log(regionid);
        var defaultConfig = defaultRegions[regionid];
        if(!Ext.isDefined(layoutItems[defaultConfig.region])) {
            layoutItems[defaultRegions[regionid].region] = [];
        }
        layoutItems[defaultRegions[regionid].region].push({
            region: defaultRegions[regionid],
            layout: regionconfig,
            name: regionid
        });
    });
    
    var viewportItems = [];
    Ext.Object.each(layoutItems, function(region, value) {
        if(value.length > 1) {
            var items = [];
            Ext.Array.each(value, function(item, index) {
                items.push({
                    xtype: 'container',
                    region: item.region.subregion,
                    html: item.name,
                    layout: item.regionconfig
                });
            });
            var container = Ext.create('Ext.container.Container', {
                region: region,
                items: items
            });
            viewportItems.push(container);
        } else {
            viewportItems.push({
                xtype: 'container',
                region: region,
                html: value[0].name,
                layout: value[0].regionconfig
            });
        }
    });
    
    var viewport = Ext.create('Ext.container.Container', {
        layout: 'border',
        items: viewportItems,
        renderTo: 'wrapper',
        height: '100%',
        width: '100%'
    });
});