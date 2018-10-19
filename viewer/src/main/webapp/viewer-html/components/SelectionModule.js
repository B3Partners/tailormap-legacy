/*
 * Copyright (C) 2012-2015 B3Partners B.V.
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
/* global Ext, actionBeans, MobileManager, appId, contextPath */

/**
 * SelectionModule component
 * Creates a SelectionModule component to build a tree
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */

Ext.define('select.TreeNode', {
    extend: 'Ext.data.TreeModel',
    fields: [
        {name: 'nodeid', type: 'string'},
        // {name: 'children', type: 'array'},
        {name: 'name', type: 'string'},
        {name: 'type',  type: 'string'},
        {name: 'status', type: 'string'},
        {name: 'class', type: 'string'},
        {name: 'parentid', type: 'string'},
        {name: 'isLeaf', type: 'boolean'},
        // Text is used by tree, mapped to name
        {name: 'text', type: 'string', mapping:'name'},
        // Added convert function to icon
        {name: 'icon', type: 'string', convert: function(fieldName, record) {
            var nodeType = record.get('type');
            if(nodeType === "category" || nodeType === "level" || nodeType === "cswresult") return FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/folder.png';
            if(nodeType === "maplevel") return FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/maplevel.png';
            if(nodeType === "layer" || nodeType === "appLayer") return FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/map.png';
            if(nodeType === "service") return FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/serviceok.png';
        }},
        // leaf mapped to isLeaf
        {name: 'leaf', type: 'boolean', mapping: 'isLeaf'},
        {name: 'index', type: 'int'}
        // {name: 'checkedlayers', type: 'array'},
    ]
});

