/**
 * @class 
 * @constructor
 * @description Flamingo ArcIMS layer class 
 **/
function FlamingoArcIMSLayer(id,options,flamingoObject){
    FlamingoLayer.call(this,id,options,flamingoObject);
    this.url=null;
}
FlamingoArcIMSLayer.prototype = new FlamingoLayer();
FlamingoArcIMSLayer.prototype.constructor= FlamingoArcIMSLayer;

FlamingoArcIMSLayer.prototype.getTagName = function(){
    return "LayerArcIMS";
}

/**
*makes a xml string so the object can be added to flamingo
*@return a xml string of this object
**/
FlamingoArcIMSLayer.prototype.toXML = function(){
    var xml="<fmc:";
    xml+=this.getTagName();
    xml+=" xmlns:fmc=\"fmc\"";
    xml+=" id=\""+this.getId()+"\"";
    //fix for SLD support in flamingo
    if (this.getOption("sld") && this.getOption("url")){
        xml+=this.getOption("url").indexOf("?")>=0 ? "&" : "?";
        xml+="sld="+this.getOption("sld")+"&";
    }
    for (var optKey in this.options){
        //skip these options.
        if (optKey.toLowerCase()== "url" ||
            optKey.toLowerCase()== "sld"){}
        else{
            xml+=" "+optKey+"=\""+this.options[optKey]+"\"";
        }
    }
    xml+=" name=\""+this.getOption("name")+"\"";
    xml+=" server=\""+this.getOption("server")+"\"";
    xml+=" servlet=\""+this.getOption("servlet")+"\"";
    xml+=" mapservice=\""+this.getOption("mapservice")+"\"";
    xml+=">";
    //add the maptips
    for (var i=0; i < this.getMapTips().length; i++){
        var maptip=this.getMapTips()[i];
        xml+="<layer";
        xml+=" id=\""+maptip.layer+"\"";
        if (maptip.mapTipField!=null)
            xml+=" maptip=\""+maptip.mapTipField+"\"";
        if (maptip.aka!=null){
            xml+=" aka=\""+maptip.aka+"\"";
        }
        xml+="/>"    
    }
    xml+="</fmc:"+this.getTagName()+">";
    //console.log(xml);
    return xml;
}

/**
*Get the id of this layer
*/
FlamingoArcIMSLayer.prototype.getId =function (){
    return this.id;
}

FlamingoArcIMSLayer.prototype.reload = function (){
    this.getFrameworkLayer().callMethod(webMapController.getMap().getId() + "_" + this.getId(),"setConfig",this.toXML() );
}


FlamingoArcIMSLayer.prototype.getName = function (){
    return this.options["name"];
}

FlamingoArcIMSLayer.prototype.getServer = function (){
    return this.options["server"];
}

FlamingoArcIMSLayer.prototype.getService = function (){
    return this.options["service"];
}

FlamingoArcIMSLayer.prototype.getServlet = function (){
    return this.options["servlet"];
}

FlamingoArcIMSLayer.prototype.getMapservice = function (){
    return this.options["mapservice"];
}