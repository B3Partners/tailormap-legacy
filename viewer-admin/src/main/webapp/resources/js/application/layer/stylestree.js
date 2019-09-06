/*
 * Copyright (C) 2019 B3Partners B.V.
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

/* global Ext, i18next */

Ext.define('vieweradmin.components.ApplicationTreeLayerStyles', {

    requires: [
        'Ext.tree.*',
        'Ext.data.*'
    ],

    config: {
        styles: [],
        savedState:{}
    },
    stylesorder:null,
    toggleState: true,
    constructor: function (config) {
        this.initConfig(config);
        this.createTree();
    },
    createTree: function () {
        var s = this.config.styles;
        var stylesArray = [];
        
        var savedStyles = {};
        for(var i = 0 ; i < this.config.savedState.length ; i++){
            var state = this.config.savedState[i];
            savedStyles[state.name] = state;
        }
        var newItems = []; // items not in savedstyles. To be added at the tail.
        for (var key in s) {
            if (s.hasOwnProperty(key)) {
                var name = s[key].name;
                if (savedStyles[name]) {

                    stylesArray[savedStyles[name].order] = {
                        title: s[key].styleTitle,
                        name: name,
                        leaf: true,
                        text: s[key].styleTitle,
                        checked: savedStyles[name].checked
                    };
                } else {
                    newItems.push({
                        title: s[key].styleTitle,
                        name: s[key].name,
                        leaf: true,
                        text: s[key].styleTitle,
                        checked: false
                    });
                }
            }
        }
        
        stylesArray = stylesArray.concat(newItems);

        var styles = [];
        for (var i = 0; i < stylesArray.length; i++) {
            var s = stylesArray[i];
            if (s) {
                styles.push(s);
            }
        }
        var store =  Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: stylesArray
            }
        });
        this.stylesorder = Ext.create('Ext.tree.Panel', {
            store: store,
            rootVisible: false,
            selModel: { mode: "SINGLE" },
            useArrows: true,
            frame: true,
            width: 625,
            autoScroll: true,
            margin: 10,
            viewConfig: {
                plugins: {
                    ptype: 'treeviewdragdrop',
                    allowContainerDrops: true,
                    allowParentInserts: true,
                    sortOnDrop: true
                }
            },
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    layout: {
                        pack: 'end'
                    },
                    items: [
                        {
                            text: i18next.t('viewer_admin_attributes_0'),
                            listeners: {
                                click: {
                                    fn: function(a,b,c) { 
                                        this.toggleStyles(); 
                                    },
                                    scope: this
                                }
                            }
                        }
                    ]
                }
            ]
        });
        
        return this.stylesorder;
    },
    toggleStyles:function(){
        this.stylesorder.getStore().each(function(record) {
            if(record.get("leaf") === true) {
                record.set("checked", this.toggleState);
            }
        }, this);
        this.toggleState = !this.toggleState;
    },
    getJson: function(){
                
        var styles = [];
        var orderindex = 0;
        this.stylesorder.getStore().each(function(record) {
            if(record.get("leaf") === true) {
                styles.push({
                    name: record.get("name"),
                    checked: record.get("checked"),
                    title: record.get("title"),
                    order: orderindex++
                });
            }
        }, this);
        return styles;
    },
    getItems: function(){
        return [this.stylesorder];
    }
});