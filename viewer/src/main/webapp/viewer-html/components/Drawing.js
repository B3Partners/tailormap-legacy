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
/* global Ext, contextPath, MobileManager, actionBeans */

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
    deActivatedTools: null,
    file:null,
    // Current active feature
    activeFeature:null,
    features:null,
    config:{
        title: "",
        reactivateTools:null,
        iconUrl: "",
        tooltip: "",
        color: "",
        label: "",
        details: {
            minWidth: 340,
            minHeight: 415
        }
    },
    constructor: function (conf){
        this.initConfig(conf);
	viewer.components.Drawing.superclass.constructor.call(this, this.config);
        if(this.config.color === ""){
            this.config.color = "ff0000";
        }
        this.features = new Object();
        var me = this;
        this.renderButton({
            handler: function(){
                me.showWindow();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });

        // Needed to untoggle the buttons when drawing is finished
        this.drawingButtonIds = {
            'point': Ext.id(),
            'line': Ext.id(),
            'polygon': Ext.id(),
            'circle': Ext.id()
        };


        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE,this.selectedContentChanged,this );
        this.iconPath=contextPath+"/viewer-html/components/resources/images/drawing/";
        this.loadWindow();
        if(this.config.reactivateTools){
            this.popup.addListener("hide", this.hideWindow, this);
        }
        return this;
    },
    showWindow : function (){
        if(this.vectorLayer === null){
            this.createVectorLayer();
        }
        this.deActivatedTools = this.config.viewerController.mapComponent.deactivateTools();
        this.popup.show();
    },
    hideWindow: function () {
        for (var i = 0; i < this.deActivatedTools.length; i++) {
            this.deActivatedTools[i].activate();
        }
        this.deActivatedTools = [];  
    },
    selectedContentChanged : function (){
        if(this.vectorLayer === null){
            this.createVectorLayer();
        }else{
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },
    createVectorLayer : function (){
        this.vectorLayer=this.config.viewerController.mapComponent.createVectorLayer({
            name:'drawingVectorLayer',
            geometrytypes:["Circle","Polygon","Point","LineString"],
            showmeasures:false,
            viewerController: this.config.viewerController,
            style: {
                'fillcolor': this.config.color || 'FF0000',
                'fillopacity': 50,
                'strokecolor': this.config.color ||"FF0000",
                'strokeopacity': 50
            }
        });
        this.config.viewerController.registerSnappingLayer(this.vectorLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);

        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED,this.activeFeatureChanged,this);
        this.vectorLayer.addListener (viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED,this.activeFeatureFinished,this);
    },
    /**
     * Create the GUI
     */
    loadWindow : function(){
        var me=this;

        this.colorPicker = Ext.create("Ext.ux.ColorField",{
            width: 40,
            showText: false,
            style: {
                marginTop: MobileManager.isMobile() ? '8px' : '0px',
                marginLeft: MobileManager.isMobile() ? '8px' : '0px',
                marginRight: MobileManager.isMobile() ? '8px' : '0px'
            },
            name: 'color',
            id:'color',
            value: this.config.color ? this.config.color : 'FF0000',
            listeners :{
                select : {
                    fn: this.colorChanged,
                    scope : this
                }
            }
        });

        this.labelField = Ext.create("Ext.form.field.Text",{
            name: 'labelObject',
            fieldLabel: 'Label geselecteerd object',
            labelWidth: MobileManager.isMobile() ? 200 : 150,
            style: {
                marginRight: MobileManager.isMobile() ? '15px' : '5px',
                marginTop: MobileManager.isMobile() ? '8px': '0px'
            },
            id: 'labelObject' + this.name,
            listeners:{
                change:{
                    fn: this.labelChanged,
                    scope:this
                }
            }
        });
        var drawingItems = [{
            xtype: 'button',
            id: this.drawingButtonIds.point,
            icon: this.iconPath+"bullet_red.png",
            componentCls: 'mobileLarge',
            tooltip: "Teken een punt",
            enableToggle: true,
            toggleGroup: 'drawingTools',
            listeners: {
                click:{
                    scope: me,
                    fn: me.drawPoint
                }
            }
        },
        {
            xtype: 'button',
            id: this.drawingButtonIds.line,
            icon: this.iconPath+"line_red.png",
            componentCls: 'mobileLarge',
            tooltip: "Teken een lijn",
            enableToggle: true,
            toggleGroup: 'drawingTools',
            listeners: {
                click:{
                    scope: me,
                    fn: me.drawLine
                }
            }
        },
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
        drawingItems.push(this.colorPicker);
        drawingItems.push({
            xtype: 'button',
            icon: this.iconPath+"delete.png",
            tooltip: "Verwijder alle objecten",
            componentCls: 'mobileLarge',
            listeners: {
                click:{
                    scope: me,
                    fn: me.deleteAll
                }
            }
        });

        this.formdraw = new Ext.form.FormPanel({
            border: 0,
            style: {
                marginBottom: '10px'
            },
            items: [{
                xtype: 'fieldset',
                defaultType: 'textfield',
                padding: 0,
                style: {
                    border: '0px none'
                },
                items: [
                {
                    xtype: 'label',
                    text: 'Objecten op de kaart tekenen'
                },
                {
                    xtype: 'fieldset',
                    border: 0,
                    margin: 0,
                    padding: 0,
                    style: {
                        border: 0
                    },
                    layout:{
                        type: 'hbox'
                    },
                    defaults: {
                        margin: '5 5 5 0'
                    },
                    items: drawingItems
                }
                ]
            }]
        });

        this.formselect = new Ext.form.FormPanel({
            border: 0,
            style: {
                marginBottom: '25px'
            },
            items: [
            {
                xtype: 'fieldset',
                defaultType: 'textfield',
                border: 0,
                style: {
                    border: '0px none',
                    marginBottom: '0px',
                    padding: '0px'
                },
                layout:'hbox',
                items: [
                this.labelField,
                {
                    xtype: 'button',
                    icon: this.iconPath+"delete.png",
                    tooltip: "Verwijder geselecteerd object",
                    componentCls: 'mobileLarge',
                    listeners: {
                        click:{
                            scope: me,
                            fn: me.deleteObject
                        }
                    }
                }
                ]
            }
            ]
        });

        // Convience accessor
        this.titleField = Ext.create("Ext.form.field.Text",{
            fieldLabel: 'Titel',
            name: 'title',
            allowBlank:false,
            id: 'title'+ this.name
        });
        this.description = Ext.create("Ext.form.field.TextArea",
        {
            fieldLabel: 'Opmerking',
            allowBlank:false,
            name: 'description',
            id: 'description'
        });
        // Build the saving form
        this.formsave = new Ext.form.FormPanel({
            border: 0,
            standardSubmit: true,
            url: actionBeans["drawing"] + "?save",
            style: {
                marginBottom: '25px'
            },
            items: [
                {
                    xtype: 'label',
                    text: 'Op de kaart getekende objecten opslaan'
                },
                this.titleField,
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
            ]
        });

        this.file = Ext.create("Ext.form.field.File", {
            fieldLabel: 'Tekstbestand',
            name: 'featureFile',
            allowBlank:false,
            msgTarget: 'side',
            anchor: '100%',
            buttonText: 'Bladeren',
            id: 'featureFile'
        });
        this.formopen = new Ext.form.FormPanel({
            border: 0,
            style: {
                marginBottom: '25px'
            },
            items: [
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
            ]
        });

        var items = [ this.formdraw, this.formselect ];
        if(!MobileManager.isMobile()) {
            items.push(this.formsave); items.push(this.formopen);
        }
        this.mainContainer = Ext.create('Ext.container.Container', {
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
            items: [
                {
                    id: this.name + 'ContentPanel',
                    xtype: "container",
                    autoScroll: true,
                    width: '100%',
                    style: {
                        marginLeft: '10px',
                        marginRight: '10px'
                    },
                    flex: 1,
                    items: items
                }, {
                    id: this.name + 'ClosingPanel',
                    xtype: "container",
                    width: '100%',
                    height: MobileManager.isMobile() ? 45 : 25,
                    style: {
                        marginTop: '10px',
                        marginRight: '5px'
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
                }
            ]
        });

        this.formselect.setVisible(false);
    },

    /**
     * @param vectorLayer The vectorlayer from which the feature comes
     * @param feature the feature which has been activated
     * Event handlers
     **/
    activeFeatureChanged : function (vectorLayer,feature){
        this.toggleSelectForm(true);
        if(this.features[feature.config.id] == undefined){
            feature.color = this.config.color;
            this.features[feature.config.id] = feature;
        }else{
            var color = this.features[feature.config.id].color;
         //   color = color.substring(2);
            this.colorPicker.setColor(color);
            this.config.color = color;
        }
        this.activeFeature = this.features[feature.config.id];
        this.labelField.setValue(this.activeFeature.label);
    },
    //update the wkt of the active feature with the completed feature
    activeFeatureFinished : function (vectorLayer,feature){
        this.activeFeature.config.wktgeom = feature.config.wktgeom;
        Ext.Object.each(this.drawingButtonIds, function(key, id) {
            var button = Ext.getCmp(id);
            if(button) button.toggle(false);
        });
    },
    colorChanged : function (hexColor){
        this.config.color = hexColor;
        this.vectorLayer.style.fillcolor = this.config.color;
        this.vectorLayer.style.strokecolor = this.config.color;
        this.vectorLayer.adjustStyle(hexColor);
        if(this.activeFeature !== null){
            this.activeFeature.color = this.config.color;
            var feature = this.vectorLayer.getFeatureById(this.activeFeature.getId());
            this.activeFeature.config.wktgeom = feature.config.wktgeom;
            this.vectorLayer.removeFeature(this.activeFeature);
            delete this.features[this.activeFeature.getId()];
            this.vectorLayer.addFeature(this.activeFeature);
        }
    },
    labelChanged : function (field,newValue){
        if(this.activeFeature !== null){
            this.vectorLayer.setLabel(this.activeFeature.getId(),newValue);
            this.activeFeature.label=newValue;
        }
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
    deleteAll: function() {
        Ext.Msg.show({
            title: "Weet u het zeker?",
            msg: "Weet u zeker dat u alle tekenobjecten wilt weggooien?",
            fn: function(button) {
                if (button === 'yes') {
                    this.vectorLayer.removeAllFeatures();
                    this.toggleSelectForm(false);
                    this.features = {};
                    this.labelField.setValue("");
                    this.titleField.setValue("");
                    this.description.setValue("");
                    if (this.activeFeature !== null) {
                        this.activeFeature = null;
                    }
                }
            },
            scope: this,
            buttons: Ext.Msg.YESNO,
            buttonText: {
                no: "Nee",
                yes: "Ja"
            },
            icon: Ext.Msg.WARNING
        });
    },
    deleteObject: function(){
        delete this.features[this.activeFeature.id];
        this.vectorLayer.removeFeature(this.activeFeature);
        this.toggleSelectForm(false);
        if(this.activeFeature !== null){
            this.activeFeature=null;
        }
        this.labelField.setValue("");
    },
    saveFile: function(){
        var form = this.formsave.getForm();

        var features = new Array();
        for (var featurekey in this.features){
            if(this.features.hasOwnProperty(featurekey)) {
                var feature = this.features[featurekey];
                features.push(feature.toJsonObject());
            }
        }
        form.setValues({
            "saveObject":Ext.JSON.encode(features)
        });
        this.formsave.submit({
            target: '_blank'
        } );
        return features;
    },
    openFile: function(){
        var form =this.formopen.getForm();
        if(form.isValid()){
            form.submit({
                scope:this,
                url: actionBeans["drawing"],
                waitMsg: 'Bezig met uploaden...',
                waitTitle: "Even wachten...",
                success: function(fp, o) {
                    var json = Ext.JSON.decode(o.result.content);
                    this.titleField.setValue( json.title);
                    this.description.setValue(json.description);
                    var features = Ext.JSON.decode(json.features);
                    this.loadFeatures(features);
                    if(features.length > 0){
                        var extent = o.result.extent;
                        this.config.viewerController.mapComponent.getMap().zoomToExtent(extent);
                    }
                },
                failure: function (){
                    Ext.Msg.alert('Mislukt', 'Uw bestand kon niet gelezen worden.');
                }
            });
        }
    },

    loadFeatures: function(features){
        //make the vectorLayer if not created yet.
        if (features.length > 0){
            if(this.vectorLayer === null){
              this.createVectorLayer();
            }
        }

        for ( var i = 0 ; i < features.length;i++){
            var feature = features[i];
            var featureObject = Ext.create("viewer.viewercontroller.controller.Feature",feature);
            this.vectorLayer.style.fillcolor = featureObject._color;
            this.vectorLayer.style.strokecolor = featureObject._color;
            this.vectorLayer.adjustStyle();
            this.vectorLayer.addFeature(featureObject);
            this.vectorLayer.setLabel(this.activeFeature.getId(),featureObject._label);
        }

    },

    getBookmarkState: function(shortUrl){
        var features = new Array();
        for (var featurekey in this.features){
            if(this.features.hasOwnProperty(featurekey)) {
                var feature = this.features[featurekey];
                features.push(feature.toJsonObject());
            }
        }
        var obj={};
        if (features.length > 0){
            obj.features= features;
        }
        return obj;
    },

    loadVariables: function (state){
        state= Ext.decode(state);
        if (state.features){
            this.loadFeatures(state.features);
        }
        if (state.extent){
            this.config.viewerController.mapComponent.getMap().zoomToExtent(state.extent);
        }
    },

    getExtComponents: function() {
        var compIds = [
            this.mainContainer.getId(),
            this.colorPicker.getId(),
            this.labelField.getId(),
            this.formdraw.getId(),
            this.formselect.getId(),
            this.titleField.getId(),
            this.description.getId()
        ];
        if(!MobileManager.isMobile()) {
            compIds.push(this.formsave.getId());
            compIds.push(this.file.getId());
            compIds.push(this.formopen.getId());
        }
        return compIds;
    }
});
