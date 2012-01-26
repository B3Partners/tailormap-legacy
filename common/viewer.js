var viewerType = "flamingo";
var viewerController = null;
var aaron = null;
function initMapComponent(){
    
    if (window.location.href.indexOf("openlayers")>0){
        viewerType="openlayers";
    }
    viewerController = new ViewerController(viewerType,"map");
    viewerController.init();
    
    var map = viewerController.createMap();   
    viewerController.bind(Event.ON_CONFIG_COMPLETE,viewerController.wmc,onConfigComplete);
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
    
    viewerController.wmc.createPanel("toolGroup");

    viewerController.wmc.addTool(viewerController.wmc.createTool("loading",Tool.LOADING_BAR));

    zoomBox = viewerController.wmc.createTool("toolZoomin",Tool.ZOOM_BOX, {
        title: 'Inzomen met selectie'
    });
    viewerController.wmc.addTool(zoomBox);

    pan = viewerController.wmc.createTool("b_pan",Tool.PAN, {
        title: 'Verschuiven'
    });
    viewerController.wmc.addTool(pan);
    viewerController.wmc.activateTool("b_pan");

    prevExtent = viewerController.wmc.createTool("toolPrevExtent",Tool.NAVIGATION_HISTORY, {
        title: 'Vorige extent'
    });
    viewerController.wmc.addTool(prevExtent);

    var bu_measure = viewerController.wmc.createTool("b_measure",Tool.MEASURE, {
        title: 'Meten'
    });
   
    viewerController.wmc.addTool(bu_measure);

    var scalebar = viewerController.wmc.createTool("scalebar",Tool.SCALEBAR);
    viewerController.wmc.addTool(scalebar);

    var zoombar= viewerController.wmc.createTool("zoombar",Tool.ZOOM_BAR);
    viewerController.wmc.addTool(zoombar);
}

function loadTOC(){
    loadAvo();
    var  config = {
        name: "naam",
        div: "tree-div",
        options: {},
        viewerController : viewerController
    };
    toc = new TOC(config);
    toc.addArcIMS();
} 

/**
 * Alle ge�mplementeerde eventhandling functies
 */
function b_removePolygons(id,params){
    viewerController.wmc.getMap().getLayer("editMap").removeAllFeatures();
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
    
    var osmLayer = viewerController.wmc.createWMSLayer("OSM",layerUrl , ogcOptions, options);
    viewerController.wmc.getMap().addLayer(osmLayer);
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
    viewerController.zoomToExtent(minx, miny, maxx, maxy);
}