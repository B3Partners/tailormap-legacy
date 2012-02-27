/**
 * @class 
 * @constructor
 * @description Flamingo ArcIMS layer class 
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoArcIMSLayer",{
    extend: "viewer.viewercontroller.flamingo.FlamingoLayer",
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoArcIMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    
    
    getTagName: function(){
        return "LayerArcIMS";
    },

    /**
     *makes a xml string so the object can be added to flamingo
     *@return a xml string of this object
     **/
    toXML :function(){
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
        for (var i=0; i < this.getMaptips().length; i++){
            var maptip=this.getMaptips()[i];
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
    },

    /**
     *Get the id of this layer
     */
    getId :function (){
        return this.id;
    },

    reload : function (){
        this.getFrameworkLayer().callMethod(mapComponent.getMap().getId() + "_" + this.getId(),"setConfig",this.toXML() );
    },

    getName : function (){
        return this.options["name"];
    },

    getServer :function (){
        return this.options["server"];
    },

    getService : function (){
        return this.options["service"];
    },

    getServlet : function (){
        return this.options["servlet"];
    },

    getMapservice : function (){
        return this.options["mapservice"];
    },
    getLayers : function(){
        return this.options["visibleids"];
    },
    setMaptips: function(maptips){
        viewer.viewercontroller.flamingo.FlamingoArcIMSLayer.superclass.setMaptips.call(this,maptips);        
        this.passMaptips();
    },
    passMaptips: function(){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setMaptipLayers", this.maptips.join(","));
    },
    
    setVisible : function (visible){
        this.visible = visible;
        if(visible){
            this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "show");
        }else{
            this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "hide");
        }
    },
    getLegendGraphic : function (){
        var url = this.options.server + "/" + this.options.servlet;
        var character = url.indexOf("?") == -1 ? "?" : "&";
        if(url.substring(url.length) == character){
            url += character;
        }
        var request = url + "ServiceName="+this.options.mapservice+"request=GetLegendGraphic&layer="+this.id+"&version=1.1.1&format=png";
        return request;
    }

});
