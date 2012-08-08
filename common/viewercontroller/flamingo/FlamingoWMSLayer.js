/**
 * @class 
 * @constructor
 * @description Flamingo WMS layer class 
 **/

Ext.define("viewer.viewercontroller.flamingo.FlamingoWMSLayer",{
    extend: "viewer.viewercontroller.controller.WMSLayer", 
    mixins: {
        flamingoLayer: "viewer.viewercontroller.flamingo.FlamingoLayer"
    },
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoWMSLayer.superclass.constructor.call(this, config);
        this.mixins.flamingoLayer.constructor.call(this,config);
        this.initConfig(config);
        return this;
    },
    getTagName : function(){
        return "LayerOGWMS";
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
     
        xml+=" url=\""+this.getOption("url");
        //fix for SLD support in flamingo
        if (this.getOption("SLD_BODY") && this.getOption("url")){
            xml+=this.getOption("url").indexOf("?")>=0 ? "&" : "?";
            xml+="SLD_BODY="+this.getOption("SLD_BODY")+"&";
        }
        xml+="\"";
        for (var optKey in this.options){
            //skip these options.
            if (optKey.toLowerCase()== "url" ||
                optKey.toLowerCase()== "sld_body"){}
            else{
                xml+=" "+optKey+"=\""+this.options[optKey]+"\"";
            }
        }
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
    
    setMaptips: function(maptips){
        viewer.viewercontroller.flamingo.FlamingoWMSLayer.superclass.setMaptips.call(this,maptips);        
        this.passMaptips();
    },
    passMaptips: function(){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setMaptipLayers", this.maptips.join(","));
    },
    setQuery : function (filter){
        if(filter){
            var service = this.viewerController.app.services[this.serviceId];
            var layer = service.layers[this.options.name];
            if(layer.details != undefined){
                var filterable =layer.details["filterable"];
                if(filterable != undefined && filterable != null ){
                    filterable = Ext.JSON.decode(filterable);
                    if(filterable){
                        var me = this;
                        var f = function(sld) { 
                            me.options["SLD_BODY"] = encodeURIComponent(sld);
                            me.reload();
                        };
                        var sld = Ext.create("viewer.SLD",{});
                        sld.create([this.options["layers"]], ["default"], filter.getCQL(),f,console.log);
                    }
                }
            }
        }else{
            this.options["SLD_BODY"] = null;
            this.reload();
        }
    },

    getLayers : function(){
        return this.getFrameworkLayer().options.layers;   
    },
    /**
     *Implement for: 
     * @see viewer.viewercontroller.controller.Layer#setUrl
     */
    setUrl: function (url){
        this.url = url;
        /*TODO: need to implement and give it at the framework layer*/
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.flamingoLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setVisible
     */
    getVisible: function(){
        var vis = this.mixins.flamingoLayer.getVisible.call(this);
        return vis >= 0 ? true: false;
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.flamingoLayer.setAlpha.call(this,alpha);
    },
    getLastMapRequest : function () {
        return this.mixins.flamingoLayer.getLastMapRequest.call(this);
    },
    getType : function (){
        return this.mixins.flamingoLayer.getType.call(this);
    },
    
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#reload
     */
    reload: function(){
        this.mixins.flamingoLayer.reload.call(this);
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#addListener
     */
    addListener : function(event,handler,scope){
        this.mixins.flamingoLayer.addListener.call(this,event,handler,scope);
    }
});