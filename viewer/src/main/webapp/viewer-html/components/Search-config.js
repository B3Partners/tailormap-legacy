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
 * Custom configuration object for AttributeList configuration
 * @author <a href="mailto:geertplaisier@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    panel: null,
    panelHeight: 120,
    searchconfigs: [],
    nextId: 1,
    solrSearchconfigs: {},
    layerSelectionWindow: null,
    requiredLayersOn: null,
    switchLayersOn: null,
    constructor: function (parentId,configObject){
        if (configObject === null){
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId,configObject);
        this.form.add({
            xtype: 'checkbox',
            boxLabel: 'Toon knop voor het verwijderen van marker',
            name: 'showRemovePin',
            value: true,
            inputValue: true,
            checked: this.configObject.showRemovePin !== undefined ? this.configObject.showRemovePin : true,
            style: {
                marginRight: "90px"
            }
        });
        this.initSearchconfigs(configObject);
    },
    initSearchconfigs: function(config) {
        var me = this;
        me.panel = Ext.create('Ext.panel.Panel', {
		    width: me.formWidth,
            margin: '15 0 0 0',
		    height: 350,
		    layout: 'auto',
            autoScroll: true,
		    items: [],
		    renderTo: 'config',
            tbar: [
                "->",
                {
                    xtype:'button',
                    iconCls: 'addbutton-icon',
                    text: 'Zoekingang toevoegen',
                    listeners: {
                        click: function() {
                            me.appendSearchField();
                        }
                    }
                }
            ]
		});
        
        var extraText = document.createElement('div')
        extraText.innerHTML="* De ingevulde zoekwaarden wordt achter deze url geplaatst. \n\
            Als de ingevulde zoekwaarde ergens anders moet komen in de url dan kan op die plek '[ZOEKWOORD]' worden opgegeven.\n\
            Voorbeeld(OpenLS): 'http://geodata.nationaalgeoregister.nl/geocoder/Geocoder?zoekterm='";
        Ext.get("config").appendChild(new Ext.Element(extraText));
        
        if(config != null) {
            if(config.nextSearchConfigId != null) {
                me.nextId = config.nextSearchConfigId;
            }
            if(config.searchconfigs != null) {
                Ext.Array.each(config.searchconfigs, function(searchconfig) {
                    me.appendSearchField(searchconfig);
                });
            }
        }
    },
    appendSearchField: function(config) {
        var me = this;
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
        me.nextId++;
    },
    newSearchField: function(config, collapsed) {
        var me = this;
        return {
            xtype: 'panel',
            id: config.id,
            layout: 'anchor',
            anchor: '100%',
            width: '100%',
            title: config.name,
            animCollapse: false,
            collapsible: true,
            collapsed: collapsed,
            iconCls: "edit-icon-bw",
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
                        { fieldLabel: 'Naam', name: 'name', value: config.name, id: 'name'+config.id },
                        { fieldLabel: 'Id', name: 'idField', value: config.id,disabled:true, disabledCls:'disabledTextField', tooltip:'sdfasdfasdf'},
                        { fieldLabel: 'URL *', name: 'url', value: config.url, id: 'url'+config.id, width: 720 },
                        {                           
                            xtype: 'radiogroup',
                            id: 'type' + config.id,
                            fieldLabel: 'Type',
                            vertical: true,
                            name: "type" + config.id,
                            items: [{
                                boxLabel: 'OpenLS', 
                                name: 'type' + config.id, 
                                inputValue: 'openls',
                                checked: config.type=="openls" || config.type==undefined
                            },{
                                boxLabel: 'ArcGISRest', 
                                name: 'type' + config.id, 
                                inputValue: 'arcgisrest',
                                checked: config.type=="arcgisrest"
                            },{
                                boxLabel: 'Solr', 
                                name: 'type' + config.id, 
                                inputValue: 'solr',
                                checked: config.type=="solr"
                            }],
                            listeners: {
                                change: function(radio) {
                                    if(radio.getValue()[radio.getName()] === 'solr') {
                                        // Show additional Solr configuration
                                        me.addSolrconfig(config.id);
                                    } else {
                                        me.hideSolrconfig(config.id);
                                    }
                                }
                            }
                        },
                        { xtype: 'container', id: 'solrConfig' + config.id, hidden: true, height: 130, html: 'Selecteer Solr zoekconfiguraties' },
                        {
                            xtype:'button',
                            iconCls: 'savebutton-icon',
                            text: 'Zoekingang opslaan',
                            listeners: {
                                click: function(button) {
                                    me.saveConfig();
                                }
                            }
                        }
                    ]
                }
            ],
            tbar: ["->", {
                xtype:'button',
                iconCls: 'removebutton-icon',
                text: 'Zoekingang verwijderen',
                listeners: {
                    click: function() {
                        me.removeConfig(config.id);
                    }
                }
            }],
            listeners: {
                beforeexpand: function(){
                    Ext.Array.each(me.panel.items.items, function(item) {
                        item.collapse();
                    });
                },
                expand: function() {
                    if(Ext.getCmp('type' + config.id).getValue()['type' + config.id] === 'solr') {
                        me.addSolrconfig(config.id);
                    }
                }
            }
        };
    },
    saveConfig: function() {
        var me = this;
        var newSearchconfigs = [];
        Ext.Array.each(me.searchconfigs, function(searchconfig) {
            var configid = searchconfig.id,
                name = Ext.getCmp('name' + configid).getValue(),
                type = Ext.getCmp('type' + configid).getValue()['type' + configid],
                url = Ext.getCmp('url' + configid).getValue();
            Ext.getCmp(configid).setTitle(name);
            searchconfig.name = name;
            searchconfig.url = url;
            searchconfig.type= type;
            if(type === 'solr') {
                me.saveSolrconfig(configid);
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
            if(searchconfig.id != configid) {
                newSearchconfigs.push(searchconfig);
            }
        });
        me.searchconfigs = newSearchconfigs;
    },
    getConfiguration: function(){
        var me = this;
        var config = viewer.components.CustomConfiguration.superclass.getConfiguration.call(this);
        me.saveConfig();
        config['searchconfigs'] = me.searchconfigs;
        config['nextSearchConfigId'] = me.nextId;
        return config;
    },
    /**
     * Show Solr configuration options for searchConfig
     */
    addSolrconfig: function(searchconfigId) {
        var solrConfigId = 'solrConfig' + searchconfigId, me = this;
        if(!this.solrSearchconfigs.hasOwnProperty(searchconfigId)) {
            var searchConfig = me.getConfig(searchconfigId);
            var checked = [];
            if(searchConfig && searchConfig.hasOwnProperty('solrConfig')) {
                Ext.Object.each(searchConfig.solrConfig, function(key, value) {
                    checked.push(value.solrConfigid);
                });
            }
            // Show the filterableCheckboxes component with all Solr configs
            this.solrSearchconfigs[searchconfigId] = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: contextPath+"/action/configuresolr?getSearchconfigData=true",
                renderTo: solrConfigId,
                titleField: 'name',
                checked: checked,
                // Provide custom renderLabel function to add 'config layers' link to label
                renderLabel: function(id, label) {
                    return label + ' &nbsp;&nbsp;<a href="#" class="configureLayer" id="' + id + '_layers">Configureer kaartlagen</a>';
                },
                // Provide function to handle clicking the 'config layers' link
                labelClick: function(evt, target) {
                    // If the target clicked is not the link, do nothing
                    if(target.className !== 'configureLayer') return;
                    // Link is clicked, show window with layers
                    me.showLayerconfig(target, searchconfigId, searchConfig);
                }
            });
        }
        Ext.getCmp(solrConfigId).setVisible(true);
        this.panel.doLayout();
    },
    /**
     * Shows the window with layers which must be on / will be switched on when
     * using the solr search
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
                title: 'Configureer kaartlagen',
                bodyStyle: 'background-color: White;',
                bbar: [
                    { xtype: 'tbfill' },
                    { xtype: 'button', text: 'Opslaan', id: 'configureLayersButton' }
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
                            { xtype: 'container', flex: 1, margin: '0 10px 0 0', html: '<b>Lagen die verplicht aan moeten staan</b>' },
                            { xtype: 'container', flex: 1, html: '<b>Lagen die automatisch aangezet worden</b>' }
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
                            { xtype: 'container', flex: 1, margin: '0 10px 0 0', id: 'requiredLayersOn' },
                            { xtype: 'container', flex: 1, id: 'switchLayersOn' }
                        ]
                    }
                ]
            });
            me.requiredLayersOn = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: contextPath+"/action/componentConfigLayerList",
                requestParams: {
                    appId:applicationId
                },
                renderTo: 'requiredLayersOn'
            });
            me.switchLayersOn = Ext.create('Ext.ux.b3p.FilterableCheckboxes', {
                requestUrl: contextPath+"/action/componentConfigLayerList",
                requestParams: {
                    appId:applicationId
                },
                renderTo: 'switchLayersOn',
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
        Ext.getCmp('configureLayersButton').setHandler(function() {
            var requiredOn = me.requiredLayersOn.getChecked();
            var switchOn = me.switchLayersOn.getChecked();
            if(requiredOn.length > 0 || switchOn.length > 0) {
                // If any layers are selected, enable checkbox
                checkbox.checked = true;
            }
            me.saveSolrconfig(searchconfigId, requiredOn, switchOn);
            me.layerSelectionWindow.hide();
        });
        me.requiredLayersOn.resetChecked(requiredLayersChecked);
        me.switchLayersOn.resetChecked(switchOnLayersChecked);
        // Show the window
        me.layerSelectionWindow.show();
    },
    // Save Solr configuration
    saveSolrconfig: function(searchconfigId, requiredOn, switchOn) {
        var searchConfig = this.getConfig(searchconfigId);
        // Should not happen
        if(searchConfig === null) return;
        // Get old config or create new config object
        var solrConfig = searchConfig.solrConfig || {};
        // Check if the solrconfig FilterableCheckboxes object exists
        if(this.solrSearchconfigs.hasOwnProperty(searchconfigId)) {
            // Get the checked solr configs
            var checkedSolrconfigs = this.solrSearchconfigs[searchconfigId].getChecked();
            // For each of the checked solr configs we will create a config object
            Ext.Array.each(checkedSolrconfigs, function(solrConfigId) {
                // Set required Layers
                var requiredLayers = [];
                if(typeof requiredOn !== "undefined") {
                    requiredLayers = requiredOn;
                } else if(solrConfig.hasOwnProperty(solrConfigId) && solrConfig[solrConfigId].requiredLayers) {
                    requiredLayers = solrConfig[solrConfigId].requiredLayers;
                }
                // Set layers that sould be switched on
                var switchOnLayers = [];
                if(typeof switchOn !== "undefined") {
                    switchOnLayers = switchOn;
                } else if(solrConfig.hasOwnProperty(solrConfigId) && solrConfig[solrConfigId].switchOnLayers) {
                    switchOnLayers = solrConfig[solrConfigId].switchOnLayers;
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
     * Function to hide Solr config options
     */
    hideSolrconfig: function(searchconfigId) {
        Ext.getCmp('solrConfig' + searchconfigId).setVisible(false);
        this.panel.doLayout();
    },
    /**
     * Helper function to get searchconfig for searchconfigId
     */     
    getConfig: function(searchconfigId) {
        for(var x in this.searchconfigs) {
            if(this.searchconfigs[x].id === searchconfigId) {
                return this.searchconfigs[x];
            }
        }
        return null;
    }
});

