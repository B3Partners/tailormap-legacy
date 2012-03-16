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
 * Drawing component
 * Creates a Drawing component
 * @author <a href="mailto:meinetoonen@b3partners.nl">Meine Toonen</a>
 */
Ext.define ("viewer.components.Drawing",{
    extend: "viewer.components.Component",   
    iconPath: null,
    // Forms
    formdraw : null,
    formselect : null,
    formsave : null,
    formopen : null,
    vectorLayer:null,
    // Items in forms. Convience accessor 
    colorPicker:null,
    label:null,
    title:null,
    comment:null,
    file:null,
    // Current active feature
    activeFeature:null,
    features:null,
    config:{
        title: "",
        iconUrl: "",
        tooltip: "",
        color: ""
    },
    constructor: function (conf){        
        viewer.components.Drawing.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        this.features = new Object();
        var me = this;
        this.renderButton({
            handler: function(){
                me.popup.show();
            },
            text: me.title,
            icon: me.iconUrl,
            tooltip: me.tooltip
        });
        
        this.vectorLayer=viewerController.mapComponent.createVectorLayer({
            id: 'drawingVectorLayer',
            name:'drawingVectorLayer',
            geometrytypes:["Circle","Polygon","Point","LineString"],
            showmeasures:false,
            style: {
                fillcolor: "0x"+this.color,
                fillopacity: 50,
                strokecolor: "0xFF0000",
                strokeopacity: 100
            }
        });
        viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this.activeFeatureChanged,this);
        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this.activeFeatureFinished,this);
        this.iconPath=contextPath+"/viewer-html/components/resources/images/drawing/";
        this.loadWindow();
        this.popup.show();
        return this;
    },
    /**
     * Create the GUI
     */
    loadWindow : function(){
        var me=this;
        this.colorPicker = Ext.create("Ext.ux.ColorField",{ 
            width: 40,
            showText: false,
            name: 'color',
            id:'color',
            value: this.color,
            listeners :{
                select : {
                    fn: this.colorChanged,
                    scope : this
                }
            }
        });
        
        this.label = Ext.create("Ext.form.field.Text",{
            name: 'labelObject',
            fieldLabel: 'Label geselecteerd object',
            labelWidth: 150,
            id: 'labelObject' + this.name,
            listeners:{
                change:{
                    fn: this.labelChanged,
                    scope:this
                }
            }
        });
        this.formdraw = new Ext.form.FormPanel({
            items: [{ 
                xtype: 'fieldset',
                defaultType: 'textfield',
                padding: 0,
                style: {
                    border: '0px none',
                    margin : '5px'
                },
                items: [
                {
                    xtype: 'label',
                    text: 'Objecten op de kaart tekenen'
                },
                {
                    xtype: 'fieldset',
                    layout:{
                        type:'hbox',
                        defaultMargins:{
                            top: 5, 
                            right: 5, 
                            bottom: 0, 
                            left: 0
                        }
                    },
                    //border: 0,
                    items: [{
                        xtype: 'button',
                        icon: this.iconPath+"bullet_red.png",
                        tooltip: "Teken een punt",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.drawPoint
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        icon: this.iconPath+"line_red.png",
                        tooltip: "Teken een lijn",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.drawLine
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        icon: this.iconPath+"shape_square_red.png",
                        tooltip: "Teken een polygoon",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.drawPolygon
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        icon: this.iconPath+"shape_square_red.png",
                        tooltip: "Teken een cirkel",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.drawCircle
                            }
                        }
                    },
                    /*    {
                        xtype: 'button',
                        icon: this.iconPath+"cursor.png",
                        tooltip: "Selecteer een object"
                    }, */
                    this.colorPicker,
                    {
                        xtype: 'button',
                        icon: this.iconPath+"delete.png",
                        tooltip: "Verwijder alle objecten",
                        listeners: {
                            click:{
                                scope: me,
                                fn: me.deleteAll
                            }
                        } 
                    }]
                }
                ]
            }],

            renderTo: this.getContentDiv()
        });
        
        this.formselect = new Ext.form.FormPanel({
            items: [
            { 
                xtype: 'fieldset',
                defaultType: 'textfield',
                border: 0,
                padding: 10,
                style: {
                    border: '0px none',
                    marginBottom: '0px'
                },
                layout:'hbox',
                items: [
                this.label,
                {
                    xtype: 'button',
                    icon: this.iconPath+"delete.png",
                    tooltip: "Verwijder geselecteerd object",
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.deleteObject
                        }
                    } 
                }
                ]
            }
            ],
            renderTo: this.getContentDiv()
        });
        
        // Convience accessor
        this.title = Ext.create("Ext.form.field.Text",{
            fieldLabel: 'Titel',
            name: 'title',
            id: 'title'+ this.name
        });
        this.description = Ext.create("Ext.form.field.TextArea",
        {
            fieldLabel: 'Opmerking',
            name: 'description',
            id: 'description'
        });
        // Build the saving form
        this.formsave = new Ext.form.FormPanel({
            url: actionBeans["file"] + "?save",
            items: [
            { 
                /*xtype: 'fieldset',
                defaultType: 'textfield',
                border: 0,
                padding: 10,
                style: {
                    border: '0px none',
                    marginBottom: '0px'
                },
                items: [
                {*/
                xtype: 'label',
                text: 'Op de kaart getekende objecten opslaan'
            },
            this.title,
            this.description,
            {
                xtype: 'hiddenfield',
                name: 'saveObject',
                id: 'saveObject'
            },
            { 
                xtype: 'button',
                text: 'Opslaan als bestand',
                listeners: {
                    click:{
                        scope: me,
                        fn: me.saveFile
                    }
                }
            }
            /*]
            }*/
            ],
            renderTo: this.getContentDiv()
        });
        
        this.file = Ext.create("Ext.form.field.File", {
            fieldLabel: 'Tekstbestand',
            name: 'featureFile',
            msgTarget: 'side',
            anchor: '100%',
            buttonText: 'Bladeren',
            id: 'featureFile'
        });
        this.formopen = new Ext.form.FormPanel({
            standardSubmit: true,
            items: [
            /*{ 
                xtype: 'fieldset',
                defaultType: 'textfield',
                border: 0,
                padding: 10,
                style: {
                    border: '0px none',
                    marginBottom: '0px'
                },
                items: [*/
            {
                xtype: 'label',
                text: 'Bestand met getekende objecten openen'
            },
            this.file,
            {
                xtype: 'button',
                text: 'bestand openen',
                listeners: {
                    click:{
                        scope: me,
                        fn: me.openFile
                    }
                }
            }
            //  ]
            //}
            ],
            renderTo: this.getContentDiv()
        });
        
        this.formselect.setVisible(false);
    },
    
    /**
     * Event handlers
     **/
    activeFeatureChanged : function (vectorLayer,feature){
        this.toggleSelectForm(true);
        if(this.features[feature.id] == undefined){
            feature.color = "0x"+this.color;
            this.features[feature.id] = feature;
        }else{
            var color = this.features[feature.id].color;
            color = color.substring(2);
            this.colorPicker.setColor(color);
            this.color = color;
        }
        this.activeFeature = this.features[feature.id];
        this.label.setValue(this.activeFeature.label);
    },
    //update the wkt of the active feature with the completed feature
    activeFeatureFinished : function (vectorLayer,feature){
        this.activeFeature.wktgeom = feature.wktgeom;
    },
    colorChanged : function (hexColor){
        this.color = '0x'+hexColor;
        this.vectorLayer.style.fillcolor = this.color;
        this.vectorLayer.adjustStyle();
        if(this.activeFeature != null){
            this.activeFeature.color = this.color;
            var feature = this.vectorLayer.getFeatureById(this.activeFeature.getId());
            this.activeFeature.wktgeom = feature.wktgeom;
            this.vectorLayer.removeFeature(this.activeFeature);
            this.vectorLayer.addFeature(this.activeFeature);
        }
    },
    labelChanged : function (field,newValue){
        this.vectorLayer.setLabel(this.activeFeature.getId(),newValue);
        this.activeFeature.label=newValue;
    },
    toggleSelectForm : function(visible){
        this.formselect.setVisible(visible);
    },
    drawPoint: function(){
        this.vectorLayer.drawFeature("Point");
    },
    drawLine: function(){
        this.vectorLayer.drawFeature("LineString");
    },
    drawPolygon: function(){
        this.vectorLayer.drawFeature("Polygon");
    },
    drawCircle: function(){
        this.vectorLayer.drawFeature("Circle");
    },
    deleteAll: function(){
        this.vectorLayer.removeAllFeatures();
        this.toggleSelectForm(false);
        this.features = {};
        this.activeFeature=null;
    },
    deleteObject: function(){
        delete this.features[this.activeFeature.id];
        this.vectorLayer.removeFeature(this.activeFeature);
        this.toggleSelectForm(false);
        this.activeFeature=null;
    },
    saveFile: function(){
        /* var title = this.formopen.getChildByElement('title'+ this.name).getValue();
        var comment = this.formopen.getChildByElement('comment'+ this.name).getValue();*/
       
        var form = this.formsave.getForm();
        
        var features = new Array();
        for (var featurekey in this.features){
            var feature = this.features[featurekey];
            features.push(feature.toJsonObject());
        }
        form.setValues({
            "saveObject":JSON.stringify(features)
            });/*
        var hidden = form.items[4];
        hidden.value =JSON.stringify(features);*/
        form.submit( {
            success: function(form, action) {
                Ext.Msg.alert('Success', action.result.msg);
            },
            failure: function(form, action) {
                switch (action.failureType) {
                    case Ext.form.action.Action.CLIENT_INVALID:
                        Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                        break;
                    case Ext.form.action.Action.CONNECT_FAILURE:
                        Ext.Msg.alert('Failure', 'Ajax communication failed');
                        break;
                    case Ext.form.action.Action.SERVER_INVALID:
                        Ext.Msg.alert('Failure', action.result.msg);
                }
            }
        });
    //save: function(title,description,saveObject, successFunction, failureFunction) {
    /*var saveFile = Ext.create("viewer.File",{});
        saveFile.save(title,description,features, this.saveSucces, this.saveFailure);*/
        
    return features;
},
openFile: function(){
    //var file = this.formopen.getChildByElement('file'+ this.name).getValue();
    /* var form =this.formopen.getForm();
        if(form.isValid()){
            form.submit({
                url: actionBeans["file"],
                waitMsg: 'Uploading your photo...',
                success: function(fp, o) {
                    Ext.Msg.alert('Success', 'Your photo "' + o.result.file + '" has been uploaded.');
                },
                failure: function (a,b,c){
                    var d = 0;
                }
            });
        }
             */
    var features = [
    {
        color: "0x00FF00",
        id: "T_0",
        label:	"groen",
        wktgeom: "POLYGON((263101.527332884 608759.094307531,260655.542427759 532933.56224864,302237.285814893 533545.058474921,303460.278267455 576961.290540899,289395.865062984 620989.018833159,263101.527332884 608759.094307531))"
    },

    {
        color:"0xFF9900",
        id:"T_1",
        label:"oranje",
        wktgeom:"POLYGON((238030.182055348 416749.279255178,237418.685829066 332974.296254629,297956.812230923 338477.762291161,238030.182055348 416749.279255178))"
    }];
        
    for ( var i = 0 ; i < features.length;i++){
        var feature = features[i];
        var featureObject = Ext.create("viewer.viewercontroller.controller.Feature",feature);
        this.vectorLayer.style.fillcolor = featureObject.color;
        this.vectorLayer.adjustStyle();
        this.vectorLayer.addFeature(featureObject);
    }
}
});
 