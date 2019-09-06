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
/* global Ext, i18next */

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
    setStyle: function(name){
        Ext.Error.raise({msg: i18next.t('viewer_viewercontroller_controller_wmslayer_0')});
    },
    /** 
     * Get info as specified by ViewerController.getLayerLegendInfo()  
     * @see viewer.viewercontroller.controller.Layer#getLayerLegendInfo
     */
    getLayerLegendInfo: function(success, failure) {
        // XXX service may not support GETLEGENDGRAPHIC
        var name=this.id;
        var serviceId = 0;
        if (this.appLayerId){
            var appLayer=this.config.viewerController.getAppLayerById(this.appLayerId);
            name=appLayer.alias;
            serviceId = appLayer.serviceId;
        }
        success({
            name: name,
            parts: [
                {
                    serviceId: serviceId,
                    //label: no label? only one per layer for WMS.
                    url: this.getLegendGraphic() 
                }
            ]
            
        });
    },
    
    getLegendGraphic : function () {
        
        var query = {
            "REQUEST": "GetLegendGraphic",
            "LAYER": this.getAppLayerName(),
            "VERSION": "1.1.1",
            "STYLE": this.getStyle(),
            "FORMAT": "image/png"
        };
        
        if(this.getOption("sld")) {
            query["SLD"] = this.getOption("SLD");
        }
        if(this.getOption("sld_body")) {
            query["SLD_BODY"] = this.getOption("SLD_BODY");
        }
        if(this.config.sldLegendStyle) {
            query["STYLE"] = this.config.sldLegendStyle;
        }
        if(this.config.extraLegendParameters) {
            Ext.Object.merge(query, this.config.extraLegendParameters);
        }
        
        url = Ext.urlAppend(this.url, Ext.Object.toQueryString(query));

        return url;
    }
});

