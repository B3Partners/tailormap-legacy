/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




Ext.define("viewer.viewercontroller.openlayers3.OpenLayers3ArcServerLayer",{
    extend: "viewer.viewercontroller.openlayers3.OpenLayers3ArcLayer",
    constructor: function(config){
        viewer.viewercontroller.openlayers3.OpenLayers3ArcServerLayer.superclass.constructor.call(this, config);
        var source = new ol.source.TileArcGISRest({
            projection: config.viewerController.mapComponent.mapOptions.projection,
            params: {
                LAYERS:"show:"+config.layers,
                TRANSPARENT: true
            },
            url:config.url+"/export",
            ratio:config.ratio
        });
        this.frameworkLayer = new ol.layer.Tile({
            source:source,
            visible:config.visible,
            opacity: this.config.opacity != undefined ? this.config.opacity : 1
          
        });
        
        this.type=viewer.viewercontroller.controller.Layer.ARCSERVERREST_TYPE;
    },
    
    getLastMapRequest: function(){
        var map = this.config.viewerController.mapComponent.getMap().getFrameworkMap();
        var r = this.getFrameworkLayer().getSource().getTileUrlFunction();
        var crd=[];
        crd[0]= map.getView().getZoom();
        crd[1] =map.getView().getCenter()[0];
        crd[2] = map.getView().getCenter()[1];
        var request=[{
            url: r(crd,1, map.getView().getProjection())
        }];
        return request;
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