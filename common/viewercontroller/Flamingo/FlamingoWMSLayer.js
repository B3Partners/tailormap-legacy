/**
 * @class 
 * @constructor
 * @description Flamingo WMS layer class 
 **/

Ext.define("viewer.viewercontroller.flamingo.FlamingoWMSLayer",{
    extend: "viewer.viewercontroller.flamingo.FlamingoLayer",
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoWMSLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        return this;
    },
    getTagName : function(){
        return "LayerOGWMS";
    },
    /**
     *Gets the last wms request-url of this layer
     *@returns the WMS getMap Reqeust.
     */
    getURL : function(){
        return this.url;
    },
    setURL : function(url){
        this.url= url;
    },
    /**
     *makes a xml string so the object can be added to flamingo
     *@return a xml string of this object
     **/
    toXML : function(){
        var xml="<fmc:";
        xml+=this.getTagName();
        xml+=" xmlns:fmc=\"fmc\"";
        xml+=" id=\""+this.getId()+"\"";
        xml+=" initService=\""+this.getOption("initService")+"\"";
        xml+=" url=\""+this.getOption("url");
        //fix for SLD support in flamingo
        if (this.getOption("sld") && this.getOption("url")){
            xml+=this.getOption("url").indexOf("?")>=0 ? "&" : "?";
            xml+="sld="+this.getOption("sld")+"&";
        }
        xml+="\"";
        for (var optKey in this.options){
            //skip these options.
            if (optKey.toLowerCase()== "url" ||
                optKey.toLowerCase()== "sld"){}
            else{
                xml+=" "+optKey+"=\""+this.options[optKey]+"\"";
            }
        }
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
    },

    /**
     *Get the id of this layer
     */
    getId :function (){
        return this.id;
    },
    reload : function (){
        this.getFrameworkLayer().callMethod(mapComponent.getMap().getId() + "_" + this.getId(),"setConfig",this.toXML() );
    }
});