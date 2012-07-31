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
  *Openlayers implementation of Tool.
  *@see viewer.viewercontroller.controller.Tool
  *@author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
  *@author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
  **/
Ext.define("viewer.viewercontroller.openlayers.OpenLayersTool",{
    extend: "viewer.viewercontroller.controller.Tool",
    onActiveHandler:null,
    controls:null,
    constructor : function (conf,frameworkObject){
        viewer.viewercontroller.openlayers.OpenLayersTool.superclass.constructor.call(this, conf);                       
        this.frameworkObject=frameworkObject;
        this.controls = new Array();
        this.onActiveHandler = new Object();
        return this;
    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#getId
     */
    getId : function(){
        return this.id;
    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#setToolVisible
     */
    setToolVisible : function(visibility){
        this.setVisible(visibility);
        if (visibility){
            this.getFrameworkTool().panel_div.style.display="block";
        }else{
            this.getFrameworkTool().panel_div.style.display="none";
        }
    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#isActive
     */
    isActive : function (){
        return this.getFrameworkTool().active;
    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#onSetActive
     */
    onSetActive : function(data){
        this.onActiveHandler(this.getId(),data);
    }
});