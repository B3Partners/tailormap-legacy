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
 * Creates a JSButton with the given configuration
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.JSButton",{
    extend: "viewer.viewercontroller.flamingo.FlamingoTool",
    config:{
        name: "JSButton",
        iconUrl_up: null,
        iconUrl_over: null,
        iconUrl_sel: null,
        iconUrl_dis: null,
        toggle: false,
        enabled: false,
        selected:false,
        tooltip:null
    },
    constructor: function (conf){              
        this.initConfig(conf);
		viewer.components.tools.JSButton.superclass.constructor.call(this, this.config);
        this.id = this.name;
        this.mapComponent = this.config.viewerController.mapComponent;
        this.frameworkObject = this.config.viewerController.mapComponent.viewerObject;
        this.config.viewerController.mapComponent.addTool(this);
        return this;
    },
    /**
     * Create a xml string for this object.
     * @return string of the xml.
     */
    toXML: function (){        
        var xml="<fmc:";
        xml+=this.getTagName();
        xml += " xmlns:fmc='fmc'"
        if (this.getId()!=null)
            xml+=" id='"+this.getId()+"'";
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
        if (this.getListenTo()!=null){
            xml+=" listento='"+this.getListenTo()+"'";
        }
        xml += " iconurl_up='"+this.iconUrl_up+"'";
        xml += " iconurl_down='"+this.iconUrl_down+"'";
        xml += " iconurl_over='"+this.iconUrl_over+"'";
        xml += " iconurl_sel='"+this.iconUrl_sel+"'";
        xml += " iconurl_dis='"+this.iconUrl_dis+"'";
        if (this.visible!=undefined){
            xml += " visible='"+this.visible+"'";
        }
        if (this.getEnabled()!=null){
            xml += " enabled='"+this.enabled+"'";
        }
        xml += " selected='"+this.selected+"'";
        xml += " toggle='"+this.toggle+"'";
        xml+=">";    
        if (this.getTooltip()!=null)
            xml+="<string id='tooltip' en='"+this.getTooltip()+"'/>";
        xml+="</fmc:"+this.getTagName(this.getType())+">"
        return xml;
    },
    getTagName: function (){
        return "JsButton";
    },
    
    /**
     * @see viewer.viewercontroller.controller.Tool#activate
     */
    activate: function(){
        this.setSelectedState(true);
    },
    /**
     * @see viewer.viewercontroller.controller.Tool#deactivate
     */
    deactivate: function(){
        this.setSelectedState(false);
    },
    /**
     * Show selected state
     * param selected true/false if true the button selected state is shown
     */
    setSelectedState : function (selected){
        this.frameworkObject.callMethod(this.getId(),"setSelectedState",selected);
    }
});
