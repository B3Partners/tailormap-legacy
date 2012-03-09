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
    filters:null,
    config: {
        layers:null,
        title:null,
        iconUrl:null,
        tooltip:null,
        width: null,
        height:null
    },
    constructor: function (conf){
        conf.width = 550;
        conf.height = 500;
        this.attributes =[{
            id:1,
            title:"a"
        },{
            id:2,
            title:"b"
        },{
            id:3,
            title:"c"
        }];
        viewer.components.DataSelection.superclass.constructor.call(this, conf);
        this.filters = new Array();
        this.initConfig(conf); 
        this.loadButton();
        this.loadWindow();
        //this.popup.show();
        return this;
    },
    /**
     * Create the button to open the popupwindow
     */
    loadButton : function(){
        Ext.create('Ext.Button', {
            renderTo: this.div,
            icon: this.iconUrl,
            tooltip: this.tooltip,
            listeners: {
                click:{
                    scope: this,
                    fn: this.showWindow
                }
            }
        });
    },
    showWindow : function (){
        this.popup.show();
    },
    loadWindow : function(){
        var config = {
            viewerController : this.viewerController,
            restriction : "filterable",
            div: this.getContentDiv()
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);
   
        this.createTabs();
        var tabs = Ext.create('Ext.tab.Panel', {
            height: 400,
      //      width: 500,
            hideMode: 'offsets',
           // autoScroll:true,
            layout: {
                type: 'fit'
            },
            
            tabBar:{
                style: 'background:#fff;'
            },
            items: [
            {
                id : "filterTab",
                title: 'Filter',
                items:[this.filterTab]
            },
            {
                id   : 'dataTab',
                title: 'Data selectie',
                html: "<div id='dataTabDiv' style='width:80%; height=100%;overflow:auto;'></div>"
            }
            ],
            activeTab : "dataTab",
            renderTo : this.getContentDiv()
        });
        Ext.create('Ext.Button', { 
            text : 'Voeg filter toe',
            renderTo: "dataTabDiv",
            listeners: {
                click:{
                    scope: this,
                    fn: this.addFilter
                }
            }
        });
        this.dataTab = Ext.create('Ext.panel.Panel', {
            autoScroll: true,
            renderTo: 'dataTabDiv'
        });
        Ext.create('Ext.Button', { 
            text : 'Toepassen',
            renderTo: this.getContentDiv(),
            listeners: {
                click:{
                    scope: this,
                    fn: this.applyFilter
                }
            }
        });
        this.addFilter();
    },
    createTabs : function (){
        this.dataTab  = {
            xtype: 'container'
        };
        this.filterTab = {
            layout: {
                type: 'vbox'
            },
            xtype: 'container'
        };
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
            this.dataTab.add(logicOperator);
            
        }
        var config = {
            width: this.width,
            height: this.height,
            attributes:this.attributes,
            logicOperator:logicOperator
        };
        var filter = Ext.create("viewer.components.Filter",config);
        this.filters.push(filter);
        this.dataTab.add(filter.getUI());
    },
    applyFilter : function (){
        var cql = "";
        for ( var i = 0 ; i < this.filters.length;i++){
            var filter = this.filters[i];
            cql += filter.getCQL();
            console.log(filter.getCQL());
        }
        var layerObj = this.layerSelector.getValue();
        var layer = this.viewerController.getLayer(layerObj.serviceId, layerObj.name)
        layer.setQuery(cql);
        console.log("Filter: "+cql + " voro layer " + this.layerSelector.getValue());
    },
    /**
     *  Reset all comboboxes when a different layer is selected
     */
    layerChanged : function (item,prev,a,b){
        var appLayer = this.viewerController.getApplayer (item.serviceId,item.name);
        if(appLayer != null){
            var attributes = appLayer.attributes;
            var attributeList = new Array();
            for(var i= 0 ; i < attributes.length ;i++){
                var attribute = attributes[i];
                if(attribute.visible){
                    attributeList.push({
                        id: attribute.id,
                        title: attribute.name
                    });
                }
            }
            this.attributes = attributeList;
            for (var j = 0 ; j < this.filters.length ;j++){
                var filter = this.filters[j];
                filter.setNewAttributeList(attributeList);
            }
        }
        
        if(prev != undefined){
            var prevLayer = this.viewerController.getLayer (prev.serviceId,prev.name);
            prevLayer.setQuery(null);
        }
    }
});

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
            fields: ['id', 'title'],
            data : this.attributes
        });

        this.attributeCombobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: '',
            store: this.attributeStore,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'title'
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
            number:this.attributeFilters.length
        });
        this.attributeFilters.push(attribuutFilter);
        var af = attribuutFilter.getUI();
        af.add(add);
        
        var items = new Array();
        items.push(this.attributeCombobox);
        items.push(af);
        
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
        this.container = Ext.create("Ext.form.FieldSet",{
            height: 75,
            width:380,
            
            autoScroll:true,
            layout: {
                type: 'vbox',
                overflow: 'auto'/*,
                align: 'left'*/
            },
            items:  vitems
        });
        var id = this.container.id + "-body";
       
        return this;
    },
    setNewAttributeList : function (list){
        this.attributeStore.loadData(list,false);
        this.attributeCombobox.clearValue();
    },
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
        for(var i = 0 ; i < this.attributeFilters.length;i++){
            cql += this.attributeCombobox.getValue();
            var af = this.attributeFilters[i];
            cql += af.getCQL();
        }
        return cql;
    }
});


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
            width: 50,
            id: "value"
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
            width: 200,
            id:"attributeFilter-"+this.id+"-"+this.number,
            layout: {
                type: 'hbox'/*,
                align:'center'*/
            },
            items:  items
        });
        return this.container;
    },
    getCQL : function (){
        var cql ="";
        if(!this.first){
            cql += this.logicOperator.getValue();
        }
        cql += this.operator.getValue();
        cql += "\'" + this.value.getValue() + "\'";
        return cql;
    }
});