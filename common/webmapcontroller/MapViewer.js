function MapViewer(viewerType){
    this.viewerType = viewerType;
}

MapViewer.prototype.init = function (){
    this.mapOptions = {};
    if (viewerType== "flamingo"){
        this.webMapController=new FlamingoController('map'); // aanpassen aan id van div
    }else if (viewerType=="openlayers"){
        this.webMapController= new OpenLayersController();
        //  var maxBounds=new OpenLayers.Bounds(10000,304000,280000,620000);

        this.mapOptions = {
            projection: new OpenLayers.Projection("EPSG:28992"),
            allOverlays: true,
            units :'m',
            resolutions: [512,256,128,64,32,16,8,4,2,1,0.5,0.25,0.125],
            controls : [new OpenLayers.Control.Navigation({
                zoomBoxEnabled: true
            }),new OpenLayers.Control.ArgParser()],
            events: [],
            maxExtent: new OpenLayers.Bounds(101827,368579,145183,601096)
        };
    }
    
    var maxBounds = new Extent(10000, 304000,280000,620000);
    //var maxBounds =   new Extent(101827,468579,145183,501096); // Adam extent
    this.mapOptions.maxExtent =  maxBounds;
    this.webMapController.initEvents();

}


MapViewer.prototype.createMap = function(options){
    for (var key in options){
        this.mapOptions[key] = options[key];
    }

    var map=this.webMapController.createMap("map",this.mapOptions); // aanpassen aan config.xml
    this.webMapController.addMap(map);
    return map;
}
/**
 *Creates a layer for this framework
 *@param name the showable name of the layer
 *@param url the url to the serviceProvider
 *@param ogcParams the params that are used in the OGC-WMS request
 *@param options extra options for this wms layer
 *Must be implemented by subclass
*/
MapViewer.prototype.createWMSLayer = function(name, url, ogcParams,options){
    return this.webMapController.createWMSLayer(name, url, ogcParams,options);
}

MapViewer.prototype.getMap = function (id){
    return this.webMapController.getMap(id)
}

MapViewer.prototype.zoomToExtent = function(minx,miny,maxx,maxy){
    this.webMapController.getMap().zoomToExtent({
        minx:minx,
        miny:miny,
        maxx:maxx,
        maxy:maxy
    }, 0);
}

MapViewer.prototype.addLayer = function (layer,mapId){
    this.getMap(mapId).addLayer(layer);
}