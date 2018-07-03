/*
 * Copyright (C) 2018 B3Partners B.V.
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
/* global Ext, contextPath, Proj4js */


Ext.define("viewer.components.ExternalLinks", {
    extend: "viewer.components.Component",
    menu: null,
    linkPrefix: "link",
    config: {
        urls: null
    },
    /**
     * @constructor
     */
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.ExternalLinks.superclass.constructor.call(this, this.config);
        var me = this;
        // Get control of the right-click event:
        document.oncontextmenu = function (e) {
            e = e ? e : window.event;
            me.openMenu(e);
            if (e.preventDefault)
                e.preventDefault(); // For non-IE browsers.
            else {
                return false; // For IE browsers.
            }
        };
        //TODO don't set SRS hardcoded        
        Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.237,50.0087,465.658,-0.406857,0.350733,-1.87035,4.0812 +units=m +no_defs";
        Proj4js.defs["EPSG:4236"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ";
        
        this.getViewerController().mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO,this.hideFired,this);

    },
    openMenu: function (e) {
        if (this.menu !== null) {
            this.menu.destroy();
        }
        var x = e.clientX;
        var y = e.clientY;
        this.createLinks(x,y);
        this.menu.showAt(x, y);
    },
    createLinks: function (x, y) {
        var links = [];
        for (var i = 0; i < this.config.urls.length; i++) {
            links.push(this.createLink(this.config.urls[i], i, x, y));
        }
        var me = this;
        this.menu = Ext.create("Ext.menu.Menu", {
            floating: true,
            items: links,
            listeners: {
                click: function (menu, item, e, opts) {
                    if (!item) {
                        return;
                    }
                    var url = item.config.url;
                    window.open(url, "_blank");
                },
                hide: {
                    scope: me,
                    fn: this.hideFired
                },
                scope: me
            }
        });
    },
    hideFired : function(){
        this.menu.hide();
    },
    createLink: function (link, index, x, y) {
        var hasCoordsInLink = link.url.indexOf("[") !== -1;
        var config = {
            id: this.linkPrefix + index,
            text: link.label,
            url: this.procesURL(link.url,x,y),
            icon: contextPath + (hasCoordsInLink ? "/resources/images/world_link.png" : "/resources/images/link.png")
        };
        return config;
    },
    procesURL: function (url, x, y) {
        var map = this.config.viewerController.mapComponent.getMap();
        var coord = map.pixelToCoordinate(x, y);
        coord.x = parseFloat(coord.x.toFixed(2));
        coord.y = parseFloat(coord.y.toFixed(2));
        var extent = map.getExtent();
        var dest = new Proj4js.Proj("EPSG:4236");
        var source = new Proj4js.Proj("EPSG:28992");
        var wgs = new Proj4js.Point(coord.x,coord.y);
        Proj4js.transform(source,dest,wgs);
        
        var currentVariables = {
            X: coord.x,
            Y: coord.y,
            MINX: extent.minx,
            MAXX: extent.maxx,
            MINY: extent.miny,
            MAXY: extent.maxy,
            X_WGS84: wgs.x.toFixed(7),
            Y_WGS84: wgs.y.toFixed(7),
            BBOX: extent.minx + "," + extent.miny+ "," + extent.maxx+ "," + extent.maxy
        };
        var newUrl = url;
        for (var key in currentVariables) {
            if (currentVariables.hasOwnProperty(key)) {
                var re = new RegExp("\\[" + key + "\\]", "g");
                newUrl = newUrl.replace(re, currentVariables[key]);
            }
        }
        url = newUrl;
        return url;
    }
});