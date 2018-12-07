/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class 
 * @description Flamingo Tiling layer
 **/

Ext.define("viewer.viewercontroller.flamingo.FlamingoTilingLayer",{
    extend: "viewer.viewercontroller.controller.TilingLayer",
    mixins: {
        flamingoLayer: "viewer.viewercontroller.flamingo.FlamingoLayer"
    },
    /**
     *
     * @constructor
     * param config.id the id
     * param config.url the url of the service
     * param config.serviceEnvelope the service envelope
     * param config.type the tiling type (OSM,TMS,WMSc,arcgisrest)
     * param config.tileHeight the height of the tiling images
     * param config.tileWidth the width of the tiling images
     */
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoTilingLayer.superclass.constructor.call(this, config);
        this.mixins.flamingoLayer.constructor.call(this,config);
        
        return this;
    },
    getTagName : function(){
        return "TilingLayer";
    },    
    /**
     *makes a xml string so the object can be added to flamingo
     *@return a xml string of this object
     **/
    toXML : function(){

        var url = this.getUrl();

        if(this.getProtocol() == "ArcGisRest") {
            if(!/\/tile\/?$/.test(url)) {
                url += "/tile/";
            }
        }
        
        var xml="<fmc:";
        xml+=this.getTagName();
        xml+=" xmlns:fmc=\"fmc\"";
        xml+=" id=\""+this.getId()+"\"";     
        xml+=" serviceurl=\""+url+"\"";
        xml+=" resolutions=\""+this.getResolutions().join(",")+"\"";
        xml+=" serviceenvelope=\""+this.getServiceEnvelope()+"\"";
        if (this.getProtocol()!=null){
            xml+=" type=\""+this.getProtocol()+"\"";
        }
        if (this.getTileHeight()!=null){
            xml+=" tileheight=\""+this.getTileHeight()+"\"";
        }
        if (this.getTileWidth()!=null){
            xml+=" tilewidth=\""+this.getTileWidth()+"\"";
        }
        if (this.getExtension()!=null){
            xml+=" extension=\""+this.getExtension()+"\"";
        }
        if(this.config.alpha != null) {
            xml += " alpha=\"" + this.config.alpha + "\"";
        }
        xml+="></fmc:"+this.getTagName()+">";
        return xml;
    },
    /*setVisible : function (visible){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setVisible", visible);
        this.visible = visible;
    },*/
    getLegendGraphic : function(){
        return null;
    },
    getLayers : function (){
        return null;
    },
    getLastMapRequest: function(){
        var requests=this.map.getFrameworkMap().callMethod(this.getFrameworkId(),'getLastRequests');
        for (var i in requests){
            if(requests[i].extent){
                requests[i].extent= new viewer.viewercontroller.controller.Extent(requests[i].extent.minx,requests[i].extent.miny,requests[i].extent.maxx,requests[i].extent.maxy);
            }
        }
        return requests;
    },
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
        return this.mixins.flamingoLayer.getVisible.call(this);
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.flamingoLayer.setAlpha.call(this,alpha);
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
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#getType
     */
    getType : function(){
        return this.mixins.flamingoLayer.getType.call(this);
    },    
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#destroy
     */
    destroy: function (){
        this.mixins.flamingoLayer.destroy.call(this);
    }
});

