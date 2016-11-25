/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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

/**
 * LayerSwitch component
 * 
 * Creates a Ext.button.Cycle to allow the user to quickly change the background
 * layer without the complexity of a TOC component.
 * 
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.LayerSwitch",{
    extend: "viewer.components.Component",
    
    items: null,
    selectedBackgroundLevels: null,
    control: null,
    container: null,

    config: {
        top:null,
        left:null
    },
    
    constructor: function (conf){
        conf.top = conf.top === undefined ? 5 : conf.top;
        conf.left = conf.left === undefined ? 5 : conf.left;
        this.initConfig(conf);
		viewer.components.LayerSwitch.superclass.constructor.call(this, this.config);
        this.loadComponent();
        
        this.config.viewerController.on(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, function() {
            this.loadComponent();
        }, this);
        
        this.config.viewerController.mapComponent.getMap().on(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED, 
            this.layerVisibilityChanged, this);
        
        this.config.viewerController.on(viewer.viewercontroller.controller.Event.ON_COMPONENTS_FINISHED_LOADING, function() {
            if(this.container) {
                // console.log('ToFRONT-after-components-load');
                this.container.zIndexManager.bringToFront(this.container, true);
            }
        }, this);
        
        return this;
    },
    
    loadComponent : function (){
        this.loadItems();
        if(this.container === null) {
            this.container = Ext.create('Ext.container.Container', {
                renderTo:  this.div,
                floating: true,
                border: false,
                shadow: false,
                // top:  '30px',
                style: {
                    'zIndex': 1002
                }
            });
            // this.container.zIndexManager.bringToFront(this.container, true);
        }
        if(this.button) {
            this.button.destroy();
        }
        this.button = Ext.create('Ext.button.Cycle', {
            showText: true,
            menu: {
                id: 'view-type-menu',
                items: this.items
            },
            listeners:{
                change:{
                    fn: this.controlItemChanged,
                    scope: this
                }
            }
        });
        this.container.add(this.button);
        this.alignContainer();
    },
    
    alignContainer: function() {
        if(!this.container) {
            return;
        }
        var pos = [Number(this.config.left), Number(this.config.top)];
        var align = 'tl';
        if(this.config.alignposition) {
            align = this.config.alignposition;
        }
        if(align.substr(0, 1) === 'b') {
            pos[1] = pos[1] * -1;
        }
        if(align.substr(1) === 'r') {
            pos[0] = pos[0] * -1;
        }
        var mapContainer = Ext.get(this.config.viewerController.getMapId());
        this.container.alignTo(mapContainer, [align, align].join('-'), pos);
        this.config.viewerController.anchorTo(this.container, mapContainer, [align, align].join('-'), pos);
    },
    
    levelItemId: function(level) {
        return this.name + "_l" + level.id;
    },
    
    levelFromItemId: function(id) {
        var levelId = Number(id.substring(this.name.length+"_i".length));
        var l = null;
        Ext.each(this.selectedBackgroundLevels, function(level) {
            if(level.id == levelId) {
                l = level;
                return false;
            }
            return true;
        });
        return l;
    },
    
    loadItems: function() {
        var me = this;
        
        // Find out which background levels are in the selected content
        me.selectedBackgroundLevels = [];
        this.config.viewerController.traverseSelectedContent(function(level) {
            if(level && level.background) {
                me.selectedBackgroundLevels.push(level);
            }
        }, Ext.emptyFn);

        // Create control items
        me.items = [];
        var checkedBackgroundLevel = this.getCheckedBackgroundLevel();
        Ext.each(me.selectedBackgroundLevels, function(level) {
            me.items.push({
                id: me.levelItemId(level),
                text: level.name,
                // iconCls: 'view-text',
                checked: level == checkedBackgroundLevel
            });
        });
    },

    /**
     * Assume only one background level is 'checked' by checking if any of the
     * layers in the level is checked. 
     */
    getCheckedBackgroundLevel: function() {
        var me = this;
        var foundLevel = null;
        Ext.each(this.selectedBackgroundLevels, function(level) {
            Ext.each(level.layers, function(appLayerId) {
                if(me.config.viewerController.getAppLayerById(appLayerId).checked) {
                    foundLevel = level;
                    return false;
                }
                return true;
            });
            return foundLevel == null;
        });
        return foundLevel;
    },
    
    controlItemChanged: function(control, item) {
        var me = this;
        // XXX either change background when layers initialized or only enable
        // control when layers initialized
        if(this.config.viewerController.layersInitialized) {
            var selectedLevel = me.levelFromItemId(item.id);
            Ext.each(this.selectedBackgroundLevels, function(level) {
                var checked = level == selectedLevel;
                Ext.each(level.layers, function(appLayerId) {
                    var appLayer = me.config.viewerController.getAppLayerById(appLayerId);
                    me.config.viewerController.setLayerVisible(appLayer, checked);                    
                });
            });
        }
        this.alignContainer();
    },
    
    layerVisibilityChanged: function(map, event) {

        var eventLevel = this.config.viewerController.getAppLayerParent(event.layer.id);
        var backgroundLevel = null;
        Ext.each(this.selectedBackgroundLevels, function(level) {
            if(level == eventLevel) {
                backgroundLevel = level;
                return false;
            }
            return true;
        });
        
        if(backgroundLevel == null) {
            return;
        }

        if(event.visible) {
            var itemId = this.levelItemId(backgroundLevel);
            var activeItem = this.button.menu.items.getByKey(itemId);
            this.button.setActiveItem(activeItem, true);
        }
    },
    
    getExtComponents: function() {
        return [ this.container ];
    }
});
