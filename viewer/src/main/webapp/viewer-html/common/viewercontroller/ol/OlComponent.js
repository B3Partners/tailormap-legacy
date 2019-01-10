/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Ext.define("viewer.viewercontroller.ol.OlComponent",{
    extend: "viewer.viewercontroller.controller.Component",
    /**
     * @see viewer.viewercontroller.controller.Component#constructor
     * @param conf the configuration for the component
     * @param frameworkObject the implementing openlayers object
     */
    constructor : function (conf,frameworkObject){
        
        viewer.viewercontroller.ol.OlComponent.superclass.constructor.call(this,conf);
        this.frameworkObject=frameworkObject;
        if(conf.regionName == "content_bottom" && this.config.viewerController.mapComponent.contentBottom){
            // Make a new div and append it to the contentBottom div. So controls can't override other controls (for example the mouseposition renders itself to the content of this.div
            var newDiv = document.createElement('div');
            newDiv.id = conf.id + "content_bottom";
            
            //frameworkObject.target.appendChild(newDiv);
            frameworkObject.setTarget(newDiv);
            if(conf.cssClass){
                newDiv.setAttribute("class", conf.cssClass);
            }
        }
    },
    /**
     * Can be overwritten to do something after the component is added.
     */
    doAfterAdd : function (){
    }
});