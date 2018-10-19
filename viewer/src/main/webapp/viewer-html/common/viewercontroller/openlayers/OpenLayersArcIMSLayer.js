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
Ext.define("viewer.viewercontroller.openlayers.OpenLayersArcIMSLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersArcLayer",
    constructor: function(config){
        this.id = config.id;

        viewer.viewercontroller.openlayers.OpenLayersArcIMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);

        this.type=viewer.viewercontroller.controller.Layer.ARCIMS_TYPE;
        var options = {
            async: true,
            singleTile: false,
            // usually ArcIMS is configured with <IMAGELIMIT pixelcount="1048576" />
            // so max size is 1024 x 1024
            tileSize: new OpenLayers.Size(1024, 1024),
            transparent: true,   // THIS DOES NOTHING!!!
            format: "image/png", // THIS DOES NOTHING EITHER!!! See ArcXML_transparency_hack.patch
            //transitionEffect : "resize", // Does not work, resized tiles are not removed
            opacity: this.config.opacity != undefined ? this.config.opacity : 1,
            attribution: this.config.attribution
        };

        options.serviceName = this.serviceName;
        options.filterCoordSys = "28992";
        options.featureCoordSys = "28992";
        options.layers = [ {
                id: this.layers,
                visible: true,
                query: { where: "" }
        }];

        this.frameworkLayer = new OpenLayers.Layer.ArcIMS(
            this.name,
            this.url,
            options);
        return this;
    },
    // Call the setLayerProperty to set the buffer radius. It must be a object with a radius property
    setBuffer : function (radius,layer){
        this.config.viewerController.logger.error(___("OpenLayersArcIMSLayer: setBuffer() not supported!"));
        //this.map.update();
    },
    // Set the buffer property to null to remove the buffer
    removeBuffer: function(layer){
        //this.map.update();
    },
    setQuery : function (filter){
        if(filter){
            var me = this;
            var f = function(query) {
                me.frameworkLayer.layers[0].query.where = query;
                me.reload();
            };
            var util = Ext.create("viewer.ArcQueryUtil");
            util.cqlToArcXMLWhere(filter.getCQL(),f, this.config.viewerController.logger.error);
        }else{
            this.frameworkLayer.layers[0].query.where = "";
            this.reload();
        }
    }
});
