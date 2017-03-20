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
 * @constructor
 * @description Flamingo Arc layer super class
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoArcLayer",{
    extend: "viewer.viewercontroller.controller.ArcLayer",
    mixins: {
        flamingoLayer: "viewer.viewercontroller.flamingo.FlamingoLayer"
    },
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoArcLayer.superclass.constructor.call(this, config);
        this.mixins.flamingoLayer.constructor.call(this,config);
        this.initConfig(config);
        return this;
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
        viewer.viewercontroller.flamingo.FlamingoArcLayer.superclass.setMaptips.call(this,maptips);        
        this.passMaptips();
    },
    passMaptips: function(){
        this.map.getFrameworkMap().callMethod(this.map.id + "_" + this.id, "setMaptipLayers", this.maptips.join(","));
    },   
    getLegendGraphic: function (){
        //console.log("getLegendGraphic still needs to be implemented in ArcLayer");
        return null;
    },
    setBuffer : function (radius,layer){
        console.log("FlamingoArcLayer.setBuffer: .setBuffer() must be made!");
    },
    removeBuffer: function(layer){        
        console.log("FlamingoArcLayer.removeBuffer: .removeBuffer() must be made!");
    },
    getLastMapRequest : function () {
        return this.mixins.flamingoLayer.getLastMapRequest.call(this);
    },
    /**
     *@see viewer.viewercontroller.flamingo.FlamingoLayer#getVisible
     */
    getType : function (){
        return this.mixins.flamingoLayer.getType.call(this);
    }, 
    setVisible : function (vis){
        this.mixins.flamingoLayer.setVisible.call(this,vis);
    },
    
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setVisible
     */
    getVisible: function(){
        var vis = this.mixins.flamingoLayer.getVisible.call(this);
        return vis >=0 ? true: false;
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
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#destroy
     */
    destroy: function (){
        this.mixins.flamingoLayer.destroy.call(this);
    }
});