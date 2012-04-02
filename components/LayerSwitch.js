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
 * LayerSwitch component
 * Creates a LayerSwitch component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.LayerSwitch",{
    extend: "viewer.components.Component",
    container: null,
    config: {
    },
    constructor: function (conf){        
        viewer.components.LayerSwitch.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.loadComponent();
        return this;
    },
    loadComponent : function (){
        Ext.create('Ext.button.Cycle', {
            showText: true,
            prependText: 'View as ',
            renderTo: Ext.getBody(),
            menu: {
                id: 'view-type-menu',
                items: [{
                    text: 'text only',
                    iconCls: 'view-text',
                    checked: true
                },{
                    text: 'HTML',
                    iconCls: 'view-html'
                }]
            },
            changeHandler: function(cycleBtn, activeItem) {
            }
        });
    },
    getExtComponents: function() {
        return [];
    }
});
