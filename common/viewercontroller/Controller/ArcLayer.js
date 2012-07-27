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
 * Abstract component to for Arc Layers
  *@author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define("viewer.viewercontroller.controller.ArcLayer",{
    extend: "viewer.viewercontroller.controller.Layer",
    constructor: function(config){
        viewer.viewercontroller.controller.ArcLayer.superclass.constructor.call(this,config);
    },
    getId :function (){
        Ext.Error.raise({msg: "ArcLayer.getId() Not implemented! Must be implemented in sub-class"});
    },
    reload : function (){
        Ext.Error.raise({msg: "ArcLayer.reload() Not implemented! Must be implemented in sub-class"});
    },
    getName : function (){
        Ext.Error.raise({msg: "ArcLayer.getName() Not implemented! Must be implemented in sub-class"});
    },
    //TODO: remove Not for all arclayers!
    getServer :function (){
        Ext.Error.raise({msg: "ArcLayer.getServer() Not implemented! Must be implemented in sub-class"});
    },
    //TODO: remove Not for all arclayers!
    getService : function (){
        Ext.Error.raise({msg: "ArcLayer.getService() Not implemented! Must be implemented in sub-class"});
    },
    //TODO: remove Not for all arclayers!
    getServlet : function (){
        Ext.Error.raise({msg: "ArcLayer.getServlet() Not implemented! Must be implemented in sub-class"});
    },
    //TODO: remove Not for all arclayers!
    getMapservice : function (){
        Ext.Error.raise({msg: "ArcLayer.getMapservice() Not implemented! Must be implemented in sub-class"});
    },
    getLayers : function(){
        Ext.Error.raise({msg: "ArcLayer.getLayers() Not implemented! Must be implemented in sub-class"});
    },
    setMaptips: function(maptips){
        Ext.Error.raise({msg: "ArcLayer.setMaptips() Not implemented! Must be implemented in sub-class"});
    },
    passMaptips: function(){
        Ext.Error.raise({msg: "ArcLayer.passMaptips() Not implemented! Must be implemented in sub-class"});
    },    
    setVisible : function (visible){
        Ext.Error.raise({msg: "ArcLayer.setVisible() Not implemented! Must be implemented in sub-class"});
    },
    getLegendGraphic: function (){
        Ext.Error.raise({msg: "ArcLayer.getLegendGraphic() Not implemented! Must be implemented in sub-class"});
    },
    setBuffer : function (radius,layer){
        Ext.Error.raise({msg: "ArcLayer.setBuffer() Not implemented! Must be implemented in sub-class"});
    },
    removeBuffer: function(layer){        
        Ext.Error.raise({msg: "ArcLayer.removeBuffer() Not implemented! Must be implemented in sub-class"});
    }
});

