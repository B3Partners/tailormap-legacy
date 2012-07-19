/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
Ext.define("viewer.viewercontroller.openlayers.OpenLayersArcIMSLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersArcLayer",
    constructor: function(config){
        //config.options["layerorder"]=true;
        this.id = config.id;
        
        viewer.viewercontroller.openlayers.OpenLayersArcIMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
     //   OpenLayers.ProxyHost = "/viewer/action/proxy?appLayer="+ this.id+ "&url=";
        this.type=viewer.viewercontroller.controller.Layer.ARCIMS_TYPE;
        var options = {
            serviceName: "atlasoverijssel",
            async: true
        };
            /*
        this.frameworkLayer = new OpenLayers.Layer.ArcIMS( "hemelhelderheid_polygon",
            "http://gisopenbaar.toverijs3.nl/GeoJuli2008/ims", options );*/
        return this;
    },
    // Call the setLayerProperty to set the buffer radius. It must be a object with a radius property
    setBuffer : function (radius,layer){
        //this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id,"setLayerProperty", layer,"buffer",{radius:radius});
        this.map.update();
    },
    // Set the buffer property to null to remove the buffer
    removeBuffer: function(layer){
        // this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setLayerProperty", layer,"buffer");
        this.map.update();
    },
    setQuery : function (filter){
        if(filter){
            var me = this;
            var f = function(query) { 
                // me.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setQuery","#ALL#",query);
                me.forceUpdate();
            };
            var util = Ext.create("viewer.ArcQueryUtil");
            util.cqlToArcXMLSpatialQuery(filter.getCQL(),f,console.log);        
        }else{
            //  this.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setQuery","#ALL#",null);
            this.update();
        }
    }
});
