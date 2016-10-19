/*
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * @description Openlayers ArcServer layer class
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 **/
Ext.define("viewer.viewercontroller.openlayers.OpenLayersArcServerLayer",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersArcLayer",
    constructor: function(config){
        viewer.viewercontroller.openlayers.OpenLayersArcServerLayer.superclass.constructor.call(this, config);
        this.frameworkLayer = new OpenLayers.Layer.ArcGIS93Rest(this.name,this.url+"/export",{
            layers: "show:"+config.layers,
            transparent: 'true'
        },{
            visibility: this.visible,
            singleTile : true,
            transitionEffect : "resize",
            opacity: this.config.opacity != undefined ? this.config.opacity : 1,
            attribution: this.config.attribution
        });
        this.type=viewer.viewercontroller.controller.Layer.ARCSERVERREST_TYPE;
    },
    /**
     *@see viewer.viewercontroller.controller.Layer#getLastMapRequest
     * fix the size in the url to the size of the Map. Otherwise the returned
     * image is to small.
     */
    getLastMapRequest: function(){
        var extent=this.getFrameworkLayer().map.getExtent();
        var url= this.getFrameworkLayer().getURL(extent);
        //size is wrong so make the size correct.
        var newSize="SIZE="+this.getMap().getWidth()+"%2C"+this.getMap().getHeight();
        url = url.replace("SIZE=256%2C256",newSize);
        return [{
            url: url
        }];;
    },

    setQuery : function (filter){
        var me = this;
        var cql = filter != null ? filter.getCQL() : "";
        if(cql != ""){
            var f = function(ids,colName) {
                // Hack: An empty query returns all the features
                var query = "-1";
                if(ids.length != 0) {
                    query = colName + " IN(" + ids.join(",") + ")";
                }
                me.getFrameworkLayer().setLayerFilter(me.layers, query);
                //me.map.getFrameworkMap().callMethod(me.getFrameworkId(),"setDefinitionQuery", query,me.config.options.name);
                setTimeout (function(){
                    me.reload();
                }, 500);
            };
            var util = Ext.create("viewer.ArcQueryUtil");
            util.cqlToArcFIDS(cql,this.appLayerId,f, function(msg) { me.getViewerController().logger.error(msg); });
        }else{
            me.getFrameworkLayer().setLayerFilter(me.layers, null);
            setTimeout (function(){
                me.reload();
            }, 500);
        }
    }
});