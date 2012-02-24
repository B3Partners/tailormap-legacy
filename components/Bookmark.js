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
                name: 'compactlink'
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
        this.url = viewerController.getBookmarkUrl();
        this.form.getChildByElement("bookmark").setValue(this.url);
        this.popup.show();
    },
    hideWindow : function(){
        this.popup.hide();
    },
    addToFavorites : function(){
        if(Ext.firefoxVersion != 0){
            //window.sidebar.addPanel(this.title, this.url, "");
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