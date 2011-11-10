/*JavaScript interface class file*/

/**
 * MapViewer
 * @class 
 * @constructor
 * @param viewerType The type of the viewer: flamingo/openlayers/etc..
 * @param mapId The id of the div in which the map has to be shown.
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */

function MapViewer(viewerType,mapId){
    this.viewerType = viewerType;
    this.wmc = null;
    this.webMapController = null;
    this.mapDivId = mapId;
}

MapViewer.prototype.init = function (){
    this.mapOptions = {};
    if (this.viewerType== "flamingo"){
        this.webMapController=new FlamingoController(this.mapDivId); // aanpassen aan id van div
    }else if (this.viewerType=="openlayers"){
        this.webMapController= new OpenLayersController();
        this.mapOptions = {
            projection: new OpenLayers.Projection("EPSG:28992"),
            allOverlays: true,
            units :'m',
            resolutions: [512,256,128,64,32,16,8,4,2,1,0.5,0.25,0.125],
            controls : [new OpenLayers.Control.Navigation({
                zoomBoxEnabled: true
            }),new OpenLayers.Control.ArgParser()],
            events: []            
        };
    }
    
    this.mapOptions.maxExtent =  new Extent(10000, 304000,280000,620000);
    
    this.webMapController.initEvents();
    // Convenience accessor for the webmapController
    this.wmc = this.webMapController;
}

MapViewer.prototype.createMap = function(opts){
    var a= 0;
    for (var key in opts){
        this.mapOptions[key] = opts[key];
    }
    var map=this.webMapController.createMap(this.mapDivId,this.mapOptions); // aanpassen aan config.xml
    this.webMapController.addMap(map);
    return map;
}

MapViewer.prototype.zoomToExtent = function(minx,miny,maxx,maxy){
    this.webMapController.getMap().zoomToExtent({
        minx:minx,
        miny:miny,
        maxx:maxx,
        maxy:maxy
    }, 0);
}

/********************************************************************
 *                                                                  *
 * EventHandling                                                    *
 *                                                                  *
 *                                                                  *
 ********************************************************************/

MapViewer.prototype.bind = function (event,object,handler){
    if(object.isComponent != undefined){
        object.bind(event,handler);
    }else{
        this.webMapController.registerEvent(event, object, handler);
    }
}

MapViewer.prototype.unbind = function (event,object){
    this.webMapController.unRegisterEvent(event, object);
}

