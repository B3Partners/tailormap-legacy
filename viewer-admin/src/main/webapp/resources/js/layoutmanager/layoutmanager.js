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
var objectBeingConfigured = null;
Ext.onReady(function() {
     var layoutRegions = [
        {id:'header', htmlId:'layout_header', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]},
        {id:'leftmargin_top', htmlId:'layout_left_top', useShortName:false, floatComponents: false, configureHeight: false, configureWidth: true, configureTabs: true, addedComponents:[], configureCollapsible: true},
        {id:'leftmargin_bottom', htmlId:'layout_left_bottom', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]},
        {id:'left_menu', htmlId:'layout_left_menu', useShortName:true, floatComponents: false, configureHeight: false, configureWidth: true, addedComponents:[]},
        {id:'top_menu', htmlId:'layout_top_menu', useShortName:true, floatComponents: true, configureHeight: true, configureWidth: false, addedComponents:[]},
        {id:'content', htmlId:'layout_content', useShortName:false, floatComponents: false, configureHeight: false, configureWidth: false, addedComponents:[], titleOverride: 'Map' },
        {id:'content_bottom', htmlId:'layout_content_bottom', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, addedComponents:[], titleOverride: 'Map bottom'},
        {id:'popupwindow', htmlId:'layout_popupwindow', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: true, configureTabs: true, configureTitle: true, configurePosition: true, addedComponents:[]},
        {id:'rightmargin_top', htmlId:'layout_right_top', useShortName:false, floatComponents: false, configureHeight: false, configureWidth: true, configureTabs: true, addedComponents:[], configureCollapsible: true},
        {id:'rightmargin_bottom', htmlId:'layout_right_bottom', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]},
        {id:'footer', htmlId:'layout_footer', useShortName:false, floatComponents: false, configureHeight: true, configureWidth: false, configureTabs: true, addedComponents:[]}
    ];

    Ext.define("DraggableViewerComponent",{
        extend: "Ext.data.Model",
        idProperty: 'id',       
        fields: [
            {name: 'className', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'shortName', type: 'string'},
            {name: 'restrictions', type: 'array'},
            {name: 'singleton', type: 'boolean'},
            {name: 'notInCombinationWith', type: 'array'}
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
            {name: 'addedComponents', type: 'array'},
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
                if(comp.componentClass == compid) {
                    isAdded = true;
                }
            });
            return isAdded;
        }
    });
    
    var layoutRegionsStore = Ext.create('Ext.data.Store', {
        model: 'LayoutRegion',
        data: layoutRegions
    });
    
    initRegions();
   
    var groups = {};
    for(var i = 0 ; i < components.length;i++){
        var component = components[i];
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
        var group = groups[groupName];
        var childs = group.childs;
        panels.push(createComponentGroup(groupName, childs));
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

    function changeCaseFirstLetter(string, lowercase) {
        var firstChar = "";
        if(!lowercase) {
            firstChar = string.charAt(0).toUpperCase();
        } else {
            firstChar = string.charAt(0).toLowerCase();
        }
        return firstChar + string.slice(1);
    }
    
    function createComponentGroup(name,childs){
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
                            if (sourceEl && !Ext.fly(sourceEl).hasCls('component-added')) {
                                var d = sourceEl.cloneNode(true);
                                d.id = Ext.id();
                                return v.dragData = {
                                    sourceEl: sourceEl,
                                    repairXY: Ext.fly(sourceEl).getXY(),
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
                            layoutRegionsStore.each(function(region) {
                                if(checkDropAllowed(region, data)) Ext.fly(region.get('htmlId')).addCls('dropallowed');
                            });
                        },
                        endDrag: function() {
                            layoutRegionsStore.each(function(region) {
                                Ext.fly(region.get('htmlId')).removeCls('dropallowed');
                            });
                        }
                    });
                },
                viewready: function(view, e) {
                    initConfig(view);
                }
            }
        });
        var groupPanel =Ext.create("Ext.panel.Panel", {
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
    }

    function initRegions() {
        layoutRegionsStore.each(function(layoutRegion) {
            // TODO: make this better
            var layoutRegionElement = Ext.get(layoutRegion.get('htmlId'));
            if(layoutRegionElement) {
                var layoutRegionConfigHtml = '';
                var hasLayoutConfiguration = false;
                if(layoutRegion.get('configureWidth')) {
                    hasLayoutConfiguration = true;
                    layoutRegionConfigHtml += '<div class="widthconfig">' + 
                                                    'Breedte:<br />' + 
                                                    '<input type="text" id="' + layoutRegion.get('id') + '_width" />' +
                                                    '<select id="' + layoutRegion.get('id') + '_widthmeasure">' +
                                                        '<option value="px">px</option>' + 
                                                        '<option value="%">%</option>' + 
                                                    '</select><br />' + 
                                                    '<input type="text" id="' + layoutRegion.get('id') + '_maxwidth" /> ' + 
                                                    'px, maximaal' + 
                                                '</div>';
                }
                if(layoutRegion.get('configureHeight')) {
                    hasLayoutConfiguration = true;
                    layoutRegionConfigHtml += '<div class="heightconfig">' + 
                                                    'Hoogte:<br />' + 
                                                    '<input type="text" id="' + layoutRegion.get('id') + '_height" />' + 
                                                    '<select id="' + layoutRegion.get('id') + '_heightmeasure">' + 
                                                        '<option value="px">px</option>' + 
                                                        '<option value="%">%</option>' + 
                                                    '</select><br />' + 
                                                    '<input type="text" id="' + layoutRegion.get('id') + '_maxheight" /> ' + 
                                                    'px, maximaal' + 
                                                '</div>';
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
                                                    '<br />Titel in/uitklapbare balk : ' + 
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
                                        
                var layoutRegionTitle = layoutRegion.get('titleOverride') || changeCaseFirstLetter(layoutRegion.get('id').replace('_', ' '), false);
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
                        layoutRegionElement.child('.layout_title').child('.regionconfig').toggle(false);
                        /* Below is a layout fix for component items, preventing them to be partially invisible when a scrollbar appeared */
                        layoutRegionsStore.each(function(region) {
                            if(Ext.Array.contains(['content', 'content_bottom', 'popupwindow'], region.get('id'))) {
                                if(region.regionContainer && region.regionContainer.items) {
                                    var containerWidth = region.regionContainer.getWidth();
                                    region.regionContainer.items.each(function(item) {
                                        item.setWidth(containerWidth);
                                    });
                                }
                            }
                        });
                    });
                }
                layoutRegionElement.child('.layout_title').child('.regionconfig').setVisibilityMode(2).setVisible(false);
            }
            var layoutType = 'vbox';
            var styleConfig = {
                width: '100%',
                minHeight: '25px'
            };
            var renderTo = layoutRegion.get('htmlId');
            if(layoutRegion.get('floatComponents')) {
                layoutType = 'hbox';
                styleConfig.height = '40px';
                // Add wrapper element for scrolling
                renderTo = Ext.id();
                layoutRegionElement.insertHtml('beforeEnd',
                    '<div id="' + renderTo + '" class="floatwrapper">' +
                    '</div>', true
                    );
            }
            var regionContainer = Ext.create('Ext.container.Container', {
                cls: 'component-container',
                layout: { 
                    type: layoutType,
                    shrinkToFit: false
                },
                style: styleConfig,
                defaults: {
                    reorderable: true
                },
                renderTo: renderTo,
                plugins : Ext.create('Ext.ux.BoxReorderer',{
                    listeners: {
                        drop: function(me, container) {
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
                                Ext.fly(target).addCls('content-container-hover');
                            },
                            onNodeOut : function(target, dd, e, data){
                                Ext.fly(target).removeCls('content-container-hover');
                            },
                            onNodeOver : function(target, dd, e, data){
                                if(this.checkDropAllowed(data)) {
                                    return Ext.dd.DropZone.prototype.dropAllowed;
                                }
                                return Ext.dd.DropZone.prototype.dropNotAllowed;
                            },
                            onNodeDrop : function(target, dd, e, data){
                                if(this.checkDropAllowed(data)) {
                                    addComponentToRegion(c, data, layoutRegion);
                                    return true;
                                }
                                return false;
                            },
                            checkDropAllowed: function(data) {
                                return checkDropAllowed(layoutRegion, data);
                            }
                        });
                    }
                }
            });
            layoutRegion.regionContainer = regionContainer;
            var regionId = layoutRegion.get('id');
            if(Ext.isDefined(layoutJson[regionId])) {
                // Apply config
                if(Ext.isDefined(layoutJson[regionId]['layout'])) {
                    if(layoutRegion.get('configureWidth')) {
                        Ext.fly(regionId + '_width').set({
                            value:(layoutJson[regionId]['layout']['width'] || '')
                        });
                        var widthMeasureSelect = Ext.get(regionId + '_widthmeasure');
                        Ext.each(widthMeasureSelect.dom.options, function(item, index){
                            if(item.value === layoutJson[regionId]['layout']['widthmeasure']) widthMeasureSelect.dom.selectedIndex = index;
                        });
                        Ext.fly(regionId + '_maxwidth').set({
                            value:(layoutJson[regionId]['layout']['maxwidth'] || '')
                        });
                    }
                    if(layoutRegion.get('configureHeight')) {
                        Ext.fly(regionId + '_height').set({
                            value:(layoutJson[regionId]['layout']['height'] || '')
                        });
                        var heightMeasureSelect = Ext.get(regionId + '_heightmeasure');
                        Ext.each(heightMeasureSelect.dom.options, function(item, index){
                            if(item.value === layoutJson[regionId]['layout']['heightmeasure']) heightMeasureSelect.dom.selectedIndex = index;
                        });
                        Ext.fly(regionId + '_maxheight').set({
                            value:(layoutJson[regionId]['layout']['maxheight'] || '')
                        });
                    }
                    if(layoutRegion.get('configureTabs')) {
                        var checked = false;
                        if(Ext.isDefined(layoutJson[regionId]['layout']['useTabs'])) {
                            checked = layoutJson[regionId]['layout']['useTabs'];
                        }
                        Ext.fly(regionId + '_useTabs').dom.checked = checked;
                    }
                    if(layoutRegion.get('configureTitle')) {
                        var title = '';
                        if(Ext.isDefined(layoutJson[regionId]['layout']['title'])) {
                            bgcolor = layoutJson[regionId]['layout']['title'];
                        }
                        Ext.fly(regionId + '_title').set({
                            value: title
                        });
                    }
                    if(layoutRegion.get('configurePosition')) {
                        Ext.fly(regionId + '_posx').set({
                            value:(layoutJson[regionId]['layout']['posx'] || '')
                        });
                        Ext.fly(regionId + '_posy').set({
                            value:(layoutJson[regionId]['layout']['posy'] || '')
                        });
                    }
                    if(layoutRegion.get('configureCollapsible')) {
                        var collapseChecked = false;
                        if(Ext.isDefined(layoutJson[regionId]['layout']['enableCollapse']) && layoutJson[regionId]['layout']['enableCollapse']) {
                            collapseChecked = layoutJson[regionId]['layout']['enableCollapse'];
                        }
                        Ext.fly(regionId + '_enableCollapse').dom.checked = collapseChecked;
                        Ext.fly(regionId + '_panelTitle').set({
                            value:(layoutJson[regionId]['layout']['panelTitle'] || '')
                        });
                    }
                    var bgcolor = '';
                    if(Ext.isDefined(layoutJson[regionId]['layout']['bgcolor'])) {
                        bgcolor = layoutJson[regionId]['layout']['bgcolor'];
                    }
                    Ext.fly(regionId + '_bgcolor').set({
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
            }
        });
        Ext.get('global_layout_switch').on('click', function(e) {
            e.preventDefault();
            Ext.get('global_layout').toggle(false);
        });
        if (globalLayout) {
            Ext.get('app_max_width').set({value: globalLayout.maxWidth || ''});
            Ext.get('app_max_height').set({value: globalLayout.maxHeight || ''});
            Ext.get('app_margin').set({value: globalLayout.margin || ''});
            Ext.get('app_background_color').set({value: globalLayout.backgroundColor || ''});
            Ext.get('app_background_image').set({value: globalLayout.backgroundImage || ''});
            var bgRepeat = Ext.get('app_background_repeat');
            Ext.each(bgRepeat.dom.options, function(item, index) {
                if (item.value === (globalLayout.backgroundRepeat || ''))
                    bgRepeat.dom.selectedIndex = index;
            });
            Ext.get('app_background_position').set({value: globalLayout.backgroundPosition || ''});
            Ext.get('app_extracss').dom.value = globalLayout.extraCss || '';
        }
    }
    
    function checkDropAllowed(layoutRegion, data) {
        var restrictions = data.componentData.restrictions;
        var notInCombinationWith = data.componentData.notInCombinationWith;
        var dropId = layoutRegion.get('id');
        if(Ext.isEmpty(restrictions) || (Ext.isArray(restrictions) && Ext.Array.contains(restrictions, dropId))) {
            if(!Ext.isEmpty(notInCombinationWith)) {
                if(Ext.isArray(notInCombinationWith)) {
                    var linkedComponentAdded = false;
                    Ext.Array.each(notInCombinationWith, function(comp, index) {
                        if(layoutRegion.isComponentAdded(comp)) {
                            linkedComponentAdded = true;
                        }
                    });
                    return !linkedComponentAdded;
                }
            }
            return true;
        }
        return false;
    }
      
    // Initial config. Adds all previously added components to the right regions
    function initConfig(view) {
        if(layoutJson && Ext.isDefined(layoutJson)) {
            layoutRegionsStore.each(function(layoutRegion){
                var regionId = layoutRegion.get('id');
                if(Ext.isDefined(layoutJson[regionId])) {
                    if(Ext.isDefined(layoutJson[regionId]['components'])) {
                        Ext.Array.each(layoutJson[regionId]['components'], function(componentref, index) {
                            
                            var component = view.getStore().findRecord('className', componentref.componentClass);
                            var sourceEl = view.getNode(component);
                            if(sourceEl && layoutRegion) {
                                var d = sourceEl.cloneNode(true);
                                d.id = Ext.id();
                                var data = {
                                    sourceEl: sourceEl,
                                    repairXY: Ext.fly(sourceEl).getXY(),
                                    ddel: d,
                                    componentData: component.data,
                                    componentName: componentref.name
                                };
                                addComponentToRegion(layoutRegion.regionContainer, data, layoutRegion);
                            }
                        });
                    }
                }
            });
        }
    }
    
    function addComponentToRegion(container, data, layoutRegion) {
        if(Ext.isEmpty(data.componentData.componentsAdded)) {
            data.componentData.componentsAdded = 0;
        }
        var styleConfig = {
            width: '100%'
        };
        if(layoutRegion.get('floatComponents')) {
            styleConfig = {
                width: '80px',
                marginRight: '5px'
            };
        }
        var itemId = Ext.id();
        var componentName = data.componentData.className;
        var i = componentName.lastIndexOf('.');
        if(i != -1) {
            componentName = componentName.substring((i+1));
        }
        componentName = changeCaseFirstLetter(componentName, true) + (++data.componentData.componentsAdded);            
        // used when loading existing conf
        if(Ext.isDefined(data.componentName) && !Ext.isEmpty(data.componentName)) {
            componentName = data.componentName;
        } else {
           // Remove any dangling component config which remained after 
           // adding a new component, saving it, but then not saving the layout
           // then when re-adding the same component class it will reload the
           // config
            Ext.Ajax.request({ 
                url: removeComponentUrl, 
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
            style: styleConfig,
            componentName: componentName,
            componentClass: data.componentData.className,
            componentPrettyName: data.componentData.name
        };
        container.add(addItem);
        var tooltip = Ext.create('Ext.tip.ToolTip', {
            target: itemId,
            html: data.componentData.name,
            showDelay: 0,
            hideDelay: 0,
            anchor: 'top'
        });
        if(!layoutRegion.get('floatComponents')) {
            container.setHeight(getTotalChildHeight(container, '.' + addItem.cls));
        } else {
            container.setWidth(getTotalChildWidth(container, '.' + addItem.cls, 85));
        }
        var droppedEl = Ext.get(data.ddel);
        if(layoutRegion.get('useShortName')) {
            droppedEl.child('.title').update(data.componentData.shortName);
        }
        if(layoutRegion.get('floatComponents')) {
            droppedEl.addCls('float-component');
        }
        droppedEl.child('.wrangler').on('click', function() {
            editComponent(addItem);
        });
        droppedEl.child('.remove').on('click', function() {
            Ext.MessageBox.confirm(
                "Component uit layout verwijderen?",
                "Weet u zeker dat dit component uit de layout wilt verwijderen?<br />" +
                "Bij het opslaan van de layout gaat eventuele configuratie van<br />" +
                "dit component verloren als u dit component verwijdert",
                function(btnClicked) {
                    if(btnClicked == 'yes') {
                        Ext.fly(data.sourceEl).removeCls("component-added");
                        container.remove(itemId);
                        var addedComponents = layoutRegion.get('addedComponents');
                        if(!Ext.isEmpty(addedComponents) && Ext.isArray(addedComponents)) {
                            var newAddedComponents = [];
                            Ext.Array.each(addedComponents, function(comp) {
                                if(comp.name != addItem.componentName) {
                                    newAddedComponents.push(comp);
                                }
                            });
                            layoutRegion.set('addedComponents', newAddedComponents);
                        }
                        if(!layoutRegion.get('floatComponents')) {
                            container.setHeight(getTotalChildHeight(container, '.' + addItem.cls));
                        } else {
                            container.setWidth(getTotalChildWidth(container, '.' + addItem.cls));
                        }
                        tooltip.destroy();
                        Ext.Ajax.request({ 
                            url: removeComponentUrl, 
                            params: { 
                                name: componentName
                            }, 
                            success: function ( result, request ) { 
                                Ext.MessageBox.alert("Gelukt", "Het component is verwijderd.");
                                saveLayout(false);
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
            Ext.fly(data.sourceEl).addCls("component-added");
        }

        // Add component to region, so it knows which components are added
        var addComp = layoutRegion.get('addedComponents');
        addComp.push({
            "componentClass": addItem.componentClass,
            "name": addItem.componentName
        });
        layoutRegion.set('addedComponents', addComp);
    }
    
    function getElementsFromContainer(container, childquery) {
        var rootEl = container.getEl();
        return rootEl.select(childquery);
    }
    
    function getTotalChildHeight(container, childquery) {
        var children = getElementsFromContainer(container, childquery);
        var totalHeight = 0;
        children.each(function(child, c, idx) {
            totalHeight += child.getHeight();
        });
        return totalHeight;
    }
    
    function getTotalChildWidth(container, childquery, singleChildWidth) {
        // Get width of title (= contentwidth of parent)
        var containerParentWidth = container.getEl().parent().getWidth();
        // Get number of added components
        var noOfChildren = getElementsFromContainer(container, childquery).getCount();
        // Totalwidth = single component width * number of components
        var totalWidth = singleChildWidth * noOfChildren;

        return (containerParentWidth < totalWidth) ? totalWidth : containerParentWidth;
    }
    
    Ext.get('savebutton').on('click', function() {
        saveLayout();
    });
    
    var popupWin = Ext.create('Ext.window.Window', {
        title: 'Configuratie',
        closable: true,
        closeAction: 'hide',
        width: 800,
        height: 620,
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
    
    function editComponent(componentData) {
        var iframe = Ext.get('configPage');
        // Empty iframe so previously loaded content is invisible
        if(iframe.dom.contentDocument && iframe.dom.contentDocument.body && iframe.dom.contentDocument.body.innerHTML) {
            iframe.dom.contentDocument.body.innerHTML = '';
        }
        var url = configPageLink;
        if(url.indexOf("?") !== -1){
            url += "&";
        }else{
            url += "?";
        }
        url += "name="+componentData.componentName+"&className="+componentData.componentClass;
        iframe.dom.src = url;
        iframe.setStyle('display', 'block');
        popupWin.setTitle('Configuratie ' + componentData.componentPrettyName);
        popupWin.show();
    }
    
    function saveLayout(displaySuccessMessage){
        if(displaySuccessMessage == undefined){
            displaySuccessMessage = true;
        }
        var layout = {};
        layoutRegionsStore.each(function(region) {
            var regionId = region.get('id');
            var layoutConfig = {};
            if(region.get('configureWidth')) {
                Ext.apply(layoutConfig, {
                    'width': Ext.fly(regionId + '_width').getValue() || '',
                    'widthmeasure': Ext.fly(regionId + '_widthmeasure').getValue() || '',
                    'maxwidth': Ext.fly(regionId + '_maxwidth').getValue() || ''
                });
            }
            if(region.get('configureHeight')) {
                Ext.apply(layoutConfig, {
                    'height': Ext.fly(regionId + '_height').getValue() || '',
                    'heightmeasure': Ext.fly(regionId + '_heightmeasure').getValue() || '',
                    'maxheight': Ext.fly(regionId + '_maxheight').getValue() || ''
                });
            }
            var useTabs = false;
            if(region.get('configureTabs')) {
                if(Ext.fly(regionId + '_useTabs').dom.checked) {
                    useTabs = true;
                }
            }
            if(region.get('configureTitle')) {
                Ext.apply(layoutConfig, {
                    'title': Ext.fly(regionId + '_title').getValue() || ''
                });
            }
            if(region.get('configurePosition')) {
                Ext.apply(layoutConfig, {
                    'posx': Ext.fly(regionId + '_posx').getValue() || '',
                    'posy': Ext.fly(regionId + '_posy').getValue() || ''
                });
            }
            if(region.get('configureCollapsible')) {
                Ext.apply(layoutConfig, {
                    'enableCollapse': Ext.fly(regionId + '_enableCollapse').dom.checked,
                    'panelTitle': Ext.fly(regionId + '_panelTitle').getValue() || ''
                });
            }
            Ext.apply(layoutConfig, {
                'useTabs': useTabs,
                'bgcolor': Ext.fly(regionId + '_bgcolor').getValue() || ''
            });
            layout[regionId] = {
                "layout": layoutConfig,
                "components": region.data.addedComponents
            }
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
            extraCss: Ext.get('app_extracss').getValue() || ""
        };
        Ext.Ajax.request({ 
            url: layoutSaveUrl, 
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
