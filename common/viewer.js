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
    if(eerste){
        loadBaseLayers();
        initializeButtons();
        onFrameworkLoaded();
        eerste = false;
        loadTOC();
        loadComponents();
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
    
    viewerController.mc.createPanel("toolGroup");

    viewerController.mc.addTool(viewerController.mc.createTool("loading",Tool.LOADING_BAR));

    zoomBox = viewerController.mc.createTool("toolZoomin",Tool.ZOOM_BOX, {
        title: 'Inzomen met selectie'
    });
    viewerController.mc.addTool(zoomBox);

    pan = viewerController.mc.createTool("b_pan",Tool.PAN, {
        title: 'Verschuiven'
    });
    viewerController.mc.addTool(pan);
    viewerController.mc.activateTool("b_pan");

    prevExtent = viewerController.mc.createTool("toolPrevExtent",Tool.NAVIGATION_HISTORY, {
        title: 'Vorige extent'
    });
    viewerController.mc.addTool(prevExtent);

    var bu_measure = viewerController.mc.createTool("b_measure",Tool.MEASURE, {
        title: 'Meten'
    });
   
    viewerController.mc.addTool(bu_measure);

    var scalebar = viewerController.mc.createTool("scalebar",Tool.SCALEBAR);
    viewerController.mc.addTool(scalebar);

    var zoombar= viewerController.mc.createTool("zoombar",Tool.ZOOM_BAR);
    viewerController.mc.addTool(zoombar);
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