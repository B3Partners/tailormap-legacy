/* 
 * Copyright (C) 2012 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @class 
 * @constructor
 * @description Flamingo Image layer class 
 **/

Ext.define("viewer.viewercontroller.flamingo.FlamingoImageLayer",{
    extend: "viewer.viewercontroller.controller.ImageLayer", 
    mixins: {
        flamingoLayer: "viewer.viewercontroller.flamingo.FlamingoLayer"
    },
    constructor: function(config){
        viewer.viewercontroller.flamingo.FlamingoImageLayer.superclass.constructor.call(this, config);
        this.initConfig(config);
        this.type=viewer.viewercontroller.controller.Layer.IMAGE_TYPE;
        return this;
    },
    getTagName : function(){
        return "LayerImage";
    },    
    /**
     *makes a xml string so the object can be added to flamingo
     *@return a xml string of this object
     **/
    toXML : function(){
        var xml="<fmc:";
        xml+=this.getTagName();
        xml+=" xmlns:fmc=\"fmc\"";
        xml+=" id=\""+this.id+"\"";
     
        xml+=" url=\""+this.url+"\"";
        xml+=" extent=\""+this.extent +"\"";
        xml+=" visible=\""+this.visible+"\"";
        
        xml+="></fmc:"+this.getTagName()+">";

        return xml;
    },

    reload : function (){
        this.getFrameworkLayer().callMethod(this.getFrameworkId(),"update");
    },
    setUrl: function(url){
        this.url=url;
        if (this.getFrameworkLayer()!=null){
            this.getFrameworkLayer().callMethod(this.getFrameworkId(),"setAttribute","url",url);
        }
    },
    setExtent: function(extent){
        this.extent=extent;
        if (this.getFrameworkLayer()!=null && this.map!=null){
            this.getFrameworkLayer().callMethod(this.getFrameworkId(),"setAttribute","extent",extent);
        }
    },    
    getLastMapRequest: function(){
        var url= this.map.getFrameworkMap().callMethod(this.getFrameworkId(),"getServiceUrl");
        return [{url: url,body: null}];
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setVisible
     */
    setVisible: function(vis){
        this.mixins.flamingoLayer.setVisible.call(this,vis);
    },
    /**
     * @see viewer.viewercontroller.flamingo.FlamingoLayer#setAlpha
     */
    setAlpha: function (alpha){
        this.mixins.flamingoLayer.setAlpha.call(this,alpha);
    }    
});