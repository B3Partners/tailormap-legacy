var viewerType = "flamingo";
var mapViewer = null;
var aaron = null;
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


var eerste = true;
function onConfigComplete(){
    if(eerste){
        loadBaseLayers();
        initializeButtons();
        onFrameworkLoaded();
        eerste = false;
        loadTOC();
    }
}



var toc = null;
var bu_removePolygons;
function initializeButtons(){
    /*ie bug fix*/
    if (Ext.isIE && (Ext.isIE7 || Ext.isIE6)){
        var viewport= document.getElementById('OpenLayers.Map_2_OpenLayers_ViewPort');
        if (viewport){
            viewport.style.position="absolute";
        }
    }
    
    mapViewer.wmc.createPanel("toolGroup");
    //webMapController.registerEvent(Event.ON_ALL_LAYERS_LOADING_COMPLETE,webMapController.getMap(), onAllLayersFinishedLoading);

    mapViewer.wmc.addTool(mapViewer.wmc.createTool("loading",Tool.LOADING_BAR));

    zoomBox = mapViewer.wmc.createTool("toolZoomin",Tool.ZOOM_BOX, {
        title: 'Inzomen met selectie'
    });
    mapViewer.wmc.addTool(zoomBox);

    pan = webMapController.createTool("b_pan",Tool.PAN, {
        title: 'Verschuiven'
    });
    mapViewer.wmc.addTool(pan);
    mapViewer.wmc.activateTool("b_pan");

    prevExtent = webMapController.createTool("toolPrevExtent",Tool.NAVIGATION_HISTORY, {
        title: 'Vorige extent'
    });
    mapViewer.wmc.addTool(prevExtent);

  /*  var editLayer = webMapController.createVectorLayer("editMap");
    mapViewer.wmc.getMap().addLayer(editLayer);
    // mapViewer.wmc.getMap().setLayerIndex(editLayer, webMapController.getMap().getLayers().length);


    var edittingtb = mapViewer.wmc.createTool("redLiningContainer",Tool.DRAW_FEATURE, {
        layer: editLayer
    });
    mapViewer.wmc.addTool(edittingtb);


    bu_removePolygons = webMapController.createTool("b_removePolygons",Tool.BUTTON, {
        layer: editLayer, 
        title: 'Verwijder object'
    });
    mapViewer.bind(Event.ON_EVENT_DOWN,bu_removePolygons,b_removePolygons);
    mapViewer.wmc.addTool(bu_removePolygons);
    */
    var bu_measure = mapViewer.wmc.createTool("b_measure",Tool.MEASURE, {
        title: 'Meten'
    });
   
    //webMapController.registerEvent(Event.ON_MEASURE,bu_measure,measured);
    mapViewer.wmc.addTool(bu_measure);

    var scalebar = mapViewer.wmc.createTool("scalebar",Tool.SCALEBAR);
    mapViewer.wmc.addTool(scalebar);

    var zoombar= mapViewer.wmc.createTool("zoombar",Tool.ZOOM_BAR);
    mapViewer.wmc.addTool(zoombar);
}

function loadTOC(){
    
    loadAvo();
    loadOmgevingsVisie();
    var begin = new Date();
    var  config = {
        name: "naam",
        div: "tree-div",
        options: {}
    };
    toc = new TOC(config);
    toc.addArcIMS();
    
    var eind = new Date();
    var totaal = eind.getTime() - begin.getTime();
    mapViewer.bind(Event.ON_LAYER_SWITCHED_ON,toc,callBack)
    mapViewer.bind(Event.ON_LAYER_SWITCHED_OFF,toc,callBack)
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