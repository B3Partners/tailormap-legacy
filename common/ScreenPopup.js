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
 * ScreenPopup
 * A generic component to which can render itself
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.ScreenPopup",{
    popupWin:null,
    config:{
        title: "",
        showOnStartup: null,
        details:{
            x: 100,
            y: 100,
            width : 400,
            height: 600,
            changeablePosition:true,
            changeableSize:true,
            position : 'center'
        }
    },
    constructor: function (conf){
        this.initConfig(conf);   
        var con = document.createElement('div');
        con.style.height=  "100%";
        con.style["background"] = "#FFFFFF";
        con.style.width=  "100%";
        var config = {
            title: this.title || 'Titel',
            closable: true,
            closeAction: 'hide',
            width: parseInt(this.details.width),
            height: parseInt(this.details.height),
            resizable: Ext.JSON.decode(this.details.changeableSize),
            draggable: Ext.JSON.decode(this.details.changeablePosition),
            layout: 'fit',
            modal: false,
            renderTo: Ext.getBody(),
            contentEl : con,
            autoScroll: true
        };
        if(this.details.position == 'fixed'){
            config.x=parseInt(this.details.x);
            config.y=parseInt(this.details.y);
        }
        
        this.popupWin = Ext.create('Ext.window.Window', config);
        if(this.showOnStartup){
            this.popupWin.show();
        }
        if(config.draggable){
            this.popupWin.addListener("dragstart",this.disableBody,this);
            this.popupWin.addListener("dragend",this.enableBody,this);
        }
        if(config.resizable){
            this.popupWin.resizer.addListener("beforeresize",this.disableBody,this);
            this.popupWin.resizer.addListener("resize",this.enableBody,this);
        }
        return this;
    },
    getContentId : function (){
        return this.popupWin.contentEl.id
    },
    show : function(){
        this.popupWin.show();
    },
    hide : function(){
        this.popupWin.hide();
    },
    disableBody : function (){
        Ext.getBody().mask();
    },
    enableBody : function(){
        Ext.getBody().unmask()
    }
});