/*
 * Copyright (C) 2012-2017 B3Partners B.V.
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
/* global Ext, contextPath, MobileManager, actionBeans, saveAs */

/**
 * Ontbrandingsaanvraag component
 * Creates a Ontbrandingsaanvraag component
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.Ontbrandingsaanvraag",{
    extend: "viewer.components.tools.DownloadMap",
    vectorLayer: null,
    extraObjectsLayer: null,
    calculationResultLayer: null,
    tempCalculationResultLayer: null,
    // Current active feature
    activeFeature: null,
    // All features
    features: null,
    // default margin/padding
    defaultMargin: '10 0 0 0',
    // all pages
    wizardPages: [],
    // keep track of wizard page
    currentPage: 0,
    // config
    config:{},

    IGNITION_LOCATION_TYPE: 'ignitionLocation',
    IGNITION_LOCATION_FORM: 'ignitionLocationForm',
    AUDIENCE_LOCATION_TYPE: 'audienceLocation',
    AUDIENCE_LOCATION_FORM: 'audienceLocationForm',
    EXTRA_OJBECT_TYPE: 'extraObject',
    EXTRA_OBJECT_FORM: 'extraObjectForm',
    MEASURE_LINE_TYPE: 'measureObject',
    MEASURE_LINE_COLOR: '777777',

    COMPONENT_VERSION: '1.0',
    COMPONENT_NAME: 'Ontbrandingsaanvraag',
    ZONE_DISTANCES_CONSUMER: {},
    ZONE_DISTANCES_PROFESSIONAL: {},
    OTHER_LABEL: "Anders, namelijk...",

    constructor: function (conf){
        this.initConfig(conf);
        viewer.components.Ontbrandingsaanvraag.superclass.constructor.call(this, this.config);
        this.zoneDistanceConfigToObject(conf.zonedistances_consumer, this.ZONE_DISTANCES_CONSUMER);
        this.zoneDistanceConfigToObject(conf.zonedistances_professional, this.ZONE_DISTANCES_PROFESSIONAL);
	
        this.features = {};
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.selectedContentChanged, this);
        this.iconPath = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/drawing/";
        this.loadWindow();
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_ALL_LAYERS_LOADING_COMPLETE, this.createLayers, this);
        return this;
    },
    
    zoneDistanceConfigToObject: function(conf, obj) {
         if(!conf || conf.length === 0) return;
         for(var i = 0; i < conf.length; i++) {
             obj[conf[i].label] = conf[i].distance;
         }
    },
    
    selectedContentChanged : function (){
        if(this.vectorLayer === null) {
            this.createLayers();
        } else {
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
            this.config.viewerController.mapComponent.getMap().addLayer(this.extraObjectsLayer);
        }
    },

    getVectorLayer: function() {
        if(this.vectorLayer === null) {
            this.createLayers();
        }
        return this.vectorLayer;
    },

    getExtraObjectsLayer: function() {
        if(this.extraObjectsLayer === null) {
            this.createLayers();
        }
        return this.extraObjectsLayer;
    },

    getCalculationResultLayer: function() {
        if(this.calculationResultLayer === null) {
            this.createLayers();
        }
        return this.calculationResultLayer;
    },

    getTempCalculationResultLayer: function() {
        if(this.tempCalculationResultLayer === null) {
            this.createLayers();
        }
        return this.tempCalculationResultLayer;
    },

    createLayers : function () {
        var defaultProps = {
            'fontColor': "#000000",
            'fontSize': "13px",
            'labelOutlineColor': "#ffffff",
            'labelOutlineWidth': 2,
            'labelAlign': "cm",
            'fillColor': '#FF0000',
            'fillOpacity': 0.5,
            'strokeColor': "#FF0000",
            'strokeOpacity': 0.5
        };
        this.defaultStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', defaultProps);
        this.safetyZoneStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', Ext.Object.merge({}, defaultProps, {
            'fillColor': '#ffe19b',
            'strokeColor': "#ffba37"
        }));
        this.tempSafetyZoneStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', Ext.Object.merge({}, this.safetyZoneStyle.config, {
            'fillColor': '#ffe19b',
            'fillOpacity': 0.2,
            'strokeOpacity': 0.2,
            'strokeColor': "#ffba37"
        }));
        this.ingnitionLocationStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', Ext.Object.merge({}, defaultProps, {
            'fillColor': "#009900",
            'strokeColor': "#00FF00"
        }));
        this.mainAudienceLocationStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', Ext.Object.merge({}, defaultProps, {
            'fillColor': "#0000FF",
            'strokeColor': "#0000FF"
        }));
        this.defaultAudienceLocation = Ext.create('viewer.viewercontroller.controller.FeatureStyle', Ext.Object.merge({}, defaultProps, {
            'fillColor': "#FFFF00",
            'strokeColor': "#FFFF00"
        }));
        this.measureLineStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', Ext.Object.merge({}, defaultProps, {
            'fillColor': "#000000",
            'strokeColor': '#' + this.MEASURE_LINE_COLOR
        }));
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: 'ontbrandingsAanvraagVectorLayer',
            geometrytypes: ["Circle","Polygon","Point","LineString"],
            showmeasures: true,
            viewerController: this.config.viewerController,
            defaultFeatureStyle: this.defaultStyle,
            addStyleToFeature: true,
            addAttributesToFeature: true
        });
        this.extraObjectsLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: 'ontbrandingsAanvraagLabelVectorLayer',
            geometrytypes: ["Point", "Circle"],
            showmeasures: false,
            viewerController: this.config.viewerController,
            defaultFeatureStyle: this.defaultStyle,
            addStyleToFeature: true
        });
        this.calculationResultLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: 'calculationResultLayer',
            geometrytypes: ["Polygon", "Circle", "Point", "LineString"],
            showmeasures: false,
            viewerController: this.config.viewerController,
            defaultFeatureStyle: this.safetyZoneStyle
        });
        this.tempCalculationResultLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: 'tempCalculationResultLayer',
            geometrytypes: ["Polygon", "Circle", "Point", "LineString"],
            showmeasures: false,
            viewerController: this.config.viewerController,
            defaultFeatureStyle: this.tempSafetyZoneStyle,
            addStyleToFeature: true
        });        
        this.config.viewerController.mapComponent.getMap().addLayer(this.calculationResultLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.tempCalculationResultLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.extraObjectsLayer);
        this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED, this.activeFeatureChanged, this);
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED, this.activeFeatureFinished, this);
    },

    /**
     * Create the GUI
     */
    loadWindow : function() {
        this.wizardPages = [
            this.createWizardPage("Nieuwe of bestaande aanvraag", [
                "Via dit formulier kunt u een ontbrandingsaanvraag tekeken om vervolgens in te dienen.",
                {
                    xtype: 'button',
                    html: 'Nieuw aanvraag indienen',
                    margin: this.defaultMargin,
                    listeners: { click: this.newRequest, scope: this }
                },
                {
                    xtype: 'button',
                    html: 'Eerdere aanvraag inladen',
                    margin: this.defaultMargin,
                    listeners: { click: this.loadRequest, scope: this }
                },
                {
                    xtype: 'form',
                    itemId: 'formopen',
                    border: 0,
                    hidden: true,
                    margin: this.defaultMargin,
                    layout: { type: 'vbox', align: 'stretch' },
                    items: [
                        {
                            xtype: 'label',
                            text: 'Bestand met eerdere aanvraag openen',
                            forId: 'featureFile'
                        },
                        {
                            xtype: 'container',
                            layout: { type: 'hbox' },
                            items: [
                                {
                                    xtype: 'filefield',
                                    hideLabel: true,
                                    name: 'featureFile',
                                    allowBlank: false,
                                    msgTarget: 'side',
                                    buttonText: 'Bladeren',
                                    itemId: 'featureFile',
                                    flex: 1
                                }
                            ]
                        },
                        {
                            xtype: 'button',
                            text: 'Aanvraag inladen',
                            listeners: {
                                click: this.loadFile,
                                scope: this
                            }
                        },
                        {
                            xtype: 'container',
                            margin: this.defaultMargin,
                            itemId: 'fileLoadMessages',
                            html: ''
                        }
                    ]
                }
            ]),
            this.createWizardPage("Afsteeklocaties", [
                {
                    xtype: 'button',
                    html: 'Afsteeklocatie toevoegen',
                    margin: this.defaultMargin,
                    listeners: { click: this.createIgnitionLocation, scope: this }
                },
                {
                    xtype: 'container',
                    layout: 'fit',
                    itemId: 'ignitionLocationsContainer',
                    flex: 1,
                    minHeight: 100
                },
                this.createIgnitionLocationForm()
            ]),
            this.createWizardPage("Publieklocaties", [
                {
                    xtype: 'button',
                    html: 'Publieklocatie toevoegen',
                    margin: this.defaultMargin,
                    listeners: { click: this.createAudienceLocation, scope: this }
                },
                {
                    xtype: 'container',
                    layout: 'fit',
                    itemId: 'audienceLocationsContainer',
                    flex: 1,
                    minHeight: 100
                },
                this.createAudienceLocationForm()
            ]),
            this.createWizardPage("Berekening van de veiligheidszone", [
                {
                    xtype: 'button',
                    html: 'Bereken veiligheidszone',
                    margin: this.defaultMargin,
                    listeners: { click: this.calculateSafetyZone, scope: this }
                },
                 {
                    xtype: 'button',
                    html: 'Verwijder veiligheidszone',
                    margin: this.defaultMargin,
                    listeners: { click: this.removeSafetyZones, scope: this }
                },
                {
                    xtype: 'container',
                    itemId: 'calculation_messages',
                    html: ''
                }
            ]),
            this.createWizardPage("Toevoegen hulp- en afstandslijnen", [
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    margin: this.defaultMargin,
                    defaults: {
                        xtype: 'button',
                        flex: 1
                    },
                    items: [
                        {
                            html: 'Hulplijn',
                            listeners: { click: this.createExtraObject, scope: this }
                        },
                        {
                            html: 'Afstandslijn',
                            listeners: { click: this.createMeasureLine, scope: this }
                        }
                    ]
                },
                {
                    xtype: 'container',
                    layout: 'fit',
                    itemId: 'extraObjectsContainer',
                    flex: 1,
                    minHeight: 100
                },
                this.createExtraObjectsForm()
            ]),
            this.createWizardPage("Opslaan en printen", [
                {
                    xtype: 'button',
                    html: 'Aanvraag opslaan',
                    margin: this.defaultMargin,
                    listeners: { click: this.saveFile, scope: this }
                },
                {
                    xtype: 'button',
                    html: 'Aanvraag printen',
                    margin: this.defaultMargin,
                    listeners: { click: this.printRequest, scope: this }
                }
            ])
        ];

        this.mainContainer = Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'fit'
            },
            defaults: {
                bodyStyle: 'padding: 10px'
            },
            items: this.wizardPages,
            fbar: [
                { type: 'button', itemId: 'prev_button', text: 'Vorige', handler: function() { this.previousPage(); }.bind(this) },
                { type: 'button', itemId: 'next_button', text: 'Volgende', handler: function() { this.nextPage(); }.bind(this) }
            ]
        });
        this.getContentContainer().add(this.mainContainer);
        this.createIgnitionLocationsGrid();
        this.createAudienceLocationsGrid();
        this.createExtraObjectsGrid();
        this.movePage(0);
    },

    previousPage: function() {
        this.movePage(-1);
    },

    nextPage: function() {
        this.movePage(1);
    },

    movePage: function(direction) {
        this.wizardPages[this.currentPage].setVisible(false);
        this.currentPage += direction;
        var next_button = this.getContentContainer().query('#next_button')[0];
        var prev_button = this.getContentContainer().query('#prev_button')[0];
        next_button.setDisabled(false);
        prev_button.setDisabled(false);
        if(this.currentPage < 0) {
            this.currentPage = 0;
            prev_button.setDisabled(true);
        }
        if(this.currentPage >= this.wizardPages.length) {
            this.currentPage = this.wizardPages.length - 1;
            next_button.setDisabled(true);
        }
        if(this.currentPage === 0) {
            prev_button.setDisabled(true);
        }
        if(this.currentPage === this.wizardPages.length - 1) {
            next_button.setDisabled(true);
        }
        this.wizardPages[this.currentPage].setVisible(true);
        this.deselectAllFeatures();
    },

    createIgnitionLocationsGrid: function() {
        Ext.create('Ext.data.Store', {
            storeId: 'ignitionLocations',
            fields: [
                { name: 'fid', type: 'string' },
                { name: 'label', type: 'string' },
                { name: 'type', type: 'string', defaultValue: this.IGNITION_LOCATION_TYPE },
                { name: 'zonedistance_consumer', type: 'string' },
                { name: 'custom_zonedistance_consumer', type: 'number' },
                { name: 'fireworks_type', type: 'string', defaultValue: 'consumer' },
                { name: 'zonedistance_professional', type: 'string' },
                { name: 'custom_zonedistance_professional', type: 'number' },
                { name: 'size', type: 'number' }
            ],
            data: []
        });
        this.ignitionLocationsGrid = this._createGrid('ignitionLocations', "Afsteeklocaties", [
            { dataIndex: 'label', flex: 1 }
        ]);
        this.getContentContainer().query('#ignitionLocationsContainer')[0].add(this.ignitionLocationsGrid);
        return this.ignitionLocationsGrid;
    },

    createAudienceLocationsGrid: function() {
        Ext.create('Ext.data.Store', {
            storeId: 'audienceLocations',
            fields: [
                { name: 'fid', type: 'string' },
                { name: 'type', type: 'string', defaultValue: this.AUDIENCE_LOCATION_TYPE },
                { name: 'label', type: 'string' },
                { name: 'mainLocation', type: 'boolean', defaultValue: false },
                { name: 'size', type: 'number' }
            ],
            data: []
        });
        this.audienceLocationsGrid = this._createGrid('audienceLocations', "Publieklocaties", [
            { dataIndex: 'label', flex: 1, renderer: function(value, cell, record) {
                return record.get('mainLocation') ? '<strong>' + value + '</strong>' : value;
            }}
        ]);
        this.getContentContainer().query('#audienceLocationsContainer')[0].add(this.audienceLocationsGrid);
        return this.audienceLocationsGrid;
    },

    createExtraObjectsGrid: function() {
        Ext.create('Ext.data.Store', {
            storeId: 'extraObject',
            fields: [
                { name: 'fid', type: 'string' },
                { name: 'type', type: 'string', defaultValue: this.EXTRA_OJBECT_TYPE },
                { name: 'label', type: 'string' },
                { name: 'color', type: 'string', defaultValue: 'FF0000' },
                { name: 'dashStyle', type: 'string', defaultValue: 'solid' },
                { name: 'arrow', type: 'string', defaultValue: 'none' }
            ],
            data: []
        });
        this.extraObjectsGrid = this._createGrid('extraObject', "Extra objecten", [
            { dataIndex: 'label', flex: 1 }
        ], /*skipSize=*/true);
        this.getContentContainer().query('#extraObjectsContainer')[0].add(this.extraObjectsGrid);
        return this.extraObjectsGrid;
    },

    _createGrid: function(storeId, title, columns, skipSize) {
        if(!skipSize) {
            columns.push({ dataIndex: 'size', renderer: function(value) {
                return this.createSizeLabel(value, /*squareMeters=*/true);
            }, scope: this });
        }
        columns.push(
            { xtype: 'actioncolumn', width: 30, sortable:false, hidable:false, items: [
                { iconCls: 'x-fa fa-pencil', tooltip: 'Bewerken', handler: this._editLocation.bind(this) }
            ]},
            { xtype: 'actioncolumn', width: 30, sortable:false, hidable:false, items: [
                { iconCls: 'x-fa fa-trash', tooltip: 'Verwijderen', handler: this._removeLocation.bind(this) }
            ]}
        );
        var grid = Ext.create('Ext.grid.Panel', {
            title: title,
            header: false,
            store: Ext.data.StoreManager.lookup(storeId),
            columns: columns,
            listeners: {
                select: function(row, record, idx) {
                    this._editLocation(grid, idx, true);
                },
                scope: this
            }
        });
        return grid;
    },

    createIgnitionLocationForm: function() {
        this.createZonedistanceStore(this.ZONE_DISTANCES_CONSUMER, 'consumerZoneDistanceStore');
        this.createZonedistanceStore(this.ZONE_DISTANCES_PROFESSIONAL, 'professionalZoneDistanceStore');
        return {
            xtype: 'form',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                labelAlign: 'top'
            },
            border: 0,
            hidden: true,
            itemId: this.IGNITION_LOCATION_FORM,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Label',
                    name: 'label',
                    itemId: 'ignition_label'
                },
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Type vuurwerk',
                    height: 65,
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1,
                        listeners: {
                            change: this.toggleZonedistancesForm,
                            scope: this
                        }
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: 'Consument',
                            name: 'fireworks_type',
                            inputValue: 'consumer',
                            itemId: 'fireworks_type_choice_consumer'

                        }, {
                            boxLabel: 'Professioneel',
                            name: 'fireworks_type',
                            inputValue: 'professional',
                            itemId: 'fireworks_type_choice_professional'
                        }
                    ]
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Zoneafstanden',
                    queryMode: 'local',
                    store: Ext.StoreManager.lookup('consumerZoneDistanceStore'),
                    displayField: 'label',
                    valueField: 'val',
                    name: 'zonedistance_consumer',
                    itemId: 'zonedistance_consumer',
                    listeners: {
                        change: function(combo, val) {
                            this.getContentContainer().query('#custom_zonedistance_consumer')[0].setVisible(val === this.OTHER_LABEL);
                        },
                        scope: this
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Handmatige zoneafstand',
                    hidden: true,
                    name: 'custom_zonedistance_consumer',
                    itemId: 'custom_zonedistance_consumer'
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Zoneafstanden',
                    queryMode: 'local',
                    store: Ext.StoreManager.lookup('professionalZoneDistanceStore'),
                    displayField: 'label',
                    hidden: true,
                    valueField: 'val',
                    name: 'zonedistance_professional',
                    itemId: 'zonedistance_professional',
                    listeners: {
                        change: function(combo, val) {
                            this.getContentContainer().query('#custom_zonedistance_professional')[0].setVisible(val === this.OTHER_LABEL);
                        },
                        scope: this
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Handmatige zoneafstand',
                    hidden: true,
                    name: 'custom_zonedistance_professional',
                    itemId: 'custom_zonedistance_professional'
                },
                {
                    xtype: 'button',
                    text: 'Opslaan',
                    listeners: { click: this.saveIgnitionLocation, scope: this }
                }
            ]
        };
    },

    createZonedistanceStore: function(zonedistances, name) {
        var keys = Ext.Object.getKeys(zonedistances);
        var store_items = Ext.Array.map(keys, function(item) {
            return { "val": item, "label": [item, " (", zonedistances[item], "m)"].join("") };
        }, this);
        store_items.push({ "val": this.OTHER_LABEL, "label": this.OTHER_LABEL });
        Ext.create('Ext.data.Store', {
            storeId: name,
            fields: ['val', 'label'],
            data: store_items
        });
    },

    toggleZonedistancesForm: function() {
        var val = '';
        if(this.getContentContainer().query('#fireworks_type_choice_consumer')[0].getValue()) {
            val = 'consumer';
        } else if(this.getContentContainer().query('#fireworks_type_choice_professional')[0].getValue()) {
            val = 'professional';
        }
        this.getContentContainer().query('#zonedistance_consumer')[0].setVisible(val === 'consumer');
        this.getContentContainer().query('#custom_zonedistance_consumer')[0].setVisible(
            val === 'consumer' && this.getContentContainer().query('#zonedistance_consumer')[0].getValue() === this.OTHER_LABEL
        );
        this.getContentContainer().query('#zonedistance_professional')[0].setVisible(val === 'professional');
        this.getContentContainer().query('#custom_zonedistance_professional')[0].setVisible(
            val === 'professional' && this.getContentContainer().query('#zonedistance_professional')[0].getValue() === this.OTHER_LABEL
        );
    },

    createAudienceLocationForm: function() {
        return {
            xtype: 'form',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                labelAlign: 'top'
            },
            border: 0,
            hidden: true,
            itemId: this.AUDIENCE_LOCATION_FORM,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Label',
                    name: 'label',
                    itemId: 'audience_label'
                },
                {
                    xtype: 'checkboxfield',
                    fieldLabel: 'Hoofdlocatie',
                    name: 'mainLocation',
                    itemId: 'mainLocation'
                },
                {
                    xtype: 'button',
                    text: 'Opslaan',
                    listeners: { click: this.saveAudienceLocation, scope: this }
                }
            ]
        };
    },

    createExtraObjectsForm: function() {
        var setColorHandler = this.setExtraObjectColor.bind(this);
        return {
            xtype: 'form',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                labelAlign: 'top'
            },
            border: 0,
            hidden: true,
            itemId: this.EXTRA_OBJECT_FORM,
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'Label',
                    name: 'label',
                    itemId: 'extra_object_label'
                },
                {
                    xtype: 'colorfield',
                    fieldLabel: 'Lijnkleur',
                    showText: false,
                    itemId: 'lineColor',
                    listeners: {
                        select: function(color) {
                            this.blur();
                            setColorHandler(color);
                        }
                    }
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Lijntype',
                    queryMode: 'local',
                    store: [['solid', 'Doorgetrokken lijn'], ['dot', 'Stippellijn'], ['dash', 'Gestreepte lijn']],
                    name: 'dashStyle',
                    itemId: 'dashStyle'
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Pijlen',
                    queryMode: 'local',
                    store: [['none', 'Geen'], ['begin', 'Begin van de lijn'], ['end', 'Eind van de lijn'], ['both', 'Beide kanten van de lijn']],
                    name: 'arrow',
                    itemId: 'arrow'
                },
                {
                    xtype: 'button',
                    text: 'Opslaan',
                    listeners: { click: this.saveExtraObject, scope: this }
                }
            ]
        };
    },

    createSizeLabel: function(size, squareMeters) {
        if(!size) {
            return '';
        }
        var unit = squareMeters ? 'm2' : 'm';
        if(size > (squareMeters ? 1000000 : 1000)) {
            size = size / (squareMeters ? 1000000 : 1000);
            unit = squareMeters ? 'km2' : 'km';
        }
        return size.toFixed(2) + ' ' + unit;
    },

    createIgnitionLocation: function() {
        this._createLocation(this.IGNITION_LOCATION_TYPE, this.IGNITION_LOCATION_FORM);
        this.editingIgnitionLocation = null;
    },

    addIgnitionLocation: function(id) {
        this._addLocation(this.ignitionLocationsGrid, id, null, "Afsteeklocatie ");
    },

    saveIgnitionLocation: function() {
        this._saveLocation(this.ignitionLocationsGrid, this.editingIgnitionLocation, this.IGNITION_LOCATION_FORM);
    },

    createAudienceLocation: function() {
        this._createLocation(this.AUDIENCE_LOCATION_TYPE, this.AUDIENCE_LOCATION_FORM);
        this.editingAudienceLocation = null;
    },

    addAudienceLocation: function(id) {
        var added_index = this._addLocation(this.audienceLocationsGrid, id, null, "Publiekslocatie ");
        if(added_index === 0) {
            var location = this.audienceLocationsGrid.getStore().getAt(added_index);
            location.set('mainLocation', true);
            this.getVectorLayer().setFeatureStyle(id, this.mainAudienceLocationStyle);
        }
    },

    saveAudienceLocation: function() {
        var location = this._saveLocation(this.audienceLocationsGrid, this.editingAudienceLocation, this.AUDIENCE_LOCATION_FORM);
        if(location.get('mainLocation') === true) {
            this.getVectorLayer().setFeatureStyle(location.get('fid'), this.mainAudienceLocationStyle, true);
            this.audienceLocationsGrid.getStore().each(function(loc) {
                if(loc !== location) {
                    loc.set('mainLocation', false);
                    this.getVectorLayer().setFeatureStyle(loc.get('fid'), this.defaultAudienceLocation, true);
                }
            }, this);
            this.getVectorLayer().reload();
        }
    },

    createExtraObject: function() {
        this._createLocation(this.EXTRA_OJBECT_TYPE, this.EXTRA_OBJECT_FORM);
        this.editingExtraObject = null;
    },

    createMeasureLine: function() {
        this._createLocation(this.MEASURE_LINE_TYPE, this.EXTRA_OBJECT_FORM);
        this.editingExtraObject = null;
    },

    addExtraObject: function(feature, type) {
        var default_label = type === this.MEASURE_LINE_TYPE ? 'Afstandslijn ' : "Hulplijn ";
        var override_type = type === this.MEASURE_LINE_TYPE ? this.MEASURE_LINE_TYPE : null;
        var added_index = this._addLocation(this.extraObjectsGrid, feature.getId(), null, default_label, override_type);
        var extraObject = this.extraObjectsGrid.getStore().getAt(added_index);
        if(type === this.MEASURE_LINE_TYPE) {
            extraObject.set('arrow', 'both');
            extraObject.set('color', this.MEASURE_LINE_COLOR);
            extraObject.set('dashStyle', 'dash');
        }
        this.updateExtraObjectFeature(extraObject, feature);
    },

    saveExtraObject: function() {
        var extraObject = this._saveLocation(this.extraObjectsGrid, this.editingExtraObject, this.EXTRA_OBJECT_FORM);
        this.updateExtraObjectFeature(extraObject);
    },

    updateExtraObjectFeature: function(extraObject) {
        if(!extraObject) {
            return;
        }
        var feature = this.getVectorLayer().getFeatureById(extraObject.get('fid'));
        var featureStyle = feature.getStyle();
        if(!featureStyle) {
            featureStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', {});
        }
        featureStyle.set('strokeColor', '#' + extraObject.get('color'));
        featureStyle.set('strokeDashstyle', extraObject.get('dashStyle'));
        featureStyle.set('label', '');
        featureStyle.set('strokeWidth', 4);
        this.getVectorLayer().setFeatureStyle(extraObject.get('fid'), featureStyle);
        this.updateExtraObjectLabel(extraObject);
    },

    updateExtraObjectLabel: function(extraObject) {
        var longest_component = 0;
        var start = null;
        var end = null;
        var components = this.getVectorLayer().getFeatureGeometry(extraObject.get('fid')).components;
        if(!components) {
            return;
        }
        for(var i = 0; i < components.length-1; i++) {
            var xy = [components[i], components[i+1]];
            var distance = xy[0].distanceTo(xy[1]);
            if(distance > longest_component) {
                longest_component = distance;
                start = xy[0];
                end = xy[1];
            }
        }
        if(start.x > end.x) {
            var tmp = end;
            end = start;
            start = tmp;
        }
        var midx = start.x + (end.x - start.x)/2;
        var midy = start.y + (end.y - start.y)/2;
        var opposite = (end.y - start.y);
        var adjacent = (end.x - start.x);
        var theta = Math.atan2(opposite, adjacent);
        var angle = -theta * (180/Math.PI);
        this.removeExtraObjects(extraObject);
        var label = extraObject.get('label');
        if(extraObject.get('type') === this.MEASURE_LINE_TYPE) {
            label = this.createSizeLabel(extraObject.get('size'));
        }
        var labelStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', {
            rotation: angle,
            labelXOffset: Math.cos(theta + Math.PI/2) * 10,
            labelYOffset: Math.sin(theta + Math.PI/2) * 10,
            fillColor: 'transparent',
            strokeColor: 'transparent',
            label: label
        });
        var features = [
            this.createFeature(this.getPointWkt(midx, midy), labelStyle, {
                "object_fid": extraObject.get('fid')
            })
        ];
        var arrow = extraObject.get('arrow');
        if(arrow === 'begin' || arrow === 'both') {
            features.push(this.createArrow(components[0], components[1], extraObject));
        }
        if(arrow === 'end' || arrow === 'both') {
            features.push(this.createArrow(components[components.length-1], components[components.length-2], extraObject));
        }
        this.getExtraObjectsLayer().addFeatures(features);
    },

    createArrow: function(arrow_start, arrow_end, extraObject) {
        var dx = arrow_end.x - arrow_start.x;
        var dy = arrow_end.y - arrow_start.y;
        var arrow_angle  = Math.atan(dy/dx)*180/Math.PI;
        arrow_angle = this.getQuadrantAngle(arrow_angle, dx, dy) + 180;
        var arrowStyle = Ext.create('viewer.viewercontroller.controller.FeatureStyle', {
            graphicName: 'triangle',
            rotation: arrow_angle,
            pointRadius: 7,
            fillColor: '#' + extraObject.get('color'),
            strokeColor: '#' + extraObject.get('color'),
            fillOpacity: 1
        });
        return this.createFeature(this.getPointWkt(arrow_start.x, arrow_start.y), arrowStyle, {
            "object_fid": extraObject.get('fid')
        });
    },

    getQuadrantAngle: function(angle, dx, dy) {
        var qAngle = [-1, 90, -90, 270, 90];
        var Quadrant = 0;
        if(dx>=0 && dy>=0)
            Quadrant = 1;
        else if(dx>=0 && dy<0)
            Quadrant = 4;
        else if(dx<=0 && dy>=0)
            Quadrant = 2;
        else if(dx<=0 && dy<0)
            Quadrant = 3;
        return (-angle + qAngle[Quadrant]);
    },

    getPointWkt: function(x, y) {
        return ['POINT(', x, ' ', y, ')'].join('');
    },

    removeExtraObjects: function(extraObject) {
        this.getExtraObjectsLayer().removeFeaturesByAttribute('object_fid', extraObject.get('fid'));
    },

    setExtraObjectColor: function(color) {
        var extraObject = this.extraObjectsGrid.getStore().getAt(this.editingExtraObject);
        extraObject.set('color', color);
    },

    _createLocation: function(drawType, formQuery) {
        this.isDrawing = drawType;
        this.getVectorLayer().defaultFeatureStyle = this.ingnitionLocationStyle;
        var drawingName = "afsteeklocatie";
        if(drawType === this.AUDIENCE_LOCATION_TYPE) {
            this.getVectorLayer().defaultFeatureStyle = this.defaultAudienceLocation;
            drawingName = "publiekslocatie";
        }
        if(drawType === this.MEASURE_LINE_TYPE) {
            this.getVectorLayer().defaultFeatureStyle = this.measureLineStyle;
            drawingName = "afstandslijn";
        }
        if(drawType === this.EXTRA_OJBECT_TYPE) {
            drawingName = "hulplijn";
        }
        if(drawType === this.EXTRA_OJBECT_TYPE || drawType === this.MEASURE_LINE_TYPE) {
            this.getVectorLayer().drawFeature("LineString");
        } else {
            this.getVectorLayer().drawFeature("Polygon");
        }
        var grid = this.getGridForType(drawType);
        if(grid) {
            grid.mask("Teken een " + drawingName + " op de kaart");
        }
        var form = this.getContentContainer().query(this.toId(formQuery))[0];
        form.setVisible(false);
    },

    _addLocation: function(grid, id, label, default_label, overrideType) {
        var store = grid.getStore();
        var next_number = store.count() + 1;
        label = label || default_label + (next_number);
        var data = { 'fid': id, 'label': label };
        if(overrideType) {
            data.type = overrideType;
        }
        if(this.isImporting) {
            data = this.activeFeature.attributes;
            // delete data.id;
            data.fid = id;
        }
        var added_feature = store.add(data);
        var locationType = added_feature[0].get('type');
        this.activeFeature.attributes.locationType = locationType;
        if(locationType !== this.MEASURE_LINE_TYPE && locationType !== this.EXTRA_OJBECT_TYPE) {
            this.getVectorLayer().setLabel(id, label);
        }
        var rowIndex = next_number - 1;
        if(this.isImporting) {
            return rowIndex;
        }
        window.setTimeout((function() {
            this._editLocation(grid, rowIndex);
        }).bind(this), 0);
        return rowIndex;
    },

    _editLocation: function(grid, rowIndex, skipSetSelection) {
        if(this.isImporting) {
            return;
        }
        if(rowIndex < 0) {
            return;
        }
        var location = this._showEditForm(grid, rowIndex);
        if(!skipSetSelection) {
            grid.setSelection(location);
        }
        this.getVectorLayer().editFeatureById(location.get('fid'));
    },

    _showEditForm: function(grid, rowIndex) {
        var location = grid.getStore().getAt(rowIndex);
        var location_type = location.get('type');
        var formQuery = this.getFormForType(location_type);
        if(!formQuery) {
            if(location_type === this.MEASURE_LINE_TYPE) {
                this.getContentContainer().query(this.toId(this.EXTRA_OBJECT_FORM))[0].setVisible(false);
            }
            return location;
        }
        var form = this.getContentContainer().query(this.toId(formQuery))[0];
        form.setVisible(true);
        form.getForm().setValues(location.getData());
        if(location_type === this.IGNITION_LOCATION_TYPE) {
            this.editingIgnitionLocation = rowIndex;
        }
        if(location_type === this.AUDIENCE_LOCATION_TYPE) {
            this.editingAudienceLocation = rowIndex;
        }
        if(location_type === this.EXTRA_OJBECT_TYPE) {
            this.editingExtraObject = rowIndex;
            this.getContentContainer().query('#lineColor')[0].setValue(location.get('color'));
        }
        return location;
    },

    _saveLocation: function(grid, rowIndex, formQuery) {
        var location = grid.getStore().getAt(rowIndex);
        var data = this.getContentContainer().query(this.toId(formQuery))[0].getForm().getFieldValues();
        location.set(data);
        var locationType = location.get('type');
        if(locationType !== this.MEASURE_LINE_TYPE && locationType !== this.EXTRA_OJBECT_TYPE) {
            this.getVectorLayer().setLabel(location.get('fid'), location.get('label'));
        }
        return location;
    },

    _removeLocation: function(grid, rowIndex) {
        var record = grid.getStore().getAt(rowIndex);
        this.getVectorLayer().removeFeature(this.getVectorLayer().getFeatureById(record.get('fid')));
        if(record.get('type') === this.EXTRA_OJBECT_TYPE || record.get('type') === this.MEASURE_LINE_TYPE) {
            this.removeExtraObjects(record);
        }
        grid.getStore().removeAt(rowIndex);
    },

    editActiveFeature: function(size) {
        var grid = this.getGridForType(this.activeFeature.attributes.locationType);
        var formQuery = this.getFormForType(this.activeFeature.attributes.locationType);
        if(!grid) {
            return;
        }
        var rowIndex = grid.getStore().find('fid', this.activeFeature.config.id);
        if(rowIndex === -1) {
            return;
        }
        var location = grid.getStore().getAt(rowIndex);
        if(!location) {
            return;
        }
        if(size !== null) {
            location.set('size', size);
        }
        if(location.get('type') === this.EXTRA_OJBECT_TYPE || location.get('type') === this.MEASURE_LINE_TYPE) {
            this.updateExtraObjectLabel(location);
        }
        grid.setSelection(location);
        this._showEditForm(grid, rowIndex, formQuery);
    },

    getGridForType: function(type) {
        if(type === this.IGNITION_LOCATION_TYPE) {
            return this.ignitionLocationsGrid;
        }
        if(type === this.AUDIENCE_LOCATION_TYPE) {
            return this.audienceLocationsGrid;
        }
        if(type === this.EXTRA_OJBECT_TYPE) {
            return this.extraObjectsGrid;
        }
        if(type === this.MEASURE_LINE_TYPE) {
            return this.extraObjectsGrid;
        }
        return null;
    },

    getFormForType: function(type) {
        if(type === this.IGNITION_LOCATION_TYPE) {
            return this.IGNITION_LOCATION_FORM;
        }
        if(type === this.AUDIENCE_LOCATION_TYPE) {
            return this.AUDIENCE_LOCATION_FORM;
        }
        if(type === this.EXTRA_OJBECT_TYPE) {
            return this.EXTRA_OBJECT_FORM;
        }
        return null;
    },

    newRequest: function() {
        this.removeAllFeatures();
        this.nextPage();
    },

    loadRequest: function() {
        this.getContentContainer().query('#formopen')[0].setVisible(true);
    },

    loadFile: function() {
        if(!(window.File && window.FileReader && window.FileList && window.Blob)) {
            return;
        }
        var form = this.getContentContainer().query('#formopen')[0].getForm();
        if(form.isValid()) {
            this.readFile(this.getContentContainer().query('#featureFile')[0].fileInputEl.dom);
        }
    },

    readFile: function(input) {
        var files = input.files; // FileList object
        // Loop through the FileList and render image files as thumbnails.
        for (var i = 0, file; file = files[i]; i++) {
            if(file.size > 1000000) { // approx 1MB
                this.showMessageInContainer("#fileLoadMessages", "Bestand is te groot om in te laden");
                continue;
            }
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = this.fileLoaded.bind(this);
            // Read in the image file as a data URL.
            reader.readAsText(file);
        }
    },

    fileLoaded: function(e) {
        this.showMessageInContainer("#fileLoadMessages", "");
        try {
            var json = Ext.JSON.decode(e.target.result);
            if(json.hasOwnProperty('type') && json.hasOwnProperty('features') && json.type === this.COMPONENT_NAME) {
                this.importFeatures(json);
            } else {
                this.showMessageInContainer("#fileLoadMessages", "Dit bestand wordt niet herkend, controleer of u het juiste bestand heeft geselecteerd");
            }
        } catch(e) {
            this.showMessageInContainer("#fileLoadMessages", "Dit bestand wordt niet herkend, controleer of u het juiste bestand heeft geselecteerd");
        }
    },

    importFeatures: function(json) {
        var feature;
        var features = [];
        var extent = null;;
        for(var i = 0; i < json.features.length; i++) {
            feature = json.features[i];
            var flaFeature = this.createFeature(feature.wktgeom, this.createFeatureStyle(feature.style), feature.attributes);
            if(!extent){
                extent = flaFeature.getExtent();
            }else{
                var newExtent = flaFeature.getExtent();
                extent.expand(newExtent);
            }
            features.push(flaFeature);
        }
        extent.buffer(150);
        this.config.viewerController.mapComponent.getMap().zoomToExtent(extent);
        this.removeAllFeatures();
        this.isImporting = true;
        this.getVectorLayer().addFeatures(features);
        this.isImporting = false;
        this.deselectAllFeatures();
        this.nextPage();
    },

    createFeatureStyle: function(style) {
        return Ext.create('viewer.viewercontroller.controller.FeatureStyle', style);
    },

    createFeature: function(wkt, style, attributes) {
        if(attributes.id) {
            delete attributes.id;
        }
        var label = '';
        if(attributes && attributes.label && (attributes.type !== this.EXTRA_OJBECT_TYPE && attributes.type !== this.MEASURE_LINE_TYPE)) {
            label = attributes.label
        }
        return Ext.create('viewer.viewercontroller.controller.Feature', {
            wktgeom: wkt,
            style: style,
            label: label,
            attributes: attributes || {}
        });
    },

    showMessageInContainer: function(query, message) {
        this.clearMessagesInContainer(query);
        this.addMessageInContainer(query, message);
    },

    clearMessagesInContainer: function(query) {
        var container = this.getContentContainer().query(query);
        if(container.length > 0) {
            container[0].removeAll();
        }
    },

    addMessageInContainer: function(query, message) {
        var container = this.getContentContainer().query(query);
        if(container.length > 0) {
            container[0].add({
                xtype: 'container',
                style: {
                    color: 'red'
                },
                margin: this.defaultMargin,
                html: message
            });
        }
    },

    saveFile: function() {
        var data = {
            version: this.COMPONENT_VERSION,
            type: this.COMPONENT_NAME,
            features: this.getAllFeatures()
        };
        var blob = new Blob([ Ext.JSON.encode(data) ], { type: "application/json;charset=utf-8" });
        var date = Ext.Date.format(new Date(), 'd-m-Y');
        saveAs(blob, "ontbrandingsaanvraag-" + date + ".json");
    },

    getAllFeatures: function() {
        var features = [];
        this.ignitionLocationsGrid.getStore().each(function(item) {
            features.push(this.getFeatureForItem(item));
        }, this);
        this.audienceLocationsGrid.getStore().each(function(item) {
            features.push(this.getFeatureForItem(item));
        }, this);
        this.extraObjectsGrid.getStore().each(function(item) {
            features.push(this.getFeatureForItem(item));
        }, this);
        return features;
    },

    getFeatureForItem: function(item) {
        var featureId = item.get('fid');
        var feature = this.getVectorLayer().getFeatureById(featureId);
        var raw_data = feature.toJsonObject();
        raw_data.attributes = item.getData();
        if(raw_data.attributes.type === this.IGNITION_LOCATION_TYPE) {
            raw_data.attributes.zonedistance_consumer_m = raw_data.attributes.zonedistance_consumer === this.OTHER_LABEL
                ? raw_data.attributes.custom_zonedistance_consumer
                : this.ZONE_DISTANCES_CONSUMER[raw_data.attributes.zonedistance_consumer];
            raw_data.attributes.zonedistance_professional_m = raw_data.attributes.zonedistance_professional === this.OTHER_LABEL
                ? raw_data.attributes.custom_zonedistance_professional
                : this.ZONE_DISTANCES_PROFESSIONAL[raw_data.attributes.zonedistance_professional];
        }
        raw_data.style = this.getVectorLayer().frameworkStyleToFeatureStyle(feature.style).getProperties();
        delete raw_data.id;
        delete raw_data.attributes.id;
        delete raw_data.attributes.fid;
        return raw_data;
    },

    removeAllFeatures: function() {
        this.removeAllForGrid(this.ignitionLocationsGrid);
        this.removeAllForGrid(this.audienceLocationsGrid);
        this.removeAllForGrid(this.extraObjectsGrid);
        this.getCalculationResultLayer().removeAllFeatures();
        this.getTempCalculationResultLayer().removeAllFeatures();
    },

    removeAllForGrid: function(grid) {
        var count = grid.getStore().getCount();
        for(var i = count - 1; i >= 0; i--) {
            this._removeLocation(grid, i);
        }
    },
    printRequest: function() {
        var features = this.getAllFeatures();
        this.buttonDown();
    },

    deselectAllFeatures: function() {
        this.getVectorLayer().unselectAll();
        this.getExtraObjectsLayer().unselectAll();
    },

    /**
     * @param vectorLayer The vectorlayer from which the feature comes
     * @param feature the feature which has been activated
     * Event handlers
     **/
    activeFeatureChanged : function (vectorLayer, feature){
        if(this.isImporting || this.isDrawing) {
            return;
        }
        if(typeof this.features[feature.config.id] === "undefined") {
            this.features[feature.config.id] = feature;
        }
        this.activeFeature = this.features[feature.config.id];
        this.editActiveFeature(this.getVectorLayer().getFeatureSize(feature.config.id));
    },

    activeFeatureFinished : function (vectorLayer, feature) {
        this.activeFeature = feature;
        if(this.isDrawing || this.isImporting) {
            var locationType = !!this.isDrawing ? this.isDrawing : feature.attributes.type;
            this.activeFeature.attributes.locationType = locationType;
            if(locationType === this.IGNITION_LOCATION_TYPE) {
                this.addIgnitionLocation(this.activeFeature.getId());
            }
            if(locationType === this.AUDIENCE_LOCATION_TYPE) {
                this.addAudienceLocation(this.activeFeature.getId());
            }
            if(locationType === this.EXTRA_OJBECT_TYPE || locationType === this.MEASURE_LINE_TYPE) {
                this.addExtraObject(this.activeFeature, locationType);
            }
            var grid = this.getGridForType(locationType);
            if(grid) {
                grid.unmask();
            }
            this.isDrawing = false;
        }
    },

    calculateSafetyZone: function() {
        var complete = true;
        this.clearMessagesInContainer('#calculation_messages');
        if(!this.checkIgnitionLocations()) {
            complete = false;
        }
        if(!this.checkAudienceLocations()) {
            complete = false;
        }
        if(complete) {
            this.removeSafetyZones();
            var features = this.getAllFeatures();
            Ext.Ajax.request({
                url: actionBeans["ontbrandings"],
                scope: this,
                params: {
                    features: Ext.JSON.encode(features),
                    showIntermediateResults:true
                },
                success: function (result) {
                    var response = Ext.JSON.decode(result.responseText);
                    var featuresJSON = response.safetyZones;
                    var features = [];
                    var tempfeatures = [];
                    for (var i = 0; i < featuresJSON.length; i++) {
                        var f = featuresJSON[i];
                        var type = f.attributes.type;
                        var feat = this.createFeature(f.wktgeom, this.safetyZoneStyle, f.attributes);
                        if(type === 'temp'){
                            tempfeatures.push(feat);
                        }else{
                            features.push(feat);
                        }
                    }

                    this.calculationResultLayer.defaultFeatureStyle = this.safetyZoneStyle;
                    this.tempCalculationResultLayer.defaultFeatureStyle = this.tempSafetyZoneStyle;
                    
                    this.calculationResultLayer.addFeatures(features);
                    this.tempCalculationResultLayer.addFeatures(tempfeatures);
                },
                failure: function (result) {
                    this.addMessageInContainer('#calculation_messages',
                        'Er is iets mis gegaan met het berekenen van de veiligheidszone. Sla uw aanvraag op en probeer het opnieuw.');
                }
            });
        }
    },

    drawSafetyZone: function(result) {
        this.getCalculationResultLayer().readGeoJSON(result);
    },
    
    removeSafetyZones: function(){
        this.getCalculationResultLayer().removeAllFeatures();
        this.getTempCalculationResultLayer().removeAllFeatures();
    },

    checkAudienceLocations: function() {
        var store = this.audienceLocationsGrid.getStore();
        if(store.count() === 0) {
            this.addMessageInContainer('#calculation_messages', 'U dient minimaal één publiekslocatie toe te voegen');
            return false;
        }
        if(store.find('mainLocation', true).length === 0) {
            this.addMessageInContainer('#calculation_messages', 'U dient één publiekslocatie toe te voegen en als hoofdlocatie aan te merken');
            return false;
        }
        return true;
    },

    checkIgnitionLocations: function() {
        var store = this.ignitionLocationsGrid.getStore();
        if(store.count() === 0) {
            this.addMessageInContainer('#calculation_messages', 'U dient minimaal één afsteeklocatie toe te voegen');
            return false;
        }
        var complete = true;
        store.each(function(location) {
            if(!this.checkZoneDistance(location)) {
                complete = false;
            }
        }, this);
        return complete;
    },

    checkZoneDistance: function(location) {
        var fireworks_type = location.get('fireworks_type');
        if(fireworks_type !== 'consumer' && fireworks_type !== 'professional') {
            this.addMessageInContainer('#calculation_messages', 'U heeft geen geldige keuze gemaakt bij "Type vuurwerk" voor afsteeklocatie ' + location.get('label'));
            return false;
        }
        var zone_distances = fireworks_type === 'consumer' ? this.ZONE_DISTANCES_CONSUMER : this.ZONE_DISTANCES_PROFESSIONAL;
        var zone_distance = fireworks_type === 'consumer' ? location.get('zonedistance_consumer') : location.get('zonedistance_professional');
        if(!zone_distances.hasOwnProperty(zone_distance) && zone_distance !== this.OTHER_LABEL) {
            this.addMessageInContainer('#calculation_messages', 'U heeft een ongeldige waarde geselecteerd bij "Zoneafstanden" voor afsteeklocatie ' + location.get('label'));
            return false;
        }
        var zone_distance_custom = fireworks_type === 'consumer' ? location.get('custom_zonedistance_consumer') : location.get('custom_zonedistance_professional');
        if(zone_distance === this.OTHER_LABEL && !zone_distance_custom) {
            this.addMessageInContainer('#calculation_messages', 'U dient een waarde in te vullen bij "Handmatige zoneafstand" voor afsteeklocatie ' + location.get('label'));
            return false;
        }
        return true;
    },

    createWizardPage: function(title, items) {
        items = Ext.Array.map(items, function(item) {
            if(typeof item === "string") {
                return { xtype: 'container', html: item };
            }
            return item;
        });
        return Ext.create('Ext.panel.Panel', {
            title: title,
            items: items,
            hidden: true,
            hideMode: 'offsets',
            scrollable: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });
    },

    toId: function(str) {
        return '#' + str;
    },

    getExtComponents: function() {
        return [
            this.mainContainer.getId()
        ];
    }

});
