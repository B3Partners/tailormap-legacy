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
var componentList = [];
var mapId = "";
Ext.onReady(function() {
    
    // Default regions
    var defaultRegions = {
        header: {region: 'north', defaultLayout: {
                height: 150
        }},
        leftmargin_top: {region:'west', subregion:'center', defaultLayout: {
                width: 250
        }},
        leftmargin_bottom: {region:'west', subregion:'south', defaultLayout: {
                width: 250,
                height: 250
        }},
        left_menu: {region:'center', subregion:'west', defaultLayout: {
                width: 150
        }},
        top_menu: {region:'none'},
        content: {region:'center', subregion:'center', defaultLayout: {}},
        popupwindow: {},
        rightmargin_top: {region:'east', subregion:'center', defaultLayout: {
                width: 250
        }},
        rightmargin_bottom: {region:'east', subregion:'south', defaultLayout: {
                width: 250,
                height: 250
        }},
        footer: {region:'south', defaultLayout: {
                height: 150
        }}
    };
    
    // State manager, disable in development, enable in production?
    // Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
    
    // Fetch the layout
    var layout = app.layout;
    
    // Used for keeping a list with enabled regions
    var layoutItems = {};
    
    // Iterate over application layout
    Ext.Object.each(layout, function(regionid, regionconfig) {
        // If region has components, add it to the list
        if(regionconfig.components.length > 0) {
            // Fetch default config
            var defaultConfig = defaultRegions[regionid];
            // Layoutregions are added throug array because 1 Ext region (e.g. west) can have multiple regions
            if(!Ext.isDefined(layoutItems[defaultConfig.region])) {
                layoutItems[defaultConfig.region] = [];
            }
            // Push the layout to the array
            layoutItems[defaultRegions[regionid].region].push({
                // Region holds the defaultConfig region
                region: defaultConfig,
                // Regionconfig holds the regionconfig from the layoutmanager
                regionconfig: regionconfig,
                // Region name
                name: regionid,
                // Layout of the region (widths, heights, etc.)
                layout: defaultRegions[regionid].defaultLayout
            });
        }
    });
    
    console.log(layoutItems);
    
    // Function to create component block
    function createComponentItems(components, componentList) {
        var componentItems = [];
        Ext.Array.each(components, function(component) {
            var cmpId = Ext.id();
            var cmpView = Ext.create('Ext.container.Container', {
                cls: 'component-view',
                tpl: '<tpl for="."><div class="component-block" id="{id}">{cmp_name}</div></tpl>',
                data: {
                    id: cmpId,
                    cmp_name: component.name
                },
                layout: 'fit'
            });
            componentItems.push(cmpView);
            componentList.push({
                htmlId: cmpId,
                componentName: component.name,
                componentClass: component.componentClass
            });
            if(component.componentClass == "FlamingoMap") {
                mapId = cmpId;
            }
        });
        return {
            componentItems: componentItems,
            componentList: componentList
        };
    }
    
    var viewportItems = [];
    Ext.Object.each(layoutItems, function(region, value) {
        if(Ext.isDefined(value.subregion)) {
            var items = [];
            Ext.Array.each(value, function(item, index) {
                var component = createComponentItems(item.regionconfig.components, componentList);
                componentList = component.componentList;
                if(item.region.subregion != "none") {
                    items.push(Ext.apply({
                        xtype: 'container',
                        region: item.region.subregion,
                        html: item.name,
                        items: component.componentItems
                    }, item.layout));
                }
            });
            if(items.length > 0) {
                var container = Ext.create('Ext.container.Container', {
                    layout: 'border',
                    region: region,
                    items: items
                });
            }
            viewportItems.push(container);
        } else {
            var component = createComponentItems(value[0].regionconfig.components, componentList);
            componentList = component.componentList;
            if(value[0].region != "none") {
                viewportItems.push(Ext.apply({
                    xtype: 'container',
                    region: region,
                    html: value[0].name,
                    items: component.componentItems
                }, value[0].layout));
            }
        }
    });
    
    console.log(viewportItems);
    
    var viewport = Ext.create('Ext.container.Container', {
        layout: 'border',
        items: viewportItems,
        renderTo: 'wrapper',
        height: '100%',
        width: '100%'
    });
});