Ext.define ("viewer.components.SelectionModule",{
    extend: "viewer.components.Component",

    // component specific config
    moveRightIcon: '',
    moveLeftIcon: '',
    moveUpIcon: '',
    moveDownIcon: '',
    selectedContent : null,
    appLayers :  null,
    levels : null,
    services : null,
    addedLevels: [],
    addedLevelsCount: 0,
    addedLayers: [],
    addedLayersCount: 0,
    addedServices: [],
    addedServicesCount: 0,
    layerMergeServices: {},
    rootLevel: null,
    rendered: false,
    originalLevels:null,
    // keep track if we checked the first added layer
    firstChecked: false,
    treePanels: {
        applicationTree: {
            treePanel: null,
            treeStore: null
        },
        registryTree: {
            treePanel: null,
            treeStore: null
        },
        customServiceTree: {
            treePanel: null,
            treeStore: null
        },
        selectionTree: {
            treePanel: null,
            treeStore: null
        }
    },
    activeTree: null,
    mainContainer: null,
    userServices: [],
    config: {
        name: i18next.t('viewer_components_selectionmodule_0'),
        title: "",
        titlebarIcon : "",
        tooltip : "",
        label: "",
        advancedValueConfigs:null,
        advancedFilter:null,
        defaultCswUrl:null,
        advancedLabel:null,
        advancedValue:null,
        alwaysMatch:null,
        alwaysShow:null,
        showWhenOnlyBackground:null,
        showBackgroundLevels:null,
        showCswUrl: null,
        details: {
            minWidth: 575,
            minHeight: 400
        }
    },
    constructor: function (conf) {
        //set defaults
        if (Ext.isEmpty(conf.selectGroups)){
            conf.selectGroups = true;
        }if (Ext.isEmpty(conf.selectLayers)){
            conf.selectLayers = true;
        }if (Ext.isEmpty(conf.selectOwnServices)){
            conf.selectOwnServices = true;
        } if(Ext.isEmpty(conf.selectCsw)){
            conf.selectCsw = true;
        } if(Ext.isEmpty(conf.alwaysShow)){
            conf.alwaysShow = false;
        } if(Ext.isEmpty(conf.showBackgroundLevels)){
            conf.showBackgroundLevels = false;
        }
        conf.details.useExtLayout = true;
        // call constructor and init config
        this.initConfig(conf);
		viewer.components.SelectionModule.superclass.constructor.call(this, this.config);
        this.originalLevels = Ext.clone(this.config.viewerController.app.levels);
		this.renderButton();
        // if there is no selected content, show selection module
        var me = this;
        this.menus = Ext.create("viewer.components.SelectionModuleMenu",{selectionModule:this});

        var autoShowSelectionModule = 'nolayers';
        if(conf.showWhenOnlyBackground) { // Support for legacy config option
            autoShowSelectionModule = 'onlybackground';
        }
        if(typeof conf.autoShowSelectionModule !== "undefined") {
            autoShowSelectionModule = conf.autoShowSelectionModule;
        }
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED,function() {
            if(
                (autoShowSelectionModule === 'nolayers' && this.config.viewerController.app.selectedContent.length === 0) ||
                (autoShowSelectionModule === 'onlybackground' && this.selectedContentHasOnlyBackgroundLayers()) ||
                (autoShowSelectionModule === 'always')
            ) {
                me.openWindow();
            }
        },this);
        this.popup.popupWin.addListener('hide', function() {
            this.menus.closeAllMenus();
        }, this);
        return this;
    },
    renderButton: function() {
        var me = this;
        this.superclass.renderButton.call(this,{
            text: me.config.title,
            icon: me.config.titlebarIcon,
            tooltip: me.config.tooltip,
            label: me.config.label,
            handler: function() {
                me.openWindow();
            }
        });
    },
    openWindow: function() {
        var me = this;
        me.popup.show();
        if(!me.rendered) {
            // If the component is not rendered before (opened for the first time) init the component
            me.initComponent();
        } else {
            if(me.treePanels.registryTree.treePanel) {
                // Sometimes the tree is not loaded yet when the popup is closed,
                // causing the tree to stay empty when the popup is opened again.
                // To prevent this we reload the tree when no nodes are available
                var rootNode = me.treePanels.registryTree.treePanel.getRootNode();
                if(!rootNode || !rootNode.hasChildNodes()) {
                    // No rootnode or rootnode has no children, so empty tree
                    me.treePanels.registryTree.treeStore.load();
                }
            }
            // get data from viewer controller
            me.initViewerControllerData();
            me.loadSelectedLayers();
        }
        this.firstChecked = false;
    },
    // only executed once, when opening the selection module for the first time
    initComponent: function() {
        var me = this;
        // set icon urls
        me.moveRightIcon = FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/move-right.gif';
        me.moveLeftIcon = FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/move-left.gif';
        me.moveUpIcon = FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/move-up.gif';
        me.moveDownIcon = FlamingoAppLoader.get('contextPath') + '/viewer-html/components/resources/images/selectionModule/move-down.gif';
        // get data from viewer controller
        me.initViewerControllerData();
        // init base interface
        me.initInterface();
        // init tree containers
        me.initTreeSelectionContainer();
        // init trees
        me.initTrees();
        // if application layers / levels can be added, init them
        if(me.config.selectGroups) {
            me.initApplicationLayers();
        }
        // load the selected content to the right container
        me.loadSelectedLayers();
        // Show active left panel (based on checked radio boxes / only option)
        me.showActiveLeftPanel();
        // set rendered to true so this function won't be called again
        me.rendered = true;
    },
    // helper function to check if selected content has only background layers
    selectedContentHasOnlyBackgroundLayers : function (){
        var sc = this.config.viewerController.app.selectedContent;
        for( var i = 0 ; i < sc.length ; i++){
            var item = sc[i];
            if(item.type === "level"){
                var level = this.config.viewerController.app.levels[item.id];
                if(!level.background){
                    return false;
                }
            }else{
                var layer = this.config.viewerController.app.appLayers[item.id];
                if(!layer.background){
                    return false;
                }
            }
        }
        return true;
    },

    getActiveTreePanels: function() {
        var me = this;
        var panels = [];
        if(me.treePanels.applicationTree.treePanel != null) {
            panels.push(me.treePanels.applicationTree.treePanel);
        }
        if(me.treePanels.registryTree.treePanel != null) {
            panels.push(me.treePanels.registryTree.treePanel);
        }
        if(me.treePanels.customServiceTree.treePanel != null) {
            panels.push(me.treePanels.customServiceTree.treePanel);
        }
        if(me.treePanels.selectionTree.treePanel != null) {
            panels.push(me.treePanels.selectionTree.treePanel);
        }
        return panels;
    },

    getActiveTreePanelIds: function() {
        var me = this;
        var panelIds = [];
        var activePanels = me.getActiveTreePanels();
        for(var i = 0; i < activePanels.length; i++) {
            panelIds.push(activePanels[i].id);
        }
        return panelIds;
    },

    /**
     * Show active left panel (initially).
     * When multiple options are avaiable, show first left panel
     * When only one option is available, show that option
     */
    showActiveLeftPanel: function() {
        var me = this,
            availableOptions = [];

        // First add all available options to array
        if(me.config.selectGroups) availableOptions.push('application');
        if(me.config.selectLayers) availableOptions.push('registry');
        if(me.config.selectOwnServices) availableOptions.push('custom');
        if(me.config.selectCsw) availableOptions.push('csw');

        // If there is only one option, show that option
        if(availableOptions.length === 1) {
            me.handleSourceChange(availableOptions[0], true);
        } else {
            // iterate over radio buttons on top to activate the checked item
            var selectionModuleFormField = this.getCmpByItemId(this.name + 'selectionModuleFormFieldContainer');
            if(selectionModuleFormField) {
                selectionModuleFormField.items.each(function(item){
                    if(item.checked) me.handleSourceChange(item.getItemId(), item.checked);
                });
            }
        }
    },
    /**
     * Returns the type of the activeTree ([applicationTree, registeryTree, customServiceTree];
     * returns string The type of the active tree;
     */
    getActiveTreeType: function() {
        var panels= this.treePanels;
        for(var key in panels){
            if(!panels.hasOwnProperty(key)) {
                continue;
            }
            var p = panels[key];
            if(p.treePanel && p.treePanel.getId() === this.activeTree.getId()){
                return key;
            }
        }
        return null;
    },

    initViewerControllerData: function() {
        // We make a cloned reference, so we can easily edit this array and merge it to the original after clicking 'Ok'
        this.selectedContent = Ext.clone(this.config.viewerController.app.selectedContent);
        this.appLayers = this.config.viewerController.app.appLayers;
        this.levels = Ext.clone(this.config.viewerController.app.levels);
        this.services = this.config.viewerController.app.services;
        this.rootLevel = this.config.viewerController.app.rootLevel;
    },

    loadCustomService: function() {
        var me = this;
        me.popup.popupWin.setLoading(i18next.t('viewer_components_selectionmodule_1'));

        var protocol = '', url = '', q = '';
        if(me.customServiceType === 'csw') {
            url = me.getCmpByItemId('cswServiceUrlTextfield').getValue();
            q = me.getCmpByItemId('cswSearchTextfield').getValue();
            var csw = Ext.create("viewer.CSWClient", {
                url: url,
                q: q
            });
            var advancedSearch = me.getCmpByItemId('advancedSearchQuery').getValue();
            if(this.config.advancedFilter && ( !me.getCmpByItemId("cswAdvancedSearchField").collapsed || this.config.alwaysMatch)){
                csw.config["actionbeanUrl"] = actionBeans["advancedcsw"];
                csw.config["advancedString"] = advancedSearch;
                csw.config["advancedProperty"] = this.config.advancedValue;
                csw.config["application"] = appId;
                csw.loadInfo(
                    function(response) {
                        var results = response.found;
                        var rootNode = me.treePanels.customServiceTree.treePanel.getRootNode();
                        me.clearTree(rootNode);
                        var foundIds = new Array();
                        for(var i = 0 ; i < results.length; i++){
                            var  result = results[i];
                            foundIds.push(result.id);
                        }

                        var levels = response.children;
                        var descriptions = response.descriptions;
                        var levelsToShow = new Array();
                        for(var i = 0 ; i < levels.length ; i ++){
                            var level = levels[i];
                            var l = me.addLevel(level.id, true, false, false, foundIds,descriptions,me.levels);
                            if(l !== null){
                                l.expanded = true;
                                levelsToShow.push(l);
                            }
                        }
                        me.insertTreeNode(levelsToShow, rootNode);
                        me.popup.popupWin.setLoading(false);
                    },
                    function(msg) {
                        Ext.MessageBox.alert(i18next.t('viewer_components_selectionmodule_2'), msg);
                        me.popup.popupWin.setLoading(false);
                    }
                );
            }else{

                csw.loadInfo(
                    function(results) {
                        me.populateCSWTree(results);
                        me.popup.popupWin.setLoading(false);
                    },
                    function(msg) {
                        Ext.MessageBox.alert(i18next.t('viewer_components_selectionmodule_3'), msg);
                        me.popup.popupWin.setLoading(false);
                    }
                );
            }
        } else {
            protocol = me.getCmpByItemId('customServiceUrlSelect').getValue();
            url = me.getCmpByItemId('customServiceUrlTextfield').getValue();
            var si = Ext.create("viewer.ServiceInfo", {
                protocol: protocol,
                url: url
            });

            si.loadInfo(
                function(info) {
                    me.populateCustomServiceTree(info);
                    me.popup.popupWin.setLoading(false);
                },
                function(msg) {
                    Ext.MessageBox.alert(i18next.t('viewer_components_selectionmodule_4'), msg);
                    me.popup.popupWin.setLoading(false);
                }
            );
        }
    },
    initInterface: function() {
        var me = this;
        var radioControls = [];
        // Add only if config option is set to true
        if(me.config.selectGroups) {
            radioControls.push({
                itemId: 'application',
                checked: true,
                name: 'layerSource',
                boxLabel: me.config.hasOwnProperty('labelGroups') ? me.config.labelGroups : i18next.t('viewer_components_selectionmodule_5'),
                listeners: {change: function(field, newval) {me.handleSourceChange(field.getItemId(), newval);}}
            });
        }
        // Add only if config option is set to true, if this is the first that is added (so the previous was not added) set checked to true
        if(me.config.selectLayers) {
            radioControls.push({
                itemId: 'registry',
                checked: (radioControls.length === 0),
                name: 'layerSource',
                boxLabel: me.config.hasOwnProperty('labelLayers') ? me.config.labelLayers : i18next.t('viewer_components_selectionmodule_6'),
                listeners: {change: function(field, newval) {me.handleSourceChange(field.getItemId(), newval);}}
            });
        }
        // Add only if config option is set to true, if this is the first that is added (so the previous was not added) set checked to true
        if(me.config.selectOwnServices) {
            radioControls.push({
                itemId: 'custom',
                name: 'layerSource',
                checked: (radioControls.length === 0),
                boxLabel: me.config.hasOwnProperty('labelOwnServices') ? me.config.labelOwnServices : i18next.t('viewer_components_selectionmodule_7'),
                listeners: {change: function(field, newval) {me.handleSourceChange(field.getItemId(), newval);}}
            });
        }
        if(me.config.selectCsw){
            radioControls.push({
                itemId: 'csw',
                name:'layerSource',
                checked: (radioControls.length === 0),
                boxLabel: me.config.hasOwnProperty('labelCsw') ? me.config.labelCsw : i18next.t('viewer_components_selectionmodule_8'),
                listeners: {change: function(field, newval) {me.handleSourceChange(field.getItemId(), newval);}}
            });
        }

        // If there is only 1 control, do not add any
        if(radioControls.length === 1) {
            radioControls = [];
        }

        // minimal interface, just tree container and save/cancel buttons
        var items = [{
            xtype: 'container',
            flex: 1,
            itemId: this.name + 'selectionModuleTreeContentContainer',
            layout: 'fit'
        },
        {
            // Form above the trees with radiobuttons and textfields
            xtype: 'form',
            layout: {
                type:'hbox'
            },
            items: [
                    {xtype:"label", text: i18next.t('viewer_components_selectionmodule_9'), margin: '3 0 0 0'},
                    {xtype:'tbfill'},
                    {xtype: 'button', text: i18next.t('viewer_components_selectionmodule_10'), handler: function() {
                        me.cancelSelection();
                    }},
                    {xtype: 'button', text: i18next.t('viewer_components_selectionmodule_11'), style: {marginLeft: '10px'},handler: function() {
                        me.saveSelection();
                    }}
            ],
            // height: 35,
            padding: 5,
            border: 0,
            itemId: this.name + 'selectionModuleSaveFormContainer'
        }];
        // when there is one tree configured show radio buttons and form buttons above
        if(me.hasLeftTrees())
        {
            if(me.config.selectOwnServices || me.config.selectCsw) {
                if(!this.config.advancedValueConfigs){
                    this.config.advancedValueConfigs= new Array();
                }
                this.config.advancedValueConfigs.unshift({label: "", value: ""});
                var store = Ext.create('Ext.data.Store', {
                    fields: ['label', 'value'],
                    data : this.config.advancedValueConfigs
                });
                var combo = Ext.create('Ext.form.ComboBox', {
                    store:store,
                    queryMode: "local",
                    displayField: 'label',
                    itemId:"advancedSearchQuery",
                    valueField: 'value',
                    fieldLabel: this.config.advancedLabel !== null ? this.config.advancedLabel: ""
                });
                items.unshift({
                        // Form above the trees with radiobuttons and textfields
                        xtype: 'container',
                        padding: 5,
                        border: 0,
                        itemId: this.name + 'selectionModuleCustomFormContainer',
                        hidden: true,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'panel',
                                border: false,
                                header: false,
                                layout: 'hbox',
                                defaults: {
                                    xtype: 'textfield',
                                    style: {
                                        marginRight: '5px'
                                    }
                                },
                                defaultType: 'textfield',
                                items: [
                                    {hidden: true, itemId: 'customServiceUrlTextfield', flex: 1, emptyText: i18next.t('viewer_components_selectionmodule_12')},
                                    {xtype: "combobox", store: [ ['wms','WMS'], ['arcims','ArcIMS'], ['arcgis','ArcGIS'] ], hidden: true, itemId: 'customServiceUrlSelect', width: 100, emptyText: i18next.t('viewer_components_selectionmodule_13')},
                                    {xtype: 'button', text: i18next.t('viewer_components_selectionmodule_14'), hidden: true, itemId: 'customServiceUrlButton', handler: function() {
                                            me.loadCustomService();
                                    }},
                                    {hidden: true, itemId: 'cswServiceUrlTextfield', flex: 1, emptyText: i18next.t('viewer_components_selectionmodule_15'), value : this.config.defaultCswUrl !== undefined ? this.config.defaultCswUrl : "" },
                                    {hidden: true, itemId: 'cswSearchTextfield', flex: 1, emptyText: i18next.t('viewer_components_selectionmodule_16'), listeners: {
                                    specialkey: function(field, e){
                                        if (e.getKey() === e.ENTER) {
                                            me.loadCustomService();
                                        }
                                    }}},
                                    {xtype: 'button', text: i18next.t('viewer_components_selectionmodule_17'), hidden: true, itemId: 'cswServiceUrlButton', handler: function() {
                                            me.loadCustomService();
                                    }}
                                ]
                            },
                            {
                                xtype: 'panel',
                                itemId: 'cswAdvancedSearchField',
                                header: { 
                                    title: i18next.t('viewer_components_selectionmodule_18')
                                },
                                collapsible: true,
                                collapsed: !this.config.alwaysShow,
                                bodyPadding: 5,
                                hidden: true,
                                items: [ combo ],
                                layout: 'fit',
                                listeners: {
                                    beforecollapse: function() {
                                        me.handleSourceChange('csw', true);
                                    },
                                    beforeexpand: function() {
                                        me.handleSourceChange('csw', true);
                                    }
                                }
                            }
                        ]
                    });
                }
                items.unshift({
                    // Form above the trees with radiobuttons and textfields
                    xtype: 'form',
                    items: [{
                        xtype: 'fieldcontainer',
                        itemId: this.name + 'selectionModuleFormFieldContainer',
                        layout: 'hbox',
                        border: 0,
                        defaults: {
                            xtype: 'radio',
                            style: {
                                marginRight: '5px'
                            }
                        },
                        defaultType: 'radio',
                        items: radioControls
                    }],
                    padding: '0 5px',
                    border: 0,
                    itemId: this.name + 'selectionModuleFormContainer',
                    layout: 'fit'
            });
        }

        // Create main container
        this.mainContainer = Ext.create('Ext.container.Container', {
            itemId: this.name + 'selectionModuleMainContainer',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            items: items
        });
        me.popup.getContentContainer().add(this.mainContainer);
    },

    initTreeSelectionContainer: function() {
        var me = this;
        // minimal tree interface (right tree with selected content and move up/down buttons)
        var items = [
                {
                    xtype: 'container',
                    flex: 1,
                    itemId: 'selectionTreeContainer',
                    layout: 'fit'
                },
                this.createMoveButtons({
                    iconTop: me.moveUpIcon,
                    iconBottom: me.moveDownIcon,
                    handlerTop: function() {
                        me.moveNodes('up');
                    },
                    handlerBottom: function() {
                        me.moveNodes('down');
                    }
                })
            ];
        // when there is one or more left trees configured, add left interface (left tree and move from/to tree buttons)
        if(me.hasLeftTrees())
        {
            items.unshift(
                {
                    xtype: 'container',
                    flex: 1,
                    defaultType: 'container',
                    layout: 'fit',
                    defaults: {
                        layout: 'fit',
                        hidden: true,
                        hideMode: 'offsets'
                    },
                    items: [ { itemId: "applicationTreeContainer" }, { itemId: "registryTreeContainer" }, { itemId: "customTreeContainer"} ]
                },
                this.createMoveButtons({
                    iconTop: me.moveRightIcon,
                    iconBottom: me.moveLeftIcon,
                    handlerTop: function() {
                        me.addNodes(me.activeTree.getSelectionModel().getSelection());
                    },
                    handlerBottom: function() {
                        me.removeNodes(me.treePanels.selectionTree.treePanel.getSelectionModel().getSelection());
                    }
                })
            );
        }
        var treeContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            itemId: this.name + 'selectionModuleTreesContainer',
            items: items
        });
        this.getCmpByItemId(this.name + 'selectionModuleTreeContentContainer').add(treeContainer);
    },

    createMoveButtons: function(config) {
        return {
            xtype: 'container',
            // width: MobileManager.isMobile() ? undefined : 30,
            // padding: MobileManager.isMobile() ? '0 2px' : undefined,
            layout: { type: 'vbox', align: 'center' },
            items: [
                { xtype: 'container', html: { tag: 'div' }, flex: 1 },
                {
                    xtype: 'button',
                    icon: config.iconTop,
                    // width: MobileManager.isMobile() ? undefined : 23,
                    // height: MobileManager.isMobile() ? undefined : 22,
                    handler: config.handlerTop
                },
                {
                    xtype: 'button',
                    icon: config.iconBottom,
                    // width: MobileManager.isMobile() ? undefined : 23,
                    // height: MobileManager.isMobile() ? undefined : 22,
                    handler: config.handlerBottom
                },
                { xtype: 'container', html: { tag: 'div' }, flex: 1 }
            ]
        };
    },

    initTrees: function() {
        var me = this;

        var defaultStoreConfig = {
            model: select.TreeNode,
            root: {
                text: i18next.t('viewer_components_selectionmodule_19'),
                expanded: true,
                checked: false,
                children: []
            },
            proxy: {
                type: 'memory'
            },
            filterer: 'bottomup'
        };

        var defaultTreeConfig = {
            xtype: 'treepanel',
            rootVisible: false,
            useArrows: true,
            scroll: "both",
            animate: false,
            selModel: {
                mode: 'MULTI'
            },
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.addNodes([ record ]);
                }
            }
        };

        if(me.config.selectGroups) {
            me.treePanels.applicationTree.treeStore = Ext.create('Ext.data.TreeStore', Ext.apply({}, defaultStoreConfig));
            var applicationTreeConfig = Ext.apply({}, defaultTreeConfig, {
                treePanelType: 'applicationTree',
                viewConfig: me.getViewConfig('collection'),
                store: me.treePanels.applicationTree.treeStore
            });
            if(!me.config.hasOwnProperty('showSearchGroups') || me.config.showSearchGroups) {
                applicationTreeConfig.tbar = this.getSearchConfig(this.filterNodes.bind(this), "applicationTree");
            }
            me.treePanels.applicationTree.treePanel = Ext.create('Ext.tree.Panel', applicationTreeConfig);
            this.getCmpByItemId('applicationTreeContainer').add(me.treePanels.applicationTree.treePanel);
        }

        if(me.config.selectLayers) {
            var serviceStore = Ext.create("Ext.data.TreeStore", {
                //autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: actionBeans["geoserviceregistry"]
                },
                defaultRootId: 'c0',
                defaultRootProperty: 'children',
                model: select.TreeNode,
                nodeParam: 'nodeId'
            });

            me.treePanels.registryTree.treeStore = serviceStore;
            var registryTreeConfig = Ext.apply({}, defaultTreeConfig, {
                treePanelType: 'registryTree',
                viewConfig: me.getViewConfig('collection'),
                store: me.treePanels.registryTree.treeStore
            });
            if(!me.config.hasOwnProperty('showSearchLayers') || me.config.showSearchLayers) {
                registryTreeConfig.tbar = this.getSearchConfig(this.filterRemote.bind(this), "registryTree");
            }
            me.treePanels.registryTree.treePanel = Ext.create('Ext.tree.Panel', registryTreeConfig);
            this.getCmpByItemId('registryTreeContainer').add(me.treePanels.registryTree.treePanel);
        }

        if(me.config.selectOwnServices || me.config.selectCsw) {
            me.treePanels.customServiceTree.treeStore = Ext.create('Ext.data.TreeStore', Ext.apply({}, defaultStoreConfig));
            var customServiceConfig = Ext.apply({}, defaultTreeConfig, {
                treePanelType: 'customServiceTree',
                viewConfig: me.getViewConfig('collection'),
                store: me.treePanels.customServiceTree.treeStore
            });
            if(
                (!me.config.hasOwnProperty('showSearchOwnServices') || me.config.showSearchOwnServices) ||
                (!me.config.hasOwnProperty('showSearchCsw') || me.config.showSearchCsw)
            ) {
                customServiceConfig.tbar = this.getSearchConfig(this.filterNodes.bind(this), "customServiceTree");
            }
            me.treePanels.customServiceTree.treePanel = Ext.create('Ext.tree.Panel', customServiceConfig);
            this.getCmpByItemId('customTreeContainer').add(me.treePanels.customServiceTree.treePanel);
        }

        me.treePanels.selectionTree.treeStore = Ext.create('Ext.data.TreeStore', Ext.apply({}, defaultStoreConfig));
        me.treePanels.selectionTree.treePanel = Ext.create('Ext.tree.Panel', Ext.apply({}, {
           treePanelType: 'selectionTree',
            store: me.treePanels.selectionTree.treeStore,
            viewConfig: me.getViewConfig('selection'),
            listeners: {
                itemdblclick: function(view, record, item, index, event, eOpts) {
                    me.removeNodes([ record ]);
                },
                itemcontextmenu: function(view, record, item, index, event, eOpts) {
                    me.menus.handleClick(record, event);
                    event.stopEvent();
                },
                containercontextmenu: function(view, event, eOpts) {
                    me.menus.handleClick(null, event);
                    // When rightclicking in the treecontainer (not on a node) than
                    // show the context menu for adding a new level
                    // Addlevel
                    event.stopEvent();
                }
            },
            tbar: null
        },defaultTreeConfig));
        this.getCmpByItemId('selectionTreeContainer').add(me.treePanels.selectionTree.treePanel);
    },
    
    getSearchConfig: function(searchFn, treePanelType) {
        var searchFieldId = Ext.id();
        var treePanels = this.treePanels;
        return [
            {
                xtype : 'textfield',
                id: searchFieldId,
                flex: 1,
                triggers: {
                    clear: {
                        type: 'clear'
                    }
                },
                listeners: {
                    specialkey: function(field, e){
                        if (e.getKey() === e.ENTER) {
                            searchFn(treePanels[treePanelType].treePanel, field.getValue());
                        }
                    },
                    clear: function() {
                        searchFn(treePanels[treePanelType].treePanel, "");
                    }
                }},
                {
                    xtype: 'button',
                    text: i18next.t('viewer_components_selectionmodule_20'),
                    handler: function() {
                        searchFn(treePanels[treePanelType].treePanel, Ext.getCmp(searchFieldId).getValue());
                    }
                }
        ];
    },
    
    getViewConfig: function(treeType) {
        var me = this;
        return {
            plugins: {
                ptype: 'treeviewdragdrop',
                appendOnly: false,
                allowContainerDrops: true,
                allowParentInserts: true,
                sortOnDrop: true
            },
            listeners: {
                beforedrop: function(targetNode, data, overModel, dropPosition, dropHandlers, eOpts) {
                    // We cancel the drop so we can follow our own logic for moving nodes
                    dropHandlers.cancelDrop();
                    var targetRecord = me.treePanels.selectionTree.treePanel.getView().getRecord(targetNode);
                    var targetIsLevel = targetRecord.data.type === "maplevel";
                    var nodeIsLayer = data.records[0].data.type === "appLayer";
                    var treeOfTarget = targetRecord.getOwnerTree();
                    var treeOfNode = data.records[0].getOwnerTree();

                    if (treeType === 'collection') {
                        // Dragged to collection panels (left side), so remove items
                        me.removeNodes(data.records);
                    }else if (treeType === 'selection' && treeOfTarget.treePanelType !== 'selectionTree') {
                        // Dragged to selection panel (right side) from panel on the left, so add items
                        me.addNodes(data.records);
                    }else {
                        var movedOutOfNode = targetRecord.parentNode !== data.records[0].parentNode;
                        // Dragged inside the selection panel (reordering, appending)
                        if (dropPosition === 'append' || movedOutOfNode) {
                            if(movedOutOfNode && dropPosition !== 'append') {
                                // Node is moved out of a parent node and positioned before / after other node
                                // New parent is the parent of the node after/before the node is dragged
                                targetNode = targetRecord.parentNode;
                                targetRecord = me.treePanels.selectionTree.treePanel.getView().getRecord(targetNode);
                                targetIsLevel = targetRecord.data.type === "maplevel";
                            }
                            if (targetNode.id === "root") {
                                me.removeNodes(data.records);
                                me.addNodes(data.records);
                            } else if (nodeIsLayer && targetIsLevel) {
                                me.addLayerToLevel(targetRecord, data.records);
                            } else if (!nodeIsLayer && targetIsLevel) {
                                me.addLevelToLevel(targetRecord, data.records, treeOfNode !== me.treePanels.selectionTree.treePanel);
                            }
                        } else {
                            me.moveNodesToPosition(data, dropPosition === 'after');
                        }
                    }
                    return true;
                }
            }  
        };
    },

    filterRemote: function(tree, textvalue) {
        var treeStore = tree.getStore();
        if(textvalue !== '') {
            treeStore.getProxy().setExtraParams({
                search: 'search',
                q: textvalue
            });
        }
        var listener = treeStore.on("load", function() {
            listener.destroy();
            treeStore.getProxy().setExtraParams({});
        }, this, { destroyable: true });
        treeStore.reload();
    },

    addLayerToLevel : function(levelNode, layerNodes){
        var level = this.levels[levelNode.data.origData.id];
        for( var i = 0 ; i < layerNodes.length; i++){
            var layer = layerNodes[i];
            this.removeNodes(layer);
            this.addToSelection(layer, levelNode);
            var layerObj = layer.data.origData;
            level.layers.push(layerObj.id);
        }
    },

    addLevelToLevel: function (targetLevelNode, levelNodesToAdd, useOriginalLevel) {
        if(useOriginalLevel){
            this.levels[targetLevelNode.data.origData.id] = this.originalLevels[targetLevelNode.data.origData.id];
        }
        var targetLevel = this.levels[targetLevelNode.data.origData.id];
        for (var i = 0; i < levelNodesToAdd.length; i++) {
            var level = levelNodesToAdd[i];
            this.removeNodes(level);
            this.addToSelection(level,targetLevelNode);
            var levelObj = level.data.origData;
            if(!targetLevel.children){
                targetLevel.children = [];
            }
            targetLevel.children.push(levelObj.id);
        }
    },
    
    filterNodes: function(tree, textvalue) {
        var store = tree.getStore();
        if(textvalue !== '') {
            var listener = store.on("refresh", function () {
                listener.destroy();
                tree.expandAll();
            }, this, {destroyable: true});
            store.filter("text", textvalue);
        } else {
            tree.collapseAll();
            store.clearFilter();
        }
    },

    hasLeftTrees: function() {
        return (this.config.selectGroups || this.config.selectLayers || this.config.selectOwnServices || this.config.selectCsw);
    },

    initApplicationLayers: function() {
        var me = this;
        var levels = [];
        var rootLevel = me.originalLevels[me.rootLevel];
        if(Ext.isDefined(rootLevel.children)) {
            for(var i = 0 ; i < rootLevel.children.length; i++) {
                var l = me.addLevel(rootLevel.children[i], true, true, this.config.showBackgroundLevels, null,null,me.originalLevels,true);
                if(l !== null) {
                    l.expanded = !l.origData.background; // Make top levels expand
                    levels.push(l);
                }
            }
        }
        me.insertTreeNode(levels, me.treePanels.applicationTree.treePanel.getRootNode());
    },

    loadSelectedLayers: function() {
        var me = this;
        var nodes = [];

        var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
        // First remove all current children, could be a reload of the screen
        me.clearTree(rootNode);

        for ( var i = 0 ; i < me.selectedContent.length ; i ++){
            var contentItem = me.selectedContent[i];
            if(contentItem.type ===  "level") {
                var level = me.addLevel(contentItem.id, true, true, this.config.showBackgroundLevels, null,null,me.levels,false);
                if(level != null ){
                    nodes.push(level);
                }
            } else if(contentItem.type === "appLayer"){
                var layer = me.addLayer(contentItem.id);
                if(layer){
                    nodes.push(layer);
                }
            }
        }
        me.insertTreeNode(nodes, rootNode);
    },

    createAndAddLevel : function ( parent,name) {
        var levelId  = Ext.id();
        var level = {
            background : false,
            children : [],
            id: levelId,
            layers: [],
            name : name
        };
        this.levels [levelId] = level;

        var rootNode = null;

        if (parent) {
            rootNode = parent;
            var rootLevel = this.levels[rootNode.data.origData.id];
            if (!rootLevel.children) {
                rootLevel.children = [];
            }
            rootLevel.children.push(levelId);
        } else {
            rootNode = this.treePanels.selectionTree.treePanel.getRootNode();
            this.selectedContent.push({
                id: levelId,
                type: 'level'
            });
        }

        var node = this.addLevel (levelId, true, true, this.config.showBackgroundLevels,null,null, this.levels,false);

        this.addedLevels.push({id:levelId,status:'new'});
        node = this.insertTreeNode(node,rootNode);
        this.sortTreeAndContent(rootNode.childNodes, rootNode);
    },

    addLevel: function(levelId, showChildren, showLayers, showBackgroundLayers, childrenIdsToShow,descriptions,levels, showRemovedItems) {
        var me = this;
        if(!Ext.isDefined(levels[levelId])) {
            return null;
        }
        var level = levels[levelId];
        if(level.background && !showBackgroundLayers || (!showRemovedItems && level.removed)) {
            return null;
        }
        
        var description = descriptions ? descriptions[level.id] : null;
        var treeNodeLayer = me.createNode('n' + level.id, level.name, level.id, false, false, description);
        treeNodeLayer.type = 'level';
        // Create a leaf node when a level has layers (even if it has children)
        if(Ext.isDefined(level.layers)) {
            treeNodeLayer.type = 'maplevel';
            treeNodeLayer.nodeid = 'm' + level.id;
        }
        if(level.background) {
            treeNodeLayer.origData.background = true;
        }
        if(showChildren) {
            var nodes = [];
            if(Ext.isDefined(level.children)) {
                for(var i = 0 ; i < level.children.length; i++) {
                    var child = level.children[i];
                    if(!childrenIdsToShow || me.containsId(child,childrenIdsToShow)){
                        var l = me.addLevel(child, showChildren, showLayers, showBackgroundLayers,childrenIdsToShow,descriptions,levels, showRemovedItems);
                        if(l !== null) {
                            nodes.push(l);
                        }
                    }
                }
            }
            if(Ext.isDefined(level.layers) && showLayers) {
                for(var j = 0 ; j < level.layers.length ; j ++) {
                    nodes.push(me.addLayer(level.layers[j]));
                }
            }
            treeNodeLayer.origData.children = nodes;
        }
        return treeNodeLayer;
    },

    containsId : function (level, ids){
        var l = this.levels[level];
        if(Ext.Array.contains(ids, parseInt(level))){
            return true;
        }
        if(l.children){
            for( var i = 0 ; i < l.children.length;i++){
                var child = l.children[i];
                var found = Ext.Array.contains(ids,parseInt(child));
                if(found){
                    return true;
                }else{
                    found = this.containsId(child, ids);
                    if(found){
                        return true;
                    }
                }
            }

        }
        return false;
    },

    addLayer: function (layerId){
        var me = this;
        if(!Ext.isDefined(me.appLayers[layerId])) {
            return null;
        }
        var appLayerObj = me.appLayers[layerId];
        var service = me.services[appLayerObj.serviceId];
        var layerTitle = appLayerObj.alias;
        var treeNodeLayer = me.createNode('l' + appLayerObj.id, layerTitle, service.id, true);
        treeNodeLayer.origData.layerName = appLayerObj.layerName;
        treeNodeLayer.type = 'appLayer';
        return treeNodeLayer;
    },

    createNode: function (nodeid, nodetext, serviceid, leaf, expanded,description) {
        if(typeof expanded === "undefined") expanded = false;
        var node =  {
            text: nodetext,
            name: nodetext,
            nodeid: nodeid,
            expanded: expanded,
            expandable:!leaf,
            leaf: leaf,
            origData: {
                id: nodeid.substring(0,2) === 'rl' ? nodeid : nodeid.substring(1),
                service: serviceid
            }
        };
        if(description){
            node["qtip"] = description.description;
        }
        return node;
    },

    insertTreeNode: function(node, root, autoExpand) {
        var returnNode = null;
        if(Ext.isArray(node)) {
            returnNode = [];
            for(var i = 0; i < node.length; i++) {
                returnNode.push(this.appendNode(node[i], root, autoExpand));
            }
        } else {
            returnNode = this.appendNode(node, root, autoExpand);
        }
        return returnNode;
    },
            
    appendNode: function(node, root, autoExpand) {
        if(typeof autoExpand == "undefined") autoExpand = true;
        var addedNode = this.insertNode(root, node);
        if(autoExpand) root.expand();
        return addedNode;
    },

    // Appending the whole tree at once gave issues in ExtJS 4.2.1
    // when there where sub-sub-childs present. Looping over childs,
    // and adding them manually seems to fix this
    insertNode: function(parentNode, insertNode) {
        var me = this,
            newParentNode = parentNode.appendChild(insertNode);
        if(insertNode.origData && insertNode.origData.children) {
            Ext.Array.each(insertNode.origData.children, function(childNode) {
                if(childNode){
                    me.insertNode(newParentNode, childNode);
                }
            });
        }
        return newParentNode;
    },

    handleSourceChange: function(field, newval) {
        if(newval && this.hasLeftTrees()) {
            var selectionModuleCustomFormContainer = this.getCmpByItemId(this.name + "selectionModuleCustomFormContainer");
            if(selectionModuleCustomFormContainer) {
                selectionModuleCustomFormContainer.setVisible(field === 'custom' || field === 'csw');
            }
            if(field === 'custom' || field === 'csw') {
                this.getCmpByItemId("customServiceUrlTextfield").setVisible(field === 'custom');
                this.getCmpByItemId("customServiceUrlSelect").setVisible(field === 'custom');
                this.getCmpByItemId("customServiceUrlButton").setVisible(field === 'custom');
                this.getCmpByItemId("cswServiceUrlTextfield").setVisible(field === 'csw' && (Ext.isEmpty(this.config.showCswUrl) || this.config.showCswUrl));
                this.getCmpByItemId("cswSearchTextfield").setVisible(field === 'csw');
                this.getCmpByItemId("cswServiceUrlButton").setVisible(field === 'csw');
                this.getCmpByItemId("cswAdvancedSearchField").setVisible(field === 'csw' && this.config.advancedFilter);
            }
            this.getCmpByItemId("applicationTreeContainer").setVisible(field === 'application');
            this.getCmpByItemId("registryTreeContainer").setVisible(field === 'registry');
            this.getCmpByItemId("customTreeContainer").setVisible(field === 'custom' || field === 'csw');
            if(field === 'application') {
                this.activeTree = this.treePanels.applicationTree.treePanel;
            }
            if(field === 'registry') {
                this.activeTree = this.treePanels.registryTree.treePanel;
            }
            if(field === 'custom') {
                this.customServiceType = 'custom';
                this.activeTree = this.treePanels.customServiceTree.treePanel;
            }
            if(field === 'csw') {
                this.customServiceType = 'csw';
                this.activeTree = this.treePanels.customServiceTree.treePanel;
            }
        }
    },

    populateCustomServiceTree: function(userService, node, autoExpand) {
        var me = this;
        if(typeof node === "undefined") {
            node = me.treePanels.customServiceTree.treePanel.getRootNode();
            // First remove all current children
            this.clearTree(node);
        }
        if(typeof autoExpand === "undefined") autoExpand = true;
        // Create service node
        var userServiceId = 'us' + (++me.addedServicesCount);
        userService.id = userServiceId;
        if(!Ext.isDefined(userService.serviceName)) userService.serviceName = userService.name;
        me.userServices[userServiceId] = userService;
        var serviceNode = me.createNode('s' + userServiceId, userService.name, null, false);
        serviceNode.type = 'service';
        serviceNode.origData.children = me.createCustomNodesList(userService.topLayer, userServiceId, true);
        me.insertTreeNode(serviceNode, node, autoExpand);
    },

    clearTree : function(rootNode){
        var delNode;
        while (delNode = rootNode.childNodes[0]) {
            rootNode.removeChild(delNode);
        }
    },

    populateCSWTree: function(results) {
        var me = this;
        var rootNode = me.treePanels.customServiceTree.treePanel.getRootNode();
        // First remove all current children
        this.clearTree(rootNode);
        // Create service node
        var cswResults = [];
        if( Object.prototype.toString.call( results ) === '[object Array]' ) {
            cswResults = results;
        } else if(results.hasOwnProperty('success') && results.hasOwnProperty('results') && results.success) {
            cswResults = results.results;
        }
        if(cswResults.length === 0) {
            return;
        }
        for(var i in cswResults) {
            me.addCSWResult(cswResults[i], rootNode);
        }
    },

    addCSWResult: function(cswResult, rootNode) {
        var me = this;
        var userServiceId = 'csw' + (++me.addedServicesCount);
        cswResult.id = userServiceId;
        var cswNode = me.createNode('csw' + userServiceId, cswResult.label, null, false, false);
        cswNode.type = 'cswresult';
        var addedNode = me.insertTreeNode(cswNode, rootNode, false);
        addedNode.data.loadedService = false;
        addedNode.addListener('beforeexpand', function() {
            if(addedNode && !addedNode.data.loadedService) {
                addedNode.data.loadedService = true;
                var si = Ext.create("viewer.ServiceInfo", {
                    protocol: cswResult.protocol,
                    url: cswResult.url
                });
                si.loadInfo(
                    function(info) {
                        me.populateCustomServiceTree(info, addedNode, true);
                    },
                    function(msg) {
                        Ext.MessageBox.alert(i18next.t('viewer_components_selectionmodule_21'), msg);
                    }
                );
            }
        });
    },

    createCustomNodesList: function(node, userServiceId, isTopLayer) {
        var me = this;
        var treeNode = null;
        if(!node) {
            return;
        }
        var hasChildren = Ext.isDefined(node.children);
        // If topLayer is virtual, do not create node for topLayer
        if(!(isTopLayer && node.virtual)) {
            var leaf = true;
            if(hasChildren && node.children.length > 0) leaf = false;
            var layerId = 'usl' +  + (++me.addedLayersCount);
            treeNode = me.createNode('l' + layerId, node.title, null, leaf);
            treeNode.origData.layerName = node.name;
            treeNode.origData.alias = node.title;
            if(node.virtual){
                treeNode.type = 'level';
            }else{
                treeNode.type = 'appLayer';
            }

            treeNode.origData.userService = userServiceId;
        }
        if(hasChildren && node.children.length > 0) {
            var childnodes = [];
            for(var i = 0 ; i < node.children.length; i++) {
                var l = me.createCustomNodesList(node.children[i], userServiceId, false);
                if(l !== null) {
                    childnodes.push(l);
                }
            }
            // If no node was created for topLayer, return the children of the
            // topLayer
            if(isTopLayer && node.virtual) {
                return childnodes;
            }
            treeNode.origData.children = childnodes;
        }
        return treeNode;
    },
    
    moveNodes: function(direction) {
        var me = this;
        var selection = me.treePanels.selectionTree.treePanel.getSelectionModel().getSelection();
        var allNodes = this.getSiblingNodes(selection[0]);
        var doSort = true;
        // First check if we are going to sort (we do not sort when the first item is selected and direction = up
        // or we do not sort when last item is selected and direction = down
        for(var i = 0; i < selection.length; i++) {
            var index = this.findIndex(allNodes, selection[i]);
            if((index === 0 && direction === 'up') || (index === (allNodes.length - 1) && direction === 'down')) {
                doSort = false;
            }
        }
        // If no sorting, return
        if(!doSort) {
            return;
        }
        // Sort selection by index
        this.sortTreeSelection(selection, allNodes);
        // We manually sort because this is much faster than moving the nodes directly in the tree
        if(direction === 'down') {
            // Moving down we iterate back
            for(var i = (selection.length - 1); i >= 0; i--) {
                var index = this.findIndex(allNodes, selection[i]);
                this.moveNodeInArray(allNodes, index+1, index);
            }
        } else {
            // Moving up we iterate forward
            for(var i = 0; i < selection.length; i++) {
                var index = this.findIndex(allNodes, selection[i]);
                this.moveNodeInArray(allNodes, index-1, index);
            }
        }
        this.sortTreeAndContent(allNodes, selection[0].parentNode);
    },
    
    moveNodesToPosition: function(data, below) {
        var allNodes = this.getSiblingNodes(data.records[0]);
        // Get the targetIndex
        var targetIndex = this.findIndex(allNodes, data.event.position.record);
        if(below) {
            targetIndex++;
        }
        // Sort records by index
        this.sortTreeSelection(data.records, allNodes);
        for(var i = 0; i < data.records.length; i++) {
            var current = this.findIndex(allNodes, data.records[i]);
            this.moveNodeInArray(allNodes, (current < targetIndex ? targetIndex - 1 : targetIndex), current);
            targetIndex++;
        }
        this.sortTreeAndContent(allNodes, data.records[0].parentNode);
    },
    
    getSiblingNodes: function(record) {
        var rootNode = this.treePanels.selectionTree.treePanel.getRootNode();
        var siblingNodes = rootNode.childNodes;
        if(record.parentNode !== null) {
            siblingNodes = record.parentNode.childNodes;
        }
        return siblingNodes;
    },
    
    sortTreeAndContent: function(allNodes, parentNode) {
        this.sortNodes(allNodes);
        if(parentNode === null || parentNode.id === "root") {
            this.reorderSelectedContent(allNodes);
        } else {
            // ParentNode is always a level
            var recordOrigData = this.getOrigData(parentNode);
            this.reorderLevel(this.levels[recordOrigData.id], allNodes);
        }
    },
    
    /**
     * This method makes sure the selection itself is ordered by current order,
     * By default the selection is ordered by the order in which items are selected.
     */
    sortTreeSelection: function (selection, allNodes) {
        selection.sort((function sortOnIndex(a, b) {
            var indexA = this.findIndex(allNodes, a);
            var indexB = this.findIndex(allNodes, b);
            return indexA - indexB;
        }).bind(this));
    },
    
    /**
     * Sorts the actual nodes in the tree
     */
    sortNodes: function(allNodes) {
        // Set indexes, first for all levels, than for all layers (levels are always first)
        var index = 0;
        // First give all levels an index
        for(var i = 0; i < allNodes.length; i++) {
            if(["level", "maplevel"].indexOf(this.getNodeType(allNodes[i])) !== -1) {
                allNodes[i].set('index', index++);
            }
        }
        // Then give all layers an index
        for(var i = 0; i < allNodes.length; i++) {
            if(["appLayer", "layer"].indexOf(this.getNodeType(allNodes[i])) !== -1) {
                allNodes[i].set('index', index++);
            }
        }
        // Sort indexes
        this.treePanels.selectionTree.treeStore.sort('index', 'ASC');
    },
    
    /**
     * Finds the index of a node in an array
     */
    findIndex: function(allNodes, node) {
        for(var i = 0; i < allNodes.length; i++) {
            if(allNodes[i].get('nodeid') === node.get('nodeid')) {
                return i;
            }
        }
        return -1;
    },
    
    moveNodeInArray: function(list, to, from) {
        list.splice(to, 0, list.splice(from, 1)[0]);
    },
    
    reorderLevel: function(level, allNodes) {
        function findIndex(allNodes, node) {
            for(var i = 0; i < allNodes.length; i++) {
                var curNode = allNodes[i];
                if(this.getNodeId(curNode) === node) {
                    return i;
                }
            }
            return -1;
        }
        function sortFunction(a, b) {
            var indexA = findIndex.call(this, allNodes, a);
            var indexB = findIndex.call(this, allNodes, b);
            return indexA - indexB;
        }
        if(level.hasOwnProperty("children")) {
            level.children.sort(sortFunction.bind(this));
        }
        if(level.hasOwnProperty("layers")) {
            level.layers.sort(sortFunction.bind(this));
        }
    },

    reorderSelectedContent: function(allNodes) {
        var me = this;
        function findIndex(allNodes, node) {
            for(var i = 0; i < allNodes.length; i++) {
                var curNode = allNodes[i];
                if(this.getNodeId(curNode) === node.id && node.type === (curNode.data.type === 'maplevel' ? 'level' : curNode.data.type)) {
                    return i;
                }
            }
            return -1;
        }
        this.selectedContent.sort((function sortOnIndex(a, b) {
            var indexA = findIndex.call(this, allNodes, a);
            var indexB = findIndex.call(this, allNodes, b);
            return indexA - indexB;
        }).bind(this));
    },
    
    getNodeId: function(node) {
        return node.get('nodeid').replace(/(?![ext-])[^0-9]/ig, '');
    },

    addNodes: function(selection) {
        var me = this;
        Ext.Array.each(selection, function(record) {
            me.addToSelection(record);
        });
    },
    
    nodesAddAllowed: function(records) {
        // If we find 1 allowed record we allow adding (invalid ones will be filtered later)
        for(var i = 0; i < records.length; i++) {
            if(this.nodeAddAllowed(records[i])) {
                return true;
            }
        }
        return false;
    },
    
    nodeAddAllowed: function(record) {
        var nodeType = this.getNodeType(record);
        if(nodeType === "appLayer" || nodeType === "layer" || (nodeType === "maplevel" && (!this.nodeSelected(record, nodeType)))) {
            return true;
        }
        return false;
    },

    addToSelection: function(record, parent) {
        var me = this;
        var nodeType = me.getNodeType(record);
        if(!this.nodeAddAllowed(record)) {
            return;
        }
        var rootNode = parent ? parent : me.treePanels.selectionTree.treePanel.getRootNode();
        var recordOrigData = me.getOrigData(record);
        var recordid = record.get('id');
        if(nodeType === "layer") {
            recordid = 'rl' + recordid;
        }
        var searchNode = rootNode.findChild('id', recordid, false);
        if(searchNode !== null || rootNode === null) {
            return;
        }
        var objData = record.data;
        var addChildren = [];
        if(nodeType === "appLayer") {
            var serviceId = null;
            if(Ext.isDefined(recordOrigData.userService)){
                // Own service
                var customService = Ext.clone(me.userServices[recordOrigData.userService]);
                customService.status = 'new';
                me.addService(customService);
                serviceId = customService.id;
            }else{
                var service = me.services[recordOrigData.service];
                serviceId = service.id;
            }
            if(me.appLayers[recordOrigData.id] && me.appLayers[recordOrigData.id].removed) {
                me.appLayers[recordOrigData.id].removed = false;
            }
            me.addedLayers.push({
                background: false,
                checked: this.autoCheck(),
                id: recordOrigData.id,
                layerName: recordOrigData.layerName,
                alias: recordOrigData.alias,
                serviceId: serviceId,
                status: 'new'
            });
            if(!parent){
                me.selectedContent.push({
                    id: recordOrigData.id,
                    type: 'appLayer'
                });
            }
        }
        else if(nodeType === "maplevel") {
            // Added from application
            me.addedLevels.push({id:recordOrigData.id,status:'new'});
            if(!parent){
                me.selectedContent.push({
                    id: recordOrigData.id,
                    type: 'level'
                });
            }
            var level = this.levels[recordOrigData.id];
            this.processRemovedFlag(level);
            if(level && !level.background && this.autoCheck()) {
                this.checkAllChildren(level, true);
            }
        } else if(nodeType === "layer") {
            // Added from registry
            var service = me.findService(record);
            objData = null;
            if(service !== null) {
                service.status = 'new';
                me.addService(service);
                me.addedLayers.push({
                    background: false,
                    checked: this.autoCheck(),
                    id: recordid,
                    layerName: record.data.layerName,
                    alias: record.data.layerName,
                    serviceId: service.id,
                    status: 'new'
                });
                me.selectedContent.push({
                    id: recordid,
                    type: 'appLayer'
                });
                objData = me.createNode(recordid, record.get('name'), service.id, true);
                objData.type = 'appLayer';
                objData.origData.userService = service.id;
            }
        }
        if(objData !== null) {
            this.insertNode(rootNode, objData);
        }
    },
    
    processRemovedFlag: function (level){
        this.levels[level.id].removed = false;
        var l = this.levels[level.id];
        if(level.children){
            for(var i = 0 ; i < l.children.length; i++){
                var child = this.levels[l.children[i]];
                this.processRemovedFlag(child);
            }
        }
        
        if (l.layers) {
            for (var i = 0; i < l.layers.length; i++) {
                this.appLayers[l.layers[i]].removed = false;
            }
        }
    },
    
    autoCheck: function(type) {
        return !this.config.hasOwnProperty('autoOnLayers')
            || this.config.autoOnLayers === 'always'
            || (typeof type !== "undefined" && this.config.autoOnLayers === type);
    },
    
    checkAllChildren: function(level, checked) {
        if(level.layers) {
            for(var i = 0; i < level.layers.length; i++) {
                this.checkLayer(level.layers[i], checked);
            }
        }
        if(level.children) {
            var sublevel;
            for(var j = 0; j < level.children.length; j++) {
                sublevel = this.levels[level.children[j]];
                if(!sublevel) {
                    continue;
                }
                this.checkAllChildren(sublevel, checked);
            }
        }
    },
    
    checkLayer: function(layerId, checked) {
        if(!this.appLayers[layerId]) {
            return;
        }
        this.appLayers[layerId].checked = checked;
    },

    findService: function(record) {
        var me = this;
        var parentNode = record.parentNode;
        // Root level reached and no service found
        if(parentNode == null) return null;
        if(me.getNodeType(parentNode) === "service") {
            return parentNode.data.service;
        } else {
            return me.findService(parentNode);
        }
    },

    /**
     * Makes sure the service for a layer will be available in the app
     */
    addService: function(customService) {
        var me = this;

        // If service was already added for a previous layer, do nothing
        if(Ext.Array.some(me.addedServices, function(addedService) {
            return addedService.id == customService.id;
        })) {
            return;
        }

        // Check if the service was already in app
        if(me.services[customService.id]) {
            // We may need to supplement the existing service with new layer
            // info - add all layer ids to the service info when saving
            me.layerMergeServices[customService.id] = customService;
        } else {
            // New service
            me.addedServices.push(customService);
        }
    },

    removeNodes: function(records) {
        var me = this;
        Ext.Array.each(records, function(record) {
            var nodeType = me.getNodeType(record);
            var recordOrigData = me.getOrigData(record);
            if(recordOrigData === null) {
                return;
            }
            if(recordOrigData.service == null) {
                // Own service
                me.removeLayer(recordOrigData.id, null);
                me.removeService(recordOrigData.userService);
            }
            else if(nodeType === "maplevel" || nodeType === "level") {
                // Added from application
                me.removeLevel(recordOrigData.id, null);
            }
            else if(nodeType === "appLayer") {
                // Added from registry or application
                me.removeLayer(recordOrigData.id, null);
                me.removeService(recordOrigData.userService);
            }

            var rootNode = me.treePanels.selectionTree.treePanel.getRootNode();
            var node = rootNode.findChild('id', record.get('id'), true);
            var parent = rootNode;
            if(node){
                parent = node.parentNode;
            }
            parent.removeChild(rootNode.findChild('id', record.get('id'), true));
        });
    },

    removeService: function(serviceid) {
        var me = this;
        var addedServices = [];
        var totalLayers = 0;
        if(serviceid != null) {
            Ext.Array.each(me.addedLayers, function(addedLayer) {
                if(addedLayer.serviceId == serviceid) totalLayers++;
            });
        }
        if(totalLayers == 0) {
            Ext.Array.each(me.addedServices, function(addedService) {
                if(addedService.id != serviceid) {
                    addedServices.push(addedService);
                }
            });
            me.addedServices = addedServices;
        }
    },

    removeLayer: function(layerid) {
        var me = this;
        var addedLayers = [];
        Ext.Array.each(me.addedLayers, function(addedLayer) {
            if(addedLayer.id != layerid) {
                addedLayers.push(addedLayer);
            }
        });
        var selectedContent = [];
        Ext.Array.each(me.selectedContent, function(content) {
            if(!(content.id == layerid && content.type === "appLayer")) {
                selectedContent.push(content);
            }
        });

        var levels = {};
        Ext.Object.each(me.levels, function(key,level) {
            var layers = [];
            if(level.layers){
                Ext.Array.each(level.layers, function(layer) {
                    if(layer !== layerid){
                        layers.push(layer);
                    }
                });
                level.layers = layers;
            }
            levels[key] = level;
        });

        me.levels = levels;
        me.selectedContent = selectedContent;
        me.addedLayers = addedLayers;
    },

    removeLevel: function(levelid) {
        var me = this;
        var addedLevels = [];
        Ext.Array.each(me.addedLevels, function(addedLevel) {
            if(addedLevel.id !== levelid) {
                addedLevels.push(addedLevel);
            }
        });
        var selectedContent = [];
        Ext.Array.each(me.selectedContent, function(content) {
            if(!(content.id === levelid && content.type === "level")) {
                selectedContent.push(content);
            }
        });

        
        var levels = {};
        Ext.Object.each(me.levels, function (key,level) {
            var childs = [];
            Ext.Array.each(level.children, function (child) {
                if (child !== levelid) {
                    childs.push(child);
                }
            });
            level.children = childs;
            levels[key] = level;
        });
        
        me.levels = levels;
        me.selectedContent = selectedContent;
        me.addedLevels = addedLevels;
    },

    cancelSelection: function() {
        var me = this;
        // Remove layers, levels and services with status = new, a.k.a. not added to the selectedContent
        Ext.Array.each(me.addedLayers, function(addedLayer) {
            if(addedLayer.status === 'new') {
                me.removeLayer(addedLayer.id);
            }
        });

        Ext.Array.each(me.addedLevels, function(addedLevel) {
            if(addedLevel.status === 'new') {
                me.removeLevel(addedLevel.id);
            }
        });
        Ext.Array.each(me.addedServices, function(addedService) {
            if(addedService.status === 'new') {
                me.removeService(addedService.id);
            }
        });
        me.layerMergeServices = {};
        me.popup.hide();
    },

    saveSelection: function() {
        var me = this;
        var checkedFirstBackgroundLayer = null;
        Ext.Array.each(me.addedServices, function(addedService) {
            if(addedService.status === 'new') {
                addedService.status = 'added';
                me.config.viewerController.addService(addedService);
            }
        });
        Ext.Object.each(me.layerMergeServices, function(mergeServiceId, mergeService) {
            var mergedService = me.config.viewerController.app.services[mergeService.id];
            Ext.Object.each(mergeService.layers, function(name, layer) {
                if(mergedService.layers[name] == undefined) {
                    mergedService.layers[name] = layer;
                    mergedService.layers[name].status = "added";
                }
            });
        });
        Ext.Array.each(me.addedLevels, function(addedLevel) {
            if(addedLevel.status === 'new') {
                addedLevel.status = 'added';
                if(me.levels[addedLevel.id] && me.levels[addedLevel.id].background && checkedFirstBackgroundLayer === null && me.autoCheck('onlybackground')) {
                    checkedFirstBackgroundLayer = addedLevel.id;
                }
            }
        });
        Ext.Array.each(me.addedLayers, function(addedLayer) {
            if(addedLayer.status === 'new') {
                addedLayer.status = 'added';
                me.config.viewerController.addAppLayer(addedLayer);
            }
        });
        if(checkedFirstBackgroundLayer !== null) {
            var item;
            var checked;
            var level;
            for(var i = 0; i < me.selectedContent.length; i++) {
                item = me.selectedContent[i];
                if(item.type === "level"){
                    level = this.levels[item.id];
                    if(level && level.background){
                        checked = parseInt(level.id, 10) === parseInt(checkedFirstBackgroundLayer, 10);
                        level.checked = checked;
                        this.checkAllChildren(level, checked);
                    }
                }
            }
        }
        me.config.viewerController.app.levels = me.levels;
        me.config.viewerController.setSelectedContent(me.selectedContent);
        me.popup.hide();
    },

    getNodeType: function(record) {
        if(Ext.isDefined(record.data) && Ext.isDefined(record.data.type)) return record.data.type;
        return null;
    },

    getOrigData: function(record) {
        if(Ext.isDefined(record.data) && Ext.isDefined(record.data.origData)) return record.data.origData;
        return null;
    },

    nodeSelected: function(record, nodeType) {
        var recordData = this.getOrigData(record);
        var foundNodeIndex = this.treePanels.selectionTree.treeStore.findBy(function(treeRecord){
            var treeNodeType = this.getNodeType(treeRecord);
            var treeNodeData = this.getOrigData(treeRecord);
            return (treeNodeType === nodeType && parseInt(treeNodeData.id, 10) === parseInt(recordData.id, 10));
        }, this);
        return foundNodeIndex !== -1;
    },

    getExtComponents: function() {
        var me = this;
        return this.mainContainer ? [ this.mainContainer.getId() ] : [];
    },

    getCmpByItemId: function(id) {
        return Ext.ComponentQuery.query("#" + id)[0];
    },

    getCmpIdByItemId: function(id) {
        return this.getCmpByItemId(id).getId();
    }

});