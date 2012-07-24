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


Ext.define ("viewer.viewercontroller.openlayers.ToolMapClick",{
    extend: "viewer.viewercontroller.controller.ToolMapClick",
    handler:null,
    scope:null,
    config:{
        id:null,
        name: null
    },
    constructor: function (conf){
        viewer.viewercontroller.openlayers.ToolMapClick.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        //this.visible=false;
        this.type = viewer.viewercontroller.controller.Tool.MAP_CLICK;
        this.initConfig(conf);
        this.handler = conf.handler.fn;
        this.scope = conf.handler.scope;
        this.olMap=this.viewerController.mapComponent.getMap().getFrameworkMap();
        return this;
    },
    handleClick : function(event){
        var opx = this.olMap.getLonLatFromPixel(event.xy)
        var options = [{
            x: event.xy.x,
            y: event.xy.y},
            {
                x: opx.lon,
                y: opx.lat
            }
        ];
        this.handler.call(this.scope, this,options);
        
    },
    activateTool : function(){
        this.olMap.events.register("click", this, this.handleClick);
    },
    deactivateTool : function (){
        this.olMap.events.unregister("click", this, this.handleClick);
    }
});