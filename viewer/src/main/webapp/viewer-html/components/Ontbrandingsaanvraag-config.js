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
    DEFAULT_ZONE_DISTANCES: {
        "Vuurpijlen (schietrichting schuin van het publiek af)": 125,
        "Vuurpijlen (schietrichting overig)": 200,
        "Tekstborden": 15,
        "Grondvuurwerk": 30,
        "Romeinse kaarsen met kaliber tot en met 2 inch": 75,
        "Mines tot en met een kaliber van 4 inch": 60,
        "Mines met een kaliber vanaf 4 inch tot en met 6 inch": 100,
        "Dagbommen kleiner dan 21 cm diameter": 75
    },
    DEFAULT_ZONE_DISTANCES_FAN: {
        "Vuurpijlen (schietrichting schuin van het publiek af)": 125,
        "Vuurpijlen (schietrichting overig)": 200,
        "Tekstborden": 15,
        "Grondvuurwerk": 30,
        "Romeinse kaarsen met kaliber tot en met 2 inch": 75,
        "Mines tot en met een kaliber van 4 inch": 60,
        "Mines met een kaliber vanaf 4 inch tot en met 6 inch": 100,
        "Dagbommen kleiner dan 21 cm diameter": 75
    },
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null){
            configObject = {};
        }
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.addForm(configObject, "zonedistances", "Zoneafstanden", "Zoneafstand", this.DEFAULT_ZONE_DISTANCES);
        this.addForm(configObject, "zonedistances_fan", "Zoneafstanden fan", "Zoneafstand fan", this.DEFAULT_ZONE_DISTANCES_FAN);
    },
    addForm: function(configObject, paramkey, label, label_singular, defaults) {
        var distances = [];
        var configWaardes = configObject[paramkey];
        if(typeof configWaardes === "undefined") {
            configWaardes = [];
            for(var key in defaults) if(defaults.hasOwnProperty(key)) {
                configWaardes.push({ label: key, distance: defaults[key] });
            }
        }
        var containerKey = paramkey + "distancesContainer";
        for (var i = 0 ; i < configWaardes.length ;i++){
            var waarde = configWaardes[i];
            var item = this.createRow(waarde.label, waarde.distance);
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
                    text: label_singular + ' toevoegen',
                    listeners: {
                        click: function(){
                            var distancesContainer = Ext.ComponentQuery.query("#" + containerKey)[0];
                            distancesContainer.add(this.createRow('', ''));
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
    createRow: function(labelValue, distance) {
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
                fieldLabel: "Label",
                value: labelValue,
                xtype: 'textfield',
                labelWidth: 50,
                flex: 1
            }, {
                name: "distance",
                fieldLabel: "Afstand",
                value: distance,
                xtype: 'textfield',
                labelWidth: 50,
                width: 150
            }, {
                xtype: "button",
                text: " X ",
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
        config.zonedistances = this.getConfigFor("zonedistances");
        config.zonedistances_fan = this.getConfigFor("zonedistances_fan");
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
                distance : +(vals[1].getValue())
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

