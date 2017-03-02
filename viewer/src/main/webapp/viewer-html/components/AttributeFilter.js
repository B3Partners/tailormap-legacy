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
 * Part of DataSelection and Filter component
 * Creates a dialog where filter and selection settings can be set.
 * A dataselectionfilter contains 1..n filters, a filter contains 1..n attributefilters.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */

/**
 * An AttributeFilter is a part of a filter. It specifies one operation performed on the attribute of the filter. A filter contains one or more AttributeFilters.
 */
Ext.define ("viewer.components.AttributeFilter",{
    extend: "viewer.components.Component",
    numericOperators: ["<", ">", "=", "<=", ">=", "<>"],
    operator: null,
    value:null,
    valueStore:null,
    logicOperator:null,
    container:null,
    attribute:null,
    attributeType:null,
    config :{
        first:null,
        id:null,
        number:null,
        initData: null
    },
    constructor: function(config){
        this.initConfig(config);
        this.operator = Ext.create('Ext.form.ComboBox', {
            fieldLabel: '',
            store: this.numericOperators,
            queryMode: 'local',
            displayField: 'id',
            value:'=',
            width:50,
            valueField: 'id',
            data: this.config.initData
        });
        this.valueStore = Ext.create('Ext.data.ArrayStore', {
            fields: ['value']
        });
        this.value= Ext.create('Ext.form.ComboBox', {
            fieldLabel: '',
            store: this.valueStore,
            queryMode: 'local',
            displayField: 'value',
            width:150,
            valueField: 'value',
            forceSelection: false,
            editable: true
        });
        return this;
    },
    getUI : function (){
		if(this.container === null) {
			var items = [];
			if(!this.config.first){
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
				this.logicOperator = Ext.create('Ext.form.ComboBox', {
					fieldLabel: '',
					store: logicStore,
					queryMode: 'local',
					displayField: 'title',
					// width: /*MobileManager.isMobile() ? 70 : */,
					value:'OR',
					valueField: 'id'
				});
				items.push(this.logicOperator);
			}
			items.push(this.operator);
			items.push(this.value);

			this.container =  Ext.create("Ext.container.Container",{
				// id:"attributeFilter-"+this.config.id+"-"+this.config.number,
				layout: {
					type: 'hbox',
                                        align: 'stretch'
				},
				width: 320,
				items:  items,
				// height: /*MobileManager.isMobile() ? 35 : */
			});
		}
        return this.container;
    },
    getCQL : function (){
        var cql = " " ;
        if(!this.config.first){
            cql += this.logicOperator.getValue() + " ";
        }
        cql += "\"" +  this.attribute + "\"";
        cql += this.operator.getValue();
            
        if(this.attributeType && this.attributeType.toLowerCase() == "string"){
            cql += "\'";
        }  
        cql += this.value.getValue();
        if(this.attributeType && this.attributeType.toLowerCase() == "string"){
            cql += "\'";
        }      
        return cql;
    },
    /**
     * Set the unique list of values.
     */
    setUniqueList: function(list){
        if(list === null) {
            return;
        }
        if (list.length>0){
            this.value.setHideTrigger(false);
        }else{
            this.value.setHideTrigger(true);
        }
        this.valueStore.removeAll();
        this.valueStore.loadData(list);
        
    },
	// We have to remove all items from the attribute filter due to some weird Ext bug
	removeItems: function() {
		this.operator.destroy();
		this.value.destroy();
		if(this.logicStore) this.logicStore.destroy();
		this.container.destroy();
	},
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});
