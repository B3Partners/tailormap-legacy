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
 * Overview component
 * Creates a overview map
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.viewercontroller.flamingo.Overview",{
    extend: "viewer.viewercontroller.flamingo.FlamingoComponent",
    showButton : null,
    config: {
        // For overview        
        position:null,
        url:null,
        lox:null,
        loy:null,
        rbx:null,
        rby:null,
        // configuration options for the button to open/close the popup
        picSelected:null,
        picOver:null,
        picNormal:null,
        picTop:null,
        picLeft:null,
        followZoom:null
    },
    constructor: function (conf){
        this.initConfig(conf);
        viewer.viewercontroller.flamingo.Overview.superclass.constructor.call(this, this.config);
        this.events = [];
        return this;
    },
    toXML : function (){
        var extent = this.lox +"," +this.loy +"," +this.rbx +"," +this.rby;
        var xml ="<fmc:Map id='Map"+this.name+"'  width='"+this.width+"' height='"+this.height+"' clear='true' ";
        xml += "extent='"+ this.config.viewerController.mapComponent.getMap().getExtent().toString()+"' fullextent='"+ this.config.viewerController.mapComponent.getMap().getMaxExtent().toString()+ "'";
        xml += "listento='"+this.config.viewerController.mapComponent.getMap().getId() +"'>";
        xml +="<fmc:LayerOverview xmlns:fmc='fmc' id='LayerOverview"+ this.name + "' listento='"+this.config.viewerController.mapComponent.getMap().getId() + "' color='#76B6D1'";
        
        if(this.followZoom !== undefined && this.followZoom !== null && this.followZoom ===false){
            xml += " followfactor='10000'/>";
        }else{
            xml += " followfactor='200'/>";
        }
        xml += "<fmc:LayerImage id='layerimageoverview"+this.name+"' imageurl='"+this.url + "'";
        xml+=" extent='"+extent + "' listento='"+this.config.viewerController.mapComponent.getMap().getId() + "'/>";
        xml +="</fmc:Map>";
        var position = "";
        if(this.position == 'upperleft'){
            var topMenuLayout=this.config.viewerController.getLayout('top_menu');
            position = "left = 'left 0' top = '" + topMenuLayout.height;
            position += topMenuLayout.heightmeasure == "px" ? "" : topMenuLayout.heightmeasure;
            position += "'";
        }else if(this.position == 'upperright'){
            var topMenuLayout=this.config.viewerController.getLayout('top_menu');
            position = "right = 'right 0' top = '" + topMenuLayout.height;
            position += topMenuLayout.heightmeasure == "px" ? "" : topMenuLayout.heightmeasure;
            position += "'";
        }else if(this.position == 'lowerleft'){
            var contentBottomLayout=this.config.viewerController.getLayout('content_bottom');
            position = "left = 'left 0' bottom = 'bottom -" + contentBottomLayout.height;
            position += contentBottomLayout.heightmeasure == "px" ? "" : contentBottomLayout.heightmeasure;
            position += "'";
        }else if(this.position == 'lowerright'){
            var contentBottomLayout=this.config.viewerController.getLayout('content_bottom');
            position = "right = 'right 0' bottom = 'bottom -" + contentBottomLayout.height;
            position += contentBottomLayout.heightmeasure == "px" ? "" : contentBottomLayout.heightmeasure;
            position += "'";
        }
        var container;
    
        // Make showbutton
        var conf = {};
        conf.toggle = true;
        conf.enabled = true;
        conf.visible = true;
        conf.selected = true;
        conf.iconUrl_up = this.picNormal;
        conf.iconUrl_over= this.picOver;
        conf.iconUrl_sel= this.picSelected;
        conf.iconUrl_dis= this.picNormal;

        conf.left = this.picLeft;
        conf.top = this.picTop;
        conf.viewerController = this.config.viewerController;
        conf.tooltip = "Open/sluit de overzichtskaart";
        this.showButton = Ext.create("viewer.components.tools.JSButton", conf);
        var me = this;
        this.showButton.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,function () {
            me.showOverview(true);
        }, this);
        this.showButton.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,function () {
            me.showOverview(false);
        }, this);
        container = "<fmc:Container id='"+ this.name + "windowcontainer' "+ position +" width='"+this.width+"' height='"+this.height+"' borderwidth='0' bordercolor='#D0D0D0' backgroundcolor='#FFFFFF'>";
        container += xml;
        container += "</fmc:Container>";
        return container;
    },
    getExtComponents: function() {
        return [];
    },
    showOverview : function (open){
        this.config.viewerController.mapComponent.viewerObject.callMethod( this.name + 'windowcontainer','setVisible',open);  
    }
});
