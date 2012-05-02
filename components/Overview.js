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
 * Overview component
 * Creates a overview map
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Overview",{
    extend: "viewer.components.Component",
    showButton : null,
    config: {
        position:null,
        width:null,
        height:null,
        left:null,
        right:null,
        top:null,
        bottom:null,
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
        picLeft:null
    },
    constructor: function (conf){        
        viewer.components.Overview.superclass.constructor.call(this, conf);
        this.initConfig(conf);        
        this.makeComponents();
        return this;
    },
    makeComponents : function (){
        var extent = this.lox +"," +this.loy +"," +this.rbx +"," +this.rby;
        var xml ="<fmc:Map id='Map"+this.name+"'  width='"+this.width+"' height='"+this.height+"' clear='true' ";
        xml += "extent='"+ this.viewerController.mapComponent.getMap().getExtent().toString()+"' fullextent='"+ this.viewerController.mapComponent.getMap().getMaxExtent().toString()+ "'";
        xml += "listento='"+this.viewerController.mapComponent.getMap().getId() +"'>";
        xml +="<fmc:LayerOverview xmlns:fmc='fmc' id='LayerOverview"+ this.name + "' listento='"+this.viewerController.mapComponent.getMap().getId() + "' color='#76B6D1'";
        xml += " followfactor='200'/>";
        xml += "<fmc:LayerImage id='layerimageoverview"+this.name+"' imageurl='"+this.url + "'";
        xml+=" extent='"+extent + "' listento='"+this.viewerController.mapComponent.getMap().getId() + "'/>";
        xml +="</fmc:Map>";
        var container;
        var position = "";
        if(this.left != null && this.left != ''){
            position += " left ='" + this.left + "'";
        }
        if(this.right != null && this.right != ''){
            position += " right ='" + this.right + "'";
        }
        if(this.top != null && this.top != ''){
            position += " top ='" + this.top + "'";
        }
        if(this.bottom != null && this.bottom != ''){
            position += " bottom ='" + this.bottom + "'";
        }
        if(this.position == "popup"){
            var window = "<cmc:Window xmlns:cmc='cmc' id='"+ this.name + "Window' "+ position +" width='"+this.width+"' height='"+this.height+"' canclose='false'>";
            window += "<fmc:Container id='"+ this.name + "windowcontainer' left='0' width='100%' height='100%' top='0' backgroundcolor='#FFFFFF'>";
            window += xml;
            window += "</fmc:Container>";
            window += "</cmc:Window>";
            container = window;
            
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
            conf.viewerController = this.viewerController;
            conf.tooltip = "Open/sluit de overzichtskaart";
            this.showButton = Ext.create("viewer.components.tools.JSButton", conf);
            var me = this;
            this.showButton.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,function () {
                me.showOverview(true);
            }, this);
            this.showButton.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,function () {
                me.showOverview(false);
            }, this);
        }else if(this.position =="inmap"){
            container = "<fmc:Container id='"+ this.name + "windowcontainer' "+ position +" width='"+this.width+"' height='"+this.height+"' backgroundcolor='#FFFFFF'>";
            container += xml;
            container += "</fmc:Container>";
        }
        
        this.viewerController.mapComponent.viewerObject.callMethod(this.viewerController.mapComponent.mainContainerId,'addComponent',container);      
    },
    getExtComponents: function() {
        return [];
    },
    showOverview : function (open){
        this.viewerController.mapComponent.viewerObject.callMethod( this.name + "Window",'setVisible',open);  
    }
});
