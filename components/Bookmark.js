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
 * Bookmark component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Bookmark",{
    extend: "viewer.components.Component",
    form: null,
    toc: null,
    map: null,
    basicUrl: "",
    otherParams: "",
    config:{
        title: "",
        titlebarIcon: "",
        tooltip: "",
        isPopup: true
    },
    constructor: function (conf){        
        viewer.components.Bookmark.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.loadButton();
        
        // check of alles is geladen
        this.map = viewerController.mapComponent.getMap();
        this.valuesFromURL(document.URL);
        
        this.loadWindow();
        return this;
    },
    loadButton : function(){
        Ext.create('Ext.Button', {
            renderTo: this.div,
            icon: this.titlebarIcon,
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
        this.form = new Ext.form.FormPanel({
            frame: false,
            items: [{ 
                xtype: 'textfield',
                fieldLabel: 'Bookmark',
                name: 'bookmark',
                value: this.url
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Compact link',
                name: 'compactlink'
            },{ 
                xtype: 'button',
                text: 'Toevoegen aan favorieten'
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
            renderTo: this.popup.getContentId()
        });
        
    },
    showWindow : function(){
        var url = this.basicUrl+"?";
        if(this.otherParams != ""){
            var params = this.otherParams.split(",");
            for( var i = 0; i < params.length; i++){
                if(params[i] != ""){
                    url += params[i]+"&";
                }
            }
        }
        
        var visLayers = viewerController.getVisibleLayerIds();
        if(visLayers.length != 0 ){
            url += "layers=";
            for(var i = 0 ; i < visLayers.length ; i++){
                if(i == visLayers.length-1){
                    url += visLayers[i]+"&";
                }else{
                    url += visLayers[i]+",";
                }
            }
        }
        
        var extent = this.map.getExtent();
        url += "extent=" + extent.minx +","+ extent.miny +","+ extent.maxx +","+ extent.maxy;

        this.form.child().setValue(url);
        this.popup.show();
    },
    hideWindow : function(){
        this.popup.hide();
    },
    valuesFromURL : function(url){
        var index = url.indexOf("?");
        this.basicUrl = url.substring(0,index);
        var params = url.substring(index +1);
        var parameters = params.split("&");
        for ( var i = 0 ; i < parameters.length ; i++){
            var parameter = parameters[i];
            var index2 = parameter.indexOf("=");
            var type = parameter.substring(0,index2);
            var value = parameter.substring(index2 +1);
            if(type == "layers"){
                var values = value.split(",");
                viewerController.setLayersVisible(values,true);
            }else if(type == "extent"){
                var coords = value.split(",");
                var newExtent = new Object();
                newExtent.minx=coords[0];
                newExtent.miny=coords[1];
                newExtent.maxx=coords[2];
                newExtent.maxy=coords[3];
                this.map.zoomToExtent(newExtent);
            }else{
                this.otherParams += ","+parameter;
            }
        }
    }
});