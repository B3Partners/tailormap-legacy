/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
Ext.define ("viewer.components.MobileManager", {
    singleton: true,
    isMobile: function() {
        return Ext.os.deviceType !== "Desktop";
    },
    getOrientation: function() {
        if ((window.orientation && (window.orientation == 90 || window.orientation == -90)) || screen.width > screen.height) {
            return "landscape";
        }
        return 'portrait'
    }
});