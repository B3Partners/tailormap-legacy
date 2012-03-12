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
        viewer.components.Print.superclass.constructor.call(this, conf);
        this.initConfig(conf);    
        var me = this;
        this.renderButton({
            handler: function(){
                me.buttonClick();
            },
            text: me.title,
            icon: me.titlebarIcon,
            tooltip: me.tooltip
        });
        //test
        //me.buttonClick();        
        this.vl=viewerController.mapComponent.createVectorLayer({
            id: 'vectorLayer',
            name:'vectorLayer',
            geometrytypes:["Point","LineString","Polygon","MultiPolygon"],
            showmeasures:true
        });
        viewerController.mapComponent.getMap().addLayer(this.vl);
        return this;
    },
    buttonClick: function(){
        this.popup.show();
        this.createForm();
    },
    createForm: function(){
        var me = this;
        if(this.vl.isLoaded){
         //   this.vl.removeAllFeatures();
            this.vl.drawFeature("Point");
       }
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
                        value: "titel"
                    },{                        
                        xtype: "label",
                        text: "Subtitel"
                    },{
                        xtype: 'textfield',
                        name: 'subtitle',
                        value: "Sub titel"
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
                                value: 50,
                                increment: 10,
                                minValue: 0,
                                maxValue: 100,
                                columnWidth: 1
                            },{
                                xtype: 'button',
                                text: '<',
                                width: 30
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
                                    checked: me.getOrientation()=='portrait' 
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
                                store: [['a4','A4'],['a3','A3']],
                                width: 100,
                                value: me.getDefault_format()
                            },{
                                xtype: 'label',  
                                text: "Kaart draaien"  
                            },{
                                xtype: 'slider',
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
                    }                  
                },{
                    xtype: 'button',
                    text: 'Opslaan als PDF'  ,
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    }                  
                },{
                    xtype: 'button',
                    text: 'Printen via PDF',
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    }
                }]                
            }]
        });
    },
    submitSettings: function(){
        var properties = this.getValuesFromContainer(this.panel);
        console.log(properties);
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

