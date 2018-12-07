/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

/**
 * AttributeList component
 * Creates a AttributeList component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.AttributeList",{
    extend: "viewer.components.Component",
    grids: null,
    pagers: null,
    attributeIndex: 0,
    expandedRows: [],
    requestThresholdCounter:null,
    config: {
        layers:null,
        title: "",
        iconUrl:null,
        tooltip:null,
        label: "",
        defaultDownload: "SHP",
        autoDownload: false,
        downloadParams: "",
        addZoomTo: false,
        zoomToBuffer: 10,
        showLayerSelectorTabs: false,
        showAttributelistLinkInFeatureInfo: false,
        requestThreshold: 2000,
        details: {
            minWidth: 600,
            minHeight: 300
        }
    },
    appLayer: null,
    featureService: null,
    layerSelector:null,
    topContainer: null,
    schema: null,
    featureExtentService: null,
    firstLayerLoaded: false,
    loadLayerOnPopupShow: "",
    constructor: function (conf){
        conf.details.useExtLayout = true;
        this.initConfig(conf);
        viewer.components.AttributeList.superclass.constructor.call(this, this.config);
        var me = this;
        this.grids={};
        this.pagers={};
        this.renderButton({
            handler: function() {
                var deferred = me.createDeferred();
                me.showWindow();
                if(me.loadLayerOnPopupShow) {
                    me.loadAttributes(me.loadLayerOnPopupShow);
                } else {
                    me.loadFirstLayer();
                }
                return deferred.promise;
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });
        this.schema = new Ext.data.schema.Schema();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_FILTER_ACTIVATED,this.filterChanged,this);
        this.loadWindow();
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
            if(!this.grids.hasOwnProperty(gridId)) {
                continue;
            }
            list.push(this.name+gridId+'Grid');
            list.push(this.name+gridId+'GridPanel');
        }
        for (var pagerId in this.pagers){
            if(!this.pagers.hasOwnProperty(pagerId)) {
                continue;
            }
            list.push(this.name+pagerId+'Pager');
            list.push(this.name+pagerId+'PagerPanel');
        }
        return list;
    },
    loadWindow : function(){
        var me = this;

        // create layerselector
        var config = {
            viewerController : this.config.viewerController,
            restriction: "attribute",
            layers: this.config.layers,
            useTabs: this.config.showLayerSelectorTabs,
            rememberSelection: true
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE, this.layerChanged, this);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, this.layerSelectorInit, this);

        var closingPanelOptions = {
            id: this.name + 'ClosingPanel',
            xtype: "container",
            style: {
                margin: '5px'
            },
            layout: {
                type:'hbox'
            },
            items: [
                {
                    xtype: 'button',
                    itemId: 'zoomToAll',
                    text: i18next.t('viewer_components_attributelist_0'),
                    disabled: true,
                    scope: this,
                    handler: this.zoomToAllFeatures,
                    hidden: !this.config.addZoomTo
                },
                { xtype: 'container', flex: 1 },
                {xtype: 'button', style: { marginRight: '5px' }, id:"downloadButton",text: i18next.t('viewer_components_attributelist_1'),disabled:true, scope:this, handler:function(){
                        this.download();
                    }},
                {
                    xtype: "combobox",
                    disabled:true,
                    id:"downloadType",
                    value: this.config.defaultDownload,
                    queryMode: 'local',
                    displayField: 'label',
                    name:"test",
                    valueField: 'type',
                    style: { marginRight: '5px' },
                    store:  Ext.create('Ext.data.Store', {
                        fields: ['type','label'], data : [{type:"CSV", label: i18next.t('viewer_components_attributelist_2') },{type:"GEOJSON", label: i18next.t('viewer_components_attributelist_3') },{type:"XLS", label: i18next.t('viewer_components_attributelist_4') },{type:"SHP", label: i18next.t('viewer_components_attributelist_5') }]
                    })
                }
            ]
        };
        var topContainerOptions = {
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
            listeners: {
                afterrender: {
                    fn: function() {
                        this.resolveDeferred();
                    },
                    scope: this
                }
            },
            items: [
                {
                    id: this.name + 'LayerSelectorPanel',
                    xtype: "container",
                    padding: this.config.showLayerSelectorTabs ? 0 : "4px",
                    height: this.config.showLayerSelectorTabs ? 44 : 40,
                    items: [
                        this.layerSelector.getLayerSelector()
                    ]
                },{
                    id: this.name + 'mainGridPanel',
                    xtype: "container",
                    // autoScroll: true,
                    flex: 1,
                    layout: 'fit'
                },{
                    id: this.name + 'mainPagerPanel',
                        xtype: "container"
                },
                closingPanelOptions
            ]
        };
        if(!this.config.isPopup) {
            topContainerOptions.title = this.getPanelTitle();
            topContainerOptions.tools = this.getHelpToolConfig();
            // topContainerOptions.bodyPadding = this.config.viewerController.layoutManager.isTabComponent(this.name) ? '10 0 10 10' : '10 0 10 0';
        } else {
            closingPanelOptions.items.push({
                xtype: 'button', text: i18next.t('viewer_components_attributelist_6'), handler: function() {
                    me.popup.hide();
                }
            });
        }

        this.topContainer = Ext.create(this.config.isPopup ? 'Ext.container.Container' : 'Ext.panel.Panel', topContainerOptions);
        var parent = this.getContentContainer();
        parent.add(this.topContainer);
    },
    layerSelectorInit: function(evt) {
        if(!evt.hasBeenInitialized) {
            this.loadFirstLayer();
        }
        if(this.config.showAttributelistLinkInFeatureInfo) {
            this.createFeatureInfoLink(evt.layers);
        }
    },
    loadFirstLayer: function() {
        if(this.firstLayerLoaded || this.config.isPopup && !this.popup.isVisible()) {
            this.resolveDeferred();
            return true;
        }
        this.firstLayerLoaded = true;
        if(this.layerSelector.getVisibleLayerCount() === 0) {
            return;
        }
        // First clear selection so we are sure to get an 'changed' event
        this.layerSelector.clearSelection();
        // Select first layer
        this.layerSelector.selectFirstLayer();
    },
    createFeatureInfoLink: function(attributelistLayers) {
        if(this.attributeListLinkInFeatureInfoCreated) {
            return;
        }
        var infoComponents = this.viewerController.getComponentsByClassNames(["viewer.components.FeatureInfo", "viewer.components.ExtendedFeatureInfo"]);
        var appLayers = [];
        Ext.each(attributelistLayers, function (record) {
            var appLayer = this.viewerController.getAppLayerById(record.id);
            if(appLayer){
                appLayers.push(appLayer);
            }
        }, this);
        for (var i = 0; i < infoComponents.length; i++) {
            infoComponents[i].registerExtraLink(
                this,
                function (feature, appLayer, coords) {
                    this.handleFeatureInfoLink(feature, appLayer, coords);
                }.bind(this),
                this.config.title || 'Attributenlijst',
                appLayers
            );
        }
        this.attributeListLinkInFeatureInfoCreated = true;
    },
    /**
     * Handle FeatureInfo/Maptip link click
     * @param {viewer.FeatureInfoWrapper} feature
     * @param appLayer
     * @param coords
     */
    handleFeatureInfoLink: function(feature, appLayer, coords) {
        // Show the window
        this.showWindow();
        this.filterFeature = feature.getAttribute('__fid');
        // Check if the appLayer is selected already
        // If the layer is already selected, fire layerChanged ourself
        var selectedAppLayer = this.layerSelector.getValue();
        if(selectedAppLayer && selectedAppLayer.id === parseInt(appLayer.id, 10)) {
            this.layerChanged(appLayer);
            return;
        }
        // Find and select layerselector record
        this.layerSelector.getStore().each(function(record) {
            if(parseInt(record.get('layerId'), 10) === parseInt(appLayer.id, 10)) {
                this.layerSelector.setValue(record);
            }
        }, this);
    },
    showWindow : function() {
        if(this.config.isPopup) {
            if (this.topContainer == null) {
                this.loadWindow();
            }
            this.popup.show();
        }
        if(this.layerSelector.getVisibleLayerCount() === 0) {
            this.resolveDeferred();
        }
    },
    showWindowForLayer: function(layer) {
        this.showWindow();
        var listener = this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS, function() {
            if(this.layerSelector.hasValue(layer)) {
                this.layerSelector.setValue(layer);
            }
            listener.destroy();
        }, this, { destroyable: true });
        this.layerSelector.initLayers();
    },
    clear: function() {
        for(var gridId in this.grids) {
            if(!this.grids.hasOwnProperty(gridId)) {
                continue;
            }
            this.grids[gridId].destroy();
        }
        delete this.grids;
        this.grids={};
        for(var pagerId in this.pagers) {
            if(!this.pagers.hasOwnProperty(pagerId)) {
                continue;
            }
            this.pagers[pagerId].destroy();
        }
        delete this.appLayer;
        delete this.featureService;
    },
    loadAttributes: function(appLayer) {
        var me = this;
        if (this.requestThresholdCounter) {
            clearTimeout(this.requestThresholdCounter);
        }
        if (this.grids.main) {
            this.grids.main.getView().setLoading(i18next.t('viewer_components_attributelist_7'));
        }
        me.loadLayerOnPopupShow = "";
        this.requestThresholdCounter = setTimeout(function(){
            me.requestThresholdCounter = null;
            me.retrieveAttributes(appLayer);
        }, this.config.requestThreshold);
    },
    
    retrieveAttributes: function(appLayer){
        
        this.clear();

        this.appLayer = appLayer;

        var me = this;
        var downloadButton = Ext.getCmp("downloadButton");
        var downloadType = Ext.getCmp("downloadType");
        if(this.appLayer != null) {
            downloadButton.setDisabled(false);
            downloadType.setDisabled(false);
            this.featureService = this.config.viewerController.getAppLayerFeatureService(this.appLayer);

            // check if featuretype was loaded
            if(this.appLayer.attributes == undefined) {
                this.featureService.loadAttributes(me.appLayer, function(attributes) {
                    me.initGrid(me.appLayer);
                });
            } else {
                this.initGrid(me.appLayer);
            }
        }else{
            downloadButton.setDisabled(true);
            downloadType.setDisabled(true);
        }
    },
    // Called when the layerSelector was changed.
    layerChanged : function (appLayer){
        if(!appLayer) {
            return true;
        }
        if(this.config.isPopup && !this.popup.isVisible()) {
            this.loadLayerOnPopupShow = appLayer;
            return true;
        }
        if(this.config.addZoomTo) {
            Ext.ComponentQuery.query('#zoomToAll')[0].setDisabled(!this.hasGeometry(appLayer));
        }
        this.loadAttributes(appLayer);
        if(this.layerSelector.getVisibleLayerCount() === 1 && this.config.autoDownload) {
            this.download();
        }
    },
    filterChanged : function (filter,appLayer) {
        if (!Ext.Object.isEmpty(this.grids)) {
            if (this.layerSelector !== null) {
                var selectedLayer = this.layerSelector.getValue();
                if (selectedLayer) {
                    if (selectedLayer.id == appLayer.id) {
                        this.loadAttributes(appLayer);
                    }
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
        var rawData = record.data || record.raw;
        var store=record.store;
        var recordid = record.get('id');
        if(!this.expandedRows) {
            this.expandedRows = [];
        }
        if (rawData.related_featuretypes && Ext.Array.indexOf(this.expandedRows, recordid) === -1){
            var childGridIds=[];
            this.expandedRows.push(recordid);
            for (var i=0; i < rawData.related_featuretypes.length; i++){
                var ft = rawData.related_featuretypes[i];
                var newEl =document.createElement("div");
                var gridId = "" + (this.attributeIndex++) + "_" + ft.id;
                childGridIds.push(gridId);
                newEl.id=this.name +gridId+ 'Container';
                newEl.style.margin="5px";
                expandRow.children[1].appendChild(newEl);
                this.createGrid(gridId,newEl, this.appLayer, ft.id,ft.filter,false);
            }
            store.addListener("sort", function() {
                // Added setTimeout because panels need to be destroyed after sort
                // event is completed, otherwise Ext tries to access panel dom while
                // it has been destroyed already
                setTimeout((function() {
                    for (var i=0; i < childGridIds.length; i ++){
                        this.deleteGridWithId(childGridIds[i]);
                    }
                }).bind(this), 0);
            }, this);
        }

    },
    onCollapseBody: function (rowNode,record,expandRow,eOpts){
    },

    hideAllExpandedRows: function() {
        for(var gridId in this.grids) {
            if(!this.grids.hasOwnProperty(gridId) || gridId === "main") {
                continue;
            }
            this.grids[gridId].setStyle('display', 'none');
        }
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
        if (Ext.get(name + 'Container')){
            Ext.get(name + 'Container').destroy();
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
                // autoScroll: true,
                width: '100%',
                flex: 1,
                renderTo: renderToEl.id,
                layout: 'fit'
            });
            if(addPager){
                Ext.create('Ext.container.Container', {
                    id: name +'PagerPanel',
                    xtype: "container",
                    width: '100%',
                    renderTo: renderToEl.id
                });
            }
        }

        //var attributes = appLayer.attributes;
        var attributes = this.config.viewerController.getAttributesFromAppLayer(appLayer,featureTypeId);
        var attributeList = new Array();
        var columns = new Array();
        var index = 0;
        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            if(attribute.visible){

                var attIndex = index++;
                if(appLayer.geometryAttributeIndex === i){
                    continue;
                }

                var colName = attribute.alias != undefined ? attribute.alias : attribute.name;
                attributeList.push({
                    name: "c" + attIndex,
                    type : 'string'
                });
                columns.push({
                    header:colName,
                    dataIndex: "c" + attIndex,
                    // flex: 1,
                    shrinkWrap: true,
                    maxWidth: 200,
                    filter: {
                        xtype: 'textfield'
                    }
                });
            }
        }
        if(this.hasGeometry(appLayer) && this.config.addZoomTo) {
            attributeList.unshift({
                name: "__fid",
                type: "string"
            });
            columns.unshift({
                header: "",
                dataIndex: "__fid",
                sortable: false,
                hideable: false,
                menuDisabled: true,
                width: 24,
                maxWidth: 24,
                tdCls: 'zoom-to-feature',
                renderer: function(fid) {
                    return '<a href="#" class="x-grid-filters-icon x-grid-filters-find"></a>';
                }
            });
        }
        var modelName = name + appLayer.id + 'Model';
        if (!this.schema.hasEntity(modelName)) {
            Ext.define(modelName, {
                extend: 'Ext.data.Model',
                fields: attributeList,
                schema: this.schema
            });
        }
        var filter = "";
        if(relateFilter){
            filter = relateFilter;
        }
        var featureType="";
        if (featureTypeId){
            featureType="&featureType="+featureTypeId;
        }

        if(this.filterFeature) {
            filter += ["IN ('", this.filterFeature, "')"].join("");
            this.filterFeature = null;
        }

        var maxResults = -1;
        var movingBack = 0;
        var pageSize = 10;
        var store = Ext.create('Ext.data.Store', {
            storeId: name+"Store",
            pageSize: pageSize,
            model: modelName,
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                type: 'ajax',
                timeout: 120000,
                actionMethods:{read: "POST"},
                url: appLayer.featureService.getStoreUrl() + "&arrays=1"+featureType,
                extraParams:{
                  filter: filter
                },
                reader: {
                    type: 'json',
                    rootProperty: 'features',
                    totalProperty: 'total',
                    keepRawData: true
                },
                simpleSortMode: true,
                listeners: {
                    exception: function(store, response, op) {

                        var msg = response.responseText;
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
                                msg = i18next.t('viewer_components_attributelist_8');
                            } else if(response.statusText != null && response.statusText != "") {
                                msg = response.statusText;
                            } else {
                                msg = i18next.t('viewer_components_attributelist_9');
                            }
                        }

                        Ext.getCmp(me.name + "mainGrid").getStore().removeAll();

                        Ext.MessageBox.alert(i18next.t('viewer_components_attributelist_10'), msg);

                    }
                }
            },
            listeners: {
                beforesort: {
                    scope: this,
                    fn: function(store, sort) {
                        if(!sort) {
                            return;
                        }
                        // If we are sorting and we are the mainStore, hide all other stores
                        if(store.getStoreId() === this.name + "mainStore") {
                            this.hideAllExpandedRows();
                        }
                    }
                },
                load: function(store, records) {
                    /**
                     * We will disable the 'last page' button of the pagertoolbar when we have a virtual total
                     */
                    if(store.getProxy().getReader().rawData.hasOwnProperty('virtualtotal') && store.getProxy().getReader().rawData.virtualtotal && me.pagers[gridId]) {
                        // Kind of hack to disable 'last page' button, property will be used on 'afterlayout' event on pager, see below
                        me.pagers[gridId].hideLastButton = true;
                        me.pagers[gridId].virtualtotal = true;
                        /**
                         * the number of results are less than the pageSize so we are at the end of the set
                         */
                        if(records.length < pageSize) {
                            maxResults = (store.currentPage - 1) * pageSize + records.length;
                        }
                    }
                    /**
                     * When the store hits the end of a resultset (total is unknown at the beginning)
                     * the total is stored and set to correct number after each load
                     */
                    if(maxResults !== -1) {
                        store.totalCount = maxResults;
                        if(me.pagers[gridId]) {
                            me.pagers[gridId].virtualtotal = false;
                            me.pagers[gridId].hideLastButton = false;
                            me.pagers[gridId].onLoad();  // triggers correct total
                        }
                    }
                    /**
                     * total is not 0 but there are not records (resultset has exactly x pages of pageSize)
                     * store total and move to previous page
                     */
                    if(store.totalCount !== 0 && records.length === 0) {
                        maxResults = store.totalCount;
                        if(store.currentPage !== 0 && movingBack < 4) {
                            movingBack++;
                            store.loadPage(parseInt(store.totalCount / pageSize, 10));
                        }
                    }

                    setTimeout(function(){ Ext.getCmp(me.name + 'mainGridPanel').updateLayout(); }, 0);
                    me.resolveDeferred();
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
        var listeners = {
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
            },
            refresh: function(dataview) {
                var cols = dataview.panel.columns;
                for(var i = 0; i < cols.length; i++) {
                    cols[i].autoSize();
                }
                dataview.panel.updateLayout();
            }
        };
        if(this.hasGeometry(appLayer) && this.config.addZoomTo) {
            listeners.cellclick = {
                scope: me,
                fn: function(grid, td, cellIdx, record) {
                    if((td.className || "").indexOf("zoom-to-feature") !== -1) {
                        this.zoomToFeature(record.getData());
                    }
                }
            };
        }
        var g = Ext.create('Ext.grid.Panel',  {
            id: name + 'Grid',
            store: store,
            columns: columns,
            plugins: plugins,
            viewConfig:{
                trackOver: false,
                enableMouseOverOverrideFix: true, // custom configuration option used in override below
                listeners: listeners
            }
        });
        Ext.getCmp(name + 'GridPanel').add(g);
        this.grids[gridId]=g;
        if(addPager){
            var p = Ext.create('Ext.PagingToolbar', {
                id: name + 'Pager',
                store: store,
                displayInfo: true,
                displayMsg: i18next.t('viewer_components_attributelist_11'),
                afterPageText : i18next.t('viewer_components_attributelist_12'),
                emptyMsg: i18next.t('viewer_components_attributelist_13')
            });
            Ext.getCmp(name + 'PagerPanel').add(p);
            this.pagers[gridId]=p;
        }
    },
    hasGeometry: function(appLayer) {
        return (appLayer.hasOwnProperty("geometryAttribute") && typeof appLayer.geometryAttribute !== "undefined" && appLayer.geometryAttribute !== null && appLayer.geometryAttribute !== "");
    },
    zoomToFeature: function(feature) {
        if (this.featureExtentService === null) {
            this.featureExtentService = Ext.create('viewer.FeatureExtent');
        }
        this.featureExtentService.getExtentForFeatures(
                /*featureIds=*/feature.__fid,
                /*appLayer=*/this.layerSelector.getValue(),
                this.config.zoomToBuffer,
                /*successFn=*/(function (extent) {
                    var e = Ext.create("viewer.viewercontroller.controller.Extent", extent.minx, extent.miny, extent.maxx, extent.maxy);
                    this.config.viewerController.mapComponent.getMap().zoomToExtent(e);
            }).bind(this),
            /*failedFn=*/function(msg) {
                console.log(msg);
            }
        );
    },
    zoomToAllFeatures: function(btn) {
        if (!this.config.addZoomTo) {
            return;
        }
        var appLayer = this.layerSelector.getValue();
        if (!this.hasGeometry(appLayer)) {
            btn.setDisabled(true);
            return;
        }
        if (this.featureExtentService === null) {
            this.featureExtentService = Ext.create('viewer.FeatureExtent');
        }

        var store =  this.grids.main.store;
        var ids = [];
        store.each(function(feature){
            ids.push(feature.data.__fid);
        });

        this.featureExtentService.getExtentForFeatures(
             ids,
             this.layerSelector.getValue(),
                this.config.zoomToBuffer,
             (function (extent) {
                 var e = Ext.create("viewer.viewercontroller.controller.Extent", extent.minx, extent.miny, extent.maxx, extent.maxy);
                 this.config.viewerController.mapComponent.getMap().zoomToExtent(e);
            }).bind(this),
            function(msg) {
                console.log(msg);
            }
        );
    },
    download : function(){
        var appLayer = this.appLayer;
        var filter = "";
        var url =  actionBeans["download"];

        url += '?appLayer=' + appLayer.id;
        url += '&application=' + FlamingoAppLoader.get("appId");
        url += '&type=' + Ext.getCmp("downloadType").getValue();
        url += '&params=' + this.config.downloadParams;

        var w =new Ext.Window({
            title: i18next.t('viewer_components_attributelist_14'),
            width: 400,
            height: 150,
            layout: 'fit',
            items: [{
                    xtype: "component",
                    border: false,
                    autoEl: {
                        tag: "iframe",
                        src: url
                    }
                }]
        });
        w.show();
        setTimeout(function(){w.hide();}, 8000);
    }
});

