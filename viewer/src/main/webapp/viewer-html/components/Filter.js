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

/* global Ext, actionBeans */

/**
 * Part of DataSelection and Filter component
 * Creates a dialog where filter and selection settings can be set.
 * A dataselectionfilter contains 1..n filters, a filter contains 1..n attributefilters.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
/**
 * A filter has 1..n attribute filters, which can be added/removed via the gui.
 */
Ext.define ("viewer.components.Filter",{
    extend: "viewer.components.Component",
    attributeCombobox: null,
    attributeStore:null,
    attributeFilters : null,    
    id: null,
    container : null,
	leftWidth: 150,
    uniqueList: null,
    config: {
        attributes:null,
        maxFeatures:null,
        logicOperator:null,
	parentMainContainer:null,
        showList:true,
        parentComponent: null
        
    },
    constructor: function(config){
        this.initConfig(config);
        this.id = Ext.id();
        this.attributeFilters = [];
        this.attributeStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'title', 'value'],
            data : this.config.attributes
        });
        this.attributeCombobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: '',
            store: this.attributeStore,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'value',
			width: this.leftWidth,
            listeners: {
                change:{
                    scope: this,
                    fn: this.attributeComboboxChanged
                }
            }
        });
		var attribuutFilter = Ext.create("viewer.components.AttributeFilter",{
            first: true,
            id: this.id,
            number: 1
        });
        this.attributeFilters.push(attribuutFilter);
        var attributeFilterUI = attribuutFilter.getUI();
        attributeFilterUI.add({ 
			xtype: 'button',
			text : '+',
			width: 40,
			listeners: {
				click:{
					scope: this,
					fn: this.addAttributeFilter
				}
			}
		});
        var firstContainer =  Ext.create('Ext.container.Container', {
			width: 400,
			height: this.getRowHeight(),
			layout: {
				type: 'hbox',
				align:'stretch'
			},
			items:  [
				this.attributeCombobox,
				attributeFilterUI
			]
		});
		this.container = Ext.create("Ext.container.Container", {
			width: '100%',
			items: [ firstContainer ]
        });
        return this;
    },
    getRowHeight: function() {
        return 35;
    },
    // Called when a new layer is chosen from the upper combobox
    setNewAttributeList : function (list){
        this.attributeStore.loadData(list,false);
        this.attributeCombobox.clearValue();
        this.config.attributes = list;
    },
    attributeComboboxChanged: function(el,val,prevVal){
        this.uniqueList=[];
        this.setUniqueListOnAttributeFilters([]);
        if (val!=null){
            var applayerAttribute = this.getAppLayerAttributeByName(val);
            if (applayerAttribute && applayerAttribute.defaultValue==="filterList"){
                this.getAttributeUniques(val,applayerAttribute.featureType);
            }
        }
    },
    /**
     * Get the attribute from the selected AppLayer by name.
     */
    getAppLayerAttributeByName: function (name){
        var appLayer = this.config.parentComponent.appLayer;
        if(appLayer && appLayer.attributes){
            for (var i=0; i < appLayer.attributes.length; i++){
                var attribute = appLayer.attributes[i];
                if (attribute.name===name){
                    return attribute;
                }
            }
        }
        return null;
    },
    getAttributeUniques : function (attributeName,ft){
        var appLayer = this.config.parentComponent.layerSelector.getValue();
        if(attributeName){
            this.config.parentMainContainer.setLoading("Laad unieke waardes...");
            Ext.Ajax.request({ 
                url: actionBeans.unique, 
                timeout: 240000,
                scope:this,
                params: { 
                    attributes: [attributeName],
                    applicationLayer: appLayer.id,
                    maxFeatures:this.config.maxFeatures,
                    featureType: ft
                }, 
                success: function ( result, request ) { 
                    var res = Ext.JSON.decode(result.responseText);
                    if(res.success){
                        var values = res.uniqueValues;
                        if(res.msg){
                            Ext.MessageBox.alert('Info', res.msg);
                        }
                        this.handleUniqueValues(values);
                    }else{
                        Ext.MessageBox.alert('Foutmelding', "Kan geen unieke waardes ophalen: " + res.msg);   
                        this.config.parentMainContainer.setLoading(false);
                    }
                }, 
                failure: function ( result, request) {
                    Ext.MessageBox.alert('Foutmelding', "Kan geen unieke waardes ophalen: " + result.responseText);   
                    this.config.parentMainContainer.setLoading(false);
                } 
            });
        }
    },
    /**
     * Handle the response of the Uniguevalues request.
     */
    handleUniqueValues : function (values){   
        values =  this.transformUniqueValuesToStore(values);    
        this.uniqueList=values;
        this.setUniqueListOnAttributeFilters(values);        
        this.config.parentMainContainer.setLoading(false);
    },
    /**
     * 
     */
    setUniqueListOnAttributeFilters: function(values){
        for (var i=0; i < this.attributeFilters.length; i++){
            this.attributeFilters[i].setUniqueList(values);
        }
    },
     
    /**
     * Transform the uniquelist response of a object with arrays of strings 
     * that points to the string. So it will work for Ext Stores (and comboboxes)
     * @param valueArray A array of values
     */
    transformUniqueValuesToStore : function(values){        
        var newValues=[];
        for (var attribute in values){
            if(values.hasOwnProperty(attribute)) {
                for (var i =0; i < values[attribute].length; i++){
                    newValues.push({value: values[attribute][i]});
                }
            }
        }
        return newValues;
    },
    //Add a new attributefilter (to expand this filter)
    addAttributeFilter : function (){
        var me = this;
		var filterContainer = Ext.create('Ext.container.Container', {
			width: 400,
			height: this.getRowHeight(),
			layout: {
				type: 'hbox',
				align:'stretch'
			},
			items:  [
				// left = leftwidth - 50 (or/and combobox of attributefilter)
				{ xtype: 'container', width: this.leftWidth - 50 }
			]
		});
		var attributeFilter = Ext.create("viewer.components.AttributeFilter",{
            first: false,
            id: this.id,
            number: this.attributeFilters.length + 1
        });
        var attributeFilterUI = attributeFilter.getUI();
        attributeFilterUI.add({ 
            xtype: 'button',
			text : '-',
			width: 40,
			listeners: {
				click: function() {
                                    me.removeAttributeFilter(attributeFilter, filterContainer);
				}
			}
        });
		filterContainer.add(attributeFilterUI);
		filterContainer.updateLayout();
        this.container.add(filterContainer);
        this.attributeFilters.push(attributeFilter);
        attributeFilter.setUniqueList(this.uniqueList);
        if(this.config.parentMainContainer) this.config.parentMainContainer.updateLayout();
    },
    removeAttributeFilter : function (attributeFilter, filterContainer){
        for ( var i = 0 ; i < this.attributeFilters.length;i++){
            var af = this.attributeFilters[i];
            if(af === attributeFilter){
                this.attributeFilters.splice(i,1);
            }
        }
		// We have to remove all items from the attribute filter due to some weird Ext bug
		attributeFilter.removeItems();
		this.container.remove(filterContainer.getId());
    },
    getUI : function (){
        return this.container;
    },
    /*
     * Get the cql(like) filter for this filter
     */
    getCQL : function (){
        var cql ="";
        if(this.config.logicOperator != null){
            cql += " " + this.config.logicOperator.getValue() + " ";
        }
        cql += "(";
	var attribute = this.attributeCombobox.getValue();
	if(attribute === null) return "";
        for(var i = 0 ; i < this.attributeFilters.length;i++){
            var af = this.attributeFilters[i];
            var type = this.getAttributeType(attribute);
            af.attribute = attribute;
            af.attributeType = type;
            cql += af.getCQL();
        }
        cql+= ")";
       
        return cql;
    },
    getAttributeType : function (name){
        for(var i = 0 ; i < this.config.attributes.length ;i++){
            var attr = this.config.attributes[i];
            if(attr.value === name){
                return attr.type;
            }
        }
        return null;
    },
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});
