var webMapController= null;
var viewerType = "openlayers";
function initMapComponent(){
    mapviewer = viewerType;

    if (window.location.href.indexOf("flamingo")>0)
        mapviewer="flamingo";
    if (mapviewer== "flamingo"){
        webMapController=new FlamingoController('map'); // aanpassen aan id van div
        var map=webMapController.createMap("map"); // aanpassen aan config.xml
        webMapController.addMap(map);
    }else if (mapviewer=="openlayers"){
        webMapController= new OpenLayersController();
        var maxBounds=new OpenLayers.Bounds(10000,304000,280000,620000);

        var opt={
            projection: new OpenLayers.Projection("EPSG:28992"),
            maxExtent: maxBounds,
            allOverlays: true,
            units :'m',
            resolutions: [512,256,128,64,32,16,8,4,2,1,0.5,0.25,0.125],
            controls : [new OpenLayers.Control.Navigation({
                zoomBoxEnabled: true
            }),new OpenLayers.Control.ArgParser()],
            events: []
        };
        $("#map").html(" "); // aanpassen aan id van mapdiv
        var olmap=webMapController.createMap('map',opt); // aanpassen aan id van mapdiv
        $("#map").css("border","1px solid black"); // aanpassen aan id van mapdiv
        webMapController.addMap(olmap);
    }
    webMapController.initEvents();
    webMapController.registerEvent(Event.ON_GET_CAPABILITIES,webMapController.getMap(),onGetCapabilities);
    webMapController.registerEvent(Event.ON_CONFIG_COMPLETE,webMapController,onConfigComplete);
}

function onGetCapabilities(){
// later vullen met goede dingen
}

var eerste = true;
function onConfigComplete(){
    if(eerste){
        loadBaseLayers();
        onFrameworkLoaded();
        eerste = false;
    }
}

function loadBaseLayers(){
    var layerUrl = "http://osm.kaartenbalie.nl/wms/mapserver?";
    
    var options={
        timeout: 30,
        retryonerror: 10,
        getcapabilitiesurl: layerUrl,
        ratio: 1,
        showerrors: true,
        initService: true
    };

    var ogcOptions={
        format: "image/png",
        transparent: true,
        exceptions: "application/vnd.ogc.se_inimage",
        srs: "EPSG:28992",
        version: "1.1.1",
        layers: "OpenStreetMap",
        styles: "",
        noCache: false // TODO: Voor achtergrond kaartlagen wel cache gebruiken
    };
    
    options["isBaseLayer"]=false;
    
    var osmLayer = webMapController.createWMSLayer("OSM",layerUrl , ogcOptions, options);
    webMapController.getMap().addLayer(osmLayer);
}

var mapInitialized = false;
var firstTimeOninit = true;

function onFrameworkLoaded(){
    if (firstTimeOninit) {
        firstTimeOninit=false;

        moveToExtent(10000,304000,280000,620000);
    }
    mapInitialized=true;
}

function moveToExtent(minx,miny,maxx,maxy){
    webMapController.getMap().zoomToExtent({
        minx:minx,
        miny:miny,
        maxx:maxx,
        maxy:maxy
    }, 0);
}