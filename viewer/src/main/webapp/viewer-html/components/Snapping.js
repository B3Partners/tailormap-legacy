/*
 * Copyright (C) 2015 B3Partners B.V.
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
 * Snapping component for Flamingo.
 * @author <a href="mailto:markprins@b3partners.nl">Mark Prins</a>
 */
Ext.define("viewer.components.Snapping", {
    extend: "viewer.components.Component",
    // de "snap" controller
    snapCtl: null,
    inputContainer: null,
    // any configured snappable layers
    layerList: null,
    // set checkboxes
    layerSelector: null,
    // id's of layers loaded for snapping
    loadedLayerIds: [],
    config: {
        title: "",
        iconUrl: "",
        tooltip: "",
        layers: null,
        label: ""
    },
    constructor: function (conf) {
        viewer.components.Snapping.superclass.constructor.call(this, conf);
        this.initConfig(conf);
        var me = this;

        // ajax to get the list of available layers
        var requestPath = actionBeans["layerlist"];
        var requestParams = {};
        requestParams[this.config.restriction] = true;
        requestParams["appId"] = appId;
        var me = this;
        if (this.config.layers !== null && this.config.layers.length > 0) {
            requestParams["layers"] = this.config.layers;
            requestParams["hasConfiguredLayers"] = true;
            requestParams["bufferable"] = true;
        }

        Ext.Ajax.request({
            url: requestPath,
            params: requestParams,
            success: function (result, request) {
                me.layerList = Ext.JSON.decode(result.responseText);
                me.initWindow();
            },
            failure: function (a, b, c) {
                Ext.MessageBox.alert("Foutmelding", "Er is een onbekende fout opgetreden waardoor de lijst met kaartlagen niet kan worden weergegeven");
            }
        });

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
            fieldLabel: 'Kies snapping lagen',
            itemId: 'snapLayers',
            columns: 1,
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
            items: [this.layerSelector]
        });
        this.inputContainer = Ext.getCmp(this.name + 'InputPanel');
    },
    /**
     * handle checkbox events.
     * @param {type} checkboxgroup
     * @param {type} changedId
     */
    selectionChanged: function (checkboxgroup, changedId) {
        var me = this;
        if (this.snapCtl === null) {
            this.createController();
        }

        if (!checkboxgroup.getValue().snaplayer) {
            // nothing checked...
            for (var i = 0; i < this.loadedLayerIds.length; i++) {
                me.config.viewerController.setLayerVisible(
                        me.config.viewerController.getAppLayerById(me.loadedLayerIds[i])
                        , false);
            }
            me.snapCtl.removeAll();
            me.snapCtl.deactivate();
            me.loadedLayerIds = [];
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
                    // add data for layer
                    me.config.viewerController.setLayerVisible(appLayer, true);
                    me.loadedLayerIds.push(item.inputValue);
                    me.snapCtl.addAppLayer(appLayer);
                }
            } else {
                if (idx > -1) {
                    // remove data for layer
                    me.config.viewerController.setLayerVisible(appLayer, false);
                    me.loadedLayerIds.splice(idx, appLayer);
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
            fillOpacity: this.config.snapColourOpacity / 100,
            fillColor: '#' + this.config.snapColour
        };
        this.snapCtl = this.config.viewerController.mapComponent.createComponent(this.config);
    },
    showWindow: function () {
        if (this.snapCtl === null) {
            this.createController();
        }
        this.popup.popupWin.setTitle(this.config.title);
        this.popup.show();
    }
});
