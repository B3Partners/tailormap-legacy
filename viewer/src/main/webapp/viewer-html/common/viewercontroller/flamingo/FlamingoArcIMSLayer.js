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
/**
 * @class 
 * @constructor
 * @description Flamingo ArcIMS layer class 
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoArcIMSLayer",{
    extend: "viewer.viewercontroller.flamingo.FlamingoArcLayer",
    constructor: function(config){
        config.options["layerorder"]=true;
        this.id = config.id;
        viewer.viewercontroller.flamingo.FlamingoArcIMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.type=viewer.viewercontroller.controller.Layer.ARCIMS_TYPE;
        return this;
    },
    
    getTagName: function(){
        return "LayerArcIMS";
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
    },
    setQuery : function (filter){
        if(filter){
            var me = this;
            var f = function(query) { 
                me.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setQuery","#ALL#",query);
                me.reload();
            };
            var util = Ext.create("viewer.ArcQueryUtil");
            util.cqlToArcXMLSpatialQuery(filter.getCQL(),f,console.log);        
        }else{
            this.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setQuery","#ALL#",null);
            this.reload();
        }
    }
});
