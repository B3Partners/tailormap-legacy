var viewerType = "flamingo";
var mapViewer = null;
function initMapComponent(){

    if (window.location.href.indexOf("openlayers")>0){
        viewerType="openlayers";
    }
    mapViewer = new MapViewer(viewerType,"map");
    mapViewer.init();
    
    var map = mapViewer.createMap();   
    mapViewer.bind(Event.ON_CONFIG_COMPLETE,mapViewer.wmc,onConfigComplete);
    mapViewer.bind(Event.ON_GET_CAPABILITIES,map,onGsdetCapabilities);
}

var toc = null;

function initializeButtons(){
    /*ie bug fix*/
    if (Ext.isIE && (Ext.isIE7 || Ext.isIE6)){
        var viewport= document.getElementById('OpenLayers.Map_2_OpenLayers_ViewPort');
        if (viewport){
            viewport.style.position="absolute";
        }
    }
    webMapController.createPanel("toolGroup");
    //  webMapController.registerEvent(Event.ON_ALL_LAYERS_LOADING_COMPLETE,webMapController.getMap(), onAllLayersFinishedLoading);

    webMapController.addTool(webMapController.createTool("loading",Tool.LOADING_BAR));

    zoomBox = webMapController.createTool("toolZoomin",Tool.ZOOM_BOX, {
        title: 'Inzomen met selectie'
    });
    webMapController.addTool(zoomBox);

    pan = webMapController.createTool("b_pan",Tool.PAN, {
        title: 'Verschuiven'
    });
    webMapController.addTool(pan);
    webMapController.activateTool("b_pan");

    prevExtent = webMapController.createTool("toolPrevExtent",Tool.NAVIGATION_HISTORY, {
        title: 'Vorige extent'
    });
    webMapController.addTool(prevExtent);

    var editLayer = webMapController.createVectorLayer("editMap",{
        displayInLayerSwitcher: false
    });
    webMapController.getMap().addLayer(editLayer);
    webMapController.getMap().setLayerIndex(editLayer, webMapController.getMap().getLayers().length);


    var edittingtb = webMapController.createTool("redLiningContainer",Tool.DRAW_FEATURE, {
        layer: editLayer
    });
    webMapController.addTool(edittingtb);


    var bu_removePolygons = webMapController.createTool("b_removePolygons",Tool.BUTTON, {
        layer: editLayer, 
        title: 'Verwijder object'
    });
    webMapController.registerEvent(Event.ON_EVENT_DOWN,bu_removePolygons,b_removePolygons);
    webMapController.addTool(bu_removePolygons);
    
    var bu_measure = webMapController.createTool("b_measure",Tool.MEASURE, {
        title: 'Meten'
    });
    //webMapController.registerEvent(Event.ON_MEASURE,bu_measure,measured);
    webMapController.addTool(bu_measure);

    var scalebar = webMapController.createTool("scalebar",Tool.SCALEBAR);
    webMapController.addTool(scalebar);

    var zoombar= webMapController.createTool("zoombar",Tool.ZOOM_BAR);
    webMapController.addTool(zoombar);
}

function loadTOC(){
    
    loadAvo();
    loadOmgevingsVisie();
    var begin = new Date();
    
    toc = new TOC("tree-div",mapViewer,{});
    toc.addArcIMS();
    
    var eind = new Date();
    var totaal = eind.getTime() - begin.getTime();
    mapViewer.bind(Event.ON_LAYER_SWITCHED_ON,toc,callBack)
    mapViewer.bind(Event.ON_LAYER_SWITCHED_OFF,toc,callBack)
}

function test(a,b,c){
    alert("fired! ",a);
}

/**
 * Alle geïmplementeerde eventhandling functies
 */
function b_removePolygons(id,params){
    mapViewer.wmc.getMap().getLayer("editMap").removeAllFeatures();
}

function callBack(a,b,c){
    console.log(b.getName());
}

function onGsdetCapabilities(){
//   alert("OnGetCap");
}

var eerste = true;
function onConfigComplete(){
    if(eerste){
        loadBaseLayers();
        onFrameworkLoaded();
        initializeButtons();
        loadTOC();
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
    
    var osmLayer = mapViewer.wmc.createWMSLayer("OSM",layerUrl , ogcOptions, options);
    mapViewer.wmc.getMap().addLayer(osmLayer);
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