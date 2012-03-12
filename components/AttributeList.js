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
/**
 * AttributeList component
 * Creates a AttributeList component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.AttributeList",{
    extend: "viewer.components.Component",
    grid: null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        tooltip:null
    },    
    appLayer: null,
    featureService: null,
    constructor: function (conf){        
        conf.width=  600;
        viewer.components.AttributeList.superclass.constructor.call(this, conf);
        this.initConfig(conf);        
        this.loadButton();
        this.loadWindow();
        return this;
    } ,
    loadButton : function(){
        Ext.create('Ext.Button', {
            renderTo: this.div,
            icon: this.iconUrl,
            tooltip: this.tooltip,
            listeners: {
                click:{
                    scope: this,
                    fn: this.showWindow
                }
            }
        });
    },
    loadWindow : function(){
        var config = {
            viewerController : this.viewerController,
            restriction : "attribute",
            div: this.getContentDiv()
        };
        var ls = Ext.create("viewer.components.LayerSelector",config);
        ls.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  

    },
    showWindow : function (){
        this.popup.show();
    },
    clear: function() {
        if(this.grid) {
            this.grid.destroy();
        }
        delete this.appLayer;
        delete this.featureService;
    },
    loadAttributes: function(appLayer) {
        this.clear();
        
        this.appLayer = appLayer;
        
        var me = this;
        
        if(this.appLayer != null) {
            
            this.featureService = this.viewerController.getAppLayerFeatureService(this.appLayer);
            
            // check if featuretype was loaded
            if(this.appLayer.attributes == undefined) {
                this.featureService.loadAttributes(me.appLayer, function(attributes) {
                    me.initGrid(me.appLayer);
                });
            } else {
                this.initGrid(me.appLayer);
            }    
        }
    },
    layerChanged : function (item){
        
        var appLayer = this.viewerController.getApplayer(item.serviceId, item.name);
        
        this.loadAttributes(appLayer);
    },
    initGrid: function(appLayer) {
        
        var attributes = appLayer.attributes;
        var attributeList = new Array();
        var columns = new Array();
        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            if(attribute.visible){
                
                var colName = attribute.alias != undefined ? attribute.alias : attribute.name.substring(attribute.name.lastIndexOf(".")+1);
                attributeList.push({
                    name: attribute.name,
                    type : 'string'
                });
                columns.push({
                    id: attribute.name,
                    text:colName,
                    dataIndex: attribute.name,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }
        Ext.define('TableRow', {
            extend: 'Ext.data.Model',
            fields: attributeList
        });

        var store = Ext.create('Ext.data.Store', {
            pageSize: 4,
            model: 'TableRow',
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                url: appLayer.featureService.getStoreUrl(),
                reader: {
                    type: 'json',
                    root: 'features',
                    totalProperty: 'total'
                },
                simpleSortMode: true
            },
            autoLoad: true
        });

        this.grid = Ext.create('Ext.grid.Panel',  {
            id: 'editGrid',
            store: store,
            columns: columns,
            bbar: Ext.create('Ext.PagingToolbar', {
                store: store,
                displayInfo: true,
                displayMsg: 'Feature {0} - {1} of {2}',
                emptyMsg: "Geen features om weer te geven"
            })/*,
            plugins: [ 
                Ext.create('Ext.ux.grid.GridHeaderFilters', {
                    enableTooltip: false
                })
            ],*/,
            renderTo: this.getContentDiv()
        });
    }
});

