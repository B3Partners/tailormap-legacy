var layerJSON = {
    layers:[]
};

var avoIds = "kanoroute,mtbroute,law_knelpt,lf_knelpt" ;
var avoArray = avoIds.split(",");

function loadAvo(){
    for( var i = 0 ; i < avoArray.length && i < 50 ; i++){
        var visible = false;
        if( i < 5){
            visible = true;
        }
        var layerId = avoArray[i];
        var laag = {
            server:"gisopenbaar.overijssel.nl", 
            servlet:"GeoJuli2008/ims",
            mapservice:"atlasoverijssel",
            id:"avo_"+layerId,
            name: layerId,
            visible: visible,
            type: "ArcIMS"
        };
        layerJSON.layers.push(laag);
    }
}
