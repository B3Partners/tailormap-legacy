/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

Ext.Loader.setConfig({
    enabled:true
});
Ext.Loader.setPath('Ext.ux', uxpath);
Ext.require([
    'Ext.container.*',
    'Ext.view.*',
    'Ext.data.*',
    'Ext.dd.*',
    'Ext.layout.*',
    'Ext.window',
    'Ext.ux.BoxReorderer'
]);
Ext.define("DraggableViewerComponent",{
    extend: "Ext.data.Model",
    idProperty: 'id',       
    fields: [
        {name: 'className', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'shortName', type: 'string'},
        {name: 'restrictions', type: 'auto'},
        {name: 'singleton', type: 'boolean'},
        {name: 'notInCombinationWith', type: 'auto'}
    ]
});
Ext.define('LayoutRegion', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        {name: 'id', type: 'string'},
        {name: 'htmlId', type: 'string'},
        {name: 'useShortName', type: 'boolean'},
        {name: 'floatComponents', type: 'boolean'},
        {name: 'addedComponents', type: 'auto'},
        {name: 'width', type: 'string', defaultValue:''},
        {name: 'widthmeasure', type: 'string', defaultValue:'px'},
        {name: 'maxwidth', type: 'string', defaultValue:''},
        {name: 'height', type: 'string', defaultValue:''},
        {name: 'heightmeasure', type: 'string', defaultValue:'px'},
        {name: 'maxheight', type: 'string', defaultValue:''},
        {name: 'configureCollapsible', type: 'boolean', defaultValue: false}
    ],
    isComponentAdded: function(compid) {
        var isAdded = false;
        Ext.Array.each(this.get('addedComponents'), function(comp, index) {
            if(comp.componentClass === compid) {
                isAdded = true;
            }
        });
        return isAdded;
    }
});
Ext.define('LayoutManager', {
    objectBeingConfigured: null,
    layoutRegions: [
        {id:'header', htmlId:'layout_header', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]},
        {id:'leftmargin_top', htmlId:'layout_left_top', useShortName:false, floatComponents: false, configureHeight: false, configureWidth: true, configureTabs: true, addedComponents:[], configureCollapsible: true, configureFloating: true},
        {id:'leftmargin_bottom', htmlId:'layout_left_bottom', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]},
        {id:'left_menu', htmlId:'layout_left_menu', useShortName:true, floatComponents: false, configureHeight: false, configureWidth: true, addedComponents:[], configureFloating: true, configureFloatingPosition: true },
        {id:'top_menu', htmlId:'layout_top_menu', useShortName:true, floatComponents: true, configureHeight: true, configureWidth: false, addedComponents:[]},
        {id:'content', htmlId:'layout_content', useShortName:false, floatComponents: false, configureHeight: false, configureWidth: false, addedComponents:[], titleOverride: 'Map' },
        {id:'content_bottom', htmlId:'layout_content_bottom', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, addedComponents:[], titleOverride: 'Map bottom'},
        {id:'popupwindow', htmlId:'layout_popupwindow', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: true, configureTabs: true, configureTitle: true, configurePosition: true, addedComponents:[]},
        {id:'rightmargin_top', htmlId:'layout_right_top', useShortName:false, floatComponents: false, configureHeight: false, configureWidth: true, configureTabs: true, addedComponents:[], configureCollapsible: true, configureFloating: true},
        {id:'rightmargin_bottom', htmlId:'layout_right_bottom', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]},
        {id:'footer', htmlId:'layout_footer', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]}
    ],
    layoutRegionsStore: null,
    popupWin: null,
    tooltips: {},
    configWindows: {},
    config: {
        layoutJson: {},
        globalLayout: {},
        components: [],
        layoutSaveUrl: '',
        configPageLink: '',
        removeComponentUrl: ''
    },
    constructor: function(config) {
        this.initConfig(config);

        this.layoutRegionsStore = Ext.create('Ext.data.Store', {
            model: 'LayoutRegion',
            data: this.layoutRegions
        });
        
        this.initRegions();
        this.initGlobalLayout();
        this.createToolbox();
        
        var me = this;
        Ext.get('savebutton').on('click', function() {
            me.saveLayout();
        });
        
        this.popupWin = Ext.create('Ext.window.Window', {
            title: 'Configuratie',
            closable: true,
            closeAction: 'hide',
            width: 800,
            height: 680,
            layout: 'fit',
            modal: true,
            contentEl: 'configPage',
            resizable: false,
            listeners: {
                hide: function() {
                    if(Ext.isIE8) {
                        // IE8 still showed HTML editor iframe after closing window so we manually hide the HTML editor
                        var iframe = Ext.get('configPage');
                        if(iframe && iframe.dom && iframe.dom.contentWindow && iframe.dom.contentWindow.customConfiguration && iframe.dom.contentWindow.customConfiguration.windowHide) {
                            iframe.dom.contentWindow.customConfiguration.windowHide();
                        }
                    }
                }
            }
        });
        
        this.initTooltips();
    },
    
    initRegions: function() {
        var me = this;
        this.layoutRegionsStore.each(function(layoutRegion) {
            // TODO: make this better
            var layoutRegionElement = Ext.get(layoutRegion.get('htmlId'));
            if(layoutRegionElement) {
                var layoutRegionConfigHtml = '';
                var hasLayoutConfiguration = false;
                if(layoutRegion.get('configureWidth')) {
                    hasLayoutConfiguration = true;
                    layoutRegionConfigHtml += me.getWidthHeightHtml(layoutRegion.get('id'), 'width');
                }
                if(layoutRegion.get('configureHeight') || layoutRegion.get('configureFloating')) {
                    hasLayoutConfiguration = true;
                    layoutRegionConfigHtml += me.getWidthHeightHtml(layoutRegion.get('id'), 'height');
                }
                if(layoutRegion.get('configureTabs')) {
                    layoutRegionConfigHtml += '<div class="tabsconfig">' + 
                                                    'Gebruik tabs bij meerdere componenten: ' + 
                                                    '<input type="checkbox" id="' + layoutRegion.get('id') + '_useTabs" />' + 
                                                '</div>';
                }
                if(layoutRegion.get('configureCollapsible')) {
                    layoutRegionConfigHtml += '<div class="tabsconfig">' +
                                                    'Balk in/uit kunnen klappen : ' +
                                                    '<input type="checkbox" id="' + layoutRegion.get('id') + '_enableCollapse" />' +
                                                '</div>';
                    layoutRegionConfigHtml += '<div class="tabsconfig" style="display: none;" id="' + layoutRegion.get('id') + '_default_collapse_setting">' +
                                                    'Balk standaard ingeklapt : ' +
                                                    '<input type="checkbox" id="' + layoutRegion.get('id') + '_defaultCollapsed" />' +
                                                '</div>';
                }
                if(layoutRegion.get('configureFloating')) {
                    layoutRegionConfigHtml += '<div class="tabsconfig">' +
                                                    'Maak balk zwevend : ' +
                                                    '<input type="checkbox" id="' + layoutRegion.get('id') + '_enableFloating" />' +
                                                '</div>';
                }
                if(layoutRegion.get('configureFloatingPosition')) {
                    layoutRegionConfigHtml += '<div class="tabsconfig">' +
                                                    'Positie zwevende balk : ' +
                                                    '<select id="' + layoutRegion.get('id') + '_floatingPosition"><option value="tl">Links-boven</option><option value="bl">Links-onder</option><option value="tr">Rechts-boven</option><option value="br">Rechts-onder</option></select>' +
                                                '</div>';
                }
                if(layoutRegion.get('configureCollapsible') || layoutRegion.get('configureFloating')) {
                    layoutRegionConfigHtml += '<div class="tabsconfig">' +
                                                    'Titel in/uitklapbare balk / zwevend paneel : ' +
                                                    '<input type="text" id="' + layoutRegion.get('id') + '_panelTitle" style="width: 100%;" />' +
                                              '</div>';
                }
                if(layoutRegion.get('configurePosition')) {
                    layoutRegionConfigHtml +=   '<div class="tabsconfig">' + 
                                                'Startpositie (leeg = gecentreerd):<br />' + 
                                                'x: <input type="text" id="' + layoutRegion.get('id') + '_posx" /> ' + 
                                                'y: <input type="text" id="' + layoutRegion.get('id') + '_posy" />' + 
                                            '</div>';
                }
                if(layoutRegion.get('configureTitle')) {
                    layoutRegionConfigHtml +=   '<div class="tabsconfig" style="clear: left;">' + 
                                                'Popup titel: ' + 
                                                '<input type="text" id="' + layoutRegion.get('id') + '_title" style="width: 100%;" />' + 
                                            '</div>';
                }
                layoutRegionConfigHtml +=   '<div class="tabsconfig">' + 
                                                '<div style="float: left;">Achtergrondkleur:</div>' + 
                                                '<div style="float: left; clear: left; width: 90px;"><input type="text" id="' + layoutRegion.get('id') + '_bgcolor" style="width: 60px; float: left;" /><div id="colorpicker_' + layoutRegion.get('id') + '_bgcolor" style="float: left;"></div></div>' + 
                                            '</div>';
                                        
                var layoutRegionTitle = layoutRegion.get('titleOverride') || me.changeCaseFirstLetter(layoutRegion.get('id').replace('_', ' '), false);
                layoutRegionElement.insertHtml('beforeEnd',
                    '<div class="layout_title">' +
                        '<strong class="layoutregion_title">' + layoutRegionTitle + '</strong><br />' + 
                        '<div class="regionconfig" id="regionconfig_' + layoutRegion.get('id') + '">' + 
                            '<u>Visuele configuratie</u><br />' + 
                            layoutRegionConfigHtml +
                        '</div>' + 
                        '<div style="clear: both;"></div>' + 
                     '</div>', true
                );
                if(hasLayoutConfiguration) {
                    layoutRegionElement.child('.layout_title').child('.layoutregion_title').on('click', function(event, obj) {
                        if(!me.configWindows.hasOwnProperty(layoutRegion.get('id'))) {
                            me.configWindows[layoutRegion.get('id')] = Ext.create('Ext.window.Window', {
                                title: 'Configuratie ' + layoutRegionTitle,
                                closable: true,
                                closeAction: 'hide',
                                width: 400,
                                height: 400,
                                layout: 'fit',
                                modal: true,
                                contentEl: 'regionconfig_' + layoutRegion.get('id'),
                                resizable: false,
                                bodyPadding: 10,
                                fbar: [
                                    { type: 'button', text: 'Opslaan', handler: function() { me.configWindows[layoutRegion.get('id')].hide(); } }
                                ]
                            });
                        }
                        me.configWindows[layoutRegion.get('id')].show();
                        Ext.get('regionconfig_' + layoutRegion.get('id')).setVisible(true);
                    });
                }
                layoutRegionElement.child('.layout_title').child('.regionconfig').setVisibilityMode(2).setVisible(false);
            }
            var layout = {
                type: 'vbox',
                align: 'stretch'
            };
            var styleConfig = {
                width: '100%',
                minHeight: '25px'
            };
            var renderTo = layoutRegion.get('htmlId');
            if(layoutRegion.get('floatComponents')) {
                layout = {
                    type: 'hbox'
                };
                styleConfig.height = '50px';
                // styleConfig.overflow = 'auto';
                // Add wrapper element for scrolling
                /* renderTo = Ext.id();
                layoutRegionElement.insertHtml('beforeEnd',
                    '<div id="' + renderTo + '" class="floatwrapper">' +
                    '</div>', true
                    ); */
            }
            var regionContainer = Ext.create('Ext.container.Container', {
                cls: 'component-container',
                layout: layout,
                style: styleConfig,
                height: layoutRegion.get('floatComponents') ? 50 : undefined,
                defaults: {
                    reorderable: true
                },
                autoScroll: layoutRegion.get('floatComponents'),
                renderTo: renderTo,
                plugins : Ext.create('Ext.ux.BoxReorderer',{
                    listeners: {
                        changeindex: function(boxReorderer, container) {
                            me.resetWidthHeight(container, layoutRegion.get('floatComponents'));
                        },
                        drop: function(boxReorderer, container) {
                            // After each reorder: add components in right order
                            // to region
                            var addedComponents = [];
                            container.items.each(function(item) {
                                addedComponents.push({
                                    "componentClass": item.componentClass,
                                    "name": item.componentName
                                });
                            });
                            layoutRegion.set('addedComponents', addedComponents);
                            me.resetWidthHeight(container, layoutRegion.get('floatComponents'));
                        }
                    }
                }),
                listeners: {
                    render: function(c) {
                        c.dropZone = Ext.create('Ext.dd.DropZone', c.getEl(), {
                            getTargetFromEvent: function(e) {
                                return e.getTarget('.content-container');
                            },
                            onNodeEnter : function(target, dd, e, data){
                                Ext.get(target).addCls('content-container-hover');
                            },
                            onNodeOut : function(target, dd, e, data){
                                Ext.get(target).removeCls('content-container-hover');
                            },
                            onNodeOver : function(target, dd, e, data){
                                if(me.checkDropAllowed(layoutRegion, data)) {
                                    return Ext.dd.DropZone.prototype.dropAllowed;
                                }
                                return Ext.dd.DropZone.prototype.dropNotAllowed;
                            },
                            onNodeDrop : function(target, dd, e, data){
                                if(me.checkDropAllowed(layoutRegion, data)) {
                                    me.addComponentToRegion(c, data, layoutRegion, /*createTooltip=*/true);
                                    return true;
                                }
                                return false;
                            }
                        });
                    }
                }
            });
            layoutRegion.regionContainer = regionContainer;
            var regionId = layoutRegion.get('id');
            if(Ext.isDefined(me.config.layoutJson[regionId]) && Ext.isDefined(me.config.layoutJson[regionId]['layout'])) {
                // Apply config
                if(layoutRegion.get('configureWidth')) {
                    me.applyConfig(regionId, 'width');
                }
                if(layoutRegion.get('configureHeight') || layoutRegion.get('configureFloating')) {
                    me.applyConfig(regionId, 'height');
                }
                if(layoutRegion.get('configureTabs')) {
                    var checked = false;
                    if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['useTabs'])) {
                        checked = me.config.layoutJson[regionId]['layout']['useTabs'];
                    }
                    Ext.get(regionId + '_useTabs').dom.checked = checked;
                }
                if(layoutRegion.get('configureTitle')) {
                    var title = '';
                    if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['title'])) {
                        bgcolor = me.config.layoutJson[regionId]['layout']['title'];
                    }
                    Ext.get(regionId + '_title').set({
                        value: title
                    });
                }
                if(layoutRegion.get('configurePosition')) {
                    Ext.get(regionId + '_posx').set({
                        value:(me.config.layoutJson[regionId]['layout']['posx'] || '')
                    });
                    Ext.get(regionId + '_posy').set({
                        value:(me.config.layoutJson[regionId]['layout']['posy'] || '')
                    });
                }
                if(layoutRegion.get('configureFloating')) {
                    var floatingChecked = false;
                    if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['enableFloating']) && me.config.layoutJson[regionId]['layout']['enableFloating']) {
                        floatingChecked = me.config.layoutJson[regionId]['layout']['enableFloating'];
                    }
                    var enableFloatingCheck = Ext.get(regionId + '_enableFloating');
                    enableFloatingCheck.dom.checked = floatingChecked;
                    if(!layoutRegion.get('configureHeight')) {
                        var heightconfig = document.getElementById(regionId + '_height_container');
                        if(!floatingChecked) {
                            heightconfig.style.display = 'none';
                        }
                        enableFloatingCheck.on('click', function() {
                            heightconfig.style.display = enableFloatingCheck.dom.checked ? 'block' : 'none';
                        });
                    }
                }
                if(layoutRegion.get('configureFloatingPosition')) {
                    var floatingPosition = 'tl';
                    if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['floatingPosition'])) {
                        floatingPosition = me.config.layoutJson[regionId]['layout']['floatingPosition'];
                    }
                    document.getElementById(regionId + '_floatingPosition').value = floatingPosition;
                }
                if(layoutRegion.get('configureCollapsible')) {
                    var collapseChecked = false;
                    var defaultCollapsed = false;
                    if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['enableCollapse']) && me.config.layoutJson[regionId]['layout']['enableCollapse']) {
                        collapseChecked = me.config.layoutJson[regionId]['layout']['enableCollapse'];
                    }
                    if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['defaultCollapsed']) && me.config.layoutJson[regionId]['layout']['defaultCollapsed']) {
                        defaultCollapsed = me.config.layoutJson[regionId]['layout']['defaultCollapsed'];
                    }
                    var enableCollapseCheckbox = Ext.get(regionId + '_enableCollapse');
                    var defaultCollapseContainer = Ext.get(regionId + '_default_collapse_setting');
                    enableCollapseCheckbox.dom.checked = collapseChecked;
                    enableCollapseCheckbox.on('click', function() {
                        defaultCollapseContainer.dom.style.display = enableCollapseCheckbox.dom.checked ? 'block' : 'none';
                    });
                    if(collapseChecked) {
                        defaultCollapseContainer.dom.style.display = 'block';
                        Ext.fly(regionId + '_defaultCollapsed').dom.checked = defaultCollapsed;
                    }
                }
                if(layoutRegion.get('configureCollapsible') || layoutRegion.get('configureFloating')) {
                    Ext.fly(regionId + '_panelTitle').set({
                        value:(me.config.layoutJson[regionId]['layout']['panelTitle'] || '')
                    });
                }
                var bgcolor = '';
                if(Ext.isDefined(me.config.layoutJson[regionId]['layout']['bgcolor'])) {
                    bgcolor = me.config.layoutJson[regionId]['layout']['bgcolor'];
                }
                Ext.get(regionId + '_bgcolor').set({
                    value: bgcolor
                });
                var openOnLeft = false;
                var openOnTop = false;
                if(regionId === 'rightmargin_top' || regionId === 'rightmargin_bottom') openOnLeft = true;
                if(regionId === 'footer') openOnTop = true;
                Ext.create('Ext.ux.b3p.ColorPickerButton', {
                    startColor: bgcolor,
                    renderTo: 'colorpicker_' + regionId + '_bgcolor',
                    textfield: regionId + '_bgcolor',
                    openOnLeft: openOnLeft,
                    openOnTop: openOnTop
                });
            }
        });
        
        Ext.on('resize', function() {
            me.layoutRegionsStore.each(function(region) {
                me.resetWidthHeight(region.regionContainer, region.get('floatComponents'));
            });
        });
    },
    
    resetWidthHeight: function(container, floatingComponents) {
        if(floatingComponents) {
            return;
        }
        container.setHeight(this.getTotalChildHeight(container, '.component-container-item'));
    },
    
    getTotalChildHeight: function(container, childquery) {
        var children = this.getElementsFromContainer(container, childquery);
        var totalHeight = 0;
        children.each(function(child, c, idx) {
            totalHeight += child.getHeight();
        });
        return totalHeight;
    },
    
    initGlobalLayout: function() {
        var me = this;
        Ext.get('global_layout_switch').on('click', function(e) {
            e.preventDefault();
            Ext.get('global_layout').toggle(false);
        });
        if (this.config.globalLayout) {
            Ext.get('app_max_width').set({value: this.config.globalLayout.maxWidth || ''});
            Ext.get('app_max_height').set({value: this.config.globalLayout.maxHeight || ''});
            Ext.get('app_margin').set({value: this.config.globalLayout.margin || ''});
            Ext.get('app_background_color').set({value: this.config.globalLayout.backgroundColor || ''});
            Ext.get('app_background_image').set({value: this.config.globalLayout.backgroundImage || ''});
            var bgRepeat = Ext.get('app_background_repeat');
            Ext.each(bgRepeat.dom.options, function(item, index) {
                if (item.value === (me.config.globalLayout.backgroundRepeat || ''))
                    bgRepeat.dom.selectedIndex = index;
            });
            Ext.get('app_background_position').set({value: this.config.globalLayout.backgroundPosition || ''});
            Ext.get('app_extracss').dom.value = this.config.globalLayout.extraCss || '';
            Ext.get('app_singlepopup').dom.checked = this.config.globalLayout.singlePopup || false;
        }
    },
    
    /**
     * Gets the config HTML for width / height
     * @param string id
     * @param string type (width | height)
     * @returns string
     */
    getWidthHeightHtml: function(id, type) {
        return '<div class="' + type + 'config" id="' + id + '_' + type + '_container">' + 
            (type === 'width' ? 'Breedte' : 'Hoogte') + ':<br />' + 
            '<input type="text" id="' + id + '_' + type + '" />' +
            '<select id="' + id + '_' + type + 'measure">' +
                '<option value="px">px</option>' + 
                '<option value="%">%</option>' + 
            '</select><br />' + 
            '<input type="text" id="' + id + '_max' + type + '" /> ' + 
            'px, maximaal' + 
        '</div>';
    },
    
    applyConfig: function(regionId, type) {
        var me = this;
        Ext.get(regionId + '_' + type).set({
            value:(this.config.layoutJson[regionId]['layout'][type] || '')
        });
        var select = Ext.get(regionId + '_' + type + 'measure');
        Ext.each(select.dom.options, function(item, index){
            if(item.value === me.config.layoutJson[regionId]['layout'][type + 'measure']) select.dom.selectedIndex = index;
        });
        Ext.get(regionId + '_max' + type).set({
            value:(this.config.layoutJson[regionId]['layout']['max' + type] || '')
        });
    },
    
    createToolbox: function() {
        var groups = {};
        for(var i = 0 ; i < this.config.components.length;i++){
            var component = this.config.components[i];
            var group = component.group;
            if(!groups.hasOwnProperty(group)){
                groups[group] = {
                    childs : []
                };
            }
            groups[group].childs.push(component);
        }

        var panels = [Ext.create ("Ext.panel.Panel",{
            xtype: 'panel', // << fake hidden panel
            hidden: true,
            collapsed: true
        })];

        for(var groupName in groups){
            if(!groups.hasOwnProperty(groupName)) {
                continue;
            }
            var group = groups[groupName];
            var childs = group.childs;
            panels.push(this.createComponentGroup(groupName, childs));
        }
        
        Ext.create("Ext.panel.Panel",{
            name:"toolbox",
            title:"Werkbank",
            animCollapse: true,
            autoScroll:true,
            height: "100%",
            width: 245,
            minWidth: 0,
            border: 0,
            defaults: {
                border: 0,
                width: '100%'
            },
            layout: {
                type: 'accordion',
                align: 'stretch',
                multi: true
            },
            renderTo:"component-container",
            items:panels
        });
        
        // open all panels, so the view is initialized (and all the previously configured components are rendered.
        for(var i = 0 ; i < panels.length;i++){
            panels[i].expand(); 
        }
    },
    
    changeCaseFirstLetter: function(string, lowercase) {
        var firstChar = "";
        if(!lowercase) {
            firstChar = string.charAt(0).toUpperCase();
        } else {
            firstChar = string.charAt(0).toLowerCase();
        }
        return firstChar + string.slice(1);
    },
    
    createComponentGroup: function(name, childs){
        var me = this;
        var groupedStore = Ext.create('Ext.data.Store', {
            model: 'DraggableViewerComponent',
            data: childs
        });
        var view = Ext.create('Ext.view.View', {
            cls: 'component-view',
            tpl: '<tpl for=".">' +
            '<div class="component-block">' +
            '<div class="remove"></div>' +
            '<div class="wrangler"></div>' +
            '<span class="title">{name}</span>' +
            '<div style="clear: both;"></div>' +
            '</div>' +
            '</tpl>',
            itemSelector: 'div.component-block',
            overItemCls: 'component-over',
            selectedItemClass: 'component-selected',
            singleSelect: true,
            store: groupedStore,
            listeners: {
                render: function(v) {
                    v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
                        getDragData: function(e) {
                            var sourceEl = e.getTarget(v.itemSelector, 10);
                            if (sourceEl && !Ext.get(sourceEl).hasCls('component-added')) {
                                var d = sourceEl.cloneNode(true);
                                d.id = Ext.id();
                                return v.dragData = {
                                    sourceEl: sourceEl,
                                    repairXY: Ext.get(sourceEl).getXY(),
                                    ddel: d,
                                    componentData: v.getRecord(sourceEl).data
                                };
                            }
                            return null;
                        },
                        getRepairXY: function() {
                            return this.dragData.repairXY;
                        },
                        onStartDrag: function() {
                            var data = v.dragData;
                            me.layoutRegionsStore.each(function(region) {
                                if(me.checkDropAllowed(region, data)) {
                                    Ext.get(region.get('htmlId')).addCls('dropallowed');
                                }
                            });
                        },
                        endDrag: function() {
                            me.layoutRegionsStore.each(function(region) {
                                Ext.get(region.get('htmlId')).removeCls('dropallowed');
                            });
                        }
                    });
                },
                viewready: function(view, e) {
                    me.addConfiguredComponents(view);
                }
            }
        });
        var groupPanel = Ext.create("Ext.panel.Panel", {
            title: name,
            id:'group-'+name,
            autoScroll:true,
            collapsible: true,
            defaults: {
                border: 0,
                width: '100%'
            },
            style: {
                padding: '0px 0px 10px 0px'
            },
            items: view
        });
        return groupPanel;
    },
    
    checkDropAllowed: function(layoutRegion, data) {
        var restrictions = data.componentData.restrictions;
        var notInCombinationWith = data.componentData.notInCombinationWith;
        var dropId = layoutRegion.get('id');
        
        if(Ext.isArray(restrictions) && !Ext.Array.contains(restrictions, dropId)) {
            return false;
        }
        if(Ext.isEmpty(notInCombinationWith) || !Ext.isArray(notInCombinationWith)) {
            return true;
        }
        var linkedComponentAdded = false;
        Ext.Array.each(notInCombinationWith, function(comp, index) {
            if(layoutRegion.isComponentAdded(comp)) {
                linkedComponentAdded = true;
            }
        });
        return !linkedComponentAdded;
    },
    
    // Initial config. Adds all previously added components to the right regions
    addConfiguredComponents: function(view) {
        var me = this;
        this.layoutRegionsStore.each(function(layoutRegion){
            var regionId = layoutRegion.get('id');
            if(!(Ext.isDefined(me.config.layoutJson[regionId]) && Ext.isDefined(me.config.layoutJson[regionId]['components']))) {
                return;
            }
            Ext.Array.each(me.config.layoutJson[regionId]['components'], function(componentref, index) {
                var component = view.getStore().findRecord('className', componentref.componentClass);
                var sourceEl = view.getNode(component);
                if(sourceEl && layoutRegion) {
                    var d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    var data = {
                        sourceEl: sourceEl,
                        repairXY: Ext.get(sourceEl).getXY(),
                        ddel: d,
                        componentData: component.data,
                        componentName: componentref.name
                    };
                    me.addComponentToRegion(layoutRegion.regionContainer, data, layoutRegion);
                }
            });
        });
    },
    
    addComponentToRegion: function(container, data, layoutRegion, createTooltip) {
        var me = this;
        if(Ext.isEmpty(data.componentData.componentsAdded)) {
            data.componentData.componentsAdded = 0;
        }
        
        var itemId = Ext.id();
        var componentName = data.componentData.className;
        var i = parseInt(componentName.lastIndexOf('.'), 10);
        if(i !== -1) {
            componentName = componentName.substring((i+1));
        }
        componentName = this.changeCaseFirstLetter(componentName, true) + (++data.componentData.componentsAdded);            
        // used when loading existing conf
        if(Ext.isDefined(data.componentName) && !Ext.isEmpty(data.componentName)) {
            componentName = data.componentName;
        } else {
           // Remove any dangling component config which remained after 
           // adding a new component, saving it, but then not saving the layout
           // then when re-adding the same component class it will reload the
           // config
            Ext.Ajax.request({ 
                url: me.config.removeComponentUrl, 
                params: { 
                    name: componentName
                }
            });             
        }

        var addItem = {
            id: itemId,
            xtype: 'container',
            cls: 'component-container-item',
            contentEl: data.ddel,
            width: layoutRegion.get('floatComponents') ? 80 : undefined,
            height: layoutRegion.get('floatComponents') ? 37 : undefined,
            style: layoutRegion.get('floatComponents') ? { marginRight: '5px' } : {},
            componentName: componentName,
            componentClass: data.componentData.className,
            componentPrettyName: data.componentData.name
        };
        container.add(addItem);
        me.resetWidthHeight(container, layoutRegion.get('floatComponents'));
        var droppedEl = Ext.get(data.ddel);
        if(layoutRegion.get('useShortName')) {
            droppedEl.child('.title').update(data.componentData.shortName);
        }
        if(layoutRegion.get('floatComponents')) {
            droppedEl.addCls('float-component');
        }
        droppedEl.child('.wrangler').on('click', function() {
            me.editComponent(addItem);
        });
        droppedEl.child('.remove').on('click', function() {
            Ext.MessageBox.confirm(
                "Component uit layout verwijderen?",
                "Weet u zeker dat dit component uit de layout wilt verwijderen?<br />" +
                "Bij het opslaan van de layout gaat eventuele configuratie van<br />" +
                "dit component verloren als u dit component verwijdert",
                function(btnClicked) {
                    if(btnClicked === 'yes') {
                        Ext.get(data.sourceEl).removeCls("component-added");
                        me.tooltips[itemId].destroy();
                        container.remove(itemId);
                        var addedComponents = layoutRegion.get('addedComponents');
                        if(!Ext.isEmpty(addedComponents) && Ext.isArray(addedComponents)) {
                            var newAddedComponents = [];
                            Ext.Array.each(addedComponents, function(comp) {
                                if(comp.name !== addItem.componentName) {
                                    newAddedComponents.push(comp);
                                }
                            });
                            layoutRegion.set('addedComponents', newAddedComponents);
                        }
                        me.resetWidthHeight(container, layoutRegion.get('floatComponents'));
                        Ext.Ajax.request({ 
                            url: me.config.removeComponentUrl, 
                            params: { 
                                name: componentName
                            }, 
                            success: function ( result, request ) { 
                                Ext.MessageBox.alert("Gelukt", "Het component is verwijderd.");
                                me.saveLayout(false);
                            // doe wat met data 
                            }, 
                            failure: function ( result, request) { 
                                Ext.MessageBox.alert('Foutmelding', result.responseText); 
                            } 
                        }); 
                    }
                }
                );
        });
        if(data.componentData.singleton) {
            Ext.get(data.sourceEl).addCls("component-added");
        }

        // Add component to region, so it knows which components are added
        var addComp = layoutRegion.get('addedComponents');
        addComp.push({
            "componentClass": addItem.componentClass,
            "name": addItem.componentName
        });
        layoutRegion.set('addedComponents', addComp);
        if(createTooltip) {
            me.addTooltip(itemId, data.componentData.name);
        }
    },
    
    initTooltips: function() {
        var me = this;
        this.layoutRegionsStore.each(function(layoutRegion) {
            layoutRegion.regionContainer.items.each(function(component) {
                me.addTooltip(component.id, component.componentPrettyName);
            });
        });
    },
    
    addTooltip: function(id, name) {
        this.tooltips[id] = Ext.create('Ext.tip.ToolTip', {
            target: id,
            html: name,
            showDelay: 0,
            hideDelay: 0,
            anchor: 'top'
        });
    },
    
    getElementsFromContainer: function(container, childquery) {
        var rootEl = container.getEl();
        return rootEl.select(childquery);
    },

    editComponent: function(componentData) {
        var iframe = Ext.get('configPage');
        // Empty iframe so previously loaded content is invisible
        if(iframe.dom.contentDocument && iframe.dom.contentDocument.body && iframe.dom.contentDocument.body.innerHTML) {
            iframe.dom.contentDocument.body.innerHTML = '';
        }
        var url = this.config.configPageLink;
        if(url.indexOf("?") !== -1){
            url += "&";
        }else{
            url += "?";
        }
        url += "name=" + componentData.componentName + "&className=" + componentData.componentClass;
        if(viewer_admin_debug_mode) {
            url += '&debug=true';
        }
        iframe.dom.src = url;
        iframe.setStyle('display', 'block');
        this.popupWin.setTitle('Configuratie ' + componentData.componentPrettyName);
        this.popupWin.show();
    },
    
    saveLayout: function(displaySuccessMessage){
        if(typeof displaySuccessMessage === 'undefined'){
            displaySuccessMessage = true;
        }
        var layout = {};
        this.layoutRegionsStore.each(function(region) {
            var regionId = region.get('id');
            var layoutConfig = {};
            if(region.get('configureWidth')) {
                Ext.apply(layoutConfig, {
                    'width': Ext.get(regionId + '_width').getValue() || '',
                    'widthmeasure': Ext.get(regionId + '_widthmeasure').getValue() || '',
                    'maxwidth': Ext.get(regionId + '_maxwidth').getValue() || ''
                });
            }
            if(region.get('configureHeight') || region.get('configureFloating')) {
                Ext.apply(layoutConfig, {
                    'height': Ext.get(regionId + '_height').getValue() || '',
                    'heightmeasure': Ext.get(regionId + '_heightmeasure').getValue() || '',
                    'maxheight': Ext.get(regionId + '_maxheight').getValue() || ''
                });
            }
            var useTabs = false;
            if(region.get('configureTabs')) {
                if(Ext.get(regionId + '_useTabs').dom.checked) {
                    useTabs = true;
                }
            }
            if(region.get('configureTitle')) {
                Ext.apply(layoutConfig, {
                    'title': Ext.get(regionId + '_title').getValue() || ''
                });
            }
            if(region.get('configurePosition')) {
                Ext.apply(layoutConfig, {
                    'posx': Ext.get(regionId + '_posx').getValue() || '',
                    'posy': Ext.get(regionId + '_posy').getValue() || ''
                });
            }
            if(region.get('configureCollapsible')) {
                Ext.apply(layoutConfig, {
                    'enableCollapse': Ext.get(regionId + '_enableCollapse').dom.checked,
                    'defaultCollapsed': Ext.fly(regionId + '_defaultCollapsed').dom.checked
                });
            }
            if(region.get('configureFloating')) {
                Ext.apply(layoutConfig, {
                    'enableFloating': Ext.fly(regionId + '_enableFloating').dom.checked
                });
            }
            if(region.get('configureFloatingPosition')) {
                Ext.apply(layoutConfig, {
                    'floatingPosition': Ext.fly(regionId + '_floatingPosition').getValue()
                });
            }
            if(region.get('configureCollapsible') || region.get('configureFloating')) {
                Ext.apply(layoutConfig, {
                    'panelTitle': Ext.fly(regionId + '_panelTitle').getValue() || ''
                });
            }
            Ext.apply(layoutConfig, {
                'useTabs': useTabs,
                'bgcolor': Ext.get(regionId + '_bgcolor').getValue() || ''
            });
            layout[regionId] = {
                "layout": layoutConfig,
                "components": region.data.addedComponents
            };
        });
        var response = {
            "layout": Ext.JSON.encode(layout)
        };
        var globalLayout = {
            maxWidth: Ext.get('app_max_width').getValue() || 0,
            maxHeight: Ext.get('app_max_height').getValue() || 0,
            margin: Ext.get('app_margin').getValue() || 0,
            backgroundColor: Ext.get('app_background_color').getValue() || "",
            backgroundImage: Ext.get('app_background_image').getValue() || "",
            backgroundRepeat: Ext.get('app_background_repeat').getValue() || "no-repeat",
            backgroundPosition: Ext.get('app_background_position').getValue() || "",
            extraCss: Ext.get('app_extracss').getValue() || "",
            singlePopup: Ext.get('app_singlepopup').dom.checked
        };
        Ext.Ajax.request({ 
            url: this.config.layoutSaveUrl, 
            params: { 
                layout: response,
                globalLayout: Ext.JSON.encode(globalLayout)
            }, 
            success: function ( result, request ) { 
                if(displaySuccessMessage){
                    Ext.MessageBox.alert("Gelukt", "De layout is opgeslagen.");
                }
            }, 
            failure: function ( result, request) { 
                Ext.MessageBox.alert('Foutmelding', result.responseText); 
            } 
        });
    }
    
});
