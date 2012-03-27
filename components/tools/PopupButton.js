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
 * Popup component
 * Creates a button which activates the generic popup.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.PopupButton",{
    extend: "viewer.components.tools.JSButton",
    popup:null,
    
    config:{
        name: "zoomIn"
    },
    constructor: function (conf){        
        this.popup = conf.viewerController.layoutManager.popupWin;
        conf.toggle = true;
        conf.enabled = true;
        conf.visible = true;
        conf.selected = !this.popup.popupWin.isHidden() ||false ;
        viewer.components.tools.PopupButton.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me =this;
        this.popup.popupWin.addListener("show",function(){me.setSelectedState(true);},this);
        this.popup.popupWin.addListener("hide",function(){me.setSelectedState(false);},this);
        this.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,this.down, this);
        this.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,this.up, this);
        return this;
    },
    /**
     *  Handler for the down event on this button. Shows the popup window.
     **/
    down : function (button,comp){
        this.popup.show()
    },
    up : function (button,comp){
        this.popup.hide();
    }
});