/**
 * Nested Grids give problems when on hovering
 * Context is parent when hovering child. See http://blog.kondratev.pro/2014/08/getting-rid-of-annoying-uncaught.html
 */
Ext.define('viewer.overrides.view.Table', {
    override: 'Ext.view.Table',
    checkThatContextIsParentGridView: function(e) {
        var target = Ext.get(e.target);
        var parentGridView = target.up('.x-grid-view');
        if (this.el !== parentGridView) {
            /* event of different grid caused by grids nesting */
            return false;
        } else {
            return true;
        }
    },
    processItemEvent: function(record, row, rowIndex, e) {
        // Extra check if we really want to apply this fix (only in case of AttributeList nested grids)
        // The 'enableMouseOverOverrideFix' is a custom configuration option added only to AttributeList
        // grids above. Fixes issue https://github.com/flamingo-geocms/flamingo/issues/350
        var fixEnabled = this.config && this.config.enableMouseOverOverrideFix;
        if (fixEnabled && e.target && !this.checkThatContextIsParentGridView(e)) {
            return false;
        } else {
            return this.callParent([record, row, rowIndex, e]);
        }
    }
});

/**
 * Override the Paging toolbar to hide totals when we have a "virtual total" (total is unknown)
 */
Ext.define('viewer.overrides.toolbar.Paging', {
    override: 'Ext.toolbar.Paging',
    inputItemWidth: 45,
    displayMsgVirtualTotal: 'Feature {0} - {1}',
    afterPageTextVirtualTotal: '',
    initComponent: function() {
        this.callParent();
        this.displayMsgOriginal = this.displayMsg;
        this.afterPageTextOriginal = this.afterPageText;
    },
    onLoad: function() {
        this.displayMsg = this.virtualtotal ? this.displayMsgVirtualTotal : this.displayMsgOriginal;
        this.afterPageText = this.virtualtotal ? this.afterPageTextVirtualTotal : this.afterPageTextOriginal;
        this.callParent();
        if(this.virtualtotal) {
            this.child('#last').disable();
        }
    }
});
