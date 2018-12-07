/**
 * @class 
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
        
        // the values for these attributes are used in a URL but Flamingo does 
        // not apply URI encoding
        // use lowercase attribute names
        var needsURIEncoding = { 
            'sld': true 
        };
        
        for (var optKey in this.options){
            var value = this.options[optKey];
            if(needsURIEncoding[optKey.toLowerCase()]) {
                value = encodeURIComponent(value);
            }
            xml+=" "+optKey+"=\""+value+"\"";
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
        if(filter && filter.getCQL() != ""){
            var service = this.config.viewerController.app.services[this.serviceId];
            var layer = service.layers[this.options.name];
            if(layer.details != undefined){
                var filterable =layer.details["filterable"];
                if(filterable != undefined && filterable != null ){
                    filterable = Ext.JSON.decode(filterable);
                    if(filterable){
                        var url = Ext.create(viewer.SLD).createURL(
                            this.options["layers"], 
                            this.getOption("styles") || "default", 
                            [filter.getCQL()],
                            layer.hasFeatureType ? layer.featureTypeName : null,
                            this.config.sld ? this.config.sld.id : null
                        );
                        this.getFrameworkLayer().callMethod(this.map.getId() + "_" + this.getId(),"setAttribute","sld",encodeURIComponent(url));
                        this.reload();
                    }
                }
            }
        }else{
            var fl = this.getFrameworkLayer();
            if(this.config.originalSldUrl) {
                fl.callMethod(this.map.getId() + "_" + this.getId(),"setAttribute","sld",encodeURIComponent(this.config.originalSldUrl));
            } else {
                fl.callMethod(this.map.getId() + "_" + this.getId(),"removeAttribute","sld");
            }
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
        this.mixins.flamingoLayer.reload.call(this);
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
    },    
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#destroy
     */
    destroy: function (){
        this.mixins.flamingoLayer.destroy.call(this);
    }
});