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
/* global Ext, MobileManager, actionBeans */
/**
 * Print component
 * @author <a href="mailto:roybraam@b3partners.nl">Roy Braam</a>
 */
/* Modified: 2014, Eddy Scheper, ARIS B.V.
 *           - A5 and A0 pagesizes added.
*/
Ext.define ("viewer.components.Print",{
    extend: "viewer.components.Component",
    panel: null,
    printForm: null,
    vl:null,
    minQuality: 128,
    combineImageService: null,
    legends:null,
    extraInfoCallbacks:null,
    extraLayerCallbacks:null,
    config:{
        name: ___("Print"),
        title: "",
        titlebarIcon : "",
        tooltip : "",
        default_format: null,
        orientation: null,
        legend: null,
        max_imagesize: "2048",
//        showPrintRtf:null,
        label: "",
        overview:null,
        mailprint:null,
        fromAddress:null,
        fromName:null,
        useA0: false,
        useA3: true,
        useA4: true,
        useA5: false,
        details: {
            minWidth: 550,
            minHeight: 650
        }
    },
    /**
     * @constructor
     * creating a print module.
     */
    constructor: function (conf){
//        if(!Ext.isDefined(conf.showPrintRtf)) conf.showPrintRtf = true;
        this.initConfig(conf);
        viewer.components.Print.superclass.constructor.call(this, this.config);
        this.legends=[];

        this.combineImageService = Ext.create("viewer.CombineImage",{});

        var me = this;
        if(this.hasButton === null || this.hasButton === undefined || this.hasButton){
            this.renderButton({
                handler: function(){
                    me.buttonClick();
                },
                text: me.title,
                icon: me.titlebarIcon,
                tooltip: me.tooltip,
                label: me.label
            });
        }
        this.extraInfoCallbacks = new Array();
        this.extraLayerCallbacks = new Array();

        this.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_VISIBILITY_CHANGED,this.layerVisibilityChanged,this);
        this.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_ADDED,this.layerAdded,this);
        this.viewerController.mapComponent.getMap().addListener(viewer.viewercontroller.controller.Event.ON_LAYER_REMOVED,this.layerRemoved,this);

        return this;
    },
    // Handler for changes to the visibility of layers
    layerVisibilityChanged : function (map,object ){
        var layer = object.layer;
        var vis = object.visible;
        if(vis){
            this.loadLegend(layer);
        }else{
           this.removeLegend(layer);
        }
    },
    /**
     *Called when layer is added to the map
     *@param map the map
     *@param object event object.
     */
    layerAdded: function (map,object){
        var layer = object.layer;
        var vis = layer.getVisible();
        if (vis){
            this.loadLegend(layer);
        }else{
            this.removeLegend(layer);
        }
    },
    /**
     *Called when a layer is removed
     */
    layerRemoved : function(map, object){
        var layer = object.layer;
        this.removeLegend(layer);
    },
    /**
     * Called when a layer is added
     * @param layer the map layer of type viewer.viewerController.controller.Layer
     */
    loadLegend : function (layer){
        var appLayer = this.viewerController.getAppLayerById(layer.appLayerId);
        if (appLayer==undefined || appLayer==null){
            return;
        }
        //make the var ready, so we now it's loading.
        this.legends[appLayer.id]={};
        var me = this;
        this.viewerController.getLayerLegendInfo(appLayer,function(appLayer,legendObject){
                me.addLegend(appLayer,legendObject);
            },
            function(appLayer){
                me.failLegend(appLayer);
            });

        /*if (url!=null){
            var legend = {
                url: url,
                id: layer.appLayerId,
                name: layerTitle
            };
            this.legends.push(legend);
        }*/
    },

    removeLegend: function (layer){
        if (layer !== null){
            delete this.legends[layer.appLayerId];
        }
        if (!this.legendLoading()){
            this.createLegendSelector();
        }
    },
    /**
     * when Legend is succesfully loaded, add it to the legend object.
     */
    addLegend: function (appLayer,legendObject){
        if (this.legends[appLayer.id] !== undefined){
            this.legends[appLayer.id]= legendObject;
        }
        if (!this.legendLoading()){
            this.createLegendSelector();
        }
    },
    /**
     * When getting the legend failed, remove the var.
     */
    failLegend: function(appLayer){
        delete this.legends[appLayer.id];
        if (!this.legendLoading()){
            this.createLegendSelector();
        }
    },
    /**
     * Checks if there are still some legends loading
     * @return true if legends are loaded and false if loading legend finished.
     */
    legendLoading: function (){
        for (var key in this.legends){
            if(!this.legends.hasOwnProperty(key)) {
                continue;
            }
            //if there is a var for the legend, it's not yet succesfully loaded nor it failed
            if (this.legends[key]==null){
                return true;
            }
        }
        return false;
    },
    /**
     * Called when the button is clicked. Opens the print window (if not already opened) and creates a form.
     * If the window was invisible the preview will be redrawn
     */
    buttonClick: function(){
        var restart=false;
        if(!this.popup.popupWin.isVisible()){
            this.popup.show();
            restart=true;
        }
        if (this.panel === null){
            this.createForm();
            this.setQuality();
        }
        if (restart){
            this.redrawPreview();
            this.createLegendSelector();
            Ext.ComponentQuery.query('#scale')[0].setValue(this.config.viewerController.mapComponent.getMap().getActualScale());
        }
        // enable attributes checkbox if attr list is available
        var attributeLists = this.viewerController.getComponentsByClassName("viewer.components.AttributeList");
        if (attributeLists && attributeLists.length > 0) {
            Ext.ComponentQuery.query('#includeAttributes')[0].setDisabled(false);
        } else {
            Ext.ComponentQuery.query('#includeAttributes')[0].setDisabled(true);
        }
    },
    /**
     * Create the print form.
     */
    createForm: function(){
        var me = this;

        var pageFormats = [];
        this.config.useA5 && pageFormats.push(['a5','A5']);
        this.config.useA4 && pageFormats.push(['a4','A4']);
        this.config.useA3 && pageFormats.push(['a3','A3']);
        this.config.useA0 && pageFormats.push(['a0','A0']);
        this.panel = Ext.create('Ext.panel.Panel', {
            frame: false,
            bodyPadding: 5,
            width: "100%",
            height: "100%",
            border: 0,
            renderTo: me.getContentDiv(),
            scrollable: true,
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'

            },
            items: [{
                //top container (1)
                xtype: 'container',
                height: 200,
                layout: {
                    type: 'box',
                    vertical: false
                },
                width: '100%',
                items: [/*{
                    xtype: "label",
                    text: i18next.t('viewer_components_print_0')
                }*/{
                    xtype: 'container',
                    id: 'legendContainer',
                    height: 200,
                    flex: 0.4,
                    hideMode: "offsets",
                    hidden: !this.getLegend(),
                    items: [],
                    autoScroll: true,
                    margin: '0 5 0 0'
                },{
                    xtype: 'container',
                    flex: 0.6,
                    height: 200,
                    layout: 'fit',
                    html: { tag: "div", id: "previewImg", style: "width: 100%; height: 100%;" }
                }]
            },{
                //bottom container (2)
                xtype: 'container',
                layout: {
                    type: 'box',
                    vertical: false
                },
                style: {
                    marginTop: '15px'
                },
                plugins: ['responsive'],
                responsiveConfig: {
                    'width < 550': {
                        layout: {
                            type: 'box',
                            vertical: true,
                            align: 'stretch'
                        }
                    },
                    'width >= 550': {
                        layout: {
                            type: 'box',
                            vertical: false
                        }
                    }
                },
                width: '100%',
                items: [{
                    //bottom left (3)
                    xtype: 'container',
                    flex: 0.4,
                    items: [{
                        xtype: "label",
                        text: i18next.t('viewer_components_print_2')
                    },{
                        xtype: 'textfield',
                        width: '100%',
                        name: 'title',
                        value: ""
                    },{
                        xtype: "label",
                        text: i18next.t('viewer_components_print_3')
                    },{
                        xtype: 'textfield',
                        name: 'subtitle',
                        value: ""
                    },{
                        xtype: "label",
                        text: i18next.t('viewer_components_print_4')
                    },{
                        xtype: 'textfield',
                        name: 'extraTekst',
                        value: ""
                    }]
                },{
                    //bottom right (4)
                    xtype: 'container',
                    flex: 0.6,
                    items: [{
                        //kwality row (5)
                        xtype: 'container',
                        width: '100%',
                        items: [{
                            xtype: "label",
                            text: i18next.t('viewer_components_print_5')
                        },{
                            xtype: 'container',
                            layout: {
                                type: 'hbox'
                            },
                            width: '100%',
                            items: [{
                                xtype: 'slider',
                                itemId: 'qualitySlider',
                                name: "quality",
                                value: 11,
                                increment: 1,
                                minValue: me.minQuality,
                                maxValue: parseInt(me.max_imagesize, 10),
                                listeners: {
                                    changecomplete: {
                                        scope: this,
                                        fn: function (slider,newValue){
                                            this.qualityChanged(newValue);
                                        }
                                    }
                                },
                                flex: 1
                            },{
                                xtype: 'button',
                                text: i18next.t('viewer_components_print_6'),
                                width: /*MobileManager.isMobile() ? 50 : */30,
                                listeners: {
                                    click:{
                                        scope: this,
                                        fn: function (){
                                            this.qualitySlider.setValue(this.getMapQuality());
                                        }
                                    }
                                }
                                //todo handle reset
                            }]
                        }]
                    },{
                        // (6)
                        xtype: 'container',
                        layout: {
                            type: 'box',
                            vertical: false
                        },
                        plugins: ['responsive'],
                        responsiveConfig: {
                            'width < 550': {
                                layout: {
                                    type: 'box',
                                    vertical: true,
                                    align: 'stretch'
                                }
                            },
                            'width >= 550': {
                                layout: {
                                    type: 'box',
                                    vertical: false
                                }
                            }
                        },
                        items: [{
                            //(7)
                            xtype: 'container',
                            flex: 0.5,
                            items: [{
                                xtype: 'label',
                                text: i18next.t('viewer_components_print_7')
                            },{
                                xtype: 'radiogroup',
                                name: "orientation",
                                width: 150,
                                items: [{
                                    boxLabel: i18next.t('viewer_components_print_8'),
                                    name: 'orientation',
                                    inputValue: 'landscape',
                                    checked: me.getOrientation()=='landscape'
                                },{
                                    boxLabel: i18next.t('viewer_components_print_9'),
                                    name: 'orientation',
                                    inputValue: 'portrait',
                                    checked: !(me.getOrientation()=='landscape')
                                }]
                            },{
                                xtype: 'checkbox',
                                name: 'includeLegend',
                                checked: me.getLegend(),
                                inputValue: true,
                                boxLabel: i18next.t('viewer_components_print_10'),
                                listeners:{
                                    change:{
                                        fn: function(obj, on){
                                            Ext.getCmp("legendContainer").setVisible(on);
                                        },
                                        scope:this
                                    }
                                }
                            },{
                                xtype: 'checkbox',
                                name: 'includeAttributes',
                                itemId: 'includeAttributes',
                                inputValue: true,
                                checked: false,
                                disabled: true,
                                boxLabel: i18next.t('viewer_components_print_11')
                            }, {
                                name: 'scale',
                                itemId: 'scale',
                                fieldLabel: i18next.t('viewer_components_print_12'),
                                xtype:"textfield",
                                value: this.config.viewerController.mapComponent.getMap().getActualScale()
                            },{
                                xtype: 'checkbox',
                                name: 'includeOverview',
                                hidden: !me.shouldAddOverview(),
                                inputValue: true,
                                boxLabel: i18next.t('viewer_components_print_13')
                            }]
                        },{
                            //(8)
                            xtype: 'container',
                            flex: 0.5,
                            layout: {
                                type: 'box',
                                vertical: true
                            },
                            plugins: ['responsive'],
                            responsiveConfig: {
                                'width < 550': {
                                    layout: {
                                        type: 'box',
                                        vertical: true,
                                        align: 'stretch'
                                    }
                                },
                                'width >= 550': {
                                    layout: {
                                        type: 'box',
                                        vertical: true
                                    }
                                }
                            },
                            items: [{
                                xtype: 'label',
                                text: i18next.t('viewer_components_print_14')
                            },{
                                xtype: "combobox",
                                name: 'pageformat',
                                emptyText: i18next.t('viewer_components_print_15'),
                                forceSelection: true,
                                queryMode: 'local',
                                // 2014, Eddy Scheper, ARIS B.V. - A5 and A0 added.
                                store: pageFormats,
                                width: 100,
                                value: me.getDefault_format()? me.getDefault_format(): "a4"
                            },{
                                xtype: 'slider',
                                itemId: 'rotateSlider',
                                name: 'angle',
                                value: 0,
                                increment: 1,
                                minValue: 0,
                                maxValue: 360,
                                width: 100,
                                labelAlign: "top",
                                fieldLabel: i18next.t('viewer_components_print_16'),
                                tipText: function(tumb){
                                    return tumb.value+"º";
                                },
                                listeners: {
                                    changecomplete: {
                                        scope: this,
                                        fn: function (slider,newValue){
                                            this.angleChanged(newValue);
                                        }
                                    }
                                }
                            }]
                        }]
                    }]
                }]
            },{
                xtype: "label",
                hidden:this.config.mailPrint === "cantMail",
                text: i18next.t('viewer_components_print_17')
            },{
                xtype: 'textfield',
                name: 'mailTo',
                hidden:this.config.mailPrint === "cantMail",
                width: "10%",
                value: ""
            },{
                 xtype: 'label',
                 style: {
                     marginTop: "5px"
                 },
                 text: i18next.t('viewer_components_print_18')
            },{
                //button container 2b
                xtype: 'container',
                frame: false,
                style: {
                    marginTop: "5px"
                },
                items: [{
                    xtype: 'button',
                    text: i18next.t('viewer_components_print_19'),
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                this.popup.hide();
                            }
                        }
                    }
                },{
//                    xtype: 'button',
//                    text: i18next.t('viewer_components_print_20')  ,
//                    hidden: !this.showPrintRtf || this.config.mailPrint === "canOnlyMail",
//                    style: {
//                        "float": "right",
//                        marginLeft: '5px'
//                    },
//                    listeners: {
//                        click:{
//                            scope: this,
//                            fn: function (){
//                                this.submitSettings("saveRTF");
//                            }
//                        }
//                    }
//                },{
                    xtype: 'button',
                    text: i18next.t('viewer_components_print_21')  ,
                    hidden: this.config.mailPrint === "canOnlyMail",
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                this.submitSettings("savePDF");
                            }
                        }
                    }
                },{
                    xtype: 'button',
                    text: i18next.t('viewer_components_print_22'),
                    hidden:this.config.mailPrint === "cantMail",
                    style: {
                        "float": "right",
                        marginLeft: '5px'
                    },
                    listeners: {
                        click:{
                            scope: this,
                            fn: function (){
                                var props = this.getAllProperties("mailPDF");
                                if(props.mailTo !== undefined && props.mailTo !== null && props.mailTo !== ""){
                                    props.fromAddress = this.config.fromAddress;
                                    props.fromName = this.config.fromName;
                                    Ext.Ajax.request({
                                        url: actionBeans["print"],
                                        params: {
                                            params: Ext.JSON.encode(props)
                                        },
                                        success: function(result) {
                                            var response = result.responseText;
                                            Ext.MessageBox.alert(i18next.t('viewer_components_print_24'), i18next.t('viewer_components_print_25'));
                                        },
                                        failure: function(result) {
                                           Ext.MessageBox.alert(i18next.t('viewer_components_print_26'), i18next.t('viewer_components_print_27'));
                                        }
                                    });
                                }else{
                                    Ext.MessageBox.alert(i18next.t('viewer_components_print_28'), i18next.t('viewer_components_print_29'));
                                }
                            }
                        }
                    }
                }]
            }]
        });
        
        this.qualitySlider = Ext.ComponentQuery.query('#qualitySlider', this.panel)[0];
        this.rotateSlider = Ext.ComponentQuery.query('#rotateSlider', this.panel)[0];
        
        this.printForm = Ext.create('Ext.form.Panel', {
            renderTo: me.getContentDiv(),
            url: actionBeans["print"],
            border: 0,
            visible: false,
            standardSubmit: true,
            items: [{
                xtype: "hidden",
                name: "params",
                id: 'formParams'
            }]
        });
    },
    /**
    * Call to redraw the preview
    */
    redrawPreview: function (){
        document.getElementById('previewImg').innerHTML = ___("Loading...");
        var properties = this.getProperties();
        this.combineImageService.getImageUrl(Ext.JSON.encode(properties),this.imageSuccess,this.imageFailure);
    },
    /**
     *
     */
    createLegendSelector: function(){
        //only create legend when legends are loaded and the panel is created.
        if (!this.legendLoading() && this.panel !== null){
            var checkboxes= new Array();
            checkboxes.push({
                xtype: "label",
                text: i18next.t('viewer_components_print_23')
            });
            for (var key  =0 ; key < this.legends.length ;key++){
                if(this.legends.hasOwnProperty(key)){
                    var appLayer =this.viewerController.getAppLayerById(key);
                    var title = appLayer.alias;
                    checkboxes.push({
                        xtype: "checkbox",
                        boxLabel: title,
                        name: 'legendUrl',
                        inputValue: Ext.JSON.encode(this.legends[key]),
                        id: 'legendCheckBox'+key,
                        checked: !appLayer.background
                    });
                }
            };

            Ext.getCmp('legendContainer').removeAll();
            Ext.getCmp('legendContainer').add(checkboxes);        
            Ext.getCmp('legendContainer').updateLayout();
        }
    },
    /**
     * Set the quality from the map in the slider
     */
    setQuality: function(){
        this.qualitySlider.setValue(this.getMapQuality(),false);
    },
    /**
     *Gets the map 'quality'
     *@return the 'quality' of the map (the biggest dimension: height or width)
     */
    getMapQuality: function(){
        var width = this.viewerController.mapComponent.getMap().getWidth();
        var height = this.viewerController.mapComponent.getMap().getHeight();
        return width > height? width : height;
    },
    shouldAddOverview : function(){
        var overviews = this.getOverviews();
        if(this.overview && overviews.length > 0){
            return true;
        }else{
            return false;
        }
    },
    /**
     * Called when quality is changed.
     */
    qualityChanged: function(newValue){
        var angle=this.rotateSlider.getValue();
        if (angle>0){
            this.correctQuality(angle);
        }

    },
    /**
     * Called when the angle is changed.
     */
    angleChanged: function (newValue){
        if (newValue>0){
            this.correctQuality(newValue);
        }
        this.redrawPreview();
    },
    /**
     * Corrects the quality slider to the max quality possible with the given angle
     * @param angle the angle that is set.
     */
    correctQuality: function(angle){
        //get the max quality that is allowed with the given angle
        var maxQuality =this.getMaxQualityWithAngle(angle);
        var sliderQuality = this.qualitySlider.getValue();
        if (sliderQuality > maxQuality){
            this.qualitySlider.setValue(maxQuality);
        }
    },
    /**
     * Get the maximum quality that is possible with the given angle
     */
    getMaxQualityWithAngle: function(angle){
        //only if a rotation must be done.
        if (angle==0 || angle==360)
            return this.max_imagesize;

        var width = this.viewerController.mapComponent.getMap().getWidth();
        var height = this.viewerController.mapComponent.getMap().getHeight();
        var sliderQuality = this.qualitySlider.getValue();
        var ratio = width/height;
        //calculate the new widht and height with the quality
        if (height> width){
            height = sliderQuality;
            width = sliderQuality * ratio;
        }else{
            width = sliderQuality;
            height = sliderQuality/ratio;
        }
        //calc divide only twice
        var width2 = width/2;
        var height2 = height/2;

        var newCoords = new Array();
        //calculate rotation with the rotation point transformed to 0,0
        newCoords[0] = this.calcRotationX(angle,-width2,-height2);
        newCoords[1] = this.calcRotationX(angle,width2,-height2);
        newCoords[2] = this.calcRotationX(angle,width2,height2);
        newCoords[3] = this.calcRotationX(angle,-width2,height2);
        //transform the rectangle (or square) back
        var c;
        for (c = 0; c < newCoords.length; c++){
            var coord=newCoords[c];
            coord.x= coord.x + width2;
            coord.y= coord.y + height2;
        }
        //get the bbox of both the extents. (original and rotated)
        var totalBBox= new viewer.viewercontroller.controller.Extent(0,0,width,height);
        for (c = 0; c < newCoords.length; c++){
            var coord = newCoords[c];
            if (coord.x > totalBBox.maxx){
                totalBBox.maxx=coord.x;
            }if (coord.x < totalBBox.minx){
                totalBBox.minx=coord.x;
            }if (coord.y > totalBBox.maxy){
                totalBBox.maxy=coord.y;
            }if (coord.y < totalBBox.miny){
                totalBBox.miny=coord.y;
            }
        }
        //calculate the new widht and height en check what the size would be in pixels
        var newWidth= totalBBox.maxx - totalBBox.minx;
        var newHeight= totalBBox.maxy - totalBBox.miny;
        var maxQuality = newWidth > newHeight ? newWidth : newHeight;

        //if the quality is bigger then the max allowed the original quality would be lower.
        if (maxQuality > this.max_imagesize){
            maxQuality = (this.max_imagesize*this.max_imagesize)/maxQuality;
        }
        //because its in pixels floor.
        return Math.floor(maxQuality);
    },
    /**
     * Calculate the new x,y when a rotation is done with angle. The rotation point must be transformed to 0
     * @param angle the angle of rotation in degree
     * @param x the x coord
     * @param y the y coord
     */
    calcRotationX: function (angle,x,y){
        //first calc rad
        var rad=Math.PI / 180 * angle;
        //x=x*cos(angle)-y*sin(angle)
        //y=x*sin(angle)+y*cos(angle)
        var returnValue= new Object();
        returnValue.x= x * Math.cos(rad) - y * Math.sin(rad);
        returnValue.y= x * Math.sin(rad) + y * Math.cos(rad);
        return returnValue;
    },
    /**
    * Called when a button is clicked and the form must be submitted.
    */
    submitSettings: function(action){
        var properties = this.getAllProperties(action);
        // console.debug("submitting print values:", properties);
        Ext.getCmp('formParams').setValue(Ext.JSON.encode(properties));
        //this.combineImageService.getImageUrl(Ext.JSON.encode(properties),this.imageSuccess,this.imageFailure);
        this.printForm.submit({
            target: '_blank'
        });
    },
    getAllProperties : function(action){
        var properties = this.getProperties();
        properties.action=action;
        // Process registred extra info callbacks
        var extraInfos = new Array();
        for (var i = 0 ; i < this.extraInfoCallbacks.length ; i++){
            var entry = this.extraInfoCallbacks[i];
            var extraInfo = {
                className:   Ext.getClass(entry.component).getName(),
                componentName: entry.component.name,
                info: entry.callback() // Produces an JSONObject
            };
            extraInfos.push(extraInfo);
        }
        properties.extra = extraInfos;
        return properties;
    },
    /**
     *Called when the imageUrl is succesfully returned
     *@param imageUrl the url to the image
     */
    imageSuccess: function(imageUrl){
        if(Ext.isEmpty(imageUrl) || !Ext.isDefined(imageUrl)) imageUrl = null;
        if(imageUrl === null) document.getElementById('previewImg').innerHTML = ___("Afbeelding laden mislukt");
        else {
            var image = new Image();
            image.onload = function() {
                var img = document.createElement('img');
                img.src = imageUrl;
                img.style.border = "1px solid gray";
                img.style.maxWidth = "100%";
                img.style.maxHeight = "100%";
                var preview = document.getElementById('previewImg');
                preview.innerHTML = '';
                preview.appendChild(img);
            };
            image.src = imageUrl;
        }
    },
    /**
     *Called when the imageUrl is unsuccesfully returned
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
        properties.angle = this.rotateSlider.getValue();
        properties.quality = this.qualitySlider.getValue();
        properties.appId = this.viewerController.app.id;
        if(properties.scale === ""){
            delete properties.scale;
        }
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
        var wktGeoms= new Array();
        //get last getmap request from all layers
        var layers=this.viewerController.mapComponent.getMap().getLayers();
        for (var i=0; i < layers.length; i ++){
            var layer = layers[i];
            if (layer.getVisible()){
                if (layer.getType()=== viewer.viewercontroller.controller.Layer.VECTOR_TYPE){
                    var features = layer.getAllFeatures(true);
                    for (var f =0; f < features.length; f++){
                        var feature=features[f];
                        if (feature.getWktgeom() !== null){
                            wktGeoms.push(feature);
                        }
                    }
                }else if (layer.getType()=== viewer.viewercontroller.controller.Layer.TILING_TYPE && ( layer.protocol === "TMS" || layer.protocol === "WMSC")){
                    var printLayer = new Object();
                    printLayer.url=layer.config.url;
                    printLayer.alpha=layer.alpha;
                    printLayer.extension=layer.extension;
                    printLayer.protocol=layer.protocol ;
                    printLayer.serverExtent = layer.serviceEnvelope;
                    printLayer.tileWidth = layer.tileWidth;
                    printLayer.tileHeight = layer.tileHeight;
                    printLayer.resolutions= layer.resolutions.toString();
                    printLayers.push(printLayer);
                }else if (layer.getType()=== viewer.viewercontroller.controller.Layer.TILING_TYPE && (layer.protocol === "WMTS" )){
                    var printLayer = new Object();
                    printLayer.url=layer.config.url;
                    printLayer.alpha=layer.alpha;
                    printLayer.extension=layer.extension;
                    printLayer.name=layer.name;
                    printLayer.protocol=layer.protocol ;
                    printLayer.serverExtent = layer.serviceEnvelope;
                    printLayer.matrixSet = layer.matrixSet;
                    printLayers.push(printLayer);
                }else if (layer.getType()=== viewer.viewercontroller.controller.Layer.WMS_TYPE ){
                    var printLayer = new Object();
                    printLayer.url=layer.getLastMapRequest()[0].url;
                    printLayer.alpha=layer.alpha;
                    printLayer.protocol=viewer.viewercontroller.controller.Layer.WMS_TYPE ;
                    printLayers.push(printLayer);
                }else{
                    var requests=layer.getLastMapRequest();
                    for (var r = 0; r < requests.length; r++) {
                        var request = requests[r];
                        if (request){
                            request.protocol=layer.getType();
                            var alpha=layer.getAlpha();
                            if (alpha !== null){
                                request.alpha = alpha;
                            }
                            printLayers.push(request);
                            //do a to string for the extent.
                            if (request.extent){
                                request.extent=request.extent.toString();
                            }
                        }
                    }
                }
            }
        }

        for(var j = 0 ; j < this.extraLayerCallbacks.length;j++){
            var printLayer = new Object();
            var layerInfos = this.extraLayerCallbacks[j].callback();
            for(var k = 0 ; k < layerInfos.length; k++){
                var layerInfo = layerInfos[k];
                printLayer.url= layerInfo.url;
                var beginChar = layerInfo.url.indexOf("?") === -1 ? "?" : "&";
                printLayer.url += beginChar + "LAYERS=" + layerInfo.layers;
                printLayer.url += "&FORMAT=" + layerInfo.format;
                printLayer.url += "&TRANSPARENT=" + layerInfo.transparent;
                printLayer.url += "&SRS=" + layerInfo.srs;
                if(printLayer.url.toLowerCase().indexOf("bbox") === -1){
                    printLayer.url += "&bbox=-1,-1,-1,-1";
                }

                if(printLayer.url.toLowerCase().indexOf("width") === -1){
                    printLayer.url += "&WIDTH=-1&HEIGHT=-1";
                }

                if(printLayer.url.toLowerCase().indexOf("request") === -1){
                    printLayer.url += "&REQUEST=Getmap";
                }

                printLayer.alpha=layerInfo.alpha;
                printLayer.protocol=viewer.viewercontroller.controller.Layer.WMS_TYPE ;
                printLayers.push(printLayer);
            }
        }
        values.requests=printLayers;
        var bbox=this.viewerController.mapComponent.getMap().getExtent();
        if (bbox){
            values.bbox = bbox.minx+","+bbox.miny+","+bbox.maxx+","+bbox.maxy;
        }
        values.width = this.viewerController.mapComponent.getMap().getWidth();
        values.height = this.viewerController.mapComponent.getMap().getHeight();
        values.geometries = wktGeoms;
        return values;
    },
    /**
     * Get the item values of the given container.
     */
    getValuesFromContainer: function(container){
        var config=new Object();
        for( var i = 0 ; i < container.items.length ; i++){
            //if its a radiogroup get the values with the function and apply the values to the config.
            if ("radiogroup" === container.items.get(i).xtype){
                Ext.apply(config, container.items.get(i).getValue());
            }else if ("container" === container.items.get(i).xtype || "fieldcontainer" === container.items.get(i).xtype){
                Ext.apply(config,this.getValuesFromContainer(container.items.get(i)));
            }else if (container.items.get(i).name !== undefined){
                var value=container.items.get(i).getValue();
                if ("checkbox" === container.items.get(i).xtype){
                    if (value === true){
                        value = container.items.get(i).getSubmitValue();
                    }else{
                        value=null;
                    }
                }
                if (value === null){
                    continue;
                }
                if (config[container.items.get(i).name] === undefined){
                    config[container.items.get(i).name] = value;
                }else if (config[container.items.get(i).name] instanceof Array){
                    config[container.items.get(i).name].push(value);
                }else{
                    var tmp = new Array();
                    tmp.push(config[container.items.get(i).name]);
                    tmp.push(value);
                    config[container.items.get(i).name]=tmp;
                }

            }
        }
        if(config.includeOverview){
            var overviews = this.getOverviews();
            if(overviews.length > 0){
                var overview = overviews[0];
                var url = overview.config.url;
                config.overview = new Object();
                config.overview.overviewUrl = url;
                config.overview.extent = overview.config.lox + "," + overview.config.loy + "," + overview.config.rbx + "," + overview.config.rby;
                config.overview.protocol = url.toLowerCase().indexOf("getmap") > 0 ? 'WMS' : 'IMAGE';
            }
        }
        if(config.includeAttributes){
            var attributeLists = this.viewerController.getComponentsByClassName("viewer.components.AttributeList");
            if(attributeLists.length > 0) {
                var attributeList = attributeLists[0]
                var appLayer = attributeList.layerSelector.getValue();
                if (appLayer) {
                    var appLayerId = appLayer.id;
                    var filter = appLayer.filter ? appLayer.filter.getCQL() : null;
                    var attributesObject = {
                        appLayer: appLayerId,
                        filter: filter
                    };
                    config.attributesObject = [attributesObject];
                }
            }
        }
        return config;
    },
    /**
     * Register the calling component for retrieving extra information to add to the print.
     * @param {type} component The object of the component ("this" at the calling method)
     * @param {type} callback The callbackfunction which must be called by the print component
     */
    registerExtraInfo: function(component, callback){
        var entry = {
            component:component,
            callback: callback
        };
        this.extraInfoCallbacks.push(entry);
    },
    /**
     * Unregister the given component for retrieving extra info for printing.
     * @param {type} component The component for which the callback must be removed.
     * @returns {undefined}
     */
    unregisterExtraInfo: function (component){
        for (var i = this.extraInfoCallbacks.length -1 ; i >= 0 ; i--){
            if(this.extraInfoCallbacks[i].component.name === component.name ){
                this.extraInfoCallbacks.splice(i, 1);
            }
        }
    },
    /**
     * Register a component which can add extra layers to the print.
     * @param {type} component The object of the component ("this" at the calling method)
     * @param {type} callback The callbackfunction which must be called by the print component
     */
    registerExtraLayers : function (component, callback){
        this.extraLayerCallbacks.push({
            component:component,
            callback: callback
        });
    },
    /**
     * Unregister the given component for retrieving extra info for printing.
     * @param {type} component The component for which the callback must be removed.
     * @returns {undefined}
     */
    unregisterExtraLayers: function (component){
        for (var i = this.extraInfoCallbacks.length -1 ; i >= 0 ; i--){
            if(this.extraLayerCallbacks[i].component.name === component.name ){
                this.extraLayerCallbacks.splice(i, 1);
            }
        }
    },
    getOverviews : function(){
      return this.viewerController.getComponentsByClassName("viewer.components.Overview");
    },
    getExtComponents: function() {
        return [ (this.panel !== null) ? this.panel.getId() : '' ];
    }
});
