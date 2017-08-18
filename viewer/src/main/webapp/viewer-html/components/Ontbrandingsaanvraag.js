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
    currentPage: null,
    // config
    config:{},

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
    loadWindow : function(){
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
                    ]
                }
            ]),
            this.createWizardPage("intekenen van een of meerdere afsteeklocaties", [
                {
                    xtype: 'button',
                    html: 'Afsteeklocatie toevoegen',
                    margin: this.defaultMargin,
                    listeners: { click: this.createIgnitionLocation, scope: this }
                },
                {
                    xtype: 'container',
                    layout: 'fit',
                    itemId: 'ignitionLocationsContainer'
                }
            ]),
            this.createWizardPage("locaties van publiek", [
                "Op de pagina komt een lijst met objecten (locaties met publiek) met een min-teken voor verwijderen"
            ]),
            this.createWizardPage("berekening van de veiligheidszone", [
                "Deze pagina heeft een knop om te berekenen en een knop om het resultaat te verwijderen"
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
                type: 'accordion'
            },
            defaults: {
                bodyStyle: 'padding: 10px',
                disabled: true
            },
            items: this.wizardPages
        });
        this.getContentContainer().add(this.mainContainer);
        this.createIgnitionLocationsGrid();
        this.enablePage(0);
    },

    createIgnitionLocationsGrid: function() {
        Ext.create('Ext.data.Store', {
            storeId: 'ignitionLocations',
            fields: ['fid','label'],
            data: []
        });
        this.ignitionLocationsGrid = Ext.create('Ext.grid.Panel', {
            title: 'Afsteeklocaties',
            store: Ext.data.StoreManager.lookup('ignitionLocations'),
            columns: [
                { text: 'Label', dataIndex: 'label', flex: 1 },
                { xtype: 'actioncolumn', width: 30, sortable:false, hidable:false, items: [
                    { iconCls: 'x-fa fa-pencil', tooltip: 'Bewerken', handler: this.editIgnitionLocation.bind(this) }
                ]},
                { xtype: 'actioncolumn', width: 30, sortable:false, hidable:false, items: [
                    { iconCls: 'x-fa fa-trash', tooltip: 'Verwijderen', handler: this.removeIgnitionLocation.bind(this) }
                ]}
            ]
        });
        this.getContentContainer().query('#ignitionLocationsContainer')[0].add(this.ignitionLocationsGrid);
        return this.ignitionLocationsGrid;
    },

    createIgnitionLocation: function() {
        this.isDrawing = 'ignitionLocation';
        this.vectorLayer.drawFeature("Polygon");
    },

    addIgnitionLocation: function(id, label) {
        label = label || "Afsteeklocatie " + (this.ignitionLocationsGrid.getStore().count() + 1);
        this.ignitionLocationsGrid.getStore().add({'fid': id, 'label': label});
    },

    editIgnitionLocation: function(grid, rowIndex) {
        var location = grid.getStore().getAt(rowIndex);
        console.log(location);
    },

    removeIgnitionLocation: function(grid, rowIndex) {
        grid.getStore().removeAt(rowIndex);
    },

    enablePage: function(pageIdx, enablePrev) {
        this.currentPage = pageIdx;
        this.wizardPages[pageIdx].setDisabled(false).expand();
        if(enablePrev && pageIdx > 0) {
            for(var i = 0; i < pageIdx; i++) {
                if(this.wizardPages[i].isDisabled()) this.wizardPages[i].setDisabled(false);
            }
        }
    },

    newRequest: function() {
        this.enablePage(1);
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
                    this.enablePage(3, /*enablePrev=*/true)
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
            this.vectorLayer.setLabel(this.activeFeature.getId(), featureObject._label);
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
    },

    activeFeatureFinished : function (vectorLayer,feature) {
        this.activeFeature.config.wktgeom = feature.config.wktgeom;
        if(this.isDrawing && this.isDrawing === 'ignitionLocation') {
            this.addIgnitionLocation(this.activeFeature.getId());
            this.isDrawing = false;
        }
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
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });
    },

    getExtComponents: function() {
        return [
            this.mainContainer.getId()
        ];
    }

});
