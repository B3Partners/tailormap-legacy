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
    margin: "0 5 0 0",
    resultPanelId: '',
    defaultFormHeight: MobileManager.isMobile() ? 100 : 90,
    config:{
        title: null,
        iconUrl: null,
        tooltip: null,
        searchconfigs: null,
        formHeight:null
    },    
    constructor: function (conf){        
        viewer.components.Search.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.renderButton(); 
        this.loadWindow();
        return this;
    },
    renderButton: function() {
        var me = this;
        viewer.components.Search.superclass.renderButton.call(this,{
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            handler: function() {
                me.popup.show();
            }
        });
    },
    loadWindow : function(){
        var me = this;
        this.form = Ext.create("Ext.form.Panel",{
            frame: false,
            height: this.formHeight || this.defaultFormHeight,
            items: this.getFormItems(),
            border: 0,
            style: { 
                padding: '0px 10px 0px 10px'
            }
        });
        this.resultPanelId = Ext.id();
        this.mainContainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [
                this.form, {
                    id: this.name + 'ContentPanel',
                    xtype: "container",
                    autoScroll: true,
                    width: '100%',
                    flex: 1,
                    html: '<div id="' + me.resultPanelId + '" style="width: 100%; height: 100%; padding: 0px 10px 0px 10px;"></div>'
                }, {
                    id: this.name + 'ClosingPanel',
                    xtype: "container",
                    width: '100%',
                    height: MobileManager.isMobile() ? 45 : 25,
                    style: {
                        marginTop: '10px',
                        marginRight: '5px'
                    },
                    layout: {
                        type:'hbox',
                        pack:'end'
                    },
                    items: [
                        {xtype: 'button', text: 'Sluiten', componentCls: 'mobileLarge', handler: function() {
                            me.popup.hide();
                        }}
                    ]
                }
            ]
        });
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
    },
    getFormItems: function(){
        var me = this;
        var itemList = new Array();        
        if(this.searchconfigs.length == 1){
            itemList.push({
                xtype: 'label',
                text: 'Zoek op: '+ this.searchconfigs[0].name
            });
        }else if (this.searchconfigs.length > 1 ){
            var configs = Ext.create('Ext.data.Store', {
                fields: ['id', 'name', 'url'],
                data : this.searchconfigs
            });
            itemList.push({
                xtype: "flamingocombobox",
                fieldLabel: 'Zoek op',
                store: configs,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                anchor: '100%',
                emptyText:'Maak uw keuze',
                id: 'searchName' + this.name
            });
        }
        if (this.searchconfigs.length> 0){
            itemList.push({ 
                xtype: 'textfield',
                name: 'searchfield',
                anchor: '100%',
                id: 'searchfield' + this.name,
                listeners: {
                    specialkey: function(field, e){
                        if (e.getKey() == e.ENTER) {
                            me.search();
                        }
                    }
                }
            });
        
            itemList.push({ 
                xtype: 'button',
                text: 'Zoeken',
                componentCls: 'mobileLarge',
                margin: this.margin,
                listeners: {
                    click:{
                        scope: this,
                        fn: this.search
                    }
                }
            });
        }
        itemList.push({ 
            xtype: 'button',
            text: 'Zoekactie afbreken',
            margin: this.margin,
            componentCls: 'mobileLarge',
            name: 'cancel',
            id: 'cancel'+ this.name,
            listeners: {
                click:{
                    scope: this,
                    fn: this.cancel
                }
            }
        });        
        return itemList;
    },
    hideWindow : function(){
        this.popup.hide();
    },
    search : function(){
        if(this.results != null){
            this.results.destroy();
        }
        var searchText = this.form.getChildByElement("searchfield" + this.name).getValue();
        var searchName = '';
        if(this.searchconfigs.length == 1){
            searchName = this.searchconfigs[0].id;
        }else{
            searchName = this.form.getChildByElement("searchName" + this.name).getValue();
        }
        
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
                    me.searchResult = Ext.JSON.decode(result.responseText);
                    me.showSearchResults();
                },
                failure: function(a,b,c) {
                    Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden");
                }
            });
            this.form.getChildByElement("cancel"+ this.name).setVisible(true);
        } else {
            Ext.MessageBox.alert("Foutmelding", "Alle velden dienen ingevult te worden.");
            // search request is not complete
        }        
    },
    showSearchResults : function(){
        var html = "";
        if(this.searchResult.length <= 0){
            html = "<div style=\"padding: 10px;\">Er zijn geen resultaten gevonden.</div>";
        }
        var me = this;
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
        var buttonList = new Array();
        for ( var i = 0 ; i < this.searchResult.length ; i ++){
            var result = this.searchResult[i];
            buttonList.push({
                text: result.address,
                xtype: 'button',
                margin: '10px 10px 0px 10px',
                componentCls: 'mobileLarge',
                tooltip: 'Zoom naar locatie',
                listeners: {
                    click:{
                        scope: me,
                        fn: function(){me.handleSearchResult(result.location);}
                    }
                }
            });
        }
        
        me.results = Ext.create('Ext.form.Panel', {
            title: 'Resultaten:',
            renderTo: this.resultPanelId,
            html: html,
            height: '100%',
            autoScroll: true,
            style: { 
                padding: '0px 0px 10px 0px'
            },
            items: buttonList
        });
        
    },
    cancel : function(){
        this.form.getChildByElement("searchfield"+ this.name).setValue("");
        this.form.getChildByElement("searchName"+ this.name).setValue("");
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
        this.results.destroy();
    },
    handleSearchResult : function(location){
        var newExtent = new Object();
        newExtent.minx=location.x-100;
        newExtent.miny=location.y-100;
        newExtent.maxx=location.x+100;
        newExtent.maxy=location.y+100;
        this.viewerController.mapComponent.getMap().zoomToExtent(newExtent);
        this.viewerController.mapComponent.getMap().removeMarker("searchmarker");
        this.viewerController.mapComponent.getMap().setMarker("searchmarker",location.x,location.y,"marker");
        this.popup.hide();
    },
    getExtComponents: function() {
        var c = [ this.mainContainer.getId(), this.form.getId() ];
        if(this.results) c.push(this.results.getId());
        return c;
    }
});

