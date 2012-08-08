/* 
 * Copyright (C) 2012 B3Partners B.V
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
 * A filter has 1..n attribute filters, which can be added/removed via the gui.
 */
Ext.define ("viewer.components.Filter",{
    extend: "viewer.components.Component",
    attributeCombobox: null,
    attributeStore:null,
    attributeFilters : null,    
    id: null,
    container : null,
    config: {
        width: null,
        height: null,
        attributes:null,
        logicOperator:null
    },
    constructor: function(config){
        this.initConfig(config); 
        this.id = Ext.id();
        this.attributeFilters = new Array();
        this.attributeStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'title','value'],
            data : this.attributes
        });

        this.attributeCombobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: '',
            store: this.attributeStore,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'value'
        });
        var add = Ext.create('Ext.Button', { 
            text : '+',
            listeners: {
                click:{
                    scope: this,
                    fn: this.addAttributeFilter
                }
            }
        });
        
        var attribuutFilter = Ext.create("viewer.components.AttributeFilter",{
            first:true,
            id: this.id,
            number:1
        });
        this.attributeFilters.push(attribuutFilter);
        var attributeFilterUI = attribuutFilter.getUI();
        attributeFilterUI.add(add);
        
        var items = new Array();
        items.push(this.attributeCombobox);
        items.push(attributeFilterUI);
        
        var eersteAttribuutFilter =  Ext.create("Ext.container.Container",{
            width:350,
            height:25,
            autoScroll:true,
            layout: {
                type: 'hbox',
                align:'stretch'
            },
            items:  items
        });
      
        var vitems = [eersteAttribuutFilter];
       /* var vf = Ext.create('Ext.Button', { 
            text : 'Verwijder filter',
            listeners: {
                click:{
                    scope: this,
                    fn: this.cancel
                }
            }
        });*/
        this.container = Ext.create("Ext.form.FieldSet",{
            height: 125,
            width:380,
            autoScroll:true,
            items:  vitems
        });
        return this;
    },
    // Called when a new layer is chosen from the upper combobox
    setNewAttributeList : function (list){
        this.attributeStore.loadData(list,false);
        this.attributeCombobox.clearValue();
        this.attributes = list;
    },
    //Add a new attributefilter (to expand this filter)
    addAttributeFilter : function (){
        var attributeFilter = Ext.create("viewer.components.AttributeFilter",{
            first:false,
            id:this.id,
            number:this.attributeFilters.length + 1
        });
        var afUI = attributeFilter.getUI();
        var remove = Ext.create('Ext.Button', { 
            text : '-'
        });
        remove.addListener('click',this.removeAttributeFilter,this,attributeFilter);
        afUI.add(remove);
        
        this.container.add(afUI);
        this.attributeFilters.push(attributeFilter);
    },
    removeAttributeFilter : function (button,event,attributeFilter){
        var id = attributeFilter.container.id;
        var node = Ext.get(id);
        node.remove();
        
        for ( var i = 0 ; i < this.attributeFilters.length;i++){
            var af = this.attributeFilters[i];
            if(af == attributeFilter){
                this.attributeFilters.splice(i,1);
            }
        }
    },
    getUI : function (){
        return this.container;
    },
    /*
     * Get the cql(like) filter for this filter
     */
    getCQL : function (){
        var cql ="";
        if(this.logicOperator != null){
            cql += " " + this.logicOperator.getValue() + " ";
        }
        cql += "(";
        for(var i = 0 ; i < this.attributeFilters.length;i++){
            var attribute = this.attributeCombobox.getValue();
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
        for(var i = 0 ; i < this.attributes.length ;i++){
            var attr = this.attributes[i];
            if(attr.value == name){
                return attr.type;
            }
        }
        return null;
    },
    getExtComponents: function() {
        return [ this.container.getId() ];
    }
});
