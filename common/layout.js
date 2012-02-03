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

Ext.define('viewer.LayoutManager', {
    defaultRegionSettings: {
        header: {region: 'north', useTabs: false, defaultLayout: {height: 150}},
        leftmargin_top: {region:'west', subregion:'center', columnOrientation: 'vertical', useTabs: true, defaultLayout: {width: 250}},
        leftmargin_bottom: {region:'west', subregion:'south', columnOrientation: 'vertical', useTabs: true, defaultLayout: {height: 250}},
        left_menu: {region:'center', subregion:'west', columnOrientation: 'horizontal', useTabs: false, defaultLayout: {width: 150}},
        top_menu: {region:'none'},
        content: {region:'center', subregion:'center', columnOrientation: 'horizontal', useTabs: false, defaultLayout: {}},
        popupwindow: {},
        rightmargin_top: {region:'east', subregion:'center', columnOrientation: 'vertical', useTabs: true, defaultLayout: {width: 250}},
        rightmargin_bottom: {region:'east', subregion:'south', columnOrientation: 'vertical', useTabs: true, defaultLayout: {height: 250}},
        footer: {region:'south', useTabs: false, defaultLayout: {height: 150}}
    },
    layout: {},
    layoutItems: {},
    mapId: '',
    componentList: [],
    wrapperId: 'wrapper',
    autoRender: true,
    
    constructor: function(config) {
        Ext.apply(this, config || {});
        if(this.autoRender) {
            this.createLayout();
        }
    },

    createLayout: function() {
        var me = this;
        console.log('LAYOUTMANAGER: ', me);
        var regionList = me.createRegionList();
        console.log('REGIONLIST: ', regionList);
        var viewportItems = me.buildLayoutRegions(regionList);
        console.log('VIEWPORTITEMS: ', viewportItems);
        me.renderLayout(viewportItems);
    },

    createRegionList: function() {
        var me = this;
        var layoutItems = {};

        Ext.Object.each(me.layout, function(regionid, regionconfig) {
            // If region has components, add it to the list
            if(regionconfig.components.length > 0) {
                // Fetch default config
                var defaultConfig = me.defaultRegionSettings[regionid];
                // Layoutregions are added throug array because 1 Ext region (e.g. west) can have multiple regions
                if(!Ext.isDefined(layoutItems[defaultConfig.region])) {
                    layoutItems[defaultConfig.region] = [];
                }
                // Push the layout to the array
                layoutItems[me.defaultRegionSettings[regionid].region].push({
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
        return layoutItems;
    },

    buildLayoutRegions: function(regionList) {
        var viewportItems = [];
        var me = this;
        Ext.Object.each(regionList, function(region, value) {
            viewportItems.push(me.getLayoutRegion(region, value));
        });
        return viewportItems;
    },
    
    getLayoutRegion: function(region, value) {
        var me = this;
        var layout = {
            width: 0,
            height: 0
        };
        var regionlayout = null;
        if(value.length > 1) {
            var items = me.getSubLayoutRegion(value);
            var centerItem = me.getSubRegionCenterItem(value);
            if(items.length > 0 && centerItem != null) {
                var extLayout = 'vbox';
                if(centerItem.region.columnOrientation == 'horizontal') extLayout = 'hbox';
                if(region != 'center') {
                    layout.width = centerItem.layout.width;
                    if(centerItem.regionconfig.layout) {
                        regionlayout = centerItem.regionconfig.layout;
                        if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                            layout.width = parseInt(regionlayout.width);
                        } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                            layout.flex = parseInt(regionlayout.width) / 100;
                        }
                    }
                }
                return Ext.apply({
                    xtype: 'container',
                    region: region,
                    layout: extLayout,
                    items: items
                }, layout);
            }
        } else {
            var componentItems = me.createComponents(value[0].regionconfig.components, value[0].region);
            componentItems = me.getRegionContent(value[0].region, componentItems);
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
                return Ext.apply({
                    xtype: 'container',
                    region: region,
                    layout: 'vbox',
                    items: componentItems
                }, layout);
            }
        }
        return {};
    },
    
    getSubLayoutRegion: function(value) {
        var me = this;
        var items = [];
        Ext.Array.each(value, function(item, index) {
            var sublayout = {};
            var componentItems = me.createComponents(item.regionconfig.components, item.region);
            componentItems = me.getRegionContent(item.region, componentItems);
            if(item.regionconfig.layout) {
                var regionlayout = item.regionconfig.layout;
                if(item.region.columnOrientation == 'vertical') {
                    if(item.region.subregion != 'center') {
                        sublayout = Ext.apply({
                            width: 0
                        }, item.layout);
                        if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                            sublayout.height = parseInt(regionlayout.height);
                        } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                            sublayout.flex = parseInt(regionlayout.height) / 100;
                        }
                    } else {
                        sublayout.flex = 1;
                    }
                    sublayout.width = '100%';
                }
                if(item.region.columnOrientation == 'horizontal') {
                    if(item.region.subregion != 'center') {
                        sublayout = Ext.apply({
                            height: 0
                        }, item.layout);
                        if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                            sublayout.width = parseInt(regionlayout.width);
                        } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                            sublayout.flex = parseInt(regionlayout.width) / 100;
                        }
                    } else {
                        sublayout.flex = 1;
                    }
                    sublayout.height = '100%';
                }
            }
            var extLayout = 'fit';
            if(item.region.useTabs == false && componentItems.length > 1) {
                extLayout = 'vbox';
                if(item.region.orientation == 'horizontal') {
                    extLayout = 'hbox';
                }
            }
            if(item.region.subregion != "none") {
                items.push(Ext.apply({
                    xtype: 'container',
                    items: componentItems,
                    layout: extLayout
                }, sublayout));
            }
        });
        return items;
    },
    
    getSubRegionCenterItem: function(value) {
        var centerItem = null;
        Ext.Array.each(value, function(item, index) {
            if(item.region.subregion == 'center') {
                centerItem =  item;
            }
        });
        return centerItem;
    },

    createComponents: function(components, region) {
        var componentItems = [];
        var cmpId = null;
        var me = this;

        Ext.Array.each(components, function(component) {
            cmpId = Ext.id();
            var compStyle = {width: '100%',height: '100%'};
            var compFlex = 0;
            if(region.useTabs == false) {
                compStyle = {width: '100%'};
                if(region.orientation == 'horizontal') {
                    compStyle = {height: '100%'};
                }
                compFlex = 1;
            }
            var cmpView = {
                xtype: 'container',
                // Title is used in tabs
                title: component.name,
                cls: 'component-view',
                tpl: '<tpl for="."><div class="viewer-component-block" id="{id}"></div></tpl>',
                data: {
                    id: cmpId,
                    cmp_name: component.name
                },
                layout: 'fit',
                hideMode: 'offsets',
                style: compStyle,
                flex: compFlex
            };
            componentItems.push(cmpView);
            me.componentList.push({
                htmlId: cmpId,
                componentName: component.name,
                componentClass: component.componentClass
            });
            if(component.componentClass == "FlamingoMap") {
                me.mapId = cmpId;
            }
        });

        return componentItems;
    },

    getRegionContent: function(region, componentItems) {
        if(Ext.isDefined(region.useTabs) && region.useTabs && componentItems.length > 1) {
            var cmpId = Ext.id();
            var tabcomponent = {
                xtype: 'tabpanel',
                id: cmpId,
                activeTab: 0,
                deferredRender: false,
                defaults: {
                    hideMode: 'offsets'
                },
                items: componentItems
            };
            return tabcomponent;
        }
        return componentItems;
    },

    renderLayout: function(viewportItems) {
        var me = this;
        Ext.create('Ext.container.Container', {
            layout: 'border',
            items: viewportItems,
            renderTo: me.wrapperId,
            height: '100%',
            width: '100%'
        });
    },

    getMapId: function() {
        return this.mapId;
    },

    getComponentList: function() {
        console.log(this.componentList);
        return this.componentList;
    }
});

var layoutManager = null;
Ext.onReady(function() {
    layoutManager = Ext.create('viewer.LayoutManager', {
        layout: app.layout
    });
});