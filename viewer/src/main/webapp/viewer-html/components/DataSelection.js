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
 * DataSelection and Filter component
 * Creates a dialog where filter and selection settings can be set.
 * A dataselectionfilter contains 1..n filters, a filter contains 1..n attributefilters.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.DataSelection",{
    extend: "viewer.components.Component",
    dataTab : null,
    filterTab : null,
    attributes:null,
    layerSelector:null,
    appLayer: null,
    filters:null,
    uniqueValuesAttributes : null,
    // Indicating wheter all the layers with selectable attributes can be used in this component. Happens when no layers are selected in in config. When 1 layer is configured,
    // and another with selectable attributes is not, it can not be used in this component (and it will generate a error message).
    allLayers: null,
    // 0 when the datatab is fully initialized, otherwise false
    itemsLoaded : null,
    config: {
        layers:null,
        title:null,
        maxFeatures:null,
        iconUrl:null,
        tooltip:null,
        label: "",
        details:{
            width: null,
            height:null
        }
    },
    constructor: function (conf){
        // minimal width = 600
        var minwidth = 600;
        if(conf.details.width < minwidth || !Ext.isDefined(conf.details.width)) conf.details.width = minwidth;
        if(!Ext.isDefined(conf.maxFeatures)){
            conf.maxFeatures=250;
        }

        this.attributes =[];
        viewer.components.DataSelection.superclass.constructor.call(this, conf);
        this.filters = new Array();
        this.initConfig(conf);
        var me = this;
        this.renderButton({
            handler: function(){
                me.showWindow();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        });
        if(!this.layers || this.layers.length == 0){
            this.allLayers = true;
            this.layers = [];
        }else{
            this.allLayers = false;
        }
        this.loadWindow();
        return this;
    },
    showWindow : function (){
        this.layerSelector.initLayers();
        this.popup.show();
    },
    /** Add layer to layerSelector, even if it is not visible in the map.
     * @param layer the application Layer
     */
    showAndForceLayer : function (layer){
        if(this.allLayers){
            this.layerSelector.layerList.push(layer);
        }
        this.layerSelector.addForcedLayer(layer);
        this.showWindow();
    },
    removeForcedLayer : function (layer){
        this.layerSelector.removeForcedLayer(layer);
        this.layerSelector.initLayers();
    },
    loadWindow : function(){
        this.itemsLoaded = 0;
        var layerSelectorId = Ext.id();
        this.mainContent = Ext.create('Ext.container.Container', {
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
            {
                xtype: 'container',
                height: 30,
                html: '<div id="' + layerSelectorId + '" style="width: 100%; height: 100%;"></div>'
            },
            {
                xtype: 'tabpanel',
                id: this.name + 'TabPanel',
                flex: 1,
                width: '100%',
                hideMode: 'offsets',
                autoScroll: true,
                layout: {
                    type: 'fit'
                },
                tabBar:{
                    style: 'background: #fff;'
                },
                defaults: {
                    style: {
                        padding: '5px'
                    },
                    border: false,
                    autoScroll: true
                },
                items: [{
                    xtype: 'panel',
                    id: this.name + 'FilterTab',
                    title: 'Filter',
                    hideMode: 'offsets'
                },{
                    xtype: 'panel',
                    id: this.name + "DataTab",
                    title: 'Dataselectie',
                    hideMode: 'offsets'
                }],
                activeTab : this.name + "DataTab"
            },
            {
                xtype: 'container',
                height: 30,
                defaultType: 'button',
                style: {
                    paddingTop: '5px'
                },
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [{
                    text: 'Toepassen',
                    listeners: {
                        click:{
                            scope: this,
                            fn: this.applyFilter
                        }
                    }
                },{
                    text: 'Annuleren',
                    listeners: {
                        click:{
                            scope: this,
                            fn: this.cancel
                        }
                    }
                },{
                    text: 'Reset',
                    listeners: {
                        click:{
                            scope: this,
                            fn: this.removeFilter
                        }
                    }
                }]
            }
            ],
            renderTo: this.getContentDiv()
        });
        this.layerSelector = Ext.create("viewer.components.LayerSelector", {
            viewerController : this.viewerController,
            div: layerSelectorId,
            layers : this.layers,
            restriction: "filterable"
        });
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);
        this.tabPanel = Ext.getCmp(this.name + 'TabPanel');
        this.dataTab = Ext.getCmp(this.name + 'DataTab');
        this.filterTab = Ext.getCmp(this.name + 'FilterTab')
        this.createFilterTab();
    },
    createDataTab : function (appLayer){
        var attributes = appLayer.attributes;
        var dataSelectieAttributes = new Array();
        this.uniqueValuesAttributes = new Array();
        var minMaxAttrs = new Array();

        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            if(attribute.selectable){
                var defaultVal = "";
                if(attribute.defaultValue != undefined){
                    defaultVal = attribute.defaultValue;
                    if(defaultVal == "#MAX#" || defaultVal == "#MIN#"){
                        minMaxAttrs.push({
                            attribute : attribute,
                            operator: defaultVal
                        });
                        defaultVal = "";
                    }
                }
                dataSelectieAttributes.push({
                    xtype: "flamingocombobox",
                    id: attribute.name,
                    queryMode : 'local',
                    disabled: true,
                    dataType: attribute.type,
                    editable: false,
                    name: attribute.name,
                    fieldLabel: attribute.alias || attribute.name,
                    labelWidth:150,
                    displayField: 'id',
                    valueField: 'id',
                    value : defaultVal,
                    width: 500,
                    style: {
                        marginTop: '5px'
                    },
                    emptyText:'Maak uw keuze',
                    store: {
                        fields: [{
                            name:'id',
                            convert:function(v,row){
                                if(row.raw){
                                    return row.raw;
                                }else{
                                    return "";
                                }
                            }
                        }],
                        data : []
                    }
                });

                this.uniqueValuesAttributes.push(attribute.name);
            }
        }
        this.dataTab.removeAll();
        if (dataSelectieAttributes.length==0){
            this.dataTab.hide();
            this.dataTab.tab.hide();
            this.tabPanel.setActiveTab(this.filterTab);
        }else{
            this.dataTab.show();
            this.dataTab.tab.show();
        }
        var defaultText = 'Kaart wordt pas zichtbaar na het toepassen van een dataselectie';
        if(this.uniqueValuesAttributes.length == 0){
            defaultText = '';
        }
        this.dataTab.add({
            xtype : 'label',
            text: defaultText
        });
        this.getUniques();
        this.dataTab.add(dataSelectieAttributes);
        this.initMinMaxValues(minMaxAttrs,appLayer);
    },
    createFilterTab : function () {
        // Remove all filters (used when clicking reset)
        this.filterTab.removeAll();
        // Reset filters to empty array
        this.filters = [];

        this.filterTab.add({
            xtype: 'container',
            width: '95%',
            height: 25,
            layout: {
                type: 'hbox',
                pack: 'end'
            },
            items: [{
                // Add the checkbox to active filter
                xtype: 'checkbox',
                id: this.name + 'FilterActive',
                boxLabel  : 'Filter is actief',
                name      : 'filterActive',
                inputValue: true,
                checked   : false,
                width: 200
            }]
        })
        // Add the first filter
        this.addFilter();
    },
    initMinMaxValues : function (minMaxAttrs,appLayer){
        for(var i = 0 ; i < minMaxAttrs.length ; i++){
            var attr = minMaxAttrs[i];
            this.itemsLoaded++;
            this.getMinMax(attr.operator, attr.attribute, appLayer);
        }
    },
    getMinMax : function (operator, attribute,appLayer){
        var cb = Ext.getCmp(attribute.name);
        cb.setDisabled(true);
        Ext.Ajax.request({
            url: actionBeans.unique,
            timeout: 240000,
            scope:this,
            params: {
                attribute: attribute.name,
                applicationLayer: appLayer.id,
                getMinMaxValue: 't',
                operator: operator
            },
            success: function ( result, request ) {
                var res = Ext.JSON.decode(result.responseText);
                if(res.success){
                    var value = res.value;
                    cb.setValue(value);
                }else{
                    Ext.MessageBox.alert('Foutmelding', "Kan geen minmax waardes ophalen: " + res.msg);
                }

                this.itemsLoaded--;
                cb.setDisabled(false);
            },
            failure: function ( result, request) {
                Ext.MessageBox.alert('Foutmelding', "Kan geen minmax waardes ophalen: " + result.responseText);
                cb.setDisabled(false);
                this.itemsLoaded--;
            }
        });
    },
    getUniques : function (){
        var appLayer = this.layerSelector.getValue();
        if(this.uniqueValuesAttributes.length > 0){
            this.itemsLoaded++;
            this.dataTab.setLoading("Laad unieke waardes...");
            Ext.Ajax.request({
                url: actionBeans.unique,
                timeout: 240000,
                scope:this,
                params: {
                    attributes: this.uniqueValuesAttributes,
                    applicationLayer: appLayer.id
                },
                success: function ( result, request ) {
                    var res = Ext.JSON.decode(result.responseText);
                    if(res.success){
                        var values = res.uniqueValues;
                        if(res.msg){
                            Ext.MessageBox.alert('Info', res.msg);
                        }
                        this.receiveUniqueValues(values);
                    }else{
                        Ext.MessageBox.alert('Foutmelding', "Kan geen unieke waardes ophalen: " + res.msg);
                    }
                },
                failure: function ( result, request) {
                    Ext.MessageBox.alert('Foutmelding', "Kan geen unieke waardes ophalen: " + result.responseText);
                    this.itemsLoaded--;
                }
            });
        }
    },
    receiveUniqueValues : function (values){
        for(var attribute in values){
            var unique = values[attribute];
            this.addValuesToCombobox(unique, attribute);
        }
        this.dataTab.setLoading(false);
        this.itemsLoaded--;
    },
    addValuesToCombobox : function (values, attribute){
        var combobox = Ext.getCmp (attribute);
        if(combobox){   // In case there are more than one layer with dataselection fields. This method can be called with an attribute of layer 1, when layer 2 is initialized
            combobox.setDisabled(false);
            var SingleArray = Ext.define('SingleArray', {
                extend: 'Ext.data.Model',
                fields: [{
                    name: 'id'  ,
                    convert:function(v,row){
                        if(row.raw){
                            return row.raw;
                        }else{
                            return "";
                        }
                    }
                }]
            });
            var myReader = new Ext.data.reader.Array({
                model: 'SingleArray'
            }, SingleArray);
            var rs =  myReader.read(values);
            combobox.getStore().add(rs.records);
        }
    },

    /**
     *  Add a filter to the current filterlist.
     */
    addFilter : function (){
        var leftContainer = Ext.create('Ext.container.Container', {
            xtype: 'container',
            columnWidth: .2
        });
        var rightContainer = Ext.create('Ext.container.Container', {
            xtype: 'container',
            columnWidth: .8
        });
        var filterContainer = Ext.create('Ext.container.Container', {
            width: '95%',
            layout:'column',
            items: [ leftContainer, rightContainer ],
            style: {
                overflow: 'visible'
            }
        });
        var logicOperator = null;
        if(this.filters.length != 0) {
            logicOperator = Ext.create('viewer.components.FlamingoCombobox', {
                store: [ ['OR', 'of'], ['AND', 'en'] ],
                width: 50,
                value: 'OR'
            });
            leftContainer.add(logicOperator);
        } else {
            leftContainer.add({
                // Add the add-button to the filtertab
                xtype: 'button',
                text : 'Voeg filter toe',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.addFilter
                    }
                }
            });
        }
        var filter = Ext.create("viewer.components.Filter", {
            attributes: this.attributes,
            logicOperator: logicOperator,
            parentMainContainer: this.filterTab,
            maxFeatures:this.maxFeatures,
            parentComponent: this
        });
        this.filters.push(filter);
        rightContainer.add(filter.getUI());
        this.filterTab.add(filterContainer);
    },
    selectAppLayer : function (appLayer){
        if(appLayer){
            this.layerSelector.setValue(appLayer);
        }
    },
    isDatatabLoaded : function(){
        if(this.itemsLoaded == 0){
            return true;
        }else{
            return false;
        }
    },
    applyFilterWithDefaults : function (){
        if(this.isDatatabLoaded()){
            this.applyFilter();
        }else{
            var me = this;
            setTimeout(function(){
                me.applyFilterWithDefaults();
            }, 100);
        }
    },
    applyFilter : function (){
        var cql = "";

        cql += this.getDataTabCQL();
        var filterActive = Ext.getCmp(this.name + 'FilterActive');
        if(filterActive && filterActive.getValue()){
            if(cql != ""){
                cql += " AND ";
            }
            for ( var i = 0 ; i < this.filters.length;i++){
                var filter = this.filters[i];
                cql += filter.getCQL();
            }

        }
        if(cql != ""){
            cql = "(" + cql + ")";
        }
        var layer = this.layerSelector.getValue();
        if(layer){
            var filterWrapper =  Ext.create("viewer.components.CQLFilterWrapper",{
                id: this.name + this.layerSelector.getValue().layerName,
                cql: cql,
                operator : "AND",
                type: "ATTRIBUTE"
            });

            this.viewerController.setFilter(filterWrapper,layer);
        }

    //console.log("CQL: " + layer.filter.getCQL());
    },
    getDataTabCQL : function (){
        var items = this.dataTab.items.items;
        var cql = "";
        for ( var i = 1 ; i < items.length;i++){ // Skip the default text for dataselection.
            var item = items[i];
            if(item.getValue() != ""){
                if(i > 1 ){
                    cql += " AND ";
                }
                cql += "\"" +item.id + "\"=";
                var attributeType = item.dataType;
                if(attributeType && attributeType.toLowerCase() == "string"){
                    cql += "\'";
                }
                cql += item.getValue();
                if(attributeType && attributeType.toLowerCase() == "string"){
                    cql += "\'";
                }
            }
        }
        return cql;
    },
    cancel : function (){
        this.popup.hide();
    },
    removeFilter : function (){
        var appLayer = this.layerSelector.getValue();
        if(appLayer){
            var filterId = this.name + appLayer.layerName;
            this.viewerController.removeFilter(filterId,appLayer);
        }
        this.layerSelector.setValue();
        this.resetForm();
    },
    /**
     *  Reset all comboboxes when a different layer is selected
     */
    layerChanged : function (item,prev){
        this.appLayer = item;

        if(this.appLayer != null){
            this.featureService = this.viewerController.getAppLayerFeatureService(this.appLayer);
            var me = this;
            // check if featuretype was loaded
            if(this.appLayer.attributes == undefined) {
                this.featureService.loadAttributes(me.appLayer, function(attributes) {
                    me.changeAttributes(me.appLayer);
                });
            } else {
                this.changeAttributes(me.appLayer);
            }
        }

        if(prev != undefined){
            if(this.appLayer){
                var prevLayer = this.viewerController.getLayer(this.appLayer);
                prevLayer.setQuery(null);
            }
        }
    },
    // Change the comboboxes of the attributefilters. Happens when a new layer is chosen.
    changeAttributes : function (appLayer){
        var attributes = this.viewerController.getAttributesFromAppLayer(appLayer,null,true);
        var attributeList = new Array();
        for(var i= 0 ; i < attributes.length ;i++){
            var attribute = attributes[i];
            if(attribute.filterable){
                attributeList.push({
                    id: attribute.id,
                    title: attribute.alias || attribute.name,
                    value: attribute.name,
                    type: attribute.type
                });
            }
        }
        this.attributes = attributeList;
        for (var j = 0 ; j < this.filters.length ;j++){
            var filter = this.filters[j];
            filter.setNewAttributeList(attributeList);
        }
        this.createDataTab(appLayer);
    },
    hasAppLayerConfigured : function (appLayer){
        return Ext.Array.contains(this.layers, appLayer.id);
    },
    getExtComponents: function() {
        return [
        this.mainContent.getId()
        ]
    },
    resetForm :function(){
        this.dataTab.removeAll();
        this.createFilterTab();
    }
});
