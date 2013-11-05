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
    autosuggestStore:null,
    searchField:null,
    resultPanelId: '',
    defaultFormHeight: MobileManager.isMobile() ? 100 : 90,
    searchRequestId: 0,
    config:{
        title: null,
        iconUrl: null,
        tooltip: null,
        searchconfigs: null,
        formHeight:null,
        label: "",
        typeLabel:null
    },    
    constructor: function (conf){            
        if (conf.typeLabel===undefined){
            conf.typeLabel={
                Street: 'Straat',
                MunicipalitySubdivision: 'Plaats',
                Municipality: 'Gemeente',
                CountrySubdivision: 'Provincie'
            };
        }
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
            label: me.label,
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
        if(this.searchconfigs ){
            if(this.searchconfigs.length === 1){
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
                    id: 'searchName' + this.name,
                    listeners:{
                        change:{
                            fn: function(combo, newValue){
                                this.searchConfigChanged(newValue);
                            },
                            scope:this
                        }
                    }
                });
            }
            if (this.searchconfigs.length> 0){
                var queryMode = 'local';
                var extraParams = {};
                if(this.searchconfigs.length === 1 && this.searchconfigs[0].type === "solr" ){
                    queryMode = "remote";
                    
                    extraParams["searchName"]=this.searchconfigs[0].id;
                    extraParams["appId"]=appId;
                    extraParams["componentName"]=this.name;
                }
                this.autosuggestStore = Ext.create(Ext.data.Store,  {
                    autoLoad: false,
                    model: 'Doc',
                    proxy: {
                        type: 'ajax',
                        url: actionBeans["autosuggest"],
                        extraParams: extraParams,
                        reader: {
                            type: 'json',
                            root: 'results'
                        }
                    }
                });
                
                this.searchField = Ext.create( Ext.form.field.ComboBox,{ 
                    name: 'searchfield',
                    hideTrigger: true,
                    anchor: '100%',
                    triggerAction: 'query',
                    queryParam: "searchText",
                    displayField: "label",
                    queryMode: queryMode,
                    id: 'searchfield' + this.name,
                    minChars: 2,
                    listeners: {
                        specialkey: function(field, e){
                            if (e.getKey() === e.ENTER) {
                                me.search();
                            }
                        },
                        beforeQuery : function(request){
                            if(this.getCurrentSearchType() !== "solr"){
                                    return false;
                            }
                            var q = request.query;
                            var combo = request.combo;
                            var minChars = combo.minChars;
                            if(q.length >= minChars){
                                this.setVisibleLayers();
                            }
                        },
                        scope:this
                    },
                    store:this.autosuggestStore
                });
                itemList.push(this.searchField);

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
        this.searchRequestId++;
        if(this.results != null){
            this.results.destroy();
        }
        var searchText = this.form.getChildByElement("searchfield" + this.name).getValue();
        var searchName = '';
        if(this.searchconfigs.length === 1){
            searchName = this.searchconfigs[0].id;
        }else{
            searchName = this.form.getChildByElement("searchName" + this.name).getValue();
        }
        
        if(searchName !== null && searchText !== ""){
            var requestPath=  contextPath+"/action/search"; 
            var requestParams = {};

            requestParams["searchText"]= searchText;
            requestParams["searchName"]= searchName;
            requestParams["appId"]= appId;
            requestParams["componentName"]= this.name;
            requestParams["searchRequestId"]= this.searchRequestId;
            this.getExtraRequestParams(requestParams,searchName);
            if( this.getCurrentSearchType() === "simplelist"){
                this.simpleListSearch(searchText);
            }else{
                var me = this;
                me.mainContainer.setLoading({
                    msg: 'Bezig met zoeken'
                });
                Ext.Ajax.request({ 
                    url: requestPath, 
                    params: requestParams, 
                    success: function ( result, request ) {
                        var response = Ext.JSON.decode(result.responseText);
                        me.searchResult = response.results;
                        if (response.error){
                            Ext.MessageBox.alert("Foutmelding", response.error);
                        }
                        if (me.searchRequestId==response.request.searchRequestId){
                            me.showSearchResults();
                        }
                        me.mainContainer.setLoading(false);
                    },
                    failure: function(result, request) {
                        var response = Ext.JSON.decode(result.responseText);
                        Ext.MessageBox.alert("Foutmelding", response.error);
                        me.mainContainer.setLoading(false);
                    }
                });
            }
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
            var typeLabel = this.typeLabel[result.type];
            
            buttonList.push({
                text: result.label + (typeLabel!==undefined ? " ("+typeLabel+")" : ""),
                xtype: 'button',
                margin: '10px 10px 0px 10px',
                componentCls: 'mobileLarge',
                tooltip: 'Zoom naar locatie',
                id: "searchButton_"+i,
                listeners: {
                    click:{
                        scope: me,
                        fn: function(button,e,eOpts){
                            var config =this.searchResult[button.id.split("_")[1]];
                            config.x = (config.location.maxx +config.location.minx)/2;
                            config.y = (config.location.maxy +config.location.miny)/2;
                            me.handleSearchResult(config);
                        }
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
    handleSearchResult : function(config){
        this.viewerController.mapComponent.getMap().zoomToExtent(config.location);
        this.viewerController.mapComponent.getMap().removeMarker("searchmarker");
        this.viewerController.mapComponent.getMap().setMarker("searchmarker",config.x,config.y,"marker");
        
        var type = this.getCurrentSearchType();
        if(type === "solr"){
            
            var searchconfig = this.getCurrentSearchconfig();
            if(searchconfig ){
                var solrConfig = searchconfig.solrConfig[config.searchConfig];
                var switchOnLayers = solrConfig.switchOnLayers;
                if(switchOnLayers){
                    for(var i = 0 ; i <switchOnLayers.length ;i++){
                        var appLayerId = switchOnLayers[i];
                        var applayer = this.viewerController.getAppLayerById(appLayerId);
                        this.viewerController.setLayerVisible(applayer,true);
                    }
                }
            }
        }
        
        this.popup.hide();
    },
    getExtComponents: function() {
        var c = [ this.mainContainer.getId(), this.form.getId() ];
        if(this.results) c.push(this.results.getId());
        return c;
    },
    
    searchConfigChanged: function(searchConfig){
        for(var i = 0 ; i < this.searchconfigs.length ;i++){
            var config = this.searchconfigs[i];
            if(config.id === searchConfig){
                if(config.type === "solr"){
                    this.searchField.queryMode = "remote";
                    var proxy = this.searchField.getStore().getProxy();
                    var params = proxy.extraParams;
                    
                    params["searchName"]=searchConfig;
                    params["appId"]=appId;
                    params["componentName"]=this.name;
                }else{
                    this.searchField.queryMode = "local";
                    this.searchField.getStore().removeAll();
                }
                break;
            }
        }
    },
    getCurrentSearchType : function(){
        if(this.searchconfigs.length === 1){
            return this.searchconfigs[0].type;
        }else{
            var value = Ext.getCmp('searchName' + this.name).getValue();
            var config = this.getSearchconfigById(value);
            if(config){
                return config.type;
            }else{
                return null;
            }
        }
    },
    getCurrentSearchconfig :function(){
        var value = Ext.getCmp('searchName' + this.name).getValue();
        var config = this.getSearchconfigById(value);
        return config;
    },
    getSearchconfigById:function(id){
        for (var i = 0; i < this.searchconfigs.length; i++) {
            if (this.searchconfigs[i].id ===  id) {
                return this.searchconfigs[i];
            }
        }
        return null;
    },
    setVisibleLayers: function() {
        var proxy = this.searchField.getStore().getProxy();
        var params = proxy.extraParams;
        var appLayers = this.viewerController.getVisibleLayers();
        params["visibleLayers"] = appLayers.join(", ");
    },
    getExtraRequestParams:function(params, type){
        if(this.getCurrentSearchType() === "solr"){
            var appLayers = this.viewerController.getVisibleLayers();
            params["visibleLayers"] = appLayers.join(", ");
        }else{
            // Nothing to do here
        }
    }, 
   simpleListSearch:function(term){
        var config = this.getCurrentSearchconfig();
        var values = config.values;
        var results = new Array();
        for(var i = 0 ; i < values.length; i++){
            var entry = values[i];
            var value = entry.value;
            if(value.indexOf(term) !== -1){
                var result = {
                    label : entry.value,
                    location:entry.location
                };
                results.push(result);
            }
        }

        this.searchResult = results;
        this.showSearchResults();
        this.mainContainer.setLoading(false);
    }
});

Ext.define('Doc', {
    extend: 'Ext.data.Model',
        fields: [
            {name: 'label', type: 'string'},
            {name: 'searchConfig', type: 'integer'}
        ]
});
Ext.define('Response', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'docs', type: 'Doc'}
    ]
});
