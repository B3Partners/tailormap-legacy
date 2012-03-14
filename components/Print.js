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
 * Print component
 * Creates a AttributeList component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
Ext.define ("viewer.components.Print",{
    extend: "viewer.components.Component",  
    panel: null,
    vl:null,
    minKwality: 128,
    minWidth: 500,
    combineImageService: null,
    config:{
        name: "Print",
        title: "",
        titlebarIcon : "",
        tooltip : "",
        default_format: null,
        orientation: null,
        legend: null
    },
    constructor: function (conf){  
        //set minwidth:
        if(conf.details.width < this.minWidth || !Ext.isDefined(conf.details.width)) conf.details.width = this.minWidth; 
        
        viewer.components.Print.superclass.constructor.call(this, conf);
        this.initConfig(conf);    
        
        this.combineImageService = Ext.create("viewer.CombineImage",{});
        
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.title,
            icon: me.titlebarIcon,
            tooltip: me.tooltip
        });
        
        return this;
    },
    buttonClick: function(){
        var getImage=false;
        if(!this.popup.popupWin.isVisible()){
            this.popup.show();
            getImage=true;
        }
        if (this.panel==null)
            this.createForm();
        if (getImage){
            this.redrawPreview();
        }
    },
    createForm: function(){
        var me = this;
        
        this.panel = Ext.create('Ext.panel.Panel', {
            frame: false,
            bodyPadding: 5,
            width: "100%",
            height: "100%",
            renderTo: me.getContentDiv(),
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
                
            },            
            items: [{
                //top container (1)
                xtype: 'container',
                height: 200,
                items: [{
                    xtype: 'image',
                    src: '',
                    id: 'previewImg',                    
                    height: 200,
                    border: 1
                }]                
            },{
                //bottom container (2)
                xtype: 'container',
                layout: {
                    type: 'column'
                },
                width: '100%',
                items: [{
                    //bottom left (3)
                    xtype: 'container',
                    columnWidth: 0.4,
                    items: [{                        
                        xtype: "label",
                        text: "Titel"
                    },{
                        xtype: 'textfield',
                        width: '100%',                        
                        name: 'title',
                        value: ""
                    },{                        
                        xtype: "label",
                        text: "Subtitel"
                    },{
                        xtype: 'textfield',
                        name: 'subtitle',
                        value: ""
                    },{                        
                        xtype: "label",
                        text: "Optionele Tekst"
                    },{
                        xtype: 'textfield',
                        name: 'extraTekst',
                        value: ""
                    }]
                },{
                    //bottom right (4)
                    xtype: 'container',
                    columnWidth: 0.6,
                    items: [{
                        //kwality row (5)
                        xtype: 'container',                        
                        width: '100%',
                        items: [{                        
                            xtype: "label",
                            text: "Kwaliteit"
                        },{
                            xtype: 'container',
                            layout: {
                                type: 'column'
                            },
                            width: '100%',
                            items: [{
                                xtype: 'slider',
                                name: "quality",
                                value: 50,
                                increment: 10,
                                minValue: 0,
                                maxValue: 100,
                                columnWidth: 1
                            },{
                                xtype: 'button',
                                text: '<',
                                width: 30
                                //todo handle reset
                            }]
                        }]
                    },{
                        // (6)
                        xtype: 'container',
                        layout: {type: 'column'},
                        items: [{
                            //(7)
                            xtype: 'container',
                            columnWidth: 0.5,        
                            items: [{                                
                                xtype: 'label',
                                text: 'Orientatie'
                            },{
                                xtype: 'radiogroup',
                                name: "orientation", 
                                width: 125,
                                items: [{
                                    boxLabel: 'Liggend', 
                                    name: 'orientation', 
                                    inputValue: 'landscape', 
                                    checked: me.getOrientation()=='landscape'
                                },{
                                    boxLabel: 'Staand', 
                                    name: 'orientation', 
                                    inputValue: 'portrait', 
                                    checked: !(me.getOrientation()=='landscape') 
                                }]                            
                            },{
                                xtype: 'checkbox',
                                name: 'legenda',
                                checked: me.getLegend(),
                                boxLabel: 'Legenda toevoegen'
                            }]                        
                        },{
                            //(8)
                            xtype: 'container',
                            columnWidth: 0.5,
                            items: [{
                                xtype: 'label',  
                                text: "Pagina formaat"  
                            },{
                                xtype: 'combo',                                
                                name: 'pageformat',
                                store: [['a4','A4'],['a3','A3']],
                                width: 100,
                                value: me.getDefault_format()? me.getDefault_format(): "a4"
                            },{
                                xtype: 'label',  
                                text: "Kaart draaien"  
                            },{
                                xtype: 'slider',
                                name: 'angle',
                                value: 0,
                                increment: 1,                                
                                minValue: 0,
                                maxValue: 360,
                                width: 100,
                                tipText: function(tumb){
                                    return tumb.value+"º";
                                }
                            }] 
                        }]
                    }]                        
                }]
            },{
                //button container 2b
                xtype: 'container',
                frame: true,
                border: true,
                style: {
                    paddingTop: "5px"
                },
                items: [{
                    xtype: 'button',
                    text: 'Opslaan als RTF'  ,
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                this.submitSettings("saveRTF")
                            }
                        }
                    }                  
                },{
                    xtype: 'button',
                    text: 'Opslaan als PDF'  ,
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                this.submitSettings("savePDF")
                            }
                        }
                    }                    
                },{
                    xtype: 'button',
                    text: 'Printen via PDF',
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                this.submitSettings("printPDF")
                            }
                        }
                    }  
                }]                
            }]
        });
    },
    /**
    * Call to redraw the preview
    */
    redrawPreview: function (){
        var properties = this.getProperties();
        this.combineImageService.getImageUrl(Ext.JSON.encode(properties),this.imageSuccess,this.imageFailure);
    },
    /**
    * Called when a button is clicked and the form must be submitted.
    */
    submitSettings: function(action){        
        var properties = this.getProperties();
        properties.action=action;
        this.combineImageService.getImageUrl(Ext.JSON.encode(properties),this.imageSuccess,this.imageFailure);
        
    },
    /**
     *Called when the imageUrl is succesfully returned
     *@param imageUrl the url to the image
     */
    imageSuccess: function(imageUrl){        
        if(Ext.isEmpty(imageUrl) || !Ext.isDefined(imageUrl)) imageUrl = null;
        Ext.getCmp("previewImg").el.dom.src = imageUrl;
    },
    /**
     *Called when the imageUrl is succesfully returned
     *@param error the error message
     */
    imageFailure: function(error){
        console.log(error);
    },
    /**
     *Get all the properties from the map and the print form
     */
    getProperties: function(){
        var properties = this.getValuesFromContainer(this.panel);
        var mapProperties=this.getMapValues();        
        Ext.apply(properties, mapProperties);
        return properties;
    },
    /**
     *Get all the map properties/values
     */
    getMapValues: function(){
        var values = new Object();
        var printLayers = new Array();
        //get last getmap request from wms layers
        var layers=viewerController.mapComponent.getMap().getLayers();        
        for (var i=0; i < layers.length; i ++){
            var layer = layers[i];
            if (layer.getType()== viewer.viewercontroller.controller.Layer.WMS_TYPE){
                var request=layer.getMapRequest();
                if (request){
                    if (layer.getAlpha()!=null)
                        request.alpha = layer.getAlpha();           
                    printLayers.push(
                        request
                    );
                }
            }
        }
        values.requests=printLayers;
        
        return values;
    },
    /**
     * Get the item values of the given container.
     */
    getValuesFromContainer: function(container){
        var config=new Object();
        for( var i = 0 ; i < container.items.length ; i++){
            //if its a radiogroup get the values with the function and apply the values to the config.
            if ("radiogroup"==container.items.get(i).xtype){
                Ext.apply(config, container.items.get(i).getValue());       
            }else if ("container"==container.items.get(i).xtype){
                Ext.apply(config,this.getValuesFromContainer(container.items.get(i)));
            }else if (container.items.get(i).name!=undefined)
                config[container.items.get(i).name] = container.items.get(i).value;
        }
        return config;
    }
});

