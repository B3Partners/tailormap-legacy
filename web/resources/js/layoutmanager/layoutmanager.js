/*
 * Copyright (C) 2011 B3Partners B.V.
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
        {id:'header', htmlId:'layout_header', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'leftmargin_top', htmlId:'layout_left_top', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'leftmargin_bottom', htmlId:'layout_left_bottom', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'left_menu', htmlId:'layout_left_menu', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'top_menu', htmlId:'layout_top_menu', useShortName:true, floatComponents: true, addedComponents:[]},
        {id:'content', htmlId:'layout_content', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'popupwindow', htmlId:'layout_popupwindow', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'rightmargin_top', htmlId:'layout_right_top', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'rightmargin_bottom', htmlId:'layout_right_bottom', useShortName:false, floatComponents: false, addedComponents:[]},
        {id:'footer', htmlId:'layout_footer', useShortName:false, floatComponents: false, addedComponents:[]}
    ];
    
    var layoutJson = {
       top_menu: {
           layout: {
               width: 300,
               widthmeasure: '%',
               height: 200
           },
           components:[
               {
                   className: "Zoom",
                   name: "zoom1"
               },
               {
                   className: "OpenStreetViewTool",
                   name: "streetview1"
               }
           ]
       }
   };

    Ext.define("DraggableViewerComponent",{
        extend: "Ext.data.Model",
        idProperty: 'id',       
        fields: [
            {name: 'className', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'shortName', type: 'string'},
            {name: 'restrictions', type: 'array'},
            {name: 'singleton', type: 'boolean'},
            {name: 'linkedComponents', type: 'array'}
        ]
    });
    
    var componentStore = Ext.create('Ext.data.Store', {
        model: 'DraggableViewerComponent',
        data: components
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
            {name: 'maxheight', type: 'string', defaultValue:''}
        ],
        isComponentAdded: function(compid) {
            var isAdded = false;
            Ext.Array.each(this.get('addedComponents'), function(comp, index) {
                if(comp == compid) {
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
        
    Ext.create('Ext.view.View', {
        cls: 'component-view',
        tpl: '<tpl for=".">' +
        '<div class="component-block">' +
        '<span class="title">{name}</span>' +
        '<div class="remove"></div>' +
        '<div class="wrangler"></div>' +
        '<div style="clear: both;"></div>' +
        '</div>' +
        '</tpl>',
        itemSelector: 'div.component-block',
        overItemCls: 'component-over',
        selectedItemClass: 'component-selected',
        singleSelect: true,
        store: componentStore,
        renderTo: 'component-container',
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
                    }
                });
            },
            viewready: function(view, e) {
                initRegions();
                initConfig(view);
            }
        }
    });

    function changeCaseFirstLetter(string, lowercase) {
        var firstChar = "";
        if(!lowercase) {
            firstChar = string.charAt(0).toUpperCase();
        } else {
            firstChar = string.charAt(0).toLowerCase();
        }
        return firstChar + string.slice(1);
    }

    function initRegions() {
        layoutRegionsStore.each(function(layoutRegion) {
            // TODO: make this better
            var layoutRegionElement = Ext.get(layoutRegion.get('htmlId'));
            if(layoutRegionElement) {
                layoutRegionElement.insertHtml('beforeEnd',
                    '<div class="layout_title">' +
                        '<strong class="layoutregion_title">' + changeCaseFirstLetter(layoutRegion.get('id').replace('_', ' '), false) + '</strong><br />' + 
                        '<div class="regionconfig">' + 
                            '<u>Visuele configuratie</u><br />' + 
                            '<div class="widthconfig">' + 
                                'Breedte:<br />' + 
                                '<input type="text" id="' + layoutRegion.get('id') + '_width" />' +
                                '<select id="' + layoutRegion.get('id') + '_widthmeasure">' +
                                    '<option value="px">px</option>' + 
                                    '<option value="%">%</option>' + 
                                '</select><br />' + 
                                '<input type="text" id="' + layoutRegion.get('id') + '_maxwidth" /> ' + 
                                'px, maximaal' + 
                            '</div>' + 
                            '<div class="heightconfig">' + 
                                'Hoogte:<br />' + 
                                '<input type="text" id="' + layoutRegion.get('id') + '_height" />' + 
                                '<select id="' + layoutRegion.get('id') + '_heightmeasure">' + 
                                    '<option value="px">px</option>' + 
                                    '<option value="%">%</option>' + 
                                '</select><br />' + 
                                '<input type="text" id="' + layoutRegion.get('id') + '_maxheight" /> ' + 
                                'px, maximaal' + 
                             '</div>' + 
                        '</div>' + 
                        '<div style="clear: both;"></div>' + 
                     '</div>', true
                );
                layoutRegionElement.child('.layout_title').child('.layoutregion_title').on('click', function(event, obj) {
                        layoutRegionElement.child('.layout_title').child('.regionconfig').toggle(true);
                });
                layoutRegionElement.child('.layout_title').child('.regionconfig').setVisibilityMode(2).setVisible(false);
            }
            var layoutType = 'vbox';
            var styleConfig = {
                width: '100%',
                minHeight: '25px'
            }
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
                                var restrictions = data.componentData.restrictions;
                                var linkedComponents = data.componentData.linkedComponents;
                                var dropId = layoutRegion.get('id');
                                if(Ext.isEmpty(restrictions) || (Ext.isArray(restrictions) && Ext.Array.contains(restrictions, dropId))) {
                                    if(!Ext.isEmpty(linkedComponents)) {
                                        if(Ext.isArray(linkedComponents)) {
                                            var linkedComponentAdded = false;
                                            Ext.Array.each(linkedComponents, function(comp, index) {
                                                if(layoutRegion.isComponentAdded(comp)) {
                                                    linkedComponentAdded = true;
                                                }
                                            });
                                            if(linkedComponentAdded) return false;
                                        }
                                    }
                                    return true;
                                }
                                return false;
                            }
                        });
                    }
                }
            });
            layoutRegion.regionContainer = regionContainer;
        });
    }
    
    // Initial config. Adds all previously added components to the right regions
    function initConfig(view) {
        if(Ext.isDefined(layoutJson)) {
            layoutRegionsStore.each(function(layoutRegion){
                var regionId = layoutRegion.get('id');
                if(Ext.isDefined(layoutJson[regionId])) {
                    if(Ext.isDefined(layoutJson[regionId]['layout'])) {
                        Ext.fly(regionId + '_width').set({value:(layoutJson[regionId]['layout']['width'] || '')});
                        var widthMeasureSelect = Ext.get(regionId + '_widthmeasure');
                        Ext.each(widthMeasureSelect.dom.options, function(item, index){
                            if(item.value == layoutJson[regionId]['layout']['widthmeasure']) widthMeasureSelect.dom.selectedIndex = index;
                        });
                        Ext.fly(regionId + '_maxwidth').set({value:(layoutJson[regionId]['layout']['maxwidth'] || '')});
                        Ext.fly(regionId + '_height').set({value:(layoutJson[regionId]['layout']['height'] || '')});
                        var heightMeasureSelect = Ext.get(regionId + '_widthmeasure');
                        Ext.each(heightMeasureSelect.options, function(item, index){
                            if(item.value == layoutJson[regionId]['layout']['heighthmeasure']) heightMeasureSelect.selectedIndex = index;
                        });
                        Ext.fly(regionId + '_maxheight').set({value:(layoutJson[regionId]['layout']['maxheight'] || '')});
                    }
                    if(Ext.isDefined(layoutJson[regionId]['components'])) {
                        Ext.Array.each(layoutJson[regionId]['components'], function(componentref, index) {
                            var component = componentStore.findRecord('className', componentref.className);
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
                                }
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
        var componentName = changeCaseFirstLetter(data.componentData.className, true) + (++data.componentData.componentsAdded);
        // used when loading existing conf
        if(Ext.isDefined(data.componentName) && !Ext.isEmpty(data.componentName)) {
            componentName = data.componentName;
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
                "dit component verloren als u dit component verwijderd",
                function(btnClicked) {
                    if(btnClicked == 'yes') {
                        Ext.fly(data.sourceEl).removeCls("component-added");
                        container.remove(itemId);
                        var addedToRegions = data.componentData.addedToRegions;
                        if(!Ext.isEmpty(addedToRegions) && Ext.isArray(addedToRegions)) {
                            Ext.Array.remove(addedToRegions, layoutRegion.get('id'));
                        }
                        var addedComponents = layoutRegion.get('addedComponents');
                        if(!Ext.isEmpty(addedComponents) && Ext.isArray(addedComponents)) {
                            Ext.Array.remove(addedToRegions, data.componentData.id);
                        }
                        
                        if(!layoutRegion.get('floatComponents')) {
                            container.setHeight(getTotalChildHeight(container, '.' + addItem.cls));
                        } else {
                            container.setWidth(getTotalChildWidth(container, '.' + addItem.cls));
                        }
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
        layoutRegion.set('somethingElse', 'something');
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
        var layout = {};
        layoutRegionsStore.each(function(region) {
            var regionId = region.get('id');
            layout[regionId] = {
                "layout": {
                    'width': Ext.fly(regionId + '_width').getValue() || '',
                    'widthmeasure': Ext.fly(regionId + '_widthmeasure').getValue() || '',
                    'maxwidth': Ext.fly(regionId + '_maxwidth').getValue() || '',
                    'height': Ext.fly(regionId + '_height').getValue() || '',
                    'heightmeasure': Ext.fly(regionId + '_heightmeasure').getValue() || '',
                    'maxheight': Ext.fly(regionId + '_maxheight').getValue() || ''
                },
                "components": region.data.addedComponents
            }
        });
        var response = {
            "layout": JSON.stringify(layout)
        };
        
        Ext.Ajax.request({ 
            url: layoutSaveUrl, 
            params: { 
                layout: response
            }, 
            success: function ( result, request ) { 
                var data = Ext.JSON.decode(result.responseText); 
                // doe wat met data 
            }, 
            failure: function ( result, request) { 
                Ext.MessageBox.alert('Foutmelding', result.responseText); 
            } 
        }); 

        // Save JSON data to backend, using AJAX, form post, etc?
        console.log('Saving data...', response);
    });
    
    var popupWin = Ext.create('Ext.window.Window', {
        title: 'Configuratie',
        closable: true,
        closeAction: 'hide',
        width: 800,
        height: 600,
        layout: 'fit',
        modal: true,
        contentEl: 'configPage'
    });
    
    function editComponent(componentData) {
        var iframe = Ext.get('configPage');
        // Empty iframe so previously loaded content is invisible
        if(iframe.dom.contentDocument && iframe.dom.contentDocument.body && iframe.dom.contentDocument.body.innerHTML) {
            iframe.dom.contentDocument.body.innerHTML = '';
        }
        iframe.dom.src = configPageLink + "&name="+componentData.componentName+"&className="+componentData.componentClass;
        iframe.setStyle('display', 'block');
        popupWin.setTitle('Configuratie ' + componentData.componentPrettyName);
        popupWin.show();
    }

});
