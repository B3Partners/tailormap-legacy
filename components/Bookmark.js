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
    url: "",
    compUrl: "",
    baseUrl: "",
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
                id: 'bookmark',
                value: this.url
            },{ 
                xtype: 'textfield',
                fieldLabel: 'Compact link',
                name: 'compactlink',
                id: 'compactlink'
            },{ 
                xtype: 'button',
                text: 'Toevoegen aan favorieten',
                listeners: {
                    click:{
                        scope: this,
                        fn: this.addToFavorites
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
    },
    showWindow : function(){
        var paramJSON = this.viewerController.getBookmarkUrl();
        var parameters = "";
        for ( var i = 0 ; i < paramJSON["params"].length ; i ++){
            var param = paramJSON["params"][i];
            if(param.name == 'url'){
                this.url = param.value;
                this.baseUrl = param.value;
            }else if(param.name == 'extent'){
                parameters += param.name +"=";
                var extent = param.value;
                parameters += extent.minx+","+extent.miny+","+extent.maxx+","+extent.maxy+"&";
            }else if(param.name == 'layers'){
                parameters += param.name +"=";
                var layers = param.value;
                for( var x = 0 ; x < layers.length ; x++){
                     parameters += layers[x]+","
                } 
                parameters +="&";
            }else if(param.name != 'selectedContent'){
                parameters += param.name +"="+ param.value +"&";
            }
        }
        
        this.url += parameters;

        var me = this;
        Ext.create("viewer.Bookmark").createBookmark(JSON.stringify(paramJSON),function(code){me.succesCompactUrl(code);},function(code){me.failureCompactUrl(code);});

        this.form.getChildByElement("bookmark").setValue(this.url);
        this.popup.show();
    },
    succesCompactUrl : function(code){
        this.compUrl = this.baseUrl+"bookmark="+code;
        this.form.getChildByElement("compactlink").setValue(this.compUrl);
    },
    failureCompactUrl : function(code){
        // 
    },
    hideWindow : function(){
        this.popup.hide();
    },
    addToFavorites : function(){
        if(Ext.firefoxVersion != 0){
            alert("This browser doesn't support this function.");
        }else if(Ext.ieVersion != 0){
            window.external.AddFavorite(this.url, this.title);
        }else if(Ext.chromeVersion != 0){
            alert("This browser doesn't support this function.");
        }else if(Ext.operaVersion != 0){
            alert("This browser doesn't support this function.");
        }else if(Ext.safariVersion != 0){
            alert("This browser doesn't support this function.");
        }
    }
});