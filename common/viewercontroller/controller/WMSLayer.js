/* 
 * Copyright (C) 2012 Expression project.organizatio is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * Abstract component to for WMS Layers
  *@author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define("viewer.viewercontroller.controller.WMSLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    constructor : function (config){
        viewer.viewercontroller.controller.WMSLayer.superclass.constructor.call(this, config);
        this.type=viewer.viewercontroller.controller.Layer.WMS_TYPE;
        this.url = config.options.url;  
    },
    
    getLegendGraphic : function () {
        var url = this.url;
        var character = url.indexOf("?") == -1 ? "?" : "&";
        if(url.substring(url.length) != character){
            url += character;
        }
        var request = url + "request=GetLegendGraphic&layer="+this.getAppLayerName()+"&version=1.1.1&format=image/png";
        return request;
    }
});

