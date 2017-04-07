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

/* global Ext */

Ext.define('viewer.LayoutManager', {
    defaultRegionSettings: {
        header: {region: 'north', columnOrientation: 'horizontal', useTabs: false, defaultLayout: {height: 150}},
        leftmargin_top: {region:'west', subregion:'center', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {width: 250}},
        leftmargin_bottom: {region:'west', subregion:'south', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {height: 250}},
        left_menu: {region:'center', subregion:'west', columnOrientation: 'horizontal', subRegionOrientation: 'vertical', singleComponentBlock: true, useTabs: false,isPopup:true, defaultLayout: {width: 150}},
        top_menu: {region:'none'},
        content: {region:'center', subregion:'center', columnOrientation: 'horizontal', subRegionOrientation: 'vertical', singleComponentBlock: true, useTabs: false, defaultLayout: {}},
        content_bottom: {region:'none'},
        popupwindow: { region: 'popupwindow', useTabs: true,hasSharedPopup:true },
        rightmargin_top: {region:'east', subregion:'center', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {width: 250}},
        rightmargin_bottom: {region:'east', subregion:'south', columnOrientation: 'vertical', subRegionOrientation: 'vertical', useTabs: true, defaultLayout: {height: 250}},
        footer: {region:'south', columnOrientation: 'horizontal', useTabs: false, defaultLayout: {height: 150}}
    },
    layout: {},
    configuredComponents: {},
    layoutItems: {},
    mapId: '',
    componentList: [],
    wrapperId: 'wrapper',
    autoRender: true,
    tabComponents: {},
    collapsibleComponents: {},
    popupWin: null,
    // container for all floating panels
    floatingPanels: [],
    // components configuration
    componentsConfig: null,

    constructor: function(config, componentsConfig) {
        // Ext.apply(this, config || {});
        // Apply options
        if(config) {
            if(config.layout) {
                this.layout = config.layout;
            }
            if(config.configuredComponents) {
                this.configuredComponents = config.configuredComponents;
            }
            if(config.maxHeight) {
                this.maxHeight = config.maxHeight;
            }
            if(config.wrapperId) {
                this.wrapperId = config.wrapperId;
            }
        }
        this.componentsConfig = componentsConfig;
        if(this.autoRender) {
            this.createLayout();
        }
    },

    createLayout: function() {
        var me = this;
        // console.log('LAYOUTMANAGER: ', me);
        var regionList = me.createRegionList();
        // console.log('REGIONLIST: ', regionList);
        var viewportItems = me.buildLayoutRegions(regionList);
        // console.log('VIEWPORTITEMS: ', viewportItems);
        me.renderLayout(viewportItems);
    },

    filterComponentList: function(components) {
        var me = this;
        var screenWidth = Ext.Element.getViewportWidth();
        var result = Ext.Array.filter(components, function(comp) {
            // Filter out components that do not meet responsive configuration
            var responsiveWidth = me.getRequiredScreenWidth(comp.name);
            if(screenWidth < responsiveWidth) {
                return false;
            }
            return me.configuredComponents[comp.name] != undefined;
        });
        return result;
    },

    getRequiredScreenWidth: function(component) {
        if(!this.componentsConfig.hasOwnProperty(component)) {
            return 0;
        }
        var compConfig = this.componentsConfig[component];
        if(!compConfig.hasOwnProperty("config") || !compConfig.config.hasOwnProperty("requiredScreenWidth")) {
            return 0;
        }
        return compConfig.config.requiredScreenWidth ? compConfig.config.requiredScreenWidth : 0;
    },

    createRegionList: function() {
        var me = this;
        var layoutItems = {};

        Ext.Object.each(me.layout, function(regionid, regionconfig) {
            // If region has components, add it to the list
            if(me.filterComponentList(regionconfig.components).length > 0) {
                // Fetch default config
                var defaultConfig = me.defaultRegionSettings[regionid];
                // Layoutregions are added throug array because 1 Ext region (e.g. west) can have multiple regions
                if(!Ext.isDefined(layoutItems[defaultConfig.region])) {
                    layoutItems[defaultConfig.region] = [];
                }
                // Push the layout to the array
                layoutItems[me.defaultRegionSettings[regionid].region].push({
                    // Region name
                    name: regionid,
                    // regionConfig holds the regionconfig from the layoutmanager
                    regionConfig: regionconfig,
                    // regionDefaultConfig holds the defaultConfig region
                    regionDefaultConfig: defaultConfig
                });
            }
        });
        return layoutItems;
    },

    buildLayoutRegions: function(regionList) {
        var viewportItems = [];
        var me = this;
        Ext.Object.each(regionList, function(region, value) {
            var layoutRegion = me.getLayoutRegion(region, value);
            if(layoutRegion !== null && !me.isEmptyObject(layoutRegion)) {
                viewportItems.push(layoutRegion);
            }
        });
        return viewportItems;
    },
    
    isEmptyObject: function(obj) {
        for(var prop in obj) if(obj.hasOwnProperty(prop)) {
            return false;
        };
        return true;
    },

    getLayoutRegion: function(regionid, regionitems) {
        var me = this;
        var layout = {
            width: 0,
            height: 0
        };
        var regionlayout = null;
        var extLayout = '';

        // Check if left_menu has floating option
        if(regionid === 'center' && regionitems.length > 1) {
            var floatingLeftMenu = false,
                centerItem = null;
            for(var i = 0; i < regionitems.length; i++) {
                // Keep ref to centerItem for later use
                if(regionitems[i].name === 'content') {
                    centerItem = regionitems[i];
                }
                // Check if floating is enabled
                if(regionitems[i].name === 'left_menu' && regionitems[i].regionConfig.layout.enableFloating) {
                    floatingLeftMenu = true;
                    // Create floating region
                    var componentsList = me.filterComponentList(regionitems[i].regionConfig.components);
                    var componentItems = me.createComponents(componentsList, regionitems[i].regionDefaultConfig, regionitems[i].regionConfig.layout, regionitems[i].name);
                    var floatLayout = { width: 58, height: componentsList.length * 46 }; // default
                    if(regionitems[i].regionConfig.layout.width) {
                        floatLayout.width = regionitems[i].regionConfig.layout.width;
                        if(Ext.browser.is.IE && Ext.browser.version.isLessThanOrEqual(9)) {
                            // IE9- needs some extra width to behave the same as modern browsers
                            floatLayout.width = (parseInt(regionitems[i].regionConfig.layout.width, 10) + 5);
                        }
                    }
                    if(regionitems[i].regionConfig.layout.height) {
                        floatLayout.height = regionitems[i].regionConfig.layout.height;
						if(Ext.browser.is.IE && Ext.browser.version.isLessThanOrEqual(9)) {
                            // IE9- needs some extra height to behave the same as modern browsers
                            floatLayout.height = (parseInt(regionitems[i].regionConfig.layout.height, 10) + 3);
                        }
                    }
                    // Create the floating panel
                    me.createFloatingPanel(
                        /*regionLayout=*/{ panelTitle: '' },
                        /*region=*/'center',
                        /*componentItems=*/componentItems,
                        /*layout=*/floatLayout, // default button width/height + padding
                        /*extLayout=*/{ type: 'vbox', align: 'stretch' },
                        /*regionClass=*/'left_menu',
                        /*alignment=*/regionitems[i].regionConfig.layout.floatingPosition
                    );
                    if(regionitems[i].regionConfig.layout.floatingPosition && regionitems[i].regionConfig.layout.floatingPosition.substr(1) !== 'r') {
                        // Add some CSS to move tools to the right place // TODO: Fix this, probably not the right place
                        var css = '.olControlPanel { left: 68px; } .olControlPanWestItemInactive { left: 68px !important; }';
                        Ext.util.CSS.createStyleSheet(css, "floatingmenu");
                    }
                }
            }
            // Left menu is floating, only add centerItem to layout
            if(floatingLeftMenu) {
                regionitems = [ centerItem ];
            }
        }

        if(regionitems.length > 1) {
            var items = me.getSubLayoutRegion(regionitems);
            var centerItem = me.getSubRegionCenterItem(regionitems);
            if(items.length > 0 && centerItem != null) {
                extLayout = { type: 'vbox', align: 'stretch' };
                if(centerItem.regionDefaultConfig.columnOrientation == 'horizontal') extLayout = { type: 'hbox', align: 'stretch' };
                if(regionid != 'center') {
                    layout.width = centerItem.regionDefaultConfig.defaultLayout.width;
                    regionlayout = centerItem.regionConfig.layout;
                    if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                        layout.width = parseInt(regionlayout.width);
                    } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                        layout.flex = parseInt(regionlayout.width) / 100;
                    }
                } else {
                    layout.flex = 1;
                    layout.height = '100%';
                }

                if(regionlayout && regionlayout.hasOwnProperty('enableFloating') && regionlayout.enableFloating) {
                    // Region is set to floating, calculate the height of the components in the centerItem
                    var centerComponentsHeight = this.getComponentsHeight(me.filterComponentList(centerItem.regionConfig.components));
                    // If height is set for all components centerComponentsHeight will be set
                    if(centerComponentsHeight) {
                        // Add the height of the subregions to compute total height
                        layout.height = centerComponentsHeight + me.getSubRegionsHeight(items);
                    }
                    // Create and return the floating panel
                    return me.createFloatingPanel(regionlayout, centerItem.regionDefaultConfig.region, items, layout, extLayout);
                }
                layout = Ext.apply(layout, this.getCollapseConfig(regionlayout, centerItem.regionDefaultConfig.columnOrientation,items));
                return Ext.apply({
                    xtype: 'container',
                    region: regionid,
                    layout: extLayout,
                    items: items
                }, layout);
            }
        } else {
            regionlayout = regionitems[0].regionConfig.layout;
            var componentsList = me.filterComponentList(regionitems[0].regionConfig.components);
            var componentItems = me.createComponents(componentsList, regionitems[0].regionDefaultConfig, regionlayout,regionitems[0].name);
            componentItems = me.getRegionContent(componentItems, regionlayout);
            if(regionitems[0].regionDefaultConfig.region != "none" && regionitems[0].regionDefaultConfig.region != "popupwindow") {
                layout = regionitems[0].regionDefaultConfig.defaultLayout;
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

                extLayout = 'fit';
                if(regionlayout.useTabs == false && componentItems.length > 1 && !Ext.isDefined(regionitems[0].regionDefaultConfig.singleComponentBlock) && !regionitems[0].regionDefaultConfig.singleComponentBlock) {
                    extLayout = { type: 'vbox', align: 'stretch' };
                    if(regionitems[0].regionDefaultConfig.columnOrientation == 'horizontal') {
                        extLayout = { type: 'hbox', align: 'stretch' };
                    }
                }
                var style = {};
                if(regionlayout.bgcolor != '') {
                    style = {
                        backgroundColor: regionlayout.bgcolor
                    };
                }

                if(regionlayout && regionlayout.hasOwnProperty('enableFloating') && regionlayout.enableFloating) {
                    // Region is set to floating, calculate the height of the components in the centerItem
                    layout.height = this.getComponentsHeight(componentsList);
                    // Create and return the floating panel
                    return me.createFloatingPanel(regionlayout, regionitems[0].regionDefaultConfig.region, componentItems, layout, extLayout);
                }

                layout = Ext.apply(layout, this.getCollapseConfig(regionlayout, regionitems[0].regionDefaultConfig.columnOrientation,componentItems));
                return Ext.apply({
                    xtype: 'container',
                    region: regionid,
                    layout: extLayout,
                    items: componentItems,
                    style: style,
                    cls: 'layout-' + regionitems[0].name
                }, layout);
            } else if(regionitems[0].regionDefaultConfig.region == "popupwindow") {

                var width = 400;
                if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                    width = parseInt(regionlayout.width);
                } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                    width = '' + parseInt(regionlayout.width) + '%';
                }
                var height = 400;
                if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                    height = parseInt(regionlayout.height);
                } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                    height = '' + parseInt(regionlayout.height) + '%';
                }
                var popupLayout = 'fit';
                if(regionlayout.useTabs == false && componentItems.length > 1) {
                    popupLayout = { type: 'hbox', align: 'stretch' };
                }

                var title = ' ';
                if(regionlayout.title && regionlayout.title != '') {
                    title = regionlayout.title;
                }

                var posx = 0,
                    posy = 0,
                    position = 'center';
                if(regionlayout.posx && regionlayout.posy && regionlayout.posx != '' && regionlayout.posy != '') {
                    posx = regionlayout.posx;
                    posy = regionlayout.posy;
                    position = 'fixed';
                }

                var popupWindowConfig = {
                   title: title,
                   showOnStartup:false,
                   details:{
                        closable: true,
                        closeAction: 'hide',
                        hideMode: 'offsets',
                        width: width,
                        height: height,
                        resizable: true,
                        draggable: true,
                        layout: popupLayout,
                        modal: false,
                        renderTo: Ext.getBody(),
                        autoScroll: true,
                        items: componentItems,
                        x: posx,
                        y: posy,
                        position: position
                    }
                };
                me.popupWin = Ext.create('viewer.components.ScreenPopup', popupWindowConfig);
            }
        }
        return null;
    },

    /**
     * Helper function to compute the height of subregions
     * This will be the total of the heights set in the viewer-admin layoutmanager
     * or the default heights
     */
    getSubRegionsHeight: function(regions) {
        var totalHeight = 0;
        Ext.Array.each(regions, function(item, region) {
            if(region !== 'center') {
                if(item.height) totalHeight += item.height;
            };
        });
        return totalHeight;
    },

    /**
     * Create a floating panel. Returns an empty object so the Layout manager will
     * skip rendering (since it is rendered directly)
     *
     * @param regionLayout      The layout config object for the panel
     * @param region            The border-layout region. Used for aligning panel left or right
     * @param componentItems    The items which will be placed inside the panel
     * @param layout            The layout (width and height) from the layoutmanager
     * @param extLayout         The Ext.Layout type (vbox or hbox)
     */
    createFloatingPanel: function(regionLayout, region, componentItems, layout, extLayout, regionClass, extAlignment) {
        // Determine alignment based on region
        var alignment = region === 'west' ?
                            'left' :
                            region === 'center' ?
                                'center' :
                                'right';
        // popupwindow config
        var windowPadding = 12;
        var config = {
            cls: regionClass ? 'floating-window floating-' + regionClass : 'floating-window',
            title: regionLayout.hasOwnProperty('panelTitle') ? regionLayout.panelTitle : '',
            autoShow: true,
            closable: false,
            width: layout.width,
            height: layout.height ? (layout.height + windowPadding) : '90%', // we are adding 12 px to account for borders and margins of the window
            resizable: false,
            draggable: false,
            layout: extLayout,
            modal: false,
            renderTo: Ext.getBody(),
            autoScroll: true,
            items: componentItems,
            minWidth: layout.width,
            floating: true
        };
        // Create a window to act as floating panel
        var popupWindow = Ext.create('Ext.window.Window', config);
        // Save panels in store so they can be re-aligned when resizing the screen
        var floatingPanel = {
            window: popupWindow,
            alignment: alignment,
            extAlignment: extAlignment
        };
        this.floatingPanels.push(floatingPanel);
        // Align the floating panel to the left or right of the screen
        this.alignFloatingPanel(floatingPanel);
        // Return empty object
        return {};
    },

    processCollapsibleItems:function (items, id){
        if(items.items){
            this.processCollapsibleItems(items.items,id);
        }
        for(var i = 0 ;i < items.length ;i++){
            if(items[i].items){
                this.processCollapsibleItems(items[i].items, id);
            }else{
                this.collapsibleComponents[items[i].data.cmp_name] = id;
            }
        }
    },
    
    getCollapseConfig: function(regionLayout, columnOrientation, items) {
        var me = this;
        if(columnOrientation === 'vertical' && regionLayout.hasOwnProperty('enableCollapse') && regionLayout.enableCollapse) {
            var id = Ext.id();
            this.processCollapsibleItems(items,id);
            return {
                xtype: 'panel',
                border: 0,
                collapsible: true,
                id: id,
                animCollapse: false,
                title: regionLayout.hasOwnProperty('panelTitle') ? regionLayout.panelTitle : '',
                collapsed: regionLayout.hasOwnProperty('defaultCollapsed') && regionLayout.defaultCollapsed,
                hideMode: 'offsets',
                listeners: {
                    collapse: function() {
                        me.resizeLayout();
                    },
                    expand: function() {
                        me.resizeLayout();
                    }
                }
            };
        }
        return {};
    },

    getSubLayoutRegion: function(regionitems) {
        var me = this;
        var items = {};
        Ext.Array.each(regionitems, function(item, index) {
            var sublayout = {};
            var regionlayout = item.regionConfig.layout;
            var componentItems = me.createComponents(me.filterComponentList(item.regionConfig.components), item.regionDefaultConfig, regionlayout,item.name);
            componentItems = me.getRegionContent(componentItems, regionlayout);
            if(item.regionDefaultConfig.columnOrientation == 'vertical') {
                if(item.regionDefaultConfig.subregion != 'center') {
                    sublayout = Ext.apply({
                        width: 0
                    }, item.regionDefaultConfig.defaultLayout);
                    if(regionlayout.height != '' && regionlayout.heightmeasure == 'px') {
                        sublayout.height = parseInt(regionlayout.height);
                    } else if(regionlayout.height != '' && regionlayout.heightmeasure == '%') {
                        sublayout.flex = parseInt(regionlayout.height) / 100;
                    }
                } else {
                    sublayout.flex = 1;
                }
            }
            if(item.regionDefaultConfig.columnOrientation == 'horizontal') {
                if(item.regionDefaultConfig.subregion != 'center') {
                    sublayout = Ext.apply({
                        height: 0
                    }, item.regionDefaultConfig.defaultLayout);
                    if(regionlayout.width != '' && regionlayout.widthmeasure == 'px') {
                        sublayout.width = parseInt(regionlayout.width);
                    } else if(regionlayout.width != '' && regionlayout.widthmeasure == '%') {
                        sublayout.flex = parseInt(regionlayout.width) / 100;
                    }
                } else {
                    sublayout.flex = 1;
                }
            }

            var extLayout = 'fit';
            if(regionlayout.useTabs == false && componentItems.length > 1 && !Ext.isDefined(item.regionDefaultConfig.singleComponentBlock) && !item.regionDefaultConfig.singleComponentBlock) {
                extLayout = { type: 'vbox', align: 'stretch' };
                if(item.regionDefaultConfig.subRegionOrientation == 'horizontal') {
                    extLayout = { type: 'hbox', align: 'stretch' };
                }
            }
            var style = {};
            if(regionlayout.bgcolor != '') {
                style = {
                    backgroundColor: regionlayout.bgcolor
                };
            }
            if(item.regionDefaultConfig.subregion != "none") {
                items[item.regionDefaultConfig.subregion] = Ext.apply({
                    xtype: 'container',
                    items: componentItems,
                    layout: extLayout,
                    style: style,
                    cls: 'layout-' + item.name
                }, sublayout);
            }
        });
        return me.reorderSubRegions(items);
    },

    reorderSubRegions: function(subregions) {
        var order = ['north','west','center','east','south'];
        var items = [];
        Ext.Array.each(order, function(regionname) {
            if(Ext.isDefined(subregions[regionname])) {
                items.push(subregions[regionname]);
            }
        });
        return items;
    },

    getSubRegionCenterItem: function(regionitems) {
        var centerItem = null;
        Ext.Array.each(regionitems, function(item, index) {
            if(item.regionDefaultConfig.subregion == 'center') {
                centerItem =  item;
            }
        });
        return centerItem;
    },

    /**
     * Compute the total height of components in a region. Used for floating panels.
     * It is required that a height for all components is set otherwise the floating
     * panel will have a default height.
     * When not all heights are set this will return 0
     */
    getComponentsHeight: function(components) {
        var setComponents = 0, totalHeight = 0, me = this;
        Ext.Array.each(components, function(component) {
            if(
                me.componentsConfig.hasOwnProperty(component.name) &&
                me.componentsConfig[component.name].hasOwnProperty('config') &&
                me.componentsConfig[component.name].config.hasOwnProperty('componentHeight')
            ) {
                totalHeight += parseInt(me.componentsConfig[component.name].config.componentHeight, 10);
                setComponents++;
            }
        });
        return (setComponents === components.length ? totalHeight : 0);
    },

    createComponents: function(components, regionDefaultConfig, regionlayout,regionName) {
        var componentItems = [];
        var cmpId = null;
        var me = this;
        var first = true;
        var singleBlock = (Ext.isDefined(regionDefaultConfig.singleComponentBlock) && regionDefaultConfig.singleComponentBlock);

        Ext.Array.each(components, function(component) {
            if(!singleBlock || (singleBlock && first)) {
                cmpId = Ext.id();
            }
            var compStyle = {width: '100%',height: '100%'};
            var compFlex = 0;
            if(regionlayout.useTabs == false && !singleBlock) {
                compStyle = {width: '100%'};
                if(Ext.isDefined(regionDefaultConfig.subRegionOrientation)) {
                    if(regionDefaultConfig.subRegionOrientation == 'horizontal') {
                        compStyle = {height: '100%'};
                    }
                } else {
                    if(regionDefaultConfig.columnOrientation == 'horizontal') {
                        compStyle = {height: '100%'};
                    }
                }
                compFlex = 1;
                // If a height is set in the viewer admin then the component will have a fixed height, otherwise flex
                if(me.componentsConfig.hasOwnProperty(component.name) && me.componentsConfig[component.name].config.hasOwnProperty('componentHeight') && me.componentsConfig[component.name].config.componentHeight !== null) {
                    compFlex = 0;
                    compStyle.height = parseInt(me.componentsConfig[component.name].config.componentHeight, 10) + 'px';
                }
            }
            var containerId = Ext.id();
            var cmpView = {
                xtype: 'container',
                id: containerId,
                // Title is used in tabs
                title: component.name,
                cls: 'component-view',
                tpl: '<tpl for="."><div class="viewer-component-block" id="{id}" style="width: 100%;height: 100%;margin: 0px;padding: 0px;"></div></tpl>',
                data: {
                    id: cmpId,
                    cmp_name: component.name
                },
                layout: 'fit',
                hideMode: 'offsets',
                style: compStyle,
                flex: compFlex
            };
            if(!singleBlock || (singleBlock && first)) {
                componentItems.push(cmpView);
            }

            var componentItem = {
                htmlId: cmpId,
                containerId: containerId,
                componentName: component.name,
                componentClass: component.componentClass
            };
            if(regionDefaultConfig.isPopup) {
                componentItem.isPopup = true;
            }
            if(regionDefaultConfig.showOnStartup) {
                componentItem.showOnStartup = true;
            }
            if(regionDefaultConfig.hasSharedPopup) {
                componentItem.hasSharedPopup = true;
            }
            if(regionName){
                componentItem.regionName=regionName;
            }
            me.componentList.push(componentItem);
            if(component.componentClass == "viewer.mapcomponents.FlamingoMap" || component.componentClass == "viewer.mapcomponents.OpenLayersMap") {
                me.mapId = cmpId;
            }
            first = false;
        });

        return componentItems;
    },

    getRegionContent: function(componentItems, regionlayout) {
        var me = this;
        if(Ext.isDefined(regionlayout.useTabs) && regionlayout.useTabs && componentItems.length > 1) {
            var cmpId = Ext.id();
            Ext.Array.each(componentItems, function(component, index) {
                me.tabComponents[component.data.cmp_name] = {
                    tabId: cmpId,
                    tabNo: index
                }
            });
            var tabBarLayout = {};
            if(regionlayout.bgcolor != '') {
                tabBarLayout = {
                    style: {
                        backgroundColor: regionlayout.bgcolor,
                        backgroundImage: 'none' // Otherwise backgroundcolor is overridden by image
                    }
                };
            }
            var tabcomponent = {
                xtype: 'tabpanel',
                id: cmpId,
                activeTab: 0,
                deferredRender: false,
                defaults: {
                    hideMode: 'offsets'
                },
                items: componentItems,
                tabBar: tabBarLayout
            };
            return tabcomponent;
        }
        return componentItems;
    },

    renderLayout: function(viewportItems) {
        var me = this;
        var containerStyle = {};
        if(Ext.isIE8 && me.maxHeight && me.maxHeight !== null) {
            // maxHeight is needed for IE8 bug where maxHeight on wrapper only does not work
            containerStyle = {
                maxHeight: me.maxHeight
            };
        }
        me.mainLayoutContainer = Ext.create('Ext.container.Container', {
            layout: 'border',
            items: viewportItems,
            renderTo: me.wrapperId,
            height: me.getContainerheight(),
            width: '100%',
            style: containerStyle
        });
        me.afterLayout();
    },
    
    afterLayout: function() {
        var me = this;
        Ext.Array.each(me.floatingPanels, function(panel) {
            me.alignFloatingPanel(panel);
        });
    },

    getContainerheight: function() {
        var me = this, containerHeight = '100%';
        if(Ext.isWebKit && Ext.webKitVersion < 530) {
            // There is a bug in webkit which allows the inner div to extend further than the max-height of the wrapper div
            // Seems to be fixed in future Chrome versions (https://bugs.webkit.org/show_bug.cgi?id=26559) so remove this fix when possible
            // solved in versions > 537.22
            var wrapperHeight = Ext.get(me.wrapperId).getHeight();
            if(wrapperHeight >= me.maxHeight) {
                containerHeight = me.maxHeight + 'px';
            }
        }
        return containerHeight;
    },

    getMapId: function() {
        return this.mapId;
    },

    getWrapperId: function() {
        return this.wrapperId;
    },

    getComponentList: function() {
        return this.componentList;
    },

    setTabTitle: function(componentId, title) {
        // Not sure if this works, don't know for sure how to set a tab title
        var me = this;
        if(me.isTabComponent(componentId)) {
            Ext.getCmp(me.tabComponents[componentId].tabId).tabBar.items.getAt(me.tabComponents[componentId].tabNo).setText(title);
        }
    },
    
    showTabComponent: function(componentId) {
        if(!this.isTabComponent(componentId)) {
            return;
        }
        Ext.getCmp(this.tabComponents[componentId].tabId).setActiveTab(this.tabComponents[componentId].tabNo);
    },
    
    expandRegion: function(componentId) {
        if(!this.collapsibleComponents[componentId]){
            if(!this.isTabComponent(componentId)) {
                return;
            }else{
                Ext.getCmp(this.tabComponents[componentId].tabId).ownerCt.expand();
            }
        }else{
            Ext.getCmp(this.collapsibleComponents[componentId]).expand();
        }
    },

    isTabComponent: function(componentId) {
        var me = this;
        return Ext.isDefined(me.tabComponents[componentId]);
    },

    showStartupPopup: function() {
        this.popupWin.show();
    },

    hideStartupPopup: function() {
        this.popupWin.hide();
    },

    alignFloatingPanel: function(panel) {
        // Default alignment = top-left
        var extAlignment = 'tl';
        // Default parent = body
        var alignmentParent = Ext.getBody();
        // Default position = 10, 10
        var extAlignmentPos = [10, 10];
        // Special settings for right alignment
        if(panel.alignment === 'right') {
            extAlignment = 'tr';
        }
        // Special settings for center alignment
        if(panel.alignment === 'center') {
            var centerpart = Ext.select('.layout-content');
            if(centerpart.elements.length !== 0) {
                alignmentParent = centerpart.elements[0];
            }
            extAlignmentPos = [5, 5];
        }
        // Direct setting of extAlignment
        if(panel.extAlignment) {
            extAlignment = panel.extAlignment;
        }
        // If right aligned, first pos needs to be negative
        if(extAlignment.substr(1) === 'r') {
            extAlignmentPos[0] = extAlignmentPos[0] * -1;
        }
        // Align panel
        panel.window.alignTo(alignmentParent, [extAlignment, extAlignment].join('-'), extAlignmentPos);
    },

    resizeLayout: function(continueFunction) {
        var me = this;
        if(!me.mainLayoutContainer) {
            return;
        }
        if(Ext.isWebKit) {
            // Webkit bug
            me.mainLayoutContainer.setHeight(me.getContainerheight());
        }
        me.mainLayoutContainer.updateLayout();
        // Re-align floating panels so they do not fall off-screen
        Ext.Array.each(me.floatingPanels, function(panel) {
            me.alignFloatingPanel(panel);
        });
        setTimeout(function(){
            if(continueFunction){
                continueFunction();
                return;
            }
            FlamingoAppLoader.get("viewerController").resizeComponents(false);
        },200);
    }
});
