/*
 * Copyright (C) 2020 B3Partners B.V.
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
 * @author Martijn van der Struijk
 */
Ext.define("viewer.components.DigitreeTree", {
    extend: "viewer.components.Edit",
    toolMapClick: null,
    digitreeBeheerConfig: null,
    saveButton: null,
    vectorLayer: null,
    inputContainer: null,
    digitreeConfig: null,
    mode: null,
    currentFID:null,
    currentGeom:null,
    multipleTrees: false,
    officialFeature:{},

    constructor: function (conf) {
        this.initConfig(conf);
        //viewer.components.DigitreeTree.superclass.constructor.call(this, conf);
        var me = this;

        Ext.mixin.Observable.capture(this.config.viewerController.mapComponent.getMap(), function (event) {
            if (event === viewer.viewercontroller.controller.Event.ON_GET_FEATURE_INFO
                || event === viewer.viewercontroller.controller.Event.ON_MAPTIP) {
                if (me.mode === "new" || me.mode === "edit" || me.mode === "delete" || me.mode === "copy") {
                    return false;
                }
            }
            return true;
        });

        this.getDigitreeConfig();

        this.loadWindow();
        this.createVectorLayer();
        this.toolMapClick = this.config.viewerController.mapComponent.createTool({
            type: viewer.viewercontroller.controller.Tool.MAP_CLICK,
            id: this.name + "toolMapClick",
            handlerOptions: {pixelTolerance:me.pixelTolerance},
            handler: {
                fn: this.mapClicked,
                scope: this
            },
            viewerController: this.config.viewerController
        });

        this.inputContainer.setVisible(true);
        return this;
    },

    loadWindow: function () {
        this.maincontainer = Ext.create('Ext.panel.Panel', {
            id: this.name + 'Container',
            title: this.getPanelTitle(),
            style: {
                backgroundColor: '#8FBC8F'
            },
            padding: 10,
            items: [
                {
                    xtype: 'container',
                    scrollable: false,
                    collapsible: true,
                    collapsed:false,
                    style: {
                        backgroundColor: '#8FBC8F'
                    },
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [this.createButton("newButton", i18next.t('viewer_components_edit_2'), this.createNew, true),
                            this.createButton("editButton", i18next.t('viewer_components_edit_3'), this.editTree, true),
                            this.createButton("stopButton", "Stoppen", this.stop, true),
                        {
                            itemId: 'inputPanel',
                            border: 0,
                            xtype: "form",
                            scrollable: true,
                            flex: 1,
                            layout: 'anchor',
                            hidden: true
                        },
                        this.createButton("saveButton", 'Opslaan', this.save, true),
                        this.createButton("deleteButton", 'Verwijderen', this.deleteTree,true),
                    ]

                }
            ],
            scrollable: true,
            layout: 'fit',
            tools: this.getHelpToolConfig()
        });
        this.getContentContainer().add(this.maincontainer);
        this.inputContainer = this.maincontainer.down('#inputPanel');
        this.formContainers();
        //this.fillFormContainers();

    },

    createButton: function (itemid, label, fn, allowToggle) {
        return {
            xtype: 'button',
            itemId: itemid,
            disabled: false,
            text: label,
            listeners: {
                click: {
                    scope: this,
                    fn: function (btn) {
                        if(allowToggle) {
                            btn.addCls("active-state");
                        }
                        fn.call(this);
                    }
                }
            }
        };
    },

    stop: function() {
        this.mode = null;
        this.toolMapClick.deactivateTool();
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.removeAllFeatures();
        this.inputContainer.form.reset();
        this.algemeen.setCollapsed(true)
        this.officialFeature = {};
    },

    createNew: function () {
        this.officialFeature = {};
        this.mode = "new";
        this.inputContainer.getForm().reset();
        this.config.viewerController.mapComponent.getMap().removeMarker("edit");
        this.vectorLayer.drawFeature("Point");
        this.toolMapClick.activateTool();

    },

    editTree: function () {
        this.mode = "edit";
        console.log("Edit");
        this.toolMapClick.activateTool();
    },

    save: function() {
        this.getProjectForGeom(this.vectorLayer.getActiveFeature().config.wktgeom);
    },

    saveTree: function(project) {
        if (!this.inputContainer.form.isValid()){
            Ext.Msg.alert("Velden zijn verplicht", "Niet alle verplichte velden zijn ingevuld");
            return;
        }
        const newGeom = this.vectorLayer.getActiveFeature().config.wktgeom;
        const feature = this.inputContainer.form.getValues();
        const featureToSave = Ext.Object.merge(this.officialFeature,feature);
        featureToSave.project = project;
        featureToSave.the_geom = newGeom;
        var xy = newGeom.substring(newGeom.indexOf('(')+1,newGeom.indexOf(')')).split(' ');
        featureToSave.upload_rdx = xy[0];
        featureToSave.upload_rdy = xy[1];
        Ext.Ajax.request({
            url: "/viewer/action/digitree",
            params: {
                saveTree: true,
                applayerId: this.config.layers[0],
                application: this.config.viewerController.app.id,
                feature: Ext.JSON.encode(featureToSave)
            },
            scope: this,
            timeout: 40000,
            success: function(result) {
                const text = result.responseText;
                const response = Ext.JSON.decode(text);
                if(response.success) {
                    this.showSuccessToast("Opgeslagen", i18next.t('viewer_components_edit_40'));
                    this.config.viewerController.mapComponent.getMap().moveTo(xy[0], xy[1]);
                    this.config.viewerController.mapComponent.getMap().setMarker("edit", xy[0], xy[1]);
                    this.inputContainer.getForm().setValues(response.newFeature);
                } else {
                    Ext.Msg.alert("Mislukt", "Opslaan is niet gelukt");
                }
            },
            failure: function(result) {
                this.config.viewerController.logger.error(result);
            }
        });
    },

    deleteTree: function() {
        console.log("deleteTree");
    },

    mapClicked: function (toolMapClick, comp) {
        if(!this.multipleTrees && this.mode !== "new"){
            this.vectorLayer.removeAllFeatures();
        }
        this.inputContainer.getForm().reset();
        const coords = comp.coord;
        this.config.viewerController.mapComponent.getMap().setMarker("edit", coords.x, coords.y);
        if(this.mode === "new"){
            const feature  = this.populateFormForNewTree();
            this.featureReceived(feature);
        } else {
            this.getFeaturesForCoord(coords);
        }
    },

    getFeaturesForCoord: function (coords) {
        Ext.Ajax.request({
            url: "/viewer/action/digitree",
            params: {
                featuresForCoords: true,
                x: coords.x,
                y: coords.y,
                distance: this.config.viewerController.mapComponent.getMap().getResolution() * (this.config.clickRadius || 4),
                applayerId: this.config.layers[0],
                application: this.config.viewerController.app.id
            },
            scope: this,
            timeout: 40000,
            success: function(result) {
                const text = result.responseText;
                const response = Ext.JSON.decode(text);
                this.featureReceived(response[0].feature);
            },
            failure: function(result) {
                this.config.viewerController.logger.error(result);
            }
        });
    },

    populateFormForNewTree: function() {
      let feature = {};
      feature.inspecteur = "test";
      feature.mutatiedatum = "02-03-2020";
      feature.mutatietijd = "17:11:23";
      feature.project = "test";
      feature.the_geom = this.vectorLayer.getActiveFeature().config.wktgeom;
      return feature;
    },
    showAndFocusForm: function() {

    },

    featureReceived: function(feature) {
        if(!feature) {
            return;
        }
        this.officialFeature = feature;
        this.algemeen.setCollapsed(false);
        if(feature.boomsrt) {
            feature.boomsrt = feature.boomsrt.trim();
        }
        this.currentFID = feature.__fid;
        this.currentGeom = feature["the_geom"];
        const wkt = this.currentGeom;
        const feat = Ext.create("viewer.viewercontroller.controller.Feature", {
            wktgeom: wkt,
            id: "T_0"
        });
        this.vectorLayer.addFeature(feat);
        this.inputContainer.getForm().setValues(feature);

    },

    formContainers: function() {
        this.onderhoudskenmerken = Ext.create("Ext.panel.Panel", {
            border:0,
            bodyPadding:10,
            collapsible: true,
            collapsed:true,
            title: 'Onderhoudskenmerken',
            items: [

            ]
        });

        this.ziektenenplagen = Ext.create("Ext.panel.Panel", {
            border:0,
            bodyPadding:10,
            collapsible: true,
            collapsed:true,
            title: 'Ziekten en plagen',
            items: [

            ]
        });

        this.extrakenmerken = Ext.create("Ext.panel.Panel", {
            border:0,
            bodyPadding:10,
            collapsible: true,
            collapsed:true,
            title: 'Extra kenmerken',
            items: [

            ]
        });



        this.boomveiligheidskenmerken = Ext.create("Ext.panel.Panel", {
            border: 0,
            bodyPadding: 10,
            collapsible: true,
            collapsed: true,
            title: 'Boomveiligheidskenmerken',
            items: []
        });

        this.algemeen = Ext.create("Ext.panel.Panel", {
            border:0,
            bodyPadding:10,
            collapsible: true,
            collapsed:true,
            title: 'Algemeen',
            items: []
        });

        this.inputContainer.add(this.algemeen);
        this.inputContainer.add(this.boomveiligheidskenmerken);
        this.inputContainer.add(this.ziektenenplagen);
        this.inputContainer.add(this.onderhoudskenmerken);
        this.inputContainer.add(this.extrakenmerken);

    },

    fillFormContainers: function(){
        const data = this.testConfig();

        //Fill algemeen
        for (let i = 0; i < data.algemeen.field.length; i++) {
            const field = data.algemeen.field[i];
            if(field.static) {
                this.algemeen.add(this.createStaticInput(field));
            } else if (field.dynamic){
                this.algemeen.add(this.createDynamicInput(field));
            } else if (field.checkbox){
                this.algemeen.add(this.createCheckboxInput(field));
            } else if (field.date){
                this.algemeen.add(this.createDatepickerInput(field));
            } else {
                Ext.Msg.alert("Mislukt", "Field moet static, dynamic of een checkbox zijn: " + field.label);
            }
        }

        //Fill boomveiligheidskenmerken
        for (let i = 0; i < data.boomveiligheidskenmerken.field.length; i++) {
            const field = data.boomveiligheidskenmerken.field[i];
            if(field.static) {
                this.boomveiligheidskenmerken.add(this.createStaticInput(field));
            } else if (field.dynamic){
                this.boomveiligheidskenmerken.add(this.createDynamicInput(field));
            } else if (field.checkbox){
                this.boomveiligheidskenmerken.add(this.createCheckboxInput(field));
            }else if (field.date) {
                this.boomveiligheidskenmerken.add(this.createDatepickerInput(field));
            } else if (field.vta){
                if(this.digitreeConfig) {
                    const obj = {
                        name: '',
                        label: '',
                    };
                    for (let i = 1; i < 7; i ++ ) {
                        const prefix = "vta"+i;
                        const field = this.digitreeConfig.labels[i+9];
                        obj.name = prefix;
                        if (field[prefix].length > 0) {
                            obj.label = field[prefix];
                        } else {
                            obj.label = prefix.toUpperCase();
                        }

                        this.boomveiligheidskenmerken.add(this.createCheckboxInput(obj))
                    }
                }
            } else {
                Ext.Msg.alert("Mislukt", "Field moet static of dynamic zijn: " + field.label);
            }
        }

        //Fill Ziekten en plagen
        for (let i = 0; i < data.ziektenenplagen.field.length; i++) {
            const field = data.ziektenenplagen.field[i];
            if(field.static) {
                this.ziektenenplagen.add(this.createStaticInput(field));
            } else if (field.dynamic){
                this.ziektenenplagen.add(this.createDynamicInput(field));
            } else if (field.checkbox){
                this.ziektenenplagen.add(this.createCheckboxInput(field));
            } else if (field.date){
                this.ziektenenplagen.add(this.createDatepickerInput(field));
            } else {
                Ext.Msg.alert("Mislukt", "Field moet static, dynamic of een checkbox zijn: " + field.label);
            }
        }

        //Fill Onderhoudskenmerken
        for (let i = 0; i < data.onderhoudskenmerken.field.length; i++) {
            const field = data.onderhoudskenmerken.field[i];
            if(field.static) {
                this.onderhoudskenmerken.add(this.createStaticInput(field));
            } else if (field.dynamic){
                this.onderhoudskenmerken.add(this.createDynamicInput(field));
            } else if (field.checkbox){
                this.onderhoudskenmerken.add(this.createCheckboxInput(field));
            } else if (field.date){
                this.onderhoudskenmerken.add(this.createDatepickerInput(field));
            } else {
                Ext.Msg.alert("Mislukt", "Field moet static, dynamic of een checkbox zijn: " + field.label);
            }
        }

        //Extra labels (labels 1/tm 10 van digitree-beheer)
        if(this.digitreeConfig) {
            const obj = {
                name: '',
                label: '',
                text:true,
                readOnly: true,
                static: true,
                allowBlank: true
            };
            for (let i = 1; i < 11; i ++ ) {
                const prefix = "extra"+i;
                const field = this.digitreeConfig.labels[i-1];
                obj.name = prefix;
                if (field[prefix].length > 0) {
                    obj.label = field[prefix];
                } else {
                    obj.label = prefix;
                }

                this.extrakenmerken.add(this.createStaticInput(obj))
            }
        }
    },
    createCheckboxInput: function (attribute) {
        const input = Ext.create('Ext.form.field.Checkbox', {
            name: attribute.name,
            boxLabel: attribute.label,
            inputValue: '1',
            uncheckedValue: '0',
        });

        return input;
    },

    createDatepickerInput: function(attribute) {
        const input = Ext.create('Ext.form.field.Date', {
            name: attribute.name,
            fieldLabel: attribute.label,
            value: new Date(),
            format: "d-m-Y"
        });

        return input;
    },

    createDynamicInput: function (attribute) {
        const me = this;
        let data = null;
        if (attribute.storeData instanceof Array) {
            data = attribute.storeData;
        } else {
            data = this.digitreeConfig[attribute.storeData];
        }
        const store = Ext.create('Ext.data.Store', {
            fields: attribute.storeFields,
            data : data
        });

        const input = Ext.create('Ext.form.ComboBox', {
            name: attribute.name,
            fieldLabel: attribute.label,
            store: store,
            queryMode: 'local',
            displayField: attribute.labelField,
            valueField: attribute.labelValue,
            hidden: attribute.hidden,
            listeners: {
                change: function(e){
                    switch (e.name) {
                        case 'risicoklasse':
                            me.calculateNextInspectionDate(e);
                            break;
                        case 'aantastingen':
                            me.showStatusZp(e,attribute);
                            break;
                        case 'status_zp':
                            me.showClassificatie(e,attribute);
                            break;
                        default:
                            break;
                    }
                }
            }
        });

        return input;
    },

    createStaticInput: function (attribute) {
        var options = {
            name: attribute.name,
            fieldLabel: attribute.label,
            readOnly:  attribute.readOnly,
            allowBlank: attribute.allowBlank,

        };
        var input;
        if (attribute.height) {
            options.height = attribute.height;
            input = Ext.create("Ext.form.field.TextArea", options);
        } else {
            input = Ext.create("Ext.form.field.Text", options);
        }

        if (attribute.disableUserEdit) {
            input.setReadOnly(true);
            input.addCls("x-item-disabled");
        }

        return input;
    },

    showClassificatie: function(e,attribute) {
        const value = e.value;
        const classificatie = this.inputContainer.form.findField('classificatie');
        const classificatieValue = classificatie.getValue();
        const store  = classificatie.getStore();
        if(value == null){
            classificatie.setValue("");
            store.setData({});
            classificatie.setHidden(true);
            return;
        }

        if(attribute[value.trim()]){
            let found = false;
            for(let i = 0; i < attribute[value.trim()].length; i++){
                const obj  = attribute[value.trim()][i];
                if(obj.classificatie === classificatieValue) {
                    found = true;
                    break;
                }
            }
            if(!found){
                classificatie.setValue("");
            }
            store.setData(attribute[value.trim()]);
            classificatie.setHidden(false);
        } else {
            classificatie.setValue("");
            store.setData({});
            classificatie.setHidden(true);
        }


    },

    showStatusZp: function(e,attribute) {
        const value = e.value;
        const status_zp  = this.inputContainer.form.findField('status_zp');
        if (value == null) {
            status_zp.setValue("");
            status_zp.setHidden(true);
            return;
        }
        if(attribute.statusZpFields.includes(value.trim())){
            status_zp.setHidden(false);
        } else {
            status_zp.setValue("");
            status_zp.setHidden(true);
        }
    },

    /*geen verhoogd + 3
atten + 1
tijdelijk + 1
risico + 90 dagen */

    calculateNextInspectionDate: function(e) {
        const value = e.value;
        const date = new Date();
        let newDate = "";
        let year;
        let day;
        let month;
        switch (value) {
            case "geen verhoogd risico":
                year  = date.getFullYear() + 3;
                day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
                newDate = day + "-" + month + "-" + year;
                break;
            case "tijdelijk verhoogd risico":
                year  = date.getFullYear() + 1;
                day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
                newDate = day + "-" + month + "-" + year;
                break;
            case "attentieboom":
                year  = date.getFullYear() + 1;
                day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
                month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
                newDate = day + "-" + month + "-" + year;
                break;
            case "risicoboom":
                year  = date.getFullYear();
                day = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
                month = date.getMonth() + 4 < 10 ? "0" + (date.getMonth() + 4) : (date.getMonth() + 4);
                newDate = day + "-" + month + "-" + year;
                break
            default:
                break;
        }
        const field  = this.inputContainer.form.findField('uitvoerdatum');
        field.setValue(newDate);
    },

    getDigitreeConfig: function() {
        Ext.Ajax.request({
            url: "/digitree-beheer/Api.action?getConfig=",
            scope: this,
            success: function(result) {
                const text = result.responseText;
                const response = Ext.JSON.decode(text);
                this.digitreeConfig = response;
                this.fillFormContainers();
            },
            failure: function(result) {
                this.config.viewerController.logger.error(result);
            }
        });
    },

    getProjectForGeom: function(wkt) {
        Ext.Ajax.request({
            url: "/digitree-beheer/Api.action?getProject=true&point="+wkt,
            scope: this,
            success: function(result) {
                const text = result.responseText;
                if (text === "Boom valt buiten project gebied"){
                    Ext.Msg.alert(text);
                } else {
                    this.saveTree(text);
                }
            },
            failure: function(result) {
                this.config.viewerController.logger.error(result);
            }
        });
    },

    testConfig: function() {
        return {
            algemeen: {
                field:[
                    {
                        name: 'boomid',
                        label: 'Boomid*',
                        text:true,
                        readOnly: true,
                        static: true,
                        allowBlank: false
                    },
                    {
                        name: 'project',
                        label: 'Project*',
                        text:true,
                        readOnly: true,
                        static: true,
                        allowBlank: false
                    },
                    {
                        name: 'inspecteur',
                        label: 'Inspecteur*',
                        text:true,
                        readOnly: true,
                        static: true,
                        allowBlank: false
                    },
                    {
                        name: 'aktie',
                        label: 'Aktie*',
                        text:true,
                        readOnly: false,
                        static:true,
                        allowBlank: false
                    },
                    {
                        name: 'mutatiedatum',
                        label: 'Mutatiedatum*',
                        text:true,
                        readOnly: true,
                        static: true,
                        allowBlank: false
                    },
                    {
                        name: 'mutatietijd',
                        label: 'Mutatietijd*',
                        text:true,
                        readOnly: true,
                        static: true,
                        allowBlank: false
                    },
                    {
                        name: 'boomsrt',
                        label: 'Boomsoort*',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: false,
                        storeFields: ['boomsoort', 'omschrijving'],
                        labelField: 'omschrijving',
                        labelValue: 'boomsoort',
                        storeData: 'boomsoorten'
                    },
                    {
                        name: 'plantjaar',
                        label: 'Plantjaar*',
                        text:true,
                        readOnly: false,
                        static:true,
                        allowBlank: false
                    },
                    {
                        name: 'boomhoogte',
                        label: 'Boomhoogte',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        storeFields: ['boomhoogte'],
                        labelField: 'boomhoogte',
                        labelValue: 'boomhoogte',
                        storeData: [
                            {'boomhoogte':'0-6 m'},
                            {'boomhoogte':'6-9 m'},
                            {'boomhoogte':'9-12 m'},
                            {'boomhoogte':'12-15 m'},
                            {'boomhoogte':'15-18 m'},
                            {'boomhoogte':'18-24 m'},
                            {'boomhoogte':'>24 m'},
                        ]
                    },
                    {
                        name: 'eindbeeld',
                        label: 'Eindbeeld',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        storeFields: ['eindbeeld'],
                        labelField: 'eindbeeld',
                        labelValue: 'eindbeeld',
                        storeData: [
                            {'eindbeeld':'vrij uitgroeiend'},
                            {'eindbeeld':'niet vrij uitgroeiend'},
                            {'eindbeeld':'opkronen 0-4 m'},
                            {'eindbeeld':'opkronen 0-6 m'},
                            {'eindbeeld':'opkronen 0-8 m'},
                            {'eindbeeld':'opkronen 4-4 m'},
                            {'eindbeeld':'opkronen 4-6 m'},
                            {'eindbeeld':'opkronen 4-8 m'},
                            {'eindbeeld':'opkronen 6-6 m'},
                            {'eindbeeld':'opkronen 6-8 m'},
                            {'eindbeeld':'opkronen 8-8 m'},
                            {'eindbeeld':'knotboom'},
                            {'eindbeeld':'leiboom'},
                            {'eindbeeld':'gekandelaberde boom'},
                            {'eindbeeld':'haagboom'},
                            {'eindbeeld':'vormboom'},
                            {'eindbeeld':'overig'},
                        ]
                    },
                    {
                        name: 'opmerkingen',
                        label: 'Opmerkingen',
                        text:true,
                        height:10,
                        readOnly: false,
                        static:true,
                        allowBlank: true
                    }
                ],

            },
            boomveiligheidskenmerken: {
                field: [
                    {
                        name: 'scheefstand',
                        label: 'Scheefstand',
                        checkbox:true,
                    },
                    {
                        name: 'scheuren',
                        label: 'Scheuren',
                        checkbox:true,
                    },
                    {
                        name: 'holten',
                        label: 'Holte/specht-gat',
                        checkbox:true,
                    },
                    {
                        name: 'stamvoetschade',
                        label: 'Stamvoetschade',
                        checkbox:true,
                    },
                    {
                        name: 'stamschade',
                        label: 'Stamschade',
                        checkbox:true,
                    },
                    {
                        name: 'kroonschade',
                        label: 'Kroonschade',
                        checkbox:true,
                    },
                    {
                        name: 'inrot',
                        label: 'Inrot snoeiwond',
                        checkbox:true,
                    },
                    {
                        name: 'houtboorder',
                        label: 'Houtboorder',
                        checkbox:true,
                    },
                    {
                        name: 'zwam',
                        label: 'Zwam rondom',
                        checkbox:true,
                    },
                    {
                        name: 'zwam_stamvoet',
                        label: 'Zwam stamvoet',
                        checkbox:true,
                    },
                    {
                        name: 'zwam_stam',
                        label: 'Zwam stam:',
                        checkbox:true,
                    },
                    {
                        name: 'zwam_kroon',
                        label: 'Zwam kroon',
                        checkbox:true,
                    },
                    {
                        name: 'dood_hout',
                        label: 'Dood hout',
                        checkbox:true,
                    },
                    {
                        name: 'plakoksel',
                        label: 'Plakoksel',
                        checkbox:true,
                    },
                    {
                        name: 'stamschot',
                        label: 'Stamschot',
                        checkbox:true,
                    },
                    {
                        name: 'wortelopslag',
                        label: 'Wortelopslag',
                        checkbox:true,
                    },
                    {
                        name: 'takken',
                        label: 'Takken in takvrije zone',
                        checkbox:true,
                    },
                    {
                        name: 'opdruk',
                        label: 'Opdrukken verharding',
                        checkbox:true,
                    },
                    {
                        vta:true
                    },
                    {
                        name: 'risicoklasse',
                        label: 'Risicoklasse',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        storeFields: ['risicoklasse'],
                        labelField: 'risicoklasse',
                        labelValue: 'risicoklasse',
                        storeData: [
                            {'risicoklasse':'geen verhoogd risico'},
                            {'risicoklasse':'tijdelijk verhoogd risico'},
                            {'risicoklasse':'attentieboom'},
                            {'risicoklasse':'risicoboom'}
                        ]
                    },
                    {
                        name: 'uitvoerdatum',
                        label: 'volgende inspectie:',
                        date: true
                    },
                    {
                        name: 'nader_onderzoek',
                        label: 'Nader onderzoek',
                        checkbox:true,
                    },
                ]

            },
            ziektenenplagen: {
                field: [
                    {
                        name: 'aantastingen',
                        label: 'Aanstastingen:',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        statusZpFields: ["massaria","essterfte", "iepziekte", "eikenprocessierups", "bloedingsziekte"],
                        storeFields: ['aantasting'],
                        labelField: 'aantasting',
                        labelValue: 'aantasting',
                        storeData: [
                            {'aantasting':'massaria'},
                            {'aantasting':'essterfte'},
                            {'aantasting':'iepziekte'},
                            {'aantasting':'eikenprocessierups'},
                            {'aantasting':'bloedingsziekte'},
                            {'aantasting':'Bastwoekerziekte'},
                            {'aantasting':'Berkendoder'},
                            {'aantasting':'Berkenweerschijnzwam'},
                            {'aantasting':'Dikrandtonderzwam'},
                            {'aantasting':'Echte honingzwam'},
                            {'aantasting':'Echte tonderzwam'},
                            {'aantasting':'Eikenweerschijnzwam'},
                            {'aantasting':'Gesteelde lakzwam'},
                            {'aantasting':'Gewone oesterzwam'},
                            {'aantasting':'Goudvliesbundelzwarm'},
                            {'aantasting':'Harslakzwam'},
                            {'aantasting':'Kastanjemineermot'},
                            {'aantasting':'Kogelhoutskoolzwam'},
                            {'aantasting':'Korsthoutskoolzwam'},
                            {'aantasting':'Platte tonderzwam'},
                            {'aantasting':'Prachtkever'},
                            {'aantasting':'Reuzenzwam'},
                            {'aantasting':'Roodporiezwam'},
                            {'aantasting':'Sombere honingzwam'},
                            {'aantasting':'Verwelkingziekte (Verticilium)'},
                            {'aantasting':'Waslakzwam'},
                            {'aantasting':'Watermerkziekte'},
                            {'aantasting':'Wilgenhoutrups'},
                            {'aantasting':'Zadelzwam'},
                            {'aantasting':'Zwavelzwam'}
                        ]
                    },
                    {
                        name: 'status_zp',
                        label: 'Status ziekten en plagen',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        hidden:true,
                        storeFields: ['status_zp'],
                        labelField: 'status_zp',
                        labelValue: 'status_zp',
                        storeData: [
                            {'status_zp':'melding'},
                            {'status_zp':'monitoring'},
                            {'status_zp':'registratie'},
                            {'status_zp':'bestreden'}
                        ],
                        melding: [
                            {'classificatie':'gemeente'},
                            {'classificatie':'particulier'},
                            {'classificatie':'provincie'}
                        ],
                        monitoring: [
                            {'classificatie':'spuitlocatie'},
                            {'classificatie':'feromoonval'},
                            {'classificatie':'controlelocatie'}
                        ],
                        registratie: [
                            {'classificatie':'prioriteit: urgent'},
                            {'classificatie':'prioriteit: standaard'},
                            {'classificatie':'prioriteit: laag'},
                            {'classificatie':'prioriteit: geen'}
                        ],
                        bestreden: [
                            {'classificatie':'hoge plaagdruk'},
                            {'classificatie':'matige plaagdruk'},
                            {'classificatie':'laag plaagdruk'},
                            {'classificatie':'geen plaagdruk'}
                        ],
                    },
                    {
                        name: 'classificatie',
                        label: 'Classificatie',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        hidden:true,
                        storeFields: ['classificatie'],
                        labelField: 'classificatie',
                        labelValue: 'classificatie',
                        storeData: [

                        ]
                    },
                ]

            },
            onderhoudskenmerken: {
                field: [
                    {
                        name: 'maatregelen_kort',
                        label: 'Maatregel kort termijn:',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        storeFields: ['maatregelen_kort'],
                        labelField: 'maatregelen_kort',
                        labelValue: 'maatregelen_kort',
                        storeData: [
                            {'maatregelen_kort':'BGS beeld'},
                            {'maatregelen_kort':'BGS achterstallig'},
                            {'maatregelen_kort':'BGS verwaarloosd'},
                            {'maatregelen_kort':'OHS beeld'},
                            {'maatregelen_kort':'OHS achterstallig'},
                            {'maatregelen_kort':'Rooien'}
                        ]
                    },
                    {
                        name: 'maatregelen_lang',
                        label: 'Maatregel lange termijn:',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        storeFields: ['maatregelen_lang'],
                        labelField: 'maatregelen_lang',
                        labelValue: 'maatregelen_lang',
                        storeData: [
                            {'maatregelen_lang':'BGS fase'},
                            {'maatregelen_lang':'OHS 1x/1 jr'},
                            {'maatregelen_lang':'OHS 1x/2 jr'},
                            {'maatregelen_lang':'OHS 1x/3 jr'},
                            {'maatregelen_lang':'OHS 1x/6 jr'},
                            {'maatregelen_lang':'OHS 1x/9 jr'},
                            {'maatregelen_lang':'OHS 1x/12 jr'},
                        ]
                    },
                    {
                        name: 'bereikbaarheid',
                        label: 'Bereikbaarheid',
                        checkbox:true,
                    },
                    {
                        name: 'wegtype',
                        label: 'Wegtype:',
                        text:true,
                        readOnly: true,
                        dynamic: true,
                        allowBlank: true,
                        storeFields: ['wegtype'],
                        labelField: 'wegtype',
                        labelValue: 'wegtype',
                        storeData: [
                            {'wegtype':'A'},
                            {'wegtype':'B1'},
                            {'wegtype':'B2'},
                            {'wegtype':'C1'},
                            {'wegtype':'C2'},
                            {'wegtype':'D'},
                            {'wegtype':'E'},
                            {'wegtype':'F1'},
                            {'wegtype':'F2'},
                            {'wegtype':'KR'},
                            {'wegtype':'RO'},
                            {'wegtype':'FP'},
                            {'wegtype':'VP'},
                        ]
                    }
                ]
            },
        }

    }
});
