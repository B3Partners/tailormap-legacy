/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * LayerSelector
 * A generic component to retrieve the layers
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.LayerSelector",{
    extend: "viewer.components.Component",
    popupWin:null,
    layersInitialized: false,
    layerList : null,
    layerArray : null,
    layerselector : null,
    layerstore: null,
    div: null,
    // An array of layers whom visibility must be forced in the layerSelector
    forcedLayers : null,
    config: {
        viewerController: {},
        restriction : null,
        layers: null,
        useTabs: false,
        label: null,
        rememberSelection: false
    }, 
    constructor: function (conf){
        if(!conf.label){
            conf.label = i18next.t('viewer_components_layerselector_4');
        }
        this.initConfig(conf);
        viewer.components.LayerSelector.superclass.constructor.call(this, this.config);
        
        this.forcedLayers = [];
        this.layerstore = Ext.create('Ext.data.Store', {
            fields: ['layerId', 'title','layer'],
            data : []
        });

        if(this.config.useTabs) {
            this.createTabs();
        } else {
            this.createCombobox();
        }

        var requestPath= actionBeans["layerlist"];
        var requestParams = {};
        requestParams[this.config.restriction]= true;
        requestParams["appId"]= FlamingoAppLoader.get("appId");
        var me = this;
        if(this.config.layers != null && this.config.layers.length > 0){
            requestParams["layers"]= this.config.layers;
            requestParams["hasConfiguredLayers"]= true;    
        }
        
        Ext.Ajax.request({ 
            url: requestPath,
            timeout: 120000,
            params: requestParams, 
            success: function ( result, request ) {
                me.layersInitialized = true;
                me.layerList = Ext.JSON.decode(result.responseText);
                me.initLayers();
            },
            failure: function(a,b,c) {
                Ext.MessageBox.alert(i18next.t('viewer_components_layerselector_1'), i18next.t('viewer_components_layerselector_2'));
            }
        });
        this.config.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED, this.layerVisibilityChanged, this);
        return this;
    },

    createCombobox: function() {
        var comboboxConfig = {
            fieldLabel: this.config.label,
            emptyText: i18next.t('viewer_components_layerselector_0'),
            store: this.layerstore,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'layer',
            listeners :{
                change:{
                    fn: this.changed,
                    scope: this
                }
            }
        };
        if(this.config.div) {
            comboboxConfig.renderTo = this.config.div;
        }
        if(this.config.padding) {
            comboboxConfig.padding = this.config.padding;
        }
        this.layerselector = Ext.create('Ext.form.ComboBox', comboboxConfig);
    },

    createTabs: function() {
        var tabConfig = {
            bodyStyle: {
                width: 0,
                height: 0,
                display: 'none'
            },
            listeners :{
                tabchange: {
                    fn: this.tabChanged,
                    scope: this
                }
            }
        };
        if(this.config.div) {
            tabConfig.renderTo = this.config.div;
        }
        if(this.config.padding) {
            tabConfig.padding = this.config.padding;
        }
        this.layerselector = Ext.create('Ext.tab.Panel', tabConfig);
    },

    getLayerSelector: function() {
        return this.layerselector;
    },
    /**
     * @param forcedLayer the application layer that needs to be forced
     */
    addForcedLayer : function (forcedLayer){
        var dupe = false;
        for ( var i = 0 ; i < this.forcedLayers.length; i++){
            if(this.forcedLayers[i] == forcedLayer){
                dupe = true;
                break;
            }
        }
        if(!dupe){
            this.forcedLayers.push(forcedLayer);
        }
    },
    removeForcedLayer : function (forcedLayer){
        for( var i = this.forcedLayers.length -1 ; i >= 0 ; i--){
            if(this.forcedLayers[i]==forcedLayer){
                this.forcedLayers.splice(i,1);
            }
        }
    },
    initLayers : function (hasBeenInitialized) {
        if(!this.layersInitialized) {
            return;
        }
        var currentValue = this.getValue();
        var remember = this.config.rememberSelection && hasBeenInitialized && currentValue;
        this.layerArray = [];
        var visibleLayers = this.config.viewerController.getVisibleLayers();
        for(var i = 0 ; i < this.forcedLayers.length; i++){
            visibleLayers.push(this.forcedLayers[i].id);
        }
        var addedLayers = 0;
        var layers = [];
        if(this.layerList != null){
            for (var n = 0 ; n < this.layerList.length ;n++){
                var l = this.layerList[n];
                for ( var j = 0 ; j < visibleLayers.length ;j++){
                    //var appLayer = this.config.viewerController.getAppLayerById(visibleLayers[j]);                    
                    if (visibleLayers[j] === l.id || visibleLayers[j] === (""+l.id)){
                        layers.push(l);
                        break;
                    }
                }
            }
        }
        var layerschanged = this.checkLayersChanged(layers);
        if(!layerschanged) {
            return;
        }
        this.layerstore.removeAll();
        if(this.config.useTabs) {
            this.layerselector.removeAll();
        }
        for(var k = 0; k < layers.length; k++) {
            this.layerstore.add({
                layerId: layers[k].id,
                title: layers[k].alias || layers[k].layerName,
                layer: layers[k]
            });
            addedLayers++;
        }
        if(addedLayers === 0) {
            // this.layerselector.inputEl.dom.placeholder='Geen kaartlagen beschikbaar';
            this.layerselector.setDisabled(true);
        } else {
            // this.layerselector.inputEl.dom.placeholder='Maak uw keuze';
            this.layerselector.setDisabled(false);
            if(this.config.useTabs) {
                this.initTabs(remember);
            }
        }
        if(remember) {
            var updated = this.updateValueById(currentValue.id);
            if(!updated) {
                this.clearSelection();
                this.selectFirstLayer();
            }
        }
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_INITLAYERS,
            { store: this.layerstore, layers: this.layerList, hasBeenInitialized: hasBeenInitialized }, this);
    },

    checkLayersChanged: function(newLayers) {
        // Check if there is a new layer that is not in the store
        for(var i = 0; i < newLayers.length; i++) {
            if(this.findLayerInStore(newLayers[i].id) === null) {
                return true;
            }
        }
        // Check if there is a layer in the store that is not in the newlayers list anymore
        var layerRemoved = false;
        this.layerstore.each(function(val) {
            var inList = false;
            for(var i = 0; i < newLayers.length; i++) {
                if("" + newLayers[i].id === "" + val.get("layerId")) {
                    inList = true;
                }
            }
            if(!inList) {
                layerRemoved = true;
            }
        });
        return layerRemoved;
    },

    initTabs: function(skipSetActiveTab) {
        var tabs = [];
        this.layerstore.each(function(val) {
            tabs.push({
                title: val.get('title'),
                itemId: "tab-" + val.get('layerId')
            });
        });
        this.layerselector.add(tabs);
        if(!skipSetActiveTab) this.layerselector.setActiveTab(0);
    },

    getLayerIdFromTab: function(tab) {
        if(!tab) {
            return null;
        }
        return tab.getItemId().replace("tab-", "");
    },

    tabChanged: function(tabPanel, newTab, prevTab) {
        var layerId = this.getLayerIdFromTab(newTab);
        var prevLayerId = this.getLayerIdFromTab(prevTab);
        var applicationLayer = this.findLayerInStore(layerId);
        var previousLayer = this.findLayerInStore(prevLayerId);
        this.changed(tabPanel, applicationLayer, previousLayer);
    },

    changed :function (combobox,appLayer,previousSelected){
        // Retrieve appLayer from config.viewerController. Because the applayers in the comboBox are not the same as in the viewercontroller but copies. So by retrieving the ones
        // from the ViewerController you get the correct appLayer
        var al = null;
        appLayer = this._validateAppLayer(appLayer);
        if(appLayer){
            al = this.config.viewerController.getAppLayerById(appLayer.id);
        }
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,al,previousSelected,this);
        
    },
    /**
     * Retrieve the AppLayer that is selected.
     */
    getValue : function (){
        // Retrieve appLayer from viewerController. Because the applayers in the comboBox are not the same as in the viewercontroller but copies. So by retrieving the ones
        // from the ViewerController you get the correct appLayer
        var val = null;
        if(this.config.useTabs) {
            val = this.findLayerInStore(this.getLayerIdFromTab(this.layerselector.getActiveTab()));
        } else {
            val = this.layerselector.getValue();
        }
        val = this._validateAppLayer(val);
        if (val) {
            var al = this.config.viewerController.getAppLayerById(val.id);
            return al;
        }else{
            return null;
        }
    },
    /**
     * In Internet Explorer it is possible that this function is called with
     * string instead of appLayer object. In this case we try to find the layer by name in the store.
     *
     * @param {appLayer}| {String} appLayer the AppLayer to validate or possibly a string
     * @private
     *
     */
    _validateAppLayer: function (val) {
        if (typeof val === "string") {
            try {
                // Try to find the layer based on name.
                var layerIndex = this.layerstore.findBy(function (record) {
                    if (record.get('title') === val) {
                        return true;
                    }
                    return false;
                });
                if (layerIndex !== -1) {
                    val = this.layerstore.getAt(layerIndex).data.layer;
                } else {
                    val = null;
                }
            } catch (e) {
            }
        }
        return val;
    },
    setValue : function (appLayer) {
        if(this.config.useTabs) {
            this.layerselector.setActiveTab(this.layerselector.getComponent('tab-' + appLayer.get('layerId')));
            return;
        }
        this.layerselector.setValue(appLayer);
    },
    updateValueById: function(layerId) {
        if(this.config.useTabs) {
            var tab = this.layerselector.getComponent('tab-' + layerId);
            if(!tab) {
                return false;
            }
            this.layerselector.setActiveTab(tab);
            return true;
        }
        var record = this.layerstore.findRecord('layerId', layerId);
        if(!record) {
            return false;
        }
        this.layerselector.setValue(record);
        return true;
    },
    hasValue: function(appLayer) {
        return this.findLayerInStore(appLayer.id) !== null;
    },
    findLayerInStore: function(layerId) {
        var layer = null;
        this.layerstore.each(function(val) {
            if("" + val.get('layerId') === "" + layerId) { // compare values as string, layerId in store can be int, layerId is string in most cases
                layer = val.get('layer');
            }
        });
        return layer;
    },
    /**
     * Gets the store for the LayerSelector
     * @returns Ext.data.Store
     */
    getStore: function() {
        return this.layerstore;
    },
    /**
     * Get the number of visible layers in the LayerSelector
     * @returns int
     */
    getVisibleLayerCount: function() {
        return this.layerstore.getCount();
    },
    selectFirstLayer: function() {
        var visibleLayers = this.getVisibleLayerCount();
        if(visibleLayers === 0) {
            return;
        }
        this.setValue(this.layerstore.getAt(0));
    },
    clearSelection: function() {
        if(this.config.useTabs) {
            // Its not possible to clear the value for tabs, once a tab is selected, there is always a tab selected
            return;
        }
        this.layerselector.clearValue();
    },
    /**
     * @deprecated use getValue()
     */
    getSelectedAppLayer : function (){
        return this.getValue();
    },
    getExtComponents: function() {
        return [ this.layerselector.getId() ];
    },
    layerVisibilityChanged : function (map,object){
        this.initLayers(true);
    }
});
