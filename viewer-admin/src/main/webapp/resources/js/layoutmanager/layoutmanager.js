/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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
        {name: 'useShortName', type: 'boolean', defaultValue: false},
        {name: 'floatComponents', type: 'boolean', defaultValue: false},
        {name: 'configure', type: 'auto', defaultValue: []},
        {name: 'addedComponents', type: 'auto', defaultValue: []}
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
        {id:'header', htmlId:'layout_header', configure: ['height', 'tabs', 'backgroundcolor']},
        {id:'leftmargin_top', htmlId:'layout_left_top', configure: ['width', 'tabs', 'collapse', 'floating', 'paneltitle', 'backgroundcolor']},
        {id:'leftmargin_bottom', htmlId:'layout_left_bottom', configure: ['height', 'tabs', 'backgroundcolor']},
        {id:'left_menu', htmlId:'layout_left_menu', useShortName:true, configure: ['width', 'floating', 'floatingposition', 'backgroundcolor']},
        {id:'top_menu', htmlId:'layout_top_menu', useShortName:true, floatComponents: true, configure: ['height', 'backgroundcolor'] },
        {id:'content', htmlId:'layout_content', titleOverride: 'Map' },
        {id:'content_bottom', htmlId:'layout_content_bottom', configure: ['height', 'backgroundcolor'], titleOverride: 'Map bottom'},
        {id:'popupwindow', htmlId:'layout_popupwindow', configure: ['height', 'width', 'tabs', 'title', 'position', 'backgroundcolor']},
        {id:'rightmargin_top', htmlId:'layout_right_top', configure: ['width', 'tabs', 'collapse', 'floating','paneltitle', 'backgroundcolor']},
        {id:'rightmargin_bottom', htmlId:'layout_right_bottom', configure: ['height', 'tabs', 'backgroundcolor']},
        {id:'footer', htmlId:'layout_footer', configure: ['height', 'tabs', 'backgroundcolor']}
    ],
    configurationOptions: {
        width: { title: 'Breedte', key: 'width', type: 'text' },
        widthmeasure: { key: 'widthmeasure', options: ['px', '%'], type: 'select' },
        maxwidth: { key: 'maxwidth', type: 'text' },
        height: { title: 'Hoogte', key: 'height', type: 'text' },
        heightmeasure: { key: 'heightmeasure', options: ['px', '%'], type: 'select' },
        maxheight: { key: 'maxheight', type: 'text' },
        tabs: { title: 'Gebruik tabs bij meerdere componenten', key: 'useTabs', type: 'checkbox' },
        collapse: { title: 'Balk in/uit kunnen klappen', key: 'enableCollapse', type: 'checkbox' },
        collapse_default: { title: 'Balk standaard ingeklapt', key: 'defaultCollapsed', type: 'checkbox' },
        floating: { title: 'Maak balk zwevend', key: 'enableFloating', type: 'checkbox' },
        floatingposition: { title: 'Positie zwevende balk', key: 'floatingPosition', type: 'select', options: [
            { value: 'tl', label: 'Links-boven' },
            { value: 'bl', label: 'Links-onder' },
            { value: 'tr', label: 'Rechts-boven' },
            { value: 'br', label: 'Rechts-onder' }
        ]},
        paneltitle: { title: 'Titel in/uitklapbare balk / zwevend paneel', key: 'panelTitle', type: 'text' },
        position: { title: 'Startpositie (leeg = gecentreerd)' },
        posx: { title: 'x', key: 'posx', type: 'text' },
        posy: { title: 'y', key: 'posy', type: 'text' },
        title: { title: 'Popup titel', key: 'title', type: 'text' },
        backgroundcolor: { title: 'Achtergrondkleur', key: 'bgcolor', type: 'text' }
    },
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
            me.saveLayout(true);
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
            var regionId = layoutRegion.get('id');
            var layoutRegionElement = document.getElementById(layoutRegion.get('htmlId'));
            if(!layoutRegionElement) {
                throw ['There is a layout (', regionId, ') region without an container in the JSP page'].join('');
            }
            me.createLayoutConfiguration(layoutRegion, layoutRegionElement);
            var layout = {
                type: 'vbox',
                align: 'stretch'
            };
            var styleConfig = {
                width: '100%',
                minHeight: '25px'
            };
            if(layoutRegion.get('floatComponents')) {
                layout = {
                    type: 'hbox'
                };
                styleConfig.height = '55px';
            }
            var regionContainer = Ext.create('Ext.container.Container', {
                cls: 'component-container',
                layout: layout,
                style: styleConfig,
                height: layoutRegion.get('floatComponents') ? 55 : undefined,
                overflowX: layoutRegion.get('floatComponents') ? 'auto' : 'hidden',
                renderTo: layoutRegionElement,
                plugins : Ext.create('Ext.ux.BoxReorderer', {
                    listeners: {
                        changeindex: function(boxReorderer, container) {
                            me.resetWidthHeight(container, layoutRegion.get('floatComponents'));
                        },
                        drop: function(boxReorderer, container) {
                            // After each reorder: add components in right order to region
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
            if(Ext.Array.indexOf(layoutRegion.get('configure'), 'backgroundcolor') !== -1) {
                Ext.create('Ext.ux.b3p.ColorPickerButton', {
                    startColor: me.getConfigOptionValue(regionId, 'backgroundcolor'),
                    renderTo: 'colorpicker_' + regionId + '_backgroundcolor',
                    textfield: regionId + '_backgroundcolor',
                    openOnLeft: (regionId === 'rightmargin_top' || regionId === 'rightmargin_bottom'),
                    openOnTop: (regionId === 'footer')
                });
            }
            
            if(Ext.Array.indexOf(layoutRegion.get('configure'), 'collapse') !== -1) {
                var collapseDefault = document.getElementById(regionId + '_collapse_default').parentNode;
                var collapse = document.getElementById(regionId + '_collapse');
                collapseDefault.style.display = collapse.checked ? 'block' : 'none';
                collapse.addEventListener('click', function() {
                    collapseDefault.style.display = collapse.checked ? 'block' : 'none';
                });
            }
        });

        Ext.on('resize', function() {
            me.layoutRegionsStore.each(function(region) {
                me.resetWidthHeight(region.regionContainer, region.get('floatComponents'));
            });
        });
    },

    createLayoutConfiguration: function(layoutRegion, layoutRegionElement) {
        var configuration = layoutRegion.get('configure');
        var regionId = layoutRegion.get('id');
        var layoutHtml = [];
        var configOptions = {};
        var floatingCollapseTitleAdded = false;
        for(var i = 0; i < configuration.length; i++) {
            configOptions = this.configurationOptions[configuration[i]];
            switch (configuration[i]) {
                case 'width':
                    layoutHtml.push(this.getWidthHeightConfig(regionId, 'width'));
                    break;
                case 'height':
                    layoutHtml.push(this.getWidthHeightConfig(regionId, 'height'));
                    break;
                case 'tabs':
                    layoutHtml.push(this.getCheckboxConfig(regionId, 'tabs'));
                    break;
                case 'floating':
                    layoutHtml.push(this.getCheckboxConfig(regionId, 'floating'));
                    if(!floatingCollapseTitleAdded) {
                        layoutHtml.push(this.getTextConfig(regionId, 'paneltitle'));
                        floatingCollapseTitleAdded = true;
                    }
                    break;
                case 'collapse':
                    layoutHtml.push(this.getCheckboxConfig(regionId, 'collapse'));
                    layoutHtml.push(this.getCheckboxConfig(regionId, 'collapse_default'));
                    if(!floatingCollapseTitleAdded) {
                        layoutHtml.push(this.getTextConfig(regionId, 'paneltitle'));
                        floatingCollapseTitleAdded = true;
                    }
                    break;
                case 'floatingposition':
                    layoutHtml.push(this.getSelectConfig(regionId, 'floatingposition'));
                    break;
                case 'position':
                    layoutHtml.push(
                        '<div class="tabsconfig">',
                        this.getConfigTitle('position'), '<br />',
                        this.getConfigTitle('posx'),
                        this.getTextField(regionId, 'posx'),
                        this.getConfigTitle('posy'),
                        this.getTextField(regionId, 'posy'),
                        '</div>'
                    );
                    break;
                case 'title':
                    layoutHtml.push(this.getTextConfig(regionId, 'title'));
                    break;
                case 'backgroundcolor':
                    layoutHtml.push(
                        '<div class="tabsconfig">',
                        '<div style="float: left;">', this.getConfigTitle('backgroundcolor'), '</div>',
                        '<div style="float: left; clear: left; width: 90px;">',
                        '<input type="text" id="' + regionId + '_backgroundcolor" style="width: 60px; float: left;" value="', this.getConfigOptionValue(regionId, 'backgroundcolor') || '' ,'" />',
                        '<div id="colorpicker_' + regionId + '_backgroundcolor" style="float: left;"></div>',
                        '</div></div>'
                    );
                    break;
            }
        }
                                
        var layoutRegionTitle = layoutRegion.get('titleOverride') || this.changeCaseFirstLetter(layoutRegion.get('id').replace('_', ' '), false);
        layoutRegionElement.innerHTML = [
            '<div class="layout_title">',
                '<strong class="layoutregion_title">', layoutRegionTitle, '</strong><br />',
                '<div class="regionconfig" id="regionconfig_', regionId, '" style="display: none;">',
                    '<u>Visuele configuratie</u><br />',
                    layoutHtml.join(''),
                '</div>', 
                '<div style="clear: both;"></div>',
             '</div>'
        ].join('');

        if(layoutHtml.length !== 0) {
            var window = Ext.create('Ext.window.Window', {
                title: 'Configuratie ' + layoutRegionTitle,
                closable: true,
                closeAction: 'hide',
                width: 400,
                height: 400,
                layout: 'fit',
                modal: true,
                contentEl: 'regionconfig_' + regionId,
                resizable: false,
                bodyPadding: 10,
                fbar: [
                    { type: 'button', text: 'Opslaan', handler: function() { this.saveLayout(false); window.hide(); }.bind(this) }
                ]
            });
            layoutRegionElement.querySelector('.layoutregion_title').addEventListener('click', function() {
                var regionConfig = layoutRegionElement.querySelector('.regionconfig');
                if(regionConfig) {
                    regionConfig.style.display = 'block';
                }
                window.show();
            });
        }
    },

    /**
     * Gets the config HTML for width / height
     * @param string id id of config
     * @param string type (width | height)
     * @returns string
     */
    getWidthHeightConfig: function(id, type) {
        return [
            '<div class="', type, 'config" id="', id, '_', type, '_container">',
                this.getConfigTitle(type), '<br />',
                '<input type="text" id="', id, '_', type, '" value="', (this.getConfigOptionValue(id, type) || ''), '" />',
                this.getSelectField(id, type + 'measure'),
                '<br />',
                '<input type="text" id="', id, '_max', type, '" value="', (this.getConfigOptionValue(id, 'max' + type) || ''), '" /> ',
                'px, maximaal',
            '</div>'
        ].join('');
    },

    getCheckboxConfig: function(id, type) {
        return [
            '<div class="tabsconfig">',
                this.getConfigTitle(type),
                '<input type="checkbox" id="', id, , '_', type, '"', this.getConfigOptionValue(id, type) ? ' checked' : '',' />',
            '</div>'
        ].join('');
    },

    getSelectConfig: function(id, type) {
        return [ '<div class="tabsconfig">', this.getConfigTitle(type), this.getSelectField(id, type), '</div>'].join('');
    },

    getTextConfig: function(id, type) {
        return [ '<div class="tabsconfig">', this.getConfigTitle(type), this.getTextField(id, type), '</div>' ].join('');
    },

    getSelectField: function(id, type) {
        var options = this.configurationOptions[type]['options'] || [];
        var configValue = this.getConfigOptionValue(id, type);
        var select = ['<select id="', id, '_', type, '">'];
        var option = {};
        for(var i = 0; i < options.length; i++) {
            option = options[i];
            if(typeof(option) === 'string') { // If option is a string, convert to object with value/label
                option = { value: option, label: option };
            }
            select.push('<option value="', option.value, '"', (configValue === option.value ? ' selected' : '') ,'>', option.label, '</option>');
        }
        select.push('</select>');
        return select.join('');
    },

    getTextField: function(id, type) {
        return ['<input type="text" id="', id, '_', type, '" style="width: 100%;" value="', this.getConfigOptionValue(id, type) || '' ,'" />'].join('');
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

    getLayoutConfig: function(id) {
        return (Ext.isDefined(this.config.layoutJson[id]) && Ext.isDefined(this.config.layoutJson[id]['layout'])) ? this.config.layoutJson[id]['layout'] : {}
    },

    getConfigTitle: function(type) {
        return this.configurationOptions[type]['title'] + ': ' || '';
    },

    getConfigOptionValue: function(id, type) {
        var layout = this.getLayoutConfig(id);
        var configKey = this.configurationOptions[type]['key'];
        return layout.hasOwnProperty(configKey) ? layout[configKey] : null;
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
        var groupedStore = Ext.create('Ext.data.Store', {
            model: 'DraggableViewerComponent',
            data: childs
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
            items: this.getComponentGroupView(groupedStore)
        });
        return groupPanel;
    },
    
    getComponentGroupView: function(groupedStore) {
        var me = this;
        return Ext.create('Ext.view.View', {
            cls: 'component-view',
            tpl: '<tpl for=".">' +
            '<div class="component-block">' +
            '<div class="icon remove"></div>' +
            '<div class="icon wrangler"></div>' +
            '<span class="title">{name}</span>' +
            '<div class="icon draghandle"></div>' +
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
        var itemId = Ext.id();
        var componentName = '';
        if(data.hasOwnProperty('moveComponent') && data.moveComponent) {
            if(data.componentRegion.get('id') === layoutRegion.get('id')) {
                // Same layoutRegion, skip rest
                return;
            }
            // Remove from previous region
            me.removeComponent(data.componentRegion.regionContainer, data.componentRegion, data.componentName, data.componentItemId);
            // Keep componentName to keep configuration
            componentName = data.componentName;
        } else {
            componentName = this.getComponentName(data);
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
            componentPrettyName: data.componentData.name,
            currentRegion: layoutRegion.get('id'),
            reorderable: true,
            listeners: {
                render: function(v) {
                    // Do not allow dragging the element if the element is restricted to 1 area only
                    if(Ext.isArray(data.componentData.restrictions) && data.componentData.restrictions.length === 1) {
                        v.getEl().addCls('hide-draghandle');
                        return false;
                    }
                    v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
                        getDragData: function(e) {
                            var dragHandle = e.getTarget('.draghandle', 10);
                            var sourceEl;
                            if (dragHandle) {
                                sourceEl = dragHandle.parentNode;
                                var d = sourceEl.cloneNode(true);
                                d.id = Ext.id();
                                return v.dragData = {
                                    sourceEl: sourceEl,
                                    repairXY: Ext.get(sourceEl).getXY(),
                                    ddel: d,
                                    componentData: data.componentData,
                                    moveComponent: true,
                                    componentItemId: itemId,
                                    componentRegion: layoutRegion,
                                    componentName: componentName
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
                }
            }
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
                        me.removeComponent(container, layoutRegion, addItem.componentName, itemId);
                        Ext.Ajax.request({ 
                            url: me.config.removeComponentUrl, 
                            params: { 
                                name: componentName
                            }, 
                            success: function ( result, request ) { 
                                Ext.MessageBox.alert("Gelukt", "Het component is verwijderd.");
                                me.saveLayout(false);
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

        if(data.hasOwnProperty('moveComponent') && data.moveComponent) {
            me.saveLayout(false);
        }
    },

    removeComponent: function(container, layoutRegion, itemToRemove, itemId) {
        this.tooltips[itemId].destroy();
        container.remove(itemId);
        var addedComponents = layoutRegion.get('addedComponents');
        if(!Ext.isEmpty(addedComponents) && Ext.isArray(addedComponents)) {
            var newAddedComponents = [];
            Ext.Array.each(addedComponents, function(comp) {
                if(comp.name !== itemToRemove) {
                    newAddedComponents.push(comp);
                }
            });
            layoutRegion.set('addedComponents', newAddedComponents);
        }
        this.resetWidthHeight(container, layoutRegion.get('floatComponents'));
    },
    
    getComponentsByClassname : function (classname){
        var components = [];
        this.layoutRegionsStore.each(function(region) {
            var regionComponents = region.data.addedComponents;
            for (var i = 0 ; i < regionComponents.length ; i++){
                if(regionComponents[i].componentClass === classname){
                    components.push(regionComponents[i].name);
                }
            }
        });
        return components;
    },
    
    getIndexForClassname : function (data){
        var components = this.getComponentsByClassname(data.componentData.className);
        var maxIndex = 0;
        for (var i = 0 ; i < components.length; i++){
            var className = components[i];
            var index = parseInt(className.substring(className.length - 1));
            if( index > maxIndex){
                maxIndex = index;
            }
        }
        data.componentData.componentsAdded = ++ maxIndex;
        return maxIndex;
    },
    
    getComponentName: function(data) {
        if(Ext.isEmpty(data.componentData.componentsAdded)) {
            data.componentData.componentsAdded = 0;
        }
        var componentName = data.componentData.className;
        var i = parseInt(componentName.lastIndexOf('.'), 10);
        if(i !== -1) {
            componentName = componentName.substring((i+1));
        }
        componentName = this.changeCaseFirstLetter(componentName, true) + this.getIndexForClassname(data);
        // used when loading existing conf
        if(Ext.isDefined(data.componentName) && !Ext.isEmpty(data.componentName)) {
            componentName = data.componentName;
        } else {
           // Remove any dangling component config which remained after 
           // adding a new component, saving it, but then not saving the layout
           // then when re-adding the same component class it will reload the
           // config
            Ext.Ajax.request({ 
                url: this.config.removeComponentUrl, 
                params: { 
                    name: componentName
                }
            });             
        }
        return componentName;
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
        url += [
            "name=",
            componentData.componentName,
            "&className=",
            componentData.componentClass,
            "&currentRegion=",
            componentData.currentRegion
        ].join("");
        if(viewer_admin_debug_mode) {
            url += '&debug=true';
        }
        iframe.dom.src = url;
        iframe.setStyle('display', 'block');
        this.popupWin.setTitle('Configuratie ' + componentData.componentPrettyName);
        this.popupWin.show();
    },
    
    saveLayout: function(displaySuccessMessage) {
        var layout = {};
        this.layoutRegionsStore.each(function(region) {
            layout[region.get('id')] = {
                "layout": this.getRegionLayoutConfig(region),
                "components": region.data.addedComponents
            };
        }.bind(this));
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
                if(!displaySuccessMessage){
                    return;
                }
                Ext.MessageBox.alert("Gelukt", "De layout is opgeslagen.");
            }, 
            failure: function ( result, request) { 
                Ext.MessageBox.alert('Foutmelding', result.responseText); 
            } 
        });
    },

    getRegionLayoutConfig: function(region) {
        var configuration = region.get('configure');
        var regionId = region.get('id');
        var layout = {};
        var configOptions;
        var extraConfigs = {
            position: ['posx', 'posy'],
            width: ['width', 'widthmeasure', 'maxwidth'],
            height: ['height', 'heightmeasure', 'maxheight'],
            collapse: ['collapse', 'collapse_default']
        };
        var config;
        for(var i = 0; i < configuration.length; i++) {
            config = configuration[i];
            if(extraConfigs.hasOwnProperty(config)) {
                for(var j = 0; j < extraConfigs[configuration[i]].length; j++) {
                    config = extraConfigs[configuration[i]][j];
                    configOptions = this.configurationOptions[config];
                    layout[configOptions.key] = this.getValueFromField(regionId, config, configOptions.type);
                }
            } else {
                configOptions = this.configurationOptions[config];
                layout[configOptions.key] = this.getValueFromField(regionId, config, configOptions.type);
            }
        }
        return layout;
    },

    getValueFromField: function(regionId, configurationId, configurationType) {
        var field = document.getElementById([regionId, '_', configurationId].join(''));
        if(configurationType === 'checkbox') {
            return field.checked;
        }
        return field.value || '';
    }
    
});
