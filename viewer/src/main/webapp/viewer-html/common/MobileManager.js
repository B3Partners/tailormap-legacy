/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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
Ext.define ("viewer.components.MobileManager", {
    singleton: true,
    qs: Ext.Object.fromQueryString(location.search),
    constructor: function() {
        Ext.onReady(function() {
            var body = Ext.getBody();
            if(!this.hasTouch()) {
                body.addCls("no-touch");
            }
            if(this.isMobile()) {
                body.addCls("flamingo-mobile");
            }
        }, this);
    },
    isMobile: function() {
        if(this.qs.hasOwnProperty("mobile") && this.qs.mobile === "true") {
            return true;
        }
        return Ext.os.deviceType !== "Desktop";
    },
    hasTouch: function() {
        return Ext.supports.Touch;
    },
    getOrientation: function() {
        if ((window.orientation && (window.orientation == 90 || window.orientation == -90)) || screen.width > screen.height) {
            return "landscape";
        }
        return 'portrait'
    }
});