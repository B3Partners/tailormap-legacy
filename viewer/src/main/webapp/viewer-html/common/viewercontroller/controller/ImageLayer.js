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
Ext.define("viewer.viewercontroller.controller.ImageLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    
    config:{
        extent:null
    },
    constructor: function(config){
        viewer.viewercontroller.controller.ImageLayer.superclass.constructor.call(this, config);
        this.type=viewer.viewercontroller.controller.Layer.IMAGE_TYPE;
    },
    /**
     * Needs to be implemented in subclass. Sets the extent for this image
     * @param extent The extent of type viewer.viewercontroller.controller.Extent
     */
    setExtent: function(extent){
        Ext.Error.raise({msg: "ImageLayer.setExtent() Not implemented! Must be implemented in sub-class"});
        
    },
    /**
     * @see viewer.viewercontroller.controller.Layer#getLayerLegendInfo
     * @return null, no legend available for imagelayers
     */
    getLayerLegendInfo: function (){
        return null;
    }
    
});

