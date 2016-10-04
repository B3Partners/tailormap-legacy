/* 
 * Copyright (C) 2012-2016 B3Partners B.V.
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

/**
 * In debug mode this definition triggers an error from Ext,
 * seems like a bug that has been solved but maybe not in the GPL version of Ext yet
 * http://www.sencha.com/forum/showthread.php?283775-Cannot-subclass-a-Model-properly
 * For now we used the 'fields' config option in the store instead of a model

Ext.define('Doc', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'label', type: 'string' },
        { name: 'searchConfig', type: 'integer' }
    ]
});

 */

Ext.define ("viewer.components.Search",{
    extend: "viewer.components.Component",
    form: null,
    mainContainer: null,
    searchResult: null,
    results: null,
    margin: "0 5 0 0",
    autosuggestStore:null,
    searchField:null,
    searchName:null,
    resultPanelId: '',
    defaultFormHeight: MobileManager.isMobile() ? 100 : 90,
    searchRequestId: 0,
    onlyUrlConfig:null,
    currentSeachId:null,
    dynamicSearchEntries:null,
    loadingContainer: null,
    showSearchButtons: true,
    simpleSearchResults: false,
    searchFieldTriggers: null,
    config:{
        title: null,
        iconUrl: null,
        tooltip: null,
        searchconfigs: null,
        formHeight:null,
        label: "",
        //not yet configurable:
        showRemovePin: true,
        details: {
            minWidth: 400,
            minHeight: 400
        }
    },    
    constructor: function (conf){
        conf.details.useExtLayout = true;
        this.initConfig(conf);
		viewer.components.Search.superclass.constructor.call(this, this.config);
        this.renderButton(); 
        var notUrlConfigs = new Array();
        this.onlyUrlConfig = new Array();
        if(this.config.searchconfigs === null) {
            this.config.searchconfigs = [];
        }
        for(var i = 0 ; i < this.config.searchconfigs.length ;i++){
            var config = this.config.searchconfigs[i];
            if(Ext.isDefined(config.urlOnly) && config.urlOnly ){
                this.onlyUrlConfig.push(config);
            }else{
                notUrlConfigs.push(config);
            }
        }
        this.searchconfigs = notUrlConfigs; 
        this.currentSeachId = this.searchconfigs.length > 0 ? this.searchconfigs[0].id : null; 
        this.dynamicSearchEntries = new Array();
        this.loadWindow();
        return this;
    },
    renderButton: function() {
        var me = this;
        viewer.components.Search.superclass.renderButton.call(this,{
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label,
            handler: function() {
                me.popup.show();
                if(me.searchField) {
                    me.searchField.focus();
                }
            }
        });
    },
    loadWindow : function(){
        var me = this;
        if(this.form){
            this.form.destroy();
        }
        this.form = Ext.create("Ext.form.Panel",{
            frame: false,
            height: this.config.formHeight || this.defaultFormHeight,
            items: this.getFormItems(),
            border: 0,
            style: { 
                padding: '5px 10px 0px 10px'
            }
        });
        this.resultPanelId = Ext.id();

        var options = {
            itemId: this.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            items: [ this.form, {
                itemId: this.name + 'ContentPanel',
                xtype: "container",
                autoScroll: true,
                // width: '100%',
                flex: 1,
                html: '<div id="' + me.resultPanelId + '" style="width: 100%; height: 100%; padding: 0px 10px 0px 10px;"></div>'
            }]
        };
        if(!this.config.isPopup) {
            options.title = this.config.title;
            options.bodyPadding = '10 0 10 0';
            options.renderTo = this.getContentDiv();
        } else {
            options.items.push({
                itemId: this.name + 'ClosingPanel',
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
        this.mainContainer = Ext.create(this.config.isPopup ? 'Ext.container.Container' : 'Ext.panel.Panel', options);
        if(this.config.isPopup) {
            this.popup.getContentContainer().add(this.mainContainer);
        }
        this.form.query("#cancel"+ this.name)[0].setVisible(false);
        this.loadingContainer = Ext.ComponentQuery.query('#' + this.name + 'ContentPanel')[0];
    },
    getFormItems: function(){
        var me = this;
        var itemList = new Array();
        if (this.searchconfigs) {
            var configs = Ext.create('Ext.data.Store', {
                fields: ['id', 'name', 'url'],
                data: this.searchconfigs
            });
            this.searchName = Ext.create('Ext.form.ComboBox',{
                fieldLabel: 'Zoek op',
                store: configs,
                queryMode: 'local',
                hidden: this.searchconfigs.length === 1,
                displayField: 'name',
                valueField: 'id',
                margin:"0 5 5 0 ",
                anchor: '100%',
                emptyText: 'Maak uw keuze',
                name: 'searchName' + this.name,
                itemId: 'searchName' + this.name,
                listeners: {
                    change: {
                        fn: function(combo, newValue) {
                            this.searchConfigChanged(newValue);
                        },
                        scope: this
                    }
                }
            });
            itemList.push(this.searchName);
            if (this.searchconfigs.length> 0){
                var queryMode = 'local';
                var extraParams = {};
                if(this.searchconfigs.length === 1 && this.searchconfigs[0].type === "solr" ){
                    queryMode = "remote";
                    
                    extraParams["searchName"]=this.searchconfigs[0].id;
                    extraParams["appId"]=appId;
                    extraParams["componentName"]=this.name;
                }
                this.autosuggestStore = Ext.create('Ext.data.Store',  {
                    autoLoad: false,
                    fields: ['label', 'searchConfig', 'type'],
                    // model: 'Doc',
                    proxy: {
                        type: 'ajax',
                        url: actionBeans["autosuggest"],
                        extraParams: extraParams,
                        reader: {
                            type: 'json',
                            rootProperty: 'results'
                        }
                    }
                });
                var me = this;
                this.searchField = Ext.create( Ext.form.field.ComboBox,{ 
                    name: 'searchfield',
                    hideTrigger: me.searchFieldTriggers === null,
                    triggers: me.searchFieldTriggers === null ? {} : me.searchFieldTriggers,
                    flex:1,
                    anchor: '100%',
                    triggerAction: 'query',
                    queryParam: "searchText",
                    autoSelect:false,
                    displayField: "label",
                    queryMode: queryMode,
                    itemId: 'searchfield' + this.name,
                    minChars: 2,
                    listConfig:{
                        listeners:{
                            itemclick:function(list, node){
                                this.searchHighlightedSuggestion(node);
                            },
                            scope:me
                        }
                    },
                    listeners: {
                        specialkey: function(field, e){
                            if (e.getKey() === e.ENTER) {
                                var item = null;
                                if(field.picker && field.picker.highlightedItem){
                                    item = field.picker.highlightedItem;
                                }
                                if(!item){
                                    me.search();
                                }
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
                    selectHighlighted: function() {
                        if(!this.record) {
                            me.search();
                            return;
                        }
                        //If an item is selected, the user did that. So go directly to that result. Otherwise search with the user typed string
                        me.searchHighlightedSuggestion(this.record);
                    }
                });
                
                var searchFieldAndButton = Ext.create('Ext.container.Container', {
                    width: '100%',
                    height: 30,
                    layout: {
                        type: this.showSearchButtons ? 'hbox' : 'fit'
                    },
                    autoScroll: true,
                    items: [this.searchField,{
                            xtype: 'button',
                            text: 'Zoeken',
                            componentCls: 'mobileLarge',
                            margin: this.margin,
                            width: 60,
                            hidden: !this.showSearchButtons,
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
            itemId: 'cancel'+ this.name,
            hidden: !this.showSearchButtons,
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
            itemId: 'removePin'+ this.name,
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
    searchHighlightedSuggestion: function(node){
        var data = node.raw !== undefined ? node.raw : node.data;
        this.searchField.setValue(data.originalLabel || data.label);
        this.handleSearchResult(data);
        this.searchField.collapse();
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
        var searchText = Ext.ComponentQuery.query( "#searchfield" + this.name)[0].getValue();
        var searchName = '';
        if(this.searchconfigs.length === 1){
            searchName = this.searchconfigs[0].id;
        }else{
            searchName = this.form.query("#searchName" + this.name)[0].getValue();
        }
        
        if(searchName !== null && searchText !== ""){
            this.executeSearch(searchText, searchName);
            this.form.query("#cancel"+ this.name)[0].setVisible(true);
        } else {
            Ext.MessageBox.alert("Foutmelding", "Alle velden dienen ingevuld te worden.");
            // search request is not complete
        }        
    },
    executeSearch: function(searchText, searchName) {
        var requestPath=  contextPath+"/action/search";
        this.searchResult = new Array();
        if (this.getCurrentSearchType() === "simplelist") {
            this.simpleListSearch(searchText);
        } else if (this.getCurrentSearchType() === "dynamic") {
            
            var config = this.getCurrentSearchconfig();
            for (var i = 0; i < this.dynamicSearchEntries.length; i++) {
                var entry = this.dynamicSearchEntries[i];
                if(entry.id === config.id){
                    var returnValue = entry.callback(searchText, this.searchRequestId);
                    if (returnValue.success) {
                        var results = returnValue.results;
                        for (var j = 0; j < results.length; j++) {
                            var result = results[j];
                            if (result) {
                                result.searchType = "Dynamic";
                                this.searchResult.push(result);
                            }
                        }
                        this.showSearchResults();
                    } else {
                        this.config.viewerController.logger.warning("Search component yielded error: " + returnValue.errorMessage);
                    }
                }
            }
        }else{
            var requestParams = {};
            requestParams["searchText"]= searchText;
            requestParams["searchName"]= searchName;
            requestParams["appId"]= appId;
            requestParams["componentName"]= this.name;
            requestParams["searchRequestId"]= this.searchRequestId;
            this.getExtraRequestParams(requestParams,searchName);
            var me = this;
            me.loadingContainer.setLoading({
                msg: 'Bezig met zoeken'
            });
            Ext.Ajax.request({
                url: requestPath,
                params: requestParams,
                success: function(result, request) {
                    var response = Ext.JSON.decode(result.responseText);
                    if (response.error) {
                        Ext.MessageBox.alert("Foutmelding", response.error);
                    }
                    if (me.searchRequestId === parseInt(response.request.searchRequestId)&& response.results) {
                        me.searchResult = me.searchResult.concat(response.results);
                        me.showSearchResults();
                        if (response.limitReached && me.results) {
                            me.results.setTitle(me.results.title + " (Maximum bereikt. Verfijn zoekopdracht)");
                        }
                    }
                    me.loadingContainer.setLoading(false);
                },
                failure: function(result, request) {
                    var response = Ext.JSON.decode(result.responseText);
                    Ext.MessageBox.alert("Foutmelding", response.error);
                    me.loadingContainer.setLoading(false);
                }
            });
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
        this.form.query("#cancel"+ this.name)[0].setVisible(false);
        if(me.simpleSearchResults) {
            me.showResultsPicker();
            return;
        }
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
                if(!this.groupedResult.hasOwnProperty(key)) {
                    continue;
                }
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
            if(this.config.isPopup) {
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
            itemId: "searchButton_" + index,
            listeners: {
                click: {
                    scope: me,
                    fn: function(button, e, eOpts) {
                        var config = this.searchResult[button.itemId.split("_")[1]];
                        me.handleSearchResult(config);
                    }
                }
            }
        };
        return item;
    },
    showResultsPicker: function() {
        this.autosuggestStore.removeAll();
        if (Ext.isDefined(this.searchResult) && this.searchResult.length) {
            var searchResults = [],
                result = null;
            for(var i = 0; i < this.searchResult.length; i++) {
                result = this.searchResult[i];
                if(result.hasOwnProperty('type')) {
                    result.originalLabel = result.label;
                    result.label += ' (' + result.type + ')';
                }
                searchResults.push(result);
            }
            this.autosuggestStore.add(searchResults);
            this.searchField.expand();
        }
    },
    cancel: function(){
        this.searchField.setValue("");
        if (this.searchName) {
            this.searchName.setValue("");
        }
        this.loadingContainer.setLoading(false);
        this.form.query("#cancel" + this.name)[0].setVisible(false);
        this.results.destroy();
    },
    removePin: function(){
        this.config.viewerController.mapComponent.getMap().removeMarker("searchmarker");
        this.form.query("#removePin"+ this.name)[0].setVisible(false);
    },
    handleSearchResult : function(result){

        result.x = (result.location.maxx + result.location.minx) / 2;
        result.y = (result.location.maxy + result.location.miny) / 2;
        this.config.viewerController.mapComponent.getMap().zoomToExtent(result.location);
        this.config.viewerController.mapComponent.getMap().removeMarker("searchmarker");
        this.config.viewerController.mapComponent.getMap().setMarker("searchmarker",result.x,result.y,"marker");
        
        var type = this.getCurrentSearchType(result);
        if(type === "solr"){
            
            var searchconfig = this.getCurrentSearchconfig();
            if(searchconfig ){
                var solrConfig = searchconfig.solrConfig[result.searchConfig];
                var switchOnLayers = solrConfig.switchOnLayers;
                if(switchOnLayers){
                    var selectedContentChanged = false;
                    for(var i = 0 ; i <switchOnLayers.length ;i++){
                        var appLayerId = switchOnLayers[i];
                        var appLayer = this.config.viewerController.app.appLayers[appLayerId];
                        if(appLayer === undefined){
                            continue;
                        }
                        // Suppress logmessages for non-existing layers
                        var logLevel = this.config.viewerController.logger.logLevel;
                        this.config.viewerController.logger.logLevel = viewer.components.Logger.LEVEL_ERROR;
                        var layer = this.config.viewerController.getLayer(appLayer);
                        this.config.viewerController.logger.logLevel = logLevel;
                        if(!layer){
                            var level = this.config.viewerController.getAppLayerParent(appLayerId);
                            if(!this.config.viewerController.doesLevelExist(level)){ 
                                this.config.viewerController.app.selectedContent.push({
                                    id: level.id,
                                    type: "level"
                                });
                            }
                            selectedContentChanged = true;
                            layer = this.config.viewerController.createLayer(appLayer);
                        }
                        this.config.viewerController.setLayerVisible(appLayer,true);
                        
                    }
                    if(selectedContentChanged){
                        this.config.viewerController.fireEvent(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE);
                    }
                }
            }
        }
        
        if(this.config.isPopup) {
            this.hideWindow();
        }
        if (this.config.showRemovePin){
            this.form.query("#removePin"+ this.name)[0].setVisible(true);
        }
    },
    getExtComponents: function() {
        var c = [ this.mainContainer.getId(), this.form.getId() ];
        if(this.results) c.push(this.results.getId());
        return c;
    },
    
    searchConfigChanged: function(searchConfig){
        this.currentSeachId = searchConfig;
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
        if(searchConfig === "" && this.searchconfigs.length === 1){
            this.searchConfigChanged(this.searchconfigs[0].id);
        }
    },
    getCurrentSearchType: function(clickedResult) {
        var config = this.getCurrentSearchconfig();
        if(clickedResult && clickedResult.searchType){
            return clickedResult.searchType;
        }else if (config) {
            return config.type;
        } else {
            return null;
        }
    },
    getCurrentSearchconfig :function(){
        var config = this.getSearchconfigById(this.currentSeachId);
        return config;
    },
    getSearchconfigById:function(id){
        for (var j = 0; j < this.onlyUrlConfig.length; j++) {
            if (this.onlyUrlConfig[j].id === id) {
                return this.onlyUrlConfig[j];
            }
        }
        
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
        var appLayers = this.config.viewerController.getVisibleLayers();
        params["visibleLayers"] = appLayers.join(", ");
    },
    getExtraRequestParams:function(params, type){
        if(this.getCurrentSearchType() === "solr"){
            var appLayers = this.config.viewerController.getVisibleLayers();
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

        this.searchResult = this.searchResult.concat(results);
        this.showSearchResults();
        this.loadingContainer.setLoading(false);
    },
    loadVariables: function(param){
        var searchConfigId = param.substring(0,param.indexOf(":"));
        var term = param.substring(param.indexOf(":") +1, param.length);
        var config = this.getSearchconfigById(searchConfigId);
        
        this.searchField.setValue(term);
        if(!config.urlOnly){
            this.searchName.setValue(searchConfigId);
        }else{
            this.searchConfigChanged(searchConfigId);
        }
        var me = this;
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_LAYERS_INITIALIZED, function() {
            me.executeSearch(term, config.id);
            if (config.urlOnly) {
                me.searchName.setValue("");
            }
        }, this);
        return;
    },
    /**
     * Register the calling component for providing extra searchentries.
     * @param {type} obj An object containing the instance (available with .instance) of the caller ("this" at the calling method), and the title of the searchconfiguration (available with .title). 
     * @param {type} callback The callbackfunction which must be called by the search component
     */
    addDynamicSearchEntry : function(obj, callback){
        var component = obj.instance;
        var entry = {
            component:component,
            callback: callback,
            id: component.name
        };
        this.dynamicSearchEntries.push(entry);
        this.searchconfigs.push({
            id: component.name,
            name: obj.title,
            type: "dynamic",
            url: null,
            urlOnly: false
        });
        this.currentSeachId = component.name;
        this.loadWindow();
    },
    /**
     * Remove the given component for providing dynamic search sentries
     * @param {type} component The component for which the callback must be removed.
     * @returns {undefined}
     */
    removeDynamicSearchEntry: function (component){
        for (var i = this.dynamicSearchEntries.length -1 ; i >= 0 ; i--){
            if(this.dynamicSearchEntries[i].component.name === component.name ){
                this.dynamicSearchEntries.splice(i, 1);
            }
        }
        
        for (var i = this.searchconfigs.length -1 ; i >= 0 ; i--){
            if(this.searchconfigs[i].id === component.name ){
                this.searchconfigs.splice(i, 1);
            }
        }
    }
});
