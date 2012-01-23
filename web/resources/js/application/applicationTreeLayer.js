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

Ext.Loader.setConfig({enabled:true});
Ext.require([
    'Ext.tree.*',
    'Ext.data.*',
    'Ext.tab.*',
    'Ext.panel.*'
]);

Ext.onReady(function() {
    var tabconfig = [{
        contentEl:'rights-tab', 
        title: 'Rechten'
    },{
        contentEl:'attributes-tab', 
        title: 'Attributen'
    },{
        contentEl:'settings-tab', 
        title: 'Instellingen'
    },{
        contentEl:'edit-tab', 
        title: 'Edit'
    },{
        contentEl:'filter-tab', 
        title: 'Selectie/Filter'
    }];

    Ext.createWidget('tabpanel', {
        renderTo: 'tabs',
        width: '100%',
        activeTab: 0,
        defaults :{
            bodyPadding: 10
        },
        layoutOnTabChange: true,
        items: tabconfig
    });
});
