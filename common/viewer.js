var viewerType = "flamingo";
var viewerController = null;
var aaron = null;
function initMapComponent(){
    
    if (window.location.href.indexOf("openlayers")>0){
        viewerType="openlayers";
    }
    viewerController = new viewer.viewercontroller.ViewerController(viewerType,"map");
    viewerController.init();
    
    var map = viewerController.createMap();   
    viewerController.bind(viewer.viewercontroller.controller.Event.ON_CONFIG_COMPLETE,viewerController.mc,onConfigComplete);
}


var eerste = true;
function onConfigComplete(){
    try{            
        if(eerste){
            loadBaseLayers();
            initializeButtons();
            onFrameworkLoaded();
            eerste = false;
            loadTOC();
            loadComponents();
            //testComponents();
        }
    }catch(e){
        console.log(e);
        throw e;
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
    var featureInfoJson= {
        className: "viewer.components.tools.FeatureInfo",
        name: "FeatureInfo",
        shortName: "FI",
        tooltip: "Get Feature Info"
    };
    testComponents.push(featureInfoJson);
    var panJson= {
        className: "viewer.components.tools.Pan",
        name: "Pan",
        shortName: "Pan",
        tooltip: "Pan the map"
    };
    testComponents.push(panJson);
    var superPanJson= {
        className: "viewer.components.tools.SuperPan",
        name: "SuperPan",
        shortName: "SP",
        tooltip: "SuperPan"
    };
    testComponents.push(superPanJson);
    var measureJson= {
        className: "viewer.components.tools.Measure",
        name: "Measure",
        shortName: "Mes",
        tooltip: "Measure"
    };
    testComponents.push(measureJson);
    for (var i=0; i < testComponents.length; i++){
        viewerController.addComponent(testComponents[i].className,testComponents[i]);
    }
}    

function loadComponents(){
    var layouts = app.layout;
    for ( var l in layouts){
        var layout = layouts[l];
        for ( var i = 0 ; i < layout.components.length ; i++){
            var componentJson = layout.components[i];
            var name = componentJson.name;
            var className = componentJson.componentClass;
            var config = app.components[name];
            if (config==undefined)
                continue;            
            config.div = l;            
            viewerController.addComponent(className,config);  
        } 
    }
}

function loadTOC(){
    loadAvo();
    var  config = {
        name: "toc1",
        div: "tree-div",
        options: {}
    };
   /* var toc = viewerController.addComponent("TOC",config);
    
    toc.addArcIMS();*/
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