/* 
 * Copyright (C) 2011-2013 B3Partners B.V.
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

Ext.define("vieweradmin.components.Menu", {
    singleton: true,
    menuCreated: false,
    activeLink: null,
    constructor: function() {
        Ext.onReady(function() {
            this.initMenu();
        }, this);
    },
    initMenu: function() {
        var menu = Ext.select('.menu-level1', true);
        if(menu) {
            menu.on('click', function(e, el, o) {
                Ext.select('.menu-level1').removeCls('menuclicked');
                Ext.get(this).addCls('menuclicked');
            });
        }
        this.menuCreated = true;
        if(this.activeLink !== null) {
            this.setActiveLink(this.activeLink);
        }
    },
    setActiveLink: function(activelink) {
        if(!activelink) {
            return;
        }
        if(!this.menuCreated) {
            this.activeLink = activelink;
            return;
        }
        var menuItem = Ext.get(activelink);
        if(menuItem) {
            menuItem.addCls('active');
            menuItem.findParent('.menu-level1', 10, true).addCls('menuclicked');
            var parent = menuItem.parent().parent();
            if(parent && parent.hasCls('dropdownmenu')) {
                Ext.get('dropdownmenulink').addCls('active');
            }
        }
    }
});