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

Ext.Loader.setConfig({enabled:true});
Ext.Loader.setPath('Ext.ux', uxpath);
Ext.require([
    'Ext.container.*',
    'Ext.view.*',
    'Ext.data.*',
    'Ext.dd.*',
    'Ext.layout.*',
    'Ext.ux.BoxReorderer',
    'Component'
]);

Ext.onReady(function() {
    var layoutRegions = [
        {id:'header', htmlId:'layout_header', useShortName:false, floatComponents: false},
        {id:'leftmargin_top', htmlId:'layout_left_top', useShortName:false, floatComponents: false},
        {id:'leftmargin_bottom', htmlId:'layout_left_bottom', useShortName:false, floatComponents: false},
        {id:'left_menu', htmlId:'layout_left_menu', useShortName:false, floatComponents: false},
        {id:'top_menu', htmlId:'layout_top_menu', useShortName:true, floatComponents: true},
        {id:'content', htmlId:'layout_content', useShortName:false, floatComponents: false},
        {id:'popupwindow', htmlId:'layout_popupwindow', useShortName:false, floatComponents: false},
        {id:'rightmargin_top', htmlId:'layout_right_top', useShortName:false, floatComponents: false},
        {id:'rightmargin_bottom', htmlId:'layout_right_bottom', useShortName:false, floatComponents: false},
        {id:'footer', htmlId:'layout_footer', useShortName:false, floatComponents: false}
    ];
    
    var componentStore = Ext.create('Ext.data.Store', {
        model: 'Component',
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
            {name: 'addedComponents', type: 'array'}
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
                    '<div class="remove"></div>' +
                    '<div class="wrangler"></div>' +
                    '<div class="title">{name}</div>' +
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

    function initRegions() {
        layoutRegionsStore.each(function(layoutRegion) {
            var layoutType = 'vbox';
            var flexValue = 0;
            if(layoutRegion.get('floatComponents')) {
                layoutType = 'hbox';
                flexValue = 0;
            }
            var regionContainer = Ext.create('Ext.container.Container', {
                cls: 'component-container',
                layout: { 
                    type: layoutType,
                    shrinkToFit: false
                },
                style: {
                    width: '100%',
                    /* height: '100%', */
                    minHeight: '25px'
                },
                defaults: {
                    reorderable: true,
                    flex: flexValue
                },
                autoScroll: true,
                renderTo: layoutRegion.get('htmlId'),
                plugins : Ext.create('Ext.ux.BoxReorderer',{}),
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
        componentStore.each(function(component){
            if(!Ext.isEmpty(component.get('addedToRegions'))) {
                Ext.Array.each(component.get('addedToRegions'), function(regionid, index) {
                    var region = layoutRegionsStore.findRecord('id', regionid);
                    var sourceEl = view.getNode(component);
                    if(sourceEl && region) {
                        var d = sourceEl.cloneNode(true);
                        d.id = Ext.id();
                        var data = {
                            sourceEl: sourceEl,
                            repairXY: Ext.fly(sourceEl).getXY(),
                            ddel: d,
                            componentData: component.data
                        }
                        addComponentToRegion(region.regionContainer, data, region);
                    }
                });
            }
        });
    }
    
    function addComponentToRegion(container, data, layoutRegion) {
        var styleConfig = {
            width: '100%'
        };
        if(layoutRegion.get('floatComponents')) {
            styleConfig = {};
        }
        var itemId = Ext.id();
        var addItem = {
            id: itemId,
            xtype: 'container',
            cls: 'component-container-item',
            contentEl: data.ddel,
            style: styleConfig
        };
        container.add(addItem);
        if(!layoutRegion.get('floatComponents')) {
            container.setHeight(getTotalChildHeight(container, '.' + addItem.cls));
        }
        var droppedEl = Ext.get(data.ddel);
        if(layoutRegion.get('useShortName')) {
            droppedEl.child('.title').update(data.componentData.shortName);
        }
        if(layoutRegion.get('floatComponents')) {
            droppedEl.addCls('float-component');
        }
        droppedEl.child('.wrangler').on('click', function() {
            editComponent(data.componentData);
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
                    }
                }
            );
        });
        if(data.componentData.addOnce) {
            Ext.fly(data.sourceEl).addCls("component-added");
        }
        
        // Add region to component, so it knows the regions its added to
        var addedToRegions = data.componentData.addedToRegions;
        if(Ext.isEmpty(addedToRegions)) {
            addedToRegions = [layoutRegion.get('id')];
        } else {
            // check if it is not added already
            if(!Ext.Array.contains(data.componentData.addedToRegions, layoutRegion.get('id'))) {
                addedToRegions.push(layoutRegion.get('id'));
            }
        }
        data.componentData.addedToRegions = addedToRegions;

        // Add component to region, so it knows which components are added
        var addedComponents = layoutRegion.get('addedComponents');
        if(Ext.isEmpty(addedComponents)) {
            addedComponents = new Array();
        }
        addedComponents.push(data.componentData.id);
        layoutRegion.set('addedComponents', addedComponents);
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
    
    Ext.get('savebutton').on('click', function() {
        var components = [];
        Ext.Array.each(componentStore.data.items, function(comp, index) {
            components.push(comp.data);
        });
        var layoutRegions = [];
        Ext.Array.each(layoutRegionsStore.data.items, function(layout, index) {
            layoutRegions.push(layout.data);
        });
        var response = {
            'components': components,
            'layoutRegions': layoutRegions
        };
        // Save JSON data to backend, using AJAX, form post, etc?
        console.log('Saving data...', response);
    });
});

function editComponent(componentData) {
    console.log('Edit!', componentData);
}