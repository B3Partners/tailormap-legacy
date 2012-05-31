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
    filterActive:null,
    uniqueValuesAttributes : null,
    // 0 when the datatab is fully initialized, otherwise false
    itemsLoaded : null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        tooltip:null,
        details:{
            width: null,
            height:null
        }
    },
    constructor: function (conf){
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
            tooltip: me.tooltip
        });
        this.loadWindow();
        return this;
    },
    showWindow : function (){
        this.layerSelector.initLayers();
        this.popup.show();
    },
    /** ???
     * @param layer the application Layer
     */
    showAndForceLayer : function (layer){
        this.layerSelector.addForcedLayer(layer);
        this.showWindow();
    },
    removeForcedLayer : function (layer){
        this.layerSelector.removeForcedLayer(layer);
        this.layerSelector.initLayers();
    },
    loadWindow : function(){
        this.itemsLoaded = 0;
        var config = {
            viewerController : this.viewerController,
            div: this.getContentDiv(),
            layers : this.layers
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);
   
        // Make the tabs
        this.tabpanel = Ext.create('Ext.tab.Panel', {
            height: parseInt(this.details.height) - 100,
            width: parseInt(this.details.width)-40,
            hideMode: 'offsets',
            autoScroll:true,
            layout: {
                type: 'fit'
            },            
            tabBar:{
                style: 'background:#fff;'
            },
            items: [
            {
                id   : 'filterTab',
                title: 'Filter',// TODO Do renaming of variables dataselection-->filter
                hideMode: 'offsets',
                autoScroll:true,
                html: "<div id='filterTabDiv' style='width:100%; height=100%;overflow:auto;'></div>"
            },
            {
                id : "dataTab",
                title: 'Dataselectie',// TODO Do renaming of variables filter->dataselection
                hideMode: 'offsets',
                autoScroll:true,
                html: "<div id='dataTabDiv' style='width:100%; height=100%;overflow:auto;'></div>"
            }
            ],
            activeTab : "dataTab",
            renderTo : this.getContentDiv()
        });
        
        // Make panels in tabs and save them
        this.dataTab = Ext.create('Ext.panel.Panel', {
            autoScroll: true,
            renderTo: 'dataTabDiv'
        });
        
        this.filterTab = Ext.create('Ext.panel.Panel', {
            autoScroll: true,
            renderTo: 'filterTabDiv'
        });
        this.createFilterTab();
        // Make lower buttons
        this.button1 = Ext.create('Ext.Button', { 
            text : 'Toepassen',
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    fn: this.applyFilter
                }
            }
        });
         
        this.button2 = Ext.create('Ext.Button', { 
            text : 'Annuleren',
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    fn: this.cancel
                }
            }
        });
        
        this.button3 = Ext.create('Ext.Button', { 
            text : 'Reset',
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    fn: this.removeFilter
                }
            }
        });
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
                    xtype: "combobox",
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
                    width: 400,
                    emptyText:'Maak uw keuze',
                    store: {
                        fields: [{name:'id',convert:function(v,row){if(row.raw){return row.raw;}else{return "";}}}],
                        data : []
                    }
                });
                
                this.uniqueValuesAttributes.push(attribute.name);
            }
        }
        this.dataTab.removeAll();
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
    
    createFilterTab : function (){
        this.filterTab.removeAll();
        this.filters = new Array();
        // Add the button to the filtertab
        var addFilter = Ext.create('Ext.Button', { 
            text : 'Voeg filter toe',
            listeners: {
                click:{
                    scope: this,
                    fn: this.addFilter
                }
            }
        });        
        this.filterTab.add(addFilter);
        this.filterActive = Ext.create ("Ext.form.field.Checkbox",{
            boxLabel  : 'Filter is actief',
            name      : 'filterActive',
            inputValue: true,
            checked   : false
                
        });
        this.filterTab.add(this.filterActive);
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
            this.dataTab.getEl().mask("Laad unieke waardes...");
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
        this.dataTab.getEl().unmask();
        this.itemsLoaded--;        
    },
    addValuesToCombobox : function (values, attribute){
        var combobox = Ext.getCmp (attribute);
        if(combobox){   // In case there are more than one layer with dataselection fields. This method can be called with an attribute of layer 1, when layer 2 is initialized
            combobox.setDisabled(false);
            combobox.getEl().unmask();
            var SingleArray = Ext.define('SingleArray', {
                extend: 'Ext.data.Model',
                fields: [{name: 'id'  , convert:function(v,row){if(row.raw){return row.raw;}else{return "";}}}]
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
        var logicOperator = null;
        if(this.filters.length != 0){
            var logicStore = Ext.create('Ext.data.Store', {
                fields: ['id','title'],
                data : [{
                    id:"OR",
                    title:"of"
                }, {
                    id:"AND",
                    title:"en"
                }]
            });

            logicOperator = Ext.create('Ext.form.ComboBox', {
                fieldLabel: '',
                store: logicStore,
                queryMode: 'local',
                displayField: 'title',
                width:50,
                value:'OR',
                valueField: 'id'
            });
            // Insert before the checkbox
            this.filterTab.insert(this.filterTab.items.length - 1,logicOperator);
            
        }
        var config = {
            width: parseInt(this.details.width),
            height: parseInt(this.details.height),
            attributes:this.attributes,
            logicOperator:logicOperator
        };
        var filter = Ext.create("viewer.components.Filter",config);
        this.filters.push(filter);
        // Insert before the checkbox
        this.filterTab.insert(this.filterTab.items.length - 1,filter.getUI());
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
                        me.applyFilterWithDefaults();}, 100);
        }
    },
    applyFilter : function (){
        var cql = "";
     
        cql += this.getDataTabCQL();
        if(this.filterActive.getValue()){
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
        var attributes = appLayer.attributes;
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
    getExtComponents: function() {
        return Ext.Array.merge(
            this.layerSelector.getExtComponents(),
            [
            this.tabpanel.getId(),
            this.dataTab.getId(),
            this.filterTab.getId(),
            this.button1.getId(),
            this.button2.getId()
            ]
            );
    },
    resetForm :function(){
        this.dataTab.removeAll();
        this.createFilterTab();
    }
});
