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
/**
 * @class 
 * @constructor
 * @description Flamingo ArcIMS layer class 
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoArcIMSLayer",{
    extend: "viewer.viewercontroller.flamingo.FlamingoArcLayer",
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoArcIMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.type=viewer.viewercontroller.controller.Layer.ARCIMS_TYPE;
        return this;
    },
    
    getTagName: function(){
        return "LayerArcIMS";
    },
    setQuery : function (query){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setLayerProperty", this.id,"query", query);
        this.map.update();
    },
    // Call the setLayerProperty to set the buffer radius. It must be a object with a radius property
    setBuffer : function (radius,layer){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id,"setLayerProperty", layer,"buffer",{radius:radius});
        this.map.update();
    },
    // Set the buffer property to null to remove the buffer
    removeBuffer: function(layer){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setLayerProperty", layer,"buffer");
        this.map.update();
    }
});
