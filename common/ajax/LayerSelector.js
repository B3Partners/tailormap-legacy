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
    config: {
        viewerController: new Object(),
        restriction : null
    }, 
    constructor: function (conf){        
        this.initConfig(conf);   
        var layers = Ext.create('Ext.data.Store', {
            fields: ['id', 'title','layer'],
            data : []
        });

        this.combobox = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Kies kaartlaag',
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
        var me = this;
        Ext.Ajax.request({ 
            url: requestPath, 
            params: requestParams, 
            success: function ( result, request ) {
                me.layerList = Ext.JSON.decode(result.responseText);
                me.initLayers();
            },
            failure: function(a,b,c) {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden weergegeven");
            }
        });
       
        return this;
    },
    initLayers : function (){
        this.layerArray = new Array();
        var store = this.combobox.getStore();
        for (var i = 0 ; i < this.layerList.length ;i++){
            var l = this.layerList[i];
            l.title = l.titleAlias || l.title ;
            l.layer = l;
            store.add(l);
        }
        
    },
    changed :function (combobox,item,previousSelected){
        this.fireEvent(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,item,previousSelected,this);
    },
    getValue : function (){
        return this.combobox.getValue();
    }
});