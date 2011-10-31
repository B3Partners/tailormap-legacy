var viewerType = "openlayers";
var mapViewer = null;
function initMapComponent(){

    if (window.location.href.indexOf("flamingo")>0){
        viewerType="flamingo";
    }
    mapViewer = new MapViewer(viewerType);
    mapViewer.init();
    
    var map = mapViewer.createMap();   
    mapViewer.bind(Event.ON_CONFIG_COMPLETE,webMapController,onConfigComplete);
    mapViewer.bind(Event.ON_GET_CAPABILITIES,map,onGsdetCapabilities);
}

function onGsdetCapabilities(){
    alert("OnGetCap");
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
    
    var osmLayer = mapViewer.createWMSLayer("OSM",layerUrl , ogcOptions, options);
    mapViewer.addLayer(osmLayer);
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
    mapViewer.zoomToExtent(minx, miny, maxx, maxy);
}