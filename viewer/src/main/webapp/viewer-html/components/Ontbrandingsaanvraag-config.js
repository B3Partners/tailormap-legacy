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
/**
 * Custom configuration object for Ontbrandingsaanvraag config
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define("viewer.components.CustomConfiguration",{
    extend: "viewer.components.SelectionWindowConfig",
    form: null,
    DEFAULT_ZONE_DISTANCES_CONSUMER: {},
    DEFAULT_ZONE_DISTANCES_PROFESSIONAL: {},
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        this.DEFAULT_ZONE_DISTANCES_CONSUMER[i18next.t('viewer_components_customconfiguration_293')] = { distance: 15, fan: false };
        this.DEFAULT_ZONE_DISTANCES_CONSUMER[i18next.t('viewer_components_customconfiguration_294')] = { distance: 40, fan: false };
        this.DEFAULT_ZONE_DISTANCES_CONSUMER[i18next.t('viewer_components_customconfiguration_295')] = { distance: 60, fan: false };
        this.DEFAULT_ZONE_DISTANCES_CONSUMER[i18next.t('viewer_components_customconfiguration_296')] = { distance: 40, fan: true };
        this.DEFAULT_ZONE_DISTANCES_CONSUMER[i18next.t('viewer_components_customconfiguration_297')] = { distance: 60, fan: true };
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_298')] = {distance: 125, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_299')] = {distance: 200, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_300')] = {distance: 15, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_301')] = {distance: 30, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_302')] = {distance: 75, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_303')] = {distance: 60, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_304')] = {distance: 100, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_305')] = {distance: 75, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_306')] = {distance: 120, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_307')] = {distance: 165, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_308')] = {distance: 200, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_309')] = {distance: 230, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_310')] = {distance: 265, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_311')] = {distance: 325, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_312')] = {distance: 390, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_313')] = {distance: 455, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_314')] = {distance: 645, fan: false};
        this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL[i18next.t('viewer_components_customconfiguration_315')] = {distance: 845, fan: false};

        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.addForm(configObject, "zonedistances_consumer", i18next.t('viewer_components_customconfiguration_316'), i18next.t('viewer_components_customconfiguration_317'), this.DEFAULT_ZONE_DISTANCES_CONSUMER);
        this.addForm(configObject, "zonedistances_professional", i18next.t('viewer_components_customconfiguration_318'), i18next.t('viewer_components_customconfiguration_319'), this.DEFAULT_ZONE_DISTANCES_PROFESSIONAL);
    },
    addForm: function(configObject, paramkey, label, label_singular, defaults) {
        var distances = [];
        var configWaardes = configObject[paramkey];
        if(typeof configWaardes === "undefined") {
            configWaardes = [];
            for(var key in defaults) if(defaults.hasOwnProperty(key)) {
                configWaardes.push({ label: key, distance: defaults[key].distance, fan: defaults[key].fan });
            }
        }
        var containerKey = paramkey + "distancesContainer";
        for (var i = 0 ; i < configWaardes.length ;i++){
            var waarde = configWaardes[i];
            var item = this.createRow(waarde.label, waarde.distance, waarde.fan);
            distances.push(item);
        }
        this.form.add({
            xtype: "panel",
            height: 250,
            width: '100%',
            title: label,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            scrollable: true,
            tbar: this.maxSearchConfigs === 1 ? null : [
                "->",
                {
                    xtype:'button',
                    iconCls: 'x-fa fa-plus-circle',
                    text: i18next.t('viewer_components_customconfiguration_320', {label: label_singular}),
                    listeners: {
                        click: function(){
                            var distancesContainer = Ext.ComponentQuery.query("#" + containerKey)[0];
                            distancesContainer.add(this.createRow('', '', paramkey === 'zonedistances_consumer'));
                        },
                        scope:this
                    }
                }
            ],
            name: containerKey,
            itemId: containerKey,
            items: distances
        });
    },
    createRow: function(labelValue, distance, fan_value) {
        return {
            xtype: "container",
            layout: {
                type: "hbox",
                align: "stretch"
            },
            defaults: {
                margin: '0 5 2 0'
            },
            items: [{
                name: "label",
                fieldLabel: i18next.t('viewer_components_customconfiguration_130'),
                value: labelValue,
                xtype: 'textfield',
                labelWidth: 50,
                flex: 1
            }, {
                name: "distance",
                fieldLabel: i18next.t('viewer_components_customconfiguration_131'),
                value: distance,
                xtype: 'textfield',
                labelWidth: 50,
                width: 150
            }, {
                xtype: "checkbox",
                fieldLabel: i18next.t('viewer_components_customconfiguration_132'),
                labelWidth: 50,
                name: "fan",
                value: fan_value
            }, {
                xtype: "button",
                text: i18next.t('viewer_components_customconfiguration_133'),
                listeners:{
                    click: function(btn) {
                        var container = btn.up('.panel');
                        container.remove(btn.up('.container'));
                    }
                }
            }]
        };
    },
    getConfiguration: function() {
        var config = this.callParent(arguments);
        config.zonedistances_consumer = this.getConfigFor("zonedistances_consumer");
        config.zonedistances_professional = this.getConfigFor("zonedistances_professional");
        return config;
    },
    getConfigFor: function(paramkey) {
        var containerKey = paramkey + "distancesContainer";
        var values =  Ext.ComponentQuery.query("#" + containerKey)[0];
        var items = values.items.items;
        var distances = [];
        for (var i = 0 ; i< items.length ; i++){
            var item = items[i];
            var vals = item.items.items;
            var entry = {
                label : vals[0].getValue(),
                distance : +(vals[1].getValue()),
                fan : vals[2].getValue()
            };
            if(entry.label && entry.distance){
                distances.push(entry);
            }
        }
        return distances;
    },
    getDefaultValues: function() {
        return {};
    }
});

