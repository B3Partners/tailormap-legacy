/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
 * Creates a measure tool to measure the area
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.tools.FlamingoMeasureArea",{
    extend: "viewer.viewercontroller.flamingo.FlamingoTool",
    config:{
        name: "MeasureArea",
        iconUrl_up: null,
        iconUrl_over: null,
        iconUrl_sel: null,
        iconUrl_dis: null,
        toggle: false,
        enabled: false,
        selected:false,
        tooltip:null
    },
    vectorLayer : null,
    button:null,
    constructor: function (conf){              
        this.initConfig(conf);
        viewer.components.tools.FlamingoMeasureArea.superclass.constructor.call(this, this.config);
        this.id = this.name;
        
        conf.iconUrl_up = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/measureArea/ruler_square.png";
        conf.iconUrl_over = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/measureArea/ruler_square_over.png";
        conf.iconUrl_sel = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/measureArea/ruler_square_over.png";
        conf.iconUrl_dis = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/measureArea/ruler_square.png";
        conf.toggle = true;
        conf.left = this.picLeft;
        conf.top = this.picTop;
          this.button = Ext.create("viewer.components.tools.JSButton", conf);
        var me = this;
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_DOWN,function () {
            me.startMeasure(true);
        }, this);
        this.button.addListener(viewer.viewercontroller.controller.Event.ON_EVENT_UP,function () {
            me.startMeasure(false);
        }, this); 
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name:'measureAreaVector',
            geometrytypes:["Polygon"],
            showmeasures:true,
            viewerController: this.config.viewerController,
            style: {
                'fillcolor': 'FF0000',
                'fillopacity': 50,
                'strokecolor': "FF0000",
                'strokeopacity': 50
            }
        });
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,function(){
            this.startMeasure(false);
        }, this);
        this.mapComponent = this.config.viewerController.mapComponent;
        this.frameworkObject = this.config.viewerController.mapComponent.viewerObject;
        this.config.viewerController.mapComponent.addTool(this);
        return this;
    },
    startMeasure:function(on){
        if(on){
            this.vectorLayer.drawFeature("Polygon");
        }else{
            this.vectorLayer.removeAllFeatures();
        }
    },
    /**
     * Create a xml string for this object.
     * @return string of the xml.
     */
    toXML: function (){        
        var xml="";       
        return xml;
    },
    getTagName: function (){
        return "";
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
     * @param selected true/false if true the button selected state is shown
     */
    setSelectedState : function (selected){
        this.frameworkObject.callMethod(this.getId(),"setSelectedState",selected);
    }
});
