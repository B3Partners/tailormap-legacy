/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
    numericOperators : [{
        id:"<"
    }, {
        id:">"
    },{
        id:"="
    },{
        id:"<="
    },{
        id:">="
    },{
        id:"<>"
    }],
    stringOperators : [{
        id:"="
    },{
        id:"<>"
    }],
    operator: null,
    value:null,
    logicOperator:null,
    container:null,
    attribute:null,
    attributeType:null,
    config :{
        first:null,
        id:null,
        number:null
    },
    constructor: function(config){
        this.initConfig(config);
        var attributeStore = Ext.create('Ext.data.Store', {
            fields: ['id'],
            data : this.numericOperators
        });

        
        this.operator = Ext.create('Ext.form.ComboBox', {
            fieldLabel: '',
            store: attributeStore,
            queryMode: 'local',
            displayField: 'id',
            value:'=',
            width:50,
            valueField: 'id'
        });
        this.value = Ext.create("Ext.form.field.Text",{
            width: 100,
            id: "value" + this.id
        });
        return this;
    },
    getUI : function (){
        var items = new Array();
        if(!this.first){
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
                width:50,
                value:'OR',
                valueField: 'id'
            });
            items.push(this.logicOperator);
        }
        items.push(this.operator);
        items.push(this.value);
        
        this.container =  Ext.create("Ext.container.Container",{
            width: 230,
            id:"attributeFilter-"+this.id+"-"+this.number,
            layout: {
                type: 'hbox'
            },
            items:  items
        });
        return this.container;
    },
    getCQL : function (){
        var cql = " " ;
        if(!this.first){
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
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});
