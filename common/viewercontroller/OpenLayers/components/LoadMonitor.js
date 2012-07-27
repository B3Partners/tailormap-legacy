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
 * LoadMonitor component
 * Creates a LoadMonitor component for OpenLayers
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.viewercontroller.openlayers.LoadMonitor",{
    extend: "viewer.viewercontroller.openlayers.OpenLayersComponent",    
    config:{
        top:null,
        left:null
    },
    
    constructor: function (conf){        
        viewer.viewercontroller.openlayers.LoadMonitor.superclass.constructor.call(this, conf);
        // Make the control and add it to the openlayersmap
        var map = this.viewerController.mapComponent.getMap().getFrameworkMap();
        this.frameworkComponent = new OpenLayers.Control.LoadingPanel();
        map.addControl(this.frameworkComponent);

        if(this.left && this.top){
            this.setPosition(this.top, this.left);
        }
        
        return this;
    },
    
    // Set the position of the loadingpanel
    setPosition : function (top, left){
        var div = this.frameworkComponent.div;
        div.style.top = top + "px";
        div.style.left = left+ "px";
    },
    
    getExtComponents: function() {
        return [];
    }
});
