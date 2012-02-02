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
        leftmargin_top: {region:'west', subregion:'center', columnOrientation: 'horizontal', defaultLayout: {
                width: 250
        }},
        leftmargin_bottom: {region:'west', subregion:'south', columnOrientation: 'horizontal', defaultLayout: {
                height: 250
        }},
        left_menu: {region:'center', subregion:'west', columnOrientation: 'vertical', defaultLayout: {
                width: 150
        }},
        top_menu: {region:'none'},
        content: {region:'center', subregion:'center', columnOrientation: 'vertical', defaultLayout: {}},
        popupwindow: {},
        rightmargin_top: {region:'east', subregion:'center', columnOrientation: 'horizontal', defaultLayout: {
                width: 250
        }},
        rightmargin_bottom: {region:'east', subregion:'south', columnOrientation: 'horizontal', defaultLayout: {
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
                layout: defaultConfig.defaultLayout
            });
        }
    });
    
    // Function to create component block
    function createComponentItems(components, componentList) {
        var componentItems = [];
        var hasTabComponent = false;
        Ext.Array.each(components, function(component) {
            if(component.componentClass == "Tabs") {
                hasTabComponent = true;
            }
        });
        Ext.Array.each(components, function(component) {
            var cmpId = Ext.id();
            var cmpView = Ext.create('Ext.container.Container', {
                cls: 'component-view',
                tpl: '<tpl for="."><div class="viewer-component-block" id="{id}"></div></tpl>',
                data: {
                    id: cmpId,
                    cmp_name: component.name
                },
                layout: 'fit',
                style: {
                    width: '100%',
                    height: '100%'
                }
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
        var layout = {
            width: 0,
            height: 0
        };
        var regionlayout = null;
        if(value.length > 1) {
            var items = [];
            var centerItem = null;
            Ext.Array.each(value, function(item, index) {
                var component = createComponentItems(item.regionconfig.components, componentList);
                componentList = component.componentList;
                var sublayout = Ext.apply({
                    width: 0,
                    height: 0
                }, item.layout);
                if(item.region.subregion == 'center') {
                    centerItem = item;
                    console.log('INITCENTER: ', centerItem);
                }
                if(item.regionconfig.layout) {
                    var regionlayout = item.regionconfig.layout;
                    if(item.region.columnOrientation == 'horizontal') {
                        if(item.region.subregion != 'center') {
                            if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                                sublayout.height = parseInt(regionlayout.height);
                            } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                                sublayout.flex = parseInt(regionlayout.height) / 100;
                            }
                        }
                        sublayout.width = '100%';
                    }
                    if(item.region.columnOrientation == 'vertical') {
                        if(item.region.subregion != 'center') {
                            if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                                sublayout.width = parseInt(regionlayout.width);
                            } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                                sublayout.flex = parseInt(regionlayout.width) / 100;
                            }
                        }
                        sublayout.height = '100%';
                    }
                }
                if(item.region.subregion != "none") {
                    items.push(Ext.apply({
                        xtype: 'container',
                        items: component.componentItems
                    }, sublayout));
                }                
            });
            if(items.length > 0 && centerItem != null) {
                var extLayout = 'vbox';
                if(centerItem.region.columnOrientation == 'vertical') extLayout = 'hbox';
                if(region != 'center') {
                    layout.width = centerItem.layout.width;
                    console.log('CENTERITEM: ', centerItem);
                    if(centerItem.regionconfig.layout) {
                        regionlayout = centerItem.regionconfig.layout;
                        if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                            layout.width = parseInt(regionlayout.width);
                            console.log('Setting width', layout);
                        } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                            layout.flex = parseInt(regionlayout.width) / 100;
                        }
                    }
                }
                var container = Ext.apply({
                    xtype: 'container',
                    layout: extLayout,
                    region: region,
                    items: items
                }, layout);
                viewportItems.push(container);
            }
        } else {
            var component = createComponentItems(value[0].regionconfig.components, componentList);
            componentList = component.componentList;
            if(value[0].region.region != "none") {
                layout = value[0].layout;
                if(value[0].regionconfig.layout) {
                    regionlayout = value[0].regionconfig.layout;
                    if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                        layout.width = parseInt(regionlayout.width);
                    } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                        layout.flex = parseInt(regionlayout.width) / 100;
                    }
                    if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                        layout.height = parseInt(regionlayout.height);
                    } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                        layout.flex = parseInt(regionlayout.height) / 100;
                    }
                }
                viewportItems.push(Ext.apply({
                    xtype: 'container',
                    region: region,
                    layout: 'vbox',
                    items: component.componentItems
                }, layout));
            }
        }
    });
    
    console.log("VIEWPORTITEMS: ", {viewport:viewportItems});
    console.log("COMPONENTLIST: ", componentList);
    
    var viewport = Ext.create('Ext.container.Container', {
        layout: 'border',
        items: viewportItems,
        renderTo: 'wrapper',
        height: '100%',
        width: '100%'
    });
});