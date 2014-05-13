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
 * AttributeList component
 * Creates a AttributeList component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.AttributeList",{
    extend: "viewer.components.Component",
    grids: null,
    pagers: null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        tooltip:null,
        label: ""
    },    
    appLayer: null,
    featureService: null,
    layerSelector:null,
    topContainer: null,
    constructor: function (conf){        
        var minwidth = 600;
        if(conf.details.width < minwidth || !Ext.isDefined(conf.details.width)) conf.details.width = minwidth;
        viewer.components.AttributeList.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;
        this.grids={};
        this.pagers={};
        this.renderButton({
            handler: function(){
                me.showWindow();                
                me.layerSelector.initLayers();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        }); 
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,this.filterChanged,this);
        return this;
    },
    getExtComponents: function() {
        //todo: gridpanels van subgrids toevoegen.
        var list= [
            this.name + 'Container',
            this.name + 'LayerSelectorPanel',            
            this.name + 'ClosingPanel'
        ];
        for (var gridId in this.grids){
            list.push(this.name+gridId+'Grid');
            list.push(this.name+gridId+'GridPanel');
        }
        for (var pagerId in this.pagers){
            list.push(this.name+pagerId+'Pager');
            list.push(this.name+pagerId+'PagerPanel');
        }
        return list;
    },
    loadWindow : function(){
        var me = this;
        this.topContainer=Ext.create('Ext.container.Container', {
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
                id: this.name + 'mainGridPanel',
                xtype: "container",
                autoScroll: true,
                width: '100%',
                flex: 1
            },{
                id: this.name + 'mainPagerPanel',
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
                    {xtype: 'button', text: 'Sluiten', componentCls: 'mobileLarge', handler: function() {
                        me.popup.hide();
                    }}
                ]
            }]
        });
              
        var config = {
            viewerController : this.viewerController,
            restriction: "attribute",
            layers: this.layers,
            div: this.name + 'LayerSelectorPanel'
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  

    },
    showWindow : function (){
        if (this.topContainer==null){
            this.loadWindow();
        }
        this.popup.show();
    },
    clear: function() {
        for(var gridId in this.grids) {
            this.grids[gridId].destroy();
        }
        delete this.grids;
        this.grids={};
        for(var pagerId in this.pagers) {
            this.pagers[pagerId].destroy();
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
        if (this.layerSelector!=null){
            var selectedLayer = this.layerSelector.getValue();

            if(selectedLayer){
                if(selectedLayer.id == appLayer.id){
                    this.loadAttributes(appLayer);
                }
            }
        }
    },
    initGrid: function(appLayer) {
        var me = this;
        var filter=null;
        if (appLayer.filter){
            filter=appLayer.filter.getCQL();
        }
        //check if rowExpander is needed.
        var showExpand=false;
        if (appLayer.relations){
            for (var i =0; i < appLayer.relations.length; i++){
                if ("relate" === appLayer.relations[0].type.toLowerCase()){
                    showExpand=true;
                    break;
                }
            }
        }                
        this.createGrid("main",document.getElementById(this.name + 'Container'), appLayer, null, filter,true,showExpand);
    },
    onExpandRow: function(rowNode,record,expandRow,recordIndex,eOpts){
        var store=record.store;
        var rawData = store.data.items[recordIndex].raw;
        if (rawData.related_featuretypes){
            var childGridIds=[];
            for (var i=0; i < rawData.related_featuretypes.length; i++){
                var ft = rawData.related_featuretypes[i];
                var newEl =document.createElement("div");
                var gridId=""+record.index+"_"+ft.id;
                childGridIds.push(gridId);
                newEl.id=this.name +gridId+ 'Container';
                newEl.style.margin="5px";
                expandRow.children[0].children[0].appendChild(newEl);
                this.createGrid(gridId,newEl, this.appLayer, ft.id,ft.filter,false);
            }
            store.addListener("load",function(){
                for (var i=0; i < childGridIds.length; i ++){
                    this.deleteGridWithId(childGridIds[i]);
                }
            },this)
        }
        
    },
    onCollapseBody: function (rowNode,record,expandRow,eOpts){        
    },
            
    deleteGridWithId: function (gridId){
        if(this.grids[gridId]){
            this.grids[gridId].destroy();
            delete this.grids[gridId];            
        }if (this.pagers[gridId]){
            this.pagers[gridId].destroy();
            delete this.pagers[gridId];
        }
        var name=this.name+gridId;
        if (Ext.get(name + 'GridPanel')){
            Ext.get(name + 'GridPanel').destroy();
        }
        if (Ext.get(name + 'PagerPanel')){
            Ext.get(name + 'PagerPanel').destroy();
        }
    },
    /**
     * Create a grid
     */
    createGrid: function(gridId,renderToEl, appLayer, featureTypeId, relateFilter, addPager,addRowExpander){
        var me = this;
        var name=this.name;
        if (gridId){
            name+=gridId;
            if (this.grids[gridId]){
                return;
            }
        }
        if (Ext.get(name + 'GridPanel')==null){
            Ext.create('Ext.container.Container', {
                id: name + 'GridPanel',
                autoScroll: true,
                width: '100%',
                flex: 1, 
                renderTo: renderToEl.id
            });
            if(addPager){
                Ext.create('Ext.container.Container', {
                    id: name +'PagerPanel',
                    xtype: "container",
                    width: '100%',
                    height: 30,
                    renderTo: renderToEl.id
                });
            }
        }

        //var attributes = appLayer.attributes;
        var attributes = this.viewerController.getAttributesFromAppLayer(appLayer,featureTypeId);
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
                    id: "c"+name+ +attIndex,
                    header:colName,
                    dataIndex: "c" + attIndex,
                    flex: 1,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }
        var modelName= name + 'Model';
        Ext.define(modelName, {
            extend: 'Ext.data.Model',
            fields: attributeList
        });
        var filter = "";
        if(relateFilter){
            filter = "&filter="+encodeURIComponent(relateFilter);
        }
        var featureType="";
        if (featureTypeId){
            featureType="&featureType="+featureTypeId;
        }
        
        var store = Ext.create('Ext.data.Store', {
            storeId: name+"Store",
            pageSize: 10,
            model: modelName,
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                timeout: 120000,
                url: appLayer.featureService.getStoreUrl() + "&arrays=1"+featureType+filter,
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

                        Ext.getCmp(me.name + "mainGrid").getStore().removeAll();
                            
                        Ext.MessageBox.alert("Foutmelding", msg);
                        
                    }
                }
            },
            autoLoad: true
        });
        var plugins = [];
        if (addRowExpander){
            plugins.push({
                ptype: 'rowexpander',
                rowBodyTpl: [
                    ""
                ]           
            });
        }
        var g = Ext.create('Ext.grid.Panel',  {
            id: name + 'Grid',
            store: store,
            columns: columns,
            plugins: plugins,
            viewConfig:{        
                trackOver: false,
                listeners: {
                    expandbody : {
                        scope: me,
                        fn: function(rowNode,record,expandRow,eOpts,recordIndex){
                            this.onExpandRow(rowNode,record,expandRow,eOpts,recordIndex);
                        }
                    },
                    collapsebody: {
                        scope: me,
                        fn: function(rowNode,record,expandRow,eOpts,recordIndex){
                            this.onCollapseBody(rowNode,record,expandRow,eOpts,recordIndex);
                        }
                    }
                }
            },
            renderTo: name + 'GridPanel'
        });
        this.grids[gridId]=g;
        if(addPager){
            var p = Ext.create('Ext.PagingToolbar', {
                id: name + 'Pager',
                store: store,
                displayInfo: true,
                displayMsg: 'Feature {0} - {1} van {2}',
                emptyMsg: "Geen features om weer te geven",
                renderTo: name + 'PagerPanel',
                height: 30
            });
            this.pagers[gridId]=p;
        }
    }
});

