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
  *FlamingoComponent. Implementation of Component.
  *@see viewer.viewercontroller.controller.Component
  *@author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
  **/
Ext.define("viewer.viewercontroller.flamingo.FlamingoComponent",{
    extend: "viewer.viewercontroller.controller.Component",
    strings: null,
    config: {
        tagName: null,
        width: null,
        height: null,
        left: null,
        right: null,
        top: null,
        bottom: null,
        listenTo: null,
        //for scalebar:
        units: null,
        maptipdelay: 500,
        //for coordinates
        decimals: null,
        //for navigation panel
        showZoomerButtons: null
    },       
    /** Create a new FlamingoTool
     *param config.id id of this object
     *param config.type the type of the component
     *param config.width the width of the component
     *param config.height the height of the component
     *param config.left margin at the left side
     *param config.right margin of the right side
     *param config.bottom margin at the bottom side
     *param config.listenTo the component id to listen to
     */
    constructor : function (config){
        //replace the . for flamingo
        if (config.id){
            config.id=config.id.replace(/\./g,"_");
        }
        this.strings = new Object();
        viewer.viewercontroller.flamingo.FlamingoComponent.superclass.constructor.call(this, config);
        this.initConfig(config);
        //translate type to tagName
        if(config.type==viewer.viewercontroller.controller.Component.BORDER_NAVIGATION){
            this.setTagName("BorderNavigation");
            //because the bordernavigation needs the bounds of the map:
            var attrPosMap= config.viewerController.mapComponent.getMap().getPositionAttributes();
            for (var key in attrPosMap){
                this[key]=attrPosMap[key];
            }
            if (config.tooltip_pan_right!=undefined){
                this.addString("tooltip_west",config.tooltip_pan_right);
            }
            if (config.tooltip_pan_left!=undefined){
                this.addString("tooltip_east",config.tooltip_pan_left);
            }
            if (config.tooltip_pan_up!=undefined){
                this.addString("tooltip_north",config.tooltip_pan_up);
            }
            if (config.tooltip_pan_down!=undefined){
                this.addString("tooltip_south",config.tooltip_pan_down);
            }
        }else if(config.type==viewer.viewercontroller.controller.Component.SCALEBAR){
            this.setTagName("Scalebar");
            this.setBottom("bottom +20");
            this.setLeft("50");
            this.setWidth("200");
            if (this.getUnits()==null)
                this.setUnits("m");                
        }else if(config.type==viewer.viewercontroller.controller.Component.COORDINATES){
            this.setTagName("Coordinates");
            this.setBottom("bottom");
            this.setRight("right -80");
            this.addString("xy","X: [x] Y: [y]");
        }else if(config.type==viewer.viewercontroller.controller.Component.NAVIGATIONPANEL){
            this.setTagName("NavigationControl");
            this.setTop("50");
            this.setLeft("20");
            if (this.getHeight()==null|| this.getHeight()=="")
                this.setHeight("300");
            if (config.show_zoom_buttons!=undefined)
                this.setShowZoomerButtons(config.show_zoom_buttons);
            if (config.tooltip_pan_right!=undefined){
                this.addString("tooltip_west",config.tooltip_pan_right);
            }
            if (config.tooltip_pan_left!=undefined){
                this.addString("tooltip_east",config.tooltip_pan_left);
            }
            if (config.tooltip_pan_up!=undefined){
                this.addString("tooltip_north",config.tooltip_pan_up);
            }
            if (config.tooltip_pan_down!=undefined){
                this.addString("tooltip_south",config.tooltip_pan_down);
            }
            if (config.tooltip_slider!=undefined){
                this.addString("tooltip_slider",config.tooltip_slider);
            }
        }else if (config.type == viewer.viewercontroller.controller.Component.MAPTIP){           
            this.setTagName("Maptip");
        }else if (config.type == viewer.viewercontroller.controller.Component.LOADMONITOR){           
            this.setTagName("MonitorMap");
            if (this.getWidth()==null){
                this.setWidth("200");
            }
            if (config.loadingText!=undefined){
                this.addString("loading",config.loadingText);
                this.addString("waiting",config.loadingText);
            }           
        }else if(config.type == viewer.viewercontroller.controller.Component.OVERVIEW){
        } else{
            Ext.Error.raise({msg: "Can't find type of component or component not supported"});
        }    
        return this;
    },
    /**
     * Sets the tool visibility
     * param visibility the visibility
     * @see MapComponent#setVisible
     */
    setVisible: function (visibility){
        this.getFrameworkTool().callMethod(this.getId(),'setVisible',visibility);
    },
    /**
     * Create a xml string for this object.
     * @return string of the xml.
     */
    toXML: function (){        
        var xml="<fmc:";
        xml+=this.getTagName();
        xml+="  xmlns:fmc='fmc' "+this.getParamsAsXml();        
        xml+=">";
        for (var key in this.strings){
            xml+="<string id='"+key+"' en='"+this.strings[key]+"'/>";
        }
        xml+="</fmc:"+this.getTagName()+">";
        return xml;
    }, 
    getParamsAsXml: function(){
        var xml="";
        if (this.getId()!=null)
            xml+="id='"+this.getId()+"'";
        if (this.getWidth()!=null)
            xml+=" width='"+this.getWidth()+"'";
        if (this.getHeight()!=null)
            xml+=" height='"+this.getHeight()+"'";
        if (this.getTop()!=null)
            xml+=" top='"+this.getTop()+"'";
        if (this.getLeft()!=null)
            xml+=" left='"+this.getLeft()+"'";
        if (this.getRight()!=null)
            xml+=" right='"+this.getRight()+"'";
        if (this.getBottom()!=null)
            xml+=" bottom='"+this.getBottom()+"'";        
        if (this.getListenTo()!=null)
            xml+=" listento='"+this.getListenTo()+"'";
        if (this.getUnits()!=null)
            xml+=" units='"+this.getUnits()+"'";
        if (this.getDecimals()!=null)
            xml+=" decimals='"+this.getDecimals()+"'";
        if (this.getShowZoomerButtons()!=null)
            xml+=" showzoomerbuttons='"+this.getShowZoomerButtons()+"'";
        return xml;
    },
    /**
     * Adds a string to the FlamingoComponent.
     * param key the name of the string
     * param string the string
     */
    addString: function(key,string){
        this.strings[key]=string;
    },
    /**
     * Get the string
     * param key the key of the string
     * @return the string that is set for the given key
     */
    getString: function(key){
        return this.strings[key];
    },
    resize : function (){
        // Stub. Openlayers needs a resize on some framework specific components
    }
    
});

