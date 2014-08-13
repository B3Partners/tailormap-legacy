/* 
 * Copyright (C) 2012-2013 Geert Plaisier
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

Ext.define ("viewer.components.FlamingoCombobox", {
    alias: 'widget.flamingocombobox',
    constructor: function(conf) {
        /*
         * For now we are using the ExtJS combobox, because it has been updated
         * for mobile usage in ExtJS 5
         * 
        if(typeof MobileManager !== "undefined" && MobileManager.isMobile()) {
            return Ext.create('viewer.components.MobileCombobox', conf);
        } else {
            return Ext.create('Ext.form.ComboBox', conf);
        }
        */
       return Ext.create('Ext.form.ComboBox', conf);
    }
});