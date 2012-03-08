/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
 * Creates a JSButton with the given configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.ToolMapClick",{
    extend: "viewer.viewercontroller.flamingo.FlamingoTool",
    id: null,
    config:{
        name: "ToolMapClick"
    },
    constructor: function (conf){              
        viewer.components.tools.ToolMapClick.superclass.constructor.call(this, conf);
        this.id = conf.id + "_toolMapClick";
        this.initConfig(conf);
        this.mapComponent = this.viewerController.mapComponent;
        this.frameworkObject = this.viewerController.mapComponent.viewerObject;
        this.addListener(viewer.viewercontroller.controller.Event.ON_MAP_CLICKED,this.clicked,this);
        
        this.addTool();
        //this.viewerController.mapComponent.addTool(this);
        return this;
    },
    /**
     * Create a xml string for this object.
     * @return string of the xml.
     */
    addTool: function (){        
        var toolGroupId = this.mapComponent.getToolGroup();
         var toolXml="<fmc:ToolGroup id='"+toolGroupId+"'>";
        toolXml+="<fmc:ToolMapClick id='"+this.id+"' listento='"+ this.mapComponent.getMap().getId()+"'/>";
        toolXml+="</fmc:ToolGroup>";        
        this.frameworkObject.callMethod(this.mapComponent.flamingoId,'addComponent',toolXml);    
        
        this.mapComponent.tools.push(this);
    },
    activateTool : function(){
        this.frameworkObject.callMethod(this.id,"activate");
    },
    deactivateTool : function(){
        this.frameworkObject.callMethod(this.id,"deactivate");
    },
    clicked : function (toolMapClick,comp){
        var coords = comp[1];
        var x = coords.x;
        var y = coords.y;
        // Do request to backend, give this.addWktToMapcomponent() as callback.
    },
    addWktToMapcomponent : function (wkt){
        // Do it
    }
});
