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
 * Print component
 * Creates a AttributeList component
 * @author <a href="mailto:geertplaisier@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Search",{
    extend: "viewer.components.Component",
    form: null,
    searchResult: null,
    results: null,
    config:{
        title: null,
        iconUrl: null,
        tooltip: null,
        searchconfigs: null,
        isPopup: true
    },    
    constructor: function (conf){        
        viewer.components.Search.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.loadButton();   
        this.loadWindow();
        return this;
    },
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
    loadWindow : function(){
        var configs = Ext.create('Ext.data.Store', {
            fields: ['id', 'name', 'url'],
            data : this.searchconfigs
        });
        
        this.form = Ext.create("Ext.form.Panel",{
            frame: false,
            items: [{
                xtype: 'combo',
                fieldLabel: 'Zoek op',
                store: configs,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                id: 'searchName' + this.name
            },{ 
                xtype: 'textfield',
                name: 'searchfield',
                id: 'searchfield' + this.name
            },{ 
                xtype: 'button',
                text: 'Zoeken',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.search
                    }
                }
            },{ 
                xtype: 'button',
                text: 'Annuleren',
                name: 'cancel',
                id: 'cancel',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.cancel
                    }
                }
            }],
            renderTo: this.getContentDiv()
        });
        this.results = Ext.create('Ext.panel.Panel', {
            title: 'Resultaten:',
            renderTo: this.getContentDiv()
        });
        
     //   this.form.getChildByElement("cancel").setVisible(false);
        this.results.hide();
    },
    showWindow : function(){
        this.popup.show();
    },
    search : function(){
        var searchText = this.form.getChildByElement("searchfield" + this.name).getValue();
        var searchName = this.form.getChildByElement("searchName" + this.name).getValue();
        
        if(searchName != null && searchText != ""){
            var requestPath=  contextPath+"/action/search";
            var requestParams = {};

            requestParams["searchText"]= searchText;
            requestParams["searchName"]= searchName;
            requestParams["appId"]= appId;
            requestParams["componentName"]= this.name;
            var me = this;
            Ext.Ajax.request({ 
                url: requestPath, 
                params: requestParams, 
                success: function ( result, request ) {
                    me.searchResult = JSON.parse(result.responseText);
                    me.showSearchResults();
                },
                failure: function(a,b,c) {
                    Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden");
                }
            });
        }else{
            Ext.MessageBox.alert("Foutmelding", "Alle velden dienen ingevult te worden.");
            // search request is not complete
        }
        
        this.form.getChildByElement("cancel").setVisible(true);
    },
    showSearchResults : function(){
        this.results.show();
        //this.resultsgetChildByElement("html").setValue("<h1>test</h1>");
    },
    cancel : function(){
        this.form.getChildByElement("searchfield").setValue("");
        this.form.getChildByElement("searchName").setValue("");
        this.form.getChildByElement("cancel").setVisible(false);
        this.results.hide();
    }
});

