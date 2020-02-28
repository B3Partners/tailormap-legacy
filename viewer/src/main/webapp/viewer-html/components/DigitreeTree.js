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
                        this.createButton("saveButton", 'Opslaan', this.saveTree, true),
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
    },

    createNew: function () {
        this.mode = "new";
        console.log("Nieuwe boom");
    },

    editTree: function () {
        this.mode = "edit";
        console.log("Edit");
        this.toolMapClick.activateTool();
    },

    saveTree: function() {
        if (!this.inputContainer.form.isValid()){
            Ext.Msg.alert("Velden zijn verplicht", "Niet alle verplichte velden zijn ingevuld");
            return;
        }

        const feature = this.inputContainer.form.getValues();

        Ext.Ajax.request({
            url: "/viewer/action/digitree",
            params: {
                saveTree: true,
                applayerId: this.config.layers[0],
                application: this.config.viewerController.app.id,
                feature: Ext.JSON.encode(feature)
            },
            scope: this,
            timeout: 40000,
            success: function(result) {
                const text = result.responseText;
                const response = Ext.JSON.decode(text);
                console.log(response);
            },
            failure: function(result) {
                this.config.viewerController.logger.error(result);
            }
        });
        console.log("save");
    },

    deleteTree: function() {
        console.log("deleteTree");
    },

    mapClicked: function (toolMapClick, comp) {
        //this.toolMapClick.deactivateTool();
        this.inputContainer.getForm().reset();
        const coords = comp.coord;
        this.config.viewerController.mapComponent.getMap().setMarker("edit", coords.x, coords.y);
        this.getFeaturesForCoord(coords);
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

    showAndFocusForm: function() {

    },

    featureReceived: function(feature) {
        if(!feature) {
            return;
        }
        feature.boomsrt = feature.boomsrt.trim();
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
            collapsed:false,
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

    createDynamicInput: function (attribute) {
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
                        name: 'opdrukken',
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
                        name: 'nader_onderzoek',
                        label: 'Nader onderzoek',
                        checkbox:true,
                    },
                ]

            },
            ziektenenplagen: {

            },
            onderhoudskenmerken: {

            },
        }

    }

});
