/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Ext */

Ext.define("viewer.components.BrowserCheck", {
    extend: "viewer.components.Component",
    
    unsupported: false,
    
    config: {
        showPopup: true,
        test: false,
        message: ___("De browser (of de versie ervan) die u gebruikt wordt mogelijk niet ondersteund. Deze website werkt het best met een recente, moderne browser."),
        title: i18next.t('viewer_components_browsercheck_0')
    },
    constructor: function (conf){
        this.initConfig(conf);
		viewer.components.BrowserCheck.superclass.constructor.call(this, this.config);
        
        this.unsupported = (Ext.isIE && Ext.ieVersion < 9)
            || (!Ext.isIE && !(Ext.isChrome || Ext.isGecko || Ext.isOpera || Ext.isWebkit || Ext.isSafari || Ext.isEdge));
        
        if((this.config.test || this.unsupported) && this.config.showPopup) {
            Ext.MessageBox.show({
                buttons: Ext.Msg.OK,
                msg: this.config.message,
                title: this.config.title,
                icon: Ext.window.MessageBox.WARNING
            });
        }
        
        return this;
    },
    
    getExtComponents: function() {
        return [  ];
    }
});
