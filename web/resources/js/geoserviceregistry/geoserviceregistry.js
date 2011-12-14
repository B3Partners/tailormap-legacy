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
Ext.require([
    'Ext.tree.*',
    'Ext.data.*'
]);

Ext.onReady(function() {
    
    Ext.define('TreeNode', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'id', type: 'string' },
            { name: 'children', type: 'array' },
            { name: 'name', type: 'string' },
            { name: 'type',  type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'class', type: 'string' },
            
            // Text is used by tree, mapped to name
            { name: 'text', type: 'string', mapping: 'name' }
        ],
        get: function(fieldName) {
            var nodeType = '';
            if(fieldName == "icon") {
                nodeType = this.get('type');
                if(nodeType == "category") return foldericon;
                if(nodeType == "layer") return layericon;
                if(nodeType == "service") {
                    var nodeStatus = this.get('status');
                    if(nodeStatus == "ok") return serviceokicon;
                    if(nodeStatus == "error") return serviceerroricon;
                // default?
                }
            // default?
            }
            if(fieldName == "leaf") {
                nodeType = this.get('type');
                if(nodeType == "layer" && this.get('children') == undefined) return true;
                return false;
            }
            
            // From ExtJS source
            return this[this.persistenceProperty][fieldName];
        }
    });
    
    var treeStore = Ext.create('Ext.data.TreeStore', {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: treeurl
        },
        defaultRootId: 0,
        defaultRootProperty: 'children',
        model: TreeNode,
        nodeParam: 'category'
    });

    var categoryMenu = new Ext.menu.Menu({
        items: [{
            text: 'Nieuwe categorie toevoegen',
            icon: foldericon,
            listeners: {
                click: function(item, e, eOpts) {
                    Ext.MessageBox.show({
                        title:'Nieuwe categorie toevoegen',
                        msg: 'Naam van nieuwe categorie:',
                        buttons: Ext.MessageBox.OKCANCEL,
                        prompt:true,
                        fn: function(btn, text, cBoxes){
                            if(btn=='ok' && text){
                                // Ajax request: create category(text)
                                // Response: json
                                // tree.getRootNode().appendChild(json node);
                            }
                        }
                    });
                }
            }
        }]
    });

    var tree = Ext.create('Ext.tree.Panel', {
        store: treeStore,
        rootVisible: false,
        useArrows: true,
        frame: true,
        title: 'Services',
        renderTo: 'tree-container',
        width: 300,
        height: 400,
        listeners: {
            containercontextmenu: function(view, event, eOpts) {
                categoryMenu.showAt(event.getXY());
                event.stopEvent();
            }
        }
    });
    
});