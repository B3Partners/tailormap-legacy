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

if(typeof MobileManager !== "undefined" && MobileManager.isMobile()) {
    Ext.override(Ext.form.field.ComboBox, {
        editable: false 
    });
    Ext.override(Ext.form.field.Trigger, {
        editable: false 
    });
}

Ext.override(Ext.form.field.HtmlEditor, 
    // Fix upside down question mark appearing
    // http://www.sencha.com/forum/showthread.php?79190-Mysterious-postdata-from-htmleditor
    { defaultValue: "" }
);

