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
    defaultFormHeight: MobileManager.isMobile() ? 80 : 70,
    searchRequestId: 0,
    config:{
        title: null,
        iconUrl: null,
        tooltip: null,
        searchconfigs: null,
        formHeight:null,
        label: "",
        //not yet configurable:
        showRemovePin: true
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

        var options = {
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
            items: [ this.form, {
                id: this.name + 'ContentPanel',
                xtype: "container",
                autoScroll: true,
                width: '100%',
                flex: 1,
                html: '<div id="' + me.resultPanelId + '" style="width: 100%; height: 100%; padding: 0px 10px 0px 10px;"></div>'
            }]
        };
        if(!this.isPopup) {
            options.title = this.config.title;
            options.bodyPadding = '10 0 10 0';
        } else {
            options.items.push({
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
            });
        }
        this.mainContainer = Ext.create(this.isPopup ? 'Ext.container.Container' : 'Ext.panel.Panel', options);
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
    },
    getFormItems: function(){
        var me = this;
        var itemList = new Array();     
        if(this.searchconfigs ){
            if (this.searchconfigs.length > 1 ){
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
                var me = this;
                this.searchField = Ext.create( Ext.form.field.ComboBox,{ 
                    name: 'searchfield',
                    hideTrigger: true,
                    flex:1,
                    anchor: '100%',
                    triggerAction: 'query',
                    queryParam: "searchText",
                    autoSelect:false,
                    displayField: "label",
                    queryMode: queryMode,
                    id: 'searchfield' + this.name,
                    minChars: 2,
                    listConfig:{
                        listeners:{
                            itemclick:function(list, node){
                                var data = node.data !== undefined ? node.data : node.raw;
                                var label = data.label;
                                me.searchField.setValue(label);
                                me.search();
                            },
                        scope:me
                        }
                    },
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
                Ext.view.BoundListKeyNav.override({
                    selectHighlighted: function(e) {
                        var item = this.boundList.highlightedItem;
                        if (item) {
                            this.callOverridden(e); // If an item is selected, the user did that. So use that for searching. Otherwise search with the user typed string
                        }
                        me.search();
                    }
                });
                
                var searchFieldAndButton = Ext.create('Ext.container.Container', {
                    width: '100%',
                    height: 30,
                    layout: {
                        type: 'hbox'
                    },
                    autoScroll: true,
                    items: [this.searchField,{
                            xtype: 'button',
                            text: 'Zoeken',
                            componentCls: 'mobileLarge',
                            margin: this.margin,
                            width: 60,
                            listeners: {
                                click: {
                                    scope: this,
                                    fn: this.search
                                }
                            }
                        }]
                });
                itemList.push(searchFieldAndButton);
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
        //remove pin button
        itemList.push({
            xtype: 'button',
            text: 'Verwijder marker',
            margin: this.margin,
            componentCls: 'mobileLarge',
            name: 'removePin',
            id: 'removePin'+ this.name,
            hidden: true,
            listeners: {
                click: {
                    scope: this,
                    fn: this.removePin
                }
            }
            
        });
        return itemList;
    },
    hideWindow : function(){
        this.searchField.collapse();
        this.popup.hide();
    },
    search : function(){
        this.searchRequestId++;
        if(this.results != null){
            this.results.destroy();
        }
        this.searchField.getPicker().hide();
        var searchText = Ext.getCmp( "searchfield" + this.name).getValue();
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
                Ext.getCmp(this.name + 'ContentPanel').setLoading({
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
                        if (me.searchRequestId===parseInt( response.request.searchRequestId)){
                            me.showSearchResults();
                            if(response.limitReached){
                                me.results.setTitle (me.results.title + " (Maximum bereikt. Verfijn zoekopdracht)");
                            }
                        }
                        Ext.getCmp(me.name + 'ContentPanel').setLoading(false);
                    },
                    failure: function(result, request) {
                        var response = Ext.JSON.decode(result.responseText);
                        Ext.MessageBox.alert("Foutmelding", response.error);
                        Ext.getCmp(me.name + 'ContentPanel').setLoading(false);
                    }
                });
            }
            this.form.getChildByElement("cancel"+ this.name).setVisible(true);
        } else {
            Ext.MessageBox.alert("Foutmelding", "Alle velden dienen ingevuld te worden.");
            // search request is not complete
        }        
    },
    groupedResult : null,
    showSearchResults : function(){
        var html = "";
        if (!Ext.isDefined(this.searchResult)) {
            html = "<div style=\"padding: 10px; \">Fout bij het zoeken.</div>";
        }
        if (Ext.isDefined(this.searchResult) && this.searchResult.length <= 0) {
            html = "<div style=\"padding: 10px;\">Er zijn geen resultaten gevonden.</div>";
        }
        var me = this;
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
        var panelList = [{
                xtype: 'panel', // << fake hidden panel
                hidden: true,
            collapsed: false
        }];
        this.groupedResult = new Object();
        if (Ext.isDefined(this.searchResult)) {
            for (var i = 0; i < this.searchResult.length; i++) {
                var result = this.searchResult[i];
                this.addResult(result, i);
            }

            for (var key in this.groupedResult) {
                var list = this.groupedResult[key];
                var subSetPanel = Ext.create('Ext.panel.Panel', {
                    title: key + " (" + list.length + ")",
                    flex: 1,
                    height: 200,
                    autoScroll: true,
                    collapsible: true,
                    collapsed: true,
                    style: {
                        padding: '0px 0px 10px 0px'
                    },
                    items: list
                });
                panelList.push(subSetPanel);
            }

        }
        me.results = Ext.create('Ext.panel.Panel', {
            title: 'Resultaten (' +( Ext.isDefined(this.searchResult) ? this.searchResult.length : 0 )+ ') :',
            renderTo: this.resultPanelId,
            html: html,
            height: '100%',
            width: '100%',
            layout:{
                type: 'accordion',
                titleCollapse: true,
                animate: true,
                flex:1,
                height: 300,
                multi:true
            },
            autoScroll: false,
            style: { 
                padding: '0px 0px 10px 0px'
            },
            items: panelList
        });
        if(this.searchResult && this.searchResult.length === 1){
            this.handleSearchResult(this.searchResult[0]);
        }else{
            if(this.isPopup) {
                this.popup.show();
            }
        }
        
    },
    addResult : function(result,index){
        var type = result.type;
        if(!this.groupedResult.hasOwnProperty(type)){
            this.groupedResult[type] = new Array()
        }
        var item = this.createResult(result,index);
        this.groupedResult[type].push(item);
    },
    createResult: function(result, index){
        var me = this;
        var item = {
            text: result.label,
            xtype: 'button',
            componentCls: 'searchResultButton',
            tooltip: 'Zoom naar locatie',
            id: "searchButton_" + index,
            listeners: {
                click: {
                    scope: me,
                    fn: function(button, e, eOpts) {
                        var config = this.searchResult[button.id.split("_")[1]];
                        me.handleSearchResult(config);
                    }
                }
            }
        };
        return item;
    },
    cancel: function(){
        this.searchField.setValue("");
        this.form.getChildByElement("searchName"+ this.name).setValue("");
        this.form.getChildByElement("cancel"+ this.name).setVisible(false);
        this.results.destroy();
    },
    removePin: function(){
        this.viewerController.mapComponent.getMap().removeMarker("searchmarker");
        this.form.getChildByElement("removePin"+ this.name).setVisible(false);
    },
    handleSearchResult : function(config){

        config.x = (config.location.maxx + config.location.minx) / 2;
        config.y = (config.location.maxy + config.location.miny) / 2;
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
                    var selectedContentChanged = false;
                    for(var i = 0 ; i <switchOnLayers.length ;i++){
                        var appLayerId = switchOnLayers[i];
                        var appLayer = this.viewerController.app.appLayers[appLayerId];
                        var layer = this.viewerController.getLayer(appLayer);
                        if(!layer){
                            var level = this.viewerController.getAppLayerParent(appLayerId);
                            this.viewerController.app.selectedContent.push({
                                id: level.id,
                                type: "level"
                            });
                            selectedContentChanged = true;
                            layer = this.viewerController.createLayer(appLayer);
                        }
                        this.viewerController.setLayerVisible(appLayer,true);
                        
                    }
                    if(selectedContentChanged){
                        this.viewerController.fireEvent(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE);
                    }
                }
            }
        }
        
        if(this.isPopup) {
            this.hideWindow();
        }
        if (this.showRemovePin){
            this.form.getChildByElement("removePin"+ this.name).setVisible(true);
        }
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
        if(this.searchconfigs.length > 1){
            var combo = Ext.getCmp('searchName' + this.name);
            var value = combo.getValue();
            var config = this.getSearchconfigById(value);
            return config;
        }else{
            return this.searchconfigs[0];
        }
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
        var values = config.simpleSearchConfig;
        term = term.toLowerCase();
        var results = new Array();
        for(var i = 0 ; i < values.length; i++){
            var entry = values[i];
            var value = Ext.isEmpty (entry.value ) ? entry.label : entry.value;
            value = value.toLowerCase();
            if(value.indexOf(term) !== -1){
                var result = {
                    label : entry.label,
                    location:entry.bbox,
                    type: config.name
                };
                results.push(result);
            }
        }

        this.searchResult = results;
        this.showSearchResults();
        Ext.getCmp(this.name + 'ContentPanel').setLoading(false);
    },
    loadVariables: function(param){
        var searchConfig = param.substring(0,param.indexOf(":"));
        var term = param.substring(param.indexOf(":") +1, param.length);
        this.form.getChildByElement("searchName" + this.name).setValue(searchConfig);
        
        this.form.getChildByElement("searchfield" + this.name).setValue(term);
        var me = this;
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, function() {
            me.search();
        }, this);
        return;
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
