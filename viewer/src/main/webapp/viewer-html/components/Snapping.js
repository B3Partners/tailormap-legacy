/*
 * Copyright (C) 2015 B3Partners B.V.
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
/* global i18next, Ext, actionBeans, FlamingoAppLoader */

/**
 * Snapping component for Flamingo.
 * @author <a href="mailto:markprins@b3partners.nl">Mark Prins</a>
 */
Ext.define("viewer.components.Snapping", {
    extend: "viewer.components.Component",
    /** the "snap" controller. */
    snapCtl: null,
    /** any configured snappable layers. */
    layerList: [],
    /**
     * a set of checkboxes.
     * @private
     */
    layerSelector: null,
    /**
     * id's of layers loaded for snapping.
     */
    loadedLayerIds: [],
    /**
     * A list of layer ids that were switched on by us,
     * to prevent switching them off in the TOC if they were already visible.
     * @private
     */
    switchedLayerIds: [],
    config: {
        title: "",
        iconUrl: "",
        tooltip: "",
        layers: null,
        defaultOnLayers: null,
        label: "",
        snapColour: "FF00FF",
        snapFillColour: "FF00FF",
        snapColourOpacity: 50,
        snapFillColourOpacity: 50,
        details: {
            minWidth: 400,
            minHeight: 250
        }
    },
    constructor: function (conf) {
        this.initConfig(conf);
        viewer.components.Snapping.superclass.constructor.call(this, this.config);
        var me = this;
        this.config.viewerController.traverseSelectedContent(function(){}, function(layer) {
            if (layer.bufferable) {
                if (me.config.layers.length > 0 ) {
                    if (me.config.layers.includes(layer.id)) {
                        me.layerList.push(layer);
                    }
                } else {
                    me.layerList.push(layer);
                }
            }
        });
        this.initWindow();
        this.renderButton({
            handler: function () {
                me.showWindow();
            },
            text: me.config.title,
            icon: me.config.iconUrl,
            tooltip: me.config.tooltip,
            label: me.config.label
        });

        this.createController();
        return this;
    },
    /**
     * initialize the pop-over-window.
     * @returns {undefined}
     */
    initWindow: function () {
        var me = this;
        // create a group of checkboxes
        var ckkboxItems = [];
        var lyr;
        var allChecker = {
            xtype: 'checkbox',
            boxLabel: i18next.t('viewer_components_snapping_3'),
            name: 'snaplayer',
            inputValue: 'all',
            checked: false,
            margin: '0 0 0 10',
            listeners: {
                change: function (field, data) {
                    this.enableAllLayers(data);
                },
                scope:this
            }
        };
        for (var i = 0; i < this.layerList.length; i++) {
            lyr = this.layerList[i];
            ckkboxItems.push({
                xtype: 'checkbox',
                boxLabel: lyr.alias || lyr.layerName,
                name: 'snaplayer',
                inputValue: lyr.id,
                checked: false
            });
        }
        this.layerSelector = {
            xtype: 'checkboxgroup',
            itemId: 'snapLayers',
            columns: 1,
            margin: '0 0 0 10',
            listeners: {
                change: function (checkboxgroup, data) {
                    me.selectionChanged(checkboxgroup, data.snaplayer);
                }
            },
            items: ckkboxItems
        };

        this.maincontainer = Ext.create('Ext.container.Container', {
            id: this.name + 'Container',
            width: '100%',
            height: '100%',
            autoScroll: true,
            layout: {
                align: 'stretch',
                type: 'vbox'
            },
            style: {
                backgroundColor: 'White'
            },
            renderTo: this.getContentDiv(),
            items: [{
                    forId: 'snapLayers',
                    xtype: 'label',
                    text: i18next.t('viewer_components_snapping_2'),
                    margin: '10 0 5 10'
                },
                allChecker,
                this.layerSelector]
        });
    },
    /**
     * handle checkbox events of this control.
     * @param {type} checkboxgroup
     * @param {type} changedId
     */
    selectionChanged: function (checkboxgroup, changedId) {
        var me = this;
        if (me.snapCtl === null) {
            me.createController();
        }
        
        if (!checkboxgroup.getValue().snaplayer) {
            // nothing checked...
            for (var i = 0; i < this.switchedLayerIds.length; i++) {
                me.config.viewerController.setLayerVisible(
                        me.config.viewerController.getAppLayerById(me.switchedLayerIds[i])
                        , false);
            }
            me.snapCtl.removeAll();
            me.snapCtl.deactivate();
            me.loadedLayerIds = [];
            me.switchedLayerIds = [];
        }

        checkboxgroup.items.each(function (item) {
            // Retrieve appLayer from config.viewerController.
            // Because the applayers in the comboBox are not the same as in the
            // viewercontroller but copies. So by retrieving the ones from the
            // ViewerController you get the correct appLayer
            var appLayer = me.config.viewerController.getAppLayerById(item.inputValue);
            var idx = me.loadedLayerIds.indexOf(item.inputValue);

            if (item.checked) {
                if (idx < 0) {
                    if (!me.config.viewerController.getLayer(appLayer).getVisible()) {
                        // remember if the (wms) layer was visible already
                        me.switchedLayerIds.push(item.inputValue);
                        me.config.viewerController.setLayerVisible(appLayer, true);
                    }
                    me.loadedLayerIds.push(item.inputValue);
                    me.snapCtl.addAppLayer(appLayer);
                }
            } else {
                if (idx > -1) {
                    if (Ext.Array.contains(me.switchedLayerIds, item.inputValue)) {
                        // don't turn the (wms) layer off unless we turned it on
                        me.config.viewerController.setLayerVisible(appLayer, false);
                        Ext.Array.remove(me.switchedLayerIds, item.inputValue);
                    }
                    Ext.Array.remove(me.loadedLayerIds, item.inputValue);
                    me.snapCtl.removeLayer(appLayer);
                }
            }
        });
    },
    createController: function () {
        this.config.type = viewer.viewercontroller.controller.Component.SNAPPING;
        this.config.style = {
            strokeColor: '#' + this.config.snapColour,
            strokeOpacity: this.config.snapColourOpacity / 100,
            strokeWidth: 1,
            pointRadius: 1,
            fillColor: '#' + this.config.snapFillColour,
            fillOpacity: this.config.snapFillColourOpacity / 100
        };
        this.snapCtl = this.config.viewerController.mapComponent.createComponent(this.config);
        this.viewerController.addListener(viewer.viewercontroller.controller.Event.ON_START_DRAWING, this.forceSnappee, this);
    },
    showWindow: function () {
        if (this.snapCtl === null) {
            this.createController();
        }
        this.maincontainer.updateLayout();
        this.popup.popupWin.setTitle(this.config.title);
        this.enableAllDefaultLayers();
        this.popup.show();
    },
    forceSnappee: function (layer) {
        var isSnapping = Ext.Array.contains(this.config.viewerController.registeredSnappingLayers, layer);
        if (isSnapping) {
            var options = {
                layer: layer
            };
            this.snapCtl.layerAdded(null, options);
        }
    },
    enableAllDefaultLayers: function () {
        this.setLayersEnabled(this.config.defaultOnLayers,true);
    },
    enableAllLayers: function(toggle){
        var layers = [];
        this.layerList.forEach(function(l) {
           layers.push(l.id);
        });
        this.setLayersEnabled(layers,toggle);
    },
    setLayersEnabled: function (layers,enabled) {
        var checkboxgroup = this.maincontainer.getComponent("snapLayers");
        checkboxgroup.items.each(function (item) {
            for (var i = 0; i < layers.length; i++) {
                if (layers[i] === item.inputValue) {
                    item.setValue(enabled);
                }
            }
        });

    }
});
