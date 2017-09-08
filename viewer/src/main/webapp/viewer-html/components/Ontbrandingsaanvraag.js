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
/* global Ext, contextPath, MobileManager, actionBeans */

/**
 * Ontbrandingsaanvraag component
 * Creates a Ontbrandingsaanvraag component
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.Ontbrandingsaanvraag",{
    extend: "viewer.components.Component",
    vectorLayer: null,
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

    constructor: function (conf){
        this.initConfig(conf);
	    viewer.components.Ontbrandingsaanvraag.superclass.constructor.call(this, this.config);
        this.features = {};
        this.config.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_SELECTEDCONTENT_CHANGE, this.selectedContentChanged, this);
        this.iconPath = FlamingoAppLoader.get('contextPath') + "/viewer-html/components/resources/images/drawing/";
        this.loadWindow();
        this.createVectorLayer();
        return this;
    },

    selectedContentChanged : function (){
        if(this.vectorLayer === null) {
            this.createVectorLayer();
        } else {
            this.config.viewerController.mapComponent.getMap().addLayer(this.vectorLayer);
        }
    },

    createVectorLayer : function (){
        this.vectorLayer = this.config.viewerController.mapComponent.createVectorLayer({
            name: 'ontbrandingsAanvraagVectorLayer',
            geometrytypes: ["Circle","Polygon","Point","LineString"],
            showmeasures: false,
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
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_ACTIVE_FEATURE_CHANGED, this.activeFeatureChanged, this);
        this.vectorLayer.addListener(viewer.viewercontroller.controller.Event.ON_FEATURE_ADDED, this.activeFeatureFinished, this);
    },
    /**
     * Create the GUI
     */
    loadWindow : function() {
        Ext.create('Ext.data.Store', {
            storeId: 'zoneDistanceStore',
            fields: ['distance','label'],
            data: [
                { "distance": 10, "label": "10 meter" },
                { "distance": 20, "label": "20 meter" },
                { "distance": 30, "label": "30 meter" },
                { "distance": 40, "label": "40 meter" },
                { "distance": "other", "label": "Anders, namelijk..." }
            ]
        });
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
                    xtype: 'container',
                    itemId: 'calculation_messages',
                    margin: this.defaultMargin
                }
            ]),
            this.createWizardPage("toevoegen aanvullende objecten", [
                "Op de pagina komt een lijst met aanvullende objecten (hulplijnen) met een min-teken voor verwijderen.\n" +
                "Daaronder komt een plus teken voor het toevoegen van een nieuwe hulplijn. Het toevoegen bestaat uit het tekenen op de kaart. Deze hulplijnen kunnen een kleur hebben, doorgetrokken of gestippeld zijn, pijlpunten bevatten en een label hebben."
            ]),
            this.createWizardPage("Opslaan en printen", [
                "Net zoals de huidige redlining tool van Flamingo kunnen de getekende objecten (maar niet de berekende veiligheidszone) worden bewaard in een bestand dat lokaal op de computer van de aanvrager kan worden opgeslagen. Op deze manier kan een aanvrager gemakkelijk een aanvraag van vorig jaar hergebruiken."
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
                { type: 'button', itemId: 'prev_button', text: 'Vorige', handler: function() { this.previousPage() }.bind(this) },
                { type: 'button', itemId: 'next_button', text: 'Volgende', handler: function() { this.nextPage(); }.bind(this) }
            ]
        });
        this.getContentContainer().add(this.mainContainer);
        this.createIgnitionLocationsGrid();
        this.createAudienceLocationsGrid();
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
    },

    createIgnitionLocationsGrid: function() {
        Ext.create('Ext.data.Store', {
            storeId: 'ignitionLocations',
            fields: [
                { name: 'fid', type: 'string' },
                { name: 'label', type: 'string' },
                { name: 'type', type: 'string', defaultValue: this.IGNITION_LOCATION_TYPE },
                { name: 'zonedistance', type: 'number' },
                { name: 'custom_zonedistance', type: 'number' },
                { name: 'fan', type: 'boolean', defaultValue: false },
                { name: 'zonedistance_fan', type: 'number' },
                { name: 'custom_zonedistance_fan', type: 'number' },
                { name: 'area', type: 'number' }
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
                { name: 'area', type: 'number' }
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

    _createGrid: function(storeId, title, columns) {
        columns.push(
            { dataIndex: 'area', renderer: function(value) {
                var area = value.toFixed(2);
                var unit = 'm2';
                if(area > 100000) {
                    area = area / 1000000;
                    unit = 'km2';
                }
                return value ? area.toFixed(2) + ' ' + unit : ''
            }},
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
                    xtype: 'combobox',
                    fieldLabel: 'Zoneafstanden',
                    queryMode: 'local',
                    store: Ext.StoreManager.lookup('zoneDistanceStore'),
                    displayField: 'label',
                    valueField: 'distance',
                    name: 'zonedistance',
                    itemId: 'zonedistance',
                    listeners: {
                        change: function(combo, val) {
                            this.getContentContainer().query('#custom_zonedistance')[0].setVisible(val === "other");
                        },
                        scope: this
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Handmatige zoneafstand',
                    hidden: true,
                    name: 'custom_zonedistance',
                    itemId: 'custom_zonedistance'
                },
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Fan uitworp (elipsevormig gebied)',
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1
                    },
                    layout: 'hbox',
                    items: [
                        {
                            boxLabel: 'Ja',
                            name: 'fan',
                            inputValue: 'ja',
                            listeners: {
                                change: function(radio, val) {
                                    this.getContentContainer().query('#zonedistance_fan')[0].setVisible(val);
                                },
                                scope: this
                            }
                        }, {
                            boxLabel: 'Nee',
                            name: 'fan',
                            inputValue: 'nee',
                            listeners: {
                                change: function(radio, val) {
                                    if(val) {
                                        this.getContentContainer().query('#zonedistance_fan')[0].setVisible(false);
                                        this.getContentContainer().query('#custom_zonedistance_fan')[0].setVisible(false);
                                    }
                                },
                                scope: this
                            }
                        }
                    ]
                },
                {
                    xtype: 'combobox',
                    fieldLabel: 'Zoneafstanden fan',
                    queryMode: 'local',
                    store: Ext.StoreManager.lookup('zoneDistanceStore'),
                    displayField: 'label',
                    hidden: true,
                    valueField: 'distance',
                    name: 'zonedistance_fan',
                    itemId: 'zonedistance_fan',
                    listeners: {
                        change: function(combo, val) {
                            this.getContentContainer().query('#custom_zonedistance_fan')[0].setVisible(val === "other");
                        },
                        scope: this
                    }
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Handmatige zoneafstand fan',
                    hidden: true,
                    name: 'custom_zonedistance_fan',
                    itemId: 'custom_zonedistance_fan'
                },
                {
                    xtype: 'button',
                    text: 'Opslaan',
                    listeners: { click: this.saveIgnitionLocation, scope: this }
                }
            ]
        };
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

    createIgnitionLocation: function() {
        this._createLocation(this.IGNITION_LOCATION_TYPE, this.IGNITION_LOCATION_FORM);
        this.editingIgnitionLocation = null;
    },

    addIgnitionLocation: function(id, label) {
        this._addLocation(this.ignitionLocationsGrid, id, label, "Afsteeklocatie ");
    },

    saveIgnitionLocation: function() {
        this._saveLocation(this.ignitionLocationsGrid, this.editingIgnitionLocation, this.IGNITION_LOCATION_FORM);
    },

    createAudienceLocation: function() {
        this._createLocation(this.AUDIENCE_LOCATION_TYPE, this.AUDIENCE_LOCATION_FORM);
        this.editingAudienceLocation = null;
    },

    addAudienceLocation: function(id, label) {
        var added_index = this._addLocation(this.audienceLocationsGrid, id, label, "Publiekslocatie ");
        if(added_index === 0) {
            var location = this.audienceLocationsGrid.getStore().getAt(added_index);
            location.set('mainLocation', true);
            var feature = this.getOpenlayersFeature(id);
            feature.style.strokeColor = '#33FF33';
            this.refreshOpenLayers();
        }
    },

    saveAudienceLocation: function() {
        var location = this._saveLocation(this.audienceLocationsGrid, this.editingAudienceLocation, this.AUDIENCE_LOCATION_FORM);
        if(location.get('mainLocation') === true) {
            var feature = this.getOpenlayersFeature(location.get('fid'));
            feature.style.strokeColor = '#33FF33';
            this.audienceLocationsGrid.getStore().each(function(loc) {
                if(loc !== location) {
                    loc.set('mainLocation', false);
                    var feature = this.getOpenlayersFeature(loc.get('fid'));
                    feature.style.strokeColor = '#0000FF';
                }
            }, this);
            this.refreshOpenLayers();
        }
    },

    _createLocation: function(drawType, formQuery) {
        this.isDrawing = drawType;
        var drawingColor = ['000000', '00FF00'];
        if(drawType === this.AUDIENCE_LOCATION_TYPE) {
            drawingColor = ['FF0000', '0000FF'];
        }
        this.vectorLayer.style.fillcolor = drawingColor[0];
        this.vectorLayer.style.strokecolor = drawingColor[1];
        this.vectorLayer.drawFeature("Polygon");
        var form = this.getContentContainer().query(this.toId(formQuery))[0];
        form.setVisible(false);
    },

    _addLocation: function(grid, id, label, default_label) {
        var store = grid.getStore();
        var next_number = store.count() + 1;
        label = label || default_label + (next_number);
        var added_feature = store.add({ 'fid': id, 'label': label });
        this.vectorLayer.setLabel(id, label);
        this.activeFeature.locationType = added_feature[0].get('type');
        var rowIndex = next_number - 1;
        window.setTimeout((function() {
            this._editLocation(grid, rowIndex)
        }).bind(this), 0);
        return rowIndex;
    },

    _editLocation: function(grid, rowIndex, skipSetSelection) {
        var location = this._showEditForm(grid, rowIndex);
        if(!skipSetSelection) {
            grid.setSelection(location);
        }
        this.vectorLayer.editFeature(this.getOpenlayersFeature(location.get('fid')));
    },

    _showEditForm: function(grid, rowIndex) {
        var location = grid.getStore().getAt(rowIndex);
        var formQuery = this.getFormForType(location.get('type'));
        var form = this.getContentContainer().query(this.toId(formQuery))[0];
        form.setVisible(true);
        form.getForm().setValues(location.getData());
        if(location.get('type') === this.IGNITION_LOCATION_TYPE) {
            this.editingIgnitionLocation = rowIndex;
        }
        if(location.get('type') === this.AUDIENCE_LOCATION_TYPE) {
            this.editingAudienceLocation = rowIndex;
        }
        return location;
    },

    _saveLocation: function(grid, rowIndex, formQuery) {
        var location = grid.getStore().getAt(rowIndex);
        var data = this.getContentContainer().query(this.toId(formQuery))[0].getForm().getFieldValues();
        location.set(data);
        this.vectorLayer.setLabel(location.get('fid'), location.get('label'));
        return location;
    },

    _removeLocation: function(grid, rowIndex) {
        var record = grid.getStore().getAt(rowIndex);
        this.vectorLayer.removeFeature(this.vectorLayer.getFeatureById(record.get('fid')));
        grid.getStore().removeAt(rowIndex);
    },

    editActiveFeature: function(area) {
        var grid = this.getGridForType(this.activeFeature.locationType);
        var formQuery = this.getFormForType(this.activeFeature.locationType);
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
        location.set('area', area);
        grid.setSelection(location);
        this._showEditForm(grid, rowIndex, formQuery);
    },

    getGridForType: function(type) {
        if(type === this.IGNITION_LOCATION_TYPE) {
            return this.ignitionLocationsGrid;
            formQuery = this.IGNITION_LOCATION_FORM;
        }
        if(type === this.AUDIENCE_LOCATION_TYPE) {
            return this.audienceLocationsGrid;
            formQuery = this.AUDIENCE_LOCATION_FORM;
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
        return null;
    },

    newRequest: function() {
        this.nextPage();
    },

    loadRequest: function() {
        this.getContentContainer().query('#formopen')[0].setVisible(true);
    },

    loadFile: function() {
        var form = this.getContentContainer().query('#formopen')[0].getForm();
        if(form.isValid()) {
            form.submit({
                scope: this,
                url: actionBeans["drawing"],
                waitMsg: 'Bezig met uploaden...',
                waitTitle: "Even wachten...",
                success: function(fp, o) {
                    var json = Ext.JSON.decode(o.result.content);
                    var features = Ext.JSON.decode(json.features);
                    this.loadFeatures(features);
                    if(features.length > 0) {
                        var extent = o.result.extent;
                        this.config.viewerController.mapComponent.getMap().zoomToExtent(extent);
                    }
                    this.movePage(3, /*enablePrev=*/true)
                },
                failure: function (){
                    Ext.Msg.alert('Mislukt', 'Uw bestand kon niet gelezen worden.');
                }
            });
        }
    },

    loadFeatures: function(features){
        if (features.length > 0 && this.vectorLayer === null) {
            this.createVectorLayer();
        }
        for(var i = 0 ; i < features.length; i++) {
            var feature = features[i];
            var featureObject = Ext.create("viewer.viewercontroller.controller.Feature", feature);
            this.vectorLayer.style.fillcolor = featureObject._color;
            this.vectorLayer.style.strokecolor = featureObject._color;
            this.vectorLayer.adjustStyle();
            this.vectorLayer.addFeature(featureObject);
            this.addIgnitionLocation(this.activeFeature.getId(), featureObject._label);
        }
    },

    /**
     * @param vectorLayer The vectorlayer from which the feature comes
     * @param feature the feature which has been activated
     * Event handlers
     **/
    activeFeatureChanged : function (vectorLayer, feature){
        if(typeof this.features[feature.config.id] === "undefined") {
            this.features[feature.config.id] = feature;
        }
        this.activeFeature = this.features[feature.config.id];
        var ol_feature = this.getOpenlayersFeature(feature.config.id);
        var projection = this.config.viewerController.mapComponent.getMap().config.projection;
        var area = ol_feature.geometry.getGeodesicArea(projection);
        this.editActiveFeature(area);
    },

    activeFeatureFinished : function (vectorLayer, feature) {
        this.activeFeature.config.wktgeom = feature.config.wktgeom;
        if(this.isDrawing) {
            feature.config.locationType = this.isDrawing;
            if(this.isDrawing === this.IGNITION_LOCATION_TYPE) {
                this.addIgnitionLocation(this.activeFeature.getId());
            }
            if(this.isDrawing === this.AUDIENCE_LOCATION_TYPE) {
                this.addAudienceLocation(this.activeFeature.getId());
            }
            this.isDrawing = false;
        }
    },

    calculateSafetyZone: function() {
        var store = this.ignitionLocationsGrid.getStore();
        var main_location = this.audienceLocationsGrid.getStore().find('mainLocation', true);
        var message_container = this.getContentContainer().query('#calculation_messages')[0];
        if(main_location.length === 0) {
            message_container.setHtml('U dient een publiekslocatie toe te voegen en als hoofdlocatie aan te merken');
            return;
        }
        if(store.count() === 0) {
            message_container.setHtml('U dient minimaal één afsteeklocatie toe te voegen');
            return;
        }
        store.each(function(location) {

        }, this);
    },

    getOpenlayersFeature: function(id) {
        return this.vectorLayer.getFrameworkLayer().getFeatureById(id)
    },

    refreshOpenLayers: function() {
        this.vectorLayer.getFrameworkLayer().redraw();
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
