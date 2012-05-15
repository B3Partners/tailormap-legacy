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
 * LayerSelector
 * A generic component to retrieve the layers
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.LayerSelector",{
    extend: "viewer.components.Component",
    popupWin:null,
    layerList : null,
    layerArray : null,
    combobox : null,
    div: null,
    // An array of layers whom visibility must be forced in the layerSelector
    forcedLayers : null,
    config: {
        viewerController: new Object(),
        restriction : null,
        layers:null
    }, 
    constructor: function (conf){        
        this.initConfig(conf);   
        this.forcedLayers = new Array();
        var layers = Ext.create('Ext.data.Store', {
            fields: ['id', 'title','layer'],
            data : []
        });

        this.combobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Kies kaartlaag',
            emptyText:'Maak uw keuze',
            store: layers,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'layer',
            listeners :{
                change:{
                    fn: this.changed,
                    scope: this
                }
            },
            renderTo: this.div
        });
        this.addEvents(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE);
        var requestPath= actionBeans["layerlist"];
        var requestParams = {};
        // TODO make layerselector so, that the layerselector can use a filtered list of layers
        requestParams[this.restriction]= true;
        requestParams["appId"]= appId;
        if(this.layers != null){
            requestParams["layers"]= this.layers;
            requestParams["hasConfiguredLayers"]= true;
            this.layerList = new Array();
            for ( var i = 0 ; i < this.layers.length ;i++){
                //xxxxxxx werkt niet meer
                var l = this.viewerController.getAppLayerById(this.layers[i]);
                if(l != null){
                    this.layerList.push(l);
                }
            }
        }else{
            var me = this;
            Ext.Ajax.request({ 
                url: requestPath, 
                params: requestParams, 
                success: function ( result, request ) {
                    me.layerList = Ext.JSON.decode(result.responseText);
                },
                failure: function(a,b,c) {
                    Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden weergegeven");
                }
            });
        }
        this.viewerController.mapComponent.getMap().registerEvent(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED, this.layerVisibilityChanged, this);
        return this;
    },
    /**
     * @param forcedLayer the application layer that needs to be forced
     */
    addForcedLayer : function (forcedLayer){
        var dupe = false;
        for ( var i = 0 ; i < this.forcedLayers.length; i++){
            if(this.forcedLayers[i] == forcedLayer){
                dupe = true;
                break;
            }
        }
        if(!dupe){
            this.forcedLayers.push(forcedLayer);
        }
    },
    removeForcedLayer : function (forcedLayer){
        for( var i = this.forcedLayers.length -1 ; i >= 0 ; i--){
            if(this.forcedLayers[i]==forcedLayer){
                this.forcedLayers.splice(i,1);
            }
        }
    },
    initLayers : function (){
        this.layerArray = new Array();
        var visibleLayers = this.viewerController.getVisibleLayers();
        for(var i = 0 ; i < this.forcedLayers.length; i++){
            visibleLayers.push(this.forcedLayers[i].id);
        }
        var store = this.combobox.getStore();
        store.removeAll();
        if(this.layerList != null){
            for (var i = 0 ; i < this.layerList.length ;i++){
                var l = this.layerList[i];
                for ( var j = 0 ; j < visibleLayers.length ;j++){
                    //var appLayer = this.viewerController.getAppLayerById(visibleLayers[j]);                    
                    if (visibleLayers[j] == l.id){                
                        store.add({
                            id: l.id,
                            title: l.alias || l.layerName,
                            layer: l
                        });
                    }
                }
            }
        }
    },
    changed :function (combobox,appLayer,previousSelected){
        // Retrieve appLayer from viewerController. Because the applayers in the comboBox are not the same as in the viewercontroller but copies. So by retrieving the ones
        // from the ViewerController you get the correct appLayer
        var al = this.viewerController.getAppLayerById(appLayer.id);
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,al,previousSelected,this);
    },
    getValue : function (){
        // Retrieve appLayer from viewerController. Because the applayers in the comboBox are not the same as in the viewercontroller but copies. So by retrieving the ones
        // from the ViewerController you get the correct appLayer
        var al = this.viewerController.getAppLayerById(this.combobox.getValue().id);
        return al;
    },
    setValue : function (appLayer){
        this.combobox.setValue(appLayer);
    },
    getSelectedAppLayer : function (){
        var layerObj = this.getValue();
        if (layerObj==null){
            return null;
        }
        // Retrieve appLayer from viewerController. Because the applayers in the comboBox are not the same as in the viewercontroller but copies. So by retrieving the ones
        // from the ViewerController you get the correct appLayer
        var al = this.viewerController.getAppLayerById(layerObj.id);
        return al;
    },
    getExtComponents: function() {
        return [ this.combobox.getId() ];
    },
    layerVisibilityChanged : function (map,object){
        this.initLayers();
    }
});