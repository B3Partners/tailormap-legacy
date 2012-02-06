var viewerType = "flamingo";

var bu_removePolygons;
function initializeButtons(){
    /*ie bug fix*/
    if (Ext.isIE && (Ext.isIE7 || Ext.isIE6)){
        var viewport= document.getElementById('OpenLayers.Map_2_OpenLayers_ViewPort');
        if (viewport){
            viewport.style.position="absolute";
        }
    }    
}
/**
 *Test some components.
 */
function testComponents(){
    var testComponents = new Array();
    //test components
    var zoomInJson= {
        className: "viewer.components.tools.ZoomIn",
        name: "ZoomIn",
        shortName: "ZmIn",
        tooltip: "Zoom in"
    };
    testComponents.push(zoomInJson);
    var zoomOutJson= {
        className: "viewer.components.tools.ZoomOut",
        name: "ZoomOut",
        shortName: "ZmOut",
        tooltip: "Zoom Out"
    };
    testComponents.push(zoomOutJson);
    for (var i=0; i < testComponents.length; i++){
        viewerController.addComponent(testComponents[i].className,testComponents[i]);
    }
}    
var firstTime = true;
function onConfigComplete (){
    try{            
        if(firstTime){
            firstTime = false;
            initializeButtons();
            onFrameworkLoaded();
            viewerController.loadLayout(layoutManager.getComponentList());
            viewerController.loadRootLevel(app.rootLevel);
           loadBaseLayers();
           
        //testComponents();
        }
    }catch(e){
        console.log(e);
    }
}

function initMapComponent  (){
    
    viewerController.init();
    
    var map = viewerController.createMap();   
    viewerController.bind(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE,viewerController.mc,onConfigComplete);
}
/**
 * Alle ge�mplementeerde eventhandling functies
 */
function b_removePolygons(id,params){
    viewerController.mc.getMap().getLayer("editMap").removeAllFeatures();
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
    
    var osmLayer = viewerController.mc.createWMSLayer("OSM",layerUrl , ogcOptions, options);
    viewerController.mc.getMap().addLayer(osmLayer);
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