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
    pager: null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        tooltip:null
    },    
    appLayer: null,
    featureService: null,
    layerSelector:null,
    constructor: function (conf){        
        var minwidth = 600;
        if(conf.details.width < minwidth || !Ext.isDefined(conf.details.width)) conf.details.width = minwidth;
        viewer.components.AttributeList.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;
        this.renderButton({
            handler: function(){
                me.layerSelector.initLayers();
                me.showWindow();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip
        });      
        this.loadWindow();
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,this.filterChanged,this);
        return this;
    },
    getExtComponents: function() {
        return [
            this.name + 'Container',
            this.name + 'LayerSelectorPanel',
            this.name + 'GridPanel',
            this.name + 'Grid',
            this.name + 'PagerPanel',
            this.name + 'Pager',
            this.name + 'ClosingPanel',
        ];
    },
    loadWindow : function(){
        var me = this;
        Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [{
                id: this.name + 'LayerSelectorPanel',
                xtype: "container",
                padding: "4px",
                width: '100%',
                height: 36
            },{
                id: this.name + 'GridPanel',
                xtype: "container",
                autoScroll: true,
                width: '100%',
                flex: 1
            },{
                id: this.name + 'PagerPanel',
                xtype: "container",
                width: '100%',
                height: 30
            },{
                id: this.name + 'ClosingPanel',
                xtype: "container",
                width: '100%',
                height: MobileManager.isMobile() ? 45 : 25,
                style: {
                    marginTop: '10px'
                },
                layout: {
                    type:'hbox',
                    pack:'end'
                },
                items: [
                    {xtype: 'button', text: 'Sluiten', padding: MobileManager.isMobile() ? '10px' : '2px', handler: function() {
                        me.popup.hide();
                    }}
                ]
            }]
        });
              
        var config = {
            viewerController : this.viewerController,
            restriction: "attribute",
//            restriction : "hasConfiguredLayers",
//            layers: this.layers,
            div: this.name + 'LayerSelectorPanel'
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  

    },
    showWindow : function (){
        this.popup.show();
    },
    clear: function() {
        if(this.grid) {
            this.grid.destroy();
        }
        if(this.pager) {
            this.pager.destroy();
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
    // Called when the layerSelector was changed. 
    layerChanged : function (appLayer){
        this.loadAttributes(appLayer);
    },
    filterChanged : function (filter,appLayer){
        var selectedLayer = this.layerSelector.getValue();
 
        if(selectedLayer){
            if(selectedLayer.id == appLayer.id){
                this.loadAttributes(appLayer);
            }
        }
    },
    initGrid: function(appLayer) {
        var me = this;
        
        var attributes = appLayer.attributes;
        var attributeList = new Array();
        var columns = new Array();
        var index = 0;
        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            if(attribute.visible){
                
                var attIndex = index++;
                
                var colName = attribute.alias != undefined ? attribute.alias : attribute.name;
                attributeList.push({
                    name: "c" + attIndex,
                    type : 'string'
                });
                columns.push({
                    id: "c" +attIndex,
                    text:colName,
                    dataIndex: "c" + attIndex,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }
        Ext.define(this.name + 'Model', {
            extend: 'Ext.data.Model',
            fields: attributeList
        });
        var filter = "";
        if(appLayer.filter){
            filter = "&filter="+encodeURIComponent(appLayer.filter.getCQL());
        }
        var store = Ext.create('Ext.data.Store', {
            pageSize: 10,
            model: this.name + 'Model',
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                timeout: 40000,
                url: appLayer.featureService.getStoreUrl() + "&arrays=1"+filter,
                reader: {
                    type: 'json',
                    root: 'features',
                    totalProperty: 'total'
                },
                simpleSortMode: true,
                listeners: {
                    exception: function(store, response, op) {
                        
                        msg = response.responseText;
                        if(response.status == 200) {
                            try {
                                var j = Ext.JSON.decode(response.responseText);
                                if(j.message) {
                                    msg = j.message;
                                }
                            } catch(e) {
                            }
                        }
                        
                        if(msg == null) {
                            if(response.timedout) {
                                msg = "Request timed out";
                            } else if(response.statusText != null && response.statusText != "") {
                                msg = response.statusText;
                            } else {
                                msg = "Unknown error";
                            }
                        }

                        Ext.getCmp(me.name + "Grid").getStore().removeAll();
                            
                        Ext.MessageBox.alert("Foutmelding", msg);
                        
                    }
                }
            },
            autoLoad: true
        });

        this.grid = Ext.create('Ext.grid.Panel',  {
            id: this.name + 'Grid',
            store: store,
            columns: columns,
            renderTo: this.name + 'GridPanel'
        });
        
        this.pager = Ext.create('Ext.PagingToolbar', {
            id: this.name + 'Pager',
            store: store,
            displayInfo: true,
            displayMsg: 'Feature {0} - {1} van {2}',
            emptyMsg: "Geen features om weer te geven",
            renderTo: this.name + 'PagerPanel',
            height: 30
        });
    }
});

