/* 
 * Copyright (C) 2016 B3Partners B.V.
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
 * Disclaimer component
 * Creates a disclaimer component: a popup which opens at the start of the application. Can be hidden via a checkbox.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Disclaimer",{
    extend: "viewer.components.Component",
    localStorageKey: null,
    config: {
        text: "",
        title: ""
    },
    constructor: function (conf){
        this.initConfig(conf);
        this.localStorageKey = ["hideDisclaimer", this.config.viewerController.getApplicationName(), "v", this.config.viewerController.getApplicationVersion()].join("_");
        viewer.components.Disclaimer.superclass.constructor.call(this, this.config);
        if (viewer.components.LocalStorage.getItem(this.localStorageKey) !== true) {
            this.openWindow();
        }
        return this;
    },
    openWindow : function(){
        this.window = Ext.create('Ext.window.Window', {
            title: this.config.title,
            height: 400,
            width: 400,
            layout: 'fit',
            html: this.config.text,
            listeners: {
                beforeclose: {
                    fn: this.onClose,
                    scope:this
                }
            },
            bbar: [
                {
                    xtype: 'checkbox', 
                    name: "dontshow",
                    id: "dontshow",
                    boxLabel: "Niet meer tonen"
                },
                {
                    xtype: "button",
                    text: "Ok",
                    listeners: {
                        click: {
                            fn: function () {
                                this.window.close();
                            },
                            scope: this
                        }
                    }
                }
            ]
                
            
        });
        this.window.show()
    },
    onClose : function(){
        var dontShow = Ext.getCmp("dontshow").getValue();
        viewer.components.LocalStorage.setItem(this.localStorageKey, dontShow);
    }
});