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
        title: ""
    },
    constructor: function (conf){        
        this.initConfig(conf);   
        var con = document.createElement('div');
        con.style.height=  "100%";
        con.style.width=  "100%";
        this.popupWin = Ext.create('Ext.window.Window', {
            title: this.title || 'Titel',
            closable: true,
            closeAction: 'hide',
            width: 400,
            height: 600,
            layout: 'fit',
            modal: false,
            renderTo: Ext.getBody(),
            contentEl : con,
            autoScroll: true
        });
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
    }
});