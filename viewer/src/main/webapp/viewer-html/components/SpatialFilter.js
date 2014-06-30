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
 * Edit component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.SpatialFilter",{
    extend: "viewer.components.Component",
    layerSelector:null,
    drawingButtonIds:null,
    iconPath:null,
    config:{
        title: "",
        iconUrl: "",
        tooltip: "",
        layers:null,
        label: ""
    },
    constructor: function (conf){        
        viewer.components.SpatialFilter.superclass.constructor.call(this, conf);
        this.initConfig(conf);     
        var me = this;
        this.renderButton({
            handler: function(){
                me.showWindow();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip,
            label: me.label
        });
        // Needed to untoggle the buttons when drawing is finished
        this.drawingButtonIds = {
            'polygon': Ext.id(),
            'circle': Ext.id()
        };
        this.iconPath=contextPath+"/viewer-html/components/resources/images/drawing/";
     
        this.loadWindow(); 
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this );
        return this;
    },


    showWindow : function(){
        if(this.vectorLayer == null){
            this.createVectorLayer();
        }
        this.layerSelector.initLayers();
        this.popup.popupWin.setTitle(this.title);
        this.popup.show();
    },
    
    drawPolygon: function(){
        this.vectorLayer.drawFeature("Polygon");
    },
    drawCircle: function(){
        this.vectorLayer.drawFeature("Circle");
    },
    // <editor-fold desc="Event handlers" defaultstate="collapsed">
    layerChanged : function (appLayer,afterLoadAttributes,scope){
        if(appLayer != null){
            this.vectorLayer.removeAllFeatures();
        }else{
            this.cancel();
        }
    },
      
    featureAdded : function (obj, feature){
        var a = 0;
    },
    selectedContentChanged : function (){
       /* if(this.vectorLayer == null){
            this.createVectorLayer();
        }else{
            this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }*/
    },
    // </editor-fold>
    // <editor-fold desc="Initialization methods" defaultstate="collapsed">
    loadWindow : function (){
        var me =this;
        var drawingItems = [
        
        {
            xtype: 'button',
            id: this.drawingButtonIds.polygon,
            icon: this.iconPath+"shape_square_red.png",
            componentCls: 'mobileLarge',
            tooltip: "Teken een polygoon",
            enableToggle: true,
            toggleGroup: 'drawingTools',
            listeners: {
                click:{
                    scope: me,
                    fn: me.drawPolygon
                }
            }
        }];
        if(!MobileManager.isMobile()) {
            drawingItems.push({
                xtype: 'button',
                id: this.drawingButtonIds.circle,
                icon: this.iconPath+"shape_circle_red.png",
                componentCls: 'mobileLarge',
                tooltip: "Teken een cirkel",
                enableToggle: true,
                toggleGroup: 'drawingTools',
                listeners: {
                    click:{
                        scope: me,
                        fn: me.drawCircle
                    }
                }
            });
        }
        
        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [{
                id: this.name + 'LayerSelectorPanel',
                xtype: "container",
                padding: "4px",
                width: '100%',
                height: 36
            },{
                id: this.name + 'filterButtons',
                xtype: "container",
                autoScroll: true,
                width: '100%',
                layout:{
                    type: "vbox"
                },
                flex: 1,
                items: drawingItems
            },{
                id: this.name + 'ClosingPanel',
                xtype: "container",
                width: '100%',
                height: MobileManager.isMobile() ? 45 : 25,
                style: {
                    marginTop: '10px'
                },
                layout: {
                    type:'hbox',
                    pack:'end'
                },
                items: [
                    {xtype: 'button', text: 'Sluiten', componentCls: 'mobileLarge', handler: function() {
                        me.popup.hide();
                    }}
                ]
            }]
        });
        this.createLayerSelector();
    },
    createLayerSelector: function(){
        var config = {
            viewerController : this.viewerController,
            restriction : "filterable",
            id : this.name + "layerSelector",
            layers: this.layers,
            div: this.name + 'LayerSelectorPanel'
        };
        this.layerSelector = Ext.create("viewer.components.LayerSelector",config);
        this.layerSelector.addListener(viewer.viewercontroller.controller.Event.ON_LAYERSELECTOR_CHANGE,this.layerChanged,this);  
    },
    createVectorLayer : function (){
         this.vectorLayer=this.viewerController.mapComponent.createVectorLayer({
            name: this.name + 'VectorLayer',
            geometrytypes:["Circle","Polygon"],
            showmeasures:false,
            viewerController : this.viewerController,
            style: {
                fillcolor: "FF0000",
                fillopacity: 50,
                strokecolor: "FF0000",
                strokeopacity: 50
            }
        });
        this.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        
        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this.featureAdded,this);
    },
    
    //</editor-fold>
   
    
    resetForm : function (){
        this.vectorLayer.removeAllFeatures();
    },
    getExtComponents: function() {
        return [ this.maincontainer.getId() ];
    }
});
