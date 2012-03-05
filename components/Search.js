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
        searchconfigs: null
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
        this.superclass.renderButton.call(this,{
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            handler: function() {
                me.popup.show();
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
                id: 'cancel'+ this.name,
                listeners: {
                    click:{
                        scope: this,
                        fn: this.cancel
                    }
                }
            },{ 
                xtype: 'button',
                text: 'Sluiten',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.hideWindow
                    }
                }
            }],
            renderTo: this.getContentDiv()
        });
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
    },
    hideWindow : function(){
        this.popup.hide();
    },
    search : function(){
        if(this.results != null){
            this.results.destroy();
        }
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
                    me.searchResult = Ext.JSON.decode(result.responseText);
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
        
        this.form.getChildByElement("cancel"+ this.name).setVisible(true);
    },
    showSearchResults : function(){
        var html = "";
        if(this.searchResult.length <= 0){
            html = "Er zijn geen resultaten gevonden.";
        }
        var me = this;
        
        var buttonList = new Array();
        for ( var i = 0 ; i < this.searchResult.length ; i ++){
            var result = this.searchResult[i];
            buttonList.push({
                text: result.address,
                xtype: 'button',
                tooltip: 'Zoom naar locatie',
                listeners: {
                    click:{
                        scope: me,
                        fn: function(){me.zoomToExtent(result.location);}
                    }
                }
            });
        }
        
        me.results = Ext.create('Ext.form.Panel', {
            title: 'Resultaten:',
            renderTo: this.getContentDiv(),
            html: html,
            items: buttonList
        });
        
    },
    cancel : function(){
        this.form.getChildByElement("searchfield"+ this.name).setValue("");
        this.form.getChildByElement("searchName"+ this.name).setValue("");
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
        this.results.destroy();
    },
    zoomToExtent : function(location){
        var newExtent = new Object();
        newExtent.minx=location.x-100;
        newExtent.miny=location.y-100;
        newExtent.maxx=location.x+100;
        newExtent.maxy=location.y+100;
        this.viewerController.mapComponent.getMap().zoomToExtent(newExtent);
        this.viewerController.mapComponent.getMap().removeMarker("searchmarker");
        this.viewerController.mapComponent.getMap().setMarker("searchmarker",location.x,location.y,"marker");
        this.popup.hide();
    }
});

