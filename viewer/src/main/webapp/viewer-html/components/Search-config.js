/* 
 * Copyright (C) 2012-2017 B3Partners B.V.
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
/**
 * Custom configuration object for AttributeList configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.SearchConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    panel: null,
    panelHeight: 120,
    searchconfigs: [],
    nextId: 1,
    maxSearchConfigs: -1,
    hideRemovePinConfig: false,
    solrSearchconfigs: {},
    attribuutbronSearchconfigs: {},
    simpleListConfigs: {},
    layerSelectionWindow: null,
    requiredLayersOn: null,
    switchLayersOn: null,
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        if(configObject.searchconfigs) {
            if(configObject.searchconfigs.length > 0) {
                if (configObject.searchconfigs[0].type === 'solr') {
                    configObject.willLoadLayers = true;
                }
            }
        }
        viewer.components.SearchConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        if (!this.hideRemovePinConfig) {
            this.form.add({
                xtype: 'checkbox',
                boxLabel: i18next.t('viewer_components_searchconfiguration_0'),
                name: 'showRemovePin',
                value: true,
                inputValue: true,
                checked: this.configObject.showRemovePin !== undefined ? this.configObject.showRemovePin : true,
                style: {
                    marginRight: "90px"
                }
            });
        }
        this.form.add({
            xtype: 'checkbox',
            boxLabel: i18next.t('viewer_components_searchconfiguration_35'),
            name: 'showFeatureInfoAfterSearch',
            checked: this.configObject.showFeatureInfoAfterSearch !== undefined ? this.configObject.showFeatureInfoAfterSearch : false,
            style: {
                marginRight: "90px"
            }
        });
        this.form.add({
            xtype: "combobox",
            fields: ['value','text'],
            fieldLabel: i18next.t('viewer_components_searchconfiguration_1'),
            value: this.configObject.marker ? this.configObject.marker : "default",
            name: "marker",
            emptyText: i18next.t('viewer_components_searchconfiguration_2'),
            store: [
                ["default", i18next.t('viewer_components_searchconfiguration_3')],
                ["circle", i18next.t('viewer_components_searchconfiguration_4')],
                ["none", i18next.t('viewer_components_searchconfiguration_5')]
            ],
            labelWidth: this.labelWidth
        });
        this.initSearchconfigs(configObject);
    },
    initSearchconfigs: function(config) {
        var me = this;
        me.panel = Ext.create('Ext.panel.Panel', {
            width: me.formWidth,
            margin: '15 0 0 0',
            height: 350,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            autoScroll: true,
            items: [],
            renderTo: 'config',
            tbar: this.maxSearchConfigs === 1 ? null : [
                "->",
                {
                    xtype:'button',
                    iconCls: 'x-fa fa-plus-circle',
                    text: i18next.t('viewer_components_searchconfiguration_6'),
                    listeners: {
                        click:{
                            fn: function() {
                                me.appendSearchField();
                            },
                            scope: me
                        }
                    }
                }
            ]
        });
        
        var extraText = document.createElement('div');
        extraText.innerHTML=i18next.t('viewer_components_searchconfiguration_7');
        document.getElementById("config").appendChild(extraText);

        if(config !== null) {
            if(config.searchconfigs !== null) {
                Ext.Array.each(config.searchconfigs, function(searchconfig) {
                    me.appendSearchField(searchconfig);
                });
            }
            if(config.nextSearchConfigId) {
                me.nextId = config.nextSearchConfigId;
            }
        }
        if(this.maxSearchConfigs === 1 && (!config || !config.searchconfigs || config.searchconfigs.length === 0)) {
            me.appendSearchField();
        }
    },
    appendSearchField: function(config) {
        var me = this;
        // Check maxSearchConfigs
        if(me.maxSearchConfigs !== -1 && me.maxSearchConfigs < me.nextId) {
            return;
        }
        var nextId = me.nextId;
        var newconfig = config || {
            id: 'search' + nextId,
            name: 'Zoekingang ' + nextId,
            url: '',
            type: 'openls'
        };
        me.searchconfigs.push(newconfig);
        var collapsed = true;
        if(nextId === 1) collapsed = false;
        me.panel.add(me.newSearchField(newconfig, collapsed));
        if(!collapsed){
            this.showExtraconfig(newconfig.type, newconfig.id);
        }
        me.nextId++;
    },
    newSearchField: function(config, collapsed) {
        var me = this;
        var searchField = {
            xtype: 'panel',
            itemId: config.id,
            layout: 'anchor',
            anchor: '100%',
            title: config.name,
            animCollapse: false,
            collapsible: true,
            collapsed: collapsed,
            iconCls: "x-fa fa-wrench",
            titleCollapse: true,
            hideCollapseTool: true,
            items: [
                { 
                    xtype: 'fieldset',
                    defaultType: 'textfield',
                    border: 0,
                    padding: 10,
                    style: {
                        border: '0px none',
                        marginBottom: '0px'
                    },
                    items: [
                        { fieldLabel: i18next.t('viewer_components_searchconfiguration_8'), name: 'name', value: config.name, itemId: 'name'+config.id },
                        { fieldLabel: i18next.t('viewer_components_searchconfiguration_9'), name: 'urlOnly'+config.id, itemId: 'urlOnly'+config.id, checked: config.urlOnly, xtype:'checkbox'},
                        { fieldLabel: i18next.t('viewer_components_searchconfiguration_10'), itemId: 'idField'+config.id,name: 'idField'+config.id, value: config.id,readOnly:true, readOnlyCls:'disabledTextField'},
                        {                           
                            xtype: 'radiogroup',
                            itemId: 'type' + config.id,
                            fieldLabel: i18next.t('viewer_components_searchconfiguration_11'),
                            vertical: true,
                            name: "type" + config.id,
                            items: [{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_12'), 
                                name: 'type' + config.id, 
                                inputValue: 'openls',
                                checked: config.type === "openls" || config.type === undefined
                            },{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_13'), 
                                name: 'type' + config.id, 
                                inputValue: 'arcgisrest',
                                checked: config.type === "arcgisrest"
                            },{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_14'), 
                                name: 'type' + config.id, 
                                inputValue: 'solr',
                                checked: config.type === "solr"
                            },{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_15'), 
                                name: 'type' + config.id, 
                                inputValue: 'pdok',
                                checked: config.type === "pdok"
                            },{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_16'), 
                                name: 'type' + config.id, 
                                inputValue: 'attributesource',
                                checked: config.type === "attributesource"
                            },{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_17'), 
                                name: 'type' + config.id, 
                                inputValue: 'simplelist',
                                checked: config.type === "simplelist"
                            },{
                                boxLabel: i18next.t('viewer_components_searchconfiguration_36'), 
                                name: 'type' + config.id, 
                                inputValue: 'coordinate',
                                checked: config.type === "coordinate"
                            }],
                            listeners: {
                                change: function(radio) {
                                    me.showExtraconfig(radio.getValue()[radio.getName()], config.id);
                                }
                            }
                        },
                        { fieldLabel: i18next.t('viewer_components_searchconfiguration_18'), name: 'url', value: config.url, itemId: 'url'+config.id, width: 720 },
                        { xtype: 'container', itemId: 'solrConfig' + config.id, hidden: true, height: 130, autoScroll: true },
                        { xtype: 'container', itemId: 'asConfig' + config.id, hidden: true, height: 130, autoScroll: true },
                        {
                            xtype: 'container',
                            itemId: 'pdokConfig' + config.id,
                            hidden: true,
                            height: 100,
                            autoScroll: true,
                            items: [
                                {   xtype: "textfield",
                                    value: config.filter,
                                    name: "filter" + config.id,
                                    itemId: "filter" + config.id,
                                    fieldLabel: i18next.t('viewer_components_searchconfiguration_19'),
                                    labelWidth: 120,
                                    width: 600
                                },
                                {   xtype: "container",
                                    html: i18next.t('viewer_components_searchconfiguration_20') +
                                    "<a href=\"https://github.com/flamingo-geocms/flamingo/wiki/Searchconfiguration#pdok-search-engine\" target='_help'>" +
                                    "https://github.com/flamingo-geocms/flamingo/wiki/Searchconfiguration#pdok-search-engine" +
                                    "</a>"
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            itemId: 'coordinateConfig' + config.id,
                            hidden: true,
                            height: 100,
                            autoScroll: true,
                            items: [
                                {   xtype: "textfield",
                                    value: config.buffer,
                                    name: "buffer" + config.id,
                                    itemId: "buffer" + config.id,
                                    fieldLabel: i18next.t('viewer_components_searchconfiguration_37'),
                                    labelWidth: 120,
                                    width: 600
                                }
                            ]
                        },
                        { xtype: 'container', itemId: 'simpleListConfig' + config.id, hidden: true, height: 160, margin: '5 0 5 0', layout: { type: 'vbox', align: 'stretch' } },
                          {
                            xtype:'button',
                            iconCls: 'x-fa fa-floppy-o',
                            text: i18next.t('viewer_components_searchconfiguration_21'),
                            listeners: {
                                click: function(button) {
                                    me.saveConfig();
                                }
                            }
                        }
                    ]
                }
            ],
            tbar: this.maxSearchConfigs === 1 ? null : ["->", {
                xtype:'button',
                iconCls: 'x-fa fa-minus-circle',
                text: i18next.t('viewer_components_searchconfiguration_22'),
                listeners: {
                    click: function() {
                        me.removeConfig(config.id);
                    }
                }
            }],
            listeners: {
                beforeexpand: function(expandItem){
                    Ext.Array.each(me.panel.query('> panel'), function(item) {
                        if(item.itemId !== expandItem.itemId) {
                            item.collapse();
                        }
                    });
                },
                expand: function() {
                    setTimeout(function() {
                        me.showExtraconfig(me.getType(config.id), config.id);
                    }, 0);
                }
            }
        };
        return searchField;
    },
    getType: function(configid) {
        return Ext.ComponentQuery.query('#type' + configid)[0].getValue()['type' + configid];
    },
    showExtraconfig: function(type, configid) {
        // When switching radio input type is an array
        if(typeof type !== 'string') return;
        this.hideExtraConfig(configid);
        if(type === 'solr' || type === 'simplelist' || type === 'pdok' || type === 'attributesource' || type === 'coordinate') {
            if(type === 'solr') {
                // Show additional Solr configuration
                this.addSolrconfig(configid);
            }
            if(type === 'simplelist') {
                this.addSimplelistConfig(configid);
            }
            if(type === "pdok"){
                this.addPdokConfig(configid);
            }
            if(type === 'attributesource'){
                this.addAttributeSourceConfig(configid);
            }
            if(type === 'coordinate'){
                this.addCoordinateConfig(configid);
            }
            this.hideUrl(configid);
        } else {
            this.showUrl(configid);
        }
    },
    hideUrl: function(configid) {
        Ext.ComponentQuery.query('#url' + configid)[0].setVisible(false);
    },
    showUrl: function(configid) {
        Ext.ComponentQuery.query('#url' + configid)[0].setVisible(true);
    },
    saveConfig: function() {
        var me = this;
        var newSearchconfigs = [];
        Ext.Array.each(me.searchconfigs, function(searchconfig) {
            var configid = searchconfig.id,
                name = Ext.ComponentQuery.query('#name' + configid)[0].getValue(),
                type = Ext.ComponentQuery.query('#type' + configid)[0].getValue()['type' + configid],
                url = Ext.ComponentQuery.query('#url' + configid)[0].getValue(),
                urlOnly = Ext.ComponentQuery.query('#urlOnly'+configid)[0].getValue();
            if(name === '') {
                name = configid;
            }
            Ext.ComponentQuery.query('#' + configid)[0].setTitle(name);
            searchconfig.name = name;
            searchconfig.url = url;
            searchconfig.type= type;
            searchconfig.urlOnly= urlOnly;
            if(type === 'solr') {
                me.saveSolrconfig(configid);
            }
            if(type === 'pdok') {
                me.savePDOKConfig(configid);
            }
            if(type === 'simplelist') {
                me.saveSimpleListConfig(configid);
            }
            if(type === 'attributesource') {
                me.saveASConfig(configid);
            }
            if(type === 'coordinate') {
                me.saveCoordinateConfig(configid);
            }
            newSearchconfigs.push(searchconfig);
        });
        me.searchconfigs = newSearchconfigs;
    },
    removeConfig: function(configid) {
        var me = this;
        me.panel.remove(configid);
        var newSearchconfigs = [];
        Ext.Array.each(me.searchconfigs, function(searchconfig) {
            if(searchconfig.id !== configid) {
                newSearchconfigs.push(searchconfig);
            }
        });
        me.searchconfigs = newSearchconfigs;
    },
    getConfiguration: function(){
        var me = this;
        var config = viewer.components.SearchConfiguration.superclass.getConfiguration.call(this);
        me.saveConfig();
        config['searchconfigs'] = me.searchconfigs;
        config['nextSearchConfigId'] = me.nextId;
        return config;
    },
    addSimplelistConfig: function(configid) {
        var containerId = '#simpleListConfig' + configid,
            searchConfig = this.getConfig(configid),
            me = this,
            container = Ext.ComponentQuery.query(containerId)[0];
        if(!me.simpleListConfigs.hasOwnProperty(configid)) {
            me.simpleListConfigs[configid] = Ext.create('Ext.container.Container', {
                flex: 1,
                autoScroll: true
            });
            container.add({ xtype: 'container', items: [{ xtype: 'button', text: i18next.t('viewer_components_searchconfiguration_23'), handler: function() {
               me.simpleListConfigs[configid].add(me.getSimpleListFields({}, configid));
            }}]});
            container.add(me.simpleListConfigs[configid]);
            if(searchConfig.hasOwnProperty('simpleSearchConfig')) {
                Ext.Array.each(searchConfig.simpleSearchConfig, function(value) {
                    me.simpleListConfigs[configid].add(me.getSimpleListFields(value, configid));
                });
            }
        }
        container.show();
    },
    getSimpleListFields: function(config, configid) {
        return {
            xtype: 'container',
            layout: 'hbox',
            width: '100%',
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                margin: '0 5 0 0'
            },
            items: [
                { fieldLabel: i18next.t('viewer_components_searchconfiguration_24'), name: 'label', value: config.label || '' },
                { fieldLabel: i18next.t('viewer_components_searchconfiguration_25'), name: 'value', value: config.value || '' },
                { fieldLabel: i18next.t('viewer_components_searchconfiguration_26'), name: 'minX', size: 8, value: config.bbox && config.bbox.minx || '' },
                { fieldLabel: i18next.t('viewer_components_searchconfiguration_27'), name: 'minY', size: 8, value: config.bbox && config.bbox.miny || '' },
                { fieldLabel: i18next.t('viewer_components_searchconfiguration_28'), name: 'maxX', size: 8, value: config.bbox && config.bbox.maxx || '' },
                { fieldLabel: i18next.t('viewer_components_searchconfiguration_29'), name: 'maxY', size: 8, value: config.bbox && config.bbox.maxy || '' }
            ]
        };
    },
    saveSimpleListConfig: function(configid) {
        var searchConfig = this.getConfig(configid),
            simpleSearchConfig = searchConfig.simpleSearchConfig || [];
        if(this.simpleListConfigs.hasOwnProperty(configid)) {
            var simpleListContainer = this.simpleListConfigs[configid];
            simpleSearchConfig = [];
            // Get all field containers (all rows)
            simpleListContainer.query('.container').forEach(function(fieldContainer) {
                var simpleConfig = {};
                // Get all fields (all columns)
                fieldContainer.query('.textfield').forEach(function(field) {
                    // Set name of field as key and its value as value
                    simpleConfig[field.getName()] = field.getValue();
                });
                // Check if config is valid (are all required fields filled in)
                if(simpleConfig.label && simpleConfig.minX && simpleConfig.minY && simpleConfig.maxX && simpleConfig.maxY) {
                    simpleSearchConfig.push({
                        label: simpleConfig.label,
                        value: simpleConfig.value,
                        bbox: {
                            minx: simpleConfig.minX,
                            miny: simpleConfig.minY,
                            maxx: simpleConfig.maxX,
                            maxy: simpleConfig.maxY
                        }
                    });
                }
            });
        }
        searchConfig.simpleSearchConfig = simpleSearchConfig;
    },
    /**
     * Show Solr configuration options for searchConfig
     * @param searchconfigId Add solr configuration 
     */
    addSolrconfig: function(searchconfigId) {
        var solrConfigContainer = Ext.ComponentQuery.query('#solrConfig' + searchconfigId)[0];
        var me = this;
        if(!this.solrSearchconfigs.hasOwnProperty(searchconfigId)) {
            
            var searchConfig = me.getConfig(searchconfigId);
            if(!searchConfig.solrConfig) {
                searchConfig.solrConfig = {};
            }
            var checked = [];
            if(searchConfig && searchConfig.hasOwnProperty('solrConfig')) {
                Ext.Object.each(searchConfig.solrConfig, function(key, value) {
                    checked.push(value.solrConfigid);
                });
            }
            // Show the filterableCheckboxes component with all Solr configs
            this.solrSearchconfigs[searchconfigId] = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: this.getContextpath() + "/action/configuresolr?getSearchconfigData=true",
                parentContainer: solrConfigContainer,
                titleField: 'name',
                checked: checked,
                // Provide custom renderLabel function to add 'config layers' link to label
                renderLabel: function(id, label) {
                    return label + ' &nbsp;&nbsp;<a href="#" class="configureLayer" id="' + id + '_layers">' + i18next.t('viewer_components_searchconfiguration_30') + '</a>';
                },
                // Provide function to handle clicking the 'config layers' link
                labelClick: function(evt, target) {
                    // If the target clicked is not the link, do nothing
                    if(!target.className || target.className.indexOf('configureLayer') === -1) return;
                    // Link is clicked, show window with layers
                    me.showLayerconfig(target, searchconfigId, searchConfig);
                }
            });
        }
        solrConfigContainer.setVisible(true);
        this.panel.updateLayout();
    },
    
    addAttributeSourceConfig: function (searchconfigId) {
        var solrConfigContainer = Ext.ComponentQuery.query('#asConfig' + searchconfigId)[0];
        var me = this;
        if(!this.attribuutbronSearchconfigs.hasOwnProperty(searchconfigId)) {
            
            var searchConfig = me.getConfig(searchconfigId);
            if(!searchConfig.asConfig) {
                searchConfig.asConfig = {};
            }
            var checked = [];
            if(searchConfig && searchConfig.hasOwnProperty('asConfig')) {
                Ext.Object.each(searchConfig.asConfig, function(key, value) {
                    checked.push(value.solrConfigid);
                });
            }
            // Show the filterableCheckboxes component with all Solr configs
            this.attribuutbronSearchconfigs[searchconfigId] = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: this.getContextpath() + "/action/configuresolr?getSearchconfigData=true",
                parentContainer: solrConfigContainer,
                titleField: 'name',
                checked: checked
            });
        }
        solrConfigContainer.setVisible(true);
        this.panel.updateLayout();
    },
    
    addPdokConfig: function(configid){
        var searchConfig = this.getConfig(configid);
        var pdokConfigContainer = Ext.ComponentQuery.query('#pdokConfig' + configid)[0];
        pdokConfigContainer.setVisible(true);
        this.panel.updateLayout();
    },
    
    addCoordinateConfig: function(configid){
        var coordinate = Ext.ComponentQuery.query('#coordinateConfig' + configid)[0];
        coordinate.setVisible(true);
        
        this.panel.updateLayout();
    },
    
    makeFilterableCheckboxesAttributes: function (featureType, configId){
        //Ext.ux.b3p.FilterableCheckboxes  
        var parentcontainer = Ext.ComponentQuery.query('#checkboxes' + configId)[0];
        var checkboxes = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
            requestUrl: '',
            itemList:featureType.attributes,
            titleField: 'name',
            parentContainer: parentcontainer
        });
        checkboxes.render();            
    },
    
    /**
     * Shows the window with layers which must be on / will be switched on when
     * using the solr search
     * @param target
     * @param searchconfigId
     * @param searchConfig
     */
    showLayerconfig: function(target, searchconfigId, searchConfig) {
        var me = this;
        // Get ID of checkbox to find solrSearchConfigId
        var checkboxId = 'checkbox-' + target.id.replace('_layers', '');
        // Get checkbox
        var checkbox = document.getElementById(checkboxId);
        // Get solrSearchConfigId 
        var solrConfigId = checkbox.value;
        // Show layers config window
        if(me.layerSelectionWindow === null) {
            me.layerSelectionWindow = Ext.create('Ext.window.Window', {
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                modal: true,
                closeAction: 'hide',
                width: 600,
                height: 400,
                bodyPadding: 10,
                resizable: false,
                title: i18next.t('viewer_components_searchconfiguration_31'),
                bodyStyle: 'background-color: White;',
                bbar: [
                    { xtype: 'tbfill' },
                    { xtype: 'button', text: i18next.t('viewer_components_searchconfiguration_32'), itemId: 'configureLayersButton' }
                ],
                items: [
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        height: 20,
                        items: [
                            { xtype: 'container', flex: 1, margin: '0 10px 0 0', html: { tag: "b", html: i18next.t('viewer_components_searchconfiguration_33') } },
                            { xtype: 'container', flex: 1, html: { tag: "b", html: i18next.t('viewer_components_searchconfiguration_34') } }
                        ]
                    },
                    {
                        flex: 1,
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            { xtype: 'container', flex: 1, margin: '0 10px 0 0', itemId: 'requiredLayersOn', layout: 'fit' },
                            { xtype: 'container', flex: 1, itemId: 'switchLayersOn', layout: 'fit' }
                        ]
                    }
                ]
            });
            me.requiredLayersOn = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: this.getContextpath() + "/action/componentConfigList",
                requestParams: {
                    appId: this.getApplicationId(),
                    layerlist:true
                },
                parentContainer: Ext.ComponentQuery.query('#requiredLayersOn')[0]
            });
            me.switchLayersOn = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: this.getContextpath() + "/action/componentConfigList",
                requestParams: {
                    appId: this.getApplicationId(),
                    layerlist:true
                },
                parentContainer: Ext.ComponentQuery.query('#switchLayersOn')[0],
                checked: (searchConfig && searchConfig.hasOwnProperty('switchOnLayers')) ? searchConfig.switchOnLayers : []
            });
        }
        // Set the checked layers for 'required layers' and 'switch on layers'
        var requiredLayersChecked = [], switchOnLayersChecked = [];
        if(searchConfig && searchConfig.hasOwnProperty('solrConfig') && searchConfig.solrConfig.hasOwnProperty(solrConfigId)) {
            if(searchConfig.solrConfig[solrConfigId].hasOwnProperty('requiredLayers')) {
                requiredLayersChecked = searchConfig.solrConfig[solrConfigId].requiredLayers;
            }
            if(searchConfig.solrConfig[solrConfigId].hasOwnProperty('switchOnLayers')) {
                switchOnLayersChecked = searchConfig.solrConfig[solrConfigId].switchOnLayers;
            }
        }
        Ext.ComponentQuery.query('#configureLayersButton')[0].setHandler(function() {
            var requiredOn = me.requiredLayersOn.getChecked();
            var switchOn = me.switchLayersOn.getChecked();
            if(requiredOn.length > 0 || switchOn.length > 0) {
                // If any layers are selected, enable checkbox
                checkbox.checked = true;
            }
            var config = me.getConfig(searchconfigId);
            config.solrConfig [solrConfigId] = {
                // Config id
                'solrConfigid': solrConfigId,
                // Layers that are required to be on
                'requiredLayers': requiredOn,
                // Layers that should be switched on
                'switchOnLayers': switchOn
            };
            me.layerSelectionWindow.hide();
        });
        me.requiredLayersOn.resetChecked(requiredLayersChecked);
        me.switchLayersOn.resetChecked(switchOnLayersChecked);
        // Show the window
        me.layerSelectionWindow.show();
    },
    
    saveASConfig: function(searchconfigId){
        var searchConfig = this.getConfig(searchconfigId);
        // Should not happen
        if(searchConfig === null) return;
        // Get old config or create new config object
        var Config = searchConfig.asConfig || {};
        // Check if the solrconfig FilterableCheckboxes object exists
        if(this.attribuutbronSearchconfigs.hasOwnProperty(searchconfigId)) {
            // Get the checked solr configs
            var checkedASConfigs = this.attribuutbronSearchconfigs[searchconfigId].getChecked();
            // Empty config before creating new config
            Config = {};
            // For each of the checked solr configs we will create a config object
            Ext.Array.each(checkedASConfigs, function(asConfigId) {
                // Replace previous config object
                Config[asConfigId] = {
                    // Config id
                    'solrConfigid': asConfigId
                };
            });
        }
        // Set Solr config to searchconfig object
        searchConfig.asConfig = Config;
    },
    saveCoordinateConfig: function (searchconfigId) {
        var searchConfig = this.getConfig(searchconfigId);
        var buffer = Ext.ComponentQuery.query('#buffer' + searchconfigId)[0].value;

        searchConfig.buffer = buffer;
    },
    savePDOKConfig:function(searchconfigId){
        var searchConfig = this.getConfig(searchconfigId);
        var filter = Ext.ComponentQuery.query('#filter'+searchconfigId)[0].value;
        
        searchConfig.filter = filter;
    },
    // Save Solr configuration
    saveSolrconfig: function(searchconfigId) {
        var searchConfig = this.getConfig(searchconfigId);
        // Should not happen
        if(searchConfig === null) {
            return;
        }
        // Get old config or create new config object
        var solrConfig = searchConfig.solrConfig || {};
        // Check if the solrconfig FilterableCheckboxes object exists
        if(this.solrSearchconfigs.hasOwnProperty(searchconfigId)) {
            // Get the checked solr configs
            var checkedSolrconfigs = this.solrSearchconfigs[searchconfigId].getChecked();
            // Empty config if there are no checked configs
            if (checkedSolrconfigs.length === 0) {
                solrConfig = {};
            }
            // For each of the checked solr configs we will create a config object
            Ext.Array.each(checkedSolrconfigs, function(solrConfigId) {
                var checkSolrConfig = searchConfig.solrConfig[solrConfigId];
                // Set required Layers
                var requiredLayers = [];
                if(checkSolrConfig && checkSolrConfig.requiredLayers) {
                    requiredLayers = checkSolrConfig.requiredLayers;
                }
                // Set layers that sould be switched on
                var switchOnLayers = [];
                if(checkSolrConfig && checkSolrConfig.switchOnLayers) {
                    switchOnLayers = checkSolrConfig.switchOnLayers;
                }
                // Replace previous config object
                solrConfig[solrConfigId] = {
                    // Config id
                    'solrConfigid': solrConfigId,
                    // Layers that are required to be on
                    'requiredLayers': requiredLayers,
                    // Layers that should be switched on
                    'switchOnLayers': switchOnLayers
                };
            });
        }
        // Set Solr config to searchconfig object
        searchConfig.solrConfig = solrConfig;
    },
    /**
     * Function to hide extra config options
     * @param searchconfigId hide config
     */
    hideExtraConfig: function(searchconfigId) {
        Ext.ComponentQuery.query('#solrConfig' + searchconfigId)[0].setVisible(false);
        Ext.ComponentQuery.query('#simpleListConfig' + searchconfigId)[0].setVisible(false);
        Ext.ComponentQuery.query('#pdokConfig' + searchconfigId)[0].setVisible(false);
        Ext.ComponentQuery.query('#asConfig' + searchconfigId)[0].setVisible(false);
        Ext.ComponentQuery.query('#coordinateConfig' + searchconfigId)[0].setVisible(false);
        this.panel.updateLayout();
    },
    /**
     * Helper function to get searchconfig for searchconfigId
     * @param searchconfigId
     */     
    getConfig: function(searchconfigId) {
        for(var x = 0; x < this.searchconfigs.length; x++) {
            if(this.searchconfigs[x].id === searchconfigId) {
                return this.searchconfigs[x];
            }
        }
        return null;
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 400,
                minHeight: 400
            }
        };
    }
});
